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
| `core_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `protocol_version` | `String` | ✅ Yes | Major version (e.g., "1.0.0"). |
| `status` | `Enum` | ✅ Yes | `draft`, `active`, `deprecated`, `archived`. |
| `modules` | `Array` | ✅ Yes | List of `CoreModuleDescriptor`. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### CoreModuleDescriptor Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `module_id` | `Enum` | ✅ Yes | `context`, `plan`, `confirm`, `trace`, `role`, `extension`, `dialog`, `collab`, `core`, `network`. |
| `version` | `String` | ✅ Yes | Module version. |
| `status` | `Enum` | ✅ Yes | `enabled`, `disabled`, `experimental`, `deprecated`. |
| `required` | `Boolean` | ❌ No | Mandatory flag. |
| `description` | `String` | ❌ No | Brief description. |

## 5. Binding Points

- **L1 Schema**: `mplp-core.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.core`.

## 6. Interaction Model

1.  **Bootstrap**: Runtime loads Core config.
2.  **Check**: Runtime verifies version compatibility.
3.  **Init**: Runtime initializes enabled modules in dependency order.

## 7. Versioning & Invariants

- **Invariant**: `protocol_version` **MUST** be compatible with the Runtime.
- **Invariant**: Duplicate `module_id` entries are **NOT** allowed.

## 8. Security / Safety Considerations

- **Integrity**: The Core configuration **SHOULD** be immutable during runtime execution.
- **Fallback**: If a required module fails to load, the Runtime **MUST** halt initialization.

## 9. References

- [Context Module](context-module.md)
- [Protocol Versioning](../01-architecture/cross-cutting/protocol-version.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
