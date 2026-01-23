---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "README"
---


# Docs Governance

> **MPLP Documentation Governance System**
>
> Version: 1.0.0
> Status: Draft (Pending Ratification)

---

## Overview

This directory contains the complete governance framework for MPLP documentation, ensuring docs remain:
- **Derived truth source** (not primary)
- **Layer-bounded** (L1/L2/L3/L4 knowledge boundaries)
- **Entry-aligned** (Docs ≠ Website ≠ Repo)
- **Factually verifiable** (schema pointers, evidence binding)

---

## Gate Order

```
DGA Gate → DTAA Gate → DTV Gate → Freeze OK
```

| Gate | Question | Method |
|:---|:---|:---|
| **DGA** | Is the narrative in the right form/place? | METHOD-DGA-01 |
| **DTAA** | Does it introduce new semantics? | METHOD-DTAA-01 |
| **DTV** | Is it factually correct vs schema? | METHOD-DTV-01 |

---

## Methods

| Document | Purpose |
|:---|:---|
| [METHOD-DGA-01](METHOD-DGA-01_DOCS_NARRATIVE_ENTRY_ALIGNMENT_AUDIT.md) | Narrative & entry alignment audit |
| [METHOD-DTAA-01](METHOD-DTAA-01_DOCS_TRUTH_ALIGNMENT_AUDIT.md) | Truth alignment audit (semantic purity) |
| [METHOD-DTV-01](METHOD-DTV-01_DOCS_TRUTH_VERIFICATION.md) | Truth verification (factual correctness) |
| [SOP-DTAA-06](sop/SOP-DTAA-06_REMEDIATION.md) | Remediation SOP for DTAA Phase 6 |

---

## Templates

| Template | Purpose |
|:---|:---|
| [DTAA Adjudication Table](templates/DTAA_ADJUDICATION_TABLE.template.md) | Semantic audit verdicts |
| [DGA Adjudication Table](templates/DGA_ADJUDICATION_TABLE.template.md) | Narrative audit verdicts |

---

## Constitutional References

| Document | Scope |
|:---|:---|
| [CONST-005](../../01-constitutional/CONST-005_AUTHORING_CONSTITUTION.md) | Authoring rules, forbidden claims, normative language |
| [CONST-006](../../01-constitutional/CONST-006_DOC_TYPE_OUTLINES_AND_DEPTH_RULES.md) | Doc type outlines, layer boundaries, drift fingerprints |

---

## Execution Evidence

Audit artifacts are stored in:
```
governance/06-artifacts/
```

---

**© 2026 MPGC — MPLP Protocol Governance Committee**
