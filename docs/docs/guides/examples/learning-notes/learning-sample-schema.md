---
sidebar_position: 2

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Documents the LearningSample schema structure, covering core and family-specific fields."
title: Learning Sample Schema

---


# Learning Sample Schema


## 1. Purpose

This document describes the **LearningSample** schema structure, which defines the format for capturing execution data that can be used for offline analysis, model iteration, or quality assessment.

**Source Schemas**:
- `schemas/v2/learning/mplp-learning-sample-core.schema.json`
- `schemas/v2/learning/mplp-learning-sample-intent.schema.json`
- `schemas/v2/learning/mplp-learning-sample-delta.schema.json`

## 2. Schema Overview

### 2.1 Schema Hierarchy

```
LearningSampleCore (base)
  ├── LearningSampleIntent (extends)
  └── LearningSampleDelta (extends)
```

Family-specific schemas use `allOf` to extend the Core Schema.

### 2.2 Core vs. Family-Specific

| Schema | Purpose | When to Use |
|:---|:---|:---|
| Core Schema | Base structure with required fields | All learning samples |
| Intent Schema | Extended fields for intent resolution | `sample_family == intent_resolution` |
| Delta Schema | Extended fields for delta impact | `sample_family == delta_impact` |

Other families (pipeline_outcome, confirm_decision, graph_evolution, multi_agent_coordination) use the Core Schema directly with recommended field conventions.

## 3. Core Schema (`mplp-learning-sample-core.schema.json`)

**Schema ID**: `https://mplp.dev/schemas/v1.0/learning/mplp-learning-sample-core.schema.json`

### 3.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| `sample_id` | `string (uuid)` | Unique identifier of the learning sample (UUID v4) |
| `sample_family` | `string` | LearningSample family identifier |
| `created_at` | `string (date-time)` | ISO 8601 timestamp when sample was generated |
| `input` | `object` | Abstracted representation of input conditions |
| `output` | `object` | Abstracted representation of actual outcomes |

### 3.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `state` | `object` | Snapshot of relevant system state before execution |
| `meta` | `object` | Metadata, labels, quality signals, provenance IDs |

### 3.3 Meta Object Structure

| Field | Type | Description |
|:---|:---|:---|
| `source_flow_id` | `string` | Flow ID that generated this sample (e.g., FLOW-01) |
| `source_event_ids` | `array<uuid>` | Observability event IDs referenced by this sample |
| `project_id` | `string (uuid)` | Project context identifier |
| `human_feedback_label` | `enum` | Human quality assessment: `approved`, `rejected`, `not_reviewed` |
| `quality_score` | `number (0.0-1.0)` | Automated quality score |

### 3.4 Core Schema Example

```json
{
  "$schema": "https://mplp.dev/schemas/v1.0/learning/mplp-learning-sample-core.schema.json",
  "sample_id": "550e8400-e29b-41d4-a716-446655440000",
  "sample_family": "pipeline_outcome",
  "created_at": "2025-12-06T12:00:00.000Z",
  "input": {
    "step_id": "step-001",
    "step_type": "code_generation"
  },
  "output": {
    "status": "completed",
    "duration_ms": 1500
  },
  "meta": {
    "source_flow_id": "FLOW-01",
    "human_feedback_label": "approved"
  }
}
```

## 4. Intent Resolution Schema (`mplp-learning-sample-intent.schema.json`)

**Schema ID**: `https://mplp.dev/schemas/v1.0/learning/mplp-learning-sample-intent.schema.json`

**Family**: `intent_resolution`

Extends Core Schema via `allOf` reference.

### 4.1 Input Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `intent_id` | `string` | ✓ | Intent identifier from IntentEvent |
| `raw_request_summary` | `string` | ✓ | Abstracted user request (PII-scrubbed) |
| `constraints_summary` | `string` | | Timeline, budget, resources |
| `dialog_turns_count` | `integer` | | Dialog exchanges before resolution |

### 4.2 State Fields

| Field | Type | Description |
|:---|:---|:---|
| `project_phase` | `string` | greenfield, brownfield, maintenance |
| `psg_node_count` | `integer` | PSG size before intent |
| `existing_plan_count` | `integer` | Existing plans in context |

### 4.3 Output Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `final_intent_summary` | `string` | ✓ | Refined intent after resolution |
| `plan_id` | `string (uuid)` | | Generated Plan UUID |
| `plan_step_count` | `integer` | | Steps in generated plan |
| `resolution_quality_label` | `enum` | | good, acceptable, bad, unknown |

### 4.4 Meta Extensions

| Field | Type | Description |
|:---|:---|:---|
| `clarification_rounds` | `integer` | Rounds needed before resolution |
| `ambiguity_flags` | `array<string>` | vague_scope, missing_constraints, etc. |

## 5. Delta Impact Schema (`mplp-learning-sample-delta.schema.json`)

**Schema ID**: `https://mplp.dev/schemas/v1.0/learning/mplp-learning-sample-delta.schema.json`

**Family**: `delta_impact`

Extends Core Schema via `allOf` reference.

### 5.1 Input Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `delta_id` | `string` | ✓ | Delta Intent identifier |
| `intent_id` | `string` | | Original intent being modified |
| `change_summary` | `string` | | Abstracted summary of requested change |
| `delta_type` | `enum` | | refinement, correction, expansion, reduction, pivot |

### 5.2 State Fields

| Field | Type | Description |
|:---|:---|:---|
| `affected_artifact_count` | `integer` | Number of artifacts potentially affected |
| `risk_level` | `enum` | Risk level: low, medium, high, critical |
| `psg_complexity_score` | `number` | PSG complexity metric before change |

### 5.3 Output Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `actual_impact_summary` | `string` | ✓ | Summary of actual impact after analysis |
| `impact_scope` | `enum` | ✓ | Scope: local, module, system, global |
| `comp_plan_required` | `boolean` | | Whether compensation plan was needed |
| `comp_plan_applied` | `boolean` | | Whether compensation was actually applied |
| `rollback_used` | `boolean` | | Whether rollback mechanism was triggered |

### 5.4 Meta Extensions

| Field | Type | Description |
|:---|:---|:---|
| `impact_analysis_duration_ms` | `integer` | Time spent on impact analysis |
| `predicted_vs_actual_accuracy` | `enum` | accurate, underestimated, overestimated |

## 6. Other Family Schemas

The following families use the **Core Schema** directly without extensions:

| Family ID | Description | Recommended Input Fields | Recommended Output Fields |
|:---|:---|:---|:---|
| `pipeline_outcome` | Pipeline stage success/failure | `pipeline_id`, `stage_id` | `status`, `duration_ms`, `error_info` |
| `confirm_decision` | Approval/rejection decisions | `confirm_id`, `target_type`, `risk_label` | `decision`, `reasoning` |
| `graph_evolution` | PSG structural changes | `trigger_event_id`, `change_type` | `nodes_added`, `edges_added` |
| `multi_agent_coordination` | SA/MAP collaboration | `session_id`, `coordination_mode` | `total_turns`, `outcome` |

These families follow Core Schema structure but use field conventions documented inSee: [Learning Taxonomy](https://github.com/Coregentis/MPLP-Protocol/blob/main/schemas/v2/taxonomy/learning-taxonomy.yaml).

## 7. Sample Families Reference

Based on Core Schema `sample_family` examples:

| Family ID | Description | Primary Schema |
|:---|:---|:---|
| `intent_resolution` | User intent clarification and plan generation | `mplp-learning-sample-intent.schema.json` |
| `delta_impact` | Change effect analysis and compensation planning | `mplp-learning-sample-delta.schema.json` |
| `pipeline_outcome` | Pipeline stage success/failure patterns | Core Schema |
| `confirm_decision` | Approval/rejection decisions and reasoning | Core Schema |
| `graph_evolution` | PSG structural changes over time | Core Schema |
| `multi_agent_coordination` | SA/MAP collaboration patterns | Core Schema |

---

**Schemas**: 3 (1 core + 2 family-specific)
**Sample Families**: 6
**Source**: `schemas/v2/learning/*.schema.json`