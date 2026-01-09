---
sidebar_position: 3
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-VERSION-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Versioning Policy
sidebar_label: Versioning Policy
description: "MPLP governance documentation: Versioning Policy. Governance processes and policies."
authority: Documentation Governance
---

# Versioning Policy


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

| Component | Location | Status |
|:---|:---|:---|
| Protocol Specification | `schemas/v2/` | **FROZEN** |
| JSON Schemas | [`schemas/v2/`](https://github.com/mplp-protocol/mplp/tree/main/schemas/v2) | **FROZEN** |
| TypeScript SDK | [`packages/sources/sdk-ts`](https://github.com/mplp-protocol/mplp/tree/main/packages/sources/sdk-ts) | Stable |
| Python SDK | [`packages/sources/sdk-py`](https://github.com/mplp-protocol/mplp/tree/main/packages/sources/sdk-py) | Stable |

## 5. Breaking Change Policy

For FROZEN protocol versions:

- No changes to existing schema fields
- No changes to required/optional status
- No changes to enum values
- Additive changes allowed (new optional fields)
- Documentation updates allowed

## 6. Version Compatibility

See [Compatibility Matrix](./compatibility-matrix.md) for cross-version compatibility details.