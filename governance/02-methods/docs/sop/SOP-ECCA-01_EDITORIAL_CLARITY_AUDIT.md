---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "SOP-ECCA-01_EDITORIAL_CLARITY_AUDIT"
---


# SOP-ECCA-01 — Per-Document Editorial Clarity & Completeness Audit

---
authority: none
entry_surface: repository
doc_type: governance
version: 1.0.0
effective: 2026-01-05
status: draft
---

**Version**: 1.0.0
**Authority**: MPGC
**Reference**: CHECKLIST-DOCS-GOV-01 v2.3.0, METHOD-ECCA-01 v1.0.0
**Status**: ACTIVE

---

## Purpose

This SOP defines mandatory execution steps for ECCA auditing any single document.
Any AI or human auditor MUST follow this SOP exactly. **Deviation is not permitted.**

---

## Auditor Constraints

> [!CAUTION]
> You are NOT an author. You are an audit executor.

### Permitted

| Action | Description |
|:---|:---|
| ✅ Extract headings/sections | Scan document structure |
| ✅ Verify slot presence | Check against doc_type requirements |
| ✅ Verify terminology/abbreviations | Check first-occurrence expansion |
| ✅ Verify numeric baseline consistency | Match canonical counts |
| ✅ Verify references exist | Check paths/anchors |
| ✅ Verify pronoun resolution | Check antecedent clarity |
| ✅ Issue verdict | PASS / REWORD / FAIL |
| ✅ Produce remediation directives | Exact locations + exact additions |

### Forbidden

| Action | Reason |
|:---|:---|
| ❌ Rewrite for style | Not an authoring exercise |
| ❌ Improve prose "because it sounds better" | Subjective, not auditable |
| ❌ Use subjective language ("seems ok") | No interpretive latitude |
| ❌ PASS with any empty cell | Evidence incompleteness = procedural FAIL |

---

## Step 0 — Initialize Record

Create file: `<RUN_ID>__ECCA_AUDIT_<filename>.md`

### Required Frontmatter

```yaml
file: <filename>
path: <full path>
batch: <1-6>
doc_type: <from document frontmatter>
audit_date: YYYY-MM-DD
auditor: AI/<name>
method: METHOD-ECCA-01 v1.0.0
checklist: CHECKLIST-DOCS-GOV-01 v2.3.0
```

---

## Step 1 — Slot Completeness (ECCA-H)

### 1.1 Slot Checklist

**Fill based on doc_type (see METHOD-ECCA-01 §4.1)**

| Slot ID | Required Heading / Slot | Present? | Location (Line) | Notes |
|:---:|:---|:---:|:---|:---|
| S1 | Purpose | | | |
| S2 | Scope | | | |
| S3 | Non-Goals / What it is NOT | | | |
| S4 | Authority / Normative anchor | | | |
| S5 | Interfaces/Boundaries OR Schema Reference | | | |
| S6 | Misread Guard / Non-Endorsement | | | |

### 1.2 Verdict Rules

| Doc Type | Missing Slot Rule |
|:---|:---|
| Normative (L1-L4, modules) | Any missing => **FAIL** |
| Golden Flows | Any missing => **FAIL** |
| Informative explained | Missing => **REWORD** (default), **FAIL** if interpretive drift |

---

## Step 2 — Term & Reference Consistency (ECCA-H)

### 2.1 Canonical Baseline Check

| Item | Found in Doc? | Value Found | Expected | PASS? |
|:---|:---:|:---|:---|:---:|
| Modules count | | | 10 | |
| Duties count | | | 11 | |
| Golden flows count | | | 5 | |
| Protocol version | | | v1.0.0 | |

**Any mismatch => FAIL**

### 2.2 Abbreviation Expansion Check

| Abbrev | First Occurrence (Line) | Expanded? | Expansion Text | PASS? |
|:---|:---|:---:|:---|:---:|
| PSG | | | Project Semantic Graph | |
| AEL | | | Action Execution Layer | |
| VSL | | | Value State Layer | |
| MPGC | | | MPLP Protocol Governance Committee | |
| SA | | | Single-Agent | |
| MAP | | | Multi-Agent Profile | |

**Any unexpanded first occurrence => FAIL**

### 2.3 Cross-Reference Integrity

| Reference Type | Ref Text | Target Path/Anchor | Exists? | PASS? |
|:---|:---|:---|:---:|:---:|
| See Also | | | | |
| schema ref (repo_refs) | | | | |
| Related Documents | | | | |

**Any broken ref => FAIL**

---

## Step 3 — Subject & Pronoun Clarity (ECCA-H)

### 3.1 Paragraph Subject Check

For each major paragraph, verify first sentence contains explicit subject noun.

| Para ID | First Sentence | Subject Noun Present? | Subject Noun | PASS? |
|:---:|:---|:---:|:---|:---:|
| P1 | | | | |
| P2 | | | | |
| P3 | | | | |
| ... | | | | |

**Valid subjects**: protocol, specification, schema, module, duty, invariant, constraint, evidence, layer, profile

**Missing subject noun => FAIL**

### 3.2 Pronoun Resolution

| Occurrence | Pronoun | Paragraph | Antecedent | Unambiguous? | PASS? |
|:---|:---|:---|:---|:---:|:---:|
| #1 | it/this/they | | | | |
| #2 | it/this/they | | | | |
| ... | | | | | |

**Any ambiguous pronoun => FAIL**

---

## Step 4 — Reader Path & Usability (ECCA-S)

### 4.1 Soft Criteria Check

| Item | Present? | Location | Backlog Entry Required? |
|:---|:---:|:---|:---:|
| Reading order / "Start here" guidance | | | |
| Minimal comprehension aid (diagram/table/example) | | | |

### 4.2 Backlog Entry Format

If missing, add to `<RUN_ID>__ECCA_BACKLOG.md`:

| ID | File | Missing Item | Impact | Suggested Fix | Priority |
|:---:|:---|:---|:---|:---|:---:|
| BL-001 | | | | | |

---

## Step 5 — Final Verdict

### 5.1 Verdict Decision Tree

```
IF any ECCA-H table has FAIL
  => VERDICT = FAIL
ELSE IF any slot missing (per doc_type rules) AND doc_type = informative
  => VERDICT = REWORD
ELSE IF all tables complete AND all cells filled AND no FAIL
  => VERDICT = PASS
ELSE
  => VERDICT = FAIL (incomplete audit)
```

### 5.2 Verdict Summary Table

| Gate | Result | Blocking? |
|:---|:---:|:---:|
| §1 Slot Completeness | | |
| §2 Term/Ref Consistency | | |
| §3 Subject/Pronoun | | |
| §4 Reader Path (soft) | | N/A |
| **FINAL VERDICT** | | |

### 5.3 Required Next Action

| Verdict | Blocking? | Required Next Action |
|:---|:---:|:---|
| PASS | No | None |
| REWORD | Yes (until fixed) | Provide exact remediation directives |
| FAIL | Yes | Provide exact remediation directives |

---

## Step 6 — Remediation Directives (if REWORD/FAIL)

For each failure, provide:

| Finding ID | Check | Location | Issue | Exact Fix |
|:---|:---|:---|:---|:---|
| F-001 | | | | |
| F-002 | | | | |

**Exact Fix must include**:
- Which heading/section to add
- Exact text snippet to insert
- Line number or "after section X"

---

## Batch Completion Gate

A batch is complete when:
- ✅ 100% files have ECCA audit records
- ✅ High-risk batches (1-4): 0 FAIL, 0 REWORD
- ✅ All ECCA-S missing items logged to backlog
- ✅ Batch summary generated

---

## Output Artifacts

| Template ID | Artifact | Scope |
|:---|:---|:---|
| T12 | `<RUN_ID>__ECCA_AUDIT_<filename>.md` | Per document |
| T13 | `<RUN_ID>__ECCA_BATCH_<N>_SUMMARY.md` | Per batch |
| T14 | `<RUN_ID>__ECCA_FINAL_SUMMARY.md` | Per run |
| T15 | `<RUN_ID>__ECCA_BACKLOG.md` | Per run |

---

**SOP Status**: ACTIVE
**Evidence ID**: SOP-ECCA-01-v1.0.0
