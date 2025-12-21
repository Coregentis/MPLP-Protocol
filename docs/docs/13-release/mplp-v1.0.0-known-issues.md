---
title: v1.0.0 Known Issues
description: List of known issues, limitations, and workarounds for MPLP v1.0.0. Covers schema, SDK, runtime, and documentation gaps.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Known Issues, MPLP v1.0.0, limitations, workarounds, schema issues, SDK issues, documentation gaps]
sidebar_label: v1.0.0 Known Issues
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Known Issues v1.0.0

**Version**: 1.0.0
**Last Updated**: 2025-12-03

## 1. Overview

This document tracks known issues, limitations, and workarounds for MPLP v1.0.0.

## 2. Schema Issues

### 2.1 Optional Field Defaults

**Issue**: Some optional fields lack explicit default values in schemas.

**Workaround**: SDK builders provide sensible defaults. Use builders instead of raw object construction.

**Status**: Will be addressed in v1.1.0

## 3. SDK Issues

### 3.1 TypeScript SDK

| Issue | Workaround | Status |
|:---|:---|:---|
| Large plan serialization slow | Use streaming for plans > 100 steps | Investigating |

### 3.2 Python SDK

| Issue | Workaround | Status |
|:---|:---|:---|
| None identified | - | - |

## 4. Runtime Issues

### 4.1 Golden Flow Coverage

| Flow | Status | Notes |
|:---|:---|:---|
| flow-01 to flow-05 | Complete | SA Profile |
| map-flow-01, map-flow-02 | Complete | MAP Profile |
| sa-flow-01, sa-flow-02 | Complete | SA Profile |

## 5. Documentation Gaps

| Area | Status | Notes |
|:---|:---|:---|
| Multi-Agent examples |  Skeleton | Planned for Phase P7 |
| Error recovery examples |  Placeholder | Planned |

## 6. Reporting New Issues

Report issues via GitHub Issues: https://github.com/coregentis/MPLP-Protocol/issues

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
