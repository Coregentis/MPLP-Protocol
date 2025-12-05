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
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `network_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `name` | `String` | ✅ Yes | Network name. |
| `description` | `String` | ❌ No | Brief description. |
| `topology_type` | `Enum` | ✅ Yes | `single_node`, `hub_spoke`, `mesh`, `hierarchical`, `hybrid`, `other`. |
| `status` | `Enum` | ✅ Yes | `draft`, `provisioning`, `active`, `degraded`, `maintenance`, `retired`. |
| `nodes` | `Array` | ❌ No | List of `NetworkNode`. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### NetworkNode Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `node_id` | `UUID` | ✅ Yes | Node identifier. |
| `name` | `String` | ❌ No | Node name. |
| `kind` | `Enum` | ✅ Yes | `agent`, `service`, `database`, `queue`, `external`, `other`. |
| `role_id` | `String` | ❌ No | Bound Role ID. |
| `status` | `Enum` | ✅ Yes | `active`, `inactive`, `degraded`, `unreachable`, `retired`. |

## 5. Binding Points

- **L1 Schema**: `mplp-network.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.network`.

## 6. Interaction Model

1.  **Provision**: Infrastructure provisions nodes.
2.  **Register**: Nodes register themselves with the Network module (Status: `active`).
3.  **Monitor**: Runtime updates node status based on heartbeats.

## 7. Versioning & Invariants

- **Invariant**: `node_id` **MUST** be unique within the Network.
- **Invariant**: A Node of kind `agent` **SHOULD** have a valid `role_id`.

## 8. Security / Safety Considerations

- **Authentication**: Node registration **MUST** be authenticated to prevent rogue nodes.
- **Isolation**: Compromised nodes **SHOULD** be marked `unreachable` or `retired` to isolate them.

## 9. References

- [Context Module](context-module.md)
- [Role Module](role-module.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
