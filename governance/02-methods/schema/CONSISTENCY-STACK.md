---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "CONSISTENCY-STACK"
---

# MPLP Consistency Stack

**Document ID**: CONSISTENCY-STACK  
**Version**: 1.0.0  
**Status**: Active  
**Created**: 2026-01-04

---

## One-Line Summary

> **From Truth Source to Runtime, across space and time, every projection is verifiable.**

---

## The Stack (6 Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSISTENCY STACK                             │
│                                                                  │
│   "Can we trust the protocol's integrity?"                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────┐  DIV-01   "Can we trust the derivation process?"
│Derivation│  ─────── Boundary + Manifest + Determinism + Generator Contract
└─────────┘

┌─────────┐  TSV-01   "Are truth references real?"
│  Truth  │  ─────── $ref chains + dependency closure + no orphans
└─────────┘

┌─────────┐  XCV-01   "Are truth sources self-consistent?"
│  Cross  │  ─────── Schema ↔ YAML ↔ Docs alignment
└─────────┘

┌─────────┐  SCV-01   "Are projections complete?"
│ Surface │  ─────── Field coverage + SNF diff + maximal fixtures
└─────────┘

┌─────────┐  SUC-01   "Are projections used correctly?"
│  Usage  │  ─────── Binding table + injection proof + round-trip
└─────────┘

┌─────────┐  EVC-01   "Does change preserve trust over time?"
│Evolution│  ─────── Diff classification + backward compat + versioning
└─────────┘
```

---

## Dimension Coverage

| Dimension | Methods | What It Ensures |
|:---|:---|:---|
| **Spatial** | TSV, XCV, SCV, SUC | Everything consistent *right now* |
| **Temporal** | EVC | Changes don't break existing artifacts |
| **Process** | DIV | Derivation is reproducible and auditable |

---

## Execution Order (Critical)

```
1. DIV-01 → Is derivation clean?
   │  FAIL → Fix boundary/manifest before proceeding
   ▼
2. TSV-01 → Are truth $refs valid?
   │  FAIL → Fix truth source references
   ▼
3. XCV-01 → Are Schema/YAML/Docs aligned?
   │  FAIL → Fix cross-consistency (enum/count/module)
   ▼
4. SCV-01 → Are derived schemas complete?
   │  FAIL → Fix generator or derived artifact
   ▼
5. SUC-01 → Is SDK usage correct?
   │  FAIL → Fix SDK binding/injection
   ▼
6. EVC-01 → Is version change safe?
   │  FAIL → Bump MAJOR or add migration guide
   ▼
   ✅ RELEASE READY
```

---

## What This Stack Guarantees

### ✅ Strong Guarantee (Gate-level Block)

| Risk | Blocked By |
|:---|:---|
| $ref chain broken | TSV-01 |
| Schema ↔ YAML enum mismatch | XCV-01 |
| Derived schema missing fields | SCV-01 |
| SDK collapses enum to string | SUC-01 |
| Truth source polluted by codegen | DIV-01 |
| Breaking change without MAJOR | EVC-01 |

### ⚠️ Evidence-level Guarantee (Documented, Auditable)

| Risk | Documented By |
|:---|:---|
| Injection without test proof | SUC-01 injection proof |
| Semantic change without justification | EVC-01 human justification |
| Non-deterministic generator | DIV-01 determinism report |

---

## What This Stack Does NOT Cover

| Area | Responsibility |
|:---|:---|
| Runtime lifecycle invariants | Validation Lab / Golden Flow Ruleset |
| Protocol compliance certification | Self-declaration (no authority) |
| Implementation correctness | SDK tests (beyond schema conformance) |

---

## Quick Reference

| Method | File | Key Artifacts |
|:---|:---|:---|
| **DIV-01** | `METHOD-DIV-01_DERIVATION_INTEGRITY_VERIFICATION.md` | derivation-manifest.json, generator contracts |
| **TSV-01** | `METHOD-TSV-01_SCHEMA_TRUTH_SOURCE_VERIFICATION.md` | Reference Map Table |
| **XCV-01** | `METHOD-XCV-01_CROSS_CONSISTENCY_VERIFICATION.md` | schema-enums.json, yaml-semantics.json |
| **SCV-01** | `METHOD-SCV-01_SCHEMA_SURFACE_COMPLETENESS_VERIFICATION.md` | SNF manifests, maximal fixtures |
| **SUC-01** | `METHOD-SUC-01_SCHEMA_USAGE_CONFORMANCE_VERIFICATION.md` | API binding tables, injection proofs |
| **EVC-01** | `METHOD-EVC-01_EVOLUTION_COMPATIBILITY_VERIFICATION.md` | Diff classification, migration guides |

---

## Governance

This stack is governed by MPGC. The methods form a unified verification framework — changes to one method may require updates to others.

---

**Document Status**: Protocol Governance Meta-Index  
**Version**: 1.0.0  
**References**: All METHOD-*.md documents in this directory
