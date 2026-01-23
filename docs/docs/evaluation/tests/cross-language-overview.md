---
sidebar_position: 20
doc_type: reference
normativity: informative
status: active
authority: none
description: "Cross-language test suite overview and inventory. Projection of Repo tests; non-certification."
---

# Cross-Language Test Suite

> **Non-Normative Evaluation Reference**  
> This page is a *projection* of repository tests. It does not certify or endorse any implementation.

**Source of Truth:** `tests/cross-language/`

## Purpose

The Cross-Language suite validates that multiple SDKs / implementations produce consistent evidence artifacts and adhere to the same protocol-level expectations under the same scenarios.

## Scope

- **In-scope**: Cross-language equivalence checks defined by Repo tests
- **Out-of-scope**: Certification, ranking, endorsement, vendor claims

## Inventory (Projection)

> **Projection Unit:** Case (registry-backed).  
> Case IDs are defined in `tests/cross-language/registry.json`.

### Case Inventory

| Case ID | Name | Path | Description |
|:--------|:-----|:-----|:------------|
| CL-01 | Builder Output Equivalence | `tests/cross-language/builders/` | TS and Python SDK builders produce equivalent outputs |
| CL-02 | Runtime State Handoff | `tests/cross-language/runtime/` | Runtime state serialization and cross-language handoff |
| CL-03 | Schema Validation Consensus | `tests/cross-language/validation/` | Both SDK implementations agree on validation outcomes |

> The authoritative Case IDs and names are defined by `tests/cross-language/registry.json`.

## Evidence Mapping

| Evidence Type | Description |
|:--------------|:------------|
| Builder outputs | JSON artifacts from builder functions |
| Validation logs | Schema validation results |
| Diff reports | Cross-language output comparison |

## Non-Endorsement Boundary

This suite:
- Does not certify implementations
- Does not issue badges
- Does not rank vendors
- Produces evidence only (self-declared evaluation)

## How to Run

Refer to repository instructions:
- TypeScript: `tests/cross-language/` test files
- Python: `packages/sdk-py/tests/cross_language/`

---

**Source of Truth**: `tests/cross-language/`
