---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-CONTEXT-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-context.schema.json"
    - "schemas/v2/invariants/sa-invariants.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none
title: Context Module
sidebar_label: Context Module
sidebar_position: 2
description: "Schema-centered specification page for the MPLP Context module."
---

# Context Module

## Scope

This page documents the normative schema surface of the **Context module** as
defined in `schemas/v2/mplp-context.schema.json`.

It focuses on object shape, required fields, and cross-object bindings. It does
not define runtime product behavior or execution policy.

## Non-Goals

This page does not define:

- runtime execution behavior
- storage implementation
- UI workflow
- product-specific project models

## 1. Purpose

The Context module defines the top-level lifecycle scope for MPLP objects.

At minimum, a Context object carries:

- protocol metadata
- a globally unique `context_id`
- a `root` object describing domain/environment scope
- a human-readable `title`
- a lifecycle `status`

Other objects may bind to a Context through `context_id`, but this page does not
claim runtime ownership rules beyond what is expressed in schemas and
invariants.

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-context.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `context_id` | identifier | Canonical context identifier |
| `root` | object | Scope anchor for the Context |
| `title` | string | Human-readable label |
| `status` | enum | Lifecycle status |

### Optional Fields

| Field | Type |
|:---|:---|
| `summary` | string |
| `tags` | array |
| `language` | string |
| `owner_role` | string |
| `constraints` | object |
| `created_at` | date-time |
| `updated_at` | date-time |
| `trace` | object |
| `events` | array |
| `governance` | object |

### `root` Object

`root` requires:

- `domain`
- `environment`

`entry_point` is optional.

### `status` Enum

`status` is constrained to:

- `draft`
- `active`
- `suspended`
- `archived`
- `closed`

## 3. Cross-Object Bindings

The Context module participates in schema-level bindings through `context_id`.

Common examples:

- `Plan.context_id`
- `Trace.context_id`
- `Dialog.context_id`
- `Collab.context_id`
- `Extension.context_id`
- `Network.context_id`

The exact requirements for those bindings are defined in their respective
schemas and, where applicable, profile invariants.

## 4. Invariant Context

Relevant SA-profile checks include:

- `sa_requires_context`
- `sa_context_must_be_active`
- `sa_plan_context_binding`
- `sa_trace_context_binding`

Those rules live in `schemas/v2/invariants/sa-invariants.yaml`. This page does
not restate them as new prose requirements beyond that source.

## 5. Boundary Notes

- Context is a protocol object, not a runtime state engine.
- This page does not define a "world model" beyond the schema fields above.
- This page does not define whether a runtime permits one or many Context
  instances in a product-specific deployment.

## 6. References

- `schemas/v2/mplp-context.schema.json`
- `schemas/v2/invariants/sa-invariants.yaml`
- `schemas/v2/common/metadata.schema.json`

---

**Final Boundary**: this page specifies the Context object shape and its
schema-level bindings. It does not define runtime execution behavior or product
policy.
