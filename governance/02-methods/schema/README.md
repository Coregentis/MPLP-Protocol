---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "README"
---


# MPLP Governance Methods Index

**Version**: 1.0.0  
**Status**: Active  
**Created**: 2026-01-04

---

## Overview

This directory contains the **Protocol Governance Methods** — a comprehensive verification framework that ensures MPLP protocol integrity from truth sources through derived artifacts to SDK implementations.

---

## Method Catalog

| ID | Name | Purpose |
|:---|:---|:---|
| **TSV-01** | Truth Source Verification | Validates $ref chains and schema dependencies |
| **XCV-01** | Cross-Consistency Verification | Ensures Schema ↔ YAML alignment |
| **SCV-01** | Surface Completeness Verification | Validates derived schema field coverage |
| **SUC-01** | Usage Conformance Verification | Validates SDK/API usage patterns |
| **DIV-01** | Derivation Integrity Verification | Ensures reproducible derivation process |
| **EVC-01** | Evolution Compatibility Verification | Validates version change compatibility |

---

## Execution Order

The methods MUST be executed in the following order. Each step depends on the previous passing.

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION PIPELINE                         │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ DIV-01  │ ──▶ │ TSV-01  │ ──▶ │ XCV-01  │
  │Derivation│     │Truth Src│     │Cross-Con│
  └─────────┘     └─────────┘     └─────────┘
       │                               │
       │ Gate 0-3: Boundary,           │ Schema ↔ YAML
       │ Manifest, Generator           │ Schema ↔ Docs
       ▼                               ▼
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ SCV-01  │ ──▶ │ SUC-01  │ ──▶ │ EVC-01  │
  │ Surface │     │ Usage   │     │Evolution│
  └─────────┘     └─────────┘     └─────────┘
       │               │               │
       │ SNF Diff      │ API Binding   │ Backward
       │ Fixtures      │ Injection     │ Compat
       ▼               ▼               ▼
  ┌─────────────────────────────────────────┐
  │          VERIFICATION COMPLETE           │
  │  All PASS → Safe to merge/release       │
  └─────────────────────────────────────────┘
```

---

## Quick Reference: When to Use Each Method

| Scenario | Required Methods |
|:---|:---|
| **PR with schema changes** | DIV → TSV → XCV → SCV → EVC |
| **PR with SDK changes** | DIV → SCV → SUC |
| **PR with docs changes** | XCV (XCV-DOC extension) |
| **Release gate** | ALL methods (full pipeline) |
| **New protocol version** | ALL methods + EVC migration guide |

---

## Method Files

### Core Verification (Spatial Dimension)

| File | Description |
|:---|:---|
| [METHOD-TSV-01_SCHEMA_TRUTH_SOURCE_VERIFICATION.md](METHOD-TSV-01_SCHEMA_TRUTH_SOURCE_VERIFICATION.md) | $ref chain and dependency validation |
| [METHOD-XCV-01_CROSS_CONSISTENCY_VERIFICATION.md](METHOD-XCV-01_CROSS_CONSISTENCY_VERIFICATION.md) | Schema ↔ YAML ↔ Docs alignment |
| [METHOD-SCV-01_SCHEMA_SURFACE_COMPLETENESS_VERIFICATION.md](METHOD-SCV-01_SCHEMA_SURFACE_COMPLETENESS_VERIFICATION.md) | Derived schema field coverage |
| [METHOD-SUC-01_SCHEMA_USAGE_CONFORMANCE_VERIFICATION.md](METHOD-SUC-01_SCHEMA_USAGE_CONFORMANCE_VERIFICATION.md) | SDK/API usage patterns |

### Process Verification

| File | Description |
|:---|:---|
| [METHOD-DIV-01_DERIVATION_INTEGRITY_VERIFICATION.md](METHOD-DIV-01_DERIVATION_INTEGRITY_VERIFICATION.md) | Derivation boundary and reproducibility |

### Temporal Verification

| File | Description |
|:---|:---|
| [METHOD-EVC-01_EVOLUTION_COMPATIBILITY_VERIFICATION.md](METHOD-EVC-01_EVOLUTION_COMPATIBILITY_VERIFICATION.md) | Version evolution compatibility |

---

## Verification Gates Summary

### Gate Verdicts

| Verdict | Meaning | Action |
|:---:|:---|:---|
| ✅ PASS | Verification succeeded | Proceed |
| 🟡 WARN | Minor issue, proceed with caution | Document and proceed |
| 🔴 FAIL | Verification failed | Block until fixed |

### PR vs Release Gates

| Check | PR Gate | Release Gate |
|:---|:---:|:---:|
| Boundary violation | 🔴 FAIL | 🔴 FAIL |
| Manifest stale | 🟡 WARN | 🔴 FAIL |
| Surface diff failure | 🔴 FAIL | 🔴 FAIL |
| Breaking change + non-MAJOR | 🔴 FAIL | 🔴 FAIL |
| Doc count mismatch | 🟡 WARN | 🔴 FAIL |

---

## CLI Commands

```bash
# Full verification pipeline
mplp-verify all

# Individual methods
mplp-verify div          # Derivation Integrity
mplp-verify tsv          # Truth Source
mplp-verify xcv          # Cross-Consistency
mplp-verify xcv-doc      # Documentation Consistency
mplp-verify scv          # Surface Completeness
mplp-verify suc          # Usage Conformance
mplp-verify evc          # Evolution Compatibility

# Specific gates
mplp-verify boundary     # DIV Gate 1
mplp-verify manifest     # DIV Gate 2
mplp-verify bundle-hash  # Compute bundle hash
```

---

## Evidence Artifacts Location

| Artifact Type | Path |
|:---|:---|
| Surface Manifests (SNF) | `schemas/v2/_manifests/module-surface/` |
| Use-site Manifests | `schemas/v2/_manifests/use-sites/` |
| Cross-consistency Manifests | `schemas/v2/_manifests/xc/` |
| Derivation Manifest | `artifacts/derivation-manifest.json` |
| Verification Reports | `reports/{method}/` |
| Golden Fixtures | `tests/golden/{method}/` |

---

## Governance

These methods are governed by:

- **MPLP Protocol Governance Committee (MPGC)**
- **Constitutional Documents**: `governance/01-constitutional/`

Any modification to governance methods requires MPGC approval and documented justification.

---

## Related Documents

- [Constitutional Documents](../../01-constitutional/) — Protocol constitution
- [Versioning Policy](../../../docs/docs/evaluation/governance/versioning-policy.md) — Version change rules
- [Contributing Guide](../../../docs/docs/evaluation/governance/contributing.md) — How to contribute

---

**Document Status**: Active  
**Last Updated**: 2026-01-04
