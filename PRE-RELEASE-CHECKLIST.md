# MPLP Protocol Pre-Release Checklist

Use this checklist before every release to ensure the repository remains in a "World-Class" state.

## 1. Repository State
- [ ] **Branch**: Current branch is `main`.
- [ ] **Clean**: `git status` shows no uncommitted changes (no dirty working tree).
- [ ] **Sync**: `git pull origin main` executed to ensure local is up-to-date.
- [ ] **Structure**:
    - [ ] No `dist/`, `build/`, or `node_modules/` in root (should be gitignored).
    - [ ] No temporary scripts (`tmp-*`, `playground.ts`) or loose files in root.
    - [ ] All new protocol assets are in `schemas/`, `docs/`, or `packages/`.

## 2. Specification & Documentation
- [ ] **Schemas**: All schema changes updated in `schemas/v2/`.
- [ ] **Docs**: Documentation in `docs/` reflects the latest changes (fields, examples).
- [ ] **Directory Structure**: `MPLP-v1.0-Directory-Structure.md` matches reality.
- [ ] **Changelog**: `CHANGELOG.md` updated with a new entry for this version (Breaking/Features/Fixes).

## 3. Verification & Testing
- [ ] **Tests**: `pnpm test` (or `npm test`) passes across all packages.
- [ ] **Validation**: `node scripts/validate-schemas.js` (if applicable) passes.
- [ ] **CI**: GitHub Actions for `main` are green.

## 4. NPM Packages (If releasing packages)
- [ ] **Versions**: All `package.json` versions updated to target version (e.g., `1.0.2`).
- [ ] **Dependencies**: Workspace dependencies (e.g., `@mplp/core`) point to the correct version.
- [ ] **Build**: `pnpm -r build` succeeds without errors.

## 5. Release Execution
- [ ] **Tag**: `git tag vX.Y.Z` created locally.
- [ ] **Push**: `git push origin main --tags`.
- [ ] **NPM Publish**: Executed `pnpm -r publish` (or `release.sh`).
- [ ] **GitHub Release**: Created release on GitHub with:
    - [ ] Title: `MPLP vX.Y.Z – <Summary>`
    - [ ] Description: Summary, Highlights, Artifacts links, and Checkmarks.
