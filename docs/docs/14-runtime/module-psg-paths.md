---
doc_type: normative
status: frozen
authority: MPGC
description: ""
title: Module Psg Paths
---


> **Scope**: Inherited (from /docs/14-runtime/)
> **Non-Goals**: Inherited (from /docs/14-runtime/)

# Module Psg Paths

> **Status**: Normative
> **Version**: 1.0.0
> **Authority**: MPGC
> **Protocol**: MPLP v1.0.0 (Frozen)

## 2. Legend

### 2.1 Access Modes
- **READ**: Module queries PSG but does not modify it
- **WRITE**: Module updates PSG (creates/updates/deletes nodes/edges)
- **READ-WRITE**: Module both queries and updates PSG
- **NONE**: Module does not directly interact with PSG

### 2.2 Ownership
- **primary**: Module is the authoritative source for this PSG area
- **shared**: Multiple modules contribute to this PSG area
- **derived**: PSG area is computed/aggregated from other areas

### 2.3 Event Hooks
- **MUST**: Required for v1.0 compliance (from Phase 3 - Observability Duties)
- **SHOULD**: Strongly recommended
- **RECOMMENDED**: Optional but valuable
- **OPTIONAL**: Nice-to-have

| **Confirm** | READ-WRITE | approval_nodes, decision_edges | RuntimeExecutionEvent (SHOULD) | confirm_decision |
| **Trace** | WRITE | execution_traces, spans | RuntimeExecutionEvent (RECOMMENDED) | pipeline_outcome |
| **Role** | READ-WRITE | agent_roles, assignments | - | multi_agent_coordination |
| **Extension** | READ-WRITE | tool_adapters, plugins | ExternalIntegrationEvent (RECOMMENDED) | - |
| **Dialog** | READ-WRITE | dialog_threads, messages | MethodologyEvent (OPTIONAL) | intent_resolution |
| **Collab** | READ-WRITE | collaboration_sessions, handoffs | MAP events (Profile-specific) | multi_agent_coordination |
| **Core** | READ-WRITE | orchestration_nodes, governance | PipelineStageEvent (MUST) | pipeline_outcome |
| **Network** | READ-WRITE | external_endpoints, integrations | ExternalIntegrationEvent (RECOMMENDED) | - |
| **PSG Runtime** | READ-WRITE | **entire graph** | GraphUpdateEvent (MUST) | graph_evolution |
| **Pipeline** | READ-WRITE | pipeline_state, stages | PipelineStageEvent (MUST) | pipeline_outcome |

### 3.2 Plan Module

**Primary Responsibility**: Define executable plans with steps and dependencies.

**PSG Areas**:
- `psg.plans` (ownership: primary)
  - Plan nodes with metadata (plan_id, context_id, status)
- `psg.plan_steps` (ownership: primary)
  - Step nodes (step_id, description, agent_role, status)
- `psg.plan_edges` (ownership: primary)
  - Dependency edges between steps (via `dependencies` array)

**Access Mode**: READ-WRITE
- **WRITE**: On Plan creation, step updates
- **READ**: When querying execution order, dependencies

**Event Hooks**:
- **PipelineStageEvent** (SHOULD): Correlate with plan execution stages

**Learning Hooks**:
- **intent_resolution**: When Plan created from IntentModel
- **pipeline_outcome**: When Plan execution completes/fails

**Pseudo-code Example**:
```
on Plan.create(plan_obj):
  psg.plans[plan_obj.plan_id] = {
    context_id: plan_obj.context_id,
    status: "pending",
    created_at: now()
  }

  for step in plan_obj.steps:
    psg.plan_steps[step.step_id] = {
      description: step.description,
      agent_role: step.agent_role,
      status: "pending"
    }

    # Create dependency edges
    for dep_id in step.dependencies:
      psg.plan_edges.add(dep_id step.step_id, type="depends_on")

  # Emit GraphUpdateEvent
  emit GraphUpdateEvent({
    graph_id: psg.id,
    update_kind: "node_add",
    node_delta: 1 + len(plan_obj.steps),
    source_module: "Plan"
  })
```

### 3.4 Trace Module

**Primary Responsibility**: Record execution history and spans.

**PSG Areas**:
- `psg.execution_traces` (ownership: primary)
  - Trace objects (trace_id, context_id, root_span_id)
- `psg.trace_spans` (ownership: primary)
  - Span nodes (span_id, parent_span_id, operation, duration)

**Access Mode**: WRITE
- **WRITE-only**: Trace is append-only audit log
- **No READ** from PSG (Trace reads from L2 Trace module directly)

**Event Hooks**:
- **RuntimeExecutionEvent** (RECOMMENDED): For each significant execution event

**Learning Hooks**:
- **pipeline_outcome**: When traces reveal success/failure patterns

**Pseudo-code Example**:
```
on Trace.event_added(trace_obj, event):
  psg.trace_spans[event.event_id] = {
    span_id: event.event_id,
    parent_span_id: event.parent_event_id,
    operation: event.event_type,
    timestamp: event.timestamp
  }

  # Emit RuntimeExecutionEvent
  emit RuntimeExecutionEvent({
    execution_id: event.event_id,
    executor_kind: infer_from(event.event_type),
    status: event.status || "completed"
  })
```

### 3.6 Extension Module

**Primary Responsibility**: Manage tool adapters and plugins.

**PSG Areas**:
- `psg.tool_adapters` (ownership: primary)
  - Extension objects (extension_id, adapter_type, config)
- `psg.plugin_registry` (ownership: shared)
  - Available plugins and their versions

**Access Mode**: READ-WRITE
- **WRITE**: On tool registration/configuration
- **READ**: When resolving `agent_role` to tool executor

**Event Hooks**:
- **ExternalIntegrationEvent** (RECOMMENDED): When tool is invoked

**Learning Hooks**: None specific (tools are infrastructure)

### 3.8 Collab Module

**Primary Responsibility**: Coordinate multi-agent collaboration sessions.

**PSG Areas**:
- `psg.collaboration_sessions` (ownership: primary)
  - Collab objects (session_id, mode, participants)
- `psg.handoff_edges` (ownership: primary)
  - Agent-to-agent handoff relationships

**Access Mode**: READ-WRITE
- **WRITE**: On session creation, handoff
- **READ**: When checking collaboration topology

**Event Hooks**:
- **MAP events** (Profile-specific): MAPSessionStarted, MAPTurnDispatched, etc.

**Learning Hooks**:
- **multi_agent_coordination**: On session completion

### 3.10 Network Module

**Primary Responsibility**: External system integration metadata.

**PSG Areas**:
- `psg.external_endpoints` (ownership: primary)
  - Network objects (endpoint_url, auth_metadata)
- `psg.integration_status` (ownership: shared)
 - Connection health, latency metrics

**Access Mode**: READ-WRITE
- **WRITE**: On endpoint registration/update
- **READ**: When resolving external calls

**Event Hooks**:
- **ExternalIntegrationEvent** (RECOMMENDED): On external API calls

**Learning Hooks**: None specific

### 3.12 Pipeline Controller (Meta-Component)

**Primary Responsibility**: Execute and monitor pipeline stages.

**PSG Areas**:
- `psg.pipeline_state` (ownership: primary)
  - Current pipeline execution state
- `psg.stage_nodes` (ownership: primary)
  - Pipeline stage metadata (stage_id, status, dependencies)

**Access Mode**: READ-WRITE
- **WRITE**: On stage transitions
- **READ**: When determining next stage

**Event Hooks**:
- **PipelineStageEvent** (MUST): For every stage transition

**Learning Hooks**:
- **pipeline_outcome**: On pipeline completion/failure

## 5. References

- [Runtime Glue Overview](runtime-glue-overview.md)
- [CrosscutSG & Events Binding](crosscut-psg-event-binding.md)
- [Observability Event Taxonomy](../04-observability/event-taxonomy.yaml)
- [Learning Sample Taxonomy](../05-learning/learning-taxonomy.yaml)

---

**End of ModuleSG Read/Write Path Matrix**

*This matrix establishes the protocol-level specification for how each MPLP module interacts with the PSG, ensuring consistent runtime behavior across implementations.*