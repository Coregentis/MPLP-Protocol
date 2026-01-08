# mplp-sdk

**Protocol:** MPLP v1.0.0 (Frozen)
**License:** Apache-2.0

The **mplp-sdk** package provides **the Python SDK and reference runtime** for the
**Multi-Agent Lifecycle Protocol (MPLP)** �?the Agent OS Protocol for AI agent systems.

---

## Scope & Guarantees (Important)

### �?What this package provides

* **Protocol-compliant interfaces** aligned with MPLP v1.0.0
* **Strict version alignment** with the frozen MPLP protocol specification
* **Type-safe Pydantic models** for protocol objects
* **Reference runtime implementation** (Minimal)

### �?What this package does NOT provide

* �?Production-grade execution engine
* �?Golden Flow execution engines (Flow-01 ~ Flow-05)
* �?Observability pipelines or distributed tracing backends
* �?Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

\`\`\`bash
pip install mplp-sdk
\`\`\`

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