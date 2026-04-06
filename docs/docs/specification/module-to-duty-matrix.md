---
sidebar_position: 94
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-MOD-DUTY-MATRIX-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Module to Kernel Duty Matrix
sidebar_label: Module-Duty Matrix
description: "Boundary page explaining that no frozen module-to-duty mapping authority is established by docs."
authority: Documentation Governance
---

# Module to Kernel Duty Matrix

This page exists to prevent over-reading module/duty relationships into a
docs-side matrix.

## Scope

The frozen source set includes:

- module schemas and their repaired documentation projections
- the kernel-duty taxonomy in `schemas/v2/taxonomy/kernel-duties.yaml`

It does **not** include a frozen canonical source that assigns primary or
secondary kernel duties to each module.

## What This Means

Accordingly, this page should not create:

- primary-duty assignments
- secondary-duty assignments
- exhaustive module-duty coverage claims
- cross-cutting responsibility doctrine

## Frozen Duty Taxonomy

The frozen kernel-duty taxonomy defines these duty entries:

| Duty ID | Duty Name |
|:---|:---|
| `KD-01` | Coordination |
| `KD-02` | Error Handling |
| `KD-03` | Event Bus |
| `KD-04` | Learning Feedback |
| `KD-05` | Observability |
| `KD-06` | Orchestration |
| `KD-07` | Performance |
| `KD-08` | Protocol Versioning |
| `KD-09` | Security |
| `KD-10` | State Sync |
| `KD-11` | Transaction |

This taxonomy names duties only. It does not, by itself, assign them to module
families.

## How To Read Modules Against Duties

If you need to reason about modules and duties:

1. Read the repaired module pages first.
2. Read the frozen kernel-duty taxonomy second.
3. Treat any further relationship as interpretive unless a frozen source
   explicitly establishes it.

## References

- [Modules Overview](/docs/specification/modules)
- `schemas/v2/taxonomy/kernel-duties.yaml`

---

**Final Boundary**: there is no frozen docs-side authority here for assigning
kernel duties to modules. This page exists to say so explicitly.
