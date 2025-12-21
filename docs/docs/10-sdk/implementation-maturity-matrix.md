
This document defines the reference support status of MPLP SDKs and language bindings for the v1.0.0 release.

## 1. Maturity Levels

| Level | Definition | Characteristics |
| :--- | :--- | :--- |
| **Reference** | The primary implementation used to validate the protocol. | Full Schema Coverage, Golden Flow Conformance, Semantic Versioning. |
| **Stable** | Stable SDK with full protocol support. | Full Schema Coverage, Runtime Support. |
| **Experimental** | Minimal code to demonstrate concepts. Not a library. | No stability guarantees. |

## 2. Language Matrix

| Language | Package | Status | Distribution |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `@mplp/sdk-ts` | **Reference** | **npm** |
| **Python** | `mplp` | **Reference** | **PyPI** |
| **Go** | `examples/go-basic-flow` | **Experimental** | Source only |
| **Java** | `examples/java-basic-flow` | **Experimental** | Source only |

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
- **Role**: **Reference** SDK with full runtime support.
- **Installation**: `pip install mplp`
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
