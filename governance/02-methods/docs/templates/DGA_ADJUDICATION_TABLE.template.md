---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "DGA_ADJUDICATION_TABLE.template"
---

# DGA Adjudication Table Template

> **Reference**: METHOD-DGA-01 §5
>
> Version: 1.0.0
> Audit Scope: [SPECIFY]
> Audit Date: [YYYY-MM-DD]

---

## Audit Summary

| Metric | Count |
|:---|:---:|
| Total Files | — |
| ✅ PASS | — |
| ⚠️ REWORD | — |
| ⚠️ MOVE | — |
| ❌ REMOVE | — |

---

## Layer Boundary Verdicts

| File | Claimed Layer | Actual Layer | Verdict | Notes |
|:---|:---:|:---:|:---:|:---|
| [filename.md](path) | L1 | L1 | ✅ PASS | — |
| [filename.md](path) | L1 | L3 | ⚠️ MOVE | Contains runtime implementation |

---

## Entry Contract Verdicts

| File | Entry Surface | Contract Status | Verdict | Notes |
|:---|:---:|:---:|:---:|:---|
| [filename.md](path) | documentation | ✅ Compliant | ✅ PASS | — |
| [filename.md](path) | documentation | ❌ Violated | ⚠️ REWORD | Reads like website positioning |

---

## Drift Fingerprint Findings

| File | F1 | F2 | F3 | F4 | Verdict | Evidence |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| [filename.md](path) | — | — | — | — | ✅ PASS | — |
| [filename.md](path) | ✓ | — | — | — | ⚠️ MOVE | Step 1/2/3 dominant structure |
| [filename.md](path) | — | ✓ | — | — | ⚠️ MOVE | "MPLP provides capabilities..." |
| [filename.md](path) | — | — | ✓ | — | ⚠️ REWORD | "Must pass to be compliant" |
| [filename.md](path) | — | — | — | ✓ | ⚠️ REWORD | Definition in prose, not schema |

---

## Fingerprint Legend

| ID | Name | Pattern |
|:---|:---|:---|
| **F1** | Implementation Prescription | Step-by-step build guide |
| **F2** | Capability Packaging | Product marketing narrative |
| **F3** | Endorsement Drift | Certification/compliance claims |
| **F4** | Authority Inversion | Prose definitions > schema |

---

## Verdict Legend

| Verdict | Meaning | Action |
|:---|:---|:---|
| **✅ PASS** | Aligned | None |
| **⚠️ REWORD** | Minor drift | Edit in place |
| **⚠️ MOVE** | Wrong location | Relocate |
| **❌ REMOVE** | Irreparable | Delete/Archive |

---

## Remediation Log

| File | Original Verdict | Action Taken | New Verdict |
|:---|:---|:---|:---|
| [filename.md](path) | ⚠️ REWORD | Removed capability framing | ✅ PASS |

---

## Sign-off

| Role | Date | Signature |
|:---|:---|:---|
| Auditor | [YYYY-MM-DD] | [NAME] |
| Reviewer | [YYYY-MM-DD] | [NAME] |

---

**Evidence ID**: DGA-[SCOPE]-[DATE]
