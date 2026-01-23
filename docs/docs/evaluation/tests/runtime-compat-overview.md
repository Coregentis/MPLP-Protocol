---
sidebar_position: 21
doc_type: reference
normativity: informative
status: active
authority: none
description: "Runtime compatibility test suite overview and inventory. Projection of Repo tests; non-certification."
---

# Runtime-Compat Test Suite

> **Non-Normative Evaluation Reference**  
> This page is a *projection* of repository tests. It does not certify or endorse any implementation.

**Source of Truth:** `tests/runtime-compat/`

## Purpose

The Runtime-Compat suite validates interoperability expectations across execution substrates and runtime integrations, as defined by the repository tests.

## Scope

- **In-scope**: Runtime integration behaviors validated by Repo tests
- **Out-of-scope**: "Official compatibility" claims, certification, endorsements

## Inventory (Projection)

> **Projection Unit:** Case (registry-backed).  
> Case IDs are defined in `tests/runtime-compat/registry.json`.

### Case Inventory

| Case ID | Name | Path | Description |
|:--------|:-----|:-----|:------------|
| RC-01 | Runtime Error Handling | `tests/runtime-compat/ts-runtime-error.test.ts` | Runtime error handling patterns and recovery |
| RC-02 | SDK-to-Runtime Handoff | `tests/runtime-compat/ts-runtime-to-ts-sdk.test.ts` | SDK-to-runtime data integrity |

> The authoritative Case IDs and names are defined by `tests/runtime-compat/registry.json`.

## Evidence Mapping

| Evidence Type | Description |
|:--------------|:------------|
| Error logs | Runtime error handling traces |
| State handoff | SDK-to-runtime data integrity |
| Compatibility matrix | Cross-version test results |

## Non-Endorsement Boundary

This suite:
- Does not certify runtime implementations
- Does not issue compatibility badges
- Produces evidence only (self-declared evaluation)

## How to Run

Refer to repository instructions:
```bash
pnpm test:runtime-compat
```

---

**Source of Truth**: `tests/runtime-compat/`
