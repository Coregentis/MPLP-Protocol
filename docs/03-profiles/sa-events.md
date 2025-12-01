---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# SA Profile Event Obligations (MPLP v1.0)

This document defines the normative **event emission obligations**  
for the **SA (Single Agent) Profile** in MPLP v1.0.

---

## 1. Event Families in Scope

The SA Profile utilizes the following Event Families from the MPLP Event Taxonomy:

-   **`RuntimeExecutionEvent`**: The primary family for SA lifecycle events (`SAInitialized`, `SAStepStarted`, etc.).
-   **`GraphUpdateEvent`**: Used when the SA updates the status of Plan Steps or Context (if applicable).
-   **`TraceEvent`**: Specific to the emission of the trace log itself (`SATraceEmitted`).

---

## 2. Mandatory Events by Lifecycle Phase  *(Normative)*

The Runtime MUST emit the following events during the SA execution lifecycle.

| Phase | Trigger | Required Event Type | Notes |
|-------|---------|---------------------|-------|
| `initialize` | SA instance creation | `SAInitialized` | Must include `sa_id`. |
| `load_context` | Context loaded | `SAContextLoaded` | Must include `context_id`. |
| `evaluate_plan` | Plan parsed | `SAPlanEvaluated` | Must include `plan_id` and execution order. |
| `execute_step` | Step start | `SAStepStarted` | Must include `step_id` and `agent_role`. |
| `execute_step` | Step success | `SAStepCompleted` | Must include `step_id` and status. |
| `emit_trace` | Trace write | `SATraceEmitted` | Confirms persistence. |
| `complete` | Execution finish | `SACompleted` | Summary metrics. |

---

## 3. Recommended Events  *(Normative - level: SHOULD)*

| Scenario | Event Type | Rationale |
|----------|------------|-----------|
| Step Failure | Step execution fails | `SAStepFailed` | Critical for debugging and error handling. |
| Resource Usage | Token consumption | `CostAndBudgetEvent` | Useful for cost tracking in LLM-based agents. |

---

## 4. Mapping to Modules  *(Normative)*

| Module | Profile Action | Event Type |
|--------|----------------|------------|
| **Context** | SA binds to Context | `SAContextLoaded` |
| **Plan** | SA evaluates Plan | `SAPlanEvaluated` |
| **Plan** | SA executes Step | `SAStepStarted`, `SAStepCompleted` |
| **Trace** | SA writes log | `SATraceEmitted` |

---

## 5. Non-normative Examples

> **Note**: These examples are illustrative. See `schemas/v2/events/mplp-sa-event.schema.json` for validation.

### 5.1 Step Completion Example

```json
{
  "event_type": "SAStepCompleted",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-30T12:00:05.000Z",
  "payload": {
    "step_id": "step-123",
    "status": "completed",
    "duration_ms": 1500
  }
}
```

### 5.2 Trace Emission Example

```json
{
  "event_type": "SATraceEmitted",
  "sa_id": "550e8400-e29b-41d4-a716-446655440000",
  "trace_id": "trace-999",
  "timestamp": "2025-11-30T12:00:10.000Z",
  "payload": {
    "events_written": 10
  }
}
```
