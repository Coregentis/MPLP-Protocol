# mplp-sdk

**Package Role:** Public PyPI protocol helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**Package version:** 1.0.6
**License:** Apache-2.0

The `mplp-sdk` package provides a minimal Python protocol helper surface for MPLP package identity, protocol-version alignment, and the 11 Kernel Duties.

It is intentionally narrower than the TypeScript SDK and runtime packages. It is not a full Python SDK, generated model set, or reference runtime.

## Scope & Guarantees

This package is a public PyPI release surface for the package role above. It is package evidence and user-facing distribution content, not authorization to publish, mutate registries, create tags, create release seals, or change protocol truth.

## What This Package Provides

- Installable Python helper package surface for MPLP v1.0.0.
- Protocol version alignment through `mplp.MPLP_PROTOCOL_VERSION`.
- Kernel Duty baseline exports through `mplp.KERNEL_DUTIES`, `mplp.KERNEL_DUTY_IDS`, `mplp.KERNEL_DUTY_NAMES`, and `mplp.KERNEL_DUTY_COUNT`.

## What This Package Does NOT Provide

- Full Python SDK models or generated schema model set.
- Reference runtime implementation.
- Golden Flow execution engines.
- Certification, regulator approval, legal compliance proof, or official-standard status.

## Installation

```bash
pip install mplp-sdk
```

## Minimal User Smoke Usage Snippet

```python
import mplp
import mplp.kernel_duties
print(mplp.__version__)
print(mplp.KERNEL_DUTY_COUNT)
```

## Protocol Documentation Links

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) - discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) - authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) - public source projection
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

## Package Provenance

- **Package address:** [https://pypi.org/project/mplp-sdk/](https://pypi.org/project/mplp-sdk/)
- Public PyPI surface: `packages/pypi/mplp-sdk`.
- Source-side mirror: `packages/sources/sdk-py`.
- Package metadata classifier `Development Status :: 5 - Production/Stable` remains a publish-execution owner-confirmation item.

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package version:** 1.0.6
- **Compatibility:** aligned to MPLP protocol_version v1.0.0 only
- Breaking changes require a new protocol version or a separately approved package release decision.

## License

Apache License, Version 2.0

## Copyright

© 2026 Jearon Wong
