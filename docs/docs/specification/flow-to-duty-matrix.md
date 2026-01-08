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
description: "MPLP specification: Golden Flow to Kernel Duty Matrix. Normative protocol requirements."
authority: Documentation Governance
---

# Golden Flow to Kernel Duty Matrix

**Purpose**: Resolves evaluation relationships between 5 Golden Flows and 11 Kernel Duties.

---

## 1. Primary Coverage Matrix

| Golden Flow | Primary Duties | Evaluation Focus |
|:---|:---|:---|
| GF-01 SA Lifecycle | KD-06, KD-05, KD-10 | Context → Plan → Trace |
| GF-02 MAP Coordination | KD-01, KD-10, KD-03 | Multi-agent handoffs |
| GF-03 Drift Detection | KD-05, KD-02, KD-11 | Drift → Recovery |
| GF-04 Delta Intent | KD-06, KD-11, KD-05 | Delta → Replan |
| GF-05 Governance | KD-09, KD-06, KD-05 | Confirm gates |

---

## 2. Detailed Flow × Duty Coverage

| Golden Flow | KD-01 | KD-02 | KD-03 | KD-04 | KD-05 | KD-06 | KD-07 | KD-08 | KD-09 | KD-10 | KD-11 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| GF-01 SA Lifecycle | - | ✓ | - | - | **P** | **P** | - | - | - | **P** | - |
| GF-02 MAP Coordination | **P** | ✓ | **P** | - | ✓ | - | - | - | - | **P** | - |
| GF-03 Drift Detection | - | **P** | - | - | **P** | - | - | - | - | ✓ | **P** |
| GF-04 Delta Intent | - | ✓ | - | - | **P** | **P** | - | - | - | - | **P** |
| GF-05 Governance | - | ✓ | - | - | **P** | **P** | - | - | **P** | - | - |

**Legend**: **P** = Primary, ✓ = Secondary, - = Not Covered

---

## 3. Duty Coverage by Flow Count

| Kernel Duty | Flow Coverage | Primary In |
|:---|:---:|:---|
| KD-01 Coordination | 1/5 | GF-02 |
| KD-02 Error Handling | 5/5 | GF-03 |
| KD-03 Event Bus | 1/5 | GF-02 |
| KD-04 Learning & Feedback | 0/5 | - |
| KD-05 Observability | 5/5 | GF-01, GF-03, GF-04, GF-05 |
| KD-06 Orchestration | 3/5 | GF-01, GF-04, GF-05 |
| KD-07 Performance | 0/5 | - |
| KD-08 Protocol Versioning | 0/5 | - |
| KD-09 Security | 1/5 | GF-05 |
| KD-10 State Sync | 3/5 | GF-01, GF-02 |
| KD-11 Transaction | 2/5 | GF-03, GF-04 |

---

## 4. Gap Analysis

| Duty | Coverage | Gap Type | Phase F Action |
|:---|:---:|:---|:---|
| KD-04 Learning & Feedback | 0/5 | INTENTIONAL | Not in v1.0 scope |
| KD-07 Performance | 0/5 | INTENTIONAL | Non-functional, not evidence |
| KD-08 Protocol Versioning | 0/5 | INTENTIONAL | Meta-level, not runtime |

---

## 5. Flow → Module → Duty Chain

| Golden Flow | Primary Modules | Primary Duties |
|:---|:---|:---|
| GF-01 | CA-01, CA-02, CA-03 | KD-05, KD-06, KD-10 |
| GF-02 | CA-05, CA-06, CA-09 | KD-01, KD-03, KD-10 |
| GF-03 | CA-03, CA-02 | KD-02, KD-05, KD-11 |
| GF-04 | CA-02, CA-03 | KD-05, KD-06, KD-11 |
| GF-05 | CA-04, CA-02, CA-03 | KD-05, KD-06, KD-09 |

---

**Phase**: D-2 (Cross-Directory Semantic Mapping)
**Coverage**: 5 Flows × 11 Duties = 55 Cells (mapping declared)
