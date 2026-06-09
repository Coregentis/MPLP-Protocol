# @mplp/integration-llm-http

**Package Role:** Public npm HTTP LLM integration helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.6
**License:** Apache-2.0

The `@mplp/integration-llm-http` package provides a runtime-level HTTP LLM integration helper for MPLP v1.0.0 consumers.

It is an integration helper surface. It is not an LLM provider, hosted execution runtime, or protocol authority.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- An HTTP LLM helper export such as `HttpLlmClient`.
- Runtime integration scaffolding aligned to MPLP v1.0.0.
- A package-facing helper surface for local consumer integration tests.

## What This Package Does NOT Provide

- Managed LLM service access or provider endorsement.
- Full execution runtime or hosted orchestration.
- Protocol schema source-of-truth authority.
- Certification, regulator approval, or legal compliance proof.

## Installation

```bash
npm install @mplp/integration-llm-http
```

## Minimal User Smoke Usage Snippet

```javascript
const { HttpLlmClient } = require('@mplp/integration-llm-http');
console.log(typeof HttpLlmClient);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/integration-llm-http](https://www.npmjs.com/package/@mplp/integration-llm-http)
- Public npm surface: `packages/npm/integration-llm-http`.
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
