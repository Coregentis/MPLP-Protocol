---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-CONFIRM-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-confirm.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none
title: Confirm Module
sidebar_label: Confirm Module
sidebar_position: 6
description: "Schema-centered specification page for the MPLP Confirm module."
---

# Confirm Module

## Scope

This page documents the normative schema surface of the **Confirm module** as
defined in `schemas/v2/mplp-confirm.schema.json`.

It covers object shape and lifecycle state. It does not define UI workflow,
runtime trigger policy, or product-specific approval logic.

## Non-Goals

This page does not define:

- when a runtime or product must create a Confirm object
- human review UX
- notification channels
- implementation-specific approval routing

## 1. Purpose

The Confirm module records approval or rejection state for a target resource.

It is a protocol object used to represent:

- what resource is being gated
- who requested review
- when the request was created
- what decisions were recorded

The module does not itself define which actions are "high risk"; that comes from
runtime, governance, profile, or product policy outside this schema page.

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-confirm.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `confirm_id` | identifier | Canonical confirm identifier |
| `target_type` | enum | Type of gated resource |
| `target_id` | identifier | Identifier of gated resource |
| `status` | enum | Current confirm status |
| `requested_by_role` | string | Requesting role label |
| `requested_at` | date-time | Request timestamp |

### Optional Fields

| Field | Type |
|:---|:---|
| `reason` | string |
| `decisions` | array |
| `trace` | object |
| `events` | array |
| `governance` | object |

### `target_type` Enum

`target_type` is constrained to:

- `context`
- `plan`
- `trace`
- `extension`
- `other`

### `status` Enum

`status` is constrained to:

- `pending`
- `approved`
- `rejected`
- `cancelled`

### `decisions[]`

Each decision entry requires:

- `decision_id`
- `status`
- `decided_by_role`
- `decided_at`

Optional:

- `reason`

Decision `status` is constrained to:

- `approved`
- `rejected`
- `cancelled`

## 3. Lifecycle Semantics

At the schema level:

- `pending` is the unresolved state
- `approved`, `rejected`, and `cancelled` are terminal outcomes

This page does not define any additional workflow automation beyond those schema
states.

## 4. Cross-Object Relation

Confirm links to other protocol objects through:

- `target_type`
- `target_id`

The meaning of the target resource is resolved by the consuming runtime or
application. This page does not define a universal trigger or transition engine
for those targets.

## 5. Boundary Notes

- Confirm is a protocol object, not an approval service.
- This page does not define mandatory "plan approval flow" logic for every MPLP
  runtime.
- This page does not define learning capture semantics from decisions.

## 6. References

- `schemas/v2/mplp-confirm.schema.json`
- `schemas/v2/common/metadata.schema.json`

---

**Final Boundary**: this page defines the Confirm object shape and state model.
It does not define runtime trigger policy or implementation workflow.
