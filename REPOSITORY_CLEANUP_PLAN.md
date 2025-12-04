# MPLP Repository Cleanup Plan

This document outlines the target structure for the MPLP repository and the steps to achieve it.

## 1. Target Directory Tree

```text
MPLP-Protocol/
├── .github/                 # CI workflows, templates
├── docs/                    # Protocol documentation
│   ├── 00-index/
│   ├── ...
│   └── 99-meta/
├── examples/                # Minimal runnable examples
├── packages/                # Protocol-related NPM package source
├── schemas/                 # JSON Schema source files (v2/)
├── scripts/                 # Utility scripts (validation, release)
├── tests/                   # Compliance tests
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.txt
├── MPLP-v1.0-Directory-Structure.md
├── PRE-RELEASE-CHECKLIST.md
├── README.md
└── SECURITY.md
```

## 2. Cleanup Actions

The following files and directories will be removed or moved to ensure the repository only contains protocol source, documentation, and verification tools.

### To Remove (Gitignored or Redundant)
- [ ] `dist/` (Root build artifact)
- [ ] `node_modules/` (Root dependencies)
- [ ] `validate_schemas_simple.js` (Redundant, use `scripts/validate-schemas.ts`)
- [ ] `scripts/debug-*.js` (Temporary debug scripts)
- [ ] `scripts/dump-*.ts` (Temporary dump scripts)
- [ ] `scripts/compare-*.ts` (Temporary comparison scripts)

### To Archive (Optional)
- [ ] `docs/.archive/` (Consider moving to a separate `mplp-archive` repo if strict cleanliness is desired)

## 3. Execution Script

Run the following commands to clean the repository:

```bash
# 1. Remove build artifacts and dependencies (should be ignored)
git rm -r --cached dist node_modules packages/*/dist packages/*/node_modules
rm -rf dist node_modules packages/*/dist packages/*/node_modules

# 2. Remove root loose files
git rm validate_schemas_simple.js

# 3. Clean up scripts directory
git rm scripts/debug-*.js scripts/dump-*.ts scripts/compare-*.ts

# 4. Commit changes
git commit -m "chore: clean repository structure for MPLP v1.0.1"
git push origin main
```
