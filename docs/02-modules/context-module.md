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
| `governance` | `Object` | ❌ No | Lifecycle and locking metadata. |
| `context_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `root` | `Object` | ✅ Yes | Root definition (domain, environment). |
| `title` | `String` | ✅ Yes | Human-readable title. |
| `summary` | `String` | ❌ No | Brief scope summary. |
| `status` | `Enum` | ✅ Yes | `draft`, `active`, `suspended`, `archived`, `closed`. |
| `tags` | `Array` | ❌ No | Classification tags. |
| `language` | `String` | ❌ No | Primary working language. |
| `owner_role` | `String` | ❌ No | ID of the primary owner role. |
| `constraints` | `Object` | ❌ No | Global constraints (security, budget). |
| `created_at` | `DateTime` | ❌ No | Creation timestamp. |
| `updated_at` | `DateTime` | ❌ No | Last update timestamp. |
| `trace` | `TraceBase` | ❌ No | Audit trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

## 5. Binding Points

- **L1 Schema**: `mplp-context.schema.json`
- **L2 Events**: `GraphUpdateEvent` (on creation/update).
- **PSG Path**: `psg.project_root`.

## 6. Interaction Model

1.  **Initialization**: Agent/User creates Context (Status: `draft`).
2.  **Activation**: Context is validated and set to `active`.
3.  **Usage**: Plan module reads `context_id` to bind scope.
4.  **Closure**: Context is set to `closed` or `archived`.

## 7. Versioning & Invariants

- **Invariant**: `sa_requires_context` - SA execution requires a valid Context.
- **Invariant**: `sa_context_must_be_active` - SA can only execute when Context status is `active`.

## 8. Security / Safety Considerations

- **Access Control**: Modification of `root` properties should be restricted to `owner_role`.
- **Constraint Enforcement**: Runtimes **MUST** enforce `constraints` (e.g., "No internet access") at the AEL level.

## 9. References

- [L2: Coordination & Governance](../01-architecture/l2-coordination-governance.md)
- [Plan Module](plan-module.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
