---
title: Golden Flow Registry
description: Registry of Golden Flows for MPLP v1.0. Lists the 5 normative flows (Flow-01 to Flow-05) matching the SOT.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Golden Flow Registry, normative flows, intent to plan, governed execution, multi-agent coordination, drift detection, runtime integration]
sidebar_label: Golden Flow Registry
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Golden Flow Registry

> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **SOT Reference**: README v1.0.0 Section 9 (Golden Flows)

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
