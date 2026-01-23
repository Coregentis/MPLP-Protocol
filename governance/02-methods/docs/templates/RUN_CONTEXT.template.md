---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "RUN_CONTEXT.template"
---

# RUN CONTEXT Template

**RUN_ID**: DOCS-GOV-RUN-YYYY-MM-DD-XX
**Date**: YYYY-MM-DD
**Git Commit**: [commit hash]
**Branch**: [branch name]
**Protocol Version**: v1.0.0

---

## Scope Definition

### Full Scope (Automated Scan)
```
docs/docs/specification/**
```

### High-Risk Pages (Manual Priority)

High-risk pages MUST be processed first in Phase 1.2 (Manual) and Phase 3.0 (Assertion Index).

| Category | Pages | Rationale |
|:---|:---|:---|
| **L1/L2 Overview** | l1-core-protocol.md, l2-coordination-governance.md | Core boundary definitions |
| **Cross-cutting Duties** | All `cross-cutting-kernel-duties/*.md` | 10 duties abstraction |
| **Golden Flows** | `golden-flows/index.md`, GF-01~GF-05 | External exposure risk |
| **Evaluation** | spec-to-eval-matrix.md, evaluation-framework.md | Certification drift risk |
| **Governance Refs** | Any page mentioning ISO/NIST/W3C/EU AI Act/OTel | Authority inversion risk |
| **Architecture Deep Dive** | l1-l4-architecture-deep-dive.md | Framework framing risk |

---

## Execution Tracks

### Track 0 — Automated (Full Scope)
- Phase 1.1: Structural Compliance Scan
- Phase 2: DTAA Gate
- Phase 3.1/3.2/3.3: Pointer/Example/Impl Validity

### Track 1 — Manual (High-Risk First)
- Phase 1.2: Narrative Adjudication (Layer/Entry/Subject-Action)
- Phase 3.0: Assertion Classification

### Track 1b — Deferred (if applicable)
- Assertion Index for non-high-risk pages
- Must be logged in Freeze Declaration as "Deferred"

---

## Pass Criteria

### Hard Gates
| Gate | Threshold |
|:---|:---|
| drift | = 0 |
| semantic violations | = 0 |
| pointer validity | = 100% |
| example validity | = 100% |

### Soft Gates (Track 1)
| Check | High-Risk | Non-High-Risk |
|:---|:---|:---|
| Assertion Index | 100% | Deferred allowed (log) |
| Subject/Action Test | 100% | 100% |

---

## Previous Run Reference (if applicable)

| Field | Value |
|:---|:---|
| Previous RUN_ID | N/A (first run) |
| Previous Commit | N/A |
| Delta Expected | N/A |

---

## Checklist Reference

**Checklist Version**: CHECKLIST-DOCS-GOV-01 v2.1.0
**Gate Order**: DGA → DTAA → DTV → Freeze

---

## Notes

[Add any run-specific notes here]
