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
sidebar_position: 0
description: "MPLP observability specification: Observability Overview. Defines event schemas and trace formats."
authority: protocol
---

# Observability Overview

This page provides a navigational overview of MPLP observability specifications. It does not define normative requirements.


Observability in MPLP ensures that:

- **All agent actions are traceable** — Every step, decision, and state change is recorded
- **Lifecycle transitions are auditable** — Plan/Step status changes emit structured events
- **Events are consistent across modules** — 12 Event Families with schema validation
- **Runtime traces can be exported** — W3C Trace Context and OTLP compatibility

**Design Principle**: "If it happened, it's in the trace"

## Normative Specifications

The following documents define the normative observability semantics:

| Document | Purpose |
|:---|:---|
| **[Event Taxonomy](event-taxonomy.md)** | Defines all 12 event families and their semantics |
| **[Module–Event Matrix](module-event-matrix.md)** | Maps which modules emit which events |
| **[Observability Invariants](observability-invariants.md)** | Defines 12 global observability correctness rules |
| **[Runtime Trace Format](runtime-trace-format.md)** | Defines trace structure and OTLP compatibility |

## Reference Artifacts

| Artifact | Type |
|:---|:---|
| [event-taxonomy.yaml](../../../../schemas/v2/taxonomy/event-taxonomy.yaml) | Machine-readable event definitions (Schema Truth Source) |
| [module-event-matrix.yaml](../../../../schemas/v2/taxonomy/module-event-matrix.yaml) | Machine-readable module mapping (Schema Truth Source) |
| [Common Schemas Reference](common-schemas-reference.md) | Shared schema components |
| [Physical Schemas Reference](physical-schemas-reference.md) | Event schema details |

## Required Events (Quick Reference)

| Event Family | Compliance | Schema |
|:---|:---:|:---|
| `pipeline_stage` | **REQUIRED** | `mplp-pipeline-stage-event.schema.json` |
| `graph_update` | **REQUIRED** | `mplp-graph-update-event.schema.json` |

See [Event Taxonomy](event-taxonomy.md) for all 12 families.

## Reading Path

1. **Start with [Event Taxonomy](event-taxonomy.md)** — Understand the 12 event families
2. **Review [Module–Event Matrix](module-event-matrix.md)** — See which modules emit which events
3. **Validate with [Observability Invariants](observability-invariants.md)** — Understand correctness rules
4. **Implement export using [Runtime Trace Format](runtime-trace-format.md)** — Export to external tools

---

**Required Events**: pipeline_stage, graph_update  
**Total Event Families**: 12  
**Export Formats**: JSON, JSONL, OTLP, Jaeger