---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# L3: Execution & Orchestration

## 1. Scope

This document defines **L3 (Execution & Orchestration)**, the runtime layer responsible for **state management, agent execution, and process orchestration**. L3 provides the "glue" that binds L2 modules into a coherent running system.

**Boundaries**:
- **In Scope**: Project Semantic Graph (PSG), Agent Execution Layer (AEL), Value State Layer (VSL), Orchestration Logic.
- **Out of Scope**: Specific implementation language (e.g., Node.js vs Python), external tool adapters (L4).

## 2. Normative Definitions

- **Project Semantic Graph (PSG)**: The single source of truth for all project state, represented as a graph of nodes (Context, Plans, Steps) and edges.
- **Agent Execution Layer (AEL)**: The abstraction layer that invokes agents and tools.
- **Value State Layer (VSL)**: The abstraction layer that manages PSG persistence and retrieval.
- **Orchestrator**: The central control loop that drives the execution based on L2 Profiles.

## 3. Responsibilities (MUST/SHALL)

1.  **Single Source of Truth**: L3 **MUST** maintain the PSG as the authoritative state.
2.  **Event Routing**: L3 **MUST** implement an Event Bus to route L2/L4 events.
3.  **Drift Detection**: L3 **SHOULD** detect divergence between the PSG and the actual codebase.
4.  **Rollback**: L3 **SHOULD** support rolling back the PSG to a previous consistent state.
5.  **Sandboxing**: L3 **SHOULD** isolate agent execution to prevent system compromise.

## 4. Architecture Structure

L3 is composed of four key components:

```mermaid
graph TD
    Orchestrator[Orchestrator<br/>(Control Loop)] --> AEL[AEL<br/>(Agent Execution)]
    Orchestrator --> VSL[VSL<br/>(State Management)]
    VSL --> PSG[PSG<br/>(Project Semantic Graph)]
    AEL --> L4[L4 Adapters]
```

### Component Details
| Component | Responsibility | Reference Impl |
| :--- | :--- | :--- |
| **Orchestrator** | Drives the `Context -> Plan -> Execute` loop. | `packages/reference-runtime/orchestrator` |
| **PSG** | Stores state (nodes, edges, metadata). | `packages/reference-runtime/psg` |
| **AEL** | Invokes LLMs and Tools. | `packages/reference-runtime/ael` |
| **VSL** | Persists PSG to storage. | `packages/reference-runtime/vsl` |

## 5. Binding Points

### 5.1 Schema Binding (L1)
- **PSG Nodes** must conform to L1 Module Schemas.
- **AEL Inputs/Outputs** must conform to L1 Tool/Extension Schemas.

### 5.2 Event Binding (L2)
- **Orchestrator** emits `PipelineStageEvent` on stage transitions.
- **VSL** emits `GraphUpdateEvent` on PSG mutations.
- **AEL** emits `RuntimeExecutionEvent` on tool/agent execution.

### 5.3 L4 Binding
- **AEL** binds to L4 `LlmClient` and `ToolExecutor`.
- **VSL** binds to L4 `Storage` adapters.

## 6. Interaction Model

### The Execution Loop
1.  **Load State**: Orchestrator loads current PSG via VSL.
2.  **Determine Next Step**: Orchestrator checks L2 Profile rules to decide next action.
3.  **Execute Action**: Orchestrator invokes AEL (e.g., "Ask Agent to generate Plan").
4.  **Update State**: AEL returns result, Orchestrator updates PSG via VSL.
5.  **Emit Events**: VSL emits `GraphUpdateEvent`, Orchestrator emits `PipelineStageEvent`.
6.  **Repeat**: Loop continues until goal is met or error occurs.

## 7. Versioning & Invariants

- **Runtime Versioning**: L3 runtimes are versioned independently but must declare MPLP Protocol compliance (e.g., "Runtime v2.0 implements MPLP v1.0").
- **State Invariants**: The PSG **MUST** always satisfy L1 invariants before and after every transaction.

## 8. Security / Safety Considerations

- **State Integrity**: VSL **MUST** ensure atomic updates to the PSG to prevent corruption.
- **Execution Isolation**: AEL **SHOULD** run untrusted agent code/tools in a sandbox (e.g., Docker, WASM).
- **Secret Management**: L3 **MUST** scrub secrets from events and logs.

## 9. References

- [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md)
- [Module→PSG Paths](../06-runtime/module-psg-paths.md)
- [Drift Detection Spec](../06-runtime/drift-detection-spec.md)
- [Rollback Spec](../06-runtime/rollback-minimal-spec.md)
