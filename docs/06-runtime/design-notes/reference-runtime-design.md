---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Reference Runtime Design

## 1. Relation to L1/L2 Specification
This document is **Non-Normative**. It provides implementation guidance for the L3 Runtime layer. It describes the architecture of `@mplp/reference-runtime`.

## 2. Overview


The `@mplp/reference-runtime` package implements the L3 execution standard. It serves as the "glue" that binds L1 Schemas, L2 Coordination & Governance, and L4 Integration into a working system.

## 2. Package Structure

```text
src/
  types/          # RuntimeContext, RuntimeResult
  ael/            # Action Execution Layer (InMemoryAEL)
  vsl/            # Value State Layer (InMemoryVSL)
  registry/       # RuntimeModuleRegistry
  orchestrator/   # Flow Orchestrators (single-agent.ts)
  index.ts        # Public API
```

## 3. Core Concepts

### 3.1. RuntimeContext
Holds the transient state of the current execution, including:
-   `ids`: Run ID, correlation ID.
-   `coordination`: References to current Protocol Objects (Context, Plan, etc.).
-   `events`: In-memory buffer of recent events.

### 3.2. RuntimeResult
Standardized output format for all orchestrators:
-   `success`: Boolean status.
-   `output`: The final flow output (e.g., `SingleAgentFlowOutput`).
-   `context`: The final `RuntimeContext`.
-   `error`: Optional error details.

### 3.3. Module Registry
A simple map connecting abstract module names (defined in L2 Flow Contracts) to concrete `ModuleHandler` implementations. This allows the orchestrator to be generic and unaware of specific module logic.

## 4. Design Principles

1.  **Stateless Core**: The runtime logic itself is stateless; all state is pushed to the VSL.
2.  **Dependency Injection**: Modules, AEL, and VSL are injected, allowing for easy mocking and swapping.
3.  **Event Driven**: All significant actions emit events, ensuring observability is built-in, not bolted on.
