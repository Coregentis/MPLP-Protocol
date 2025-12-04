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
## 1. Event Families in Scope

The MAP Profile utilizes the following Event Families from the MPLP Event Taxonomy:

-   **`GraphUpdateEvent`**: Used for session state changes (`MAPSessionStarted`, `MAPSessionCompleted`).
-   **`RuntimeExecutionEvent`**: Used for turn-taking and execution flow (`MAPTurnDispatched`, `MAPTurnCompleted`).
-   **`CommunicationEvent`**: Used for broadcast patterns (`MAPBroadcastSent`, `MAPBroadcastReceived`).
-   **`ConflictEvent`**: Used for state reconciliation (`MAPConflictDetected`, `MAPConflictResolved`).

---

## 2. Mandatory Events by Lifecycle Phase  *(Normative)*

The Runtime MUST emit the following events during the MAP execution lifecycle.

| Phase | Trigger | Required Event Type | Notes |
|-------|---------|---------------------|-------|
| `initialize_session` | Session creation | `MAPSessionStarted` | Must include `session_id`, `mode`. |
| `assign_roles` | Roles assigned | `MAPRolesAssigned` | Must include assignment list. |
| `dispatch_turn` | Token issue | `MAPTurnDispatched` | Required in `round_robin` / `orchestrated`. |
| `collect_results` | Turn finish | `MAPTurnCompleted` | Required in `round_robin` / `orchestrated`. |
| `complete_session` | Session end | `MAPSessionCompleted` | Summary metrics. |

---

## 3. Recommended Events  *(Normative - level: SHOULD)*

| Scenario | Event Type | Rationale |
|----------|------------|-----------|
| Broadcast Mode | Message sent to all | `MAPBroadcastSent` | Critical for tracking fan-out. |
| Broadcast Mode | Response received | `MAPBroadcastReceived` | Critical for tracking fan-in. |
| Conflict | Concurrent write | `MAPConflictDetected` | Essential for state integrity. |
| Conflict | Resolution applied | `MAPConflictResolved` | Audit trail for data changes. |

---

## 4. Mapping to Modules  *(Normative)*

| Module | Profile Action | Event Type |
|--------|----------------|------------|
| **Collab** | Session Init | `MAPSessionStarted` |
| **Collab** | Role Binding | `MAPRolesAssigned` |
| **Collab** | Turn Handoff | `MAPTurnDispatched`, `MAPTurnCompleted` |
| **Network** | Broadcast | `MAPBroadcastSent` |

---

## 5. Non-normative Examples

> **Note**: These examples are illustrative. See `schemas/v2/events/mplp-map-event.schema.json` for validation.

### 5.1 Turn Dispatch Example

```json
{
  "event_type": "MAPTurnDispatched",
  "session_id": "collab-uuid-123",
  "timestamp": "2025-11-30T12:00:02.000Z",
  "initiator_role": "coordinator-role-uuid",
  "target_roles": ["planner-role-uuid"],
  "payload": {
    "role_id": "planner-role-uuid",
    "turn_number": 1,
    "token_id": "token-uuid"
  }
}
```

### 5.2 Broadcast Example

```json
{
  "event_type": "MAPBroadcastSent",
  "session_id": "collab-uuid-123",
  "timestamp": "2025-11-30T12:00:03.000Z",
  "initiator_role": "orchestrator-role-uuid",
  "target_roles": ["agent-a", "agent-b"],
  "payload": {
    "message": { "task": "Search" }
  }
}
```
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
