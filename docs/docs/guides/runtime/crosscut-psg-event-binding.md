---
sidebar_position: 7

doc_type: normative
normativity: normative
status: frozen
authority: MPGC
description: "Crosscut PSG and Observability Event Binding specification for MPLP runtime."
title: Crosscut PSG Event Binding
keywords: [MPLP, PSG, Crosscutting Concerns, Events, Observability, Runtime]
sidebar_label: Crosscut PSG Event Binding

---


# Crosscut PSG Event Binding


## 1. Purpose

This document defines how MPLP's **crosscutting concerns** are realized through:

1. **PSG State**: What data is stored in the Protocol State Graph
2. **Observability Events**: Which events are emitted for each concern
3. **Learning Hooks**: Which learning sample families are triggered

This binding ensures consistent runtime behavior across all MPLP implementations.

## 2. MPLP's 9 Crosscutting Concerns

| # | Concern | Description | PSG Role | Primary Events |
|:---|:---|:---|:---|:---|
| 1 | **coordination** | Multi-agent collaboration and handoffs | Sessions, roles | MAP Events |
| 2 | **error-handling** | Failure detection, recovery, retry logic | Error logs | RuntimeExecutionEvent |
| 3 | **event-bus** | Structured event routing and consumption | Sinks, routing | All 12 families |
| 4 | **orchestration** | Pipeline and plan execution control | Pipeline state | PipelineStageEvent |
| 5 | **performance** | Timing, resource usage, cost tracking | Metrics | CostAndBudgetEvent |
| 6 | **protocol-version** | Version compatibility and migration | Core module | GraphUpdateEvent |
| 7 | **security** | Authentication, authorization, access control | ACLs, audit | (Future) SecurityEvent |
| 8 | **state-sync** | PSG consistency and synchronization | Entire PSG | GraphUpdateEvent |
| 9 | **transaction** | Atomicity and rollback for grouped operations | Transactions | GraphUpdateEvent |

## 3. Non-Goals

This specification does not mandate:
- Specific implementation details beyond defined interfaces
- Distributed consensus algorithms
- Enterprise-grade security systems
- Full ACID transaction support

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

**Conformance Notes**:
- MAP events are Profile-specific (not v1.0 core requirement)
- RuntimeExecutionEvent is RECOMMENDED for coordination tracking

**Example PSG Structure**:
```json
{
  "psg.collaboration_sessions": {
    "session_id": {
      "mode": "turn_taking",
      "participants": ["agent_1", "agent_2"],
      "current_turn_holder": "agent_1",
      "status": "active"
    }
  },
  "psg.handoff_edges": [
    {"from": "agent_1", "to": "agent_2", "type": "sequential_handoff"}
  ]
}
```

### 4.2 Error Handling

**Definition**: Failure detection, recovery strategies, retry logic.

**PSG Role**:
- Error states stored in step/plan status (`psg.plan_steps[].status = "failed"`)
- Recovery actions logged in Trace (`psg.trace_spans`)
- Retry metadata stored (`psg.retry_state`)

**Event Families Used**:
- **RuntimeExecutionEvent** (SHOULD):
  - `status`: "failed"
  - Contains error details in payload
- **PipelineStageEvent** (SHOULD):
  - `stage_status`: "failed"

**Learning Families**:
- **pipeline_outcome**: Failed executions feed learning

**Conformance Notes**:
- Failure recording via events is SHOULD (not MUST)
- Recovery strategy is implementation-specific

**Example PSG Structure**:
```json
{
  "psg.plan_steps": {
    "step_id": {
      "status": "failed",
      "error": {
        "code": "TOOL_TIMEOUT",
        "message": "Tool execution exceeded 30s limit",
        "retry_count": 2
      }
    }
  }
}
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

**Conformance Notes**:
- Event bus implementation is product-specific
- Protocol only requires events be emitted, not how they're routed

**Example PSG Structure**:
```json
{
  "psg.event_sinks": {
    "sink_id": {
      "sink_type": "webhook",
      "endpoint": "https://...",
      "event_filters": ["PipelineStageEvent", "GraphUpdateEvent"]
    }
  }
}
```

### 4.4 Orchestration

**Definition**: Pipeline and plan execution control, step scheduling.

**PSG Role**:
- Pipeline state stored (`psg.pipeline_state`)
- Stage transitions tracked (`psg.stage_nodes`)
- Execution order derived from plan edges

**Event Families Used**:
- **PipelineStageEvent** (MUST):
  - Emitted on every stage transition
  - `stage_status`: pending, running, completed, failed, skipped
- **GraphUpdateEvent** (MUST):
  - On pipeline structure changes

**Learning Families**:
- **pipeline_outcome**: On pipeline completion/failure

**Conformance Notes**:
- PipelineStageEvent is REQUIRED for v1.0 conformance
- All stage transitions MUST emit events

**Example PSG Structure**:
```json
{
  "psg.pipeline_state": {
    "current_stage": "step_3",
    "status": "running",
    "started_at": "2025-01-01T12:00:00Z"
  },
  "psg.stage_nodes": {
    "step_3": {
      "status": "running",
      "started_at": "2025-01-01T12:05:00Z"
    }
  }
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

**Conformance Notes**:
- Cost/performance tracking is RECOMMENDED, not REQUIRED
- CostAndBudgetEvent schema defined in Phase 3

**Example PSG Structure**:
```json
{
  "psg.plan_steps": {
    "step_id": {
      "metrics": {
        "estimated_duration_ms": 5000,
        "actual_duration_ms": 6200,
        "estimated_cost_usd": 0.05,
        "actual_cost_usd": 0.06
      }
    }
  },
  "psg.resource_usage": {
    "session_id": {
      "cpu_ms": 12000,
      "memory_mb_peak": 256,
      "llm_tokens": 15000
    }
  }
}
```

### 4.6 Protocol Version

**Definition**: Version compatibility, migration, and upgrade paths.

**PSG Role**:
- Protocol version stored in Core module (`psg.core.protocol_version`)
- Schema version tracked (`psg.core.schema_version`)
- Migration history logged

**Event Families Used**:
- **GraphUpdateEvent** (RECOMMENDED):
  - On protocol version changes
- **ImportProcessEvent** (OPTIONAL):
  - When migrating data between versions

**Learning Families**: None directly (versioning is infrastructure)

**Conformance Notes**:
- Protocol version MUST be recorded in Core module
- Cross-version compatibility is implementation-specific

**Example PSG Structure**:
```json
{
  "psg.core": {
    "core_id": "...",
    "protocol_version": "1.0.0",
    "schema_version": "2.0.0",
    "modules": [
      {"module_id": "context", "version": "1.0.0", "status": "enabled"}
    ]
  }
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

**Conformance Notes**:
- Security mechanisms are OPTIONAL in v1.0
- If implemented, SHOULD use PSG for access control

**Example PSG Structure** (informative):
```json
{
  "psg.nodes": {
    "node_id": {
      "acl": {
        "owner": "user_id",
        "readers": ["user_1", "user_2"],
        "writers": ["user_1"]
      }
    }
  },
  "psg.audit_log": [
    {
      "action": "node_modified",
      "node_id": "node_id",
      "by_user": "user_id",
      "at_timestamp": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### 4.8 State Sync

**Definition**: PSG consistency, synchronization, and single source of truth.

**PSG Role**:
- PSG is the authoritative state store
- All modules read/write through PSG
- Consistency maintained via GraphUpdateEvent

**Event Families Used**:
- **GraphUpdateEvent** (MUST):
  - Emitted on every PSG modification
  - `update_kind`: node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk
- **PipelineStageEvent** (MUST):
  - For stage-level state changes

**Learning Families**:
- **graph_evolution**: PSG structure changes over time

**Conformance Notes**:
- GraphUpdateEvent is REQUIRED for v1.0 conformance
- PSG MUST be single source of truth for protocol state

**Example PSG Structure**:
```json
{
  "psg.sync_metadata": {
    "last_update_id": "uuid-v4",
    "last_update_at": "2025-01-01T12:00:00Z",
    "node_count": 42,
    "edge_count": 68
  }
}
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

**Conformance Notes**:
- v1.0 does NOT mandate full ACID transactions
- Minimal transactional support: batch PSG updates
- Enterprise 2PC/saga patterns are out-of-scope

**Example PSG Structure**:
```json
{
  "psg.transactions": {
    "txn_id": {
      "started_at": "2025-01-01T12:00:00Z",
      "operations": [
        {"op": "node_add", "node_id": "n1"},
        {"op": "edge_add", "from": "n1", "to": "n2"},
        {"op": "node_update", "node_id": "n3"}
      ],
      "status": "committed",
      "committed_at": "2025-01-01T12:00:05Z"
    }
  }
}
```

**Rollback Example**:
```
on transaction_abort(txn_id):
  restore_psg_from_snapshot(psg.transaction_snapshots[txn_id])
  emit GraphUpdateEvent({
    update_kind: "bulk",
    node_delta: -count(txn.node_adds),
    edge_delta: -count(txn.edge_adds)
  })
```

---

## 5. Conformance Summary

### 5.1 v1.0 Requirements

| Crosscut | Requirement Level | Key Events |
|:---|:---|:---|
| **State Sync** | REQUIRED | GraphUpdateEvent |
| **Orchestration** | REQUIRED | PipelineStageEvent |
| **Error Handling** | SHOULD | RuntimeExecutionEvent (status: failed) |
| **Coordination** | RECOMMENDED | RuntimeExecutionEvent, MAP Events |
| **Performance** | RECOMMENDED | CostAndBudgetEvent |
| **Transaction** | RECOMMENDED | GraphUpdateEvent (bulk) |
| **Event Bus** | Implementation-specific | All 12 families |
| **Protocol Version** | REQUIRED (Core module) | - |
| **Security** | OPTIONAL | (Future) SecurityEvent |

### 5.2 NOT Required for v1.0

- Full ACID transactions
- Enterprise security systems
- ML-based orchestration
- Distributed consensus algorithms

---

## 6. References

- [Module PSG Paths](module-psg-paths.md)
- [Runtime Glue Overview](runtime-glue-overview.md)
- [Observability Event Taxonomy](https://github.com/Coregentis/MPLP-Protocol/blob/main/schemas/v2/taxonomy/event-taxonomy.yaml)
- [Learning Sample Taxonomy](https://github.com/Coregentis/MPLP-Protocol/blob/main/schemas/v2/taxonomy/learning-taxonomy.yaml)

---

**Crosscutting Concerns**: 9  
**Required Events**: PipelineStageEvent, GraphUpdateEvent

*This specification ensures MPLP's crosscutting concerns are consistently realized through PSG state and Observability events, providing uniform runtime behavior across implementations.*