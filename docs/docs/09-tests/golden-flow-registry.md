---
doc_type: reference
status: active
authority: Documentation Governance
description: ""
title: Golden Flow Registry
---

# Golden Flow Registry

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

This registry documents the 5 Normative Golden Flows that every MPLP-conformant runtime MUST pass.

## The 5 Golden Flows

| Flow ID | Name | Focus |
| :--- | :--- | :--- |
| **Flow-01** | **Intent to Plan Transition** | Parsing a raw intent into a structured, valid Plan. |
| **Flow-02** | **Governed Execution** | Executing a plan with full observability and constraints. |
| **Flow-03** | **Multi-Agent Coordination Loop** | Managing handoffs and state sharing between agents. |
| **Flow-04** | **Drift Detection & Recovery** | Detecting when reality diverges from the Plan and fixing it. |
| **Flow-05** | **Runtime Integration & External I/O** | Connecting to external tools, APIs, and file systems. |

## Flow Specifications

### Flow-01 — Intent to Plan Transition
*   **Goal**: Validate that the runtime can accept a `Context` with an `Intent` and produce a valid `Plan`.
*   **Key Modules**: Context, Plan.
*   **Success Criteria**: Plan is schema-valid and logically addresses the Intent.

### Flow-02 — Governed Execution
*   **Goal**: Validate that the runtime can execute a Plan while respecting `Constraints` and emitting `Trace` events.
*   **Key Modules**: Plan, Trace, Core.
*   **Success Criteria**: All steps complete, Trace is generated, Constraints are not violated.

### Flow-03 — Multi-Agent Coordination Loop
*   **Goal**: Validate that multiple agents can collaborate on a single Project.
*   **Key Modules**: Collab, Role, Dialog.
*   **Success Criteria**: Atomic handoffs occur, shared state is maintained, no race conditions.

### Flow-04 — Drift Detection & Recovery
*   **Goal**: Validate that the runtime can detect when the PSG state does not match reality (e.g., file deleted).
*   **Key Modules**: Core, Trace.
*   **Success Criteria**: `DriftDetected` event emitted, Recovery Plan generated.

### Flow-05 — Runtime Integration & External I/O
*   **Goal**: Validate that the runtime can safely invoke external tools and handle I/O.
*   **Key Modules**: Extension, Network.
*   **Success Criteria**: Tool executes successfully, output is captured in PSG, security sandbox holds.