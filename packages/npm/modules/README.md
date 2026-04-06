# @mplp/modules

**Protocol:** MPLP v1.0.0 (Frozen)
**License:** Apache-2.0

The **@mplp/modules** package provides a **module helper surface** for MPLP.
It re-exports module-aligned types and also carries convenience profile and dependency helpers; it is not a direct schema mirror.

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **Module-aligned type re-exports** aligned with MPLP v1.0.0
* **Convenience profile helpers** for SA / MAP usage patterns
* **Dependency helper data** for module composition

### ❌ What this package does NOT provide

- ❌ Direct schema or invariant mirrors
- ❌ Full execution runtime (LLM orchestration, tool execution)
- ❌ Golden Flow execution engines (Flow-01 ~ Flow-05)
- ❌ Observability pipelines or distributed tracing backends
- ❌ Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

```bash
npm install @mplp/modules
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
