# @mplp/sdk-ts

**Package Role:** Public npm TypeScript SDK facade package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.8
**License:** Apache-2.0

The `@mplp/sdk-ts` package is the public TypeScript SDK facade for MPLP v1.0.0 consumers.

It is a facade over compiled helpers, runtime client helpers, schema mirrors, and Kernel Duty exports. It is not the standalone runtime package and should not be read as protocol truth.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Protocol-aligned facade helper exports for MPLP v1.0.0.
- Builder helpers such as `createContext`, `createPlan`, `createConfirm`, and `appendTrace`.
- Runtime client helpers via `MplpRuntimeClient`.
- Re-exported Kernel Duty baseline from `@mplp/schema`.

## What This Package Does NOT Provide

- Standalone runtime package identity; use `@mplp/runtime-minimal` for that package surface.
- Direct schema or invariant mirrors as first-class protocol authority.
- Full execution runtime hosting or orchestration stack.
- Independent canonical authority for Kernel Duties.

## Installation

```bash
npm install @mplp/sdk-ts
```

## Minimal User Smoke Usage Snippet

```javascript
const sdk = require('@mplp/sdk-ts');
console.log(typeof sdk.createContext);
console.log(sdk.KERNEL_DUTY_COUNT);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/sdk-ts](https://www.npmjs.com/package/@mplp/sdk-ts)
- Public npm surface: `packages/npm/sdk-ts`.
- Source-side mirror: `packages/sources/sdk-ts`.
- Separate runtime package: `packages/npm/runtime-minimal`.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.8
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
