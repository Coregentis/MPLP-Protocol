---
sidebar_position: 2

doc_type: governance
normativity: informative
status: frozen
authority: Documentation Governance
description: "Migration guide for upgrading from MPLP v0.9 to v1.0, covering breaking changes, schema updates, and checklist."
title: MPLP v0.9 to v1.0 Migration Guide

---

# MPLP v0.9 to v1.0 Migration Guide



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
- [TypeScript SDK Guide](/docs/guides/sdk/ts-sdk-guide.md)
- [Python SDK Guide](/docs/guides/sdk/py-sdk-guide.md)