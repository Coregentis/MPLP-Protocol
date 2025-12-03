---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
| :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `extension_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `name` | `String` | ✅ Yes | Extension name. |
| `extension_type` | `Enum` | ✅ Yes | `capability`, `policy`, `integration`, `transformation`, `validation`, `other`. |
| `version` | `SemVer` | ✅ Yes | Semantic version string. |
| `status` | `Enum` | ✅ Yes | `registered`, `active`, `inactive`, `deprecated`. |
| `config` | `Object` | ❌ No | Configuration payload. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

## 5. Binding Points

- **L1 Schema**: `mplp-extension.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.extensions`.

## 6. Interaction Model

1.  **Load**: Runtime loads Extension manifest.
2.  **Register**: Extension is registered in the PSG (Status: `registered`).
3.  **Activate**: Extension is enabled for the Context (Status: `active`).
4.  **Execute**: Extension hooks into defined lifecycle events or provides tools.

## 7. Versioning & Invariants

- **Invariant**: `version` **MUST** follow Semantic Versioning 2.0.0.
- **Invariant**: `extension_id` **MUST** be unique within the Context.

## 8. Security / Safety Considerations

- **Sandboxing**: Extensions **SHOULD** run in a sandboxed environment if they execute untrusted code.
- **Review**: Extensions affecting `policy` or `validation` **SHOULD** undergo security review.

## 9. References

- [Context Module](context-module.md)
- [L4: Integration Infrastructure](../01-architecture/l4-integration-infra.md)
