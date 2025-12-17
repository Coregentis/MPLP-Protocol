---
title: Schema & SDK Change Process
description: Workflow for making changes to MPLP schemas and SDKs. Details the
  process for schema updates, validation, type generation, and SDK verification
  tests.
keywords:
  - Schema Change Process
  - SDK Change Process
  - MPLP development
  - schema updates
  - SDK verification
  - change workflow
  - semantic versioning
sidebar_label: Schema & SDK Change Process
doc_status: normative
doc_role: ops
protocol_alignment:
  truth_level: T0D
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
  normativity_scope: docs_governance
  governance_alignment:
    policy_refs:
      - docs/docs/99-meta/frontmatter-policy.md
    process_refs: []
normative_id: MPLP-CORE-SCHEMA-SDK-CHANGE-PROCESS
sidebar_position: 5
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Schema & SDK Change Process

## 1. Schema Changes

All schema changes must follow Semantic Versioning.

### 1.1 Types of Changes

| Type | Example | FROZEN Allowed? |
|:---|:---|:---:|
| **Patch (1.0.x)** | Typos, descriptions | |
| **Minor (1.x.0)** | New optional fields | |
| **Major (x.0.0)** | Breaking changes | (new version) |

### 1.2 Change Workflow

1. **Update Schema**: Edit `schemas/v2/*.schema.json`
2. **Validate**: `node scripts/validate-schemas.js`
3. **Regenerate Types**:
   - TypeScript: `node scripts/generate-types-from-schemas.ts`
   - Python: `node scripts/generate-py-models-from-schemas.ts`
4. **Update Tests**: Modify Golden Flow fixtures if needed

## 2. SDK Changes

### 2.1 TypeScript SDK

1. Edit source in `packages/sdk-ts/src/`
2. Run tests: `pnpm test:sdk`
3. Verify builders match schema

### 2.2 Python SDK

1. Edit source in `packages/sdk-py/src/mplp/`
2. Run tests: `pytest`
3. Verify models match schema: `test_models_schema_alignment.py`

## 3. Verification

| Check | Command |
|:---|:---|
| Schema validation | `node scripts/validate-schemas.js` |
| TypeScript tests | `pnpm test:sdk` |
| Python tests | `pytest` |
| Cross-language | `pnpm test:runtime-compat` |
| Golden Flows | `pnpm test:golden` |

## 4. Invariants

If schema changes affect invariants, update `schemas/v2/invariants/*.yaml`.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
