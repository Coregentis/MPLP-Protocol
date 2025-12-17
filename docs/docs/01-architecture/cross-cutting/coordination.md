---
title: Coordination
description: Multi-agent coordination patterns in MPLP including broadcast,
  round-robin, orchestrated, swarm, and pair modes. Covers turn-taking,
  handoffs, and MAP Profile invariants.
keywords:
  - coordination
  - multi-agent
  - MAP Profile
  - broadcast
  - round-robin
  - orchestrated
  - turn-taking
  - agent handoff
  - collab
sidebar_label: Coordination
doc_status: normative
doc_role: normative_spec
protocol_version: 1.0.0
spec_level: CrossCutting
normative_id: MPLP-CC-COORD
permalink: /architecture/cross-cutting/coordination
cross_cutting:
  - coordination
normative_refs: []
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-collab.schema.json
      binding: manual
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-confirm.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
sidebar_position: 5
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Coordination

## 1. Purpose

**Coordination** is the cross-cutting concern that governs how multiple agents collaborate, share state, and transfer control within an MPLP project. Unlike single-agent execution (SA Profile), coordination enables complex multi-agent workflows where different roles (architect, coder, reviewer) work together on the same project.

**Key Responsibilities**:
- Define multi-agent collaboration patterns (broadcast, round-robin, orchestrated, swarm, pair)
- Manage agent turn-taking and handoffs
- Ensure exclusive write access during turns
- Maintain shared context across all agents
- Prevent conflicts via coordination protocols

**Design Principle**: "Many agents, one truth" - all agents work on the same PSG with controlled access

## 2. MAP Profile Foundation

Coordination is primarily relevant to the **MAP (Multi-Agent Profile)**, which is **RECOMMENDED** for v1.0 compliance (vs. SA which is REQUIRED).

**From**: `schemas/v2/invariants/map-invariants.yaml` (9 rules)

### 2.1 Core MAP Invariants

| ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `map_session_requires_multiple_participants` | collab | `participants` | min-length(2) | MAP sessions require  participants |
| `map_collab_mode_valid` | collab | `mode` | enum(broadcast, round_robin, orchestrated, swarm, pair) | Valid collaboration pattern |
| `map_session_id_is_uuid` | collab | `collab_id` | uuid-v4 | Session ID must be UUID v4 |
| `map_participants_have_role_ids` | collab | `participants[*].role_id` | non-empty-string | All participants need role bindings |
| `map_role_ids_are_uuids` | collab | `participants[*].role_id` | uuid-v4 | All role_ids must be UUID v4 |
| `map_participant_ids_are_non_empty` | collab | `participants[*].participant_id` | non-empty-string | Participant IDs must be non-empty |
| `map_participant_kind_valid` | collab | `participants[*].kind` | enum(agent, human, system, external) | Valid participant kind |

**Event Consistency Rules** (2 descriptive):
- `map_turn_completion_matches_dispatch`: Every MAPTurnDispatched MAPTurnCompleted
- `map_broadcast_has_receivers`: MAPBroadcastSent ? MAPBroadcastReceived

**Total**: 9 rules (7 structural + 2 event-based)

## 3. Five Coordination Modes

**From**: `schemas/v2/mplp-collab.schema.json` (lines 58-64)

```json
{
  "mode": {
    "type": "string",
    "enum": ["broadcast", "round_robin", "orchestrated", "swarm", "pair"]
  }
}
```

### 3.1 Broadcast Mode

**Pattern**: One-to-many parallel task distribution

**Characteristics**:
- **Turn-Taking**: No turns, all agents work simultaneously
- **Determinism**: Non-deterministic (race conditions possible)
- **Communication**: Central coordinator All workers
- **Best For**: Independent parallel tasks

**Use Case**: Refactor 10 files simultaneously
- Architect creates Plan with 10 parallel steps
- Coordinator broadcasts to 10 Worker agents
- Each worker handles one file
- Results merged back to PSG

**Implementation** (from deep-dive doc):
```python
async def broadcast_coordination(collab_session, plan, ael):
  assert collab_session.mode == "broadcast"
  assert len(collab_session.participants) >= 2
  
  # Get parallel steps (no dependencies)
  parallel_steps = [
    step for step in plan.steps 
    if len(step.dependencies) == 0
  ]
  
  # Dispatch turns to all participants
  turn_ids = []
  for step in parallel_steps:
    participant = next(
      p for p in collab_session.participants 
      if p.role_id == step.agent_role
    )
    
    # Emit MAPTurnDispatched event
    turn_id = uuid.v4()
    emit_event({
      "event_family": "external_integration",
      "event_type": "map_turn_dispatched",
      "session_id": collab_session.collab_id,
      "turn_id": turn_id,
      "participant_id": participant.participant_id,
      "step_id": step.step_id
    })
    turn_ids.append(turn_id)
  
  # Parallel execution
  results = await asyncio.gather(*[
    ael.execute({
      "type": "agent_execution",
      "participant_id": p.participant_id,
      "context": {...}
    })
    for p in matching_participants
  ])
  
  # Validate turn completion (MAP invariant)
  for turn_id in turn_ids:
    assert received_turn_completed_event(turn_id), \
      f"MAP invariant violated: turn {turn_id} did not complete"
  
  # Merge results into PSG
  for step, result in zip(parallel_steps, results):
    step.status = "completed"
    step.output = result
    update_psg_node(step)
```

**Trade-offs**:
- Maximum parallelism
- Fast completion
- Merge conflicts possible
- Requires conflict resolution strategy

### 3.2 Round-Robin Mode

**Pattern**: Sequential ordered turn-taking

**Characteristics**:
- **Turn-Taking**: Strict sequential turns
- **Determinism**: Deterministic (predictable order)
- **Communication**: Agent N Agent N+1
- **Best For**: Ordered pipeline (Planner Coder Reviewer)

**Use Case**: Sequential refinement workflow
1. **Architect** (turn 1): Creates high-level design
2. **Coder** (turn 2): Implements design
3. **Reviewer** (turn 3): Reviews code
4. **Tester** (turn 4): Runs tests
5. **Deployer** (turn 5): Deploys to staging

**Implementation** (from deep-dive doc):
```python
async def round_robin_coordination(collab_session, plan, ael):
  assert collab_session.mode == "round_robin"
  assert len(collab_session.participants) >= 2
  
  # Execute steps in strict order
  for step in topological_sort(plan.steps):
    # Find next participant in round-robin order
    current_turn = step.order_index % len(collab_session.participants)
    participant = collab_session.participants[current_turn]
    
    # Execute step
    result = await ael.execute({
      "type": "agent_execution",
      "participant_id": participant.participant_id,
      "step": step
    })
    
    # Update PSG
    step.status = "completed"
    step.executed_by = participant.participant_id
    update_psg_node(step)
```

**Trade-offs**:
- Predictable execution order
- No merge conflicts
- Clear responsibility chain
- Slower (sequential bottleneck)
- Idle agents waiting for turn

### 3.3 Orchestrated Mode

**Pattern**: Centralized coordinator with dynamic dispatch

**Characteristics**:
- **Turn-Taking**: Coordinator decides who goes next
- **Determinism**: Deterministic (coordinator logic)
- **Communication**: All agents Coordinator
- **Best For**: Complex workflows with conditional branching

**Use Case**: Adaptive bug-fixing workflow
```
Coordinator logic:
1. Debugger investigates finds root cause
2. IF (root_cause == "config"):
     ConfigExpert fixes
   ELIF (root_cause == "code"):
     Coder fixes
   ELSE:
     Architect redesigns
3. Tester validates fix
4. IF (tests fail):
     GOTO step 2  // Retry
   ELSE:
     Deployer releases
```

**Implementation**:
```typescript
class OrchestrationCoordinator {
  async coordinateSession(session: CollabSession, plan: Plan): Promise<void> {
    let currentStep = 0;
    
    while (currentStep < plan.steps.length) {
      const step = plan.steps[currentStep];
      
      // Coordinator decides next agent based on context
      const nextAgent = this.selectAgent(step, session, plan.context);
      
      // Dispatch turn
      const turn = await this.dispatchTurn(nextAgent, step);
      
      // Wait for completion
      await this.waitForTurnCompletion(turn.turn_id);
      
      // Coordinator evaluates result
      const evaluation = await this.evaluateResult(turn.result);
      
      if (evaluation.success) {
        currentStep++;  // Proceed to next step
      } else if (evaluation.should_retry) {
        // Retry same step (possibly with different agent)
        continue;
      } else {
        // Escalate to different agent
        const escalation = await this.escalate(step, evaluation);
        currentStep = escalation.next_step_index;
      }
    }
  }
  
  private selectAgent(
    step: Step,
    session: CollabSession,
    context: Context
  ): Participant {
    // Intelligent agent selection logic
    if (step.requires_expertise === "security") {
      return session.participants.find(p => p.role_id === "security-expert");
    } else if (context.complexity === "high") {
      return session.participants.find(p => p.capabilities.includes("senior-architect"));
    } else {
      return session.participants[0];  // Default
    }
  }
}
```

**Trade-offs**:
- Maximum flexibility
- Adaptive to context
- Complex workflows possible
- Coordinator is single point of failure
- Coordinator logic complexity

### 3.4 Swarm Mode

**Pattern**: Self-organizing emergent collaboration

**Characteristics**:
- **Turn-Taking**: Emergent, no fixed order
- **Determinism**: Non-deterministic (emergent behavior)
- **Communication**: Peer-to-peer
- **Best For**: Decentralized problem-solving, exploration

**Use Case**: Brainstorming architectural solutions
- Multiple Architect agents propose different designs
- Agents critique each other's proposals
- Best design emerges through consensus
- No central coordinator

**Implementation** (conceptual):
```python
async def swarm_coordination(collab_session, plan):
  # Agents self-organize
  proposals = []
  
  # Phase 1: All agents propose solutions
  for participant in collab_session.participants:
    proposal = await participant.propose_solution(plan.objective)
    proposals.append(proposal)
  
  # Phase 2: Agents vote on proposals
  votes = {}
  for participant in collab_session.participants:
    participant_votes = await participant.evaluate_proposals(proposals)
    for proposal_id, score in participant_votes.items():
      votes[proposal_id] = votes.get(proposal_id, 0) + score
  
  # Phase 3: Select winning proposal
  winning_proposal = max(votes, key=votes.get)
  
  # Phase 4: Collaborative refinement
  final_design = await collaborative_refine(
    winning_proposal,
    collab_session.participants
  )
  
  return final_design
```

**Trade-offs**:
- No single point of failure
- Diverse perspectives
- Creative solutions
- Hard to predict outcome
- May not converge
- Complex to implement

### 3.5 Pair Mode

**Pattern**: 1:1 focused collaboration

**Characteristics**:
- **Turn-Taking**: Alternating turns between 2 agents
- **Determinism**: Deterministic (turn alternation)
- **Communication**: Bidirectional peer-to-peer
- **Best For**: Paired programming, focused review

**Use Case**: Pair programming session
- **Driver** (Coder): Writes code
- **Navigator** (Reviewer): Reviews in real-time
- Alternates every 15 minutes or per function

**Implementation**:
```typescript
async function pairCoordination(
  session: CollabSession,
  plan: Plan
): Promise<void> {
  assert(session.participants.length === 2, "Pair mode requires exactly 2 participants");
  
  const [driver, navigator] = session.participants;
  let currentDriver = driver;
  let currentNavigator = navigator;
  
  for (const step of plan.steps) {
    // Driver implements
    const implementation = await executeAgentTurn(currentDriver, step);
    
    // Navigator reviews
    const review = await executeAgentTurn(currentNavigator, {
      action: "review",
      target: implementation
    });
    
    if (review.approved) {
      step.status = "completed";
      step.output = implementation;
    } else {
      // Retry with feedback
      const revised = await executeAgentTurn(currentDriver, {
        action: "revise",
        feedback: review.comments
      });
      step.output = revised;
    }
    
    // Swap roles for next iteration
    [currentDriver, currentNavigator] = [currentNavigator, currentDriver];
  }
}
```

**Trade-offs**:
- High quality (real-time review)
- Knowledge sharing
- Simple coordination
- Slower than solo
- Limited to 2 agents

## 4. Normative Definitions

### 4.1 Turn

**Definition**: A discrete period where a single agent has exclusive write access to specific Plan nodes

**Properties**:
- `turn_id`: UUID v4
- `session_id`: UUID v4 (references CollabSession)
- `participant_id`: String (agent identifier)
- `step_id`: UUID v4 (which step this turn executes)
- `start_time`: ISO 8601 timestamp
- `end_time`: ISO 8601 timestamp (optional, null if active)
- `status`: {pending, active, completed, failed, cancelled}

**Lifecycle**:
```
pending active (completed | failed | cancelled)
```

### 4.2 Handoff

**Definition**: The atomic transfer of control from one agent to another

**Atomicity Requirement**: Handoffs **MUST** be atomicontrol cannot be lost or duplicated

**Implementation** (atomic handoff):
```typescript
async function atomicHandoff(
  from: Participant,
  to: Participant,
  session: CollabSession,
  vsl: VSL
): Promise<void> {
  const tx = await vsl.beginTransaction();
  
  try {
    // 1. Validate current agent
    const activeAgent = await vsl.readNode('CollabSession', session.collab_id, tx);
    if (activeAgent.current_participant_id !== from.participant_id) {
      throw new Error("Only active agent can initiate handoff");
    }
    
    // 2. Update session state (atomic)
    activeAgent.current_participant_id = to.participant_id;
    activeAgent.last_handoff_time = new Date().toISOString();
    await vsl.writeNode('CollabSession', session.collab_id, activeAgent, tx);
    
    // 3. Emit event
    await vsl.appendEvent({
      event_family: "external_integration",
      event_type: "map_handoff_completed",
      payload: {
        session_id: session.collab_id,
        from_participant: from.participant_id,
        to_participant: to.participant_id
      }
    }, tx);
    
    // 4. Commit transaction
    await vsl.commitTransaction(tx);
  } catch (error) {
    await vsl.rollbackTransaction(tx);
    throw new Error(`Handoff failed: ${error.message}`);
  }
}
```

### 4.3 Broadcast

**Definition**: A message sent from Orchestrator to multiple agents simultaneously

**Properties**:
- `broadcast_id`: UUID v4
- `session_id`: UUID v4
- `sender`: "orchestrator"
- `recipients[]`: Array of participant IDs
- `message_type`: {task_assignment, status_update, session_control}
- `payload`: Message-specific data

**Example**:
```json
{
  "broadcast_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "collab-123",
  "sender": "orchestrator",
  "recipients": ["agent-1", "agent-2", "agent-3"],
  "message_type": "task_assignment",
  "payload": {
    "plan_id": "plan-456",
    "step_assignments": [
      { "step_id": "step-1", "assigned_to": "agent-1" },
      { "step_id": "step-2", "assigned_to": "agent-2" },
      { "step_id": "step-3", "assigned_to": "agent-3" }
    ]
  }
}
```

## 5. Normative Requirements (MUST/SHALL)

### 5.1 Exclusive Write Access

**Requirement**: During a Turn, the active agent **MUST** have exclusive write access to the relevant Plan nodes

**Why**: Prevent concurrent modifications that could corrupt PSG

**Enforcement** (pessimistic locking):
```typescript
class TurnBasedPSG {
  private activeTurns = new Map<string, string>();  // step_id participant_id
  
  async acquireStepLock(
    step_id: string,
    participant_id: string
  ): Promise<boolean> {
    // Check if step is already locked
    const currentOwner = this.activeTurns.get(step_id);
    if (currentOwner && currentOwner !== participant_id) {
      return false;  // Lock held by another agent
    }
    
    // Acquire lock
    this.activeTurns.set(step_id, participant_id);
    return true;
  }
  
  async releaseStepLock(step_id: string): Promise<void> {
    this.activeTurns.delete(step_id);
  }
  
  async writeStep(
    step: Step,
    participant_id: string
  ): Promise<void> {
    // Verify lock ownership
    const owner = this.activeTurns.get(step.step_id);
    if (owner !== participant_id) {
      throw new Error(`Participant ${participant_id} does not own lock for step ${step.step_id}`);
    }
    
    // Write allowed
    await this.psg.updateNode(step);
  }
}
```

### 5.2 Atomic Handoff

**Requirement**: Handoffs **MUST** be atomic; control cannot be lost or duplicated

**Why**: Prevent race conditions where multiple agents believe they are active

**Verification**:
```typescript
// Test: Concurrent handoff attempts
async function testAtomicHandoff() {
  const session = createCollabSession({
    participants: [agent1, agent2, agent3],
    current_participant: agent1.participant_id
  });
  
  // Attempt concurrent handoffs
  const results = await Promise.allSettled([
    handoff(agent1, agent2, session),  // Should succeed
    handoff(agent1, agent3, session)   // Should fail (not owner)
  ]);
  
  // Exactly one should succeed
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  assert(succeeded === 1, "Exactly one handoff must succeed");
  
  // Verify final state
  const finalSession = await vsl.get(`collabs/${session.collab_id}`);
  assert(
    finalSession.current_participant_id === agent2.participant_id ||
    finalSession.current_participant_id === agent3.participant_id,
    "Session must have exactly one active participant"
  );
}
```

### 5.3 Shared Project Context

**Requirement**: All coordinating agents **MUST** share the same Project Context

**Why**: Agents must have consistent view of project scope, constraints, environment

**Implementation**:
```typescript
class CoordinationRuntime {
  async startCollabSession(
    context_id: string,
    participants: Participant[]
  ): Promise<CollabSession> {
    // Load shared context
    const context = await this.vsl.readNode('Context', context_id);
    
    // Verify all participants can access context
    for (const participant of participants) {
      const hasAccess = await this.checkContextAccess(participant, context);
      if (!hasAccess) {
        throw new Error(`Participant ${participant.participant_id} lacks access to context ${context_id}`);
      }
    }
    
    // Create session with shared context reference
    const session: CollabSession = {
      collab_id: generateUUID(),
      context_id: context_id,  // Shared reference
      mode: "round_robin",
      participants: participants,
      status: "active",
      created_at: new Date().toISOString()
    };
    
    await this.vsl.writeNode('CollabSession', session.collab_id, session);
    return session;
  }
}
```

## 6. Collab Module Schema

**From**: `schemas/v2/mplp-collab.schema.json`

### 6.1 Core Fields

```json
{
  "collab_id": "uuid-v4",
  "context_id": "uuid-v4",
  "title": "Refactor Auth Module",
  "purpose": "Modernize authentication system",
  "mode": "orchestrated",
  "status": "active",
  "participants": [
    {
      "participant_id": "agent-1",
      "role_id": "architect-role-uuid",
      "kind": "agent",
      "capabilities": ["design", "review"]
    },
    {
      "participant_id": "agent-2",
      "role_id": "coder-role-uuid",
      "kind": "agent",
      "capabilities": ["implement", "test"]
    }
  ],
  "created_at": "2025-12-07T00:00:00.000Z",
  "updated_at": "2025-12-07T01:00:00.000Z"
}
```

### 6.2 Status Lifecycle

```
draft active (suspended active)* (completed | cancelled)
```

**State Transitions**:
- `draft` `active`: Session starts
- `active` `suspended`: Temporary pause
- `suspended` `active`: Resume
- `active` `completed`: All tasks done
- `active` `cancelled`: Aborted

## 7. Cross-Module Bindings

| Module | Relationship | Example |
|:---|:---|:---|
| **Context** | Shared reference | All agents access same Context |
| **Plan** | Execution target | Agents collaborate on Plan steps |
| **Role** | Capability definitions | Participants linked to Role IDs |
| **Trace** | Audit log | All turns logged in Trace |

**Flow**:
```
CollabSession references Context 
Participants reference Roles 
Orchestrator dispatches Plan steps to Participants 
Each turn creates Trace events
```

## 8. Security & Safety

### 8.1 Impersonation Prevention

**Threat**: Malicious agent claims to be active agent, performs unauthorized write

**Mitigation**:
```typescript
class SecureCoordinator {
  async validateTurnOwnership(
    turn_id: string,
    claimed_participant_id: string
  ): Promise<boolean> {
    const turn = await this.vsl.readNode('Turn', turn_id);
    
    // Verify claimed participant matches actual owner
    if (turn.participant_id !== claimed_participant_id) {
      this.auditLog.warn({
        event: "impersonation_attempt",
        turn_id: turn_id,
        claimed: claimed_participant_id,
        actual: turn.participant_id
      });
      return false;
    }
    
    return true;
  }
}
```

### 8.2 Deadlock Prevention

**Threat**: Session stalls indefinitely (agent crashes, infinite loop)

**Mitigation** (timeout-based):
```typescript
class DeadlockDetector {
  private readonly TURN_TIMEOUT_MS = 300000;  // 5 minutes
  
  async monitorSession(session_id: string): Promise<void> {
    while (true) {
      await sleep(60000);  // Check every minute
      
      const session = await this.vsl.readNode('CollabSession', session_id);
      if (session.status !== 'active') break;
      
      const currentTurn = await this.getCurrentTurn(session_id);
      if (!currentTurn) continue;
      
      const elapsed = Date.now() - new Date(currentTurn.start_time).getTime();
      if (elapsed > this.TURN_TIMEOUT_MS) {
        // Timeout detected
        await this.handleTimeout(session, currentTurn);
      }
    }
  }
  
  async handleTimeout(
    session: CollabSession,
    turn: Turn
  ): Promise<void> {
    // Log incident
    this.auditLog.error({
      event: "turn_timeout",
      session_id: session.collab_id,
      turn_id: turn.turn_id,
      participant_id: turn.participant_id,
      elapsed_ms: Date.now() - new Date(turn.start_time).getTime()
    });
    
    // Cancel turn
    turn.status = "cancelled";
    await this.vsl.writeNode('Turn', turn.turn_id, turn);
    
    // Reassign to next participant or abort session
    await this.reassignOrAbort(session, turn);
  }
}
```

## 9. Related Documents

**Architecture**:
- [L2 Coordination & Governance](../l2-coordination-governance.md)
- [L1-L4 Deep Dive](../l1-l4-architecture-deep-dive.md)

**Profiles**:
- [MAP Profile](../../03-profiles/map-profile.md)
- [SA Profile](../../03-profiles/sa-profile.md)

**Cross-Cutting Concerns**:
- [Orchestration](orchestration.md)
- [State Sync](state-sync.md)
- [Transaction](transaction.md)

**Schemas**:
- `schemas/v2/mplp-collab.schema.json`
- `schemas/v2/invariants/map-invariants.yaml` (9 rules)

---

**Document Status**: Specification (Normative for MAP Profile)  
**Coordination Modes**: 5 (broadcast, round_robin, orchestrated, swarm, pair)  
**Core Invariants**: 9 MAP rules (7 structural + 2 event-based)  
**Requirements**: Exclusive write access, Atomic handoff, Shared context  
**Security**: Impersonation prevention, Deadlock detection with timeouts
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
