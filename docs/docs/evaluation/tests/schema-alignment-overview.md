---
sidebar_position: 22
doc_type: reference
normativity: informative
status: active
authority: none
description: "Schema alignment test suite overview and inventory. Projection of Repo tests; non-certification."
---

# Schema-Alignment Test Suite

> **Non-Normative Evaluation Reference**  
> This page is a *projection* of repository tests. It does not certify or endorse any implementation.

**Source of Truth:** `tests/schema-alignment/`

## Purpose

The Schema-Alignment suite validates that schema bundles, overlays, and consumer constraints remain consistent with the repository-defined schemas and expected invariants.

## Scope

- **In-scope**: Schema consistency checks defined by Repo tests
- **Out-of-scope**: Claims of regulatory compliance, certification, endorsements

## Inventory (Projection)

> **Projection Unit:** Case (registry-backed).  
> Case IDs are defined in `tests/schema-alignment/registry.json`.

### Case Inventory

| Case ID | Name | Path | Description |
|:--------|:-----|:-----|:------------|
| SCH-01 | SDK Builder Output Schema Validation | `tests/schema-alignment/ts-schema-alignment.test.ts` | SDK builder outputs conform to JSON Schema |

> The authoritative Case IDs and names are defined by `tests/schema-alignment/registry.json`.

## Evidence Mapping

| Evidence Type | Description |
|:--------------|:------------|
| Schema validation reports | AJV validation results |
| Builder output snapshots | Serialized protocol objects |
| Invariant checks | Required field presence, enum validation |

## Non-Endorsement Boundary

This suite:
- Does not certify schema compliance
- Does not issue badges
- Produces evidence only (self-declared evaluation)

## How to Run

Refer to repository instructions:
```bash
vitest run tests/schema-alignment
```

---

**Source of Truth**: `tests/schema-alignment/`
