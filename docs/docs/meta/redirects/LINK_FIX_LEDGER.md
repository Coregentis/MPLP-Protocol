---
doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
sidebar_position: 2
description: "MPLP meta documentation: LINK_FIX_LEDGER. Release and maintenance information."
---

# Link Fix Ledger — B-2

**Version:** B-2  
**Generated:** 2026-01-01  
**Status:** COMPLETE (with known waivers)

---

## Summary

| Metric | Value |
|--------|-------|
| Files Modified | 141 |
| Absolute Path Fixes | 357 |
| Relative Path Fixes | 88 |
| **Total Fixes** | **445** |

---

## Fix Categories

### 1. Absolute Path Replacements (357)

Pattern: `/docs/NN-*` → `/docs/tier/category/`

Applied via `fix_links_b2.mjs`

### 2. Relative Path Replacements (88)

Pattern: `../NN-*` → `../category/` or `/docs/tier/category/`

Applied via `fix_relative_links.mjs`

---

## Known Waivers (Remaining Warnings)

The following warnings remain after B-2 fixes. They are **waived** because:
- They involve complex cross-tier relative paths
- Build succeeds (Exit code: 0)
- Will be addressed in content updates

| File | Warning | Reason |
|------|---------|--------|
| `meta/index/mplp-v1.0-protocol-overview.md` | `../modules/*` | Needs absolute path |
| `meta/release/mplp-v1.0-docs-governance.md` | Various relative | Cross-tier |
| `guides/runtime/ael.md` | `../modules/*` | Needs absolute path |
| `specification/architecture/cross-cutting-kernel-duties/*` | Various | Deep nesting |

### Waiver Policy

- Waivers are temporary (30 days max)
- Each waived link must be fixed or removed
- Build must pass (Exit code: 0)

---

## Scripts

| Script | Purpose |
|--------|---------|
| `fix_links_b2.mjs` | Absolute path fixes |
| `fix_relative_links.mjs` | Relative path fixes |

---

## Verification

```bash
npm run build
# Exit code: 0 ✓
# Generated static files in "build" ✓
```

---

**Closed:** 2026-01-01
