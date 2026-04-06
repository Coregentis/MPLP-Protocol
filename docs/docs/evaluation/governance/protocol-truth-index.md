---
sidebar_position: 2
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-TRUTH-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Protocol Truth Index
sidebar_label: Truth Index
description: "Routing page to the actual MPLP truth-source families and repaired first-order specification/reference surfaces."
authority: Documentation Governance
---

# Protocol Truth Index

This page is a **routing index** to actual MPLP truth-source families. It is
not itself a truth source, a sole reference, or a judgment constitution.

## 1. Repository-Backed Truth Sources

Use these source families first:

| Source Family | Read First |
|:---|:---|
| Protocol object schemas | `schemas/v2/mplp-*.schema.json` |
| Profile manifests | `schemas/v2/profiles/*.yaml` |
| Invariant files | `schemas/v2/invariants/*.yaml` |
| Taxonomy files | `schemas/v2/taxonomy/*.yaml` |
| Constitutional / governance baseline | `governance/` records and manifests |

## 2. Repaired First-Order Docs Surfaces

After the frozen source files, use these repaired docs surfaces:

| Surface Family | Read First |
|:---|:---|
| Specification entry | [/docs/specification](/docs/specification) |
| Module pages | [/docs/specification/modules](/docs/specification/modules) |
| Profile pages | [/docs/specification/profiles](/docs/specification/profiles) |
| Observability pages | [/docs/specification/observability](/docs/specification/observability) |
| Entry/surface authority model | [/docs/reference/entrypoints](/docs/reference/entrypoints) |

## 3. What This Page Does Not Do

This page does not:

- restate schema fields as a competing truth table
- define PTA or audit judgment rules
- define “sole reference” logic inside docs
- replace frozen governance or version manifests

## 4. Reading Rule

If this page conflicts with:

- repository-backed schema/invariant/profile/taxonomy artifacts
- repaired first-order spec/reference pages
- frozen governance baseline records

then this page loses.

## 5. Related References

- [Entry Points](/docs/reference/entrypoints)
- [Versioning Policy](./versioning-policy.md)
- [/docs/specification](/docs/specification)

---

**Final Boundary**: this page is a routing index only. Protocol truth remains in
the frozen source artifacts and repaired first-order docs surfaces it points to.
