# @mplp/conformance

**Protocol:** MPLP v1.0.0 (Frozen)  
**License:** Apache-2.0

The **@mplp/conformance** package provides **Protocol conformance testing and validation utilities** for the
**Multi-Agent Lifecycle Protocol (MPLP)** — the Agent OS Protocol for AI agent systems.

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **Protocol conformance interfaces** aligned with MPLP v1.0.0
* **Golden Flow validation** (Flow-01 through Flow-05)
* **PSG (Protocol State Graph) validation**
* **Schema conformance utilities**

### ❌ What this package does NOT provide

* ❌ Full execution runtime (LLM orchestration, tool execution)
* ❌ Golden Flow execution engines
* ❌ Observability pipelines or distributed tracing backends
* ❌ Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

```bash
npm install @mplp/conformance
```

---

## Migration from @mplp/compliance

This package replaces `@mplp/compliance` with correct terminology.
The API is fully compatible - simply update your import:

```diff
- import { runGoldenFlow01 } from '@mplp/compliance';
+ import { runGoldenFlow01 } from '@mplp/conformance';
```

> **Compatibility Note:** This package is a stable alias of `@mplp/compliance` for v1.0.x.
> The legacy `@mplp/compliance` package remains available but is deprecated.
> Both packages export identical APIs for backward compatibility.

---

## Protocol Documentation (Authoritative)

* **Homepage:** [https://www.mplp.io](https://www.mplp.io)
* **Specification & Docs:** [https://docs.mplp.io](https://docs.mplp.io)
* **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)
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
