---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-TRACE-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-trace.schema.json"
external_standards:
  w3c_trace_context: informative
  opentelemetry: informative

# UI metadata (non-normative; excluded from protocol semantics)
title: Trace Module
sidebar_label: Trace Module
sidebar_position: 4
description: "MPLP module specification: Trace Module. Defines schema requirements and invariants."
---

# Trace Module

## Scope

This specification defines the normative schema requirements and lifecycle obligations for the **Trace module** as represented by `schemas/v2/mplp-trace.schema.json`.

## Non-Goals

This specification does not define implementation details, runtime behavior beyond schema-defined obligations, or vendor/framework-specific integrations.

---

## 1. Purpose

The **Trace Module** provides the observability backbone for MPLP. It captures **execution history** as a tree of spans and segments, enabling audit trails, debugging, performance analysis, and learning sample extraction.

**Design Principle**: "Every executed step leaves an immutable trace"

## 2. Canonical Schema

**From**: `schemas/v2/mplp-trace.schema.json`

### 2.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`meta`** | Object | Protocol metadata |
| **`trace_id`** | UUID v4 | Global unique identifier |
| **`context_id`** | UUID v4 | Link to parent Context |
| **`root_span`** | Object | Root span definition (trace-base) |
| **`status`** | Enum | Trace lifecycle state |

### 2.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `plan_id` | UUID v4 | Associated Plan (if any) |
| `started_at` | ISO 8601 | Trace start timestamp |
| `finished_at` | ISO 8601 | Trace end timestamp |
| `segments` | Array | Key execution segments |
| `events` | Array | Trace lifecycle events |
| `governance` | Object | Lifecycle phase and locking |

### 2.3 The `TraceSegment` Object

**Required**: `segment_id`, `label`, `status`

| Field | Type | Description |
|:---|:---|:---|
| **`segment_id`** | UUID v4 | Segment identifier |
| **`label`** | String | Segment name for identification |
| **`status`** | Enum | Segment execution state |
| `parent_segment_id` | UUID v4 | Parent segment (if nested) |
| `started_at` | ISO 8601 | Segment start time |
| `finished_at` | ISO 8601 | Segment end time |
| `attributes` | Object | Key-value context data |

## 3. Lifecycle State Machine

### 3.1 Trace Status

**From schema**: `["pending", "running", "completed", "failed", "cancelled"]`

<MermaidDiagram id="9df2eaa43052bdf9" />

### 3.2 Segment Status

**From schema**: `["pending", "running", "completed", "failed", "cancelled", "skipped"]`

<MermaidDiagram id="7cbc7eb0aad8c11b" />

### 3.3 Status Semantics

| Status | Mutable | Description |
|:---|:---:|:---|
| **pending** | Yes | Created, not yet started |
| **running** | Yes | Execution in progress |
| **completed** | No | Successfully finished (immutable) |
| **failed** | No | Error occurred (immutable) |
| **cancelled** | No | Aborted by user (immutable) |
| **skipped** | No | Conditional skip (immutable) |

## 4. Span Hierarchy (W3C Compatible)

### 4.1 Parent-Child Relationship

**From**: `common/trace-base.schema.json`

<MermaidDiagram id="d7ebb8b48e29e83b" />

### 4.2 W3C Trace Context Compatibility

**MPLP traces are compatible with W3C Trace Context**:

```typescript
interface W3CCompatibleSpan {
  trace_id: string;        // W3C trace-id (32 hex chars)
  span_id: string;         // W3C span-id (16 hex chars)  
  parent_span_id?: string; // W3C parent-span-id
  trace_flags?: number;    // W3C trace-flags
}

// MPLP segment can be exported to W3C format
function toW3CSpan(segment: TraceSegment, trace_id: string): W3CCompatibleSpan {
  return {
    trace_id: trace_id.replace(/-/g, '').substring(0, 32),
    span_id: segment.segment_id.replace(/-/g, '').substring(0, 16),
    parent_span_id: segment.parent_segment_id?.replace(/-/g, '').substring(0, 16)
  };
}
```

## 5. Normative Requirements

### 5.1 Core Invariants

| ID | Rule | Description |
|:---|:---|:---|
| `trace_immutability` | Completed traces are read-only | Once `status {completed, failed, cancelled}`, no modifications |
| `sa_trace_context_binding` | `trace.context_id == context.context_id` | Trace MUST bind to loaded Context |
| `trace_temporal_order` | `started_at <= finished_at` | Timestamps must be monotonic |
| `segment_parent_valid` | `parent_segment_id` must exist | Parent must reference valid segment |

### 5.2 Immutability Rule

**Critical**: Once a trace or segment reaches terminal status (`completed`, `failed`, `cancelled`, `skipped`), it becomes **immutable**.

```typescript
class ImmutableTraceError extends Error {
  constructor(trace_id: string) {
    super(`Trace ${trace_id} is immutable (terminal status)`);
  }
}

function updateSegment(trace: Trace, segment_id: string, updates: any): void {
  const segment = trace.segments.find(s => s.segment_id === segment_id);
  
  if (!segment) {
    throw new Error(`Segment ${segment_id} not found`);
  }
  
  // Check immutability
  const terminalStatuses = ['completed', 'failed', 'cancelled', 'skipped'];
  if (terminalStatuses.includes(segment.status)) {
    throw new ImmutableTraceError(trace.trace_id);
  }
  
  // Apply updates
  Object.assign(segment, updates);
}
```

## 6. Event Binding

### 6.1 Observability Event Families

**From**: `docs/04-observability/observability-overview.md`

Traces capture events from all 12 MPLP event families:

| Event Family | Trace Binding |
|:---|:---|
| `pipeline_stage` | Each step execution segment |
| `graph_update` | PSG changes during execution |
| `runtime_execution` | AEL action executions |
| `tool_integration` | External tool calls |
| `llm_event` | LLM API calls |
| `error_event` | Failures and exceptions |

### 6.2 Event to Segment Mapping

```typescript
async function recordEvent(
  trace: Trace,
  segment_id: string,
  event: MplpEvent
): Promise<void> {
  // Find segment
  const segment = trace.segments.find(s => s.segment_id === segment_id);
  
  if (!segment) {
    throw new Error(`Segment ${segment_id} not found`);
  }
  
  // Add event reference
  trace.events = trace.events || [];
  trace.events.push({
    ...event,
    segment_ref: segment_id
  });
  
  // Update segment attributes if needed
  if (event.event_type === 'step_failed') {
    segment.status = 'failed';
    segment.attributes = {
      ...segment.attributes,
      error: event.payload.error
    };
  }
}
```

## 7. Module Interactions

### 7.1 Dependency Map

<MermaidDiagram id="7b45b30fac58fcf1" />

## 8. SDK Examples

### 8.1 TypeScript (Creating Trace)

```typescript
import { v4 as uuidv4 } from 'uuid';

type TraceStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type SegmentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'skipped';

interface TraceSegment {
  segment_id: string;
  label: string;
  status: SegmentStatus;
  parent_segment_id?: string;
  started_at?: string;
  finished_at?: string;
  attributes?: Record<string, any>;
}

interface Trace {
  meta: { protocolVersion: string };
  trace_id: string;
  context_id: string;
  plan_id?: string;
  root_span: { trace_id: string };
  status: TraceStatus;
  started_at?: string;
  segments?: TraceSegment[];
}

function createTrace(context_id: string, plan_id?: string): Trace {
  const trace_id = uuidv4();
  return {
    meta: { protocolVersion: '1.0.0' },
    trace_id,
    context_id,
    plan_id,
    root_span: { trace_id },
    status: 'pending',
    started_at: new Date().toISOString(),
    segments: []
  };
}

function addSegment(trace: Trace, label: string, parent?: string): TraceSegment {
  const segment: TraceSegment = {
    segment_id: uuidv4(),
    label,
    status: 'pending',
    parent_segment_id: parent,
    started_at: new Date().toISOString()
  };
  
  trace.segments = trace.segments || [];
  trace.segments.push(segment);
  return segment;
}

// Usage
const trace = createTrace('ctx-123', 'plan-456');
trace.status = 'running';

const seg1 = addSegment(trace, 'Execute Step 1');
seg1.status = 'running';
// ... execution ...
seg1.status = 'completed';
seg1.finished_at = new Date().toISOString();

trace.status = 'completed';
```

### 8.2 Python (Pydantic Model)

```python
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

class TraceStatus(str, Enum):
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'

class SegmentStatus(str, Enum):
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    SKIPPED = 'skipped'

class TraceSegment(BaseModel):
    segment_id: str = Field(default_factory=lambda: str(uuid4()))
    label: str
    status: SegmentStatus = SegmentStatus.PENDING
    parent_segment_id: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    attributes: Dict[str, Any] = {}

class Trace(BaseModel):
    trace_id: str = Field(default_factory=lambda: str(uuid4()))
    context_id: str
    plan_id: Optional[str] = None
    status: TraceStatus = TraceStatus.PENDING
    started_at: datetime = Field(default_factory=datetime.now)
    finished_at: Optional[datetime] = None
    segments: List[TraceSegment] = []

# Usage
trace = Trace(context_id='ctx-123', plan_id='plan-456')
trace.status = TraceStatus.RUNNING

segment = TraceSegment(label='Execute Step 1')
segment.status = SegmentStatus.RUNNING
trace.segments.append(segment)
```

## 9. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "source": "mplp-runtime"
  },
  "governance": {
    "lifecyclePhase": "execution",
    "locked": true
  },
  "trace_id": "trace-550e8400-e29b-41d4-a716-446655440002",
  "context_id": "ctx-550e8400-e29b-41d4-a716-446655440000",
  "plan_id": "plan-550e8400-e29b-41d4-a716-446655440001",
  "root_span": {
    "trace_id": "trace-550e8400-e29b-41d4-a716-446655440002"
  },
  "status": "completed",
  "started_at": "2025-12-07T00:00:00.000Z",
  "finished_at": "2025-12-07T00:05:32.000Z",
  "segments": [
    {
      "segment_id": "seg-001",
      "label": "Execute Step s1: Read logs",
      "status": "completed",
      "started_at": "2025-12-07T00:00:01.000Z",
      "finished_at": "2025-12-07T00:01:15.000Z",
      "attributes": {
        "step_id": "s1",
        "agent_role": "debugger",
        "tokens_used": 450
      }
    },
    {
      "segment_id": "seg-002",
      "parent_segment_id": "seg-001",
      "label": "LLM Call: Analyze logs",
      "status": "completed",
      "started_at": "2025-12-07T00:00:02.000Z",
      "finished_at": "2025-12-07T00:00:45.000Z",
      "attributes": {
        "model": "gpt-4",
        "prompt_tokens": 250,
        "completion_tokens": 200
      }
    },
    {
      "segment_id": "seg-003",
      "label": "Execute Step s2: Write fix",
      "status": "completed",
      "started_at": "2025-12-07T00:01:16.000Z",
      "finished_at": "2025-12-07T00:05:30.000Z",
      "attributes": {
        "step_id": "s2",
        "agent_role": "coder",
        "files_modified": ["src/auth/login.ts"]
      }
    }
  ],
  "events": [
    {
      "event_id": "evt-001",
      "event_family": "pipeline_stage",
      "event_type": "step_completed",
      "timestamp": "2025-12-07T00:01:15.000Z"
    }
  ]
}
```

**Schemas**:
- `schemas/v2/mplp-trace.schema.json`
- `common/trace-base.schema.json`

## 10. Related Documents

**Architecture**:
- [L3 Execution & Orchestration](/docs/specification/architecture/l3-execution-orchestration)

**Modules**:
- [Context Module](context-module.md)
- [Plan Module](plan-module.md)
- [Observability](../observability/observability-overview.md)

---

**Required Fields**: meta, trace_id, context_id, root_span, status  
**Status Enum**: pending running completed/failed/cancelled  
**Key Invariant**: Terminal status traces are immutable (no modifications allowed)