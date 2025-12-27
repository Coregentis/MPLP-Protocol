---
doc_type: informative
status: active
authority: Documentation Governance
description: ""
title: Learning Sample Schema
---

# Learning Sample Schema

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 3. Core Schema (`mplp-learning-sample-core.schema.json`)

**Schema ID**: `https://mplp.dev/schemas/v1.0/learning/mplp-learning-sample-core.schema.json`

### 3.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| `sample_id` | `string (uuid)` | Unique identifier of the learning sample (UUID v4) |
| `sample_family` | `string` | LearningSample family identifier (e.g., `intent_resolution`, `delta_impact`, `pipeline_outcome`, `confirm_decision`, `graph_evolution`, `multi_agent_coordination`) |
| `created_at` | `string (date-time)` | ISO 8601 timestamp when sample was generated |
| `input` | `object` | Abstracted representation of input conditions, intent, context |
| `output` | `object` | Abstracted representation of actual outcomes, decisions, changes |

### 3.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `state` | `object` | Snapshot of relevant system state before execution (PSG summary, config, roles) |
| `meta` | `object` | Metadata, labels, quality signals, provenance IDs |

### 3.3 Meta Object Structure

| Field | Type | Description |
|:---|:---|:---|
| `source_flow_id` | `string` | Flow ID that generated this sample (e.g., FLOW-01, SA-01, MAP-01) |
| `source_event_ids` | `array<uuid>` | Observability event IDs referenced by this sample |
| `project_id` | `string (uuid)` | Project context identifier |
| `human_feedback_label` | `enum` | Human quality assessment: `approved`, `rejected`, `not_reviewed` |
| `quality_score` | `number (0.0-1.0)` | Automated quality score |

## 5. Delta Impact Schema (`mplp-learning-sample-delta.schema.json`)

**Schema ID**: `https://mplp.dev/schemas/v1.0/learning/mplp-learning-sample-delta.schema.json`

**Family**: `delta_impact`

Extends Core Schema via `allOf` reference.

### 5.1 Input Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `delta_id` | `string` | | Delta Intent identifier |
| `intent_id` | `string` | | Original intent being modified |
| `change_summary` | `string` | | Abstracted summary of requested change |
| `delta_type` | `enum` | | Type: `refinement`, `correction`, `expansion`, `reduction`, `pivot` |

### 5.2 State Fields

| Field | Type | Description |
|:---|:---|:---|
| `affected_artifact_count` | `integer` | Number of artifacts potentially affected |
| `risk_level` | `enum` | Risk level: `low`, `medium`, `high`, `critical` |
| `psg_complexity_score` | `number` | PSG complexity metric before change |

### 5.3 Output Fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `actual_impact_summary` | `string` | | Summary of actual impact after analysis |
| `impact_scope` | `enum` | | Scope: `local`, `module`, `system`, `global` |
| `comp_plan_required` | `boolean` | | Whether compensation plan was needed |
| `comp_plan_applied` | `boolean` | | Whether compensation was actually applied |
| `rollback_used` | `boolean` | | Whether rollback mechanism was triggered |

### 5.4 Meta Extensions

| Field | Type | Description |
|:---|:---|:---|
| `impact_analysis_duration_ms` | `integer` | Time spent on impact analysis |
| `predicted_vs_actual_accuracy` | `enum` | Prediction accuracy: `accurate`, `underestimated`, `overestimated` |

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

**End of Learning Sample Schema Reference**