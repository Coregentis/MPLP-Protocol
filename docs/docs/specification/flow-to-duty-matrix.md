---
sidebar_position: 95
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-FLOW-DUTY-MATRIX-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Golden Flow to Kernel Duty Matrix
sidebar_label: Flow-Duty Matrix
description: "Boundary page explaining that no frozen flow-to-duty mapping authority is established by docs."
authority: Documentation Governance
---

# Golden Flow to Kernel Duty Matrix

This page exists to prevent over-reading golden-flow/duty relationships into a
docs-side matrix.

## Scope

The frozen source set includes:

- the kernel-duty taxonomy in `schemas/v2/taxonomy/kernel-duties.yaml`
- the evaluation/golden-flow surfaces under `/docs/evaluation/golden-flows`

It does **not** include a frozen canonical source that assigns primary or
secondary kernel duties to each golden flow.

## What This Means

Accordingly, this page should not create:

- primary-duty assignments for flows
- secondary-duty assignments for flows
- duty-coverage counts
- coverage-gap doctrine derived from a docs-side matrix

## Golden Flow Reference Surfaces

These are evaluation/reference surfaces:

| Flow Label | Read First |
|:---|:---|
| `FLOW-01` | [/docs/evaluation/golden-flows/gf-01](/docs/evaluation/golden-flows/gf-01) |
| `FLOW-02` | [/docs/evaluation/golden-flows/gf-02](/docs/evaluation/golden-flows/gf-02) |
| `FLOW-03` | [/docs/evaluation/golden-flows/gf-03](/docs/evaluation/golden-flows/gf-03) |
| `FLOW-04` | [/docs/evaluation/golden-flows/gf-04](/docs/evaluation/golden-flows/gf-04) |
| `FLOW-05` | [/docs/evaluation/golden-flows/gf-05](/docs/evaluation/golden-flows/gf-05) |

These pages are not replaced by this matrix page.

## Frozen Duty Taxonomy

The duty taxonomy remains the canonical source for duty names:

- `KD-01` through `KD-11` in `schemas/v2/taxonomy/kernel-duties.yaml`

## How To Read Flows Against Duties

If you need to reason about flows and duties:

1. Read the frozen duty taxonomy separately.
2. Read the golden-flow pages separately.
3. Treat any relationship between them as interpretive unless a frozen source
   explicitly establishes it.

## References

- [/docs/evaluation/golden-flows](/docs/evaluation/golden-flows)
- `schemas/v2/taxonomy/kernel-duties.yaml`

---

**Final Boundary**: there is no frozen docs-side authority here for assigning
kernel duties to golden flows. This page exists to say so explicitly.
