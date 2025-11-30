# MAP Events (MPLP-MAP Profile v1.0)

**Version**: 1.0.0  
**Schema**: [`schemas/v2/events/mplp-map-event.schema.json`](../../schemas/v2/events/mplp-map-event.schema.json)  
**Last Updated**: 2025-11-30

---

## 1. Overview

MAP (Multi-Agent Profile) collaboration sessions emit a series of structured events throughout their lifecycle. These events:
- Conform to the `mplp-map-event.schema.json` JSON Schema
- Track multi-agent coordination state
- Enable observability for turn-taking, broadcast, and orchestrated patterns
- Integrate with Trace module for audit trails

All MAP events include:
- `event_id`: UUID
- `event_type`: Enum (9 types)
- `timestamp`: ISO 8601 datetime
- `session_id`: UUID (binds to Collab.collab_id)

---

## 2. Event Types

### 2.1 MAPSessionStarted

**Trigger**: New multi-agent collaboration session created  
**Lifecycle State**: `initialize_session`

**Key Fields**:
```json
{
  "event_type": "MAPSessionStarted",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:00.000Z",
  "payload": {
    "mode": "round_robin",
    "participant_count": 2
  }
}
```

**Purpose**: Marks the beginning of MAP session, identifies collaboration pattern.

---

### 2.2 MAPRolesAssigned

**Trigger**: Agent-to-role mappings completed  
**Lifecycle State**: `assign_roles`

**Key Fields**:
```json
{
  "event_type": "MAPRolesAssigned",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:01.000Z",
  "payload": {
    "assignments": [
      {"agent_id": "agent-a-uuid", "role_id": "planner-role-uuid"},
      {"agent_id": "agent-b-uuid", "role_id": "reviewer-role-uuid"}
    ]
  }
}
```

**Purpose**: Documents role distribution, establishes execution participants.

---

### 2.3 MAPTurnDispatched

**Trigger**: Execution token issued to a role (turn-taking pattern)  
**Lifecycle State**: `dispatch_turn`

**Key Fields**:
```json
{
  "event_type": "MAPTurnDispatched",
  "session_id": "collab-uuid",
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

**Purpose**: Grants execution right, starts agent's turn.

---

### 2.4 MAPTurnCompleted

**Trigger**: Agent completes turn, releases execution token  
**Lifecycle State**: `collect_results`

**Key Fields**:
```json
{
  "event_type": "MAPTurnCompleted",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:10.000Z",
  "initiator_role": "planner-role-uuid",
  "payload": {
    "role_id": "planner-role-uuid",
    "turn_number": 1,
    "result": {
      "status": "success",
      "output": "Plan created"
    }
  }
}
```

**Purpose**: Records turn outcome, enables token transfer to next role.

---

### 2.5 MAPBroadcastSent

**Trigger**: Agent broadcasts message/task to multiple targets  
**Lifecycle State**: `dispatch_turn` (broadcast pattern)

**Key Fields**:
```json
{
  "event_type": "MAPBroadcastSent",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:03.000Z",
  "initiator_role": "orchestrator-role-uuid",
  "target_roles": ["agent-a-role", "agent-b-role", "agent-c-role"],
  "payload": {
    "broadcaster_role_id": "orchestrator-role-uuid",
    "target_count": 3,
    "message": {
      "task": "Search for solution",
      "context": "..."
    }
  }
}
```

**Purpose**: Initiates parallel response collection in broadcast pattern.

---

### 2.6 MAPBroadcastReceived

**Trigger**: Target agent receives and responds to broadcast  
**Lifecycle State**: `collect_results` (broadcast pattern)

**Key Fields**:
```json
{
  "event_type": "MAPBroadcastReceived",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:05.000Z",
  "initiator_role": "agent-a-role",
  "payload": {
    "receiver_role_id": "agent-a-role",
    "response": {
      "status": "completed",
      "result": "Found 3 solutions"
    }
  }
}
```

**Purpose**: Records individual agent response, tracks broadcast completion.

**Note**: Multiple `MAPBroadcastReceived` events correspond to one `MAPBroadcastSent`.

---

### 2.7 MAPConflictDetected

**Trigger**: Concurrent modification conflict identified  
**Lifecycle State**: `resolve_conflicts`

**Key Fields**:
```json
{
  "event_type": "MAPConflictDetected",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:11.000Z",
  "payload": {
    "conflict_type": "concurrent_write",
    "affected_roles": ["role-a-uuid", "role-b-uuid"],
    "resource": "shared-plan-id"
  }
}
```

**Purpose**: Signals need for conflict resolution, enables debugging.

---

### 2.8 MAPConflictResolved

**Trigger**: Conflict resolution completed  
**Lifecycle State**: `resolve_conflicts`

**Key Fields**:
```json
{
  "event_type": "MAPConflictResolved",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:12.000Z",
  "payload": {
    "resolution_strategy": "last_writer_wins",
    "winner_role": "role-b-uuid"
  }
}
```

**Purpose**: Documents resolution outcome, maintains audit trail.

---

### 2.9 MAPSessionCompleted

**Trigger**: All turns/broadcasts complete, session终止  
**Lifecycle State**: `complete_session`

**Key Fields**:
```json
{
  "event_type": "MAPSessionCompleted",
  "session_id": "collab-uuid",
  "timestamp": "2025-11-30T12:00:15.000Z",
  "payload": {
    "total_turns": 3,
    "total_agents": 2,
    "duration_ms": 15000,
    "final_status": "completed"
  }
}
```

**Purpose**: Marks successful session termination, provides summary metrics.

---

## 3. Relationship to Trace Module

All MAP events are written to the Trace module's event stream. The Trace structure:

```json
{
  "trace_id": "uuid",
  "context_id": "uuid",
  "collab_id": "uuid",  // binds to MAP session
  "events": [
    { "event_type": "MAPSessionStarted", ... },
    { "event_type": "MAPRolesAssigned", ... },
    { "event_type": "MAPTurnDispatched", ... },
    { "event_type": "MAPTurnCompleted", ... },
    { "event_type": "MAPSessionCompleted", ... }
  ]
}
```

**ID Binding**:
- `session_id` in MAP event == `collab_id` in Trace
- `context_id` in Trace provides cross-module linkage

---

## 4. Usage in MAP Minimal Flows

### map-flow-01-turn-taking
Expected event sequence (2-agent, 3 turns):
1. MAPSessionStarted
2. MAPRolesAssigned (planner, reviewer)
3. MAPTurnDispatched (Turn 1: planner)
4. MAPTurnCompleted (Turn 1: planner)
5. MAPTurnDispatched (Turn 2: reviewer)
6. MAPTurnCompleted (Turn 2: reviewer)
7. MAPTurnDispatched (Turn 3: planner)
8. MAPTurnCompleted (Turn 3: planner)
9. MAPSessionCompleted

### map-flow-02-broadcast-fanout
Expected event sequence (1 broadcaster, 3 responders):
1. MAPSessionStarted
2. MAPRolesAssigned (orchestrator + 3 agents)
3. MAPBroadcastSent
4. MAPBroadcastReceived (Agent A)
5. MAPBroadcastReceived (Agent B)
6. MAPBroadcastReceived (Agent C)
7. MAPSessionCompleted

---

## 5. Event Design Principles

**Simplicity**: MAP events track coordination, not execution details (use SA events for that)

**Composability**: MAP events reference Collab/Role/Network objects (don't duplicate their data)

**Observability**: Every lifecycle state transition emits an event

**Auditability**: Event timestamps + session_id enable full session replay

---

**End of MAP Events Documentation**

*MAP events provide structured observability for multi-agent collaboration patterns in MPLP v1.0.*
