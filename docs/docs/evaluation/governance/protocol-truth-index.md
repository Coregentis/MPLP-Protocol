---
sidebar_position: 2
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-TRUTH-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Protocol Truth Index
sidebar_label: Truth Index
description: "MPLP governance documentation: Protocol Truth Index. Governance processes and policies."
authority: none
---

# Protocol Truth Index

---

## 1. L1 Core Schemas — Required Fields

### 1.1 Context (`mplp-context.schema.json`)

```yaml
required:
  - meta
  - context_id  # UUID v4
  - root        # domain + environment required
  - title       # minLength: 1
  - status      # enum below
status_enum:
  - draft
  - active
  - suspended
  - archived
  - closed
```

### 1.2 Plan (`mplp-plan.schema.json`)

```yaml
required:
  - meta
  - plan_id     # UUID v4
  - context_id  # UUID v4
  - title       # minLength: 1
  - objective   # minLength: 1
  - status      # enum below
  - steps       # minItems: 1
status_enum:
  - draft
  - proposed
  - approved
  - in_progress
  - completed
  - cancelled
  - failed
step_required:
  - step_id
  - description
  - status
step_status_enum:
  - pending
  - in_progress
  - completed
  - blocked
  - skipped
  - failed
```

### 1.3 Trace (`mplp-trace.schema.json`)

```yaml
required:
  - meta
  - trace_id    # UUID v4
  - context_id  # UUID v4
  - root_span
  - status      # enum below
status_enum:
  - pending
  - running
  - completed
  - failed
  - cancelled
segment_required:
  - segment_id
  - label
  - status
segment_status_enum:
  - pending
  - running
  - completed
  - failed
  - cancelled
  - skipped
```

### 1.4 Confirm (`mplp-confirm.schema.json`)

```yaml
required:
  - meta
  - confirm_id       # UUID v4
  - target_type      # enum below
  - target_id        # UUID v4
  - status           # enum below
  - requested_by_role
  - requested_at     # ISO 8601
target_type_enum:
  - context
  - plan
  - trace
  - extension
  - other
status_enum:
  - pending
  - approved
  - rejected
  - cancelled
decision_required:
  - decision_id
  - status
  - decided_by_role
  - decided_at
decision_status_enum:
  - approved
  - rejected
  - cancelled
```

---

## 2. SA Profile Invariants (`sa-invariants.yaml`)

**Total**: 9 invariants

| ID | Scope | Rule | Description |
|:---|:---|:---|:---|
| `sa_requires_context` | context | uuid-v4 | SA requires valid Context |
| `sa_context_must_be_active` | context | enum(active) | SA only when status='active' |
| `sa_plan_context_binding` | plan | eq(context.context_id) | Plan.context_id matches |
| `sa_plan_has_steps` | plan | min-length(1) | Plan has ≥1 step |
| `sa_steps_have_valid_ids` | plan | uuid-v4 | All steps need UUID v4 |
| `sa_steps_agent_role_if_present` | plan | non-empty-string | If agent_role present, must be non-empty |
| `sa_trace_not_empty` | trace | min-length(1) | Trace emits ≥1 event |
| `sa_trace_context_binding` | trace | eq(context.context_id) | Trace.context_id matches |
| `sa_trace_plan_binding` | trace | eq(plan.plan_id) | Trace.plan_id matches |

---

## 3. Observability Invariants (`observability-invariants.yaml`)

### 3.1 Core Event Structure

| ID | Rule | Description |
|:---|:---|:---|
| `obs_event_id_is_uuid` | uuid-v4 | All events need UUID v4 event_id |
| `obs_event_type_non_empty` | non-empty-string | event_type required |
| `obs_event_family_valid` | enum | Valid event_family |
| `obs_timestamp_iso_format` | iso-datetime | ISO 8601 timestamp |

### 3.2 Event Family Enumeration (12 families)

```yaml
event_family:
  - import_process
  - intent
  - delta_intent
  - impact_analysis
  - compensation_plan
  - methodology
  - reasoning_graph
  - pipeline_stage      # REQUIRED for conformance
  - graph_update        # REQUIRED for conformance
  - runtime_execution
  - cost_budget
  - external_integration
```

---

## 4. MAP Profile Invariants (`map-invariants.yaml`)

| ID | Scope | Rule | Description |
|:---|:---|:---|:---|
| `map_session_requires_participants` | collab | min-length(1) | Session needs ≥1 participant |
| `map_collab_mode_valid` | collab | enum | Mode is valid |
| `map_participants_have_role_ids` | collab | non-empty | All participants need role bindings |

### Coordination Mode Enumeration

```yaml
collab_mode:
  - broadcast
  - round_robin
  - orchestrated
  - swarm
  - pair
```

---

## 5. Protocol Version Constants

```yaml
protocolVersion: "1.0.0"
frozen: true
freezeDate: "2025-12-03"
governance: "MPGC"
schemaVersion: "1.0.0"
```

---

## 6. Governance Authority Split

| Layer | Authority | Scope |
|:---|:---|:---|
| **Protocol** | MPGC | Schemas, Invariants, Golden Flows |
| **Documentation** | Documentation Governance | docs/* |
| **Website** | Website Governance | mplp.io content |

---

## 7. Forbidden Terms

The following terms are **forbidden** in MPLP documentation and website:

| Forbidden Term | Reason |
|:---|:---|
| "MPLP compliant" | No certification authority |
| "MPLP certified" | No certification program |
| "officially endorsed" | No endorsement mechanism |
| "certified partner" | No partnership program |
| "compliance badge" | No badge system |

**Allowed alternatives**:
- "MPLP conformant" (with conformance level specified)
- "implements MPLP"
- "follows MPLP specification"

---

## 8. Module Count Constants

| Constant | Value | Source |
|:---|:---|:---|
| Core Modules (L2) | 10 | schemas/v2/*.schema.json |
| Event Families | 12 | observability-invariants.yaml |
| SA Invariants | 9 | sa-invariants.yaml |
| Golden Flows | 5 | FLOW-01 to FLOW-05 |
| Kernel Duties | 11 | cross-cutting-kernel-duties/ |

---

## 9. Usage

This index is the **sole reference** for PTA judgments:

1. **Claims matching** this index are classified D0 (MATCH)
2. **Claims that contradict** this index are D3 (CONTRADICTION)
3. **Claims with no evidence** in this index are D2 (UNSUPPORTED)
4. **Ambiguous claims** that can be read two ways are D1 (AMBIGUOUS)
