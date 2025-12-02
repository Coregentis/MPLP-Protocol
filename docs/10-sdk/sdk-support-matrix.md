---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# SDK Support Matrix (v1.0.0)

This document defines the official support status of MPLP SDKs and language bindings for the v1.0.0 release.

## 1. Support Levels

| Level | Definition | Guarantee |
| :--- | :--- | :--- |
| **Official / Reference** | The primary implementation used to validate the protocol. | Full Schema Coverage, Golden Flow Compliance, Semantic Versioning. |
| **Preview** | Functional but may change. Not yet published to package registries. | Core Schema Coverage, Basic Validation. |
| **Example Only** | Minimal code to demonstrate concepts. Not a library. | No guarantees. |

## 2. Language Matrix

| Language | Artifact | Status | Distribution |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `@mplp/sdk-ts` | **Official / Reference** | npm (planned) / Local Workspace |
| **Python** | `mplp-sdk-py` | **Preview** | Source / Codegen-ready |
| **Go** | `examples/go-basic-flow` | **Example Only** | Source only |
| **Java** | `examples/java-basic-flow` | **Example Only** | Source only |

## 3. Detailed Status

### 3.1 TypeScript (`@mplp/sdk-ts`)
- **Role**: The "Reference Implementation" of MPLP v1.0.0.
- **Features**:
    - Full Type Definitions generated from JSON Schema v2.
    - Ajv-based runtime validation.
    - Builder pattern for Context, Plan, and Events.
- **Usage**: Used by the `reference-runtime` and all Golden Flow tests.

### 3.2 Python (`mplp-sdk-py`)
- **Role**: Secondary binding for cross-language verification.
- **Features**:
    - Pydantic v2 models generated from JSON Schema v2.
    - Validated against Golden Flows.
- **Roadmap**: Targeted for PyPI release in v1.1.

### 3.3 Go & Java
- **Role**: Educational examples.
- **Guidance**: Developers should use these as a starting point to build their own bindings if needed, or wrap the TS/Py SDKs.
