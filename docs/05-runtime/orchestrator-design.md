# Orchestrator Design

The Orchestrator is the heart of the runtime, responsible for driving the execution of Flow Contracts.

## `runSingleAgentFlow`

This orchestrator implements the canonical Single Agent Flow: **Context -> Plan -> Confirm -> Trace**.

### Execution Logic

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

### Error Handling

If any step fails or throws:
1.  Catches the error.
2.  Emits `runtime.error` event.
3.  Returns a `RuntimeResult` with `success: false` and error details.
4.  Does **not** throw, ensuring safe termination.
