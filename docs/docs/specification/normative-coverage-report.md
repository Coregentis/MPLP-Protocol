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
description: "MPLP specification: Normative Coverage Report. Normative protocol requirements."
authority: Documentation Governance
---

# Normative Coverage Report

**Purpose**: Tag gaps only, do not fill them. Provides Phase F work order.

---

## 1. Module Coverage

| Module | Anchor | DEFINED | REFERENCED | EVAL-MAPPED | GAP |
|:---|:---|:---:|:---:|:---:|:---|
| Context | CA-01 | ✅ | ✅ | ✅ | - |
| Plan | CA-02 | ✅ | ✅ | ✅ | - |
| Trace | CA-03 | ✅ | ✅ | ✅ | - |
| Confirm | CA-04 | ✅ | ✅ | ✅ | - |
| Collab | CA-05 | ✅ | ✅ | ⚠️ | Future: MAP coordination eval |
| Role | CA-06 | ✅ | ✅ | ✅ | - |
| Dialog | CA-07 | ✅ | ✅ | ⚠️ | Not in GF scope |
| Extension | CA-08 | ✅ | ✅ | ⚠️ | Not in GF scope |
| Network | CA-09 | ✅ | ✅ | ⚠️ | Not in GF scope |
| Event | CA-10 | ✅ | ✅ | ✅ | - |

**Summary**: 10/10 DEFINED, 10/10 REFERENCED, 6/10 EVAL-MAPPED (runtime pending Phase E/F)

---

## 2. Profile Coverage

| Profile | Anchor | DEFINED | REFERENCED | EVAL-MAPPED | GAP |
|:---|:---|:---:|:---:|:---:|:---|
| SA Profile | PA-01 | ✅ | ✅ | ✅ | - |
| MAP Profile | PA-02 | ✅ | ✅ | ✅ | - |

**Summary**: 2/2 Mapped (runtime pending Phase E/F)

---

## 3. Kernel Duty Coverage

| Kernel Duty | Anchor | DEFINED | REFERENCED | EVAL-MAPPED | GAP |
|:---|:---|:---:|:---:|:---:|:---|
| Coordination | KD-01 | ✅ | ✅ | ✅ (GF-02) | - |
| Error Handling | KD-02 | ✅ | ✅ | ✅ (GF-03) | - |
| Event Bus | KD-03 | ✅ | ✅ | ✅ (GF-02) | - |
| Learning & Feedback | KD-04 | ✅ | ✅ | ⚠️ | INTENTIONAL: Not in v1.0 scope |
| Observability | KD-05 | ✅ | ✅ | ✅ (All GF) | - |
| Orchestration | KD-06 | ✅ | ✅ | ✅ (GF-01,04,05) | - |
| Performance | KD-07 | ✅ | ✅ | ⚠️ | INTENTIONAL: Non-functional |
| Protocol Versioning | KD-08 | ✅ | ✅ | ⚠️ | INTENTIONAL: Meta-level |
| Security | KD-09 | ✅ | ✅ | ✅ (GF-05) | - |
| State Sync | KD-10 | ✅ | ✅ | ✅ (GF-01,02) | - |
| Transaction | KD-11 | ✅ | ✅ | ✅ (GF-03,04) | - |

**Summary**: 11/11 DEFINED, 11/11 REFERENCED, 8/11 EVAL-MAPPED (3 INTENTIONAL gaps, runtime pending)

---

## 4. Architecture Layer Coverage

| Layer | Anchor | DEFINED | REFERENCED | EVAL-MAPPED | GAP |
|:---|:---|:---:|:---:|:---:|:---|
| L1 Core Protocol | AA-01 | ✅ | ✅ | ✅ | - |
| L2 Coordination | AA-02 | ✅ | ✅ | ✅ | - |
| L3 Execution | AA-03 | ✅ | ✅ | ✅ | - |
| L4 Integration | AA-04 | ✅ | ✅ | ✅ | - |

**Summary**: 4/4 EVAL-MAPPED (runtime pending Phase E/F)

---

## 5. Golden Flow Coverage

| Golden Flow | Anchor | DEFINED | REFERENCED | EVALUATED | GAP |
|:---|:---|:---:|:---:|:---:|:---|
| GF-01 SA Lifecycle | GF-01 | ✅ | ✅ | ⏳ Phase F | Fixtures pending |
| GF-02 MAP Coordination | GF-02 | ✅ | ✅ | ⏳ Phase F | Fixtures pending |
| GF-03 Drift Detection | GF-03 | ✅ | ✅ | ⏳ Phase F | Fixtures pending |
| GF-04 Delta Intent | GF-04 | ✅ | ✅ | ⏳ Phase F | Fixtures pending |
| GF-05 Governance | GF-05 | ✅ | ✅ | ⏳ Phase F | Fixtures pending |

**Summary**: 5/5 DEFINED, 5/5 REFERENCED, 0/5 Fixtures Ready (Phase F scope)

---

## 6. Invariants Coverage

| Invariants File | Rule Count | DEFINED | EVALUATED | GAP |
|:---|:---:|:---:|:---:|:---|
| sa-invariants.yaml | 9 | ✅ | ⏳ Phase E | Runtime validation pending |
| map-invariants.yaml | 9 | ✅ | ⏳ Phase E | Runtime validation pending |
| observability-invariants.yaml | 12 | ✅ | ⏳ Phase E | Runtime validation pending |
| integration-invariants.yaml | 19 | ✅ | ⏳ Phase E | Runtime validation pending |
| learning-invariants.yaml | 12 | ✅ | ⏳ Phase E | Runtime validation pending |

**Summary**: 61 rules DEFINED, 0 runtime EVALUATED (Phase E scope)

---

## 7. Gap Summary

### 7.1 INTENTIONAL Gaps (by design)

| Gap | Reason | Status |
|:---|:---|:---|
| KD-04 Learning not evaluated | v1.0 scope exclusion | FROZEN |
| KD-07 Performance not evaluated | Non-functional concern | FROZEN |
| KD-08 Versioning not evaluated | Meta-level concern | FROZEN |
| Dialog/Extension/Network not in GF | Specialized modules | FROZEN |

### 7.2 PENDING Gaps (Phase E/F scope)

| Gap | Owner | Status |
|:---|:---|:---|
| Golden Flow fixtures | Phase F | PENDING |
| Invariant runtime validation | Phase E | PENDING |

### 7.3 UNKNOWN Gaps

| Gap | Investigation Needed |
|:---|:---|
| None | All gaps are classified |

---

## 8. Overall Coverage Statistics

| Category | Total | Defined | Mapped |
|:---|:---:|:---:|:---:|
| Modules | 10 | 10 | 10 Mapped |
| Profiles | 2 | 2 | 2 Mapped |
| Kernel Duties | 11 | 11 | 11 Mapped |
| Architecture Layers | 4 | 4 | 4 Mapped |
| Golden Flows | 5 | 5 | 5 Declared |
| Invariants | 61 | 61 | 61 Declared |

**Evaluation Readiness**: Phase E/F dependent

---

**Phase**: D-3 (Normative Coverage & Gap Tagging)
**Gap Types**: 4 INTENTIONAL, 2 PENDING, 0 UNKNOWN
