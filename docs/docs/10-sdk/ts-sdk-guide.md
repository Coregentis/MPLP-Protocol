---
title: TypeScript SDK Guide
description: Official guide for the MPLP TypeScript SDK (@mplp/sdk-ts). Covers
  installation, core components, quick start with builders, and Ajv-based
  validation.
keywords:
  - TypeScript SDK Guide
  - MPLP TypeScript SDK
  - "@mplp/sdk-ts"
  - Ajv validation
  - SDK builders
  - runtime engine
  - TypeScript quick start
sidebar_label: TypeScript SDK Guide
doc_status: informative
doc_role: guide
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# TypeScript SDK Guide

## 1. Purpose

The **MPLP TypeScript SDK** (`@mplp/sdk-ts`) is the **Official / Reference** implementation of MPLP v1.0.0. It provides full type safety and Ajv-based runtime validation.

## 2. Installation

```bash
npm install @mplp/sdk-ts
```

## 3. Core Components

```typescript
// Core Models
import { ContextFrame, PlanDocument } from '@mplp/sdk-ts/core';

// Runtime
import { RuntimeEngine } from '@mplp/sdk-ts/runtime';
```

| Module | Purpose |
|:---|:---|
| `core/` | Core type definitions and models |
| `runtime/` | Runtime engine implementations |
| `builders/` | Builder pattern for Context, Plan, Events |
| `client/` | Client utilities |

## 4. Quick Start

```typescript
import { ContextBuilder, PlanBuilder } from '@mplp/sdk-ts';

// Create a Context using builder pattern
const ctx = new ContextBuilder()
  .title("My Project")
  .domain("code-assistance")
  .build();

// Create a Plan
const plan = new PlanBuilder()
  .contextId(ctx.context_id)
  .objective("Hello World")
  .build();

console.log(ctx.context_id, plan.plan_id);
```

## 5. Validation

The SDK uses **Ajv** for JSON Schema validation:

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);
// Validate against schemas/v2/*.schema.json
```

## 6. References

- **Package**: `packages/sdk-ts/package.json`
- **Schemas**: `schemas/v2/`
- **Tests**: `packages/sdk-ts/tests/`

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
