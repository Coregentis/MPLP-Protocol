---
title: SDK Support Matrix
description: Official support matrix for MPLP SDKs and language bindings
  (v1.0.0). Defines support levels for TypeScript, Python, Go, and Java.
keywords:
  - SDK Support Matrix
  - MPLP SDKs
  - language support
  - TypeScript SDK
  - Python SDK
  - support levels
  - official SDKs
sidebar_label: SDK Support Matrix
doc_status: informative
doc_role: guide
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# SDK Support Matrix (v1.0.0)

This document defines the official support status of MPLP SDKs and language bindings for the v1.0.0 release.

## 1. Support Levels

| Level | Definition | Guarantee |
| :--- | :--- | :--- |
| **Official / Reference** | The primary implementation used to validate the protocol. | Full Schema Coverage, Golden Flow Compliance, Semantic Versioning. |
| **Official** | Production-ready SDK with full protocol support. | Full Schema Coverage, Runtime Support. |
| **Example Only** | Minimal code to demonstrate concepts. Not a library. | No guarantees. |

## 2. Language Matrix

| Language | Package | Status | Distribution |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `@mplp/sdk-ts` | **Official / Reference** | **npm** |
| **Python** | `mplp` | **Official** | **PyPI** |
| **Go** | `examples/go-basic-flow` | **Example Only** | Source only |
| **Java** | `examples/java-basic-flow` | **Example Only** | Source only |

## 3. Detailed Status

### 3.1 TypeScript (`@mplp/sdk-ts`)
- **Role**: The **Reference Implementation** of MPLP v1.0.0.
- **Installation**: `npm install @mplp/sdk-ts`
- **Features**:
    - Full Type Definitions generated from JSON Schema v2.
    - Ajv-based runtime validation.
    - Builder pattern for Context, Plan, and Events.
    - Runtime engine with minimal and full implementations.
- **Usage**: Used by the `reference-runtime` and all Golden Flow tests.

### 3.2 Python (`mplp`)
- **Role**: **Official** SDK with full runtime support.
- **Installation**: `pip install mplp-sdk`
- **Features**:
    - Pydantic v2 models generated from JSON Schema v2.
    - Full `ExecutionEngine` supporting SA and MAP execution modes.
    - Built-in observability with pluggable sinks.
    - 5 Golden Flows verified.
- **Source**: `packages/sdk-py/`

### 3.3 Go & Java
- **Role**: Educational examples.
- **Location**: `examples/go-basic-flow/`, `examples/java-basic-flow/`
- **Guidance**: Developers should use these as a starting point to build their own bindings if needed.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
