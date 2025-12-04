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
## 1. Overview

This document systematically describes the **data flow paths** between MPLP L2 modules and the PSG. Any runtime implementation claiming MPLP v1.0 compliance MUST document their Module→PSG mapping consistent with this specification.

---

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

---

## 4. Per-Module Details

### 4.1 Context Module

**Primary Responsibility**: Define high-level project scope, environment, and constraints.

**PSG Areas**:
- `psg.project_root` (ownership: primary)
  - Project identifier, title, description
- `psg.environment` (ownership: primary)
  - Runtime environment metadata (OS, platform, dependencies)
- `psg.constraints` (ownership: primary)
  - Timeline, budget, resource constraints

**Access Mode**: READ-WRITE
- **WRITE**: On Context creation/update
- **READ**: When other modules query project scope

**Event Hooks**:
- **ImportProcessEvent** (OPTIONAL): When project is first imported/initialized

**Learning Hooks**:
- **intent_resolution**: When Context + Plan finalized together

**Pseudo-code Example**:
```
on Context.create(context_obj):
  psg.project_root[context_obj.context_id] = {
    title: context_obj.title,
    timestamp: context_obj.timestamp,
    lifecycle_phase: "active"
  }
  if context_obj.constraints:
    psg.constraints[context_obj.context_id] = context_obj.constraints

  # Optional
  emit ImportProcessEvent({
    event_type: "project_initialized",
    project_id: context_obj.context_id
  })
```

---

### 4.2 Plan Module

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
      psg.plan_edges.add(dep_id → step.step_id, type="depends_on")

  # Emit GraphUpdateEvent
  emit GraphUpdateEvent({
    graph_id: psg.id,
    update_kind: "node_add",
    node_delta: 1 + len(plan_obj.steps),
    source_module: "Plan"
  })
```

---

### 4.3 Confirm Module

**Primary Responsibility**: Record approval/rejection decisions for sensitive operations.

**PSG Areas**:
- `psg.approval_nodes` (ownership: primary)
  - Confirm objects (confirm_id, target_id, status)
- `psg.decision_edges` (ownership: primary)
  - Edges from Confirm → Plan (approval relationships)

**Access Mode**: READ-WRITE
- **WRITE**: On Confirm decision creation/update
- **READ**: When checking approval status

**Event Hooks**:
- **RuntimeExecutionEvent** (SHOULD): When decision is finalized

**Learning Hooks**:
- **confirm_decision**: On approval/rejection completion

**Pseudo-code Example**:
```
on Confirm.decision_added(confirm_obj, decision):
  psg.approval_nodes[confirm_obj.confirm_id].decisions.append({
    decision_id: decision.decision_id,
    status: decision.status,
    decided_by_role: decision.decided_by_role,
    decided_at: decision.decided_at
  })

  # Update overall status
  psg.approval_nodes[confirm_obj.confirm_id].status = decision.status

  # Emit RuntimeExecutionEvent
  emit RuntimeExecutionEvent({
    execution_id: decision.decision_id,
    executor_kind: "human",
    status: decision.status == "approved" ? "completed" : "failed"
  })
```

---

### 4.4 Trace Module

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

---

### 4.5 Role Module

**Primary Responsibility**: Define agent roles and assignments.

**PSG Areas**:
- `psg.agent_roles` (ownership: primary)
  - Role definitions (role_id, name, capabilities)
- `psg.role_assignments` (ownership: primary)
  - Agent → Role mappings

**Access Mode**: READ-WRITE
- **WRITE**: On role creation/assignment
- **READ**: When querying which agent has which role

**Event Hooks**: None specific to Role module

**Learning Hooks**:
- **multi_agent_coordination**: When role assignments affect collaboration

**Pseudo-code Example**:
```
on Role.create(role_obj):
  psg.agent_roles[role_obj.role_id] = {
    name: role_obj.name,
    capabilities: role_obj.capabilities
  }

  for assignment in role_obj.assignments:
    psg.role_assignments.add(assignment.agent_id → role_obj.role_id)
```

---

### 4.6 Extension Module

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

---

### 4.7 Dialog Module

**Primary Responsibility**: Manage conversation threads for intent clarification.

**PSG Areas**:
- `psg.dialog_threads` (ownership: primary)
  - Dialog objects (dialog_id, turn_count)
- `psg.dialog_messages` (ownership: primary)
  - Message nodes (message_id, role, content)

**Access Mode**: READ-WRITE
- **WRITE**: On dialog turns
- **READ**: When retrieving conversation history

**Event Hooks**:
- **MethodologyEvent** (OPTIONAL): For dialog-driven reasoning

**Learning Hooks**:
- **intent_resolution**: When dialog resolves intent successfully

---

### 4.8 Collab Module

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

---

### 4.9 Core Module

**Primary Responsibility**: Governance, orchestration, conflict resolution.

**PSG Areas**:
- `psg.orchestration_nodes` (ownership: primary)
  - Orchestrator state, policies
- `psg.governance_rules` (ownership: primary)
  - Conflict resolution policies

**Access Mode**: READ-WRITE
- **WRITE**: On policy updates, conflict detection
- **READ**: When checking governance rules

**Event Hooks**:
- **PipelineStageEvent** (MUST): Core often controls pipeline

**Learning Hooks**:
- **pipeline_outcome**: Governance decisions affect outcomes

---

### 4.10 Network Module

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

---

### 4.11 PSG Runtime (Meta-Component)

**Primary Responsibility**: Manage entire PSG lifecycle, snapshots, queries.

**PSG Areas**: **Entire graph** (all nodes, all edges)

**Access Mode**: READ-WRITE (ultimate authority)

**Event Hooks**:
- **GraphUpdateEvent** (MUST): For every structural change

**Learning Hooks**:
- **graph_evolution**: On major topology changes

**Critical**: PSG Runtime emits GraphUpdateEvent for all changes made by any module.

---

### 4.12 Pipeline Controller (Meta-Component)

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

---

## 5. SA / MAP Profile → PSG Paths

### 5.1 SA Profile
**Single-Agent execution maps to PSG as**:
- SA session → PSG session node
- SA steps → PSG execution trace spans
- SA events → Trace module + RuntimeExecutionEvent

**References**: [SA Profile](../03-profiles/mplp-sa-profile.md)

### 5.2 MAP Profile
**Multi-Agent coordination maps to PSG as**:
- MAP session → PSG collaboration session node
- Turn-taking → PSG handoff edges
- Broadcast fan-out → PSG participant edges
- MAP events → Collab module + MAP-specific events

**References**: [MAP Profile](../03-profiles/mplp-map-profile.md)

---

## 6. Compliance Notes

### v1.0 Requirements

**Runtimes claiming MPLP v1.0 compatibility MUST**:
1. ✅ Document their Module→PSG mapping (which PSG areas each module touches)
2. ✅ Not contradict the access modes/ownership defined above
3. ✅ Emit GraphUpdateEvent for all PSG structural changes (from PSG Runtime)
4. ✅ Emit PipelineStageEvent for all pipeline stages (from Pipeline Controller)

**Runtimes MAY**:
- ⚠️ Use different PSG internal structure (as long as semantics preserved)
- ⚠️ Add vendor-specific PSG areas
- ⚠️ Optimize PSG storage/indexing

**Runtimes MUST NOT**:
- ❌ Violate ownership rules (e.g., Context writing to Plan nodes directly)
- ❌ Skip required event emissions
- ❌ Use inconsistent PSG→L2 projections

---

## 7. References

- [Runtime Glue Overview](mplp-runtime-glue-overview.md)
- [Crosscut→PSG & Events Binding](crosscut-psg-event-binding.md)
- [Observability Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)
- [Learning Sample Taxonomy](../05-learning/mplp-learning-taxonomy.yaml)

---

**End of Module→PSG Read/Write Path Matrix**

*This matrix establishes the protocol-level specification for how each MPLP module interacts with the PSG, ensuring consistent runtime behavior across implementations.*
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
