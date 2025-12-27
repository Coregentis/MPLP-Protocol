---
doc_type: normative
status: frozen
authority: MPGC
description: ""
title: Crosscut Psg Event Binding
---


> **Scope**: Inherited (from /docs/14-runtime/)
> **Non-Goals**: Inherited (from /docs/14-runtime/)

# Crosscut Psg Event Binding

> **Status**: Normative
> **Version**: 1.0.0
> **Authority**: MPGC
> **Protocol**: MPLP v1.0.0 (Frozen)

## 2. MPLP's 9 Crosscutting Concerns

1. **coordination**: Multi-agent collaboration and handoffs
2. **error-handling**: Failure detection, recovery, retry logic
3. **event-bus**: Structured event routing and consumption
4. **orchestration**: Pipeline and plan execution control
5. **performance**: Timing, resource usage, cost tracking
6. **protocol-version**: Version compatibility and migration
7. **security**: Authentication, authorization, access control
8. **state-sync**: PSG consistency and synchronization
9. **transaction**: Atomicity and rollback for grouped operations

## 4. Per-Crosscut Binding

### 4.1 Coordination

**Definition**: Multi-agent collaboration, role assignment, handoff semantics.

**PSG Role**:
- Collab sessions stored as PSG nodes (`psg.collaboration_sessions`)
- Agent roles stored as PSG nodes (`psg.agent_roles`)
- MAP sessions (turn-taking, broadcast) encoded as collaboration graphs
- Handoff edges represent control flow between agents

**Event Families Used**:
- **MAP Events** (Profile-specific):
  - MAPSessionStarted
  - MAPTurnDispatched
  - MAPBroadcastSent
  - MAPTurnCompleted
  - MAPSessionCompleted
- **RuntimeExecutionEvent** (RECOMMENDED):
  - For agent/tool/LLM invocations
  - `executor_kind`: agent, tool, llm
  - `executor_role`: Identifies which agent

**Learning Families**:
- **multi_agent_coordination**: On MAP session completion

**Compliance Notes**:
- MAP events are Profile-specific (not v1.0 core requirement)
- RuntimeExecutionEvent is RECOMMENDED for coordination tracking

**Example PSG Structure**:
```
psg.collaboration_sessions[session_id] = {
  mode: "turn_taking" | "broadcast" | "orchestrated",
  participants: [agent_id_1, agent_id_2, ...],
  current_turn_holder: agent_id,
  status: "active" | "completed"
}

psg.handoff_edges:
  agent_1 agent_2 (type: "sequential_handoff")
  orchestrator worker_1 (type: "broadcast_dispatch")
```

### 4.3 Event Bus

**Definition**: Structured event routing from emitters to consumers.

**PSG Role**:
- Event sinks registered in PSG (`psg.event_sinks`)
- Routing rules stored (`psg.event_routing`)
- Event buffer/queue metadata (if applicable)

**Event Families Used**:
- **All 12 Observability event families** (Phase 3):
  - ImportProcessEvent
  - IntentEvent
  - DeltaIntentEvent
  - ImpactAnalysisEvent
  - CompensationPlanEvent
  - MethodologyEvent
  - ReasoningGraphEvent
  - **PipelineStageEvent** (REQUIRED)
  - **GraphUpdateEvent** (REQUIRED)
  - RuntimeExecutionEvent
  - CostAndBudgetEvent
  - ExternalIntegrationEvent

**Learning Families**: None directly (event-bus is infrastructure)

**Compliance Notes**:
- Event bus implementation is product-specific
- Protocol only requires events be emitted, not how they're routed

**Example PSG Structure**:
```
psg.event_sinks[sink_id] = {
  sink_type: "webhook" | "kafka" | "file",
  endpoint: "https://...",
  event_filters: ["PipelineStageEvent", "GraphUpdateEvent"]
}
```

### 4.5 Performance

**Definition**: Timing metrics, resource usage, cost tracking.

**PSG Role**:
- Timing metrics stored in Trace (`psg.trace_spans[].duration`)
- Cost annotations on plan steps (`psg.plan_steps[].estimated_cost`)
- Resource usage logs (`psg.resource_usage`)

**Event Families Used**:
- **CostAndBudgetEvent** (RECOMMENDED):
  - Emitted when cost thresholds crossed
  - Contains cost estimates and actuals
- **RuntimeExecutionEvent** (RECOMMENDED):
  - Can include timing metadata

**Learning Families**:
- **pipeline_outcome**: Performance patterns in samples

**Compliance Notes**:
- Cost/performance tracking is RECOMMENDED, not REQUIRED
- CostAndBudgetEvent schema defined in Phase 3

**Example PSG Structure**:
```
psg.plan_steps[step_id].metrics = {
  estimated_duration_ms: 5000,
  actual_duration_ms: 6200,
  estimated_cost_usd: 0.05,
  actual_cost_usd: 0.06
}

psg.resource_usage[session_id] = {
  cpu_ms: 12000,
  memory_mb_peak: 256,
  llm_tokens: 15000
}
```

### 4.7 Security

**Definition**: Authentication, authorization, access control, audit trails.

**PSG Role**:
- Access control lists on PSG nodes (`psg.nodes[].acl`)
- Permission edges (`psg.permission_edges`)
- Audit log as trace events (`psg.audit_log`)

**Event Families Used**:
- **(Future) SecurityEvent**: Not defined in v1.0
  - Placeholder for authentication, authorization events
- **RuntimeExecutionEvent** (OPTIONAL):
  - Can include security context metadata

**Learning Families**: None directly (security is infrastructure)

**Compliance Notes**:
- Security mechanisms are OPTIONAL in v1.0
- If implemented, SHOULD use PSG for access control

**Example PSG Structure** (informative):
```
psg.nodes[node_id].acl = {
  owner: user_id,
  readers: [user_1, user_2],
  writers: [user_1]
}

psg.audit_log.append({
  action: "node_modified",
  node_id: node_id,
  by_user: user_id,
  at_timestamp: timestamp
})
```

### 4.9 Transaction

**Definition**: Atomicity for grouped PSG updates, rollback support, commit/abort semantics.

**PSG Role**:
- Transaction boundaries marked in PSG (`psg.transactions`)
- Grouped updates executed atomically
- Rollback snapshots (`psg.transaction_snapshots`)

**Event Families Used**:
- **GraphUpdateEvent** (MUST):
  - `update_kind`: "bulk" for transactional batches
  - `node_delta` and `edge_delta` reflect batch size
- **ExternalIntegrationEvent** (RECOMMENDED):
  - For commit/rollback/abort actions involving external systems

**Learning Families**:
- **delta_impact**: When transactions involve risky changes

**Compliance Notes**:
- v1.0 does NOT mandate full ACID transactions
- Minimal transactional support: batch PSG updates
- Enterprise 2PC/saga patterns are out-of-scope

**Example PSG Structure**:
```
psg.transactions[txn_id] = {
  started_at: timestamp,
  operations: [
    {op: "node_add", node_id: n1},
    {op: "edge_add", edge: n12},
    {op: "node_update", node_id: n3}
  ],
  status: "committed" | "aborted",
  committed_at: timestamp
}

## 1. Scope

This specification defines the normative requirements for **On rollback**.

## 2. Non-Goals

This specification does not mandate specific implementation details beyond the defined interfaces and invariants.

restore_psg_from_snapshot(psg.transaction_snapshots[txn_id])
```

## 6. Compliance Summary

**v1.0 Requirements**:
1. **State Sync**: PSG as single source of truth + GraphUpdateEvent (REQUIRED)
2. **Orchestration**: PipelineStageEvent for all stage transitions (REQUIRED)
3.  **Error Handling**: Failure recording via events (SHOULD)
4.  **Coordination**: RuntimeExecutionEvent for agent calls (RECOMMENDED)
5.  **Performance**: CostAndBudgetEvent for cost tracking (RECOMMENDED)
6.  **Transaction**: Batch GraphUpdateEvent for grouped updates (RECOMMENDED)

**NOT REQUIRED for v1.0**:
- Full ACID transactions
- Enterprise security systems
- ML-based orchestration
- Distributed consensus algorithms

**End of CrosscutSG & Observability Event Binding**

*This specification ensures MPLP's crosscutting concerns are consistently realized through PSG state and Observability events, providing uniform runtime behavior across implementations.*