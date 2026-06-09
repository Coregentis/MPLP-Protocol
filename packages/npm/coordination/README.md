# @mplp/coordination

**Package Role:** Public npm coordination helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.7
**License:** Apache-2.0

The `@mplp/coordination` package provides coordination-oriented helper contracts and event utilities for MPLP v1.0.0 consumers.

It is a derived helper package over protocol-aligned types, not a standalone runtime or protocol authority.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Coordination helper contracts for single-agent and multi-agent lifecycle flows.
- Convenience exports such as `SingleAgentFlowContract` and `createMplpEvent`.
- A package-facing integration surface aligned to MPLP v1.0.0.

## What This Package Does NOT Provide

- Full execution runtime or hosted orchestration.
- Protocol schema source-of-truth authority.
- Golden Flow execution engines.
- Registry, release, certification, or compliance authority.

## Installation

```bash
npm install @mplp/coordination
```

## Minimal User Smoke Usage Snippet

```javascript
const coordination = require('@mplp/coordination');
console.log(typeof coordination.createMplpEvent);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/coordination](https://www.npmjs.com/package/@mplp/coordination)
- Public npm surface: `packages/npm/coordination`.
- Derived package helper surface for coordination consumers.
- Canonical protocol truth remains in Dev-side schema and governance records.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.7
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
