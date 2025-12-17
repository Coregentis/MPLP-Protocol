---
title: Release Runbook
description: Standard operating procedure for releasing new versions of MPLP.
  Includes pre-release checklist, version bump instructions, and full release
  procedures for major, minor, and patch versions.
keywords:
  - Release Runbook
  - MPLP release process
  - versioning
  - pre-release checklist
  - release procedure
  - patch release
  - major release
sidebar_label: Release Runbook
doc_status: normative
doc_role: ops
protocol_alignment:
  truth_level: T0D
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
  normativity_scope: docs_governance
  governance_alignment:
    policy_refs:
      - docs/docs/99-meta/frontmatter-policy.md
    process_refs: []
normative_id: MPLP-CORE-RELEASE-RUNBOOK
sidebar_position: 4
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Release Runbook

## 1. Purpose

This runbook defines the standard operating procedure for releasing new versions of MPLP.

## 2. Pre-Release Checklist

- [ ] All tests pass: `pnpm test`
- [ ] Golden Flows pass: `pnpm test:golden`
- [ ] Python tests pass: `pytest`
- [ ] Schema validation: `node scripts/validate-schemas.js`
- [ ] FROZEN headers synced: `node scripts/update-frozen-headers.mjs`

## 3. Version Bump

Update versions in:
- `package.json` (root)
- `packages/sdk-ts/package.json`
- `packages/sdk-py/pyproject.toml`
- `VERSION.txt` (if exists)

## 4. Release Procedure

### 4.1 Full Release (MAJOR/MINOR)

1. Create release branch: `release/v1.x.0`
2. Run all verification steps
3. Update CHANGELOG.md
4. Tag: `git tag -a v1.x.0 -m "Release v1.x.0"`
5. Build: `node scripts/build-release.js`
6. Publish:
   - npm: `npm publish` (in packages/sdk-ts/)
   - PyPI: `python -m build && twine upload dist/*` (in packages/sdk-py/)

### 4.2 Patch Release

1. Branch from `main`
2. Fix bug
3. Run verification (Fast Track)
4. Tag: `git tag -a v1.0.x -m "Patch v1.0.x"`
5. Release

## 5. Post-Release

- [ ] Create GitHub Release with notes
- [ ] Update documentation links
- [ ] Announce to stakeholders

## 6. Key Scripts

| Script | Purpose |
|:---|:---|
| `scripts/build-release.js` | Build release package |
| `scripts/update-frozen-headers.mjs` | Sync FROZEN headers |
| `scripts/validate-schemas.js` | Validate JSON schemas |

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
