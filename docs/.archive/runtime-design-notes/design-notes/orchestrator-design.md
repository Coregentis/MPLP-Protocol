---

# Orchestrator Design

## 1. Relation to L1/L2 Specification
This document is **Non-Normative**. It provides implementation guidance for the [Orchestration Specification](../../01-architecture/cross-cutting/orchestration.md). It describes the reference implementation found in `@mplp/reference-runtime`.

## 2. Overview


The Orchestrator is the heart of the runtime, responsible for driving the execution of Flow Contracts. It implements the state machine logic that transitions the system from one stage to the next.

## 2. `runSingleAgentFlow`

This orchestrator implements the canonical Single Agent Flow: **Context -> Plan -> Confirm -> Trace**.

### 2.1. Execution Logic

1.  **Initialization**:
    -   Validates inputs (Flow Contract, Context, Modules, VSL).
    -   Emits `pipeline.start` event.

2.  **Step Execution Loop**:
    -   Iterates through `flow.steps`.
    -   **Pre-Step**:
        -   Resolves the `ModuleHandler` from the registry.
        -   Emits `pipeline.stage.start` event.
        -   Snapshots state to VSL.
    -   **Execution**:
        -   Invokes the handler with current `CoordinationContext`.
        -   Captures output and events.
    -   **Post-Step**:
        -   Updates `RuntimeContext` with new Protocol Objects.
        -   Appends events to VSL.
        -   Emits `pipeline.stage.end` event.

3.  **Completion**:
    -   Emits `pipeline.end` event.
    -   Returns `RuntimeResult` with the collected outputs.

### 2.2. Error Handling Strategy

If any step fails or throws:
1.  **Catch**: The error is caught at the loop level.
2.  **Log**: An `runtime.error` event is emitted with stack trace.
3.  **Halt**: The flow is halted (unless a recovery policy is active).
4.  **Return**: A `RuntimeResult` with `success: false` and error details is returned.
5.  **Safety**: The orchestrator does **not** throw, ensuring the process remains stable.

## 3. Extensibility

The Orchestrator is designed to be:
-   **Module Agnostic**: It doesn't know *how* to plan, it just calls the `Plan` module.
-   **State Agnostic**: It delegates state persistence to the VSL.
-   **Flow Agnostic**: New flows (e.g., Multi-Agent) can be implemented by creating new Orchestrator functions that reuse the same infrastructure.
