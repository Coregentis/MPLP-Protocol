---
entry_surface: documentation
doc_type: reference
normativity: informative
status: draft
authority: Documentation Governance
protocol_version: "1.0.0"
doc_id: "DOC-OBS-TRACE-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Runtime Trace Format
sidebar_label: Runtime Trace Format
sidebar_position: 4
description: "Reference page for the frozen MPLP Trace object shape and the boundary between protocol trace artifacts and runtime export formats."
---

# Runtime Trace Format

## Scope

This page is an informative reference over the frozen protocol artifacts most
relevant to runtime trace outputs:

- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/common/trace-base.schema.json`
- `schemas/v2/common/events.schema.json`
- `schemas/v2/invariants/observability-invariants.yaml`

It does not define a universal external trace/export contract for runtimes.

## Non-Goals

This page does not define:

- W3C conversion formulas
- OTLP or Jaeger contracts
- required attribute sets for all runtimes
- transport protocols
- implementation-specific export pipelines

## 1. Purpose

This page helps readers understand the frozen protocol-side shape of Trace
artifacts and where the boundary lies between:

- the protocol Trace object
- the common trace-base fields
- implementation-level export or interoperability choices

## 2. Frozen Trace Artifact Surface

### 2.1 Trace Object

From `schemas/v2/mplp-trace.schema.json`, the Trace object requires:

- `meta`
- `trace_id`
- `context_id`
- `root_span`
- `status`

Optional top-level fields include:

- `governance`
- `plan_id`
- `started_at`
- `finished_at`
- `segments`
- `events`

### 2.2 Trace `status` Enum

The frozen schema constrains Trace `status` to:

- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`

### 2.3 Segment Object

From `trace_segment_core` in `schemas/v2/mplp-trace.schema.json`, each segment
requires:

- `segment_id`
- `label`
- `status`

Optional segment fields include:

- `parent_segment_id`
- `started_at`
- `finished_at`
- `attributes`

Segment `status` is constrained to:

- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`
- `skipped`

## 3. Frozen Common Trace Base

From `schemas/v2/common/trace-base.schema.json`, the common trace-base object
provides fields such as:

- `trace_id`
- `span_id`
- `parent_span_id`
- `context_id`
- `attributes`

This common trace-base schema is part of the protocol artifact chain. It should
not be read by itself as a complete external observability export contract.

## 4. Event Context

When `Trace.events` is present in `mplp-trace.schema.json`, its items point to
`schemas/v2/common/events.schema.json`.

General observability event-family validity is separately constrained by
`schemas/v2/invariants/observability-invariants.yaml` and the event schema set
under `schemas/v2/events/`.

## 5. Export Boundary

The frozen protocol baseline defines the Trace object shape. It does **not**
define one universal export format for all runtimes.

Accordingly:

- this page should not be read as a mandatory OTLP contract
- this page should not be read as a mandatory W3C Trace Context mapping
- this page should not be read as a mandatory Jaeger contract

If an implementation exports Trace data to external tooling, that remains an
implementation-layer concern unless a frozen protocol artifact explicitly says
otherwise.

## 6. What This Page Does Not Create

This page does not create any of the following as new protocol doctrine:

- canonical `mplp.*` attribute families
- one required JSONL export format
- one required external trace header format
- one universal runtime trace envelope beyond `mplp-trace.schema.json`

## 7. Canonical Reading Path

Read runtime-trace meaning in this order:

1. [Trace Module](/docs/specification/modules/trace-module.md)
2. `schemas/v2/mplp-trace.schema.json`
3. `schemas/v2/common/trace-base.schema.json`
4. `schemas/v2/invariants/observability-invariants.yaml`
5. this page, for the export boundary only

## 8. References

- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/common/trace-base.schema.json`
- `schemas/v2/common/events.schema.json`
- `schemas/v2/invariants/observability-invariants.yaml`
- [Trace Module](/docs/specification/modules/trace-module.md)
- [Observability Overview](./observability-overview.md)

---

**Final Boundary**: this page is a reference boundary around the frozen Trace
artifact shape. It does not define a universal normative runtime/export
contract.
