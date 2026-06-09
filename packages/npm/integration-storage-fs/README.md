# @mplp/integration-storage-fs

**Package Role:** Public npm filesystem storage integration helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.6
**License:** Apache-2.0

The `@mplp/integration-storage-fs` package provides a runtime-level filesystem storage integration helper for MPLP v1.0.0 consumers.

It is an integration helper surface. It is not a direct protocol object mirror and not a managed filesystem product.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- A filesystem storage helper export such as `JsonFsStorage`.
- Runtime integration scaffolding aligned to MPLP v1.0.0.
- A package-facing helper surface for local consumer integration tests.

## What This Package Does NOT Provide

- Managed filesystem infrastructure.
- Full execution runtime or agent orchestration.
- Protocol schema source-of-truth authority.
- Certification, regulator approval, or legal compliance proof.

## Installation

```bash
npm install @mplp/integration-storage-fs
```

## Minimal User Smoke Usage Snippet

```javascript
const { JsonFsStorage } = require('@mplp/integration-storage-fs');
console.log(typeof JsonFsStorage);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/integration-storage-fs](https://www.npmjs.com/package/@mplp/integration-storage-fs)
- Public npm surface: `packages/npm/integration-storage-fs`.
- Runtime-level integration helper package.
- Protocol truth remains in schema and governance records, not this integration package.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.6
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
