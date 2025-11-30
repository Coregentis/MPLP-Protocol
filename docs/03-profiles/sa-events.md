# SA Events (MPLP-SA Profile v1.0)

**Version**: 1.0.0  
**Schema**: [`schemas/v2/events/mplp-sa-event.schema.json`](../../schemas/v2/events/mplp-sa-event.schema.json)  
**Last Updated**: 2025-11-30

---

## 1. Overview

SA (Single Agent) execution emits a series of structured events throughout its lifecycle. These events:
- Conform to the `mplp-sa-event.schema.json` JSON Schema
- Are written to the Trace module for observability
- Provide audit trail for SA execution
- Enable debugging and monitoring of agent behavior

---

## 2. Event Types

### 2.1 SAInitialized

**Trigger**: SA instance created, before any Context/Plan loading  
**Lifecycle State**: `initialize`

**Key Fields**:
```json
{
  "event_type": "SAInitialized",
  "sa_id": "uuid-of-sa-instance",
  "timestamp": "2025-11-30T12:00:00.000Z",
  "payload": {}
}
```

**Purpose**: Marks the beginning of SA execution lifecycle.

---

### 2.2 SAContextLoaded

**Trigger**: Context object successfully loaded and validated  
**Lifecycle State**: `load_context`

**Key Fields**:
```json
{
  "event_type": "SAContextLoaded",
  "sa_id": "uuid-of-sa-instance",
  "context_id": "uuid-of-context",
  "timestamp": "2025-11-30T12:00:01.000Z",
  "payload": {
    "context_status": "active"
  }
}
```

**Purpose**: Confirms Context binding and readiness for Plan evaluation.

---

### 2.3 SAPlanEvaluated

**Trigger**: Plan structure parsed, dependencies resolved, execution order determined  
**Lifecycle State**: `evaluate_plan`

**Key Fields**:
```json
{
  "event_type": "SAPlanEvaluated",
  "sa_id": "uuid-of-sa-instance",
  "plan_id": "uuid-of-plan",
  "timestamp": "2025-11-30T12:00:02.000Z",
  "payload": {
    "total_steps": 5,
    "execution_order": ["step-1-id", "step-2-id", "step-3-id"]
  }
}
```

**Purpose**: Documents the execution strategy before step execution begins.

---

### 2.4 SAStepStarted

**Trigger**: Individual Plan step begins execution  
**Lifecycle State**: `execute_step`

**Key Fields**:
```json
{
  "event_type": "SAStepStarted",
  "sa_id": "uuid-of-sa-instance",
  "timestamp": "2025-11-30T12:00:03.000Z",
  "payload": {
    "step_id": "uuid-of-step",
    "agent_role": "agent",
    "description": "Analyze user requirements"
  }
}
```

**Purpose**: Marks start of individual step execution for granular tracing.

---

### 2.5 SAStepCompleted

**Trigger**: Individual Plan step finishes execution (success)  
**Lifecycle State**: `execute_step`

**Key Fields**:
```json
{
  "event_type": "SAStepCompleted",
  "sa_id": "uuid-of-sa-instance",
  "timestamp": "2025-11-30T12:00:05.000Z",
  "payload": {
    "step_id": "uuid-of-step",
    "status": "completed",
   "duration_ms": 2000
  }
}
```

**Purpose**: Records successful step completion and outcome.

---

### 2.6 SAStepFailed

**Trigger**: Individual Plan step fails during execution  
**Lifecycle State**: `execute_step`

**Key Fields**:
```json
{
  "event_type": "SAStepFailed",
  "sa_id": "uuid-of-sa-instance",
  "timestamp": "2025-11-30T12:00:05.000Z",
  "payload": {
    "step_id": "uuid-of-step",
    "status": "failed",
    "error_message": "Tool executor timeout",
    "error_code": "TOOL_TIMEOUT"
  }
}
```

**Purpose**: Records step failure for error handling and retry logic.

---

### 2.7 SATraceEmitted

**Trigger**: SA writes batch of events to Trace  
**Lifecycle State**: `emit_trace`

**Key Fields**:
```json
{
  "event_type": "SATraceEmitted",
  "sa_id": "uuid-of-sa-instance",
  "trace_id": "uuid-of-trace",
  "timestamp": "2025-11-30T12:00:10.000Z",
  "payload": {
    "events_written": 5
  }
}
```

**Purpose**: Confirms trace persistence for audit trail.

---

### 2.8 SACompleted

**Trigger**: All Plan steps executed, SA lifecycle complete  
**Lifecycle State**: `complete`

**Key Fields**:
```json
{
  "event_type": "SACompleted",
  "sa_id": "uuid-of-sa-instance",
  "timestamp": "2025-11-30T12:00:11.000Z",
  "payload": {
    "total_steps_executed": 5,
    "success_count": 4,
    "failure_count": 1,
    "total_duration_ms": 11000
  }
}
```

**Purpose**: Marks successful termination of SA execution.

---

## 3. Relationship to Trace Module

All SA events are ultimately written to the Trace module's `events[]` array. The Trace structure:

```json
{
  "trace_id": "uuid",
  "context_id": "uuid",
  "plan_id": "uuid",
  "events": [
    { "event_type": "SAInitialized", ...},
    { "event_type": "SAContextLoaded", ... },
    { "event_type": "SAPlanEvaluated", ... },
    { "event_type": "SAStepStarted", ... },
    { "event_type": "SAStepCompleted", ... },
    { "event_type": "SATraceEmitted", ... },
    { "event_type": "SACompleted", ... }
  ]
}
```

**ID Binding**:
- `trace_id` in event matches Trace object's `trace_id`
- `context_id` / `plan_id` ensure cross-module referential integrity

---

## 4. Usage in SA Minimal Flows

### sa-flow-01-basic
Expected event sequence (single-step plan):
1. SAInitialized
2. SAContextLoaded
3. SAPlanEvaluated
4. SAStepStarted
5.SAStepCompleted
6. SATraceEmitted
7. SACompleted

### sa-flow-02-step-evaluation
Expected event sequence (multi-step plan with dependencies):
1. SAInitialized
2. SAContextLoaded
3. SAPlanEvaluated
4. SAStepStarted (step 1)
5. SAStepCompleted (step 1)
6. SAStepStarted (step 2)
7. SAStepCompleted (step 2)
8. SAStepStarted (step 3)
9. SAStepCompleted (step 3)
10. SATraceEmitted
11. SACompleted

---

**End of SA Events Documentation**
