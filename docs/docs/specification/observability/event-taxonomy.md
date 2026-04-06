---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-OBS-TAXONOMY-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Event Taxonomy
sidebar_label: Event Taxonomy
sidebar_position: 1
description: "Schema-anchored specification page for the frozen MPLP event taxonomy."
---

# Event Taxonomy

## Scope

This page documents the frozen MPLP event taxonomy as declared in:

- `schemas/v2/taxonomy/event-taxonomy.yaml`
- the event schemas referenced by that taxonomy

It records the event-family classification carried by the frozen taxonomy. It
does not define payload doctrine, processing logic, or new event semantics.

## Non-Goals

This page does not define:

- per-family field models beyond the referenced schemas
- trigger algorithms
- example payload contracts
- event-processing behavior
- runtime export or transport rules

## 1. Purpose

The event taxonomy is the frozen classification layer for MPLP observability
events.

It identifies:

- the 12 general event families
- the compliance label for each family
- the schema reference for each family
- the profile-event entries for SA and MAP

## 2. Frozen General Event Families

From `schemas/v2/taxonomy/event-taxonomy.yaml`:

| Family | Title | Compliance | Schema |
|:---|:---|:---|:---|
| `graph_update` | `GraphUpdateEvent` | required | `schemas/v2/events/mplp-graph-update-event.schema.json` |
| `pipeline_stage` | `PipelineStageEvent` | required | `schemas/v2/events/mplp-pipeline-stage-event.schema.json` |
| `runtime_execution` | `RuntimeExecutionEvent` | recommended | `schemas/v2/events/mplp-runtime-execution-event.schema.json` |
| `import_process` | `ImportProcessEvent` | recommended | `schemas/v2/events/mplp-event-core.schema.json` |
| `intent` | `IntentEvent` | recommended | `schemas/v2/events/mplp-event-core.schema.json` |
| `delta_intent` | `DeltaIntentEvent` | optional | `schemas/v2/events/mplp-event-core.schema.json` |
| `impact_analysis` | `ImpactAnalysisEvent` | optional | `schemas/v2/events/mplp-event-core.schema.json` |
| `compensation_plan` | `CompensationPlanEvent` | optional | `schemas/v2/events/mplp-event-core.schema.json` |
| `methodology` | `MethodologyEvent` | optional | `schemas/v2/events/mplp-event-core.schema.json` |
| `reasoning_graph` | `ReasoningGraphEvent` | optional | `schemas/v2/events/mplp-event-core.schema.json` |
| `cost_budget` | `CostAndBudgetEvent` | recommended | `schemas/v2/events/mplp-event-core.schema.json` |
| `external_integration` | `ExternalIntegrationEvent` | recommended | `schemas/v2/events/mplp-event-core.schema.json` |

## 3. Profile-Specific Event Entries

The frozen taxonomy also carries profile-event entries separate from the 12
general families:

| Profile Event Entry | Title | Schema |
|:---|:---|:---|
| `sa_profile` | `SAEvent` | `schemas/v2/events/mplp-sa-event.schema.json` |
| `map_profile` | `MAPEvent` | `schemas/v2/events/mplp-map-event.schema.json` |

These entries should not be collapsed into new general event families.

## 4. Relationship to Event Schemas

This page classifies families and points to schemas. The schemas define the
actual field sets.

Relevant frozen event schemas include:

- `mplp-event-core.schema.json`
- `mplp-graph-update-event.schema.json`
- `mplp-pipeline-stage-event.schema.json`
- `mplp-runtime-execution-event.schema.json`
- `mplp-sa-event.schema.json`
- `mplp-map-event.schema.json`

This page does not restate a full field contract for those schemas.

## 5. What This Page Does Not Create

This page does not create any of the following as new protocol doctrine:

- semantic groups with independent normative force
- example payload models for each family
- trigger-point rules
- runtime export behavior
- module obligations beyond the separate frozen module-event matrix

If a specific field, payload, or processing rule is not present in the frozen
event schemas or taxonomy file, this page should not be read as creating it.

## 6. Canonical Reading Path

Read observability event meaning in this order:

1. `schemas/v2/taxonomy/event-taxonomy.yaml`
2. the relevant event schema file
3. `schemas/v2/invariants/observability-invariants.yaml`
4. [Module Event Matrix](./module-event-matrix.md) if module relationships are
   needed

## 7. References

- `schemas/v2/taxonomy/event-taxonomy.yaml`
- `schemas/v2/events/mplp-event-core.schema.json`
- `schemas/v2/events/mplp-graph-update-event.schema.json`
- `schemas/v2/events/mplp-pipeline-stage-event.schema.json`
- `schemas/v2/events/mplp-runtime-execution-event.schema.json`
- `schemas/v2/events/mplp-sa-event.schema.json`
- `schemas/v2/events/mplp-map-event.schema.json`

---

**Final Boundary**: this page identifies the frozen event-family taxonomy and
its schema references only. It does not create new payload, trigger, or export
doctrine.
