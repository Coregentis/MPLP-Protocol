---
title: Compatibility Matrix
description: Official Compatibility Matrix for MPLP protocol versions, SDKs, and schemas. Defines cross-language interoperability and backward compatibility rules.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Compatibility Matrix, MPLP protocol versions, SDK compatibility, schema compatibility, cross-language interoperability, backward compatibility]
sidebar_label: Compatibility Matrix
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Compatibility Matrix

**Status**: Active
**Version**: 1.0.0

## 1. Overview

This document defines compatibility between MPLP protocol versions, SDKs, and schema versions.

## 2. Protocol Schema Compatibility

| Protocol Version | Schema Directory | Schema Version | Status |
|:---|:---|:---|:---|
| v1.0.0 | `schemas/v2/` | 1.0.0 | **Current** |
| v0.x (legacy) | `schemas/v1/` | 0.x | Deprecated |

## 3. SDK Protocol Compatibility

| SDK | Version | Protocol v1.0.0 | Notes |
|:---|:---|:---:|:---|
| `@mplp/sdk-ts` | 1.0.x | | Reference implementation |
| `mplp` (Python) | 1.0.x | | Full runtime support |

## 4. Cross-Language Interoperability

MPLP ensures protocol objects are compatible across language SDKs:

| Source SDK | Target SDK | Compatibility |
|:---|:---|:---:|
| TypeScript Python | | JSON serialization |
| Python TypeScript | | JSON serialization |

## 5. Backward Compatibility Rules

### 5.1 Schema Evolution

| Change Type | Allowed in FROZEN? |
|:---|:---:|
| Add optional field | |
| Add new event type | |
| Remove field | |
| Change field type | |
| Rename field | |

### 5.2 Runtime Compatibility

Runtimes implementing MPLP v1.0.0 MUST:
- Accept all valid v1.0.0 protocol objects
- Ignore unknown fields (open-world assumption)
- Validate against `schemas/v2/` schemas

## 6. Related Documentation

- [Versioning Policy](./versioning-policy.md)
- [Schema Mapping Standard](../10-sdk/schema-mapping-standard.md)

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
