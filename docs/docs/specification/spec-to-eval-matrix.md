---
sidebar_position: 93
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-SPEC-EVAL-MATRIX-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Specification to Evaluation Matrix
sidebar_label: Spec-Eval Matrix
description: "Cross-reference index between repaired specification pages and related evaluation/reference surfaces."
authority: Documentation Governance
---

# Specification to Evaluation Matrix

This page is a **cross-reference index** between repaired specification surfaces
and related evaluation/reference surfaces. It does not define canonical
evaluation mappings, conformance doctrine, or adjudication coverage.

## Scope

This page points readers from specification topics toward related evaluation
reading.

It does not certify:

- which evaluation dimensions are canonically bound to each module
- which flows fully cover which protocol surfaces
- which Validation Lab outputs settle those relationships

## 1. Module-Oriented Cross-References

| Specification Surface | Related Evaluation Reading | Boundary |
|:---|:---|:---|
| [Context Module](/docs/specification/modules/context-module.md) | [Conformance](/docs/evaluation/conformance) | Related reading only; evaluation pages do not redefine Context semantics |
| [Plan Module](/docs/specification/modules/plan-module.md) | [Conformance](/docs/evaluation/conformance), [Golden Flows](/docs/evaluation/golden-flows) | Related reading only |
| [Trace Module](/docs/specification/modules/trace-module.md) | [Conformance](/docs/evaluation/conformance), [Validation Lab](/docs/evaluation/validation-lab) | Related reading only |
| [Confirm Module](/docs/specification/modules/confirm-module.md) | [Conformance](/docs/evaluation/conformance), [Golden Flows](/docs/evaluation/golden-flows) | Related reading only |
| [Collab Module](/docs/specification/modules/collab-module.md) | [Golden Flows](/docs/evaluation/golden-flows) | Related reading only |
| [Role Module](/docs/specification/modules/role-module.md) | [Conformance](/docs/evaluation/conformance) | Related reading only |
| [Dialog Module](/docs/specification/modules/dialog-module.md) | [Conformance](/docs/evaluation/conformance) | Related reading only |
| [Extension Module](/docs/specification/modules/extension-module.md) | [Conformance](/docs/evaluation/conformance) | Related reading only |
| [Network Module](/docs/specification/modules/network-module.md) | [Conformance](/docs/evaluation/conformance) | Related reading only |
| [Core Module](/docs/specification/modules/core-module.md) | [Evaluation](/docs/evaluation) | Related reading only |

## 2. Profile-Oriented Cross-References

| Specification Surface | Related Evaluation Reading | Boundary |
|:---|:---|:---|
| [SA Profile](/docs/specification/profiles/sa-profile.md) | [Golden Flows](/docs/evaluation/golden-flows), [Conformance](/docs/evaluation/conformance) | Related reading only |
| [MAP Profile](/docs/specification/profiles/map-profile.md) | [Golden Flows](/docs/evaluation/golden-flows), [Validation Lab](/docs/evaluation/validation-lab) | Related reading only |

## 3. Observability-Oriented Cross-References

| Specification Surface | Related Evaluation Reading | Boundary |
|:---|:---|:---|
| [Event Taxonomy](/docs/specification/observability/event-taxonomy.md) | [Conformance](/docs/evaluation/conformance) | Related reading only |
| [Module Event Matrix](/docs/specification/observability/module-event-matrix.md) | [Golden Flows](/docs/evaluation/golden-flows) | Related reading only |
| [Runtime Trace Format](/docs/specification/observability/runtime-trace-format.md) | [Validation Lab](/docs/evaluation/validation-lab) | Related reading only |

## 4. How To Read This Matrix

- Start with the repaired specification page first.
- Use the linked evaluation page only as related downstream reading.
- If an evaluation or Validation Lab reference page appears to say more than the
  frozen specification baseline supports, the frozen specification baseline
  prevails.

## 5. What This Page Does Not Create

This page does not create:

- canonical module-to-dimension mappings
- canonical profile-to-flow mappings
- canonical architecture-to-evidence mappings
- coverage or validation verdicts

## 6. References

- [Specification](/docs/specification)
- [Evaluation](/docs/evaluation)
- [Validation Lab Overview](/docs/evaluation/validation-lab)

---

**Final Boundary**: this page is a cross-reference aid only. It is not a truth
source for evaluation relationships.
