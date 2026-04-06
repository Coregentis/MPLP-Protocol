---
sidebar_position: 91
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-ANCHOR-REGISTRY-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Semantic Anchor Registry
sidebar_label: Semantic Anchors
description: "Navigation registry for key MPLP docs surfaces backed by frozen schemas, taxonomy, profiles, and repaired reference pages."
authority: Documentation Governance
---

# Semantic Anchor Registry

This page is a **documentation-side navigation registry**. It does not define
protocol semantics, create canonical IDs in the protocol, or replace frozen
source artifacts.

Its labels exist only to help readers move through already-repaired
specification/reference pages in a stable order.

## Scope

This registry is limited to source-backed navigation labels over:

- protocol object families
- profile baselines
- kernel-duty taxonomy entries
- evaluation-reference entrypoints

## Non-Goals

This page does not define:

- lifecycle doctrine
- authority doctrine
- module-to-duty doctrine
- flow-to-duty doctrine
- coverage claims
- new canonical term IDs for the protocol itself

## 1. Protocol Object Family Labels

These labels are documentation navigation aliases pointing to schema-backed
object-family pages.

| Label | Object Family | Read First |
|:---|:---|:---|
| `CA-01` | Context | [Context Module](/docs/specification/modules/context-module.md) |
| `CA-02` | Plan | [Plan Module](/docs/specification/modules/plan-module.md) |
| `CA-03` | Trace | [Trace Module](/docs/specification/modules/trace-module.md) |
| `CA-04` | Confirm | [Confirm Module](/docs/specification/modules/confirm-module.md) |
| `CA-05` | Collab | [Collab Module](/docs/specification/modules/collab-module.md) |
| `CA-06` | Role | [Role Module](/docs/specification/modules/role-module.md) |
| `CA-07` | Dialog | [Dialog Module](/docs/specification/modules/dialog-module.md) |
| `CA-08` | Extension | [Extension Module](/docs/specification/modules/extension-module.md) |
| `CA-09` | Network | [Network Module](/docs/specification/modules/network-module.md) |
| `CA-10` | Core | [Core Module](/docs/specification/modules/core-module.md) |

These labels are docs-side only. The frozen protocol truth remains in the
underlying schemas and repaired module pages.

## 2. Derived Reading Labels

These labels point to derived terms that are read through their parent
schema-backed pages.

| Label | Derived Term | Read Through |
|:---|:---|:---|
| `DA-01` | Step | [Plan Module](/docs/specification/modules/plan-module.md) |
| `DA-02` | Segment | [Trace Module](/docs/specification/modules/trace-module.md) |
| `DA-03` | Decision | [Confirm Module](/docs/specification/modules/confirm-module.md) |
| `DA-04` | Participant | [Collab Module](/docs/specification/modules/collab-module.md) |
| `DA-05` | Message | [Dialog Module](/docs/specification/modules/dialog-module.md) |

## 3. Profile Labels

These labels point to the frozen profile baselines.

| Label | Profile | Read First |
|:---|:---|:---|
| `PA-01` | SA | [SA Profile](/docs/specification/profiles/sa-profile.md) |
| `PA-02` | MAP | [MAP Profile](/docs/specification/profiles/map-profile.md) |

## 4. Kernel Duty Labels

The frozen duty taxonomy lives in `schemas/v2/taxonomy/kernel-duties.yaml`.
This registry mirrors those entries as docs-side navigation only.

| Label | Kernel Duty |
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

This page does not assign duties to modules, flows, or profiles. Those
relationships are not created here.

## 5. Evaluation Reference Labels

These labels point to evaluation/reference entry surfaces only.

| Label | Surface | Read First |
|:---|:---|:---|
| `ER-01` | Evaluation & Governance | [Evaluation](/docs/evaluation) |
| `ER-02` | Conformance | [/docs/evaluation/conformance](/docs/evaluation/conformance) |
| `ER-03` | Golden Flows | [/docs/evaluation/golden-flows](/docs/evaluation/golden-flows) |
| `ER-04` | Validation Lab Reference | [/docs/evaluation/validation-lab](/docs/evaluation/validation-lab) |

These labels do not define evaluation doctrine or adjudication coverage.

## 6. How To Use This Registry

Use this page only for:

- stable cross-reference labels inside docs
- locating repaired spec/reference pages quickly
- keeping navigation subordinate to frozen source artifacts

If this registry conflicts with a frozen schema, invariant file, profile
manifest, taxonomy file, or repaired first-order spec/reference page, the
registry loses.

## 7. References

- [Modules Overview](/docs/specification/modules)
- [Profiles Overview](/docs/specification/profiles)
- [Observability Overview](/docs/specification/observability)
- [Evaluation](/docs/evaluation)
- `schemas/v2/taxonomy/kernel-duties.yaml`

---

**Final Boundary**: this page is a docs-side navigation registry only. It is
not a protocol truth source and does not create new semantic authority.
