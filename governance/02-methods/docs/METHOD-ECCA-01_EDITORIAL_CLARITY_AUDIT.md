---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-ECCA-01_EDITORIAL_CLARITY_AUDIT"
---


# METHOD-ECCA-01 — Editorial Clarity & Completeness Audit

---
authority: none
entry_surface: repository
doc_type: governance
version: 1.0.0
effective: 2026-01-05
status: NORMATIVE
---

**MPGC ID**: METHOD-ECCA-01
**Version**: 1.0.0
**Status**: NORMATIVE
**Authority**: MPGC
**Effective Date**: 2026-01-05

**References**:
- CHECKLIST-DOCS-GOV-01 v2.3.0
- CONST-006_DOC_TYPE_OUTLINES_AND_DEPTH_RULES
- METHOD-PDA-01
- SOP-ECCA-01

---

## 1. Purpose

Phase 7 (ECCA) ensures that every specification document is:
- **Complete** in required information slots (by doc_type)
- **Consistent** in terminology, numbers, and references
- **Clear** in paragraph subjects and pronoun resolution
- **Consumable** via a minimal reader path (logged if missing)

> [!IMPORTANT]
> ECCA does NOT judge "style" or "tone".
> ECCA judges only objective, auditable clarity/completeness constraints.

---

## 2. Non-Goals

- ❌ Not a rewriting exercise
- ❌ Not an authoring guide
- ❌ Not a subjective readability review
- ❌ Not a framework/runtime explanation layer

---

## 3. Applicability

| Batch | Directory | ECCA Hard Gate | ECCA Soft Logging |
|:---:|:---|:---:|:---:|
| 1-4 | High-Risk (architecture, duties, golden-flows, evaluation) | REQUIRED | REQUIRED |
| 5-6 | Standard (modules, observability, integration, profiles, root) | REQUIRED (no FAIL allowed) | REQUIRED |

---

## 4. Hard Criteria Definitions (ECCA-H)

### 4.1 Structural Slot Completeness (per doc_type)

#### A) Normative Layer Docs (L1/L2/L3/L4)

Required slots (must exist as explicit headings):
1. **Purpose**
2. **Scope**
3. **Non-Goals**
4. **Interfaces / Boundaries** (up/down layer boundary statement)
5. **Authority / Truth Sources** (schema/invariant/constitutional refs)
6. **Misread Guard** (explicit "not a framework/runtime/system" guard)

**Missing any slot => FAIL**

#### B) Normative Module Docs

Required slots:
1. **Purpose**
2. **Protocol Role**
3. **Schema Reference** (file + pointer/ref)
4. **Constraints** (normative statements anchored)
5. **Lifecycle / Interactions** (where it is used in flows)
6. **See Also** (at least one normative cross-reference)

**Missing any slot => FAIL**

#### C) Informative Explained Docs (e.g., cross-cutting duties explained)

Required slots:
1. **What it is** (concept definition in informative form)
2. **Why it exists** (problem framing)
3. **What it is NOT** (non-goals / boundary)
4. **Normative anchor** (where defined normatively)
5. **Common Misreads** (at least 1)

**Missing any slot => REWORD** (default), **FAIL** if high-risk batch and omission causes interpretive drift.

#### D) Golden Flow Docs (informative)

Required slots:
1. **Scenario**
2. **Evidence Requirements**
3. **PASS/FAIL Criteria** (as evaluation rules, not certification claims)
4. **Non-Goals / Non-Endorsement block**
5. **Links to normative anchors** (modules/layers involved)

**Missing any slot => FAIL** (high-risk)

---

### 4.2 Term & Reference Consistency

Hard checks:
- **Abbreviation rule**: first occurrence must expand (e.g., PSG = Project Semantic Graph)
- **Canonical numbers** must match baseline:
  - 10 modules
  - 11 duties  
  - 5 golden flows
  - v1.0.0 protocol version
- **Cross-doc references** must not break (paths/anchors exist)
- **"See Also"** must not point to non-existent pages

**Any violation => FAIL**

---

### 4.3 Pronoun / Subject Clarity

Hard checks:
- Each major paragraph must have an **explicit subject noun** in the first sentence
- Pronouns must resolve within the same paragraph (no ambiguous "it/this/they")

**Any ambiguity => FAIL**

---

## 5. Soft Criteria (ECCA-S) — Mandatory Backlog Logging

| Item | Rule |
|:---|:---|
| Reader path present? | Recommended reading order |
| Minimal comprehension aid present? | Diagram/table/minimal example, if doc_type supports it |

**Missing => log to ECCA backlog** (non-blocking), but never silently ignored.

---

## 6. Outputs

### Per-document
- `<RUN_ID>__ECCA_AUDIT_<filename>.md`

### Per-batch
- `<RUN_ID>__ECCA_BATCH_<batch>.md`

### Final
- `<RUN_ID>__ECCA_FINAL_SUMMARY.md`
- `<RUN_ID>__ECCA_BACKLOG.md`

---

## 7. Gate Rules

### High-Risk Batches (1-4)
- ECCA-H: 100% PASS required
- ECCA-S: Backlog must be logged
- REWORD: Treated as FAIL (blocking)

### Standard Batches (5-6)
- ECCA-H: No FAIL allowed
- REWORD: Allowed but must be remediated before Freeze OK
- ECCA-S: Backlog must be logged

---

## 8. Relationship to PDA

| Phase | Focus | Verdict Semantics |
|:---|:---|:---|
| Phase 6 (PDA) | Legal/Semantic correctness | Binary: doc conforms to governance rules |
| Phase 7 (ECCA) | Clarity/Completeness | Binary: doc meets slot/term/pronoun gates |

> [!CAUTION]
> ECCA does NOT pollute PDA verdicts.
> PDA = "Is it governmentally correct?"
> ECCA = "Is it editorially complete and clear?"

---

**Method Status**: NORMATIVE
**Evidence ID**: METHOD-ECCA-01-v1.0.0
