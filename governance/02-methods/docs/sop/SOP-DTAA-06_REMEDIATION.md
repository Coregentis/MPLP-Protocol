---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "SOP-DTAA-06_REMEDIATION"
---


# SOP-DTAA-06: Phase 6 Remediation (Headers & Pointers)

> **Operational SOP**
>
> Status: READY
> Applies To: MPLP Docs `docs/docs/specification/**`

---

## 0. Inputs (Evidence Pack)

Required inputs (must be archived before edits):

- `DTAA_SCAN_REPORT_2026-01-05.md`
- `DTAA_FLAGS_HEADERS.md` (19 files)
- `DTAA_ADJUDICATION_TABLE_SPECIFICATION.md` (60/60)
- `DTAA_P5B_SEMANTIC_REVIEW.md`

---

## 1. Remediation Types

Phase 6 supports only:

- **Editorial**: add missing headers, add pointers, fix wording
- **Clarifying**: rephrase MUST/SHALL in informative pages

> **Semantic changes are forbidden** (CONST-005 §9)

---

## 2. Step A1 — Authority Block for Informative Docs (P1)

**Scope**: Informative files in `DTAA_FLAGS_HEADERS.md`

> Per CONST-003 §7.1: Informative documents cannot be frozen.

### Rules

1. Do NOT add Frozen Header
2. Add **Authoritative Reference (Non-Normative)** block:

```markdown
> **Authoritative Reference (Non-Normative)**
>
> Document Type: Informative
> Authority Source: MPLP Schemas v1.0.0
> Governance: MPGC
>
> This document is **informative and non-normative**.
> It does not define protocol obligations.
> All MUST/SHALL statements are **schema-derived restatements** for explanatory purposes only.
```

3. Do NOT change body content

### Output

- Updated informative files with authority block
- Commit: `dtaa: add authority blocks for informative specs (phase6.1a)`

---

## 2b. Step A2 — Frozen Header for Normative Docs (P1b)

**Scope**: Normative files (doc_type: normative) missing frozen header

### Rules

1. Use exact CONST-003 frozen header template
2. Must include Protocol Version, Status, Authority, Effective date

### Output

- Updated normative files (if any)
- Commit: `dtaa: add frozen headers for normative specs (phase6.1b)`

---

## 3. Step B — Schema Pointer Remediation (P2)

**Scope**: All MUST/SHALL flagged locations

### Rule B1: Pointer Format

Every MUST/SHALL statement must have a **Schema Anchor**:

```markdown
> **Schema**: `mplp-plan.schema.json`
> **Pointer**: `#/properties/context_id`
```

### Rule B2: Pointer Source of Truth

- Pointers from `schemas/v2/*.schema.json` only
- If no pointer exists:
  - **REWORD** to remove MUST/SHALL
  - Or relocate to evaluation/ if ruleset-only

### Rule B3: Informative Doc Normative Language

If document is declared **informative/non-normative**:

1. Replace "Normative Requirements" → "Schema-Derived Constraints (Informative)"
2. Convert MUST → SHOULD (default)
3. Or label explicitly: "MUST (restated from schema; non-normative)"

### Rule B4: External Standard References

Rewrite "implementations MUST export W3C..." as:

> "For interoperability with W3C Trace Context, implementations SHOULD..."
> "This is not a protocol obligation."

### Output

- Updated spec pages
- `DTAA_POINTERS_PATCHLOG.md` with:
  - file, original MUST line, inserted pointer, change type
- Commit: `dtaa: add schema pointers (phase6.2)`

---

## 4. Step C — Adjudication Table Update

Upgrade rows to ✅ PASS only when:

- Authority ✅
- Schema Ref ✅
- Semantic Purity ✅
- Mandatory sections present

---

## 5. Step D — Re-scan & Closure

Run Phase 4 scans again:

- Missing headers = 0
- MUST/SHALL without pointer = 0
- JSON-LD in spec = 0
- Forbidden claims = negative-only

**Output**: `DTAA_SCAN_REPORT_<date>_POST_REMEDIATION.md`

---

## 6. Exit Criteria

Phase 6 complete when:

- `DTAA_FLAGS_HEADERS.md` empty
- Pointer flags resolved
- Adjudication table includes ≥1 PASS
- Post-remediation scan clean

---

**Document Status**: Operational SOP
**References**: CONST-003, CONST-005, METHOD-DTAA-01
