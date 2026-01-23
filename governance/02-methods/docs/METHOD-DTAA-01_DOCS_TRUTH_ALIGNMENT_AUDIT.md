---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-DTAA-01_DOCS_TRUTH_ALIGNMENT_AUDIT"
---


# METHOD-DTAA-01: Docs Truth Alignment Audit


---

## 1. Purpose

This method defines the **execution and adjudication process** for ensuring MPLP documentation remains a derived truth source that introduces no new semantics.

**DTAA operationalizes CONST-005. CONST-004 (10-dimension framework) does not grant authoring authority.**

---

## 2. Scope

### 2.1 In Scope

| Directory | Coverage | Priority |
|:---|:---|:---:|
| docs/docs/specification/ | 100% mandatory | 🔴 Critical |
| docs/docs/guides/ | 100% mandatory | 🟡 High |
| docs/docs/evaluation/ | 100% mandatory | 🟡 High |
| docs/docs/meta/ | 100% mandatory | 🟢 Medium |
| docs/ops/ | 100% mandatory | 🟢 Medium |
| docs/docs/governance/ | Consistency-only | 🟢 Medium |

### 2.2 governance/ Special Handling

> **governance/ is semantically frozen.**
>
> DTAA performs **consistency-only verification** (headers, authority declaration, link integrity),
> but does not adjudicate semantics unless explicitly directed by MPGC.

### 2.3 Sampling Policy

> **specification/ does NOT allow sampling. 100% page coverage is mandatory.**
>
> 10% sampling is NOT permitted for specification/ under any circumstance.

---

## 3. Dual-Track Execution

DTAA operates as **two sequential, gated tracks**:

```
Track A: Authoring Governance (HARD GATE)
         ↓ [PASS required]
Track B: Truth Alignment Audit
         ↓ [All dimensions verified]
Freeze Declaration
```

### 3.1 Track A is a Hard Gate

> **Any failure in Track A blocks Track B adjudication.**
>
> Writing that is not constitutionally valid (per CONST-005) is not eligible for audit.
> It must be remediated first.

---

## 4. Track A: Authoring Governance

Track A verifies **constitutional compliance** per CONST-005.

### 4.1 Checks

| Step | Check | Failure Action |
|:---|:---|:---|
| A.1 | Doc Type determination | Misclassified → MOVE |
| A.2 | Mandatory Sections present | Missing → FAIL |
| A.3 | Forbidden Claims scan | Found → REMOVE/REWORD |
| A.4 | Schema Alignment Table generatable | Cannot generate → FAIL |
| A.5 | Normative language with pointers | MUST without pointer → FAIL |
| A.6 | Terminology in glossary | Unknown term → FAIL |
| A.7 | JSON-LD policy violation | Present in spec/ → FAIL |

### 4.2 Track A Verdict

- **All checks PASS** → Proceed to Track B
- **Any check FAIL** → Remediate + Re-run Track A

---

## 5. Track B: Truth Alignment Audit

Track B verifies **truth source alignment** per CONST-004.

### 5.1 10-Dimension Framework (from CONST-004)

#### Part 1: Constitutional Compliance (D1-D7)

| Dimension | Requirement |
|:---|:---|
| D1 Frontmatter | 6 required fields |
| D2 Structure | Frozen/Informative guard per CONST-002/003 |
| D3 RFC 2119 | Normative language appropriate to doc type |
| D4 Section Numbering | Sequential without gaps (see §5.3) |
| D5 Required Sections | Scope, Non-Goals present |
| D6 Internal Links | All links valid |
| D7 No Duplicate Title | Frontmatter and H1 consistent |

### 5.3 D4 Applicability

> **D4 applies to documents that declare numbered sections as a structural requirement**
> (e.g., reference specifications per CONST-002).
>
> For other doc types (guides, meta, ops), D4 is N/A unless CONST-002 mandates numbering.

#### Part 2: Truth Source Alignment (P1-P4)

| Principle | Requirement |
|:---|:---|
| P1 Schema Verification | JSON examples match schema |
| P2 YAML Verification | IDs/counts match YAML |
| P3 Code Chain Reference | All code derives from P1+P2 |
| P4 Full Coverage | Every line verified |

### 5.2 Track B Verdict

- **D1-D7 + P1-P4 all PASS** → PASS
- **Any dimension FAIL** → REWORD/REMOVE + Re-audit

---

## 6. Adjudication Table

### 6.1 Required Columns

| Column | Description |
|:---|:---|
| File Path | Relative path from docs/ |
| Authority Check | PASS / FAIL |
| Schema Reference Check | PASS / FAIL + pointers |
| Semantic Purity Check | PASS / FAIL |
| **Change Type** | Editorial / Clarifying / Semantic / N/A |
| **Evidence Pointer** | Schema pointer / commit hash / scan ID |
| Verdict | ✅ PASS / ⚠️ REWORD / ❌ REMOVE |
| Notes | Remediation required |

### 6.2 Verdict Definitions

| Verdict | Meaning | Action |
|:---|:---|:---|
| ✅ PASS | Ready for freeze | None |
| ⚠️ REWORD | Phrasing adjustment needed | Edit + re-adjudicate |
| ❌ REMOVE | Unauthorized content | Delete or move + re-adjudicate |

---

## 7. Evidence Requirements

### 7.1 Scan Report

Each DTAA execution MUST produce:

```
DTAA_SCAN_REPORT_<date>.md
├── Files Scanned: N
├── Track A Results: N/N PASS
├── Track B Results: N/N dimensions PASS
├── Flags Raised: [list]
└── Remediation Required: [list]
```

### 7.2 Adjudication Table

Complete table for all 144+ pages with all columns populated.

### 7.3 Freeze Declaration

Upon completion:

```
DTAA_FREEZE_DECLARATION_v1.0.md
├── All pages PASS
├── Scan reports archived
├── Constitutional version: CONST-005 v1.0.0
└── Semantic freeze status: CONFIRMED
```

---

## 8. Escalation

### 8.1 Semantic Change Detection

If DTAA detects proposed **semantic change**:

1. STOP adjudication
2. Escalate to MPGC
3. DTAA cannot approve semantic changes

### 8.2 MPGC Process

> **Semantic change to docs requires MPGC process and is out of scope for DTAA.**

---

## 9. Execution Checklist

```
□ Track A.1-A.7 all PASS
□ Track B D1-D7 all PASS
□ Track B P1-P4 all PASS
□ Adjudication Table complete
□ Evidence pointers populated
□ Change types classified
□ Scan report generated
□ specification/ 100% coverage confirmed
□ No semantic changes proposed
□ Freeze declaration issued
```

---

## 10. Governance Entry Point

### 10.1 Trigger Conditions

DTAA MUST be executed when:
1. Pre-release (before website/docs publish)
2. Schema truth source changes
3. Drift suspected
4. MPGC-directed review

### 10.2 Invocation

```
Audit Request: "Execute DTAA v1.0 on [scope]"
```

---

## Document Status

| Property | Value |
|:---|:---|
| Document Type | Governance Method |
| Status | Draft |
| Supersedes | None |
| References | CONST-004, CONST-005 |
| Operationalizes | CONST-005 |

---

**© 2026 MPGC — MPLP Protocol Governance Committee**
