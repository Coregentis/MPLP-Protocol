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
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `role_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `name` | `String` | ✅ Yes | Human-readable name (e.g., "Planner"). |
| `description` | `String` | ❌ No | Detailed function description. |
| `capabilities` | `Array` | ❌ No | List of permission strings. |
| `created_at` | `DateTime` | ❌ No | Creation timestamp. |
| `updated_at` | `DateTime` | ❌ No | Last update timestamp. |
| `trace` | `TraceBase` | ❌ No | Audit trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

## 5. Binding Points

- **L1 Schema**: `mplp-role.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.roles`.

## 6. Interaction Model

1.  **Definition**: System Administrator defines Roles and Capabilities.
2.  **Assignment**: Agent is initialized with a specific `role_id`.
3.  **Enforcement**: Runtime checks Role capabilities during execution.

## 7. Versioning & Invariants

- **Invariant**: `role_id` **MUST** be unique within the Context/Project.
- **Invariant**: A Role **MUST** have a non-empty `name`.

## 8. Security / Safety Considerations

- **Least Privilege**: Roles should be granted only the minimum necessary capabilities.
- **Immutable Audit**: Role assignments and capability changes **MUST** be auditable via Trace.

## 9. References

- [Confirm Module](confirm-module.md)
- [Context Module](context-module.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
