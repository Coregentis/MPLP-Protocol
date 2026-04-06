# @mplp/schema

**Package Role:** Public npm schema and protocol-baseline package
**Protocol:** MPLP v1.0.0 (Frozen)
**sdk_version:** 1.0.6
**License:** Apache-2.0

The **@mplp/schema** package provides **JSON Schema definitions, validation utilities, and the canonical machine-readable Kernel Duty baseline** for the
**Multi-Agent Lifecycle Protocol (MPLP)**, a vendor-neutral lifecycle protocol for AI agent systems.

This package is the public **direct schema/data mirror** surface for the protocol schema bundle and the public Kernel Duty baseline.

---

## Scope & Guarantees (Important)

### ✅ What this package provides

* **Direct schema/data mirror surface** aligned with MPLP `protocol_version` v1.0.0
* **Strict version alignment** with the frozen MPLP protocol specification
* **Type-safe integration surface** for higher-level runtimes and tools
* **11-duty baseline export** via `KERNEL_DUTIES`, `KERNEL_DUTY_IDS`, `KERNEL_DUTY_NAMES`, and `KERNEL_DUTY_COUNT`

### ❌ What this package does NOT provide

- ❌ Invariant bundles as public package contract
- ❌ Profile bundles as public package contract
- ❌ Full execution runtime (LLM orchestration, tool execution)
- ❌ Golden Flow execution engines (Flow-01 ~ Flow-05)
- ❌ Observability pipelines or distributed tracing backends
- ❌ Production agent orchestration

> These capabilities belong to **reference runtimes and products built *on top of* MPLP**,
> not to the protocol SDK itself.

---

## Installation

```bash
npm install @mplp/schema
```

## Kernel Duty Exports

```typescript
import { KERNEL_DUTIES, KERNEL_DUTY_COUNT } from '@mplp/schema';

console.log(KERNEL_DUTY_COUNT); // 11
console.log(KERNEL_DUTIES[0]);  // { id: 'KD-01', name: 'Coordination', slug: 'coordination' }
```

Raw JSON is also shipped at:

- `schemas/kernel-duties.json`

---

## Protocol Documentation

* **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) — discovery and positioning only
* **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) — authoritative documentation entry surface
* **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — repository truth source
* **Issues:** [https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)

---

## Versioning & Compatibility

* **Protocol version:** MPLP v1.0.0 (Frozen)
* **Schema package version:** 1.0.6
* **Kernel duty baseline:** 11/11 carried in package
* **SDK compatibility:** Guaranteed for v1.0.0 only
* Breaking changes require a new protocol version.

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**
Coregentis AI
