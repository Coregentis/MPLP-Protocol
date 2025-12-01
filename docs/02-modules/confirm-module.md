---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Confirm Module

## 1. Scope

This document defines the **Confirm Module**, which manages approval workflows and decision records. It serves as the "Human-in-the-Loop" (HITL) and governance checkpoint mechanism.

**Boundaries**:
- **In Scope**: Approval Requests, Decision Records, Status Transitions.
- **Out of Scope**: Policy Enforcement (Role module), Identity Management.

## 2. Normative Definitions

- **Confirm Request**: A formal request for approval of a target resource (e.g., Plan, Context).
- **Decision**: A recorded judgment (Approve/Reject) made by an authorized role.
- **Target**: The resource being acted upon.

## 3. Responsibilities (MUST/SHALL)

1.  **Gatekeeping**: Critical actions (as defined by policy) **MUST** wait for a `Confirm` request to be `approved` before proceeding.
2.  **Auditability**: Every decision **MUST** record `decided_by_role` and `decided_at`.
3.  **Immutability**: Once a decision is recorded, it **SHOULD NOT** be modified.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-confirm.schema.json`

### Confirm Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle and locking metadata. |
| `confirm_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `target_type` | `Enum` | ✅ Yes | `context`, `plan`, `trace`, `extension`, `other`. |
| `target_id` | `UUID` | ✅ Yes | ID of the resource being approved. |
| `status` | `Enum` | ✅ Yes | `pending`, `approved`, `rejected`, `cancelled`. |
| `requested_by_role` | `String` | ✅ Yes | Role initiating the request. |
| `requested_at` | `DateTime` | ✅ Yes | Request timestamp. |
| `reason` | `String` | ❌ No | Reason for the request. |
| `decisions` | `Array` | ❌ No | List of `ConfirmDecision`. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### ConfirmDecision Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `decision_id` | `UUID` | ✅ Yes | Decision identifier. |
| `status` | `Enum` | ✅ Yes | `approved`, `rejected`, `cancelled`. |
| `decided_by_role` | `String` | ✅ Yes | Role making the decision. |
| `decided_at` | `DateTime` | ✅ Yes | Decision timestamp. |
| `reason` | `String` | ❌ No | Decision rationale. |

## 5. Binding Points

- **L1 Schema**: `mplp-confirm.schema.json`
- **L2 Events**: `GraphUpdateEvent` (on status change).
- **PSG Path**: `psg.approvals`.

## 6. Interaction Model

1.  **Request**: Agent creates Confirm Request (Status: `pending`).
2.  **Notification**: System notifies authorized roles (via Event Bus).
3.  **Decision**: Human/Agent submits Decision (Status: `approved` or `rejected`).
4.  **Callback**: Original Agent resumes or aborts based on status.

## 7. Versioning & Invariants

- **Invariant**: A Confirm Request cannot be `approved` without at least one `approved` Decision.
- **Invariant**: A `rejected` Decision immediately transitions the Request to `rejected`.

## 8. Security / Safety Considerations

- **Authorization**: Only roles with `approver` privileges for the `target_type` should be allowed to create Decisions.
- **Non-Repudiation**: Decisions should be cryptographically signed in high-security environments (Extension profile).

## 9. References

- [Role Module](role-module.md)
- [Context Module](context-module.md)
