---
sidebar_position: 92
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-ALIGNMENT-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Semantic Alignment Overview
sidebar_label: Semantic Alignment
description: "MPLP specification: Semantic Alignment Overview. Normative protocol requirements."
authority: Documentation Governance
---

> Governance: MPGC
>
> This document does not define protocol requirements, impose obligations, or serve as a compliance or certification basis.
> It describes how MPLP ensures semantic consistency between specification and evaluation.

# Semantic Alignment Overview

**Purpose**: Explains how MPLP maintains semantic consistency across its documentation layers—from normative specification to informative evaluation.

---

## 1. The Challenge: Specification ↔ Evaluation Consistency

In any protocol-grade project, a fundamental challenge exists:

- **Specification** defines *what* the protocol requires
- **Evaluation** describes *how* to assess implementations

Without explicit alignment, these two layers can drift apart, causing:
- Ambiguous interpretation of requirements
- Evaluation scenarios that don't match specification intent
- Difficulty for implementers to understand "what counts as conformant"

MPLP addresses this through a **structured semantic alignment approach**.

---

## 2. Semantic Anchors: A Unified Coordinate System

MPLP defines **semantic anchors**—stable reference points that can be cited by both specification and evaluation documents.

### 2.1 Anchor Categories

| Category | Count | Purpose |
|----------|-------|---------|
| Concept Anchors (CA) | 15 | Core protocol concepts (Context, Plan, Trace, etc.) |
| Lifecycle Anchors (LA) | 7 | State transitions (Intent→Plan, Drift→Recovery, etc.) |
| Governance Anchors (GA) | 5 | Authority and control boundaries |
| Architectural Anchors (AA) | 4 | L1-L4 layer definitions |
| Kernel Duty Anchors (KD) | 11 | Cross-cutting concerns |
| Profile Anchors (PA) | 2 | SA and MAP configuration profiles |
| Golden Flow Anchors (GF) | 5 | Evaluation scenario references |

**Total**: 49 anchors

### 2.2 How Anchors Work

Each anchor has:
- A **unique ID** (e.g., `CA-01`, `KD-05`)
- A **definition source** in the Specification
- An optional **evaluation reference** in Evaluation documents

This creates a traceable link between "what is defined" and "how it is evaluated."

---

## 3. Cross-Directory Mapping

MPLP maintains explicit mapping matrices between:

### 3.1 Module → Conformance Mapping

Each of the 10 protocol modules is mapped to its corresponding evaluation dimension:

| Module | Evaluation Dimension |
|--------|---------------------|
| Context | Schema Validity |
| Plan | Lifecycle Completeness |
| Trace | Trace Integrity |
| Confirm | Governance Gating |
| ... | ... |

### 3.2 Architecture Layer → Evidence Mapping

Each architectural layer (L1-L4) is mapped to Golden Flow scenarios that can produce evidence:

| Layer | Evidence Type |
|-------|---------------|
| L1 Core Protocol | Schema Validation |
| L2 Coordination | Module Lifecycles |
| L3 Execution | Trace Segments |
| L4 Integration | Integration Events |

### 3.3 Kernel Duty → Flow Coverage

The 11 cross-cutting kernel duties are mapped to the 5 Golden Flows, showing which duties are exercised by which scenarios.

---

## 4. Coverage and Gap Transparency

MPLP explicitly tracks what is covered and what is not:

### 4.1 Coverage Categories

| Status | Meaning |
|--------|---------|
| **DEFINED** | Specification document exists |
| **MAPPED** | Evaluation mapping declared |
| **PENDING** | Runtime evaluation not yet performed |

### 4.2 Intentional Gaps

Some areas are intentionally not covered in the current evaluation scope:

| Gap | Reason |
|-----|--------|
| Learning & Feedback (KD-04) | Not in v1.0 scope |
| Performance (KD-07) | Non-functional concern |
| Protocol Versioning (KD-08) | Meta-level concern |

These are documented as **intentional exclusions**, not missing coverage.

---

## 5. Authority Split: Who Does What

MPLP maintains a clear separation of authority:

| Layer | Authority | Responsibility |
|-------|-----------|----------------|
| **Specification** | MPGC | Defines schemas, invariants, normative requirements |
| **Evaluation** | None (informative) | Describes assessment scenarios, evidence models |
| **Validation Lab** | Self-declaration | Adjudicates runtime conformance (future) |

This ensures that:
- Specification defines requirements
- Evaluation describes how to assess
- Neither layer makes compliance or certification claims

---

## 6. Benefits for Implementers

This alignment approach provides:

1. **Traceability**: Every evaluation scenario links back to specification anchors
2. **Clarity**: Clear distinction between "what is required" and "how it is assessed"
3. **No Hidden Requirements**: Gaps are explicitly documented
4. **Self-Assessment Path**: Implementers can use Golden Flows for self-evaluation

---

## 7. Related Documents

| Document | Purpose |
|----------|---------|
| [Semantic Anchor Registry](/docs/specification/semantic-anchor-registry) | Complete list of 49 anchors |
| [Spec-Eval Matrix](/docs/specification/spec-to-eval-matrix) | Module → Conformance mapping |
| [Module-Duty Matrix](/docs/specification/module-to-duty-matrix) | Module → Kernel Duty mapping |
| [Flow-Duty Matrix](/docs/specification/flow-to-duty-matrix) | Golden Flow → Duty mapping |
| [Coverage Report](/docs/specification/normative-coverage-report) | Coverage status and gaps |

---

**Anchors Defined**: 49
**Mapping Matrices**: 3
