# @mplp/conformance

**Package Role:** Public npm conformance helper facade package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.1
**License:** Apache-2.0

The `@mplp/conformance` package is the forward public package surface for MPLP conformance helper APIs.

It owns its helper implementation directly and does not import from the legacy `@mplp/compliance` package. It is an evidence-checking helper surface, not an attestation surface.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Forward public import surface for MPLP conformance helper APIs.
- Flow-oriented helper checks such as `runGoldenFlow01`.
- Schema-oriented helper checks carried through this package surface.

## What This Package Does NOT Provide

- Certificates, approval statements, regulatory findings, or legal compliance proof.
- A protocol source-of-truth object mirror.
- Full execution runtime or agent orchestration.
- A change to the publication, deprecation, or registry status of `@mplp/compliance`.

## Installation

```bash
npm install @mplp/conformance
```

## Minimal User Smoke Usage Snippet

```javascript
const conformance = require('@mplp/conformance');
console.log(typeof conformance.runGoldenFlow01);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/conformance](https://www.npmjs.com/package/@mplp/conformance)
- Public npm surface: `packages/npm/conformance`.
- Forward package for conformance helpers.
- Legacy `@mplp/compliance` remains excluded from this publish scope.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.1
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
