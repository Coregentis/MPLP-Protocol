> [INTERNAL ONLY]
> This document is an internal process / governance artifact.
> It is **not** part of the MPLP v1.0 public specification and **MUST NOT** be included in public releases or documentation maps.

---
Status: Internal
Not part of MPLP v1.0 Spec. Retained for historical and audit purposes only.
---

---
title: "03-profiles Reality Alignment Report"
version: "1.0.0"
date: "2025-12-01"
status: "Frozen for governance"
---

# 03-profiles Reality Alignment Report  
MPLP Protocol v1.0 — SA/MAP Profiles Reality

This report establishes the **actual reality** of MPLP v1.0 Single-Agent (SA) and Multi-Agent Profile (MAP)  
by scanning existing YAML specs, documentation, schemas, invariants, events, runtime specs, and golden tests.

---

## 1. Executive Summary

| Profile | YAML Spec | MD Spec | Events Doc | Diagrams | Invariants | Golden Flows | Alignment |
|---------|-----------|---------|-----------|----------|-----------|--------------|-----------|
| SA      | ✅        | ⚠️ (Format) | ⚠️ (Format) | ✅       | ✅        | ✅           | Needs Template Fix |
| MAP     | ✅        | ⚠️ (Format) | ⚠️ (Format) | ✅       | ✅        | ✅           | Needs Template Fix |

**Summary of main gaps:**
- **Template Mismatch**: Existing MD specs (`mplp-sa-profile.md`, `mplp-map-profile.md`) contain high-quality content but do not follow the strict "Profile Specification Template" (missing Frozen Headers, specific section ordering).
- **Events Doc Structure**: Existing Events docs (`sa-events.md`, `map-events.md`) are descriptive catalogs but do not follow the "Profile Event Obligations" normative structure.
- **Content Reality**: The actual content (lifecycle, states, invariants) is highly consistent across YAML, MD, and Invariants files. The "Reality" is stable; the "Documentation" needs governance formatting.

---

## 2. SA Profile – Reality Scan

### 2.1 YAML Spec Reality (`mplp-sa-profile.yaml`)

- **Existence**: ✅
- **Structure summary**:
  - `root`: `sa_profile`
  - `version`: "1.0.0"
  - `lifecycle`: 6 states (`initialize`, `load_context`, `evaluate_plan`, `execute_step`, `emit_trace`, `complete`)
  - `capabilities`: `read_context`, `read_plan`, `execute_plan_step`, `write_trace`
  - `dependencies`: `context`, `plan`, `trace`
  - `invariants_ref`: `schemas/v2/invariants/sa-invariants.yaml`
  - `minimal_flows`: `sa-flow-01-basic`, `sa-flow-02-step-evaluation`
- **Mismatches / gaps**:
  - None. YAML is the source of truth for the lifecycle.

### 2.2 MD Spec Reality (`mplp-sa-profile.md`)

- **Status**: ✅ Complete Content / ⚠️ Template Mismatch
- **Current sections**:
  - Overview, Responsibilities, Execution Lifecycle, Interaction with L2 Modules, SA Event Chain, Invariants, Dependencies, Minimal Flows.
- **Missing content**:
  - **Frozen Header**: Missing standard governance header.
  - **Normative Structure**: Needs to be reorganized into "Identity & Scope", "Required Modules", "Execution Model" per new template.

### 2.3 Events Reality (`sa-events.md`)

- **Corresponding Doc**: `docs/03-profiles/sa-events.md`
- **Actual Events Defined**:
  - `SAInitialized`, `SAContextLoaded`, `SAPlanEvaluated`, `SAStepStarted`, `SAStepCompleted`, `SAStepFailed`, `SATraceEmitted`, `SACompleted`.
- **Alignment**:
  - Fully aligns with `mplp-sa-event.schema.json`.
  - Fully aligns with SA Lifecycle states.
  - **Gap**: Needs to be reformatted as "Event Obligations" (Mandatory/Recommended) rather than just a catalog.

### 2.4 Invariants Reality (`schemas/v2/invariants/sa-invariants.yaml`)

- **Rules Defined**:
  - `sa_requires_context`, `sa_context_must_be_active`
  - `sa_plan_context_binding`, `sa_plan_has_steps`, `sa_steps_have_valid_ids`, `sa_steps_have_agent_role`
  - `sa_trace_not_empty`, `sa_trace_context_binding`, `sa_trace_plan_binding`
- **Check**:
  - MD Spec mentions 4 key invariants.
  - YAML Spec references the file.
  - **Status**: Aligned.

### 2.5 Runtime Reality (PSG / L3)

- **PSG Obligations**:
  - SA must read `Context` and `Plan`.
  - SA must write `Trace` events.
- **Conclusion**:
  - The profile implies specific PSG read/write paths (`psg.plans`, `psg.execution_traces`) which are consistent with `module-psg-paths.md`.

### 2.6 Golden Tests Reality

- **Covered Flows**:
  - `sa-flow-01-basic`
  - `sa-flow-02-step-evaluation`
- **Alignment**:
  - MD Spec explicitly references these flows.

### 2.7 SA Mismatch Summary

```
mismatch:
* MD Spec format does not match the new "Profile Specification Template".
* Events Doc format does not match the new "Profile Event Obligations Template".
* Missing Frozen Headers.
status: Needs Template Fix
```

---

## 3. MAP Profile – Reality Scan

### 3.1 YAML Spec Reality (`mplp-map-profile.yaml`)

- **Existence**: ✅
- **Structure summary**:
  - `root`: `map_profile`
  - `version`: "1.0.0"
  - `session_lifecycle`: 7 states (`initialize_session`, `assign_roles`, `dispatch_turn`, `collect_results`, `resolve_conflicts`, `broadcast_updates`, `complete_session`)
  - `collaboration_patterns`: `turn_taking`, `broadcast_fanout`, `orchestrated`
  - `dependencies`: `collab`, `network`, `role`, `dialog`
  - `invariants_ref`: `schemas/v2/invariants/map-invariants.yaml`
  - `minimal_flows`: `map-flow-01-turn-taking`, `map-flow-02-broadcast-fanout`
- **Mismatches / gaps**:
  - None. YAML is the source of truth.

### 3.2 MD Spec Reality (`mplp-map-profile.md`)

- **Status**: ✅ Complete Content / ⚠️ Template Mismatch
- **Current sections**:
  - Overview, Responsibilities, Session Lifecycle, Execution Token, Collaboration Patterns, Interaction with L2 Modules, Event Chain, Invariants, Minimal Flows.
- **Missing content**:
  - **Frozen Header**: Missing.
  - **Normative Structure**: Needs reorganization to new template.

### 3.3 Events Reality (`map-events.md`)

- **Corresponding Doc**: `docs/03-profiles/map-events.md`
- **Actual Events Defined**:
  - `MAPSessionStarted`, `MAPRolesAssigned`, `MAPTurnDispatched`, `MAPTurnCompleted`, `MAPBroadcastSent`, `MAPBroadcastReceived`, `MAPConflictDetected`, `MAPConflictResolved`, `MAPSessionCompleted`.
- **Alignment**:
  - Fully aligns with `mplp-map-event.schema.json`.
  - Fully aligns with MAP Lifecycle states.
  - **Gap**: Needs reformatting to "Event Obligations".

### 3.4 Invariants Reality (`schemas/v2/invariants/map-invariants.yaml`)

- **Rules Defined**:
  - `map_session_requires_multiple_participants`, `map_collab_mode_valid`, `map_session_id_is_uuid`, `map_participants_have_role_ids`
  - `map_turn_completion_matches_dispatch`, `map_broadcast_has_receivers`
  - `map_role_ids_are_uuids`, `map_participant_ids_are_non_empty`, `map_participant_kind_valid`
- **Check**:
  - MD Spec mentions 5 key invariants.
  - **Status**: Aligned.

### 3.5 Runtime Reality (PSG / L3)

- **PSG Obligations**:
  - MAP must read/write `Collab`.
  - MAP must read `Network`, `Role`.
  - MAP must write `Trace`.
- **Conclusion**:
  - Consistent with `module-psg-paths.md`.

### 3.6 Golden Tests Reality

- **Covered Flows**:
  - `map-flow-01-turn-taking`
  - `map-flow-02-broadcast-fanout`
- **Alignment**:
  - MD Spec explicitly references these flows.

### 3.7 MAP Mismatch Summary

```
mismatch:
* MD Spec format does not match the new "Profile Specification Template".
* Events Doc format does not match the new "Profile Event Obligations Template".
* Missing Frozen Headers.
status: Needs Template Fix
```

---

## 4. Global Problems Summary

```
global_mismatches:
* Both SA and MAP profiles have high-quality content but lack the standardized governance structure (Frozen Headers, Normative Sections).
* Event documentation is currently a "Catalog" style, needing conversion to "Obligations" style.
* No semantic mismatches found between YAML, MD, and Code (Invariants/Schemas).
```

---

## 5. Fix Plan for 03-profiles

```
fix_plan:
  sa-profile:
    - Rewrite `mplp-sa-profile.md` using the "Profile Specification Template".
    - Rewrite `sa-events.md` using the "Profile Event Obligations Template".
    - Ensure 1:1 content preservation from existing docs into new structure.
  map-profile:
    - Rewrite `mplp-map-profile.md` using the "Profile Specification Template".
    - Rewrite `map-events.md` using the "Profile Event Obligations Template".
    - Ensure 1:1 content preservation from existing docs into new structure.
  common_actions:
    - Add Frozen Headers to all 4 normative MD files.
    - Verify links to diagrams and schemas.
```

---

This report must be reviewed before any normative change is made to SA/MAP Profiles or their associated events.
