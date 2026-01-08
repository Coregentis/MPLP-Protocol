---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-OBS-INV-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Observability Invariants
sidebar_label: Observability Invariants
sidebar_position: 3
description: "MPLP observability specification: Observability Invariants. Defines event schemas and trace formats."
---

# Observability Invariants

## Scope

This specification defines the invariant rules for MPLP observability correctness.

## Non-Goals

This specification does not define validation implementations or SDK behavior.

## 1. Purpose

This document specifies the **normative invariants** that MUST be enforced for all MPLP Observability events. These invariants provide a runtime validation layer above the JSON Schema definitions, ensuring semantic correctness and consistency across event emissions.

**Source**: `schemas/v2/invariants/observability-invariants.yaml`

## 2. Invariant Categories

### 2.1 Overview

| Category | Count | Scope |
|:---|:---:|:---|
| Core Event Structure | 4 | All events |
| PipelineStageEvent | 3 | `event_family == pipeline_stage` |
| GraphUpdateEvent | 2 | `event_family == graph_update` |
| RuntimeExecutionEvent | 3 | `event_family == runtime_execution` |
| **Total** | **12** | |

## 3. Core Event Structure Invariants

These invariants apply to **ALL** Observability events regardless of event_family.

| ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `obs_event_id_is_uuid` | `event_id` | `uuid-v4` | All events must have UUID v4 event_id |
| `obs_event_type_non_empty` | `event_type` | `non-empty-string` | All events must have non-empty event_type |
| `obs_event_family_valid` | `event_family` | `enum(...)` | Event family must be valid enum value |
| `obs_timestamp_iso_format` | `timestamp` | `iso-datetime` | All events must have ISO 8601 timestamp |

### 3.1 Event Family Enum Values

From `obs_event_family_valid` rule:

```
import_process, intent, delta_intent, impact_analysis, 
compensation_plan, methodology, reasoning_graph, pipeline_stage, 
graph_update, runtime_execution, cost_budget, external_integration
```

## 4. PipelineStageEvent Invariants

These invariants apply **only when** `event_family == pipeline_stage`.

| ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `obs_pipeline_event_has_pipeline_id` | `pipeline_id` | `uuid-v4` | Must have valid pipeline_id |
| `obs_pipeline_stage_id_non_empty` | `stage_id` | `non-empty-string` | Must have non-empty stage_id |
| `obs_pipeline_stage_status_valid` | `stage_status` | `enum(...)` | Stage status must be valid |

### 4.1 Stage Status Enum

```
pending, running, completed, failed, skipped
```

## 5. GraphUpdateEvent Invariants

These invariants apply **only when** `event_family == graph_update`.

| ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `obs_graph_event_has_graph_id` | `graph_id` | `uuid-v4` | Must have valid graph_id |
| `obs_graph_update_kind_valid` | `update_kind` | `enum(...)` | Update kind must be valid |

### 5.1 Update Kind Enum

```
node_add, node_update, node_delete, 
edge_add, edge_update, edge_delete, bulk
```

## 6. RuntimeExecutionEvent Invariants

These invariants apply **only when** `event_family == runtime_execution`.

| ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `obs_runtime_event_has_execution_id` | `execution_id` | `uuid-v4` | Must have valid execution_id |
| `obs_runtime_executor_kind_valid` | `executor_kind` | `enum(...)` | Executor kind must be valid |
| `obs_runtime_status_valid` | `status` | `enum(...)` | Status must be valid |

### 6.1 Executor Kind Enum

```
agent, tool, llm, worker, external
```

### 6.2 Status Enum

```
pending, running, completed, failed, cancelled
```

## 7. Enforcement Notes

> [!IMPORTANT]
> If the invariant engine does not support conditional rules (based on `event_family`), these invariants should be validated at the schema level, which is already implemented in the event schemas.

These invariants provide an **additional layer** of runtime validation beyond JSON Schema validation:

1. **Schema Level**: Structural validation via JSON Schema
2. **Invariant Level**: Semantic validation via invariant rules
3. **Runtime Level**: Business logic validation in runtime code

## 8. Implementation Patterns

### 8.1 Validation Order

```
1. Parse JSON Syntax check
2. Validate against schema Structure check  
3. Evaluate invariants Semantic check
4. Accept or reject event
```

### 8.2 Error Handling

When an invariant is violated:

1. **Log** the violation with invariant ID and details
2. **Reject** the event (do not store/forward)
3. **Emit** a diagnostic event (if available)
4. **Alert** operators for critical invariants

## 9. Related Documents

**Observability**:
- [Event Taxonomy](event-taxonomy.md) - Event family definitions
- [Physical Schemas Reference](physical-schemas-reference.md) - Event schema details
- [Module Event Matrix](module-event-matrix.md) - Module-to-event mapping

**Schemas**:
- `schemas/v2/invariants/observability-invariants.yaml`
- `schemas/v2/events/*.schema.json`

---

**Total Invariants**: 12 (4 core + 3 pipeline + 2 graph + 3 runtime)  
**Enforcement**: Required for v1.0 conformant runtimes