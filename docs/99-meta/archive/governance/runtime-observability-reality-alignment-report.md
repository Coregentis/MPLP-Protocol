> [INTERNAL ONLY]
> This document is an internal process / governance artifact.
> It is **not** part of the MPLP v1.0 public specification and **MUST NOT** be included in public releases or documentation maps.

---
Status: Internal
Not part of MPLP v1.0 Spec. Retained for historical and audit purposes only.
---

---
title: "Runtime & Observability Reality Alignment Report"
version: "1.0.0"
date: "2025-12-01"
status: "Frozen for governance"
---

# Runtime & Observability Reality Alignment Report  
MPLP Protocol v1.0 — L3 Runtime & L2.5 Observability

This report establishes the **actual reality** of MPLP v1.0 runtime and observability behavior,  
by scanning schemas, invariants, events, learning samples, PSG specs, and golden flows.

---

## 1. Executive Summary

### 1.1 Alignment Matrix

| Aspect             | Schemas | Docs (04) | Docs (05) | Docs (06) | Golden Flows | Alignment |
|--------------------|---------|-----------|-----------|-----------|--------------|-----------|
| Event Taxonomy     | ⚠️      | ✅        | n/a       | n/a       | ✅           | Needs Schema Fix |
| Module→Event Matrix| ✅      | ✅        | n/a       | n/a       | ✅           | OK |
| Learning Taxonomy  | ✅      | n/a       | ⚠️        | n/a       | ⚠️           | Needs Doc Fix |
| PSG Paths (L3)     | n/a     | n/a       | n/a       | ✅        | ✅           | OK |
| Crosscut Bindings  | n/a     | n/a       | n/a       | ✅        | ✅           | OK |
| Drift & Rollback   | n/a     | n/a       | n/a       | ⚠️        | ⚠️           | Needs Spec Fix |

**Key findings:**
- **Event Schema Gap**: The Event Taxonomy defines 12 core families, but `schemas/v2/events/` only contains specific schemas for `pipeline_stage`, `graph_update`, and `runtime_execution`. The other 9 families (Import, Intent, etc.) lack specific schemas and likely rely on a generic definition or are missing.
- **Learning Doc Gap**: `schemas/v2/learning/` defines `core`, `delta`, and `intent` samples, but `docs/05-learning/` documentation is not fully aligned with this specific set.
- **Runtime Alignment**: `module-psg-paths.md` and `crosscut-psg-event-binding.md` are well-aligned with the 10 L2 modules and 9 crosscuts.

---

## 2. Event Reality (L2.5 Observability)

### 2.1 Schema Reality (`schemas/v2/events/*.schema.json`)

- **Core Schemas**:
  - `mplp-event-core.schema.json` (Base type)
  - `mplp-graph-update-event.schema.json` (Required)
  - `mplp-pipeline-stage-event.schema.json` (Required)
  - `mplp-runtime-execution-event.schema.json` (Recommended)
- **Profile Schemas**:
  - `mplp-sa-event.schema.json`
  - `mplp-map-event.schema.json`
- **Missing Specific Schemas** (defined in Taxonomy but no JSON file):
  - `ImportProcessEvent`
  - `IntentEvent`
  - `DeltaIntentEvent`
  - `ImpactAnalysisEvent`
  - `CompensationPlanEvent`
  - `MethodologyEvent`
  - `ReasoningGraphEvent`
  - `CostAndBudgetEvent`
  - `ExternalIntegrationEvent`

### 2.2 Taxonomy Reality (`docs/04-observability/mplp-event-taxonomy.yaml`)

- **Families Defined**: 12 Core + 2 Profile.
- **Alignment**:
  - The taxonomy explicitly lists "minimal_fields" for the missing schemas, suggesting they are conceptually defined but physically implemented via the generic Core schema or missing files.
  - **Action**: Need to clarify if these should use `mplp-event-core` or if new schema files are needed. For v1.0, we will assume they use the generic Core schema unless specific validation is required.

### 2.3 Module-Event Matrix Reality (`docs/04-observability/module-event-matrix.md`)

- **Status**: Comprehensive mapping of 10 Modules + PSG + Pipeline to the 12 Event Families.
- **Consistency**:
  - Matches the "Required/Recommended/Optional" levels found in 02-modules specs.
  - Matches the SA/MAP Profile event obligations.

### 2.4 Golden Flows Event Reality (`tests/golden/flows/*`)

- **Observed Events**:
  - `FLOW-01` to `FLOW-05`: Primarily `PipelineStageEvent`, `GraphUpdateEvent`, `RuntimeExecutionEvent`.
  - `SA-01/02`: `SA*` events.
  - `MAP-01/02`: `MAP*` events.
- **Gap**: The "Optional" families (Methodology, Cost, etc.) are rarely seen in current Golden Flows, which is acceptable for "Optional" status.

### 2.5 Event Mismatch Summary

```
mismatch:
* 9 Event Families defined in Taxonomy lack dedicated JSON Schema files.
* Taxonomy implies specific fields for these families that are not enforced by a schema.
status: Needs Fix (Clarify schema strategy in Taxonomy doc)
```

---

## 3. Learning Reality (L2.6 Learning Loop)

### 3.1 Schema Reality (`schemas/v2/learning/*.schema.json`)

- **Files**:
  - `mplp-learning-sample-core.schema.json`
  - `mplp-learning-sample-delta.schema.json`
  - `mplp-learning-sample-intent.schema.json`
- **Implied Taxonomy**: Core, Delta, Intent.

### 3.2 Taxonomy & Collection Points (`docs/05-learning/`)

- **Current State**: Documentation in `05-learning` is currently sparse/skeleton relative to the schemas.
- **Gap**: Need to ensure `mplp-learning-taxonomy.yaml` strictly matches the 3 existing schemas and doesn't invent others (like "Outcome" or "Feedback") unless they map to Core.

### 3.3 Golden Flows Learning Reality

- **Status**: No explicit `LearningSample` generation in current Golden Flows.
- **Conclusion**: Learning Loop is a "Day 2" feature in v1.0. Documentation should reflect this as "Reserved for future use" or "Optional".

### 3.4 Learning Mismatch Summary

```
mismatch:
* Docs may over-promise on Learning features not backed by Schemas/Tests.
status: Needs Doc Fix (Scope reduction to match Schemas)
```

---

## 4. Runtime Reality (L3 – PSG & Glue)

### 4.1 PSG Paths Reality (`docs/06-runtime/module-psg-paths.md`)

- **Status**: ✅ Excellent alignment.
- **Coverage**: Covers all 10 L2 modules + PSG Runtime + Pipeline.
- **Consistency**: Matches the "Responsibilities" sections of the rewritten 02-modules docs.

### 4.2 Crosscut Bindings Reality (`docs/06-runtime/crosscut-psg-event-binding.md`)

- **Status**: ✅ Excellent alignment.
- **Coverage**: Covers all 9 crosscuts.
- **Bindings**: Correctly maps crosscuts to the available Event Families (e.g., Coordination → MAP Events).

### 4.3 Drift Detection & Rollback Reality

- **Docs**: `drift-detection-spec.md`, `rollback-minimal-spec.md`.
- **Reality**: These are specification documents without direct schema/code backing in `packages/` (unlike Events).
- **Status**: They serve as "Implementation Guidelines" for L3 Runtimes.
- **Gap**: Need to ensure they explicitly reference the *existing* Invariants and Trace schemas as their mechanism.

### 4.4 Runtime Mismatch Summary

```
mismatch:
* Drift/Rollback specs need to be explicitly grounded in Invariants/Trace schemas to avoid being "pure theory".
status: Needs Spec Fix
```

---

## 5. Global Problems Summary

```
global_mismatches:
* Event Taxonomy is richer than the actual Schema set (12 families vs 3 core schemas).
* Learning Documentation is likely out of sync with the limited Schema set.
* Runtime Specs (Drift/Rollback) need tighter binding to the Core Protocol (Invariants).
```

---

## 6. Fix Plan for 04-observability, 05-learning, 06-runtime

```
fix_plan:
  observability:
    - Update `mplp-event-taxonomy.yaml`: Explicitly state which families use the Generic Core Schema vs. Specific Schemas.
    - Rewrite `mplp-observability-overview.md`: Reflect the "3 Physical / 12 Logical" event family structure.
    - Verify `module-event-matrix.md` remains accurate.

  learning:
    - Update `mplp-learning-taxonomy.yaml`: Restrict to Core, Delta, Intent (matching schemas).
    - Update `learning-collection-points.md`: Map only to these 3 types.

  runtime:
    - `module-psg-paths.md`: Keep as is (Good).
    - `crosscut-psg-event-binding.md`: Keep as is (Good).
    - `drift-detection-spec.md`: Add references to `schemas/v2/invariants/*.yaml`.
    - `rollback-minimal-spec.md`: Add references to `schemas/v2/common/trace-base.schema.json`.

  common_actions:
    - Add Frozen Headers to all normative docs.
    - Update `golden-flow-registry.md` with Event/PSG indices.
```

---

This report must be reviewed before any normative change is made to runtime or observability behavior.
