# @mplp/runtime-minimal

**Package Role:** Public npm minimal runtime helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.6
**License:** Apache-2.0

The `@mplp/runtime-minimal` package provides a minimal runtime helper surface for MPLP v1.0.0 consumers.

It ships runtime-level helper concepts and orchestrator artifacts. It is not a full execution platform and it does not replace `@mplp/sdk-ts`.

## Scope & Guarantees

This package is a public npm release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Minimal runtime interfaces and orchestrator helper artifacts aligned with MPLP v1.0.0.
- Runtime-level helper exports such as `InMemoryAEL`, `InMemoryVSL`, and flow runner helpers.
- A runtime-focused package surface separated from the SDK facade.

## What This Package Does NOT Provide

- A full execution platform for LLM orchestration or tool execution.
- A replacement for `@mplp/sdk-ts`.
- A canonical registry of all 11 Kernel Duties.
- Protocol schema source-of-truth authority.

## Installation

```bash
npm install @mplp/runtime-minimal
```

## Minimal User Smoke Usage Snippet

```javascript
const runtime = require('@mplp/runtime-minimal');
console.log(typeof runtime.runSingleAgentFlow);
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://www.npmjs.com/package/@mplp/runtime-minimal](https://www.npmjs.com/package/@mplp/runtime-minimal)
- Public npm surface: `packages/npm/runtime-minimal`.
- Related facade package: `packages/npm/sdk-ts`.
- Runtime helper package, not protocol truth and not a full execution product.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.6
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
