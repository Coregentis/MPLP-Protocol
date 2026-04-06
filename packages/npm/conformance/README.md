# @mplp/conformance

**Protocol:** MPLP v1.0.0 (Frozen)  
**License:** Apache-2.0

The **@mplp/conformance** package is the public **compatibility alias surface** for MPLP conformance tooling.
It re-exports the legacy `@mplp/compliance` surface under the preferred terminology.

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **Compatibility alias** for the public MPLP conformance tooling surface
* **Flow-oriented validation utilities** carried through the public alias surface
* **Schema conformance utilities**
* **Runtime-facing helper checks** carried through the legacy surface where applicable

### ❌ What this package does NOT provide

* ❌ An independent protocol object mirror
* ❌ Full execution runtime (LLM orchestration, tool execution)
* ❌ Golden Flow execution engines
* ❌ Protocol SSOT status for runtime concepts such as PSG
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
