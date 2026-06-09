# @mplp/modules

**Package Role:** Public npm module helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.6
**License:** Apache-2.0

The `@mplp/modules` package provides module dependency and profile helper exports for MPLP v1.0.0 consumers.

It is a package helper surface, not the authoritative registry of protocol modules or a runtime execution platform.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Module dependency helper data via `MODULE_DEPENDENCIES`.
- Profile helper data via `PROFILES`.
- A lightweight package surface for module-aware consumers.

## What This Package Does NOT Provide

- Full execution runtime or agent orchestration.
- Protocol schema source-of-truth authority.
- Certification, regulator approval, or legal compliance proof.
- Package release or registry authority.

## Installation

```bash
npm install @mplp/modules
```

## Minimal User Smoke Usage Snippet

```javascript
const modules = require('@mplp/modules');
console.log(Object.keys(modules.MODULE_DEPENDENCIES || {}).length);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/modules](https://www.npmjs.com/package/@mplp/modules)
- Public npm surface: `packages/npm/modules`.
- Derived helper package for module metadata consumers.
- Protocol truth remains outside this release package surface.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.6
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
