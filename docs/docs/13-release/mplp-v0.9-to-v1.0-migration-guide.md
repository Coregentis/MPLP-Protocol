---
title: MPLP v0.9 to v1.0 Migration Guide
description: Guide for migrating from MPLP v0.9 (draft) to v1.0.0 (frozen). Details breaking changes in schemas, field naming, event structure, and SDK updates.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Migration Guide, MPLP v0.9 to v1.0, breaking changes, schema migration, SDK migration, field naming, event structure]
sidebar_label: v0.9 to v1.0 Migration
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Migration Guide: v0.9 to v1.0

**Version**: 1.0.0

## 1. Overview

This guide helps developers migrate from MPLP v0.9 (draft) to v1.0.0 (frozen).

## 2. Breaking Changes

### 2.1 Schema Directory

| v0.9 | v1.0 |
|:---|:---|
| `schemas/v1/` | `schemas/v2/` |

### 2.2 Field Naming

All field names now use `snake_case`:

```diff
- contextId
+ context_id

- planId  
+ plan_id

- createdAt
+ created_at
```

### 2.3 Event Structure

| v0.9 | v1.0 |
|:---|:---|
| Single event schema | 3 Physical / 12 Logical model |
| Flat structure | Hierarchical with `family` field |

## 3. SDK Migration

### 3.1 TypeScript

```diff
- import { Context } from 'mplp-sdk';
+ import { ContextBuilder } from '@mplp/sdk-ts';

- const ctx = new Context({ id: '...' });
+ const ctx = new ContextBuilder().title('...').build();
```

### 3.2 Python

```diff
- from mplp_sdk import Context
+ from mplp.model.context import ContextFrame

- ctx = Context(id='...')
+ ctx = ContextFrame(context_id='...', title='...')
```

## 4. Profile Changes

| v0.9 | v1.0 |
|:---|:---|
| Implicit profiles | Explicit SA and MAP profile specifications |
| No profile validation | Profile-specific event requirements |

## 5. Checklist

- [ ] Update schema imports to `schemas/v2/`
- [ ] Rename all camelCase fields to snake_case
- [ ] Update SDK imports to new package names
- [ ] Test against Golden Flows
- [ ] Update event handlers for new event structure

## 6. Getting Help

- [Release Notes](./mplp-v1.0.0-release-notes.md)
- [Known Issues](./mplp-v1.0.0-known-issues.md)
- [TypeScript SDK Guide](../10-sdk/ts-sdk-guide.md)
- [Python SDK Guide](../10-sdk/py-sdk-guide.md)

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
