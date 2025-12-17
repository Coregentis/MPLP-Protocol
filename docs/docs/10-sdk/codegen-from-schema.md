---
title: Codegen From Schema
description: Guide for generating SDK models from MPLP JSON Schemas. Details
  source schemas, generated outputs for TypeScript and Python, and event model
  handling rules.
keywords:
  - Codegen from Schema
  - SDK generation
  - MPLP JSON Schema
  - model generation
  - TypeScript SDK
  - Python SDK
  - vendor neutrality
  - event model
sidebar_label: Codegen from Schema
doc_status: normative
doc_role: guide
normative_refs:
  - MPLP-CORPUS-v1.0.0
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
normative_id: MPLP-SDK-CODEGEN-FROM-SCHEMA
sidebar_position: 7
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Code Generation from Schema

## 1. Purpose

This document describes how to generate SDK models from the MPLP JSON Schemas (`schemas/v2/`).

## 2. Source Schemas

All codegen MUST use the schemas in `schemas/v2/` as the single source of truth:

- `mplp-context.schema.json`
- `mplp-plan.schema.json`
- `mplp-confirm.schema.json`
- `mplp-trace.schema.json`
- `mplp-role.schema.json`
- `mplp-dialog.schema.json`
- `mplp-collab.schema.json`
- `mplp-extension.schema.json`
- `mplp-core.schema.json`
- `mplp-network.schema.json`

## 3. Generated Outputs

| Language | Output Directory | Type |
|:---------|:-----------------|:-------------|
| TypeScript | `packages/sdk-ts/src/types/` | Interfaces & Enums |
| Python | `packages/sdk-py/src/mplp/model/` | Pydantic v2 Classes |

> [!NOTE]
> Go and Java SDKs are not included in v1.0. See `examples/go-basic-flow/` and `examples/java-basic-flow/` for reference implementations.

## 4. Event Model Handling

### 4.1 "3 Physical / 12 Logical" Rule

MPLP v1.0 uses a "3 Physical / 12 Logical" event model. SDKs MUST generate types for the **Physical Schemas** only.

- **Physical Schemas** (Generate these):
  - `MplpPipelineStageEvent`
  - `MplpGraphUpdateEvent`
  - `MplpRuntimeExecutionEvent`
  - `MplpEventCore` (Base)

- **Logical Families** (Do NOT generate separate types):
  - Logical families (e.g., `JobState`, `StepState`) are distinguished at runtime by the `family` and `event_type` fields within the physical payload.
  - SDKs should provide **helper constants** or **factory functions** for these logical types, but not distinct class definitions.

## 5. Vendor Neutrality

Generated code MUST NOT contain any vendor-specific logic (e.g., OpenAI, Anthropic, AWS). It must remain strictly a data modeling layer for the MPLP protocol.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
