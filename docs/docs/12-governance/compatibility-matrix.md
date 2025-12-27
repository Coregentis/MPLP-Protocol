---
doc_type: governance
status: frozen
authority: Documentation Governance
description: ""
title: Compatibility Matrix
---

# Compatibility Matrix

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

**Status**: Active


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
| `@mplp/sdk-ts` | 1.0.x | ? | Reference implementation |
| `mplp` (Python) | 1.0.x | ? | Full runtime support |

## 4. Cross-Language Interoperability

MPLP ensures protocol objects are compatible across language SDKs:

| Source SDK | Target SDK | Compatibility |
|:---|:---|:---:|
| TypeScript | Python | ? JSON serialization |
| Python | TypeScript | ? JSON serialization |

## 5. Backward Compatibility Rules

### 5.1 Schema Evolution

| Change Type | Allowed in FROZEN? |
|:---|:---:|
| Add optional field | ? |
| Add new event type | ? |
| Remove field | ? |
| Change field type | ? |
| Rename field | ? |

### 5.2 Runtime Compatibility

MPLP runtimes conformant to v1.0.0 MUST accept all v1.0.x messages without error.