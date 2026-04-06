---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-OBS-OVERVIEW-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Observability Overview
sidebar_label: Observability Overview
sidebar_position: 1
description: "Orientation page for frozen MPLP observability sources and reading order."
authority: Documentation Governance
---

# Observability Overview

This page provides an orientation to MPLP observability sources. It does not
create a second observability doctrine layer.

Frozen observability meaning remains anchored in:

- `schemas/v2/taxonomy/event-taxonomy.yaml`
- `schemas/v2/taxonomy/module-event-matrix.yaml`
- `schemas/v2/invariants/observability-invariants.yaml`
- the relevant event schemas under `schemas/v2/events/`
- `schemas/v2/mplp-trace.schema.json`

## What This Section Covers

The observability section helps readers locate:

- event-family classification
- module-to-event mapping
- observability invariant anchors
- trace-object and segment-object references

It does not define:

- runtime event buses
- export transports
- external observability platform contracts
- implementation-specific trace pipelines

## Reading Order

Use the observability section in this order:

1. [Event Taxonomy](./event-taxonomy.md)
   Establish the frozen event-family set first.
2. [Observability Invariants](./observability-invariants.md)
   Read the event-validation layer next.
3. [Module Event Matrix](./module-event-matrix.md)
   Read module/event relationships after the family set is clear.
4. [Runtime Trace Format](./runtime-trace-format.md)
   Read this last as a trace-object and export-boundary reference, not as a
   universal runtime/export contract.

## Frozen Source Summary

### Event Taxonomy

`schemas/v2/taxonomy/event-taxonomy.yaml` defines:

- 12 general event families
- compliance labels for those families
- schema references for each family
- profile-event entries for SA and MAP

### Module Event Matrix

`schemas/v2/taxonomy/module-event-matrix.yaml` defines:

- module-to-family mappings
- primary vs secondary family associations
- machine-readable trigger and event-type examples
- a compliance summary block for required families and required producers

### Observability Invariants

`schemas/v2/invariants/observability-invariants.yaml` defines the frozen
observability invariant set.

### Trace Artifact

`schemas/v2/mplp-trace.schema.json` defines the Trace object and segment object
shape at the protocol layer.

## Required General Event Families

The frozen taxonomy marks these general families as required:

- `graph_update`
- `pipeline_stage`

Other family compliance levels should be read from the taxonomy itself.

## Boundary Notes

- The general event families are not the same thing as the profile-specific SA
  and MAP event surfaces.
- The trace schema is not, by itself, a universal external export contract.
- If an explanatory observability page conflicts with the frozen taxonomy,
  invariants, or event schemas, the frozen sources prevail.

## References

- `schemas/v2/taxonomy/event-taxonomy.yaml`
- `schemas/v2/taxonomy/module-event-matrix.yaml`
- `schemas/v2/invariants/observability-invariants.yaml`
- `schemas/v2/mplp-trace.schema.json`
- [Event Taxonomy](./event-taxonomy.md)
- [Module Event Matrix](./module-event-matrix.md)
- [Runtime Trace Format](./runtime-trace-format.md)

---

**Final Boundary**: this page is an orientation surface only. Formal
observability meaning remains in the frozen taxonomy, invariant, schema, and
trace artifacts.
