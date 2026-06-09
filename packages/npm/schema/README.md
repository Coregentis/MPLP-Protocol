# @mplp/schema

**Package Role:** Public npm schema and protocol-baseline mirror package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.7
**License:** Apache-2.0

The `@mplp/schema` package provides the public schema/data mirror surface for MPLP v1.0.0 JSON Schema artifacts, validator helpers, and the machine-readable Kernel Duty baseline.

It mirrors package-facing schema data. It does not replace the Dev repository L0 schema source of truth.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- JSON Schema package artifacts for MPLP v1.0.0 consumers.
- Validator helper entry points such as `loadSchema`, `createValidator`, and `validate`.
- The canonical 11-duty baseline export via `KERNEL_DUTIES`, `KERNEL_DUTY_IDS`, `KERNEL_DUTY_NAMES`, and `KERNEL_DUTY_COUNT`.

## What This Package Does NOT Provide

- Authority to change protocol schemas.
- Invariant or profile bundles as the package contract.
- Full execution runtime or agent orchestration.
- Certification, regulator approval, legal compliance proof, or official-standard status.

## Installation

```bash
npm install @mplp/schema
```

## Minimal User Smoke Usage Snippet

```javascript
const schema = require('@mplp/schema');
console.log(schema.KERNEL_DUTY_COUNT);
console.log(schema.KERNEL_DUTIES[0]);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/schema](https://www.npmjs.com/package/@mplp/schema)
- Public npm surface: `packages/npm/schema`.
- L0 schema truth remains in `schemas/v2/**` and taxonomy records.
- This package is a release surface mirror, not the authority that changes schemas.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.7
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
