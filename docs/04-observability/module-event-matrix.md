---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
## 1. Matrix Overview

| Module    | Required Events | Recommended Events | Optional Events |
|-----------|-----------------|--------------------|--------------------|
| **Context** | GraphUpdateEvent | ImportProcessEvent | CostAndBudgetEvent |
| **Plan** | GraphUpdateEvent | IntentEvent, DeltaIntentEvent | ImpactAnalysisEvent, CompensationPlanEvent |
| **Confirm** | GraphUpdateEvent | IntentEvent | CompensationPlanEvent |
| **Trace** | RuntimeExecutionEvent | PipelineStageEvent | ExternalIntegrationEvent |
| **Role** | - | Methodology Event | - |
| **Extension** | - | ExternalIntegrationEvent | RuntimeExecutionEvent |
| **Dialog** | GraphUpdateEvent | IntentEvent | MethodologyEvent |
| **Collab** | GraphUpdateEvent | RuntimeExecutionEvent | MAP Events (MAPSessionStarted, etc.) |
| **Core** | PipelineStageEvent | RuntimeExecutionEvent | CostAndBudgetEvent |
| **Network** | GraphUpdateEvent | ExternalIntegrationEvent | RuntimeExecutionEvent |
| **PSG** | GraphUpdateEvent | - | ReasoningGraphEvent |
| **Pipeline** | PipelineStageEvent | - | - |

**Legend**:
- **Required**: MUST emit these events (v1.0 compliance obligation)
- **Recommended**: SHOULD emit these events (best practice)
- **Optional**: MAY emit these events (situational)

---

## 2. Per-Module Emission Rules

### 2.1 Context Module

**Required Events**:
- ✅ `GraphUpdateEvent` - When Context object created/updated/deleted (PSG node mutation)

**Recommended Events**:
- 🟦 `ImportProcessEvent` - During project import, context initialization

**Emission Rules**:
1. **Context Creation**: Emit GraphUpdateEvent with `update_kind: node_add`, `node_delta: 1`
2. **Context Update**: Emit GraphUpdateEvent with `update_kind: node_update`, `node_delta: 0`
3. **Import Phase**: Emit ImportProcessEvent at import start/completion

**Example Event Sequence**:
```
ImportProcessEvent (phase: scan)
  → GraphUpdateEvent (update_kind: node_add) [Context created]
  → ImportProcessEvent (phase: completed)
```

---

### 2.2 Plan Module

**Required Events**:
- ✅ `GraphUpdateEvent` - When Plan object or steps created/updated/deleted

**Recommended Events**:
- 🟦 `IntentEvent` - When Plan captures user intent
- 🟦 `DeltaIntentEvent` - When Plan modified based on feedback

**Optional Events**:
- 🟩 `ImpactAnalysisEvent` - When analyzing Plan change impact
- 🟩 `CompensationPlanEvent` - When generating compensation steps

**Emission Rules**:
1. **Plan Creation**: Emit IntentEvent (actor creates Plan) + GraphUpdateEvent(node_add)
2. **Step Add/Update/Delete**: Emit GraphUpdateEvent for each structural change
3. **Plan Revision**: Emit DeltaIntentEvent + GraphUpdateEvent(node_update)

**Example Event Sequence**:
```
IntentEvent (actor_kind: user, channel: cli)
  → GraphUpdateEvent (update_kind: node_add) [Plan created]
  → GraphUpdateEvent (update_kind: edge_add, edge_delta: 3) [Steps added]
  → DeltaIntentEvent (delta_id: revision-1)
  → GraphUpdateEvent (update_kind: node_update) [Plan revised]
```

---

### 2.3 Confirm Module

**Required Events**:
- ✅ `GraphUpdateEvent` - When Confirm decision recorded

**Recommended Events**:
- 🟦 `IntentEvent` - When confirmation request issued

**Optional Events**:
- 🟩 `CompensationPlanEvent` - When Plan requires compensation approval

**Emission Rules**:
1. **Confirm Request**: Emit IntentEvent (actor: approval_authority)
2. **Decision Recorded**: Emit GraphUpdateEvent (Confirm.decisions[] updated)

---

### 2.4 Trace Module

**Required Events**:
- ✅ `RuntimeExecutionEvent` - For each execution span

**Recommended Events**:
- 🟦 `PipelineStageEvent` - When Trace captures Pipeline transitions

**Optional Events**:
- 🟩 `ExternalIntegrationEvent` - When Trace logs external integrations

**Emission Rules**:
1. **Execution Start**: Emit RuntimeExecutionEvent (status: running)
2. **Execution Complete**: Emit RuntimeExecutionEvent (status: completed/failed)
3. **Pipeline Stage Transition**: Emit PipelineStageEvent (if tracked in Trace)

**Example Event Sequence**:
```
RuntimeExecutionEvent (executor_kind: agent, status: running)
  → PipelineStageEvent (stage_status: running)
  → RuntimeExecutionEvent (status: completed)
  → PipelineStageEvent (stage_status: completed)
```

---

### 2.5 Role Module

**Recommended Events**:
- 🟦 `MethodologyEvent` - When Role defines methodology constraints

**Emission Rules**:
1. **Role Methodology Binding**: Emit MethodologyEvent when Role specifies required methods

---

### 2.6 Extension Module

**Recommended Events**:
- 🟦 `ExternalIntegrationEvent` - When Extension invoked

**Optional Events**:
- 🟩 `RuntimeExecutionEvent` - When Extension execution tracked

**Emission Rules**:
1. **Extension Invocation**: Emit ExternalIntegrationEvent (integration_kind: tool/api)
2. **Extension Execution**: Optionally emit RuntimeExecutionEvent (executor_kind: external)

---

### 2.7 Dialog Module

**Required Events**:
- ✅ `GraphUpdateEvent` - When Dialog messages added/updated

**Recommended Events**:
- 🟦 `IntentEvent` - When Dialog captures conversational intent

**Optional Events**:
- 🟩 `MethodologyEvent` - When Dialog follows specific conversation methodology

**Emission Rules**:
1. **Message Added**: Emit IntentEvent (if user message) + GraphUpdateEvent(node_add)
2. **Dialog Thread Updated**: Emit GraphUpdateEvent for thread structure changes

---

### 2.8 Collab Module

**Required Events**:
- ✅ `GraphUpdateEvent` - When Collab session or participants updated

**Recommended Events**:
- 🟦 `RuntimeExecutionEvent` - When Collab coordinates agent execution

**Optional Events**:
- 🟩 **MAP Events** - If implementing MAP Profile:
  - MAPSessionStarted, MAPRolesAssigned
  - MAPTurnDispatched, MAPTurnCompleted
  - MAPBroadcastSent, MAPBroadcastReceived

**Emission Rules**:
1. **Collab Session Creation**: Emit GraphUpdateEvent(node_add)
2. **Participant Added**: Emit GraphUpdateEvent(edge_add)
3. **MAP Coordination**: Emit MAP Events per MAP Profile specification

---

### 2.9 Core Module

**Required Events**:
- ✅ `PipelineStageEvent` - When Core orchestrates Pipeline stages

**Recommended Events**:
- 🟦 `RuntimeExecutionEvent` - When Core manages execution lifecycle

**Optional Events**:
- 🟩 `CostAndBudgetEvent` - When Core enforces budget policies

**Emission Rules**:
1. **Pipeline Stage Transition**: Emit PipelineStageEvent (REQUIRED for v1.0)
2. **Budget Enforcement**: Emit CostAndBudgetEvent when budget checked

---

### 2.10 Network Module

**Required Events**:
- ✅ `GraphUpdateEvent` - When Network topology updated

**Recommended Events**:
- 🟦 `ExternalIntegrationEvent` - When Network facilitates external communication

**Optional Events**:
- 🟩 `RuntimeExecutionEvent` - When Network tracks message routing execution

**Emission Rules**:
1. **Network Node Add/Remove**: Emit GraphUpdateEvent (node_delta tracking)
2. **External Communication**: Emit ExternalIntegrationEvent (target_system)

---

### 2.11 PSG (Project Semantic Graph)

**Required Events**:
- ✅ `GraphUpdateEvent` - For ALL PSG structural changes (CRITICAL for v1.0)

**Optional Events**:
- 🟩 `ReasoningGraphEvent` - When PSG used for reasoning (distinct from structural updates)

**Emission Rules**:
1. **Node Add**: Emit GraphUpdateEvent (update_kind: node_add, node_delta: +1)
2. **Node Update**: Emit GraphUpdateEvent (update_kind: node_update, node_delta: 0)
3. **Node Delete**: Emit GraphUpdateEvent (update_kind: node_delete, node_delta: -1)
4. **Edge Add**: Emit GraphUpdateEvent (update_kind: edge_add, edge_delta: +1)
5. **Edge Update**: Emit GraphUpdateEvent (update_kind: edge_update, edge_delta: 0)
6. **Edge Delete**: Emit GraphUpdateEvent (update_kind: edge_delete, edge_delta: -1)
7. **Bulk Operation**: Emit GraphUpdateEvent (update_kind: bulk, specify both deltas)

**Critical**: PSG GraphUpdateEvent is MANDATORY for v1.0 compliance.

---

### 2.12 Pipeline Controller

**Required Events**:
- ✅ `PipelineStageEvent` - For EVERY Pipeline stage transition (CRITICAL for v1.0)

**Emission Rules**:
1. **Stage Entry**: Emit PipelineStageEvent (stage_status: running)
2. **Stage Exit**: Emit PipelineStageEvent (stage_status: completed/failed/skipped)
3. **Stage Order**: Ensure `stage_order` is monotonically increasing

**Critical**: Pipeline PipelineStageEvent is MANDATORY for v1.0 compliance.

---

## 3. Compliance Summary

### 3.1 v1.0 REQUIRED Events

All MPLP v1.0 compliant runtimes MUST emit:

1. **PipelineStageEvent** - From Core/Pipeline modules
2. **GraphUpdateEvent** - From PSG + all modules modifying graph structure

**Minimum Compliance**: If runtime has Pipeline, emit PipelineStageEvent. If runtime has PSG, emit GraphUpdateEvent.

### 3.2 Recommended Events

For production-grade observability, runtimes SHOULD emit:
- IntentEvent (user interaction tracking)
- RuntimeExecutionEvent (execution monitoring)
- ImportProcessEvent (project lifecycle)
- ExternalIntegrationEvent (integration health)

### 3.3 Profile Events

If implementing SA/MAP Profiles, emit corresponding Profile events per Profile specifications.

---

## 4. Event Ordering Invariants

**Temporal Ordering**:
- Events within a module MUST have monotonically non-decreasing timestamps
- Pipeline events MUST respect stage_order

**Causal Ordering**:
- IntentEvent → DeltaIntentEvent (delta references intent)
- Pipeline stage transitions must be sequential (no gaps in stage_order)

---

## 5. References

- [Event Taxonomy](mplp-event-taxonomy.yaml) - Complete event family definitions
- [Core Event Schema](../../schemas/v2/events/mplp-event-core.schema.json)
- [PipelineStageEvent Schema](../../schemas/v2/events/mplp-pipeline-stage-event.schema.json)
- [GraphUpdateEvent Schema](../../schemas/v2/events/mplp-graph-update-event.schema.json)
- [SA Events](../03-profiles/sa-events.md) - SA Profile events
- [MAP Events](../03-profiles/map-events.md) - MAP Profile events

---

**End of Module→Event Emission Matrix**

*This matrix defines the protocol-level obligations for event emission across all MPLP core components, ensuring consistent observability for v1.0 compliant runtimes.*
