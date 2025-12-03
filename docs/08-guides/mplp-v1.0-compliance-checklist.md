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
## How to Use This Checklist

1. Review each section and mark items as:
   - ✅ **Implemented** - Feature complete and tested
   - ⏳ **In Progress** - Partially implemented
   - ❌ **Not Implemented** - Not started
   - N/A **Not Applicable** - Optional feature, not implementing

2. **REQUIRED** items MUST be ✅ for v1.0 compliance
3. **RECOMMENDED** items SHOULD be ✅ for best practice
4. **OPTIONAL** items are entirely at your discretion

---

## Compliance Levels

### ✅ REQUIRED
**Must implement for "MPLP v1.0 compliant" claim**

### ⚠️ RECOMMENDED
**Strongly suggested, not mandatory**

### ⭕ OPTIONAL
**Nice-to-have, but not required**

---

## 1. L1/L2 Core Modules (REQUIRED)

### 1.1 Context Module

| Status | Item | Requirement | Related Spec | Evidence Type |
|--------|------|-------------|--------------|---------------|
| [ ] | Context schema validation | ✅ REQUIRED | `docs/02-modules/context-module.md` | JSON Schema Validation |
| [ ] | `context_id` (UUID v4) | ✅ REQUIRED | `docs/02-modules/context-module.md` | Invariant Check |
| [ ] | `timestamp` (ISO 8601) | ✅ REQUIRED | `docs/02-modules/context-module.md` | Invariant Check |
| [ ] | `title` (non-empty string) | ✅ REQUIRED | `docs/02-modules/context-module.md` | Invariant Check |
| [ ] | `constraints` support | ⚠️ RECOMMENDED | `docs/02-modules/context-module.md` | Golden Flow (SA-02) |

**Reference**: `schemas/v2/context/mplp-context.schema.json`

---

### 1.2 Plan Module

| Status | Item | Requirement | Related Spec | Evidence Type |
|--------|------|-------------|--------------|---------------|
| [ ] | Plan schema validation | ✅ REQUIRED | `docs/02-modules/plan-module.md` | JSON Schema Validation |
| [ ] | `plan_id` (UUID v4) | ✅ REQUIRED | `docs/02-modules/plan-module.md` | Invariant Check |
| [ ] | `context_id` reference | ✅ REQUIRED | `docs/02-modules/plan-module.md` | Invariant Check (eq) |
| [ ] | `steps[]` array | ✅ REQUIRED | `docs/02-modules/plan-module.md` | Invariant Check |
| [ ] | Each step has `step_id`, `description`, `agent_role` | ✅ REQUIRED | `docs/02-modules/plan-module.md` | Invariant Check |
| [ ] | `dependencies[]` support | ✅ REQUIRED | `docs/02-modules/plan-module.md` | Golden Flow (FLOW-03) |
| [ ] | `agent_role` polymorphism | ✅ REQUIRED | `docs/02-modules/plan-module.md` | Golden Flow (FLOW-03/04) |

**Reference**: `schemas/v2/plan/mplp-plan.schema.json`

---

### 1.3 Confirm Module

| Status | Item | Requirement | Related Spec | Evidence Type |
|--------|------|-------------|--------------|---------------|
| [ ] | Confirm schema validation | ✅ REQUIRED | `docs/02-modules/confirm-module.md` | JSON Schema Validation |
| [ ] | `confirm_id` (UUID v4) | ✅ REQUIRED | `docs/02-modules/confirm-module.md` | Invariant Check |
| [ ] | `target_plan` reference | ✅ REQUIRED | `docs/02-modules/confirm-module.md` | Invariant Check (eq) |
| [ ] | `decisions[]` array | ✅ REQUIRED | `docs/02-modules/confirm-module.md` | Invariant Check |
| [ ] | Multi-round approval support | ✅ REQUIRED | `docs/02-modules/confirm-module.md` | Golden Flow (FLOW-05) |
| [ ] | `status` (enum: pending, approved, rejected) | ✅ REQUIRED | `docs/02-modules/confirm-module.md` | Invariant Check |

**Reference**: `schemas/v2/confirm/mplp-confirm.schema.json`

---

### 1.4 Trace Module

| Status | Item | Requirement | Related Spec | Evidence Type |
|--------|------|-------------|--------------|---------------|
| [ ] | Trace schema validation | ✅ REQUIRED | `docs/02-modules/trace-module.md` | JSON Schema Validation |
| [ ] | `trace_id` (UUID v4) | ✅ REQUIRED | `docs/02-modules/trace-module.md` | Invariant Check |
| [ ] | `context_id` reference | ✅ REQUIRED | `docs/02-modules/trace-module.md` | Invariant Check (eq) |
| [ ] | `events[]` array (spans) | ✅ REQUIRED | `docs/02-modules/trace-module.md` | Invariant Check |
| [ ] | Hierarchical spans (parent-child) | ⚠️ RECOMMENDED | `docs/02-modules/trace-module.md` | Runtime Logs |
| [ ] | `timestamp` on all events | ✅ REQUIRED | `docs/02-modules/trace-module.md` | Invariant Check |

**Reference**: `schemas/v2/trace/mplp-trace.schema.json`
**Reference**: `schemas/v2/trace/mplp-trace.schema.json`

---

### 1.5 Other Core Modules (Structure-Defined, Behavior-Open)

| Status | Module | Requirement |
|--------|--------|-------------|
| [ ] | **Role** - Agent role definitions | ⚠️ RECOMMENDED |
| [ ] | **Extension** - Tool adapters | ⚠️ RECOMMENDED |
| [ ] | **Dialog** - Conversation threads | ⭕ OPTIONAL |
| [ ] | **Collab** - Multi-agent coordination | ⭕ OPTIONAL (REQUIRED for MAP) |
| [ ] | **Core** - Governance & orchestration | ⚠️ RECOMMENDED |
| [ ] | **Network** - External system integration | ⭕ OPTIONAL |

---

## 2. Execution Profiles

### 2.1 SA Profile (REQUIRED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | SA Profile implemented | ✅ REQUIRED |
| [ ] | Context → Plan → Trace flow | ✅ REQUIRED |
| [ ] | Optional Confirm support | ⚠️ RECOMMENDED |
| [ ] | Single-agent execution semantics | ✅ REQUIRED |
| [ ] | Pass SA-FLOW-01 (Golden Test) | ✅ REQUIRED |
| [ ] | Pass SA-FLOW-02 (Golden Test) | ✅ REQUIRED |

**Reference**: `docs/03-profiles/mplp-sa-profile.md`

---

### 2.2 MAP Profile (RECOMMENDED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | MAP Profile implemented | ⚠️ RECOMMENDED |
| [ ] | Turn-Taking mode | ⚠️ RECOMMENDED |
| [ ] | Broadcast mode | ⚠️ RECOMMENDED |
| [ ] | Orchestrated mode | ⚠️ RECOMMENDED |
| [ ] | Collab module support | ⚠️ RECOMMENDED |
| [ ] | MAP events emission | ⚠️ RECOMMENDED |
| [ ] | Pass MAP-FLOW-01 (Golden Test) | ⚠️ RECOMMENDED |
| [ ] | Pass MAP-FLOW-02 (Golden Test) | ⚠️ RECOMMENDED |

**Reference**: `docs/03-profiles/mplp-map-profile.md`

---

## 3. Observability Layer

### 3.1 Event Emission (REQUIRED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | **PipelineStageEvent** emission | ✅ REQUIRED |
| [ ] | **GraphUpdateEvent** emission | ✅ REQUIRED |
| [ ] | Event schemas conform to specs | ✅ REQUIRED |
| [ ] | Events pass observability invariants | ✅ REQUIRED |

**Reference**: `docs/04-observability/mplp-observability-overview.md`

---

### 3.2 Other Observability Events (RECOMMENDED/OPTIONAL)

| Status | Event Family | Requirement |
|--------|--------------|-------------|
| [ ] | ImportProcessEvent | ⭕ OPTIONAL |
| [ ] | IntentEvent | ⭕ OPTIONAL |
| [ ] | DeltaIntentEvent | ⭕ OPTIONAL |
| [ ] | ImpactAnalysisEvent | ⭕ OPTIONAL |
| [ ] | CompensationPlanEvent | ⭕ OPTIONAL |
| [ ] | MethodologyEvent | ⭕ OPTIONAL |
| [ ] | ReasoningGraphEvent | ⭕ OPTIONAL |
| [ ] | **RuntimeExecutionEvent** | ⚠️ RECOMMENDED |
| [ ] | **CostAndBudgetEvent** | ⚠️ RECOMMENDED |
| [ ] | **ExternalIntegrationEvent** | ⚠️ RECOMMENDED |

---

## 4. Learning Layer

### 4.1 LearningSample Collection (RECOMMENDED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | LearningSample schemas defined | ✅ REQUIRED (if collecting) |
| [ ] | Samples pass learning invariants | ✅ REQUIRED (if collecting) |
| [ ] | Collect intent_resolution samples | ⚠️ RECOMMENDED |
| [ ] | Collect delta_impact samples | ⚠️ RECOMMENDED |
| [ ] | Collect pipeline_outcome samples | ⚠️ RECOMMENDED |
| [ ] | Collect confirm_decision samples | ⚠️ RECOMMENDED |
| [ ] | Collect graph_evolution samples | ⭕ OPTIONAL |
| [ ] | Collect multi_agent_coordination samples | ⭕ OPTIONAL |

**Note**: Collection is RECOMMENDED, conformance is REQUIRED if collecting

**Reference**: `docs/05-learning/mplp-learning-overview.md`

---

## 5. Runtime Glue & PSG

### 5.1 PSG as Single Source of Truth (REQUIRED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | PSG as authoritative state | ✅ REQUIRED |
| [ ] | L2 objects are PSG projections | ✅ REQUIRED |
| [ ] | All queries go through PSG | ✅ REQUIRED |
| [ ] | No scattered in-memory caches | ✅ REQUIRED |

**Reference**: `docs/06-runtime/mplp-runtime-glue-overview.md`

---

### 5.2 Module→PSG Mapping (REQUIRED Documentation)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | Module→PSG mapping documented | ✅ REQUIRED |
| [ ] | Context → project_root, environment, constraints | ✅ REQUIRED |
| [ ] | Plan → plans, plan_steps, dependencies | ✅ REQUIRED |
| [ ] | Confirm → approval_nodes, decision_edges | ✅ REQUIRED |
| [ ] | Trace → execution_traces, spans | ✅ REQUIRED |
| [ ] | PSG Runtime → entire graph | ✅ REQUIRED |
| [ ] | Pipeline Controller → pipeline_state | ✅ REQUIRED |

**Reference**: `docs/06-runtime/module-psg-paths.md`

---

### 5.3 Event Emission Rules (REQUIRED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | GraphUpdateEvent on ALL PSG structural changes | ✅ REQUIRED |
| [ ] | `update_kind` correct (node_add, edge_add, bulk, etc.) | ✅ REQUIRED |
| [ ] | `node_delta` and `edge_delta` accurate | ✅ REQUIRED |
| [ ] | PipelineStageEvent on ALL stage transitions | ✅ REQUIRED |
| [ ] | `stage_status` correct (pending, running, completed, failed, etc.) | ✅ REQUIRED |

**Reference**: `docs/06-runtime/crosscut-psg-event-binding.md`

---

### 5.4 Drift Detection & Rollback (RECOMMENDED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | PSG snapshot capability | ⚠️ RECOMMENDED |
| [ ] | Snapshot taken at milestones | ⚠️ RECOMMENDED |
| [ ] | Drift detection (snapshot comparison) | ⚠️ RECOMMENDED |
| [ ] | PSG restoration from snapshot | ⚠️ RECOMMENDED |
| [ ] | Rollback recorded in Trace | ⚠️ RECOMMENDED |
| [ ] | GraphUpdateEvent (bulk) on rollback | ⚠️ RECOMMENDED |

**References**:
- `docs/06-runtime/drift-detection-spec.md`
- `docs/06-runtime/rollback-minimal-spec.md`

---

## 6. Integration Layer (OPTIONAL)

### 6.1 Integration Events (OPTIONAL)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | Integration schemas defined | ✅ REQUIRED (if integrating) |
| [ ] | Events pass integration invariants | ✅ REQUIRED (if integrating) |
| [ ] | Events wrapped as ExternalIntegrationEvent.payload | ⚠️ RECOMMENDED |
| [ ] | tool_event emission | ⭕ OPTIONAL |
| [ ] | file_update_event emission | ⭕ OPTIONAL |
| [ ] | git_event emission | ⭕ OPTIONAL |
| [ ] | ci_event emission | ⭕ OPTIONAL |

**Note**: Integration Layer is entirely OPTIONAL for v1.0 compliance

**Reference**: `docs/07-integration/mplp-minimal-integration-spec.md`

---

## 7. Golden Test Suite (REQUIRED)

### 7.1 Core Protocol Flows (REQUIRED)

| Status | Flow | Requirement |
|--------|------|-------------|
| [ ] | **FLOW-01**: Single Agent Plan | ✅ REQUIRED |
| [ ] | **FLOW-02**: Single Agent Large Plan | ✅ REQUIRED |
| [ ] | **FLOW-03**: Single Agent With Tools | ✅ REQUIRED |
| [ ] | **FLOW-04**: Single Agent LLM Enrichment | ✅ REQUIRED |
| [ ] | **FLOW-05**: Single Agent Confirm Required | ✅ REQUIRED |

**Reference**: `tests/golden/flows/flow-01~05/`

---

### 7.2 Profile Flows (REQUIRED for profiles)

| Status | Flow | Requirement |
|--------|------|-------------|
| [ ] | **SA-FLOW-01**: SA Basic | ✅ REQUIRED (SA Profile) |
| [ ] | **SA-FLOW-02**: SA Step Evaluation | ✅ REQUIRED (SA Profile) |
| [ ] | **MAP-FLOW-01**: Turn Taking | ⚠️ RECOMMENDED (MAP Profile) |
| [ ] | **MAP-FLOW-02**: Broadcast Fanout | ⚠️ RECOMMENDED (MAP Profile) |

**Reference**: `docs/08-tests/golden-test-suite-overview.md`

---

## 8. Documentation (REQUIRED)

| Status | Item | Requirement |
|--------|------|-------------|
| [ ] | Module→PSG mapping documented | ✅ REQUIRED |
| [ ] | Event emission obligations documented | ✅ REQUIRED |
| [ ] | Crosscut implementation documented | ⚠️ RECOMMENDED |
| [ ] | Integration approach documented (if used) | ✅ REQUIRED (if integrating) |

---

## Compliance Summary

### v1.0 REQUIRED Checklist

**Core Protocol**:
- [ ] Context, Plan, Confirm, Trace modules implemented
- [ ] All schemas validate correctly
- [ ] Core invariants pass

**Profiles**:
- [ ] SA Profile implemented
- [ ] SA-FLOW-01 and SA-FLOW-02 pass

**Observability**:
- [ ] PipelineStageEvent emitted
- [ ] GraphUpdateEvent emitted

**Runtime Glue**:
- [ ] PSG as single source of truth
- [ ] Module→PSG mapping documented
- [ ] Event emission rules followed

**Golden Tests**:
- [ ] All 9 Golden Flows pass (FLOW-01~05, SA-01/02, MAP-01/02 if implementing MAP)

---

### v1.0 RECOMMENDED Checklist

- [ ] MAP Profile implemented
- [ ] RuntimeExecutionEvent emitted
- [ ] LearningSample collection implemented
- [ ] Drift detection implemented
- [ ] Rollback capability implemented
- [ ] Role, Extension, Core modules implemented

---

### v1.0 OPTIONAL Checklist

- [ ] Integration Layer (IDE/CI/Git)
- [ ] Dialog, Network modules
- [ ] Other Observability events
- [ ] Advanced drift/rollback features

---

## Self-Assessment

**Total REQUIRED items completed**: _____ / _____

**Total RECOMMENDED items completed**: _____ / _____

**Total OPTIONAL items completed**: _____ / _____

**Overall v1.0 Compliance**: ✅ / ❌

---

## Next Steps

**If compliant**:
1. ✅ Run full Golden Test Suite validation
2. ✅ Document your implementation
3. ✅ Claim "MPLP v1.0 compliant"
4. ✅ Link to MPLP Protocol Spec Pack

**If not compliant**:
1. ❌ Review failed items
2. ❌ Prioritize REQUIRED items
3. ❌ Re-test after implementation
4. ❌ Repeat until compliant

---

**End of MPLP v1.0 Compliance Checklist**

*Use this checklist to systematically assess your MPLP v1.0 compliance. For detailed requirements, see [Compliance Guide](mplp-v1.0-compliance-guide.md).*
