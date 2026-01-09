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
description: "MPLP specification: Module to Kernel Duty Matrix. Normative protocol requirements."
authority: Documentation Governance
---

# Module to Kernel Duty Matrix

**Purpose**: Resolves semantic relationships between 10 Modules and 11 Kernel Duties.

---

## 1. Primary Responsibility Matrix

| Module | Primary Duty | Secondary Duties |
|:---|:---|:---|
| CA-01 Context | KD-10 State Sync | KD-05 Observability |
| CA-02 Plan | KD-06 Orchestration | KD-01 Coordination, KD-11 Transaction |
| CA-03 Trace | KD-05 Observability | KD-03 Event Bus |
| CA-04 Confirm | KD-09 Security | KD-06 Orchestration |
| CA-05 Collab | KD-01 Coordination | KD-10 State Sync |
| CA-06 Role | KD-09 Security | KD-01 Coordination |
| CA-07 Dialog | KD-01 Coordination | KD-05 Observability |
| CA-08 Extension | KD-08 Protocol Versioning | KD-06 Orchestration |
| CA-09 Network | KD-01 Coordination | KD-09 Security |
| CA-10 Event | KD-03 Event Bus | KD-05 Observability |

---

## 2. Kernel Duty → Module Mapping

| Kernel Duty | Primary Modules | Mapping Status |
|:---|:---|:---:|
| KD-01 Coordination | CA-05, CA-07, CA-09 | Mapped |
| KD-02 Error Handling | All Modules | Mapped |
| KD-03 Event Bus | CA-10 | Mapped |
| KD-04 Learning & Feedback | Learning Events | Mapped |
| KD-05 Observability | CA-03 | Mapped |
| KD-06 Orchestration | CA-02, CA-04 | Mapped |
| KD-07 Performance | All Modules | Mapped |
| KD-08 Protocol Versioning | CA-08 | Mapped |
| KD-09 Security | CA-04, CA-06 | Mapped |
| KD-10 State Sync | CA-01, CA-05 | Mapped |
| KD-11 Transaction | CA-02 | Mapped |

---

## 3. Detailed Mapping Table

| Module | KD-01 | KD-02 | KD-03 | KD-04 | KD-05 | KD-06 | KD-07 | KD-08 | KD-09 | KD-10 | KD-11 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CA-01 Context | - | ✓ | - | - | ✓ | - | ✓ | - | - | **P** | - |
| CA-02 Plan | ✓ | ✓ | - | - | - | **P** | ✓ | - | - | - | ✓ |
| CA-03 Trace | - | ✓ | ✓ | - | **P** | - | ✓ | - | - | - | - |
| CA-04 Confirm | - | ✓ | - | - | - | ✓ | ✓ | - | **P** | - | - |
| CA-05 Collab | **P** | ✓ | - | - | - | - | ✓ | - | - | ✓ | - |
| CA-06 Role | ✓ | ✓ | - | - | - | - | ✓ | - | **P** | - | - |
| CA-07 Dialog | **P** | ✓ | - | - | ✓ | - | ✓ | - | - | - | - |
| CA-08 Extension | - | ✓ | - | - | - | ✓ | ✓ | **P** | - | - | - |
| CA-09 Network | **P** | ✓ | - | - | - | - | ✓ | - | ✓ | - | - |
| CA-10 Event | - | ✓ | **P** | - | ✓ | - | ✓ | - | - | - | - |

**Legend**: **P** = Primary Responsibility, ✓ = Secondary/Cross-cutting, - = Not Applicable

---

## 4. Gap Analysis

| Gap Category | Finding | Phase F Action |
|:---|:---|:---|
| KD-04 Learning | No dedicated Module | Learning handled via Events |
| All Modules → KD-02 | Universal Error Handling | Cross-cutting concern |
| All Modules → KD-07 | Universal Performance | Cross-cutting concern |

---

**Phase**: D-2 (Cross-Directory Semantic Mapping)
**Coverage**: 10 Modules × 11 Duties = 110 Cells (mapping declared)
