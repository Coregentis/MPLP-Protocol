# @mplp/core

**Protocol:** MPLP v1.0.0 (Frozen)
**License:** Apache-2.0

The **@mplp/core** package provides **L1 Core Protocol models and validators** for the
**Multi-Agent Lifecycle Protocol (MPLP)**, a vendor-neutral lifecycle protocol for AI agent systems.

This package is a **derived protocol helper** surface.
It packages protocol-aligned models and validators, but it is not a direct mirror of the full protocol schema bundle.

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **Protocol-aligned helper interfaces** aligned with MPLP `protocol_version` v1.0.0
* **Strict version alignment** with the frozen MPLP protocol specification
* **Type-safe integration surface** for higher-level runtimes and tools

### ❌ What this package does NOT provide

- ❌ Full execution runtime (LLM orchestration, tool execution)
- ❌ Golden Flow execution engines (Flow-01 ~ Flow-05)
- ❌ Observability pipelines or distributed tracing backends
- ❌ Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

```bash
npm install @mplp/core
```

---

## Protocol Documentation

* **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) — discovery and positioning only
* **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) — authoritative documentation entry surface
* **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — repository truth source
* **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Versioning & Compatibility

* **Protocol version:** MPLP v1.0.0 (Frozen)
* **SDK compatibility:** Guaranteed for v1.0.0 only
* Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
