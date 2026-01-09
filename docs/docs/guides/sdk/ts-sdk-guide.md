---
sidebar_position: 1

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Reference implementation guide for the MPLP TypeScript SDK."
title: TypeScript SDK Guide
keywords: [MPLP, TypeScript, SDK, NPM, Reference Implementation]
sidebar_label: TypeScript SDK

---



# TypeScript SDK Guide

> **Protocol Version**: 1.0.0 (Frozen)
> **SDK Line**: v1.x (evolving)

## 1. Purpose

The **MPLP TypeScript SDK** (`@mplp/sdk-ts`) is the **Reference Implementation** of MPLP v1.0.0. It provides full type safety and Ajv-based runtime validation.

**NPM Package**: [`@mplp/sdk-ts`](https://www.npmjs.com/package/@mplp/sdk-ts)

## 2. Installation

```bash
npm install @mplp/sdk-ts
```

> [!IMPORTANT]
> **Package Structure**
> 
> `@mplp/sdk-ts` is distributed as a **compiled package** (dist-only). This is the expected format for NPM consumption. Source code is available in the [GitHub repository](https://github.com/Coregentis/MPLP-Protocol).

## 3. Import Policy

> [!IMPORTANT]
> **v1.x Import Stability**
> 
> - **Root import is stable**: `import { ... } from '@mplp/sdk-ts'`
> - Subpath imports (e.g., `/core`, `/builders`) are **not currently exported**
> - For modular imports, use the individual packages directly (see below)

### 3.1 Recommended: Root Import

```typescript
import { 
  createContext, 
  createPlan, 
  createTrace,
  SchemaValidator 
} from '@mplp/sdk-ts';
```

### 3.2 Alternative: Individual Packages

For more granular control, install and import from individual packages:

```typescript
// Core types
import { ContextFrame, PlanDocument } from '@mplp/core';

// Schema validation
import { SchemaValidator } from '@mplp/schema';

// Multi-agent coordination
import { CollabSession, RoleBinding } from '@mplp/coordination';
```

## 4. Published Packages

MPLP is distributed as a set of modular NPM packages. Packages may advance independently (non-breaking changes only).

| Package | Purpose | Layer |
|:---|:---|:---:|
| **`@mplp/sdk-ts`** | Main SDK (recommended entry point) | Tools |
| `@mplp/core` | Core type definitions and models | L1 |
| `@mplp/schema` | JSON Schemas and validation logic | L1 |
| `@mplp/modules` | Protocol module definitions | L2 |
| `@mplp/coordination` | Multi-agent coordination primitives | L2 |
| `@mplp/compliance` | Conformance and validation utilities | Tools |
| `@mplp/devtools` | CLI and developer tools | Tools |
| `@mplp/runtime-minimal` | Reference Action Execution Layer (AEL) | L3 |
| `@mplp/integration-llm-http` | HTTP-based LLM integration | L4 |
| `@mplp/integration-storage-fs` | Filesystem storage integration | L4 |
| `@mplp/integration-storage-kv` | Key-Value storage integration | L4 |
| `@mplp/integration-tools-generic` | Generic tool execution integration | L4 |

> **Version Policy**: Protocol specification is **frozen** at v1.0.0. SDK packages follow semantic versioning and may advance independently for non-breaking improvements. See [Versioning Policy](/docs/evaluation/governance/versioning-policy).

## 5. Quick Start

```typescript
import { createContext, createPlan, addStep } from '@mplp/sdk-ts';

// Create a Context
const context = createContext({
  source: 'user',
  initial_objectives: ['Fix the login bug'],
  constraints: {
    budget_limit_usd: 10.0
  }
});

// Create a Plan linked to Context
const plan = createPlan({
  context_id: context.context_id,
  title: 'Fix Login Bug',
  status: 'draft'
});

// Add steps to the Plan
addStep(plan, {
  description: 'Read error logs',
  agent_role: 'debugger',
  status: 'pending'
});

console.log('Context ID:', context.context_id);
console.log('Plan ID:', plan.plan_id);
console.log('Steps:', plan.steps.length);
```

## 6. Validation

The SDK uses **Ajv** for JSON Schema validation:

```typescript
import { SchemaValidator } from '@mplp/sdk-ts';

const validator = new SchemaValidator();

// Validate a Context object
const result = validator.validate('mplp-context', myContextData);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## 7. Runtime Orchestration

For full runtime execution, use the `RuntimeOrchestrator`:

```typescript
import { RuntimeOrchestrator } from '@mplp/sdk-ts';

const orchestrator = new RuntimeOrchestrator({
  projectRoot: './my-project'
});

// Initialize and run
await orchestrator.initialize();
const result = await orchestrator.executePlan(plan);
```

## 8. References

| Resource | Location |
|:---|:---|
| Source Code | `packages/sources/sdk-ts/` |
| NPM Package | `packages/npm/sdk-ts/` |
| Schemas | `schemas/v2/` |
| Golden Tests | `tests/golden/` |
| API Docs | Generated from TypeDoc |

---

**Protocol**: MPLP v1.0.0 (Frozen)  
**SDK**: @mplp/sdk-ts v1.x  
**Import Policy**: Root import is stable