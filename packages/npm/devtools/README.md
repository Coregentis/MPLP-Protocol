# @mplp/devtools

**Protocol:** MPLP v1.0.0 (Frozen)
**License:** Apache-2.0

The **@mplp/devtools** package provides a **developer-tooling convenience surface** for MPLP.
Its public package contract aggregates schema and conformance utilities alongside CLI helpers; it is not a direct protocol object mirror.

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **CLI and developer tooling helpers** aligned with MPLP v1.0.0
* **Convenience aggregation** over schema and conformance utilities
* **Version-aligned package surface** for developer workflows

### ❌ What this package does NOT provide

- ❌ A canonical schema registry or direct protocol object mirror
- ❌ Full execution runtime (LLM orchestration, tool execution)
- ❌ Golden Flow execution engines (Flow-01 ~ Flow-05)
- ❌ Observability pipelines or distributed tracing backends
- ❌ Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

```bash
npm install @mplp/devtools
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
