---
sidebar_position: 90
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-COVERAGE-REPORT-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Normative Coverage Report
sidebar_label: Coverage Report
description: "Docs-side inventory of frozen MPLP source families and related repaired reference surfaces."
authority: Documentation Governance
---

# Normative Coverage Report

This page is a **docs-side inventory view**. It does not certify normative
coverage, implementation completeness, evaluation completeness, or Validation
Lab adjudication completeness.

## Scope

This page records only conservative inventory facts that can be read directly
from frozen source families and repaired first-order docs surfaces.

## Non-Goals

This page does not provide:

- a coverage verdict
- a completeness proof
- an evaluation-readiness certification
- a runtime-validation status
- a Validation Lab readiness determination

## 1. Frozen Source Families Present

| Source Family | Frozen Artifact Basis | Notes |
|:---|:---|:---|
| Protocol object schemas | `schemas/v2/mplp-*.schema.json` | Object-family truth source |
| Profile manifests | `schemas/v2/profiles/*.yaml` | SA and MAP profile baselines |
| General event taxonomy | `schemas/v2/taxonomy/event-taxonomy.yaml` | 12 general event families |
| Module/event matrix | `schemas/v2/taxonomy/module-event-matrix.yaml` | Machine-readable mapping artifact |
| Kernel-duty taxonomy | `schemas/v2/taxonomy/kernel-duties.yaml` | 11 duty names/slugs |
| Invariant files | `schemas/v2/invariants/*.yaml` | Frozen invariant families |

## 2. Repaired First-Order Docs Surfaces Present

| Docs Surface Family | Read First |
|:---|:---|
| Module pages | [/docs/specification/modules](/docs/specification/modules) |
| Profile pages | [/docs/specification/profiles](/docs/specification/profiles) |
| Observability pages | [/docs/specification/observability](/docs/specification/observability) |
| Architecture layer boundary pages | [/docs/specification/architecture](/docs/specification/architecture) |
| Validation Lab reference pages | [/docs/evaluation/validation-lab](/docs/evaluation/validation-lab) |

## 3. What This Page Can Safely Say

This page can safely say that:

- the frozen source families listed above exist
- repaired first-order docs surfaces exist for key specification/reference areas
- downstream projection pages should remain subordinate to those sources and
  repaired first-order pages

## 4. What This Page Cannot Safely Say

This page cannot safely claim:

- that all protocol semantics are fully covered by evaluation
- that all flows cover all duties
- that all modules have canonical evaluation mappings
- that runtime validation has been completed
- that Phase E/F or Validation Lab coverage is complete

Those claims belong to other workstreams and evidence-bearing surfaces, not to
this docs-side inventory page.

## 5. How To Use This Page

Use this page only to:

- understand which frozen source families exist
- locate repaired first-order documentation surfaces
- avoid treating docs-side matrices as proof of completeness

## References

- [Specification](/docs/specification)
- [Evaluation](/docs/evaluation)
- `schemas/v2/`

---

**Final Boundary**: this page is an inventory projection only. It does not
issue coverage verdicts or normative completeness claims.
