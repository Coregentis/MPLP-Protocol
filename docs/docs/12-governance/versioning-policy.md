---
title: Versioning Policy
description: Official Versioning Policy for MPLP. Adheres to Semantic Versioning
  2.0.0 with extensions for protocol lifecycle and breaking changes.
keywords:
  - Versioning Policy
  - MPLP versioning
  - Semantic Versioning
  - protocol lifecycle
  - breaking changes
  - frozen status
sidebar_label: Versioning Policy
doc_status: normative
doc_role: guide
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
normative_id: MPLP-CORE-VERSIONING-POLICY
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Versioning Policy

**Status**: Active
**Version**: 1.0.0

## 1. Overview

MPLP follows [Semantic Versioning 2.0.0](https://semver.org/) with extensions for protocol versioning.

## 2. Version Format

```
MAJOR.MINOR.PATCH
```

| Component | Change Type | Example |
|:---|:---|:---|
| **MAJOR** | Breaking changes to schemas or APIs | 1.0.0 2.0.0 |
| **MINOR** | Backward-compatible additions | 1.0.0 1.1.0 |
| **PATCH** | Bug fixes, documentation updates | 1.0.0 1.0.1 |

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
| Python SDK (`mplp-sdk`) | 1.0.0 | Stable |

## 5. Breaking Change Policy

For FROZEN protocol versions:

- No changes to existing schema fields
- No changes to required/optional status
- No changes to enum values
- Additive changes allowed (new optional fields)
- Documentation updates allowed

## 6. Version Compatibility

See [Compatibility Matrix](./compatibility-matrix.md) for cross-version compatibility details.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
