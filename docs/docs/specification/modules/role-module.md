---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-ROLE-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-role.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Role Module
sidebar_label: Role Module
sidebar_position: 5
description: "Schema-centered specification page for the MPLP Role module."
---

# Role Module

## Scope

This page documents the normative schema surface of the **Role module** as
defined in `schemas/v2/mplp-role.schema.json`.

It covers the role record shape and the fields carried by that record. It does
not define a canonical permission model, role hierarchy, or enforcement engine.

## Non-Goals

This page does not define:

- a canonical capability taxonomy
- wildcard semantics
- RBAC algorithms
- default role catalogs
- SDK role helpers

## 1. Purpose

The Role module records a named role artifact and its associated descriptive
fields.

At minimum, a Role object carries:

- protocol metadata
- a unique `role_id`
- a human-readable `name`

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-role.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `role_id` | identifier | Canonical role identifier |
| `name` | string | Human-readable role name |

### Optional Fields

| Field | Type |
|:---|:---|
| `governance` | object |
| `description` | string |
| `capabilities` | array of strings |
| `created_at` | date-time |
| `updated_at` | date-time |
| `trace` | object |
| `events` | array |

### `capabilities`

The schema models `capabilities` as an optional array of strings.

This page does not impose a canonical grammar, wildcard format, hierarchy, or
permission-evaluation rule beyond that schema shape.

## 3. Cross-Object Context

Other schema surfaces may carry role-related fields, for example:

- `agent_role`
- `requested_by_role`
- `participants[*].role_id`
- `owner_role`

The consuming schema and runtime determine how those fields are used. This page
does not define a universal resolution or enforcement model for them.

## 4. Boundary Notes

- This page does not define standard roles such as planner, reviewer, or
  orchestrator as protocol requirements.
- This page does not define `resource.action` as a mandatory capability
  grammar.
- This page does not define role inheritance, rank, or conflict resolution.
- This page does not define a runtime authorization engine.

## 5. References

- `schemas/v2/mplp-role.schema.json`
- [Plan Module](/docs/specification/modules/plan-module.md)
- [Confirm Module](/docs/specification/modules/confirm-module.md)
- [Collab Module](/docs/specification/modules/collab-module.md)

---

**Final Boundary**: this page specifies the Role object shape and field-level
surface only. It does not create a larger permission doctrine beyond the frozen
schema.
