---
doc_type: reference
status: active
authority: Documentation Governance
description: ""
title: TypeScript SDK Guide
---

# TypeScript SDK Guide

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 1. Purpose

The **MPLP TypeScript SDK** (`@mplp/sdk-ts`) is the **Reference** implementation of MPLP v1.0.0. It provides full type safety and Ajv-based runtime validation.

**NPM Package**: [`@mplp/sdk-ts`](https://www.npmjs.com/package/@mplp/sdk-ts)

## 2. Installation

```bash
npm install @mplp/sdk-ts
```

## 3. Published Packages

MPLP v1.0.0 is distributed as a set of modular NPM packages. Version: **v1.0.5**.

| Package | Purpose | Link |
|:---|:---|:---|
| `@mplp/core` | Core type definitions and models | [NPM](https://www.npmjs.com/package/@mplp/core) |
| `@mplp/schema` | Canonical JSON Schemas and validation logic | [NPM](https://www.npmjs.com/package/@mplp/schema) |
| `@mplp/modules` | Protocol module definitions (Plan, Trace, etc.) | [NPM](https://www.npmjs.com/package/@mplp/modules) |
| `@mplp/coordination` | Multi-agent coordination primitives | [NPM](https://www.npmjs.com/package/@mplp/coordination) |
| `@mplp/compliance` | Conformance and validation utilities | [NPM](https://www.npmjs.com/package/@mplp/compliance) |
| `@mplp/validator` | Protocol Validator CLI (CI-only, not published) | *internal* |
| `@mplp/devtools` | CLI and developer tools | [NPM](https://www.npmjs.com/package/@mplp/devtools) |
| `@mplp/runtime-minimal` | Reference Action Execution Layer (AEL) | [NPM](https://www.npmjs.com/package/@mplp/runtime-minimal) |
| `@mplp/sdk-ts` | **Main SDK** (includes all above) | [NPM](https://www.npmjs.com/package/@mplp/sdk-ts) |
| `@mplp/integration-llm-http` | HTTP-based LLM integration | [NPM](https://www.npmjs.com/package/@mplp/integration-llm-http) |
| `@mplp/integration-storage-fs` | Filesystem storage integration | [NPM](https://www.npmjs.com/package/@mplp/integration-storage-fs) |
| `@mplp/integration-storage-kv` | Key-Value storage integration | [NPM](https://www.npmjs.com/package/@mplp/integration-storage-kv) |
| `@mplp/integration-tools-generic` | Generic tool execution integration | [NPM](https://www.npmjs.com/package/@mplp/integration-tools-generic) |

## 4. Core Components

```typescript
// Core Models
import { ContextFrame, PlanDocument } from '@mplp/sdk-ts/core';

// Runtime
import { RuntimeOrchestrator } from '@mplp/sdk-ts/runtime';
```

## 5. Quick Start

```typescript
import { ContextBuilder, PlanBuilder } from '@mplp/sdk-ts/builders';

// Create a Context using builder pattern
const ctx = new ContextBuilder()
  .setTitle("My Project")
  .setDomain("code-assistance")
  .build();

// Create a Plan
const plan = new PlanBuilder()
  .setContextId(ctx.context_id)
  .setObjective("Hello World")
  .build();

console.log(ctx.context_id, plan.plan_id);
```

## 6. Validation

The SDK uses **Ajv** for JSON Schema validation:

```typescript
import { SchemaValidator } from '@mplp/sdk-ts/schema';

const validator = new SchemaValidator();
const isValid = validator.validate('mplp-context', myContextData);
```

## 7. References

- **Package**: `packages/npm/sdk-ts/package.json`
- **Schemas**: `schemas/v2/`
- **Tests**: `packages/npm/sdk-ts/tests/`