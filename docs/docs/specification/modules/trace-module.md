---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-TRACE-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-trace.schema.json"
    - "schemas/v2/invariants/sa-invariants.yaml"
    - "schemas/v2/invariants/observability-invariants.yaml"
external_standards:
  w3c_trace_context: informative
  opentelemetry: informative

# UI metadata (non-normative; excluded from protocol semantics)
title: Trace Module
sidebar_label: Trace Module
sidebar_position: 4
description: "Schema-centered specification page for the MPLP Trace module."
---

# Trace Module

## Scope

This page documents the normative schema surface of the **Trace module** as
defined in `schemas/v2/mplp-trace.schema.json`.

It covers the Trace object shape, segment shape, status enums, and the relevant
invariant context. It does not define trace export formats, runtime mutation
policy, or external observability integration doctrine.

## Non-Goals

This page does not define:

- new trace immutability rules beyond frozen sources
- W3C conversion formulas
- OTLP or vendor export contracts
- event-to-segment mapping algorithms
- SDK trace helpers

## 1. Purpose

The Trace module records a trace artifact tied to protocol execution evidence.

At minimum, a Trace object carries:

- protocol metadata
- a unique `trace_id`
- a `context_id`
- a `root_span`
- a lifecycle `status`

Trace objects may also carry `plan_id`, `segments`, and `events`.

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-trace.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `trace_id` | identifier | Canonical trace identifier |
| `context_id` | identifier | Parent Context identifier |
| `root_span` | object | Uses `common/trace-base.schema.json` |
| `status` | enum | Trace lifecycle field |

### Optional Fields

| Field | Type |
|:---|:---|
| `governance` | object |
| `plan_id` | identifier |
| `started_at` | date-time |
| `finished_at` | date-time |
| `segments` | array |
| `events` | array |

### `trace_segment_core`

Each segment requires:

- `segment_id`
- `label`
- `status`

Optional segment fields:

- `parent_segment_id`
- `started_at`
- `finished_at`
- `attributes`

### Trace `status` Enum

`status` is constrained to:

- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`

### Segment `status` Enum

Segment `status` is constrained to:

- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`
- `skipped`

## 3. Invariant Context

Relevant SA-profile checks are:

- `sa_trace_not_empty`
- `sa_trace_context_binding`
- `sa_trace_plan_binding`

Trace `events`, when present, remain subject to the event schemas and the
observability invariant set in `schemas/v2/invariants/observability-invariants.yaml`.

This page does not introduce additional Trace invariants beyond those frozen
sources.

## 4. Boundary Notes

- This page does not define a protocol-wide immutability algorithm for traces
  or segments.
- This page does not define external trace-header compatibility as a protocol
  requirement.
- This page does not define canonical export formats such as OTLP or Jaeger.
- This page does not define runtime event-linking rules beyond the schema
  surface and invariant context named above.

## 5. References

- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/common/trace-base.schema.json`
- `schemas/v2/invariants/sa-invariants.yaml`
- `schemas/v2/invariants/observability-invariants.yaml`
- [Observability Overview](/docs/specification/observability)

---

**Final Boundary**: this page specifies the Trace object and segment shape plus
the frozen invariant context that applies to Trace evidence. It does not define
new runtime tracing doctrine.
