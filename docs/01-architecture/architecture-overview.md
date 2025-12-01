---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP v1.0 Architecture Overview

## 1. Scope

This document defines the high-level architecture of the **Multi-Agent Lifecycle Protocol (MPLP)**. It establishes the four-layer stack (L1–L4) that governs all compliant implementations.

**Boundaries**:
- **In Scope**: Protocol layers, module responsibilities, cross-layer interactions, compliance requirements.
- **Out of Scope**: Internal implementation details of specific runtimes (e.g., TracePilot, Coregentis), except where cited as reference implementations.

## 2. Normative Definitions

The following terms are normative for this specification:

- **L1 (Core Protocol)**: The foundational layer defining data structures (schemas), types, and invariant rules.
- **L2 (Coordination)**: The governance layer defining module interactions, execution profiles (SA/MAP), and event taxonomies.
- **L3 (Execution)**: The runtime layer defining the Project Semantic Graph (PSG), Agent Execution Layer (AEL), and orchestration logic.
- **L4 (Integration)**: The boundary layer defining adapters for external systems (LLMs, Storage, Tools).
- **Module**: A distinct functional unit of the protocol (e.g., Context, Plan, Trace).
- **Profile**: A defined set of execution behaviors (e.g., SA Profile, MAP Profile).

## 3. Responsibilities (MUST/SHALL)

1.  **Layer Separation**: Implementations **MUST** respect the separation of concerns between L1, L2, L3, and L4.
2.  **Schema Compliance**: All data structures **MUST** validate against L1 schemas.
3.  **Event Emission**: Runtimes **MUST** emit observability events as defined in L2/L3.
4.  **PSG Authority**: The Project Semantic Graph (PSG) **MUST** be the single source of truth for project state.
5.  **Vendor Neutrality**: The protocol **SHALL NOT** depend on specific vendors (e.g., OpenAI, GitHub) in its normative definitions.

## 4. Architecture Structure

MPLP is organized into a four-layer stack:

```mermaid
graph TD
    L4[L4: Integration Infrastructure<br/>(Optional Adapters)] --> L3
    L3[L3: Execution & Orchestration<br/>(Runtime Glue, PSG, AEL)] --> L2
    L2[L2: Coordination & Governance<br/>(Modules, Profiles, Events)] --> L1
    L1[L1: Core Protocol<br/>(Schemas, Types, Invariants)]
```

### Layer Breakdown

| Layer | Component | Status | Responsibility |
| :--- | :--- | :--- | :--- |
| **L4** | `packages/integration/*` | ⭕ Optional | Adapters for LLMs, Storage, Tools. |
| **L3** | `packages/reference-runtime` | ✅ Required (Spec) | PSG management, Orchestration, AEL/VSL. |
| **L2** | `packages/coordination` | ✅ Required | Module logic, SA/MAP Profiles, Event Bus. |
| **L1** | `packages/core-protocol` | ✅ Required | JSON Schemas, TypeScript Types, Validators. |

## 5. Binding Points

### 5.1 Schema Binding (L1)
- All layers bind to L1 schemas (`schemas/v2/*.json`).
- **L2 Coordination & Governance** extend L1 types with behavioral logic.
- **L3 PSG** stores data conforming to L1 shapes.

### 5.2 Event Binding (L2/L3)
- **Observability**: 12 Event Families defined in L2 bind to L3 emission points.
- **Integration**: 4 Event Families defined in L4 bind to L3 runtime hooks.

### 5.3 PSG Binding (L3)
- **Module→PSG**: Each L2 module maps to specific PSG nodes/edges (e.g., Plan Module → `psg.plans`).
- **Crosscut→PSG**: Cross-cutting concerns (State Sync, Transaction) bind to PSG operations.

### 5.4 Profile Binding (L2)
- **SA Profile**: Binds to sequential orchestration logic in L3.
- **MAP Profile**: Binds to multi-agent coordination patterns in L3.

## 6. Interaction Model

### Vertical Integration
1.  **Initialization**: L3 Runtime initializes L2 Coordination & Governance and injects L4 Adapters.
2.  **Execution**:
    - User Intent → L3 Orchestrator
    - L3 invokes L2 Module (e.g., Plan)
    - L2 Module validates against L1 Schema
    - L3 updates PSG (State Sync)
    - L3 emits Event (Observability)
    - L3 invokes L4 Adapter (e.g., LLM Call)
3.  **Termination**: L3 finalizes state and flushes events.

### Cross-Cutting Concerns
The architecture defines **9 Cross-Cutting Concerns** that span all layers:
1.  **Coordination**
2.  **Error Handling**
3.  **Event Bus**
4.  **Orchestration**
5.  **Performance**
6.  **Protocol Version**
7.  **Security**
8.  **State Sync**
9.  **Transaction**

## 7. Versioning & Invariants

- **Versioning**: Follows Semantic Versioning (Major.Minor.Patch).
- **Invariants**: Defined in `schemas/v2/invariants/*.yaml`.
- **Breaking Changes**: Any change to L1 Schemas or L2 normative flows requires a Major version bump.

## 8. Security / Safety Considerations

- **Sandboxing**: L3 runtimes **SHOULD** sandbox L4 tool execution.
- **Data Privacy**: PII **SHOULD** be scrubbed before L4 LLM transmission.
- **State Integrity**: PSG **MUST** be protected against corruption via Transaction crosscut.

## 9. References

- [L1: Core Protocol](l1-core-protocol.md)
- [L2: Coordination & Governance](l2-coordination-governance.md)
- [L3: Execution & Orchestration](l3-execution-orchestration.md)
- [L4: Integration Infrastructure](l4-integration-infra.md)
- [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md)
