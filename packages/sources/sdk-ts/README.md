# @mplp/sdk-ts

**Package Role:** Source workspace mirror (not a public publish target)
**Protocol:** MPLP v1.0.0 (Frozen)
**sdk_version:** 1.0.7
**License:** Apache-2.0

This directory is the **source-side workspace mirror** for the published
`@mplp/sdk-ts` npm package.

It contains the compiled facade artifacts, mirrored schemas, and package metadata
used for local workspace linking and publish preparation.

It is **not** itself the public npm publish surface.

Contract mode of the public counterpart: **derived protocol helper**.
This mirror must not establish an independent public contract or authority chain.

---

## Scope & Guarantees (Important)

### What this package provides

- Build-source mirror for the published `@mplp/sdk-ts` package
- Compiled facade artifacts (`dist/`) for builders and runtime client helpers
- Mirrored schema bundle for package derivation
- Workspace package identity aligned to MPLP `protocol_version` v1.0.0
- Kernel Duty re-export surface mirroring the public package

### What this package does NOT provide

- Public npm publish scope (see `packages/npm/sdk-ts/`)
- Raw authoring source tree inside this directory
- Full execution runtime (LLM orchestration, tool execution)
- Standalone runtime package identity (see `@mplp/runtime-minimal`)
- Golden Flow execution engines (Flow-01 ~ Flow-05)
- Canonical registry of all 11 Kernel Duties

> This workspace mirror must not be treated as L0 protocol truth.
> Its upstream truth remains the core schema/entity/version assets in the main repository.

---

## Publish Scope

- Source-side workspace mirror: `packages/sources/sdk-ts/`
- Public npm surface: `packages/npm/sdk-ts/`
- Separate runtime package: `packages/npm/runtime-minimal/`

Public installation remains:

```bash
npm install @mplp/sdk-ts
```

---

## Protocol Documentation

- **Homepage:** [https://www.mplp.io](https://www.mplp.io) — discovery and positioning only
- **Specification & Docs:** [https://docs.mplp.io](https://docs.mplp.io) — authoritative reference surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — authoritative source of truth
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Kernel Duty Baseline

This package mirror carries the same Kernel Duty re-export surface as the public
`@mplp/sdk-ts` package.

Canonical baseline source:

- `@mplp/schema`
- `schemas/v2/taxonomy/kernel-duties.yaml`

---

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package role:** source-side mirror for the public `@mplp/sdk-ts` facade
- **Kernel duty baseline:** 11/11 re-exported via mirrored package surface
- **SDK compatibility:** aligned to `protocol_version` v1.0.0 only
- Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
