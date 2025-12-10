---
title: Runtime Trace Format
description: Specification of the MPLP Runtime Trace Format. Defines the JSON structure for exporting execution data, compatible with W3C Trace Context and OpenTelemetry.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Runtime Trace Format, trace structure, W3C Trace Context, OpenTelemetry, OTLP, trace export, execution tracing, MPLP trace]
sidebar_label: Runtime Trace Format
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Runtime Trace Format

## 1. Purpose

The **Runtime Trace Format** defines the JSON structure for exporting execution data from an MPLP runtime. It is designed to be compatible with the **W3C Trace Context** standard while adding MPLP-specific semantics.

**Design Principle**: "Standard format for interoperability with observability tools"

## 2. Trace Structure

### 2.1 Hierarchy

```
Trace (root)
 Segment (unit of work)    Events (discrete points)    Attributes (metadata)
 Segment    Events    Attributes
 ...
```

### 2.2 Trace Object

**From**: `schemas/v2/mplp-trace.schema.json`

| Field | Type | Description |
|:---|:---|:---|
| **`trace_id`** | UUID v4 | Unique trace identifier |
| **`context_id`** | UUID v4 | Parent Context reference |
| `plan_id` | UUID v4 | Associated Plan |
| **`status`** | Enum | Trace status |
| **`segments`** | Array | List of Segments |
| `started_at` | ISO 8601 | Trace start time |
| `ended_at` | ISO 8601 | Trace end time |
| `events` | Array | Trace-level events |

### 2.3 Segment Object

| Field | Type | Description |
|:---|:---|:---|
| **`segment_id`** | UUID v4 | Unique segment identifier |
| `parent_segment_id` | UUID v4 | Parent segment (for nesting) |
| **`label`** | String | Human-readable label |
| **`status`** | Enum | Segment status |
| `operation` | String | Operation name |
| `started_at` | ISO 8601 | Start timestamp |
| `ended_at` | ISO 8601 | End timestamp |
| `attributes` | Object | Key-value metadata |
| `events` | Array | Segment events |

## 3. W3C Trace Context Compatibility

### 3.1 Mapping

| W3C Field | MPLP Field | Description |
|:---|:---|:---|
| `trace-id` | `trace_id` | 16-byte identifier |
| `parent-id` | `parent_segment_id` | Parent span reference |
| `trace-flags` | `sampled` | Sampling decision |
| `tracestate` | `attributes` | Vendor-specific data |

### 3.2 HTTP Header Format

```http
traceparent: 00-{trace_id}-{segment_id}-01
tracestate: mplp=context_id:{ctx_id};plan_id:{plan_id}
```

**Example**:
```http
traceparent: 00-550e8400e29b41d4a716446655440000-a716446655440001-01
tracestate: mplp=context_id:ctx-550e8400;plan_id:plan-123
```

## 4. Attributes

### 4.1 Standard Attributes

| Attribute | Type | Description |
|:---|:---|:---|
| `mplp.module` | String | Module originating the span |
| `mplp.operation` | String | Operation name |
| `mplp.agent_role` | String | Role executing the action |
| `mplp.step_id` | UUID | Associated step |
| `mplp.error` | String | Error message (if failed) |
| `mplp.tokens_used` | Number | LLM tokens consumed |
| `mplp.duration_ms` | Number | Execution duration |

### 4.2 Extended Attributes

| Attribute | Type | Description |
|:---|:---|:---|
| `mplp.tool.name` | String | Tool name |
| `mplp.tool.args` | Object | Tool arguments |
| `mplp.llm.model` | String | LLM model name |
| `mplp.llm.tokens_in` | Number | Input tokens |
| `mplp.llm.tokens_out` | Number | Output tokens |

## 5. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0"
  },
  "trace_id": "trace-550e8400-e29b-41d4-a716-446655440000",
  "context_id": "ctx-550e8400-e29b-41d4-a716-446655440000",
  "plan_id": "plan-550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "started_at": "2025-12-07T00:00:00.000Z",
  "ended_at": "2025-12-07T00:05:00.000Z",
  "segments": [
    {
      "segment_id": "seg-001",
      "parent_segment_id": null,
      "label": "Plan Execution",
      "status": "completed",
      "operation": "execute_plan",
      "started_at": "2025-12-07T00:00:00.000Z",
      "ended_at": "2025-12-07T00:05:00.000Z",
      "attributes": {
        "mplp.module": "plan",
        "mplp.operation": "execute_plan",
        "mplp.agent_role": "orchestrator"
      }
    },
    {
      "segment_id": "seg-002",
      "parent_segment_id": "seg-001",
      "label": "Step 1: Read error logs",
      "status": "completed",
      "operation": "execute_step",
      "started_at": "2025-12-07T00:00:01.000Z",
      "ended_at": "2025-12-07T00:01:00.000Z",
      "attributes": {
        "mplp.module": "plan",
        "mplp.operation": "execute_step",
        "mplp.step_id": "step-001",
        "mplp.agent_role": "debugger",
        "mplp.duration_ms": 59000
      }
    },
    {
      "segment_id": "seg-003",
      "parent_segment_id": "seg-002",
      "label": "LLM Call: Analyze logs",
      "status": "completed",
      "operation": "llm_call",
      "started_at": "2025-12-07T00:00:02.000Z",
      "ended_at": "2025-12-07T00:00:05.000Z",
      "attributes": {
        "mplp.module": "extension",
        "mplp.operation": "llm_call",
        "mplp.llm.model": "gpt-4",
        "mplp.llm.tokens_in": 500,
        "mplp.llm.tokens_out": 200,
        "mplp.tokens_used": 700,
        "mplp.duration_ms": 3000
      }
    },
    {
      "segment_id": "seg-004",
      "parent_segment_id": "seg-002",
      "label": "Tool Call: file_read",
      "status": "completed",
      "operation": "tool_call",
      "started_at": "2025-12-07T00:00:10.000Z",
      "ended_at": "2025-12-07T00:00:11.000Z",
      "attributes": {
        "mplp.module": "extension",
        "mplp.operation": "tool_call",
        "mplp.tool.name": "file_read",
        "mplp.tool.args": {"path": "/var/log/auth.log"},
        "mplp.duration_ms": 1000
      }
    }
  ],
  "events": [
    {
      "event_id": "evt-001",
      "event_type": "SAInitialized",
      "event_family": "runtime_execution",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "event_id": "evt-002",
      "event_type": "pipeline_stage_started",
      "event_family": "pipeline_stage",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "event_id": "evt-003",
      "event_type": "SACompleted",
      "event_family": "runtime_execution",
      "timestamp": "2025-12-07T00:05:00.000Z"
    }
  ]
}
```

## 6. Export Formats

### 6.1 JSON Lines (JSONL)

**For log aggregation and streaming**:

```jsonl
{"trace_id":"trace-001","segment_id":"seg-001","operation":"execute_plan","timestamp":"2025-12-07T00:00:00.000Z"}
{"trace_id":"trace-001","segment_id":"seg-002","operation":"execute_step","timestamp":"2025-12-07T00:00:01.000Z"}
{"trace_id":"trace-001","segment_id":"seg-003","operation":"llm_call","timestamp":"2025-12-07T00:00:02.000Z"}
```

### 6.2 OpenTelemetry Protocol (OTLP)

**For integration with observability platforms**:

```typescript
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';

function convertToOTLP(trace: MPLPTrace): OTLPTrace {
  return {
    resourceSpans: [{
      resource: {
        attributes: [
          { key: 'mplp.context_id', value: { stringValue: trace.context_id } },
          { key: 'mplp.plan_id', value: { stringValue: trace.plan_id } }
        ]
      },
      scopeSpans: [{
        scope: { name: 'mplp-runtime', version: '1.0.0' },
        spans: trace.segments.map(s => ({
          traceId: trace.trace_id,
          spanId: s.segment_id,
          parentSpanId: s.parent_segment_id,
          name: s.label,
          kind: 1, // INTERNAL
          startTimeUnixNano: toNanos(s.started_at),
          endTimeUnixNano: toNanos(s.ended_at),
          attributes: Object.entries(s.attributes || {}).map(([k, v]) => ({
            key: k,
            value: { stringValue: String(v) }
          }))
        }))
      }]
    }]
  };
}
```

### 6.3 Jaeger Format

```json
{
  "traceID": "550e8400e29b41d4a716446655440000",
  "spans": [
    {
      "spanID": "a716446655440001",
      "operationName": "execute_plan",
      "startTime": 1733529600000000,
      "duration": 300000000,
      "tags": [
        {"key": "mplp.module", "type": "string", "value": "plan"},
        {"key": "mplp.agent_role", "type": "string", "value": "orchestrator"}
      ]
    }
  ]
}
```

## 7. SDK Implementation

```typescript
class TraceExporter {
  async exportAsJSONL(trace: Trace): Promise<string> {
    const lines: string[] = [];
    
    for (const segment of trace.segments) {
      lines.push(JSON.stringify({
        trace_id: trace.trace_id,
        segment_id: segment.segment_id,
        parent_segment_id: segment.parent_segment_id,
        operation: segment.operation,
        label: segment.label,
        status: segment.status,
        started_at: segment.started_at,
        ended_at: segment.ended_at,
        ...segment.attributes
      }));
    }
    
    return lines.join('\n');
  }
  
  async exportToOTLP(trace: Trace, endpoint: string): Promise<void> {
    const otlpTrace = convertToOTLP(trace);
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otlpTrace)
    });
  }
}
```

## 8. Related Documents

**Observability**:
- [Observability Overview](observability-overview.md) - Architecture
- [Event Taxonomy](event-taxonomy.md) - Event families

**Modules**:
- [Trace Module](../02-modules/trace-module.md) - Trace data model

**Schemas**:
- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/common/trace-base.schema.json`

---

**Document Status**: Normative (Export Format)  
**W3C Compatible**: Yes (Trace Context)  
**Export Formats**: JSON, JSONL, OTLP, Jaeger  
**Standard Attributes**: 7 core + 5 extended
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
