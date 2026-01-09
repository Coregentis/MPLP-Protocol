---
sidebar_position: 6

doc_type: normative
normativity: normative
status: frozen
authority: MPGC
description: "Module PSG Read/Write Path Matrix defining how each MPLP module interacts with the Protocol State Graph."
title: Module PSG Paths
keywords: [MPLP, PSG, Protocol State Graph, Module Paths, Runtime]
sidebar_label: Module PSG Paths

---


# Module PSG Paths


## 1. Purpose

This document defines the **Read/Write Path Matrix** for all MPLP modules interacting with the Protocol State Graph (PSG). It establishes:

1. **Which PSG areas** each module owns or accesses
2. **Access modes** (READ, WRITE, READ-WRITE)
3. **Event hooks** for observability compliance
4. **Learning hooks** for feedback loop integration

This matrix ensures consistent runtime behavior across all MPLP implementations.

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
- **MUST**: Required for v1.0 conformance (from Phase 3 - Observability Duties)
- **SHOULD**: Strongly recommended
- **RECOMMENDED**: Optional but valuable
- **OPTIONAL**: Nice-to-have

## 3. Module-Specific PSG Paths

### 3.0 Summary Matrix

| Module | Access Mode | PSG Areas | Event Hooks | Learning Hooks |
|:---|:---|:---|:---|:---|
| **Context** | READ-WRITE | context_nodes, environment | PipelineStageEvent (MUST) | intent_resolution |
| **Plan** | READ-WRITE | plans, plan_steps, plan_edges | PipelineStageEvent (SHOULD) | intent_resolution, pipeline_outcome |
| **Confirm** | READ-WRITE | approval_nodes, decision_edges | RuntimeExecutionEvent (SHOULD) | confirm_decision |
| **Trace** | WRITE | execution_traces, spans | RuntimeExecutionEvent (RECOMMENDED) | pipeline_outcome |
| **Role** | READ-WRITE | agent_roles, assignments | - | multi_agent_coordination |
| **Extension** | READ-WRITE | tool_adapters, plugins | ExternalIntegrationEvent (RECOMMENDED) | - |
| **Dialog** | READ-WRITE | dialog_threads, messages | MethodologyEvent (OPTIONAL) | intent_resolution |
| **Collab** | READ-WRITE | collaboration_sessions, handoffs | MAP events (Profile-specific) | multi_agent_coordination |
| **Core** | READ-WRITE | orchestration_nodes, governance | PipelineStageEvent (MUST) | pipeline_outcome |
| **Network** | READ-WRITE | external_endpoints, integrations | ExternalIntegrationEvent (RECOMMENDED) | - |

### 3.1 Context Module

**Primary Responsibility**: Define project scope, environment, and constraints.

**PSG Areas**:
- `psg.context_nodes` (ownership: primary)
  - Context objects (context_id, root, title, status)
- `psg.environment` (ownership: primary)
  - Environment metadata (domain, constraints, permissions)

**Access Mode**: READ-WRITE
- **WRITE**: On Context creation, status transitions
- **READ**: When validating Plan/Trace context bindings

**Event Hooks**:
- **PipelineStageEvent** (MUST): On Context activation/deactivation

**Learning Hooks**:
- **intent_resolution**: When Context captures initial user intent

**Pseudo-code Example**:
```
on Context.create(context_obj):
  psg.context_nodes[context_obj.context_id] = {
    root: context_obj.root,
    title: context_obj.title,
    status: "draft",
    created_at: now()
  }
  
  psg.environment[context_obj.context_id] = {
    domain: context_obj.root.domain,
    constraints: context_obj.constraints
  }
  
  # Emit PipelineStageEvent
  emit PipelineStageEvent({
    pipeline_id: context_obj.context_id,
    stage_id: "context_created",
    stage_status: "completed"
  })
```

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
      psg.plan_edges.add(dep_id -> step.step_id, type="depends_on")

  # Emit GraphUpdateEvent
  emit GraphUpdateEvent({
    graph_id: psg.id,
    update_kind: "node_add",
    node_delta: 1 + len(plan_obj.steps),
    source_module: "Plan"
  })
```

### 3.3 Confirm Module

**Primary Responsibility**: Manage approval workflows and human-in-the-loop decisions.

**PSG Areas**:
- `psg.approval_nodes` (ownership: primary)
  - Confirm objects (confirm_id, target_id, target_type, status)
- `psg.decision_edges` (ownership: primary)
  - Decision relationships (approver, timestamp, decision)

**Access Mode**: READ-WRITE
- **WRITE**: On Confirm creation, decision updates
- **READ**: When checking approval status

**Event Hooks**:
- **RuntimeExecutionEvent** (SHOULD): On decision recorded

**Learning Hooks**:
- **confirm_decision**: When human provides approval/rejection

**Pseudo-code Example**:
```
on Confirm.create(confirm_obj):
  psg.approval_nodes[confirm_obj.confirm_id] = {
    target_id: confirm_obj.target_id,
    target_type: confirm_obj.target_type,
    status: "pending",
    created_at: now()
  }

on Confirm.decide(confirm_id, decision):
  psg.approval_nodes[confirm_id].status = decision.status
  psg.decision_edges.add({
    confirm_id: confirm_id,
    decided_by: decision.decided_by_role,
    decision: decision.status,
    timestamp: now()
  })
  
  # Emit RuntimeExecutionEvent
  emit RuntimeExecutionEvent({
    execution_id: confirm_id,
    executor_kind: "human",
    status: decision.status
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

### 3.5 Role Module

**Primary Responsibility**: Define agent capabilities and permissions.

**PSG Areas**:
- `psg.agent_roles` (ownership: primary)
  - Role objects (role_id, name, capabilities)
- `psg.assignments` (ownership: shared)
  - Role-to-agent assignments

**Access Mode**: READ-WRITE
- **WRITE**: On Role creation, capability updates
- **READ**: When resolving agent permissions

**Event Hooks**: None specific (Role is configuration, not execution)

**Learning Hooks**:
- **multi_agent_coordination**: On role assignment changes

**Pseudo-code Example**:
```
on Role.create(role_obj):
  psg.agent_roles[role_obj.role_id] = {
    name: role_obj.name,
    capabilities: role_obj.capabilities,
    created_at: now()
  }

on Role.assign(role_id, agent_id):
  psg.assignments.add({
    role_id: role_id,
    agent_id: agent_id,
    assigned_at: now()
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

### 3.7 Dialog Module

**Primary Responsibility**: Manage multi-turn conversations.

**PSG Areas**:
- `psg.dialog_threads` (ownership: primary)
  - Dialog objects (dialog_id, context_id, status)
- `psg.messages` (ownership: primary)
  - Message nodes (message_id, role, content, timestamp)

**Access Mode**: READ-WRITE
- **WRITE**: On message addition, dialog status changes
- **READ**: When retrieving conversation history

**Event Hooks**:
- **MethodologyEvent** (OPTIONAL): On methodology selection during dialog

**Learning Hooks**:
- **intent_resolution**: When dialog captures user intent

**Pseudo-code Example**:
```
on Dialog.add_message(dialog_id, message):
  psg.messages.add({
    dialog_id: dialog_id,
    message_id: message.id,
    role: message.role,
    content: message.content,
    timestamp: now()
  })
```

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

### 3.9 Core Module

**Primary Responsibility**: Central protocol governance and module registry.

**PSG Areas**:
- `psg.orchestration_nodes` (ownership: primary)
  - Core objects (core_id, protocol_version, status)
- `psg.governance` (ownership: primary)
  - Governance metadata (lifecyclePhase, truthDomain, locked)
- `psg.module_registry` (ownership: primary)
  - Enabled modules and their versions

**Access Mode**: READ-WRITE
- **WRITE**: On protocol initialization, module enable/disable
- **READ**: When checking protocol version, enabled modules

**Event Hooks**:
- **PipelineStageEvent** (MUST): On protocol lifecycle transitions

**Learning Hooks**:
- **pipeline_outcome**: On protocol-level success/failure

**Pseudo-code Example**:
```
on Core.initialize(core_obj):
  psg.orchestration_nodes[core_obj.core_id] = {
    protocol_version: core_obj.protocol_version,
    status: "draft",
    created_at: now()
  }
  
  psg.governance[core_obj.core_id] = {
    lifecyclePhase: "initialization",
    truthDomain: "protocol",
    locked: false
  }
  
  for module in core_obj.modules:
    psg.module_registry.add({
      core_id: core_obj.core_id,
      module_id: module.module_id,
      version: module.version,
      status: module.status
    })
```

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

### 3.11 Pipeline Controller (Meta-Component)

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

## 4. Cross-Module Interactions

### 4.1 PSG Update Flow

<MermaidDiagram id="384e45a09987bbdc" />

### 4.2 Ownership Conflicts

When multiple modules claim ownership of a PSG area:

1. **Primary ownership** takes precedence
2. **Shared ownership** requires coordination via Collab module
3. **Derived areas** are read-only for source modules

## 5. References

- [Runtime Glue Overview](runtime-glue-overview.md)
- [Crosscut PSG Event Binding](crosscut-psg-event-binding.md)
- [Observability Event Taxonomy](https://github.com/Coregentis/MPLP-Protocol/blob/main/schemas/v2/taxonomy/event-taxonomy.yaml)
- [Learning Sample Taxonomy](https://github.com/Coregentis/MPLP-Protocol/blob/main/schemas/v2/taxonomy/learning-taxonomy.yaml)

---

**Total Modules**: 10 (Context, Plan, Confirm, Trace, Role, Extension, Dialog, Collab, Core, Network)  
**Meta-Components**: 1 (Pipeline Controller)

*This matrix establishes the protocol-level specification for how each MPLP module interacts with the PSG, ensuring consistent runtime behavior across implementations.*