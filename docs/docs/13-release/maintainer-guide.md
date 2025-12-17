---
title: Maintainer Guide
description: Guide for MPLP Protocol repository maintainers. Covers
  responsibilities, release processes for patch/minor/major versions, and frozen
  specification rules.
keywords:
  - Maintainer Guide
  - MPLP maintainers
  - repository management
  - release process
  - semantic versioning
  - frozen specification
  - maintainer responsibilities
sidebar_label: Maintainer Guide
doc_status: normative
doc_role: release
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
      - docs/docs/13-release/editorial-policy.md
    process_refs: []
normative_id: MPLP-CORE-MAINTAINER-GUIDE
sidebar_position: 6
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Maintainer Guide

**Version**: 1.0.0

## 1. Overview

This guide is for maintainers of the MPLP Protocol repository.

## 2. Repository Structure

```
V1.0-release/
 docs/              # Protocol documentation
 schemas/v2/        # JSON Schema definitions (FROZEN)
 packages/          # SDK implementations
 tests/golden/      # Conformance test fixtures
 examples/          # Runnable examples
 scripts/           # Build and maintenance tools
```

## 3. Maintainer Responsibilities

| Area | Responsibility |
|:---|:---|
| **PRs** | Review within 48 hours |
| **Issues** | Triage and label within 7 days |
| **Releases** | Follow semantic versioning |
| **Security** | Respond to reports within 48 hours |

## 4. Release Process

### 4.1 Patch Release (x.x.PATCH)

1. Bug fixes and documentation updates
2. No schema changes
3. Tag: `git tag -a v1.0.x -m "Release v1.0.x"`

### 4.2 Minor Release (x.MINOR.x)

1. Additive features (new optional fields)
2. Backward compatible
3. Update `package.json` versions

### 4.3 Major Release (MAJOR.x.x)

1. Breaking changes (requires new protocol version)
2. Full MIP process required
3. Create new schema directory (`schemas/v3/`)

## 5. Frozen Specification Rules

For FROZEN versions:

- No changes to existing schema fields
- No changes to required/optional status
- Documentation fixes allowed
- SDK bug fixes allowed
- New examples allowed

## 6. Tools

| Script | Purpose |
|:---|:---|
| `scripts/update-frozen-headers.mjs` | Sync FROZEN headers |
| `pnpm test:golden` | Run Golden Flow tests |
| `pnpm build:release` | Build release package |

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
