> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
| :--- | :--- |
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
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
