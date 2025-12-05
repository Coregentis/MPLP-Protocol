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
## 1. Identity & Scope  *(Normative)*

- **Profile ID**: `map_profile` (from `mplp-map-profile.yaml`)
- **Execution Mode**: `multi_agent`
- **Intended Use**:
  - The **Multi-Agent Profile (MAP)** defines the semantics for collaboration between multiple agents.
  - It handles session lifecycle, role assignments, turn-taking, broadcasting, and conflict resolution.
  - Suitable for: Collaborative coding, debate, peer review, and orchestrated workflows.
- **Out-of-Scope**:
  - Single-agent execution (see SA Profile).
  - Low-level network transport (handled by L4).

---

## 2. Required Modules & Artifacts  *(Normative)*

> The following L2 modules are required for MAP Profile compliance.

| Module | Required | Purpose in this Profile |
|--------|----------|-------------------------|
| Context | **Yes** | Defines the shared scope of collaboration. |
| Collab  | **Yes** | **Core Module**. Manages session state, participants, and mode. |
| Network | **Yes** | Defines the topology and addressable nodes. |
| Role    | **Yes** | Defines capabilities and identities of participants. |
| Dialog  | **Yes** | Used for the actual message exchange between agents. |
| Plan    | No | Optional. Agents may have individual plans, or share a high-level plan. |
| Trace   | **Yes** | Records the collaboration history. |
| Confirm | No | Optional. Used for human approval of critical turns. |
| Extension | No | Optional. |
| Core    | **Yes** | Required by protocol definition. |

---

## 3. Execution Model  *(Normative)*

### 3.1 Lifecycle States

The MAP Profile defines a 7-state lifecycle:

1.  **`initialize_session`**: Create `Collab` object and bind to Context.
2.  **`assign_roles`**: Map Agents (Nodes) to Roles via `Collab.participants`.
3.  **`dispatch_turn`**: Issue an **Execution Token** to the active role (Turn-Taking) or initiate broadcast.
4.  **`collect_results`**: Wait for the active agent(s) to complete their task/turn.
5.  **`resolve_conflicts`**: Check for concurrent state modifications (especially in parallel modes).
6.  **`broadcast_updates`**: Synchronize the new state to all participants.
7.  **`complete_session`**: Finalize the session and archive results.

### 3.2 Required Transitions

-   `initialize_session` → `assign_roles`: Must have >1 participant.
-   `assign_roles` → `dispatch_turn`: Roles must be valid.
-   `dispatch_turn` → `collect_results`: Token issued.
-   `collect_results` → `resolve_conflicts`: Turn completed.
-   `resolve_conflicts` → `broadcast_updates`: State consistent.
-   `broadcast_updates` → `dispatch_turn` (Loop) OR `complete_session` (End).

---

## 4. Invariants & Safety Guarantees  *(Normative)*

The following invariants from `schemas/v2/invariants/map-invariants.yaml` MUST be satisfied:

| Rule ID | Description | Scope | Violation Effect |
|---------|-------------|-------|------------------|
| `map_session_requires_multiple_participants` | Session must have at least 2 participants. | Collab | Creation Failure |
| `map_collab_mode_valid` | Mode must be `broadcast`, `round_robin`, `orchestrated`, etc. | Collab | Validation Error |
| `map_participants_have_role_ids` | All participants must be bound to a Role. | Collab | Assignment Error |
| `map_turn_completion_matches_dispatch` | Turn completion must match the dispatched token/role. | Trace | Runtime Error |
| `map_broadcast_has_receivers` | Broadcast must have at least one receiver. | Trace | Warning / Error |

---

## 5. Observability Requirements  *(Normative)*

> See `map-events.md` for detailed event definitions.

### 5.1 Required Event Families

| Event Family | When Emitted | Minimal Payload Requirements |
|--------------|-------------|------------------------------|
| `MAPSessionStarted` | Session init | `session_id`, `mode` |
| `MAPRolesAssigned` | Role binding | `assignments` list |
| `MAPTurnDispatched` | Token issue | `initiator_role`, `token_id` |
| `MAPTurnCompleted` | Turn finish | `initiator_role`, `result` |
| `MAPSessionCompleted` | Session end | `final_status` |

### 5.2 Recommended / Optional Events

| Level | Event Family | Rationale |
|-------|--------------|-----------|
| Recommended | `MAPConflictDetected` | Essential for debugging parallel execution issues. |
| Recommended | `MAPBroadcastSent/Received` | Essential for `broadcast` mode observability. |

---

## 6. PSG & Runtime Behavior  *(Normative)*

### 6.1 PSG Read/Write Obligations

-   **Read Obligations**:
    -   MUST read `psg.collaboration_sessions` to determine current state.
    -   MUST read `psg.network_topology` to route messages.
-   **Write Obligations**:
    -   MUST write `psg.handoff_edges` to represent turn transfers.
    -   MUST update `Collab.status` and `Collab.messages`.

### 6.2 Cross-cutting Integration

-   **State Sync**: In `broadcast` mode, the Runtime MUST ensure eventual consistency of the shared context.
-   **Security**: The Runtime MUST enforce that only the holder of the **Execution Token** can modify shared state in `round_robin` mode.

---

## 7. Interaction with L2 Coordination & Governance  *(Normative)*

### 7.1 MAP + Modules

-   **MAP + Collab**: The central state container.
-   **MAP + Network**: Defines *who* can participate (Nodes).
-   **MAP + Role**: Defines *what* participants can do (Capabilities).
-   **MAP + Dialog**: The medium of communication (Messages).

### 7.2 Failure & Escalation Paths

-   **Participant Drop**: If a participant becomes unreachable (`Network` status), the MAP session SHOULD pause or reassign the role.
-   **Stalled Turn**: If a turn times out, the Runtime SHOULD revoke the token and emit a failure event.

---

## 8. Golden Flow Coverage  *(Informational)*

-   **MAP Profile is covered by:**
    -   `map-flow-01-turn-taking`: Validates `round_robin` mode and token transfer.
    -   `map-flow-02-broadcast-fanout`: Validates `broadcast` mode and parallel response.

---

## 9. Versioning & Compatibility  *(Normative)*

-   **Stability**: Stable (v1.0 Core).
-   **Compatibility**:
    -   Forward compatible.
    -   New collaboration modes (e.g., `swarm`) may be added in future versions without breaking existing modes.

---

## 10. Non-normative Implementation Notes

-   **Execution Token**: The "Token" is a logical concept in the Profile, often implemented as a lock or a specific field in the Runtime's memory, not necessarily a persistent schema object.
-   **Orchestrator**: In `orchestrated` mode, one agent (the Orchestrator) typically holds the token permanently and delegates sub-tasks via `Dialog` messages.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
