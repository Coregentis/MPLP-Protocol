---
sidebar_position: 1
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: DOC-GOV-EVIDENCE-BASELINE
description: "MPLP governance: Evidence Baseline. Protocol governance documentation."
authority: Documentation Governance
---

# Evidence Baseline

## 1. Overview

MPLP maintains an Evidence Baseline system that provides machine-verifiable proof that SDK derivations are consistent with Truth Sources.

| Property | Value |
|:---|:---|
| Current Version | v1.0 |
| Bundle Hash | sha256:78ea3511... |
| Coverage | Truth Source + TS/Python SDK |

## 2. Problem Addressed

| Risk | Mitigation |
|:---|:---|
| Schema drift prevention | SDK mirrors and models must match Truth Source |
| Reproducible evidence | All verification results can be replayed by CI |
| Mandatory gates | Drift blocks PR merge |

## 3. File Locations

| Category | Path |
|:---|:---|
| Evidence manifests | `schemas/v2/_manifests/` |
| Governance addendum | `governance/GOV-ADDENDUM-EVID-BASELINE-v1.0.md` |
| Freeze record | `governance/freeze/FREEZE_EVIDENCE_BASELINE_v1.0.md` |
| TS Mirror Gate | `scripts/verify-sdk-mirror.sh` |
| Python Generator | `packages/sources/sdk-py/scripts/generate_literals.py` |

## 4. Related Resources

- [Verification Methods (TBD)](#) — Audit proceduresvidence-baseline-v1.0](https://github.com/mplp-protocol/mplp/releases/tag/evidence-baseline-v1.0)
```
