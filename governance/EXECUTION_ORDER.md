# Governance Execution Order

**Document ID**: GOV-EXEC-ORDER  
**Status**: Active  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This document defines the **execution sequence** for MPLP governance activities.

Following this order ensures governance integrity and prevents unverified releases.

---

## 2. Execution Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE EXECUTION ORDER                    │
└─────────────────────────────────────────────────────────────────┘

Phase 0: Constitutional Reference (01-constitutional/)
         Read foundation rules. Do not modify.
              │
              ▼
Phase 1-3: Truth Source Verification (02-methods/verification/)
         ├── TSV-01: $ref Closure Verification
         ├── XCV-01: Cross-Consistency Verification
         ├── SCV-01: Schema Surface Completeness
         └── SUC-01: Schema Usage Conformance
              │
              ▼
Phase 4-7: Evolution Verification (02-methods/evolution/)
         ├── DIV-01: Derivation Integrity Verification
         └── EVC-01: Evolution Compatibility Verification
              │
              ▼
Phase 8: Freeze Evidence Baseline (04-records/baselines/)
         Create FREEZE_EVIDENCE_BASELINE_v*.md
              │
              ▼
Phase 9+: SDK Release (03-distribution/sdk/)
         ├── Execute SDKR-01 through SDKR-07
         ├── Complete CHECKLIST-SDK-RELEASE.md
         └── Obtain MPGC approval
              │
              ▼
Record: Phase Completion (04-records/phases/)
         Document phase exit criteria and results
```

---

## 3. Phase Details

### Phase 0: Constitutional Reference

| Action | Location |
|:---|:---|
| Read entry model | `01-constitutional/CONST-001_*.md` |
| Read document format | `01-constitutional/CONST-002_*.md` |
| Read frozen header rules | `01-constitutional/CONST-003_*.md` |
| Read audit methodology | `01-constitutional/CONST-004_*.md` |

**Output**: Understanding of governance foundation

---

### Phase 1-3: Truth Source Verification

| Phase | Method | Purpose |
|:---|:---|:---|
| 1 | TSV-01 | Verify $ref closure in schemas |
| 2 | XCV-01 | Verify cross-consistency (schema ↔ YAML) |
| 3 | SCV-01 + SUC-01 | Verify SDK schema coverage and usage |

**Output**: `schemas/v2/_manifests/` artifacts

---

### Phase 4-7: Evolution Verification

| Phase | Method | Purpose |
|:---|:---|:---|
| 4-6 | DIV-01 | Verify derivation integrity |
| 7 | EVC-01 | Verify evolution compatibility |

**Output**: Derivation proof, compatibility report

---

### Phase 8: Freeze Evidence Baseline

| Action | Location |
|:---|:---|
| Create freeze record | `04-records/baselines/FREEZE_*.md` |
| Create governance addendum | `04-records/baselines/GOV-ADDENDUM-*.md` |
| Tag in Git | `evidence-baseline-v*` |

**Output**: Frozen baseline with evidence artifacts

---

### Phase 9+: SDK Release

| Step | Document |
|:---|:---|
| Pipeline | `03-distribution/sdk/METHOD-SDKR-01_*.md` |
| Derivation | `03-distribution/sdk/METHOD-SDKR-02_*.md` |
| Versioning | `03-distribution/sdk/METHOD-SDKR-03_*.md` |
| Package | `03-distribution/sdk/METHOD-SDKR-04_*.md` |
| Manifest | `03-distribution/sdk/METHOD-SDKR-05_*.md` |
| Verification | `03-distribution/sdk/METHOD-SDKR-06_*.md` |
| Incident | `03-distribution/sdk/METHOD-SDKR-07_*.md` |
| Multi-Package | `03-distribution/sdk/METHOD-SDKR-08_*.md` |
| Checklist | `03-distribution/sdk/CHECKLIST-SDK-RELEASE.md` |
| Approval | `03-distribution/sdk/MPGC_APPROVAL_*.md` |

**Output**: Published SDK with manifest and verification report

---

## 4. Dependency Graph

```
Constitutional (read-only)
      │
      ▼
Verification Methods ────────► Evidence Baseline
      │                              │
      ▼                              ▼
Evolution Methods ──────────► SDK Release
      │                              │
      ▼                              ▼
Phase Records ◄──────────────────────┘
```

---

## 5. Violation Handling

If any phase is skipped or failed:

| Violation | Consequence |
|:---|:---|
| Skip verification | SDK release blocked |
| Skip baseline freeze | SDK release blocked |
| SDK release without approval | Governance-illegal |

---

**Document Status**: Governance Execution Guide  
**Supersedes**: None  
**References**: README.md
