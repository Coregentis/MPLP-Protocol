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
description: "MPLP specification: Specification to Evaluation Matrix. Normative protocol requirements."
authority: Documentation Governance
---

# Specification to Evaluation Matrix

**Purpose**: Resolves whether Specification and Evaluation documents describe the same concepts.

---

## 1. Module → Conformance Mapping

| Module (Specification) | Conformance Doc (Evaluation) | Evaluation Dimension |
|:---|:---|:---|
| [context-module](/docs/specification/modules/context-module) CA-01 | [conformance-model](/docs/evaluation/conformance/conformance-model) | Schema Validity |
| [plan-module](/docs/specification/modules/plan-module) CA-02 | [conformance-model](/docs/evaluation/conformance/conformance-model) | Lifecycle Completeness |
| [trace-module](/docs/specification/modules/trace-module) CA-03 | [evaluation-dimensions](/docs/evaluation/conformance/evaluation-dimensions) | Trace Integrity |
| [confirm-module](/docs/specification/modules/confirm-module) CA-04 | [evaluation-dimensions](/docs/evaluation/conformance/evaluation-dimensions) | Governance Gating |
| [collab-module](/docs/specification/modules/collab-module) CA-05 | [evaluation-dimensions](/docs/evaluation/conformance/evaluation-dimensions) | Multi-agent Coordination (Future) |
| [role-module](/docs/specification/modules/role-module) CA-06 | [conformance-model](/docs/evaluation/conformance/conformance-model) | Schema Validity |
| [dialog-module](/docs/specification/modules/dialog-module) CA-07 | [conformance-model](/docs/evaluation/conformance/conformance-model) | Schema Validity |
| [extension-module](/docs/specification/modules/extension-module) CA-08 | [conformance-model](/docs/evaluation/conformance/conformance-model) | Schema Validity |
| [network-module](/docs/specification/modules/network-module) CA-09 | [conformance-model](/docs/evaluation/conformance/conformance-model) | Schema Validity |
| Observability Events CA-10 | [evidence-model](/docs/evaluation/conformance/evidence-model) | Evidence Validity |

---

## 2. Architecture Layer → Evaluation Mapping

| Layer (Specification) | Golden Flow (Evaluation) | Primary Evidence |
|:---|:---|:---|
| [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol) AA-01 | All FLOW-01~05 | Schema Validation |
| [L2 Coordination](/docs/specification/architecture/l2-coordination-governance) AA-02 | [FLOW-01](/docs/evaluation/golden-flows/gf-01), [FLOW-02](/docs/evaluation/golden-flows/gf-02) | Module Lifecycles |
| [L3 Execution](/docs/specification/architecture/l3-execution-orchestration) AA-03 | [FLOW-03](/docs/evaluation/golden-flows/gf-03), [FLOW-04](/docs/evaluation/golden-flows/gf-04) | Trace Segments |
| [L4 Integration](/docs/specification/architecture/l4-integration-infra) AA-04 | [FLOW-05](/docs/evaluation/golden-flows/gf-05) | Integration Events |

---

## 3. Profile → Golden Flow Mapping

| Profile (Specification) | Primary Golden Flow | Secondary Golden Flows |
|:---|:---|:---|
| [SA Profile](/docs/specification/profiles/sa-profile) PA-01 | [FLOW-01: SA Lifecycle](/docs/evaluation/golden-flows/gf-01) | FLOW-03, FLOW-04, FLOW-05 |
| [MAP Profile](/docs/specification/profiles/map-profile) PA-02 | [FLOW-02: MAP Coordination](/docs/evaluation/golden-flows/gf-02) | FLOW-03, FLOW-05 |

---

## 4. Invariants → Evaluation Dimensions Mapping

| Invariants File | Evaluation Dimension | Rule Count |
|:---|:---|:---:|
| `sa-invariants.yaml` | Lifecycle Completeness | 9 |
| `map-invariants.yaml` | Multi-agent Coordination | 9 |
| `observability-invariants.yaml` | Trace Integrity | 12 |
| `integration-invariants.yaml` | External Integration | 19 |
| `learning-invariants.yaml` | Learning Evidence | 12 |

**Total**: 61 invariant rules

*Rule Count reflects the number of invariant entries defined in the corresponding `*-invariants.yaml` files.
It does not imply runtime execution, validation, or coverage completion. Verification is scoped to Phase E/F.*

---

## 5. Answer Matrix

| Question | Specification Source | Evaluation Source |
|:---|:---|:---|
| **Who defines Context?** | CA-01 context-module | N/A (defined in Spec) |
| **Who evaluates Context?** | N/A | conformance-model, evidence-model |
| **Who adjudicates Context conformance?** | N/A | Validation Lab (Phase F) |
| **Who defines SA Profile?** | PA-01 sa-profile | N/A |
| **Who evaluates SA Profile?** | N/A | FLOW-01, conformance-model |
| **Who defines Governance Gate?** | CA-04 confirm-module | N/A |
| **Who evaluates Governance Gate?** | N/A | FLOW-05, evaluation-dimensions |

---

## 6. Cross-Reference Integrity

| Check | Status | Notes |
|:---|:---:|:---|
| All Modules have Evaluation mapping | Mapped | Via conformance-model (pending Phase E/F verification) |
| All Profiles have Golden Flow mapping | Mapped | SA→FLOW-01, MAP→FLOW-02 (pending Phase E/F verification) |
| All Layers have Evidence mapping | Mapped | Via Golden Flows (not runtime-validated) |
| All Invariants have Dimension mapping | Declared | 61 rules → 6 dimensions (not runtime-validated) |

---

**Phase**: D-2 (Cross-Directory Semantic Mapping)
**Coverage**: Mapping declared (subject to Phase E/F verification)
