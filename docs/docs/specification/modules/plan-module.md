---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-PLAN-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-plan.schema.json"
    - "schemas/v2/invariants/sa-invariants.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Plan Module
sidebar_label: Plan Module
sidebar_position: 3
description: "Schema-centered specification page for the MPLP Plan module."
---

# Plan Module

## Scope

This page documents the normative schema surface of the **Plan module** as
defined in `schemas/v2/mplp-plan.schema.json`.

It covers object shape, status enums, step shape, and the relevant invariant
context. It does not define a general execution engine, approval policy, or
planning algorithm.

## Non-Goals

This page does not define:

- a universal plan-transition table
- a runtime execution sequence
- approval-routing doctrine
- a DAG-validation algorithm
- SDK convenience APIs

## 1. Purpose

The Plan module records a structured plan artifact containing:

- protocol metadata
- a unique `plan_id`
- the `context_id` it belongs to
- a human-readable `title`
- an `objective`
- a lifecycle `status`
- one or more `steps`

The schema allows optional dependency references between steps. This page does
not add a broader planning doctrine beyond the schema and invariant files.

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-plan.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `plan_id` | identifier | Canonical plan identifier |
| `context_id` | identifier | Parent Context identifier |
| `title` | string | Human-readable plan label |
| `objective` | string | Objective description |
| `status` | enum | Plan lifecycle field |
| `steps` | array | Must contain at least one step |

### Optional Fields

| Field | Type |
|:---|:---|
| `trace` | object |
| `events` | array |

### `plan_step_core`

Each step requires:

- `step_id`
- `description`
- `status`

Optional step fields:

- `dependencies`
- `agent_role`
- `order_index`

### Plan `status` Enum

`status` is constrained to:

- `draft`
- `proposed`
- `approved`
- `in_progress`
- `completed`
- `cancelled`
- `failed`

### Step `status` Enum

Step `status` is constrained to:

- `pending`
- `in_progress`
- `completed`
- `blocked`
- `skipped`
- `failed`

## 3. Binding and Invariant Context

The Plan module participates in schema-level binding through `context_id`.

Relevant SA-profile checks are:

- `sa_plan_context_binding`
- `sa_plan_has_steps`
- `sa_steps_have_valid_ids`
- `sa_steps_agent_role_if_present`

Those rules live in `schemas/v2/invariants/sa-invariants.yaml`. This page does
not introduce additional Plan invariants beyond that source.

## 4. Boundary Notes

- This page does not define a complete transition matrix for `status`.
- This page does not define a universal approval rule for `proposed ->
  approved`.
- This page does not define cycle detection, duplicate-step checks, or execution
  ordering as independent doctrine unless a frozen source file states them.
- `dependencies` may be present as step references, but this page does not
  expand that into a larger runtime planning algorithm.

## 5. References

- `schemas/v2/mplp-plan.schema.json`
- `schemas/v2/invariants/sa-invariants.yaml`
- [Context Module](/docs/specification/modules/context-module.md)
- [Trace Module](/docs/specification/modules/trace-module.md)

---

**Final Boundary**: this page specifies the Plan object shape, step shape, and
the invariant context explicitly grounded in frozen sources. It does not define
new planning doctrine or runtime behavior.
