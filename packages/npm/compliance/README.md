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

---

## Why the rename?

Per MPLP governance terminology standard, "**conformance**" is the correct term for protocol alignment verification. "Compliance" was used historically but has been deprecated in favor of the canonical terminology.

See: [TERMINOLOGY_STANDARD_v1.0.md](https://docs.mplp.io/governance/terminology-standard)

---

## Protocol Documentation (Authoritative)

*   **Homepage:** [https://www.mplp.io](https://www.mplp.io)
*   **Specification & Docs:** [https://docs.mplp.io](https://docs.mplp.io)
*   **Source Repository:** [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)

---

## License

Apache License, Version 2.0

© 2026 **Bangshi Beijing Network Technology Limited Company**  
Coregentis AI