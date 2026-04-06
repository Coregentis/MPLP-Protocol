# @mplp/runtime-minimal

**Package Role:** Public npm runtime package
**Protocol:** MPLP v1.0.0 (Frozen)
**runtime_package_version:** 1.0.5
**License:** Apache-2.0

The `@mplp/runtime-minimal` package provides the published **minimal runtime helper**
surface for MPLP.

It ships runtime interfaces and orchestrator artifacts, but it is not a full
execution platform and it does not replace the `@mplp/sdk-ts` facade.

Its exported AEL / VSL / orchestrator artifacts are **runtime-level helper concepts**.
They must not be read as protocol SSOT objects.

---

## Scope & Guarantees (Important)

### What this package provides

- Minimal runtime interfaces and orchestrator artifacts aligned with MPLP v1.0.0
- AEL/VSL/runtime context artifacts in the published package
- Runtime-focused package surface separated from the `@mplp/sdk-ts` facade

### What this package does NOT provide

- Direct protocol object mirrors for runtime concepts
- Full execution runtime (LLM orchestration, tool execution)
- Golden Flow execution engines (Flow-01 ~ Flow-05)
- Canonical registry of all 11 Kernel Duties
- Production agent orchestration

---

## Installation

```bash
npm install @mplp/runtime-minimal
```

---

## Protocol Documentation

- **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) — discovery and positioning only
- **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) — authoritative documentation entry surface
- **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — repository truth source
- **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Package Provenance

- **Public npm surface:** `packages/npm/runtime-minimal/`
- **Related facade package:** `packages/npm/sdk-ts/`

This package is the published minimal runtime artifact surface. It is not the
protocol truth source and it does not replace the SDK facade package.

---

## Kernel Duty Baseline

This package does **not** ship a standalone machine-readable registry of the
11 MPLP Kernel Duties.

The canonical duty baseline remains in:

- `schemas/v2/taxonomy/kernel-duties.yaml`
- the public mirror package `@mplp/schema`

---

## Versioning & Compatibility

- **Protocol version:** MPLP v1.0.0 (Frozen)
- **Package compatibility:** aligned to `protocol_version` v1.0.0 only
- Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
