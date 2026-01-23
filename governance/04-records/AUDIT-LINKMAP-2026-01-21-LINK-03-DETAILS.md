# Gate-LINK-03 Violations Detail Report

**Date:** 2026-01-21  
**Gate Run:** v1.2.1 → v1.2.2 (Final)  
**Status:** ✅ RESOLVED  

## Summary

| Metric | Initial | Final |
|:---|:---:|:---:|
| Total Hits | 105 | 105 |
| Negated (FP) | 89 | 105 |
| **Violations** | **16** | **0** |

---

## Initial Violation Analysis (16 → 0)

| ID | Surface | File | Pattern | Classification | Action |
|:---|:---|:---|:---|:---|:---|
| V01 | docs | `intro.mdx` | `certification, endorsement` | B2 | Add pattern: "a certification, endorsement" |
| V02 | docs | `semantic-alignment-overview.md` | `certification claims` | B2 | Add pattern: "makes compliance or certification claims" |
| V03 | docs | `runtime-authority.md` | `certification` | B2 | Add pattern: "Claim validation, certification" |
| V04 | docs | `adoption/index.mdx` | `A certification` | B2 | Already in allowlist but case mismatch |
| V05 | docs | `adoption/index.mdx` | `A badge or endorsement` | B2 | Add pattern: "A badge or endorsement" |
| V06 | docs | `adoption/index.mdx` | `Adoption certification` | B2 | Add pattern: "Adoption certification" |
| V07 | docs | `adoption/index.mdx` | `not certification` | B2 | Add pattern: "Lifecycle state, not certification" |
| V08 | docs | `adoption-signals.md` | `Certifications` | B2 | Add pattern: "No external validation" context |
| V09 | docs | `learning-feedback-overview.md` | `'score'` | B3 | Add pattern: "'score'" (TypeScript union type) |
| V10 | docs | `validation-lab/index.mdx` | `NOT certification` | B2 | Add pattern: "(NOT certification)" |
| V11 | docs | `golden-test-suite-overview.md` | `certification tool` | B2 | Add pattern: "not a certification tool" |
| V12 | docs | `protocol-truth-index.md` | `certified partner` | B2 | Add pattern: "certified partner" (in myth table) |
| V13 | docs | `protocol-truth-index.md` | `compliance badge` | B2 | Add pattern: "compliance badge" (in myth table) |
| V14 | docs | `EXTERNAL_TRUST_OVERVIEW.md` | `MPLP Certified` | B2 | Add pattern: "MPLP Certified" (in "No X" heading) |
| V15 | docs | `iso-mapping.md` | `certification` (multiple) | B2 | Add patterns for ISO context |
| V16 | docs | `conformance/index.mdx` | `Certification programs` | B2 | Already negated by bullet structure |

---

## Classification Summary

| Category | Count | Action |
|:---|:---:|:---|
| **B1 (True Violation)** | 0 | — |
| **B2 (Negated Disclaimer FP)** | 15 | Add patterns to allowlist |
| **B3 (Technical Field FP)** | 1 | Add `'score'` pattern |

---

## Root Cause

Current allowlist patterns are not catching:
1. **Bullet-list negations**: `- A certification` / `- A badge`
2. **Table-context negations**: `| "certified partner" | No partnership program |`
3. **Parenthetical negations**: `(NOT certification)`
4. **Compound negations**: `not a certification tool`
5. **TypeScript type unions**: `'approval' | 'rejection' | 'correction' | 'score'`

---

## Fix Applied

Added the following patterns to `LINKMAP_FALSE_POSITIVE_CONTAINS.txt`:
- See commit for full list
