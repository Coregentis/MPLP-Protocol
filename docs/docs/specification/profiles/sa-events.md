---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-SA-EVENTS-001"
sidebar_position: 2

# UI metadata (non-normative; excluded from protocol semantics)
title: SA Events
sidebar_label: SA Events
description: "MPLP profile specification: SA Events. Defines conformance requirements for execution profiles."
---

# SA Events Specification

## Scope

This specification defines the mandatory and recommended events for the Single-Agent Profile.

## Non-Goals

This specification does not define event processing logic or SDK implementations.


## 1. Purpose

This document specifies the **mandatory and recommended events** for the Single-Agent (SA) Profile. These events enable observability, debugging, and learning sample extraction.

## 2. Event Families in Scope

The SA Profile utilizes the following Event Families:

| Family | Usage | Primary Events |
|:---|:---|:---|
| `RuntimeExecutionEvent` | SA lifecycle | `SAInitialized`, `SAStepStarted`, etc. |
| `GraphUpdateEvent` | State changes | Plan/Context status updates |
| `TraceEvent` | Trace emission | `SATraceEmitted` |
| `CostAndBudgetEvent` | Resource tracking | Token usage, cost |

## 3. Mandatory Events (Normative)

**Requirement Level**: MUST emit

### 3.1 Event Matrix

| Phase | Trigger | Event Type | Required Fields | Schema |
|:---|:---|:---|:---|:---|
| Initialize | SA created | `SAInitialized` | `sa_id`, `timestamp` | [sa-event.schema.json] |
| LoadContext | Context bound | `SAContextLoaded` | `sa_id`, `context_id` | [sa-event.schema.json] |
| EvaluatePlan | Plan parsed | `SAPlanEvaluated` | `sa_id`, `plan_id` | [sa-event.schema.json] |
| ExecuteStep | Step starts | `SAStepStarted` | `sa_id`, `step_id` | [sa-event.schema.json] |
| ExecuteStep | Step succeeds | `SAStepCompleted` | `sa_id`, `step_id`, `status` | [sa-event.schema.json] |
| EmitTrace | Trace written | `SATraceEmitted` | `sa_id`, `trace_id` | [sa-event.schema.json] |
| Complete | SA terminates | `SACompleted` | `sa_id`, `status` | [sa-event.schema.json] |

### 3.2 Event Lifecycle Flow

<MermaidDiagram id="372f3dfcf3e186ce" />

## 4. Recommended Events (Normative - SHOULD)

**Requirement Level**: SHOULD emit

| Scenario | Event Type | Rationale |
|:---|:---|:---|
| Step failure | `SAStepFailed` | Debug and retry logic |
| Token usage | `CostAndBudgetEvent` | LLM cost tracking |
| Tool call | `ToolExecutionEvent` | Tool audit trail |
| LLM call | `LLMCallEvent` | Model performance tracking |

## 5. Event Schemas

### 5.1 SAInitialized

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440001",
  "event_type": "SAInitialized",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "payload": {
    "runtime_version": "1.0.0",
    "capabilities": ["code.write", "code.review"]
  }
}
```

### 5.2 SAContextLoaded

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440002",
  "event_type": "SAContextLoaded",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:01.000Z",
  "context_id": "550e8400-e29b-41d4-a716-446655440010",
  "payload": {
    "context_title": "Refactor Auth Service",
    "context_status": "active"
  }
}
```

### 5.3 SAPlanEvaluated

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440003",
  "event_type": "SAPlanEvaluated",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:02.000Z",
  "plan_id": "550e8400-e29b-41d4-a716-446655440020",
  "payload": {
    "plan_title": "Fix Login Bug",
    "step_count": 5
  }
}
```

### 5.4 SAStepStarted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440004",
  "event_type": "SAStepStarted",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:03.000Z",
  "payload": {
    "step_id": "550e8400-e29b-41d4-a716-446655440030",
    "description": "Read error logs",
    "agent_role": "debugger"
  }
}
```

### 5.5 SAStepCompleted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440005",
  "event_type": "SAStepCompleted",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:05.000Z",
  "payload": {
    "step_id": "550e8400-e29b-41d4-a716-446655440030",
    "status": "completed",
    "result": {
      "output_summary": "Found NullPointerException in AuthService.java:125"
    }
  }
}
```

### 5.6 SAStepFailed

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440006",
  "event_type": "SAStepFailed",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:05.000Z",
  "payload": {
    "step_id": "550e8400-e29b-41d4-a716-446655440031",
    "status": "failed",
    "error_code": "TOOL_EXECUTION_ERROR",
    "error_message": "Permission denied"
  }
}
```

### 5.7 SATraceEmitted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440007",
  "event_type": "SATraceEmitted",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:00:10.000Z",
  "trace_id": "550e8400-e29b-41d4-a716-446655440040",
  "payload": {
    "events_written": 5
  }
}
```

### 5.8 SACompleted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440008",
  "event_type": "SACompleted",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-07T00:05:00.000Z",
  "payload": {
    "status": "completed",
    "steps_executed": 5,
    "steps_succeeded": 5,
    "steps_failed": 0
  }
}
```

## 6. Module Mapping

| Module | Profile Action | Event Type |
|:---|:---|:---|
| Context | Bind Context | `SAContextLoaded` |
| Plan | Evaluate Plan | `SAPlanEvaluated` |
| Plan | Start Step | `SAStepStarted` |
| Plan | Complete Step | `SAStepCompleted` |
| Trace | Write Trace | `SATraceEmitted` |

## 7. Event Processing

### 7.1 Event Handler Pattern

```typescript
interface SAEventHandler {
  handleSAInitialized(event: SAInitialized): Promise<void>;
  handleSAStepCompleted(event: SAStepCompleted): Promise<void>;
  handleSACompleted(event: SACompleted): Promise<void>;
}

class SAEventProcessor implements SAEventHandler {
  async handleSAStepCompleted(event: SAStepCompleted): Promise<void> {
    // Update trace
    await this.trace.addSegment({
      segment_id: uuidv4(),
      label: `Step: ${event.payload.step_id}`,
      status: event.payload.status,
      result: event.payload.result // object per schema $defs
    });
    
    // Extract learning sample if applicable
    if (event.payload.status === 'completed') {
      await this.learningCollector.captureStepSample(event);
    }
  }
}
```

## 8. Related Documents

**Profiles**:
- [SA Profile](sa-profile.md) - Full profile specification
- [MAP Events](map-events.md) - Multi-agent events

**Schemas**:
- `schemas/v2/events/mplp-sa-event.schema.json`
- `schemas/v2/events/mplp-event-core.schema.json`

---

**Profile**: SA Profile  
**Mandatory Events**: 7  
**Recommended Events**: 1