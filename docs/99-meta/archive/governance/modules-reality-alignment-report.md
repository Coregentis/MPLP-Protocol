> [INTERNAL ONLY]
> This document is an internal process / governance artifact.
> It is **not** part of the MPLP v1.0 public specification and **MUST NOT** be included in public releases or documentation maps.

---
Status: Internal
Not part of MPLP v1.0 Spec. Retained for historical and audit purposes only.
---

---
title: "02-modules Reality Alignment Report"
version: "1.0.0"
date: "2025-12-01"
status: "Frozen for governance"
---

# 02-modules Reality Alignment Report  
MPLP Protocol v1.0 — Alignment of Modules (L2 Layer)

This report establishes the **actual reality** of all 10 MPLP modules by scanning the current schemas, invariants, runtime specs, event obligations, and documentation.  
It is the **mandatory prerequisite** before performing any modification to `docs/02-modules/`.

---

# 1. Executive Summary

## 1.1 Alignment Status (Summary Table)

| Module | Schema Exists | Doc Exists | Event Obligations | Invariants | PSG Paths | Alignment |
|--------|---------------|------------|-------------------|------------|-----------|-----------|
| Context | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ✅ Defined | ✅ Defined | **Needs Fix** |
| Plan | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ✅ Defined | ✅ Defined | **Needs Fix** |
| Confirm | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ❌ Missing | ✅ Defined | **Needs Fix** |
| Trace | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ✅ Defined | ✅ Defined | **Needs Fix** |
| Role | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ❌ Missing | ✅ Defined | **Needs Fix** |
| Extension | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ❌ Missing | ✅ Defined | **Needs Fix** |
| Dialog | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ❌ Missing | ✅ Defined | **Needs Fix** |
| Collab | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ✅ Defined | ✅ Defined | **Needs Fix** |
| Core | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ❌ Missing | ✅ Defined | **Needs Fix** |
| Network | ✅ Yes | ⚠️ Skeleton | ✅ Defined | ❌ Missing | ✅ Defined | **Needs Fix** |

Legend:  
- **Exists** = File found  
- **Skeleton** = File exists but contains only placeholder text  
- **Alignment** = “OK / Needs Fix / Broken”  

---

# 2. Per-Module Detailed Analysis

---

## Context Module  
### 2.1.1 Schema Reality (from schemas/v2/mplp-context.schema.json)

**Schema File**: `schemas/v2/mplp-context.schema.json`

```
type: object
required:
* meta
* context_id
* root
* title
* status
properties:
* meta: $ref: common/metadata.schema.json
* governance:
  properties:
  * lifecyclePhase: string
  * truthDomain: string
  * locked: boolean
  * lastConfirmRef: $ref
* context_id: $ref: common/identifiers.schema.json
* root:
  required: [domain, environment]
  properties:
  * domain: string
  * environment: string
  * entry_point: string
* title: string (minLength: 1)
* summary: string
* status: enum [draft, active, suspended, archived, closed]
* tags: array of strings
* language: string
* owner_role: string
* constraints: object
* created_at: format=date-time
* updated_at: format=date-time
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.1.2 Documentation Reality (from docs/02-modules/context-module.md)

```
status: exists (skeleton)
sections:
* Context Module (Skeleton)
missing:
* All functional sections
* Schema summary
* Responsibilities
* Event obligations
* Invariants
mismatch:
* Document is a placeholder.
```

### 2.1.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* GraphUpdateEvent (on creation/update)
recommended:
* ImportProcessEvent (on import)
optional:
* CostAndBudgetEvent
```

### 2.1.4 Invariants (from schemas/v2/invariants/sa-invariants.yaml)

```
invariants:
* rule_id: sa_requires_context
  description: SA execution requires a valid Context with UUID v4 identifier
* rule_id: sa_context_must_be_active
  description: SA can only execute when Context status is 'active'
```

### 2.1.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.project_root (primary)
* psg.environment (primary)
* psg.constraints (primary)
read_paths:
* psg.project_root (by others)
```

### 2.1.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* flow-01-single-agent-plan
* flow-02-single-agent-large-plan
* flow-03-single-agent-with-tools
* flow-04-single-agent-llm-enrichment
* flow-05-single-agent-confirm-required
* map-flow-01-turn-taking
* map-flow-02-broadcast-fanout
* sa-flow-01-basic
* sa-flow-02-step-evaluation
```

### 2.1.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
* Missing detailed field descriptions in doc.
* Missing event obligations in doc.
* Missing invariants in doc.
status: Needs Fix
```

---

## Plan Module  
### 2.2.1 Schema Reality (from schemas/v2/mplp-plan.schema.json)

**Schema File**: `schemas/v2/mplp-plan.schema.json`

```
type: object
required:
* meta
* plan_id
* context_id
* title
* objective
* status
* steps
properties:
* meta: $ref: common/metadata.schema.json
* plan_id: $ref: common/identifiers.schema.json
* context_id: $ref: common/identifiers.schema.json
* title: string (minLength: 1)
* objective: string (minLength: 1)
* status: enum [draft, proposed, approved, in_progress, completed, cancelled, failed]
* steps: array of objects (minItems: 1)
  items:
  * step_id: $ref
  * description: string
  * status: enum [pending, in_progress, completed, blocked, skipped, failed]
  * dependencies: array of $ref
  * agent_role: string
  * order_index: integer
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.2.2 Documentation Reality (from docs/02-modules/plan-module.md)

```
status: exists (skeleton)
sections:
* Plan Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.2.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* GraphUpdateEvent (on creation/step update)
recommended:
* IntentEvent
* DeltaIntentEvent
optional:
* ImpactAnalysisEvent
* CompensationPlanEvent
```

### 2.2.4 Invariants (from schemas/v2/invariants/sa-invariants.yaml)

```
invariants:
* rule_id: sa_plan_context_binding
  description: Plan's context_id must match SA's loaded Context
* rule_id: sa_plan_has_steps
  description: Plan must contain at least one executable step
* rule_id: sa_steps_have_valid_ids
  description: All plan steps must have valid UUID v4 identifiers
* rule_id: sa_steps_have_agent_role
  description: All steps must specify an agent_role for executor selection
```

### 2.2.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.plans (primary)
* psg.plan_steps (primary)
* psg.plan_edges (primary)
read_paths:
* psg.plans (execution order)
```

### 2.2.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* flow-01-single-agent-plan
* flow-02-single-agent-large-plan
* flow-03-single-agent-with-tools
* flow-04-single-agent-llm-enrichment
* flow-05-single-agent-confirm-required
* map-flow-01-turn-taking
* map-flow-02-broadcast-fanout
* sa-flow-01-basic
* sa-flow-02-step-evaluation
```

### 2.2.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Confirm Module  
### 2.3.1 Schema Reality (from schemas/v2/mplp-confirm.schema.json)

**Schema File**: `schemas/v2/mplp-confirm.schema.json`

```
type: object
required:
* meta
* confirm_id
* target_type
* target_id
* status
* requested_by_role
* requested_at
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* confirm_id: $ref: common/identifiers.schema.json
* target_type: enum [context, plan, trace, extension, other]
* target_id: $ref: common/identifiers.schema.json
* status: enum [pending, approved, rejected, cancelled]
* requested_by_role: string
* requested_at: format=date-time
* reason: string
* decisions: array of objects
  items:
  * decision_id: $ref
  * status: enum [approved, rejected, cancelled]
  * decided_by_role: string
  * decided_at: format=date-time
  * reason: string
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.3.2 Documentation Reality (from docs/02-modules/confirm-module.md)

```
status: exists (skeleton)
sections:
* Confirm Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.3.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* GraphUpdateEvent (on decision)
recommended:
* IntentEvent
optional:
* CompensationPlanEvent
```

### 2.3.4 Invariants

```
invariants:
* (None explicitly defined in scanned files)
missing_invariants:
* Should define rules for decision status transitions
```

### 2.3.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.approval_nodes (primary)
* psg.decision_edges (primary)
read_paths:
* psg.approval_nodes (check status)
```

### 2.3.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* flow-05-single-agent-confirm-required
```

### 2.3.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Trace Module  
### 2.4.1 Schema Reality (from schemas/v2/mplp-trace.schema.json)

**Schema File**: `schemas/v2/mplp-trace.schema.json`

```
type: object
required:
* meta
* trace_id
* context_id
* root_span
* status
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* trace_id: $ref: common/identifiers.schema.json
* context_id: $ref: common/identifiers.schema.json
* plan_id: $ref: common/identifiers.schema.json
* root_span: $ref: common/trace-base.schema.json
* status: enum [pending, running, completed, failed, cancelled]
* started_at: format=date-time
* finished_at: format=date-time
* segments: array of objects
  items:
  * segment_id: $ref
  * label: string
  * status: enum [pending, running, completed, failed, cancelled, skipped]
* events: array of $ref: common/events.schema.json
```

### 2.4.2 Documentation Reality (from docs/02-modules/trace-module.md)

```
status: exists (skeleton)
sections:
* Trace Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.4.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* RuntimeExecutionEvent (for spans)
recommended:
* PipelineStageEvent
optional:
* ExternalIntegrationEvent
```

### 2.4.4 Invariants (from schemas/v2/invariants/sa-invariants.yaml)

```
invariants:
* rule_id: sa_trace_not_empty
  description: SA must emit at least one trace event before completion
* rule_id: sa_trace_context_binding
  description: Trace context_id must match SA's Context
* rule_id: sa_trace_plan_binding
  description: Trace plan_id must match SA's Plan
```

### 2.4.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.execution_traces (primary)
* psg.trace_spans (primary)
read_paths:
* (None - Trace is append-only)
```

### 2.4.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* flow-05-single-agent-confirm-required
```

### 2.4.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Role Module  
### 2.5.1 Schema Reality (from schemas/v2/mplp-role.schema.json)

**Schema File**: `schemas/v2/mplp-role.schema.json`

```
type: object
required:
* meta
* role_id
* name
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* role_id: $ref: common/identifiers.schema.json
* name: string
* description: string
* capabilities: array of strings
* created_at: format=date-time
* updated_at: format=date-time
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.5.2 Documentation Reality (from docs/02-modules/role-module.md)

```
status: exists (skeleton)
sections:
* Role Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.5.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
recommended:
* MethodologyEvent
```

### 2.5.4 Invariants

```
invariants:
* (None explicitly defined in scanned files)
```

### 2.5.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.agent_roles (primary)
* psg.role_assignments (primary)
read_paths:
* psg.agent_roles
```

### 2.5.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* (Implicit in all flows via agent_role field, but no explicit output file)
```

### 2.5.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Extension Module  
### 2.6.1 Schema Reality (from schemas/v2/mplp-extension.schema.json)

**Schema File**: `schemas/v2/mplp-extension.schema.json`

```
type: object
required:
* meta
* extension_id
* context_id
* name
* extension_type
* version
* status
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* extension_id: $ref: common/identifiers.schema.json
* context_id: $ref: common/identifiers.schema.json
* name: string (minLength: 1)
* extension_type: enum [capability, policy, integration, transformation, validation, other]
* version: string (SemVer pattern)
* status: enum [registered, active, inactive, deprecated]
* config: object
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.6.2 Documentation Reality (from docs/02-modules/extension-module.md)

```
status: exists (skeleton)
sections:
* Extension Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.6.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
recommended:
* ExternalIntegrationEvent
optional:
* RuntimeExecutionEvent
```

### 2.6.4 Invariants

```
invariants:
* (None explicitly defined in scanned files)
```

### 2.6.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.tool_adapters (primary)
* psg.plugin_registry (shared)
read_paths:
* psg.tool_adapters
```

### 2.6.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* flow-03-single-agent-with-tools (Implicit)
```

### 2.6.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Dialog Module  
### 2.7.1 Schema Reality (from schemas/v2/mplp-dialog.schema.json)

**Schema File**: `schemas/v2/mplp-dialog.schema.json`

```
type: object
required:
* meta
* dialog_id
* context_id
* status
* messages
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* dialog_id: $ref: common/identifiers.schema.json
* context_id: $ref: common/identifiers.schema.json
* thread_id: $ref: common/identifiers.schema.json
* status: enum [active, paused, completed, cancelled]
* messages: array of objects
  items:
  * role: enum [user, assistant, system, agent]
  * content: string
  * timestamp: format=date-time
  * event: $ref: common/events.schema.json
* started_at: format=date-time
* ended_at: format=date-time
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.7.2 Documentation Reality (from docs/02-modules/dialog-module.md)

```
status: exists (skeleton)
sections:
* Dialog Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.7.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* GraphUpdateEvent (on message add)
recommended:
* IntentEvent
optional:
* MethodologyEvent
```

### 2.7.4 Invariants

```
invariants:
* (None explicitly defined in scanned files)
```

### 2.7.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.dialog_threads (primary)
* psg.dialog_messages (primary)
read_paths:
* psg.dialog_threads
```

### 2.7.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* (None explicit in output files)
```

### 2.7.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Collab Module  
### 2.8.1 Schema Reality (from schemas/v2/mplp-collab.schema.json)

**Schema File**: `schemas/v2/mplp-collab.schema.json`

```
type: object
required:
* meta
* collab_id
* context_id
* title
* purpose
* mode
* status
* participants
* created_at
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* collab_id: $ref: common/identifiers.schema.json
* context_id: $ref: common/identifiers.schema.json
* title: string (minLength: 1)
* purpose: string (minLength: 1)
* mode: enum [broadcast, round_robin, orchestrated, swarm, pair]
* status: enum [draft, active, suspended, completed, cancelled]
* participants: array of objects (minItems: 1)
  items:
  * participant_id: string
  * role_id: string
  * kind: enum [agent, human, system, external]
  * display_name: string
* created_at: format=date-time
* updated_at: format=date-time
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.8.2 Documentation Reality (from docs/02-modules/collab-module.md)

```
status: exists (skeleton)
sections:
* Collab Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.8.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* GraphUpdateEvent (on session/participant update)
recommended:
* RuntimeExecutionEvent
optional:
* MAP Events (MAPSessionStarted, etc.)
```

### 2.8.4 Invariants (from schemas/v2/invariants/map-invariants.yaml)

```
invariants:
* rule_id: map_session_requires_multiple_participants
  description: MAP sessions require at least 2 participants
* rule_id: map_collab_mode_valid
  description: Collab.mode must be valid collaboration pattern
* rule_id: map_session_id_is_uuid
  description: Session ID must be valid UUID v4
* rule_id: map_participants_have_role_ids
  description: All participants must have valid role_id binding
```

### 2.8.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.collaboration_sessions (primary)
* psg.handoff_edges (primary)
read_paths:
* psg.collaboration_sessions
```

### 2.8.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* map-flow-01-turn-taking
* map-flow-02-broadcast-fanout
```

### 2.8.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Core Module  
### 2.9.1 Schema Reality (from schemas/v2/mplp-core.schema.json)

**Schema File**: `schemas/v2/mplp-core.schema.json`

```
type: object
required:
* meta
* core_id
* protocol_version
* status
* modules
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* core_id: $ref: common/identifiers.schema.json
* protocol_version: string (minLength: 1)
* status: enum [draft, active, deprecated, archived]
* modules: array of objects (minItems: 1)
  items:
  * module_id: enum [context, plan, confirm, trace, role, extension, dialog, collab, core, network]
  * version: string
  * status: enum [enabled, disabled, experimental, deprecated]
  * required: boolean
  * description: string
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.9.2 Documentation Reality (from docs/02-modules/core-module.md)

```
status: exists (skeleton)
sections:
* Core Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.9.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* PipelineStageEvent (on stage transition)
recommended:
* RuntimeExecutionEvent
optional:
* CostAndBudgetEvent
```

### 2.9.4 Invariants

```
invariants:
* (None explicitly defined in scanned files)
```

### 2.9.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.orchestration_nodes (primary)
* psg.governance_rules (primary)
read_paths:
* psg.governance_rules
```

### 2.9.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* (None explicit in output files)
```

### 2.9.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

## Network Module  
### 2.10.1 Schema Reality (from schemas/v2/mplp-network.schema.json)

**Schema File**: `schemas/v2/mplp-network.schema.json`

```
type: object
required:
* meta
* network_id
* context_id
* name
* topology_type
* status
properties:
* meta: $ref: common/metadata.schema.json
* governance: object
* network_id: $ref: common/identifiers.schema.json
* context_id: $ref: common/identifiers.schema.json
* name: string (minLength: 1)
* description: string
* topology_type: enum [single_node, hub_spoke, mesh, hierarchical, hybrid, other]
* status: enum [draft, provisioning, active, degraded, maintenance, retired]
* nodes: array of objects
  items:
  * node_id: $ref
  * name: string
  * kind: enum [agent, service, database, queue, external, other]
  * role_id: string
  * status: enum [active, inactive, degraded, unreachable, retired]
* trace: $ref: common/trace-base.schema.json
* events: array of $ref: common/events.schema.json
```

### 2.10.2 Documentation Reality (from docs/02-modules/network-module.md)

```
status: exists (skeleton)
sections:
* Network Module (Skeleton)
missing:
* All functional sections
mismatch:
* Document is a placeholder.
```

### 2.10.3 Event Obligations (from docs/04-observability/module-event-matrix.md)

```
required:
* GraphUpdateEvent (on topology update)
recommended:
* ExternalIntegrationEvent
optional:
* RuntimeExecutionEvent
```

### 2.10.4 Invariants

```
invariants:
* (None explicitly defined in scanned files)
```

### 2.10.5 Runtime PSG Paths (from docs/06-runtime/module-psg-paths.md)

```
write_paths:
* psg.external_endpoints (primary)
* psg.integration_status (shared)
read_paths:
* psg.external_endpoints
```

### 2.10.6 Golden Test Coverage (from tests/golden/flows/*)

```
covered_in_flows:
* (None explicit in output files)
```

### 2.10.7 Mismatch Summary

```
mismatch:
* Documentation is a skeleton placeholder.
status: Needs Fix
```

---

# 3. Global Problems Summary

```
global_mismatches:
* 10/10 modules have SKELETON documentation.
* Documentation is completely missing functional descriptions, schema summaries, and responsibilities.
* Event obligations are defined in 04-observability but not reflected in 02-modules docs.
* Runtime PSG paths are defined in 06-runtime but not reflected in 02-modules docs.
* Invariants are missing for 6/10 modules (Confirm, Role, Extension, Dialog, Core, Network).
* Golden test coverage is uneven (Context/Plan covered in all, others sparse).
```

---

# 4. Required Fix Plan for docs/02-modules

```
fix_plan:
context:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Add Invariants section from sa-invariants.yaml.
plan:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Add Invariants section from sa-invariants.yaml.
confirm:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Define missing invariants.
trace:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Add Invariants section from sa-invariants.yaml.
role:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Define missing invariants.
extension:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Define missing invariants.
dialog:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Define missing invariants.
collab:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Add Invariants section from map-invariants.yaml.
core:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Define missing invariants.
network:
- Rewrite document using Schema Reality + PSG Paths + Event Matrix.
- Define missing invariants.
common_actions:
- Enforce standard "Module Specification" template for all 10 docs.
- Ensure 1:1 mapping between Schema fields and Document descriptions.
- Explicitly list Event Obligations and PSG Paths in each document.
```

---

# 结束语（自动生成）

```
This report establishes the ground truth of MPLP v1.0 L2 modules.
No module documentation may be edited before this report is reviewed and approved.
```
