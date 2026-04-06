# mplp-sdk

**Package Role:** Published PyPI protocol helper package
**Protocol:** MPLP v1.0.0 (Frozen)
**sdk_version:** 1.0.5
**License:** Apache-2.0

The published `mplp-sdk` package currently provides a **minimal Python
protocol helper surface** for MPLP package identity, protocol-version alignment,
and the canonical 11 Kernel Duties.

This package is the public **direct data/helper mirror** for the published
Python surface currently in scope.

Current shipped surface:

- `import mplp`
- `mplp.__version__`
- `mplp.MPLP_PROTOCOL_VERSION`
- `mplp.KERNEL_DUTIES`
- `mplp.KERNEL_DUTY_IDS`
- `mplp.KERNEL_DUTY_NAMES`
- `mplp.KERNEL_DUTY_COUNT`

It does **not** currently ship a full Python SDK, generated models, or a
reference runtime implementation.

---

## Scope & Guarantees (Important)

### What this package provides

- Installable protocol helper package surface for MPLP v1.0.0
- Protocol version alignment with the frozen MPLP protocol specification
- Kernel Duty baseline exports for published Python package consumers

### What this package does NOT provide

- Direct mirror coverage for the full schema bundle
- Full Python SDK models
- Pydantic model set
- Reference runtime implementation
- Golden Flow execution engines

---

## Installation

```bash
pip install mplp-sdk
```

---

## Protocol Documentation

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) — discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) — authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — repository truth source
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Publish Scope

- **Public PyPI surface:** `packages/pypi/mplp-sdk/`
- **Source-side mirror:** `packages/sources/sdk-py/`

This public package surface is intentionally narrower than the TypeScript SDK and
runtime packages, but it now carries the canonical 11-duty baseline for Python consumers.

---

## Kernel Duty Baseline

This package now ships the 11 MPLP Kernel Duties as Python constants:

```python
import mplp

assert mplp.KERNEL_DUTY_COUNT == 11
print(mplp.KERNEL_DUTIES[0])
```

Canonical upstream baseline remains in:

- `schemas/v2/taxonomy/kernel-duties.yaml`
- the public mirror package `@mplp/schema`

---

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Published package version:** 1.0.5
- **Kernel duty baseline:** 11/11 carried in package exports
- **Package compatibility:** aligned to `protocol_version` v1.0.0 only
- Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
