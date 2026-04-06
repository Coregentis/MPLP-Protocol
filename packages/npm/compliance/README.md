# @mplp/compliance (Legacy)

> **⚠️ DEPRECATED: This package has been renamed to `@mplp/conformance`.**
>
> Please migrate to the new package for correct terminology alignment with MPLP governance.

**Protocol:** MPLP v1.0.0 (Frozen)  
**License:** Apache-2.0

---

## Migration Guide

This package is now **legacy**. Please use `@mplp/conformance` instead:

```bash
npm uninstall @mplp/compliance
npm install @mplp/conformance
```

Update your imports:

```diff
- import { runGoldenFlow01 } from '@mplp/compliance';
+ import { runGoldenFlow01 } from '@mplp/conformance';
```

The API is fully compatible - only the package name has changed.

## Contract Mode

This package remains a **deprecated public compatibility alias**.
It is not a direct mirror of protocol objects and should not be treated as the preferred public contract surface.

---

## Why the rename?

Per the current MPLP terminology baseline, "**conformance**" is the preferred external term for this package family. "Compliance" remains only as a legacy alias.

---

## Protocol Documentation

*   **Homepage:** [https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp) — discovery and positioning only
*   **Docs Entry Surface:** [https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints) — authoritative documentation entry surface
*   **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) — repository truth source

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**  
Coregentis AI
