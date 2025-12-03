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
| `collab_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `title` | `String` | ✅ Yes | Session title. |
| `purpose` | `String` | ✅ Yes | Goal description. |
| `mode` | `Enum` | ✅ Yes | `broadcast`, `round_robin`, `orchestrated`, `swarm`, `pair`. |
| `status` | `Enum` | ✅ Yes | `draft`, `active`, `suspended`, `completed`, `cancelled`. |
| `participants` | `Array` | ✅ Yes | List of `CollabParticipant`. |
| `created_at` | `DateTime` | ✅ Yes | Creation timestamp. |
| `updated_at` | `DateTime` | ❌ No | Last update timestamp. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### CollabParticipant Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `participant_id` | `String` | ✅ Yes | Participant ID. |
| `role_id` | `String` | ❌ No | Bound Role ID. |
| `kind` | `Enum` | ✅ Yes | `agent`, `human`, `system`, `external`. |
| `display_name` | `String` | ❌ No | Human-readable name. |

## 5. Binding Points

- **L1 Schema**: `mplp-collab.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.collab_sessions`.

## 6. Interaction Model

1.  **Setup**: Orchestrator creates Session with defined `mode` and `participants`.
2.  **Execution**: Agents take turns or act in parallel according to `mode`.
3.  **Teardown**: Session is marked `completed` when the goal is met.

## 7. Versioning & Invariants

- **Invariant**: A Session **MUST** have at least one participant (`minItems: 1`).
- **Invariant**: `mode` determines the turn-taking logic (enforced by Runtime).

## 8. Security / Safety Considerations

- **Access Control**: Only listed `participants` should be allowed to contribute to the session.
- **Mode Enforcement**: The Runtime **MUST** enforce the rules of the selected `mode` (e.g., preventing out-of-turn messages in `round_robin`).

## 9. References

- [Role Module](role-module.md)
- [Dialog Module](dialog-module.md)
