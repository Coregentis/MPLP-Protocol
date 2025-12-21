---
title: Crosscut Psg Event Binding
description: Specification of MPLP Crosscutting Concerns (coordination, error-handling, etc.) and their binding to PSG state and Observability events.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Crosscut PSG Binding, MPLP crosscutting concerns, coordination, error handling, event bus, orchestration, performance, state sync, transaction]
sidebar_label: Crosscut PSG Binding
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
## 1. Scope

MPLP defines 9 crosscutting concerns that span multiple modules. This document specifies how each crosscut is implemented through:
- **PSG read/write policies**: How PSG stores crosscut-related state
- **Observability events** (from Phase 3): Which events are emitted
- **Learning hooks** (from Phase 4): Which samples can be collected

---

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

---

## 3. Crosscut Matrix (Summary)

| Crosscut | PSG Role | Event Families Used | Learning Families |
|----------|----------|---------------------|-------------------|
| **coordination** | Encodes roles & sessions | MAP events, RuntimeExecutionEvent | multi_agent_coordination |
| **error-handling** | Records failure nodes & edges | PipelineStageEvent (failed), RuntimeExecutionEvent (failed) | pipeline_outcome |
| **event-bus** | Routes events to sinks | All 12 event families | - |
| **orchestration** | Controls pipeline execution | PipelineStageEvent, MethodologyEvent | pipeline_outcome |
| **performance** | Stores timing metrics | CostAndBudgetEvent, RuntimeExecutionEvent | pipeline_outcome |
| **protocol-version** | Annotates nodes with version | ImportProcessEvent | - |
| **security** | Encodes access control | (Future: SecurityEvent) | - |
| **state-sync** | PSG as single source of truth | GraphUpdateEvent | graph_evolution |
| **transaction** | Groups updates atomically | GraphUpdateEvent (bulk), ExternalIntegrationEvent | delta_impact |

---

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

---

### 4.2 Error Handling

**Definition**: Failure detection, recording, recovery, and retry logic.

**PSG Role**:
- Failure nodes record error states (`psg.failure_nodes`)
- Degraded edges mark problematic dependencies
- Retry annotations on step nodes (`retry_count`, `last_error`)

**Event Families Used**:
- **PipelineStageEvent** (MUST):
  - `stage_status`: "failed"
  - `error_summary`: Failure description
- **RuntimeExecutionEvent** (SHOULD):
  - `status`: "failed" | "cancelled"
  - Execution-level errors

**Learning Families**:
- **pipeline_outcome**: Samples with negative outcomes

**Compliance Notes**:
- Failure recording via events is REQUIRED for audit trail
- PSG failure nodes are RECOMMENDED for recovery logic

**Example PSG Structure**:
```
psg.failure_nodes[failure_id] = {
  source_step_id: step_id,
  error_type: "timeout" | "exception" | "validation_error",
  error_message: "...",
  occurred_at: timestamp,
  retry_count: 2
}

psg.step_nodes[step_id].status = "failed"
psg.step_nodes[step_id].retry_count = 2
```

---

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

---

### 4.4 Orchestration

**Definition**: Pipeline and plan execution control, stage sequencing, dependency resolution.

**PSG Role**:
- Pipeline state stored in PSG (`psg.pipeline_state`)
- Stage nodes with dependencies (`psg.stage_nodes`)
- Orchestrator control nodes (`psg.orchestration_nodes`)

**Event Families Used**:
- **PipelineStageEvent** (MUST):
  - Every stage transition emits event
  - `stage_order` indicates sequence
- **MethodologyEvent** (OPTIONAL):
  - When orchestrator uses adaptive/learned strategies

**Learning Families**:
- **pipeline_outcome**: On pipeline completion/failure

**Compliance Notes**:
- PipelineStageEvent emission is REQUIRED for v1.0
- Pipeline execution strategy (sequential, parallel, adaptive) is implementation choice

**Example PSG Structure**:
```
psg.pipeline_state[pipeline_id] = {
  current_stage_id: stage_3,
  completed_stages: [stage_1, stage_2],
  pending_stages: [stage_4, stage_5],
  status: "running"
}

psg.stage_nodes[stage_id] = {
  dependencies: [stage_2, stage_3],
  status: "pending",
  order_index: 4
}
```

---

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

---

### 4.6 Protocol Version

**Definition**: Version compatibility, schema evolution, migration support.

**PSG Role**:
- Protocol version annotated on PSG root (`psg.protocol_version`)
- Schema version on individual nodes (`psg.nodes[].schema_version`)
- Migration history (`psg.migration_log`)

**Event Families Used**:
- **ImportProcessEvent** (OPTIONAL):
  - On project initialization, include protocol version
- **GraphUpdateEvent** (MUST):
  - When version annotations change

**Learning Families**: None directly

**Compliance Notes**:
- v1.0 protocol version is "1.0.0"
- Future protocol changes will define migration paths

**Example PSG Structure**:
```
psg.protocol_version = "1.0.0"

psg.nodes[node_id].schema_version = "1.0.0"

psg.migration_log = [
  {
    from_version: "0.9.0",
    to_version: "1.0.0",
    migrated_at: timestamp,
    affected_nodes: 142
  }
]
```

---

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

---

### 4.8 State Sync

**Definition**: PSG consistency, synchronization across distributed components, single source of truth property.

**PSG Role**:
- **PSG is THE authoritative state** (primary responsibility)
- Sync checkpoints (`psg.sync_checkpoints`)
- Conflict resolution metadata (`psg.conflicts`)

**Event Families Used**:
- **GraphUpdateEvent** (MUST):
  - Every PSG structural change emits event
  - Enables downstream consumers to stay in sync
  - `update_kind`: node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk

**Learning Families**:
- **graph_evolution**: When sync patterns are interesting

**Compliance Notes**:
- GraphUpdateEvent is REQUIRED for v1.0
- PSG as single source of truth is fundamental design principle

**Example PSG Structure**:
```
psg.sync_checkpoints[checkpoint_id] = {
  snapshot_at: timestamp,
  node_count: 1523,
  edge_count: 2104,
  hash: "sha256:..."
}

psg.conflicts[conflict_id] = {
  node_id: node_id,
  conflicting_values: [val_1, val_2],
  resolved_value: val_1,
  resolution_strategy: "last_write_wins"
}
```

---

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

# On rollback
restore_psg_from_snapshot(psg.transaction_snapshots[txn_id])
```

---

## 5. Crosscut Interaction Patterns

### 5.1 Coordination + Error Handling
- When agent handoff fails error-handling creates failure node
- MAP session errors recorded in PSG + emitted as RuntimeExecutionEvent (status=failed)

### 5.2 Orchestration + Performance
- Pipeline stage transitions PipelineStageEvent with timing
- Cost tracking integrated with stage execution

### 5.3 State Sync + Transaction
- Transactional PSG updates emit GraphUpdateEvent (bulk)
- Rollback restores PSG snapshot + emits compensating GraphUpdateEvent

### 5.4 Event Bus + All Crosscuts
- Event bus consumes all Observability events
- Routes to appropriate sinks (monitoring, learning, audit)

---

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

---

## 7. References

- [Runtime Glue Overview](runtime-glue-overview.md)
- [ModuleSG Paths](module-psg-paths.md)
- [Observability Event Taxonomy](../04-observability/event-taxonomy.yaml)
- [Drift Detection Spec](drift-and-rollback.md)
- [Rollback Minimal Spec](drift-and-rollback.md)

---

**End of CrosscutSG & Observability Event Binding**

*This specification ensures MPLP's crosscutting concerns are consistently realized through PSG state and Observability events, providing uniform runtime behavior across implementations.*
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
