# MPLP Canonical README Template

**Version:** v1.0.0 (Frozen)
**Governance:** MPGC
**Enforcement:** Mandatory for all `@mplp/*` and `mplp-sdk` packages.

---

## Template Structure

```markdown
# [Package Name]

**Protocol:** MPLP v1.0.0 (Frozen)
**License:** Apache-2.0

The **[Package Name]** package provides **[Description]** for the
**Multi-Agent Lifecycle Protocol (MPLP)** — the Agent OS Protocol for AI agent systems.

[Optional: Context/Details about this specific package]

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **Protocol-compliant interfaces** aligned with MPLP v1.0.0
* **Strict version alignment** with the frozen MPLP protocol specification
* **Type-safe integration surface** for higher-level runtimes and tools
* [Package-specific guarantees]

### ❌ What this package does NOT provide

* ❌ Full execution runtime (LLM orchestration, tool execution)
* ❌ Golden Flow execution engines (Flow-01 ~ Flow-05)
* ❌ Observability pipelines or distributed tracing backends
* ❌ Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

\`\`\`bash
npm install [package-name]
# or
pip install [package-name]
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
```

## Terminology Rules

1.  **Protocol Definition**: Must use "**Agent OS Protocol**".
    *   ❌ "Agent OS-level lifecycle specification"
    *   ❌ "Agent OS" (ambiguous)
2.  **Copyright**: Must include full legal entity name.
3.  **Links**: Must point to `mplp.io` and `docs.mplp.io`.