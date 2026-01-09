---
sidebar_position: 7
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-COMPAT-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Compatibility Matrix
sidebar_label: Compatibility Matrix
description: "MPLP governance documentation: Compatibility Matrix. Governance processes and policies."
authority: Documentation Governance
---

# Compatibility Matrix

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
| `@mplp/sdk-ts` | 1.0.x | ✅ | Reference implementation |
| `mplp` (Python) | 1.0.x | ✅ | Full runtime support |

## 4. Cross-Language Interoperability

MPLP ensures protocol objects are compatible across language SDKs:

| Source SDK | Target SDK | Compatibility |
|:---|:---|:---:|
| TypeScript | Python | ✅ JSON serialization |
| Python | TypeScript | ✅ JSON serialization |

## 5. Backward Compatibility Rules

### 5.1 Schema Evolution

| Change Type | Allowed in FROZEN? |
|:---|:---:|
| Add optional field | ✅ (Minor) |
| Add new event type | ✅ (Minor) |
| Remove field | ❌ (Breaking) |
| Change field type | ❌ (Breaking) |
| Rename field | ❌ (Breaking) |

### 5.2 Runtime Compatibility

MPLP runtimes aligned to v1.0.0 are expected to accept all v1.0.x messages without error.

## 6. Version Support Policy

| Version | Support Status | End of Support |
|:---|:---|:---|
| v1.0.x | ✅ Supported | N/A (Ongoing) |
| v0.x | ❌ Deprecated | 2025-12-03 |