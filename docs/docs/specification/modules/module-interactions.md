---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-MOD-INTERACTIONS-001"
external_standards:
  w3c_trace_context: none
  opentelemetry: none
title: Module Interactions
sidebar_label: Module Interactions
sidebar_position: 1
description: "Informative cross-reference page for MPLP module bindings and interaction points."
authority: none
---

# Module Interactions

## Scope

This page is an **informative cross-reference** for how MPLP module objects bind
to one another through identifiers and references.

It is not a runtime orchestration specification, and it does not define new
normative obligations beyond the underlying schemas and profile invariants.

## Non-Goals

This page does not define:

- runtime execution order
- provider-specific orchestration
- event bus implementation
- UI workflow

## 1. Purpose

The purpose of this page is to make the main schema-level bindings between
module objects easier to navigate.

## 2. Core Reference Bindings

| From | Field | To | Meaning |
|:---|:---|:---|:---|
| Plan | `context_id` | Context | Plan binds to a Context |
| Trace | `context_id` | Context | Trace binds to a Context |
| Trace | `plan_id` | Plan | Trace may bind to a Plan |
| Confirm | `target_id` | Context / Plan / Trace / Extension / other | Confirm points to the gated target |
| Confirm | `requested_by_role` | role label | Confirm records who requested review |
| Collab | `context_id` | Context | Collaboration session binds to a Context |
| Collab participant | `role_id` | Role | Optional participant role binding |
| Dialog | `context_id` | Context | Dialog binds to a Context |
| Extension | `context_id` | Context | Extension binds to a Context |
| Network | `context_id` | Context | Network binds to a Context |
| Context | `owner_role` | Role | Optional owning role reference |

## 3. Reading Guidance

Use this page as a map, then go to the relevant source page:

- schema truth: `schemas/v2/*.schema.json`
- module pages: this section of the docs
- profile constraints: `schemas/v2/invariants/*.yaml`

## 4. Boundary Notes

- Not every reference implies runtime execution ordering.
- Not every relation here is mandatory in every product flow.
- Runtime coordination behavior belongs in runtime/profile guidance, not in this
  page.

## 5. References

- `schemas/v2/mplp-context.schema.json`
- `schemas/v2/mplp-plan.schema.json`
- `schemas/v2/mplp-confirm.schema.json`
- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/mplp-role.schema.json`
- `schemas/v2/mplp-collab.schema.json`
- `schemas/v2/mplp-dialog.schema.json`
- `schemas/v2/mplp-extension.schema.json`
- `schemas/v2/mplp-network.schema.json`

---

**Final Boundary**: this page is a navigation/reference aid for module
bindings. It is not a runtime behavior contract.
