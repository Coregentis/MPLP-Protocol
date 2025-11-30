# Architecture Overview

MPLP v1.0 is designed as a layered protocol stack, separating core semantics (L1), coordination logic (L2), execution runtime (L3), and integration infrastructure (L4).

## Layered Architecture

### L1: Core Protocol
- **Responsibility**: Defines the data model, validation rules, and core types.
- **Implementation**: `packages/core-protocol`
- **Status**: ✅ Complete (Types & Validators generated from Schemas v2).

### L2: Coordination & Governance
- **Responsibility**: Defines interaction flows, event models, and module contracts.
- **Implementation**: `packages/coordination`
- **Status**: ✅ Complete (Flow Contracts, Event Definitions).

### L3: Execution & Orchestration
- **Responsibility**: Provides the runtime engine, state management, and orchestration logic.
- **Implementation**: `packages/reference-runtime`
- **Status**: ✅ Complete (Reference Runtime with Single Agent Flow).

### L4: Integration & Infrastructure
- **Responsibility**: Adapts the protocol to external systems (LLMs, Tools, Storage).
- **Implementation**: `packages/integration/*`
- **Status**: ✅ Complete (Generic adapters for HTTP LLMs, Tools, FS/KV Storage).

## Current Implementation Status

As of Phase P6, the repository contains a fully functional reference implementation of the entire stack (L1-L4) for the **Single Agent Flow**.

- **Runnable Example**: `examples/ts-single-agent-basic` demonstrates the end-to-end flow.
- **Future Work (P7/P8)**:
  - Multi-language SDKs (Python, Go, Java).
  - Advanced Multi-Agent Collaboration flows.
  - Comprehensive "Golden Suite" for conformance testing.
