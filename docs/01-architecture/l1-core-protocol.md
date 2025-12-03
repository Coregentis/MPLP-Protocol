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
| :--- | :--- |
| **Context** | `mplp-context.schema.json` | Project root, environment, constraints. |
| **Plan** | `mplp-plan.schema.json` | Executable steps and dependencies. |
| **Confirm** | `mplp-confirm.schema.json` | Approval/rejection decisions. |
| **Trace** | `mplp-trace.schema.json` | Execution history and spans. |
| **Role** | `mplp-role.schema.json` | Agent role definitions. |
| **Extension** | `mplp-extension.schema.json` | Tool adapters and plugins. |
| **Dialog** | `mplp-dialog.schema.json` | Conversation threads. |
| **Collab** | `mplp-collab.schema.json` | Multi-agent sessions. |
| **Core** | `mplp-core.schema.json` | Governance and orchestration. |
| **Network** | `mplp-network.schema.json` | External system topology. |

## 5. Binding Points

### 5.1 Schema Binding
- **L2 Coordination & Governance** import L1 types to define their internal state.
- **L3 PSG** uses L1 types for node data structures.
- **L4 Adapters** use L1 types for input/output payloads.

### 5.2 Event Binding
- L1 defines the **Event Header** schema (`mplp-event-core.schema.json`) used by all L2/L3/L4 events.

### 5.3 PSG Binding
- L1 defines the **Node** and **Edge** shapes that constitute the PSG.

## 6. Interaction Model

L1 is a **passive layer**. It does not "run"; it is "used" by upper layers.

1.  **Import**: L2/L3 imports L1 types.
2.  **Validate**: L3 calls L1 validators before accepting external input.
3.  **Verify**: L3 calls L1 invariant checkers before persisting state to PSG.

## 7. Versioning & Invariants

- **Schema Versioning**: Schemas are versioned alongside the protocol (v1.0.0).
- **Breaking Changes**:
    - Removing a field: **Major** change.
    - Changing a field type: **Major** change.
    - Adding an optional field: **Minor** change.
- **Invariants**:
    - `sa-invariants.yaml`: Rules for Single-Agent Profile.
    - `map-invariants.yaml`: Rules for Multi-Agent Profile.

## 8. Security / Safety Considerations

- **Input Validation**: L1 validators are the first line of defense against malformed or malicious input.
- **DoS Prevention**: Schemas **SHOULD** enforce limits on array lengths and string sizes to prevent resource exhaustion.
- **Type Confusion**: Strict typing prevents logic errors in upper layers.

## 9. References

- [Schema Conventions](schema-conventions.md)
- [Architecture Overview](architecture-overview.md)
- [L2: Coordination & Governance](l2-coordination-governance.md)
