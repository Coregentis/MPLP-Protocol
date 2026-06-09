# @mplp/core

**Package Role:** Public npm core protocol helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.7
**License:** Apache-2.0

The `@mplp/core` package provides protocol-aligned helper interfaces, model validators, and core version constants for MPLP v1.0.0 consumers.

It is a derived package surface. It is not the protocol source of truth and does not replace the canonical schema bundle.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Protocol-aligned helper interfaces for MPLP v1.0.0.
- Core model validator entry points such as `validateContext`, `validatePlan`, and `validateTrace`.
- The public `MPLP_PROTOCOL_VERSION` constant for package consumers.

## What This Package Does NOT Provide

- Full execution runtime or agent orchestration.
- Golden Flow execution engines.
- Schema source-of-truth authority.
- Registry, release, certification, or compliance authority.

## Installation

```bash
npm install @mplp/core
```

## Minimal User Smoke Usage Snippet

```javascript
const core = require('@mplp/core');
console.log(core.MPLP_PROTOCOL_VERSION);
console.log(typeof core.validateContext);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/core](https://www.npmjs.com/package/@mplp/core)
- Public npm surface: `packages/npm/core`.
- Derived from MPLP Dev-side package release surfaces.
- Canonical protocol schema truth remains outside this package.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.7
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
