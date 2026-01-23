---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-MAP-EVENTS-001"
sidebar_position: 3

# UI metadata (non-normative; excluded from protocol semantics)
title: MAP Events
sidebar_label: MAP Events
description: "MPLP profile specification: MAP Events. Defines conformance requirements for execution profiles."
---

# MAP Events Specification

## Scope

This specification defines the mandatory and recommended events for the Multi-Agent Profile.

## Non-Goals

This specification does not define event processing logic or SDK implementations.


## 1. Purpose

This document specifies the **mandatory and recommended events** for the Multi-Agent (MAP) Profile. These events enable observability, turn tracking, and conflict resolution in multi-agent collaboration.

## 2. Event Families in Scope

The MAP Profile utilizes the following Event Families:

| Family | Usage | Primary Events |
|:---|:---|:---|
| `GraphUpdateEvent` | Session state | `MAPSessionStarted`, `MAPSessionCompleted` |
| `RuntimeExecutionEvent` | Turn flow | `MAPTurnDispatched`, `MAPTurnCompleted` |
| `CommunicationEvent` | Broadcasting | `MAPBroadcastSent`, `MAPBroadcastReceived` |
| `ConflictEvent` | State reconciliation | `MAPConflictDetected`, `MAPConflictResolved` |

## 3. Mandatory Events (Normative)

**Requirement Level**: MUST emit

### 3.1 Event Matrix

| Phase | Trigger | Event Type | Required Fields |
|:---|:---|:---|:---|
| Initialize | Session created | `MAPSessionStarted` | `session_id`, `mode`, `participant_count` |
| Assign | Roles assigned | `MAPRolesAssigned` | `session_id`, `assignments[]` |
| Dispatch | Turn issued | `MAPTurnDispatched` | `session_id`, `role_id`, `turn_number` |
| Execute | Turn done | `MAPTurnCompleted` | `session_id`, `role_id`, `status` |
| Complete | Session ends | `MAPSessionCompleted` | `session_id`, `status`, `turns_total` |

### 3.2 Event Flow by Mode

#### Orchestrated Mode

<MermaidDiagram id="0b027f043a41dd74" />

#### Broadcast Mode

<MermaidDiagram id="9d16c09133c9e02b" />

## 4. Recommended Events (Normative - SHOULD)

**Requirement Level**: SHOULD emit

| Scenario | Event Type | Rationale |
|:---|:---|:---|
| Fan-out | `MAPBroadcastSent` | Track distribution |
| Fan-in | `MAPBroadcastReceived` | Track responses |
| Concurrent write | `MAPConflictDetected` | State integrity |
| Resolution | `MAPConflictResolved` | Audit trail |
| Handoff | `MAPHandoffInitiated` | Agent transitions |

## 5. Event Schemas

### 5.1 MAPSessionStarted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440101",
  "event_type": "MAPSessionStarted",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "payload": {
    "mode": "orchestrated",
    "participant_count": 4,
    "purpose": "Code review pipeline"
  }
}
```

### 5.2 MAPRolesAssigned

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440102",
  "event_type": "MAPRolesAssigned",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:00:01.000Z",
  "payload": {
    "assignments": [
      { "participant_id": "p1", "role_id": "role-orchestrator", "kind": "agent" },
      { "participant_id": "p2", "role_id": "role-coder", "kind": "agent" },
      { "participant_id": "p3", "role_id": "role-reviewer", "kind": "agent" },
      { "participant_id": "p4", "role_id": "role-human", "kind": "human" }
    ]
  }
}
```

### 5.3 MAPTurnDispatched

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440103",
  "event_type": "MAPTurnDispatched",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:00:02.000Z",
  "initiator_role": "role-orchestrator",
  "target_roles": ["role-coder"],
  "payload": {
    "role_id": "550e8400-e29b-41d4-a716-446655440200",
    "turn_number": 1,
    "token_id": "550e8400-e29b-41d4-a716-446655440300"
  }
}
```

### 5.4 MAPTurnCompleted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440104",
  "event_type": "MAPTurnCompleted",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:05:00.000Z",
  "payload": {
    "role_id": "550e8400-e29b-41d4-a716-446655440200",
    "turn_number": 1,
    "result": {
      "status": "completed"
    }
  }
}
```

### 5.5 MAPBroadcastSent

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440105",
  "event_type": "MAPBroadcastSent",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:00:03.000Z",
  "initiator_role": "role-orchestrator",
  "target_roles": ["role-agent-a", "role-agent-b", "role-agent-c"],
  "payload": {
    "broadcaster_role_id": "role-orchestrator",
    "target_count": 3,
    "message": {
      "task": "Generate solution approaches"
    }
  }
}
```

### 5.6 MAPBroadcastReceived

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440106",
  "event_type": "MAPBroadcastReceived",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:00:45.000Z",
  "payload": {
    "receiver_role_id": "role-agent-a",
    "response": {
      "approach": "Use JWT with refresh tokens",
      "confidence": 0.85
    }
  }
}
```

### 5.7 MAPConflictDetected

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440107",
  "event_type": "MAPConflictDetected",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:10:00.000Z",
  "payload": {
    "conflict_id": "550e8400-e29b-41d4-a716-446655440400",
    "resource_type": "plan_step",
    "conflicting_roles": ["role-coder", "role-reviewer"],
    "conflict_type": "concurrent_modification"
  }
}
```

### 5.8 MAPConflictResolved

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440108",
  "event_type": "MAPConflictResolved",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:10:01.000Z",
  "payload": {
    "conflict_id": "550e8400-e29b-41d4-a716-446655440400",
    "resolution_strategy": "hierarchy",
    "winning_role": "role-reviewer"
  }
}
```

### 5.9 MAPSessionCompleted

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440109",
  "event_type": "MAPSessionCompleted",
  "session_id": "550e8400-e29b-41d4-a716-446655440100",
  "timestamp": "2025-12-07T00:30:00.000Z",
  "payload": {
    "status": "completed",
    "participants_count": 4,
    "turns_total": 12
  }
}
```

## 6. Module Mapping

| Module | Profile Action | Event Type |
|:---|:---|:---|
| Collab | Session Init | `MAPSessionStarted` |
| Collab | Role Binding | `MAPRolesAssigned` |
| Collab | Turn Handoff | `MAPTurnDispatched`, `MAPTurnCompleted` |
| Collab | Broadcast | `MAPBroadcastSent`, `MAPBroadcastReceived` |
| (Trace-level) | Conflict Detection | `MAPConflictDetected`, `MAPConflictResolved` |

## 7. Invariant Validation

### 7.1 Turn Completion Matching

**Invariant**: `map_turn_completion_matches_dispatch`

```typescript
function validateTurnCompletion(events: MAPEvent[]): ValidationResult {
  const dispatched = events.filter(e => e.event_type === 'MAPTurnDispatched');
  const completed = events.filter(e => e.event_type === 'MAPTurnCompleted');
  
  const errors: string[] = [];
  
  for (const dispatch of dispatched) {
    const match = completed.find(c => 
      c.session_id === dispatch.session_id &&
      c.payload.role_id === dispatch.payload.role_id &&
      c.payload.turn_number === dispatch.payload.turn_number
    );
    
    if (!match) {
      errors.push(`Turn ${dispatch.payload.turn_number} for ${dispatch.payload.role_id} has no completion`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 7.2 Broadcast Receiver Matching

**Invariant**: `map_broadcast_has_receivers`

```typescript
function validateBroadcastReceivers(events: MAPEvent[]): ValidationResult {
  const sent = events.filter(e => e.event_type === 'MAPBroadcastSent');
  const received = events.filter(e => e.event_type === 'MAPBroadcastReceived');
  
  const errors: string[] = [];
  
  for (const broadcast of sent) {
    // Match by session_id (per schema, both events have session_id)
    const receivers = received.filter(r => 
      r.session_id === broadcast.session_id
    );
    
    // Per schema: MAPBroadcastSent.payload has target_count
    const expectedCount = broadcast.payload.target_count || 0;
    if (receivers.length < expectedCount) {
      errors.push(`Broadcast in session ${broadcast.session_id} expected ${expectedCount} receivers, got ${receivers.length}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

## 8. Related Documents

**Profiles**:
- [MAP Profile](map-profile.md) - Full profile specification
- [SA Events](sa-events.md) - Single-agent events

**Schemas**:
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/events/mplp-event-core.schema.json`

---

**Profile**: MAP Profile  
**Mandatory Events**: 5  
**Recommended Events**: 5