---
sidebar_position: 6

doc_type: governance
normativity: informative
status: frozen
authority: Documentation Governance
description: "Guide for MPLP maintainers covering release process, review guidelines, and frozen specification rules."
title: Maintainer Guide

---

# Maintainer Guide



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