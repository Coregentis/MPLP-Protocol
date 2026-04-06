# @mplp/sdk-ts

**Package Role:** Public npm facade package
**Protocol:** MPLP v1.0.0 (Frozen)
**sdk_version:** 1.0.7
**License:** Apache-2.0

The published `@mplp/sdk-ts` package is the **public TypeScript SDK facade**
for MPLP.

It ships:

- compiled builder helpers,
- a runtime client,
- mirrored schema artifacts,
- and a stable facade import surface over `@mplp/core`.

It is **not** the standalone runtime package and it does **not** carry an
independent canonical Kernel Duty registry. Its public duty surface is
re-exported from `@mplp/schema`.

This package is a **derived protocol helper facade**.
It should not be read as a direct mirror of canonical protocol objects.

---

## Scope & Guarantees (Important)

### What this package provides

- Protocol-aligned facade helper exports for MPLP v1.0.0
- Compiled builders such as `createContext`, `createPlan`, `createConfirm`, and `appendTrace`
- Runtime client helpers via `MplpRuntimeClient`
- Mirrored schemas for validator/helper use
- Public npm distribution surface for the TypeScript SDK facade
- Re-exported Kernel Duty baseline from `@mplp/schema`

### What this package does NOT provide

- Direct schema or invariant mirrors as first-class public API
- Standalone runtime package identity (use `@mplp/runtime-minimal`)
- Full execution runtime hosting/orchestration stack
- Golden Flow execution engines (Flow-01 ~ Flow-05)
- Independent canonical registry authority for the 11 Kernel Duties

> These capabilities belong to reference runtimes and products built *on top of* MPLP,
> not to the protocol SDK itself.

---

## Installation

```bash
npm install @mplp/sdk-ts
```

---

## Protocol Documentation

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) — discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) — authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — repository truth source
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Package Provenance

- **Public npm surface:** `packages/npm/sdk-ts/`
- **Source-side mirror:** `packages/sources/sdk-ts/`
- **Separate runtime package:** `packages/npm/runtime-minimal/`

This package is a facade surface over compiled artifacts and mirrored schemas.
It should not be read as protocol truth or as the sole runtime package.

---

## Kernel Duty Baseline

This package re-exports the canonical 11 MPLP Kernel Duties from `@mplp/schema`.

```typescript
import { KERNEL_DUTY_COUNT, KERNEL_DUTIES } from '@mplp/sdk-ts';

console.log(KERNEL_DUTY_COUNT); // 11
console.log(KERNEL_DUTIES[0]);  // { id: 'KD-01', name: 'Coordination', slug: 'coordination' }
```

Canonical upstream baseline remains in:

- `schemas/v2/taxonomy/kernel-duties.yaml`
- the public mirror package `@mplp/schema`

---

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Facade package version:** 1.0.7
- **Kernel duty baseline:** 11/11 re-exported from `@mplp/schema`
- **SDK compatibility:** aligned to `protocol_version` v1.0.0 only
- Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
