# MPLP-MAP Profile v1.0

**Version**: 1.0.0  
**Status**: Specification  
**Last Updated**: 2025-11-30

---

## 1. Overview

**MAP (Multi-Agent Profile)** defines the multi-agent collaboration semantics for MPLP v1.0. It bridges L2 protocol modules (Collab, Network, Role, Dialog) and L3 runtime implementations by specifying:
- Session lifecycle management
- Role assignment and execution token mechanism
- Collaboration patterns (turn-taking, broadcast, orchestrated)
- Conflict detection and resolution semantics

MAP Profile complements SA Profile: **SA = single agent execution**, **MAP = multi-agent coordination**.

---

## 2. Responsibilities

MAP instances are responsible for:

1. **Session Initialization**: Create collaboration session, bind to Context
2. **Role Assignment**: Map agents to roles using Collab.participants
3. **Turn Dispatch**: Distribute execution tokens to active roles
4. **Result Collection**: Gather outcomes from agent executions
5. **Conflict Resolution**: Detect and resolve concurrent modification conflicts
6. **State Broadcasting**: Synchronize updated state across participants
7. **Session Completion**: Terminate collaboration and finalize results

**What MAP is NOT**:
- ❌ **Not an execution engine** (MAP coordinates, doesn't execute Plan steps)
- ❌ **Not a message broker** (uses Network/Dialog modules for communication)
- ❌ **Not a consensus algorithm** (MAP patterns are simpler: turn-taking, broadcast, orchestration)

---

## 3. Session Lifecycle

MAP sessions follow a 7-state lifecycle:

```
initialize_session → assign_roles → dispatch_turn → collect_results 
  → resolve_conflicts → broadcast_updates → [dispatch_turn OR complete_session]
```

### 3.1 State Definitions

| State | Description | Entry Condition | Exit Condition |
|-------|-------------|-----------------|----------------|
| **initialize_session** | Create Collab object, bind Context | MAP instantiation | Collab created |
| **assign_roles** | Map agents to roles via participants[] | Session initialized | All roles assigned |
| **dispatch_turn** | Issue execution token to active role | Roles assigned OR previous turn complete | Token issued, agent begins execution |
| **collect_results** | Wait for agent to complete turn | Agent executing | Agent signals completion |
| **resolve_conflicts** | Check for state conflicts | Results collected | Conflicts resolved (or none detected) |
| **broadcast_updates** | Send state updates to all participants | Conflicts resolved | Updates sent |
| **complete_session** | Finalize session, set Collab.status=completed | Final broadcast done | Session terminated |

### 3.2 State Machine Visualization

See [`diagrams/map-collaboration.mmd`](diagrams/map-collaboration.mmd) for complete state machine diagram.

---

## 4. Execution Token & Role Dispatch

### 4.1 Execution Token Structure

**Concept**: Execution token is a **Profile-layer abstraction** (not a field in Collab/Network/Role schemas) representing the right to modify shared state.

**Logical Structure**:
```yaml
execution_token:
  token_id: "uuid-v4"
  holder_role_id: "role-uuid"  # Currently authorized role
  issued_at: "2025-11-30T12:00:00.000Z"
  expires_at: "2025-11-30T12:05:00.000Z"  # Optional timeout
```

**Purpose**: Prevent concurrent writes in turn-taking scenarios.

### 4.2 Token Transfer Mechanism

**Turn-Taking Pattern**:
1. MAP issues token to Role A
2. Role A's agent executes assigned task  
3. Agent signals completion
4. MAP revokes token from Role A
5. MAP issues token to Role B (next in sequence)

**Events Emitted**:
- `MAPTurnDispatched`: Token issued to role
- `MAPTurnCompleted`: Token released by role

**Broadcast Pattern**:
- No token (all agents respond in parallel)
- Synchronization via `MAPBroadcastSent` / `MAPBroadcastReceived` events

---

## 5. Collaboration Patterns

### 5.1 Turn-Taking (`round_robin`)

**Definition**: Agents execute sequentially, one at a time.

**Collab Mapping**: `Collab.mode = "round_robin"`

**Execution Flow**:
```
Agent A (planner) → Agent B (reviewer) → Agent A (reviser) → complete
```

**Token Behavior**: Exclusive - only token holder can modify state

**Example Use Case**: Code review workflow (writer → reviewer → merger)

---

### 5.2 Broadcast Fan-out (`broadcast`)

**Definition**: One agent broadcasts task/context, multiple agents respond.

**Collab Mapping**: `Collab.mode = "broadcast"`

**Execution Flow**:
```
Orchestrator (broadcasts) → [Agent A, Agent B, Agent C] (parallel response) → Orchestrator (aggregates)
```

**Token Behavior**: None (parallel execution, conflict resolution via timestamps)

**Example Use Case**: Distributed search (one query, multiple searchers)

---

### 5.3 Orchestrated (`orchestrated`)

**Definition**: Central coordinator dispatches tasks, collects results.

**Collab Mapping**: `Collab.mode = "orchestrated"`

**Execution Flow**:
```
Coordinator (assigns subtasks) → Agents (execute) → Coordinator (aggregates) → complete
```

**Token Behavior**: Coordinator holds token, delegates work

**Example Use Case**: MapReduce-style workflows

---

## 6. Interaction with L2 Modules

### 6.1 Collab Module
- **Direction**: Read + Write
- **Fields Used**:
  - `collab_id`: Session identifier
  - `mode`: Collaboration pattern (`round_robin`, `broadcast`, `orchestrated`)
  - `participants[]`: Agent-to-role mappings
    - `participant_id`: Agent identifier
    - `role_id`: Role assignment
    - `kind`: Agent type (agent, human, system)
  - `status`: Session state (draft, active, completed)
- **Usage**: MAP creates Collab at session start, updates participants/status throughout lifecycle

### 6.2 Network Module
- **Direction**: Read-only
- **Fields Used**:
  - `network_id`: Network identifier
  - `topology_type`: Agent distribution pattern
  - `nodes[]`: Agent nodes
- **Usage**: MAP queries Network to understand agent topology for broadcast/fanout patterns

### 6.3 Role Module
- **Direction**: Read-only
- **Fields Used**:
  - `role_id`: Role identifier
  - `name`: Role name (planner, reviewer, orchestrator)
  - `capabilities[]`: Permission tags
- **Usage**: MAP validates role assignments, checks capabilities before token dispatch

### 6.4 Dialog Module (Optional)
- **Direction**: Read-only
- **Fields Used**:
  - `thread_id`: Conversation thread
  - `messages[]`: Communication history
- **Usage**: MAP may reference Dialog for multi-turn conversation context

---

## 7. Event Chain & Observability

MAP emits structured events throughout session lifecycle. All events conform to [`schemas/v2/events/mplp-map-event.schema.json`](../../schemas/v2/events/mplp-map-event.schema.json).

**Standard Event Sequence (Turn-Taking)**:
```
MAPSessionStarted
  ↓
MAPRolesAssigned
  ↓
MAPTurnDispatched (Role A)
  ↓
MAPTurnCompleted (Role A)
  ↓
MAPTurnDispatched (Role B)
  ↓
MAPTurnCompleted (Role B)
  ↓
MAPSessionCompleted
```

**Standard Event Sequence (Broadcast)**:
```
MAPSessionStarted
  ↓
MAPRolesAssigned
  ↓
MAPBroadcastSent
  ↓
MAPBroadcastReceived (Agent A)
MAPBroadcastReceived (Agent B)
MAPBroadcastReceived (Agent C)
  ↓
MAPSessionCompleted
```

**Event Details**: See [`map-events.md`](map-events.md) for complete event type specifications.

---

## 8. Invariants

MAP execution must satisfy the following invariants (defined in [`schemas/v2/invariants/map-invariants.yaml`](../../schemas/v2/invariants/map-invariants.yaml)):

1. **Session Requires Multiple Roles**: Collab.participants must have min-length 2
2. **Mode Matches Pattern**: Collab.mode must be valid enum (broadcast, round_robin, orchestrated)
3. **Role Binding**: All participant.role_id must reference valid Role objects
4. **Turn Completion**: Every MAPTurnDispatched must have corresponding MAPTurnCompleted
5. **Broadcast Receivers**: MAPBroadcastSent must have ≥1 MAPBroadcastReceived

These invariants are validated by Golden Test harness using standard MPLP invariant rules.

---

## 9. Minimal Flows

MAP Profile is validated by two Golden Flows:

### 9.1 map-flow-01-turn-taking
- **Purpose**: Two-agent sequential collaboration
- **Pattern**: round_robin
- **Validates**:
  - Role assignment (planner, reviewer)
  - Execution token transfer
  - Turn-based state updates
- **Location**: `tests/golden/flows/map-flow-01-turn-taking/`

### 9.2 map-flow-02-broadcast-fanout
- **Purpose**: Broadcast + multi-agent response
- **Pattern**: broadcast
- **Validates**:
  - Broadcast message dispatch
  - Parallel response collection
  - Result aggregation
- **Location**: `tests/golden/flows/map-flow-02-broadcast-fanout/`

**Note**: MAP flows are **Profile-level examples**, not part of v1.0 compliance boundary (FLOW-01~05 remain authoritative).

---

## 10. Relationship to SA Profile

| Aspect | SA Profile | MAP Profile |
|--------|-----------|-------------|
| **Scope** | Single agent | Multi-agent |
| **Lifecycle** | 6 states (initialize → complete) | 7 states (initialize_session → complete_session) |
| **Coordination** | None (isolated execution) | Turn-taking, broadcast, orchestration |
| **Token** | Implicit (agent owns execution) | Explicit (token grants execution right) |
| **L2 Dependencies** | Context, Plan, Trace | Collab, Network, Role, (Dialog) |
| **Use Cases** | Independent task execution | Collaborative workflows |

**Integration**: MAP sessions can contain multiple SA executions (each agent runs SA internally while MAP coordinates externally).

---

## 11. References

- [MPLP v1.0 Specification](../01-spec/README.md) - Core protocol
- [SA Profile](mplp-sa-profile.md) - Single-agent execution
- [MAP Events](map-events.md) - Complete event reference
- [MAP Invariants](../../schemas/v2/invariants/map-invariants.yaml) - Runtime invariants
- [MAP Event Schema](../../schemas/v2/events/mplp-map-event.schema.json) - Event validation

---

**End of MPLP-MAP Profile v1.0**

*MAP Profile defines multi-agent collaboration semantics for MPLP. Combined with SA Profile, it provides complete execution patterns for both independent and collaborative agent operations.*
