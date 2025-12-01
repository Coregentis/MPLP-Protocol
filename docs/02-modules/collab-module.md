---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Collab Module

## 1. Scope

This document defines the **Collab Module**, which orchestrates multi-agent and multi-role collaboration sessions. It defines "how" agents work together (e.g., Round Robin, Broadcast).

**Boundaries**:
- **In Scope**: Session Definition, Participant List, Interaction Mode.
- **Out of Scope**: The actual content of the collaboration (handled by Dialog/Plan).

## 2. Normative Definitions

- **Collaboration Session**: A bounded period of cooperative work.
- **Mode**: The pattern of interaction (e.g., `round_robin`).
- **Participant**: An entity (Agent/Human) involved in the session.

## 3. Responsibilities (MUST/SHALL)

1.  **Coordination**: The Collab module **MUST** define the `mode` of interaction.
2.  **Membership**: The module **MUST** maintain an accurate list of `participants`.
3.  **Lifecycle**: The session **MUST** track its `status` (e.g., `active`, `completed`).

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-collab.schema.json`

### Collab Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
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
