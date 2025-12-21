---
title: Observability
description: Observability requirements for MPLP including the 12 event families, normative emission rules, trace context compatibility, and metrics collection.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, observability, MPLP events, trace context, metrics, event families, audit trail, W3C trace, monitoring]
sidebar_label: Observability
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Observability

## 1. Purpose

**Observability** in MPLP is not an afterthoughtt is a **core normative requirement**. The protocol mandates that all significant state changes, decisions, and executions be emitted as structured events, forming an immutable audit trail. This ensures agent behavior is:
- **Deterministic**: Replay traces to reproduce behavior
- **Auditable**: Full visibility into decision-making
- **Debuggable**: Diagnose failures via event analysis
- **Learnable**: Extract training samples from successful flows

**Design Principle**: "If it happened, it's in the trace"

## 🧭 How to Use This Section

| Your Goal | Start Here |
|:----------|:-----------|
| **Implement event emission** | [Normative Emission Rules](#3-normative-emission-rules) |
| **Understand event types** | [The 12 Event Families](#2-the-12-event-families) |
| **Check invariants** | [Observability Invariants](#8-observability-invariants) |
| **Visualize traces** | [Trace Viewers & Visualization](#6-trace-viewers--visualization) |

> [!NOTE]
> **Standards Mapping (Informative)**
> MPLP Observability mechanisms **map to** NIST AI RMF "Measure" and "Manage" functions.
> This documentation does not claim compliance or certification. See the canonical positioning at [mplp.io/standards/positioning](https://mplp.io/standards/positioning).

## 2. The 12 Event Families

**From**: `schemas/v2/events/mplp-event-core.schema.json` (lines 20-33)

```json
{
  "event_family": {
    "type": "string",
    "enum": [
      "import_process",
      "intent",
      "delta_intent",
      "impact_analysis",
      "compensation_plan",
      "methodology",
      "reasoning_graph",
      "pipeline_stage",
      "graph_update",
      "runtime_execution",
      "cost_budget",
      "external_integration"
    ]
  }
}
```

### 2.1 Group A: Intent & Planning (L2)

| Family | Purpose | Example Event Types | Required |
|:---|:---|:---|:---:|
| **`intent`** | User's raw request/goal | `intent_captured`, `intent_clarified` | |
| **`delta_intent`** | Modifications to existing intent | `intent_updated`, `scope_changed` | |
| **`methodology`** | Agent's high-level approach | `approach_selected`, `strategy_changed` | |
| **`reasoning_graph`** | Chain-of-Thought (CoT) traces | `thought_node_added`, `decision_made` | |

**Use Cases**:
- **Intent**: Capture user request "Fix login bug"
- **Delta Intent**: User changes scope "Also add tests"
- **Methodology**: Agent decides approach "Use TDD methodology"
- **Reasoning Graph**: Agent explains thinking "Because X, therefore Y"

### 2.2 Group B: Execution & Lifecycle (L3)

| Family | Purpose | Example Event Types | Required |
|:---|:---|:---|:---:|
| **`pipeline_stage`** | Plan/Step status transitions | `step_started`, `step_completed`, `plan_failed` | **REQUIRED** |
| **`runtime_execution`** | LLM/tool invocation details | `llm_call_started`, `tool_execution_completed` | |
| **`external_integration`** | L4 system events | `file_saved`, `git_committed`, `ci_completed` | |
| **`cost_budget`** | Token usage, API costs | `tokens_consumed`, `budget_alert` | |

**Use Cases**:
- **Pipeline Stage**: Track Plan execution Draft Approved In Progress Completed
- **Runtime Execution**: Monitor LLM calls GPT-4 took 2.3s, used 450 tokens
- **External Integration**: File changes `index.ts` modified at 12:00
- **Cost Budget**: Track spending $0.50 spent on this Plan

### 2.3 Group C: State & Safety (L3)

| Family | Purpose | Example Event Types | Required |
|:---|:---|:---|:---:|
| **`graph_update`** | PSG structural changes | `node_added`, `edge_deleted`, `bulk_update` | **REQUIRED** |
| **`impact_analysis`** | Predicted change side-effects | `impact_calculated`, `risk_assessed` | |
| **`compensation_plan`** | Rollback/recovery actions | `rollback_planned`, `compensation_executed` | |
| **`import_process`** | Project initialization | `files_indexed`, `dependencies_resolved` | |

**Use Cases**:
- **Graph Update**: PSG changes Step node added to Plan
- **Impact Analysis**: Predict effects "This change affects 3 files"
- **Compensation Plan**: Failure recovery "On error, restore file from snapshot"
- **Import Process**: Project setup "Indexed 120 files in 2.5s"

## 3. Normative Emission Rules

### 3.1 REQUIRED Events (for v1.0 compliance)

**From**: L2 coordination spec and observability invariants

**MUST Emit**:
1. **`pipeline_stage`**: Whenever a Plan or Step changes status
   - Example: Plan draft proposed approved in_progress completed
2. **`graph_update`**: Whenever PSG structure changes
   - Example: Node added (new Step), Edge added (dependency)

**Why Required**: These events enable:
- State reconstruction (rebuild PSG from event log)
- Audit compliance (prove which actions occurred when)
- Drift detection (compare PSG vs. file system)

### 3.2 RECOMMENDED Events

**For production observability**, also emit:
- **`runtime_execution`**: Track LLM/tool performance, debug failures
- **`cost_budget`**: Monitor spending, prevent overruns
- **`external_integration`**: Understand external system interactions

### 3.3 Emission Example

**TypeScript SDK**:
```typescript
import { EventBus } from '@mplp/sdk-ts';

// Emit pipeline_stage event (REQUIRED)
await eventBus.emit({
  event_id: generateUUID(),
  event_family: 'pipeline_stage',
  event_type: 'step_started',
  timestamp: new Date().toISOString(),
  payload: {
    plan_id: 'plan-123',
    step_id: 'step-456',
    step_description: 'Run linter',
    previous_status: 'pending',
    new_status: 'in_progress'
  }
});

// Emit graph_update event (REQUIRED)
await eventBus.emit({
  event_id: generateUUID(),
  event_family: 'graph_update',
  event_type: 'node_updated',
  timestamp: new Date().toISOString(),
  payload: {
    graph_id: 'psg-789',
    node_id: 'step-456',
    node_type: 'Step',
    update_kind: 'node_update',
    changed_fields: ['status']
  }
});

// Emit runtime_execution event (RECOMMENDED)
await eventBus.emit({
  event_id: generateUUID(),
  event_family: 'runtime_execution',
  event_type: 'llm_call_completed',
  timestamp: new Date().toISOString(),
  payload: {
    execution_id: 'exec-abc',
    executor_kind: 'llm',
    model: 'gpt-4',
    duration_ms: 2340,
    token_usage: { prompt: 250, completion: 180, total: 430 },
    cost_usd: 0.012
  }
});
```

## 4. Event Schema Structure

### 4.1 Base Event (mplp-event-core.schema.json)

**All events inherit**:
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",  // UUID v4 (REQUIRED)
  "event_type": "step_started",                        // Specific subtype
  "event_family": "pipeline_stage",                    // 1 of 12 families (REQUIRED)
  "timestamp": "2025-12-07T00:00:00.000Z",             // ISO 8601 (REQUIRED)
  "project_id": "proj-123",                            // Optional context
  "payload": { ... }                                   // Event-specific data
}
```

### 4.2 PipelineStageEvent (REQUIRED Schema)

**From**: `schemas/v2/events/mplp-pipeline-stage-event.schema.json`

```json
{
  "event_id": "uuid-v4",
  "event_family": "pipeline_stage",
  "event_type": "step_completed",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "pipeline_id": "plan-123",                      // UUID v4
  "stage_id": "step-456",                         // Non-empty string
  "stage_status": "completed",                    // {pending, running, completed, failed, skipped}
  "payload": {
    "previous_status": "in_progress",
    "duration_ms": 1250,
    "output": "Linter passed with 0 errors"
  }
}
```

### 4.3 GraphUpdateEvent (REQUIRED Schema)

**From**: `schemas/v2/events/mplp-graph-update-event.schema.json`

```json
{
  "event_id": "uuid-v4",
  "event_family": "graph_update",
  "event_type": "node_added",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "graph_id": "psg-789",                          // UUID v4
  "update_kind": "node_add",                      // {node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk}
  "payload": {
    "node_id": "step-456",
    "node_type": "Step",
    "parent_id": "plan-123"
  }
}
```

### 4.4 RuntimeExecutionEvent (RECOMMENDED Schema)

```json
{
  "event_id": "uuid-v4",
  "event_family": "runtime_execution",
  "event_type": "tool_execution_completed",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "execution_id": "exec-abc",                     // UUID v4
  "executor_kind": "tool",                        // {agent, tool, llm, worker, external}
  "status": "completed",                          // {pending, running, completed, failed, cancelled}
  "payload": {
    "tool_name": "eslint",
    "exit_code": 0,
    "duration_ms": 850,
    "output": "?No problems found"
  }
}
```

## 5. Storage & Querying

### 5.1 Event Storage Options

MPLP does not mandate a specific storage backend, but events **MUST** be:
- **Append-only**: Never modify or delete events
- **Immutable**: Preserve original event data
- **Queryable**: Support filtering by trace_id, context_id, event_family

**Backend Options**:

| Backend | Append-Only | Query Performance | Scalability | Best For |
|:---|:---|:---|:---|:---|
| **Append-only log file** | | Low | Single-node | Development |
| **PostgreSQL** | (via insert-only) | High (with indexes) | Vertical | Production (ACID) |
| **Elasticsearch** | | Excellent | Horizontal | Full-text search, analytics |
| **S3** | | Low | Massive | Long-term archival |
| **Event Streaming** (Kafka) | | Excellent | Horizontal | Real-time processing |

### 5.2 Query Patterns

**By Trace ID**:
```sql
SELECT * FROM events WHERE trace_id = 'trace-789' ORDER BY timestamp ASC;
```

**By Event Family**:
```sql
SELECT * FROM events WHERE event_family = 'pipeline_stage' AND timestamp > '2025-12-06';
```

**By Context (all events for a project)**:
```sql
SELECT * FROM events WHERE project_id = 'proj-123' ORDER BY timestamp DESC LIMIT 100;
```

### 5.3 Indexing Strategy

**Recommended Indexes**:
- `(trace_id, timestamp)` - Trace reconstruction
- `(event_family, timestamp)` - Family-specific queries
- `(project_id, timestamp)` - Project-scoped queries
- `(event_type)` - Type-specific queries

## 6. Trace Viewers & Visualization

### 6.1 W3C Trace Context Compatibility

MPLP events include `trace_id` and `span_id` fields (from `trace-base.schema.json`), making them compatible with standard distributed tracing tools.

> [!TIP]
> **OpenTelemetry Compatibility**
> MPLP trace semantics are designed to be **compatible** with OpenTelemetry.
> This allows MPLP traces to be exported to OTel-compatible backends without semantic loss.

**Mapping**:
- MPLP `trace_id` W3C `traceparent`
- MPLP `span_id` W3C `spanid`
- MPLP `parent_span_id` W3C `parent-id`

### 6.2 Visualization Tools

**Compatible Tools** (via adapters):
- **Jaeger**: Distributed tracing UI
- **Zipkin**: Trace visualization
- **Grafana**: Custom dashboards
- **Kibana**: Elasticsearch-based analytics

**Adapter Example** (convert MPLP event to Jaeger span):
```typescript
function toJaegerSpan(event: MplpEvent): JaegerSpan {
  return {
    traceId: event.trace_id,
    spanId: event.span_id,
    operationName: event.event_type,
    startTime: new Date(event.timestamp).getTime() * 1000, // microseconds
    duration: event.payload.duration_ms * 1000,             // microseconds
    tags: {
      'event.family': event.event_family,
      'mplp.plan_id': event.payload.plan_id
    }
  };
}
```

## 7. Learning from Events

### 7.1 Training Sample Extraction

Events form the basis for RLHF/SFT training samples:

**Example**: Extract (Intent Plan Outcome) tuples
```typescript
async function extractLearningSample(trace_id: string): Promise<LearningSample> {
  const events = await eventBus.getEventsByTraceId(trace_id);
  
  const intent = events.find(e => e.event_family === 'intent');
  const plan = events.find(e => e.event_family === 'pipeline_stage' && e.event_type === 'plan_created');
  const outcome = events.find(e => e.event_family === 'pipeline_stage' && e.event_type === 'plan_completed');
  
  return {
    sample_id: generateUUID(),
    sample_family: 'intent_resolution',
    input: {
      intent_text: intent.payload.user_request,
      context: intent.payload.project_context
    },
    output: {
      plan_structure: plan.payload.steps,
      success: outcome.payload.status === 'completed',
      resolution_quality_label: 'good'  // Human feedback
    }
  };
}
```

### 7.2 Metrics & Analytics

**Real-Time Metrics**:
```typescript
// Average step execution time
SELECT AVG(duration_ms) as avg_duration
FROM events
WHERE event_family = 'runtime_execution' AND event_type LIKE '%_completed'
GROUP BY executor_kind;

// Plan success rate
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM events
WHERE event_family = 'pipeline_stage' AND event_type = 'plan_completed';

// Top failing steps
SELECT step_description, COUNT(*) as failure_count
FROM events
WHERE event_family = 'pipeline_stage' AND stage_status = 'failed'
GROUP BY step_description
ORDER BY failure_count DESC
LIMIT 10;
```

## 8. Observability Invariants

**From**: `schemas/v2/invariants/observability-invariants.yaml`

| Invariant ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `obs_event_id_is_uuid` | `event_id` | uuid-v4 | All events must have UUID v4 event_id |
| `obs_event_type_non_empty` | `event_type` | non-empty-string | All events must have non-empty event_type |
| `obs_event_family_valid` | `event_family` | enum(12 families) | Event family must be valid enum value |
| `obs_timestamp_iso_format` | `timestamp` | iso-datetime | All events must have ISO 8601 timestamp |

**Additional Invariants** (event-family specific):
- **PipelineStageEvent**: `pipeline_id` (UUID v4), `stage_status` {pending, running, completed, failed, skipped}
- **GraphUpdateEvent**: `graph_id` (UUID v4), `update_kind` {node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk}
- **RuntimeExecutionEvent**: `execution_id` (UUID v4), `executor_kind` {agent, tool, llm, worker, external}, `status` {pending, running, completed, failed, cancelled}

## 9. Best Practices

### 9.1 Event Emission Timing

**Emit events synchronously** (before state changes complete):
```typescript
// Bad: Emit after potential failure
await updatePlanStatus(plan, 'in_progress');
await eventBus.emit({ event_family: 'pipeline_stage', ... });  // May never execute if update fails

// Good: Emit before state change (or in transaction)
await eventBus.emit({ event_family: 'pipeline_stage', event_type: 'plan_status_changing', ... });
await updatePlanStatus(plan, 'in_progress');
```

### 9.2 Payload Design

**Include enough context for standalone event interpretation**:
```json
{
  "event_family": "pipeline_stage",
  "event_type": "step_completed",
  "payload": {
    // Good: Includes full context
    "plan_id": "plan-123",
    "plan_title": "Fix Login Bug",
    "step_id": "step-456",
    "step_description": "Run linter on auth module",
    "previous_status": "in_progress",
    "new_status": "completed",
    "duration_ms": 1250
  }
}
```

### 9.3 Avoid Event Flooding

**Rate limit high-frequency events**:
```typescript
class ThrottledEventBus {
  private lastEmit = new Map<string, number>();
  
  async emit(event: MplpEvent): Promise<void> {
    const key = `${event.event_family}:${event.event_type}`;
    const now = Date.now();
    const last = this.lastEmit.get(key) || 0;
    
    // Throttle to max 100 events/sec per type
    if (now - last < 10) {
      return;  // Skip event
    }
    
    this.lastEmit.set(key, now);
    await this.eventBus.emit(event);
  }
}
```

## 10. Related Documents

**Architecture**:
- [L2 Coordination & Governance](../01-architecture/l2-coordination-governance.md)
- [L3 Execution & Orchestration](../01-architecture/l3-execution-orchestration.md)

**Cross-Cutting Concerns**:
- [Event Bus](../01-architecture/cross-cutting-kernel-duties/event-bus.md)
- [Performance](../01-architecture/cross-cutting-kernel-duties/performance.md)
- [Learning Feedback](../01-architecture/cross-cutting-kernel-duties/learning-feedback.md)

**Schemas**:
- `schemas/v2/events/mplp-event-core.schema.json` (12 families enum)
- `schemas/v2/events/mplp-pipeline-stage-event.schema.json` (REQUIRED)
- `schemas/v2/events/mplp-graph-update-event.schema.json` (REQUIRED)
- `schemas/v2/events/mplp-runtime-execution-event.schema.json`

**Invariants**:
- `schemas/v2/invariants/observability-invariants.yaml` (12 rules)

---

**Document Status**: Normative (Event emission requirements)  
**Event Families**: 12 (2 REQUIRED: pipeline_stage, graph_update)  
**Base Schema**: `mplp-event-core.schema.json` (event_id, event_family, event_type, timestamp)  
**Storage**: Append-only, immutable, queryable by trace_id/context_id  
**Visualization**: W3C Trace Context compatible (Jaeger, Zipkin)
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
