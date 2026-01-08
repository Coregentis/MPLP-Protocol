---
sidebar_position: 4

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Example flow demonstrating human-in-the-loop confirmation for high-risk actions."
title: Risk Confirmation Flow

---



# Risk Confirmation Flow


## 1. Overview

**Related Golden Flow**: `flow-05-single-agent-confirm-required`

In autonomous agent systems, certain actions (e.g., financial transactions, data deletion, external API calls) carry high risk. MPLP uses the **Confirm Module** to gate these actions, requiring explicit approval from a designated role (human or authorized agent) before execution proceeds.

### Workflow Steps:
1. **Identification**: The runtime identifies a high-risk step in the current `Plan`.
2. **Request**: The runtime creates a `Confirm` object with status `pending`.
3. **Wait**: Execution of the high-risk step is blocked.
4. **Decision**: An authorized role submits a `Decision` (approved/rejected).
5. **Resume/Abort**: The runtime resumes execution or aborts the plan based on the decision.

## 2. Normative Example

### 2.1 The Confirm Object (JSON)

When an agent reaches a step requiring approval (e.g., "Execute Wire Transfer"), the following `Confirm` object is emitted:

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "source": "runtime-01"
  },
  "confirm_id": "conf-8829-x1",
  "target_type": "plan",
  "target_id": "plan-550-abc",
  "status": "pending",
  "requested_by_role": "executor-agent",
  "requested_at": "2025-12-22T10:00:00Z",
  "reason": "Step 3 requires financial authorization for amount > $1000.",
  "trace": {
    "trace_id": "trace-990-def",
    "span_id": "span-step-3"
  }
}
```

### 2.2 The Decision Record

Once the user approves the request via a governance shell or dashboard, a `Decision` is appended:

```json
{
  "decisions": [
    {
      "decision_id": "dec-441-z9",
      "status": "approved",
      "decided_by_role": "finance-admin-human",
      "decided_at": "2025-12-22T10:05:00Z",
      "reason": "Verified transaction details with vendor."
    }
  ],
  "status": "approved"
}
```

## 3. State Transition Logic

| Status | Runtime Action | Trace Event |
|:---|:---|:---|
| `pending` | **BLOCK** execution of `target_id`. | `confirm.requested` |
| `approved` | **RESUME** execution of `target_id`. | `confirm.approved` |
| `rejected` | **ABORT** plan or trigger recovery. | `confirm.rejected` |
| `cancelled` | **CLEANUP** and exit. | `confirm.cancelled` |

## 4. Implementation Details

### 4.1 Blocking Mechanism
A conformant MPLP runtime must implement a "Gatekeeper" duty that checks for active `pending` Confirm objects associated with the current `plan_id` and `step_id` before invoking any tool or action.

### 4.2 Evidence Chain
The `Confirm` object is cryptographically linked to the `Trace` via the `trace_id`. This ensures that every high-risk action in the audit log is accompanied by a valid approval record.

## 5. Related Documentation

- [Confirm Module Specification](/docs/specification/modules/confirm-module.md)
- [L3 Execution Loop](/docs/specification/architecture)
- [Golden Flow: HITL Patterns](/docs/evaluation/golden-flows)