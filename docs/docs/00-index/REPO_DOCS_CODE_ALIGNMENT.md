---
doc_type: reference
status: active
authority: Documentation Governance
description: ""
title: Repo-Docs-Code Alignment
---

# Repo-Docs-Code Alignment

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 2. L3 Runtime �?Packages

| Runtime Component | Docs Page | Package Path | Status |
|:------------------|:----------|:-------------|:-------|
| **AEL (Action Execution Layer)** | `/docs/runtime/runtime-glue-overview` | `packages/npm/runtime-minimal/` | �?Aligned |
| **VSL (Value State Layer)** | `/docs/runtime/runtime-glue-overview` | `packages/npm/runtime-minimal/` | �?Aligned |
| **PSG (Project Semantic Graph)** | `/docs/runtime/runtime-glue-overview` | `packages/npm/runtime-minimal/` | �?Aligned |

## 4. Golden Flows �?Tests

| Golden Flow | Docs Page | Test Path | Runnable |
|:------------|:----------|:----------|:---------|
| **GF-01: SA Lifecycle** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | �?|
| **GF-02: MAP Coordination** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | �?|
| **GF-03: Drift Detection** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | �?|
| **GF-04: Delta-Intent** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | �?|
| **GF-05: Governance** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | �?|

## 6. Governance

This index MUST be updated whenever:
1. A new schema is added
2. A new package is published
3. A new Golden Flow is defined
4. Documentation claims change