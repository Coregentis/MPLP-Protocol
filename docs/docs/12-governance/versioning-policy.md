---
doc_type: governance
status: frozen
authority: Documentation Governance
description: ""
title: Versioning Policy
---

# Versioning Policy

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

**Status**: Active


## 1. Overview

MPLP follows [Semantic Versioning 2.0.0](https://semver.org/) with extensions for protocol versioning.

## 2. Version Format

```
MAJOR.MINOR.PATCH
```

| Component | Change Type | Example |
|:---|:---|:---|
| **MAJOR** | Breaking changes to schemas or APIs | 1.0.0 → 2.0.0 |
| **MINOR** | Backward-compatible additions | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes, documentation updates | 1.0.0 → 1.0.1 |

## 3. Protocol Version Lifecycle

| State | Description |
|:---|:---|
| **Draft** | In development, subject to change |
| **Release Candidate** | Feature complete, testing phase |
| **Frozen** | No breaking changes permitted |
| **Deprecated** | Superseded by newer version |
| **Retired** | No longer supported |

## 4. Current Versions

| Component | Version | Status |
|:---|:---|:---|
| Protocol Specification | 1.0.0 | **FROZEN** |
| JSON Schemas (`schemas/v2/`) | 1.0.0 | **FROZEN** |
| TypeScript SDK (`@mplp/sdk-ts`) | 1.0.3 | Stable |
| Python SDK (`mplp`) | 1.0.0 | Stable |

## 5. Breaking Change Policy

For FROZEN protocol versions:

- No changes to existing schema fields
- No changes to required/optional status
- No changes to enum values
- Additive changes allowed (new optional fields)
- Documentation updates allowed

## 6. Version Compatibility

See [Compatibility Matrix](./compatibility-matrix.md) for cross-version compatibility details.