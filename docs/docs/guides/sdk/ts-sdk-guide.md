---
sidebar_position: 1

doc_type: reference
normativity: informative
status: active
authority: none
description: "Guide to the current published @mplp/sdk-ts facade surface and its boundary relative to runtime-minimal and schema packages."
title: TypeScript SDK Guide
keywords: [MPLP, TypeScript, SDK, NPM, Facade]
sidebar_label: TypeScript SDK

---

# TypeScript SDK Guide

> **Protocol Version**: `1.0.0` (Frozen)  
> **Current Facade Package**: `@mplp/sdk-ts`  
> **Document Role**: explanatory package guide, not protocol truth

## 1. Purpose

This page describes the **current published facade surface** of `@mplp/sdk-ts`.

It does **not** define protocol truth, and it must not be read as a promise of
unshipped APIs, a full runtime platform, or a reference implementation claim.

The authoritative truth source for MPLP remains the repository-backed schema,
invariant, and governance baseline.

## 2. Current Publish Surface

The published root export surface of `@mplp/sdk-ts` is currently anchored to:

- `packages/npm/sdk-ts/dist/index.d.ts`

That root export surface currently includes:

- re-exports from `@mplp/core`
- Kernel Duty baseline re-exports
- builder helpers:
  - `createContext`
  - `createPlan`
  - `createConfirm`
  - `appendTrace`
- `MplpRuntimeClient`

Low-level runtime artifacts are **not** part of the `@mplp/sdk-ts` root export
surface. Those belong to `@mplp/runtime-minimal`.

## 3. What This Package Is

`@mplp/sdk-ts` is the **public TypeScript facade package** for MPLP v1.0.0.

Its role is to provide a stable TypeScript-facing entry surface over selected
published package artifacts. It is appropriate for:

- importing builder helpers
- accessing the current facade client export
- consuming Kernel Duty constants
- accessing the current `@mplp/core` re-export surface

## 4. What This Package Is Not

`@mplp/sdk-ts` must **not** be described as:

- a reference implementation of the full protocol
- a full runtime package
- a production orchestrator platform
- a bundled validator stack for complete schema-conformance guarantees
- the root export location for low-level runtime primitives

In particular, this guide does **not** claim that `@mplp/sdk-ts` currently ships:

- `SchemaValidator`
- `RuntimeOrchestrator`
- root-exported `InMemoryVSL`
- root-exported `InMemoryAEL`
- root-exported `runSingleAgentFlow`

Those names must not be presented as part of the current `@mplp/sdk-ts`
publish reality unless and until the actual package exports change.

## 5. Installation

```bash
npm install @mplp/sdk-ts
```

If you need the lower-level published runtime artifact surface as well:

```bash
npm install @mplp/runtime-minimal
```

## 6. Import Policy

### 6.1 Recommended Facade Import

```typescript
import {
  createContext,
  createPlan,
  createConfirm,
  appendTrace,
  MplpRuntimeClient,
} from "@mplp/sdk-ts";
```

### 6.2 Low-Level Runtime Imports

Use `@mplp/runtime-minimal` directly for runtime-layer artifacts such as:

- `runSingleAgentFlow`
- `InMemoryVSL`
- `InMemoryAEL`

```typescript
import {
  runSingleAgentFlow,
  InMemoryVSL,
  InMemoryAEL,
} from "@mplp/runtime-minimal";
```

### 6.3 Subpath Boundary

For the current `@mplp/sdk-ts` package line:

- root import is the documented stable entrypoint
- subpath imports are not the documented compatibility contract for this guide
- if you need lower-level surfaces, use the individual published packages directly

## 7. Validation Boundary

For schema-conformance checking, use the dedicated `@mplp/schema` package and
the canonical repository schemas.

```typescript
import { validate, KERNEL_DUTY_COUNT, KERNEL_DUTIES } from "@mplp/schema";

const result = validate("mplp-context", myContextData);

console.log(KERNEL_DUTY_COUNT); // 11
console.log(KERNEL_DUTIES[0].name); // Coordination

if (!result.valid) {
  console.error(result.errors);
}
```

Important boundary:

- repository schemas remain the truth source
- `@mplp/schema` is the current package surface for package-level validation helpers
- `@mplp/sdk-ts` may re-export `@mplp/core`, but this guide does **not** treat
  the facade root as the canonical schema-validation surface

## 8. Runtime Client Boundary

`MplpRuntimeClient` is part of the current `@mplp/sdk-ts` root export surface.

It should be described as a **convenience facade client**, not as:

- a full runtime implementation
- a complete orchestrator surface
- a proof that all runtime-layer behaviors are bundled into `@mplp/sdk-ts`

If your use case depends on low-level execution primitives or runtime storage
abstractions, use `@mplp/runtime-minimal` directly.

## 9. Published Package Roles

| Package | Role | Surface Boundary |
|:---|:---|:---|
| `@mplp/sdk-ts` | Public TypeScript facade entrypoint | Facade package, not full runtime |
| `@mplp/runtime-minimal` | Minimal runtime artifact package | Runtime-layer package surface |
| `@mplp/schema` | Schema bundle and validation-helper package | Validation/helper surface tied to schema bundle |
| `@mplp/core` | Core protocol type/helper package | Low-level package surface re-exported by facade |

## 10. References

| Resource | Location |
|:---|:---|
| Public facade package | `packages/npm/sdk-ts/` |
| Source-side mirror | `packages/sources/sdk-ts/` |
| Public runtime package | `packages/npm/runtime-minimal/` |
| Schema/helper package | `packages/npm/schema/` |
| Canonical schemas | `schemas/v2/` |
| Version taxonomy | `governance/05-versioning/VERSION-TAXONOMY-MANIFEST.md` |

---

**Final Boundary**: `@mplp/sdk-ts` is the current public facade package for MPLP
v1.0.0. It is not the protocol truth source, not the full runtime package, and
not a safe place to infer unexported or future APIs.
