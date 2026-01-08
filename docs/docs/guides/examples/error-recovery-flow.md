---
sidebar_position: 5

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Example flow demonstrating error handling and recovery patterns in MPLP."
title: Error Recovery Flow

---



# Error Recovery Flow


## 1. Overview

**Related Golden Flow**: `flow-04-single-agent-llm-enrichment`

In autonomous systems, failures are inevitable. MPLP provides a structured way to detect, log, and recover from errors using the **Trace Module** for observation and **Plan Module** for state management.

### Recovery Workflow:
1. **Detection**: A step execution fails (exception, timeout, or validation failure).
2. **Emission**: The runtime emits a `Trace` event with status `failed`.
3. **Analysis**: The recovery logic (Kernel Duty) inspects the error type.
4. **Action**: The runtime applies a recovery strategy (Retry, Skip, or Rollback).
5. **Update**: The `Plan` and `Trace` are updated to reflect the recovery action.

## 2. Normative Example

### 2.1 Failed Trace Segment (JSON)

When a step fails, the corresponding trace segment is marked as `failed`:

```json
{
  "segment_id": "seg-step-2",
  "label": "Call Weather API",
  "status": "failed",
  "started_at": "2025-12-22T11:00:00Z",
  "finished_at": "2025-12-22T11:00:05Z",
  "attributes": {
    "error_type": "timeout_error",
    "retry_count": 0,
    "message": "Upstream API failed to respond within 5000ms"
  }
}
```

### 2.2 Recovery Event

The runtime then emits a recovery event to the `Trace`:

```json
{
  "event_id": "evt-rec-001",
  "type": "recovery.retry_initiated",
  "timestamp": "2025-12-22T11:00:06Z",
  "detail": {
    "target_segment_id": "seg-step-2",
    "strategy": "exponential_backoff",
    "next_attempt_at": "2025-12-22T11:00:10Z"
  }
}
```

## 3. Recovery Strategies

| Strategy | Plan State Change | Trace Impact |
|:---|:---|:---|
| **Retry** | Step status reset to `pending`. | New span created for attempt. |
| **Skip** | Step status set to `skipped`. | Segment marked `skipped`. |
| **Rollback** | Plan reverted to last `checkpoint`. | Trace segments after checkpoint invalidated. |
| **Abort** | Plan status set to `failed`. | Trace terminated. |

## 4. Implementation Details

### 4.1 Error Propagation
Errors must propagate from the L3 Execution layer to the L2 Trace layer. A conformant runtime must ensure that the `root_span` of the Trace correctly reflects the aggregate status of its segments.

### 4.2 Deterministic Rollback
When a `Rollback` is triggered, the runtime must use the `Value State Layer (VSL)` to restore the agent's memory and state to the exact values recorded at the target checkpoint.

## 5. Related Documentation

- [Trace Module Specification](/docs/specification/modules/trace-module.md)
- [L3 Error Handling & Drift](/docs/specification/architecture)
- [Golden Flow: Resilient Execution](/docs/evaluation/golden-flows)