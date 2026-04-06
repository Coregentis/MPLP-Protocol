# mplp-sdk

**Package Role:** Source-side PyPI package mirror (not a public publish target)
**Protocol:** MPLP v1.0.0 (Frozen)
**sdk_version:** 1.0.5
**License:** Apache-2.0

This directory is the **source-side mirror** for the published PyPI package
`mplp-sdk`.

Its current shipped source surface is intentionally minimal and exists to keep
package metadata, protocol-version markers, Kernel Duty exports, and release artifacts aligned.

It is **not** a full Python SDK or reference runtime surface.

Contract mode of the public counterpart: **direct data/helper mirror**.
This mirror must not establish an independent public contract or authority chain.

---

## Scope & Guarantees (Important)

### What this package provides

- Source-side mirror for the public `mplp-sdk` release surface
- Protocol version marker exports:
  - `mplp.__version__`
  - `mplp.MPLP_PROTOCOL_VERSION`
- Kernel Duty exports:
  - `mplp.KERNEL_DUTIES`
  - `mplp.KERNEL_DUTY_IDS`
  - `mplp.KERNEL_DUTY_NAMES`
  - `mplp.KERNEL_DUTY_COUNT`
- Release metadata and build inputs for the PyPI publish surface

### What this package does NOT provide

- Full Python SDK models
- Pydantic model set
- Reference runtime implementation
- Golden Flow execution engines
- Full Python SDK models
- Reference runtime implementation
- Golden Flow execution engines

> This source-side mirror is not itself a public package claim surface.
> Public install/use claims must be made against `packages/pypi/mplp-sdk/`.

---

## Publish Scope

- **Source-side mirror:** `packages/sources/sdk-py/`
- **Public PyPI surface:** `packages/pypi/mplp-sdk/`

Public installation remains:

```bash
pip install mplp-sdk
```

---

## Protocol Documentation

- **Homepage:** [https://www.mplp.io](https://www.mplp.io) — discovery and positioning only
- **Specification & Docs:** [https://docs.mplp.io](https://docs.mplp.io) — authoritative reference surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — authoritative source of truth
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Kernel Duty Baseline

This package mirror carries the same Kernel Duty helper exports as the public
`mplp-sdk` package.

Canonical upstream baseline remains in:

- `schemas/v2/taxonomy/kernel-duties.yaml`
- `governance/05-specialized/entity.json`

---

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package role:** source-side mirror for the public `mplp-sdk` surface
- **Kernel duty baseline:** 11/11 carried in package exports
- **Package compatibility:** aligned to `protocol_version` v1.0.0 only
- Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
