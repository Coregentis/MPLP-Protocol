---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-OBS-MATRIX-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Module Event Matrix
sidebar_label: Module Event Matrix
sidebar_position: 2
description: "Schema-anchored specification page for the frozen MPLP module/event mapping matrix."
---

# Module Event Matrix

## Scope

This page documents the frozen MPLP module/event mapping as declared in:

- `schemas/v2/taxonomy/module-event-matrix.yaml`

It records the machine-readable module-to-family relationships carried by that
file. It does not add emission doctrine, trigger algorithms, or runtime
implementation rules beyond the frozen matrix.

## Non-Goals

This page does not define:

- new module emission obligations
- new trigger-point doctrine
- event-bus implementations
- SDK emitters
- derived validation rules beyond the frozen matrix artifact

## 1. Purpose

The module-event matrix is the frozen mapping layer that relates L2 modules to
general event families for observability coverage.

It records:

- primary vs secondary family associations
- machine-readable event-type examples and trigger labels
- a compliance summary block

## 2. Frozen Module-to-Family Mapping

### 2.1 Primary and Secondary Family Associations

From `schemas/v2/taxonomy/module-event-matrix.yaml`:

| Module | Primary Families | Secondary Families |
|:---|:---|:---|
| `context` | `import_process`, `graph_update` | `intent` |
| `plan` | `pipeline_stage`, `graph_update` | `methodology`, `impact_analysis` |
| `trace` | none (consumer role) | `cost_budget` |
| `role` | `graph_update` | none |
| `confirm` | `pipeline_stage`, `graph_update` | `reasoning_graph` |
| `dialog` | `intent`, `delta_intent` | none |
| `collab` | `pipeline_stage`, `runtime_execution` | `reasoning_graph` |
| `extension` | `runtime_execution`, `external_integration` | none |
| `network` | `graph_update` | `runtime_execution` |
| `core` | `pipeline_stage` | `cost_budget`, `compensation_plan` |

### 2.2 Trace Special Case

The frozen matrix marks `trace` with:

- `role: "consumer"`
- `primary_events: []`

This page does not expand that into a broader persistence doctrine.

## 3. Frozen Compliance Summary

The matrix file includes this compliance summary:

### Required Event Families

- `graph_update`
- `pipeline_stage`

### Required Producers

| Family | Required Producers |
|:---|:---|
| `graph_update` | `context`, `plan` |
| `pipeline_stage` | `plan` |

### Validation Rule Labels In Matrix

The frozen matrix also includes:

- `all_modules_emit_required`
- `trace_receives_all`

These labels belong to the frozen machine-readable matrix artifact. This page
does not expand them into an independent prose doctrine.

## 4. Relationship to Other Frozen Sources

Use this page together with:

- `schemas/v2/taxonomy/event-taxonomy.yaml`
- the referenced event schema files
- `schemas/v2/invariants/observability-invariants.yaml`

This page should not be read as overriding any of those sources.

## 5. What This Page Does Not Create

This page does not create any of the following as new protocol obligations:

- “every module MUST emit X” rules beyond the frozen matrix summary
- per-trigger lifecycle rules
- event payload requirements beyond the referenced event schemas
- implementation helper classes or emitter APIs

If a specific obligation is not present in the frozen matrix, taxonomy, or
event schemas, this page should not be read as creating it.

## 6. Canonical Reading Path

Read module/event meaning in this order:

1. `schemas/v2/taxonomy/event-taxonomy.yaml`
2. `schemas/v2/taxonomy/module-event-matrix.yaml`
3. the relevant event schema file
4. `schemas/v2/invariants/observability-invariants.yaml`

## 7. References

- `schemas/v2/taxonomy/module-event-matrix.yaml`
- `schemas/v2/taxonomy/event-taxonomy.yaml`
- `schemas/v2/invariants/observability-invariants.yaml`
- [Event Taxonomy](./event-taxonomy.md)

---

**Final Boundary**: this page identifies the frozen module/event mapping only.
It does not create new emission or trigger doctrine beyond the frozen matrix.
