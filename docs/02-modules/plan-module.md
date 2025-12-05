> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
| :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `plan_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `title` | `String` | ✅ Yes | Plan title. |
| `objective` | `String` | ✅ Yes | Goal description. |
| `status` | `Enum` | ✅ Yes | `draft`, `proposed`, `approved`, `in_progress`, `completed`, `cancelled`, `failed`. |
| `steps` | `Array` | ✅ Yes | List of `PlanStep`. |
| `trace` | `TraceBase` | ❌ No | Execution trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### PlanStep Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `step_id` | `UUID` | ✅ Yes | Step identifier. |
| `description` | `String` | ✅ Yes | Work content. |
| `status` | `Enum` | ✅ Yes | `pending`, `in_progress`, `completed`, `blocked`, `skipped`, `failed`. |
| `dependencies` | `Array` | ❌ No | List of prerequisite `step_id`s. |
| `agent_role` | `String` | ❌ No | Assigned role. |
| `order_index` | `Integer` | ❌ No | Sort order. |

## 5. Binding Points

- **L1 Schema**: `mplp-plan.schema.json`
- **L2 Events**: `GraphUpdateEvent`, `PipelineStageEvent`.
- **PSG Path**: `psg.plans`, `psg.plan_steps`.

## 6. Interaction Model

1.  **Creation**: Agent generates Plan based on Context (Status: `draft`).
2.  **Approval**: User/Reviewer approves Plan (Status: `approved`).
3.  **Execution**: Orchestrator executes Steps (Status: `in_progress`).
4.  **Completion**: All steps complete -> Plan `completed`.

## 7. Versioning & Invariants

- **Invariant**: A Plan must have at least one Step (`minItems: 1`).
- **Invariant**: A Step cannot depend on itself (No cycles).

## 8. Security / Safety Considerations

- **Approval**: Plans **SHOULD** require explicit approval (via Confirm module) before execution in sensitive environments.
- **Resource Limits**: Plans **SHOULD** be bounded in size (max steps) to prevent resource exhaustion.

## 9. References

- [Context Module](context-module.md)
- [Trace Module](trace-module.md)
- [Confirm Module](confirm-module.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
