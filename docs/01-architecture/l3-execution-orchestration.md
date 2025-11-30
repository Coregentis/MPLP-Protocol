# L3: Execution & Orchestration

The L3 layer provides the runtime environment for executing MPLP flows. It bridges the static definitions of L1/L2 with the dynamic capabilities of L4.

## Reference Runtime (`@mplp/reference-runtime`)

The reference runtime is a TypeScript implementation of the L3 specification. It is designed to be:
- **Stateless Core**: Logic is separated from state persistence.
- **Pluggable**: Modules and storage backends can be swapped.
- **Observable**: Emits standard MPLP events for all state changes.

### Core Components

1.  **Orchestrator**:
    -   Entry point: `runSingleAgentFlow`.
    -   Executes `FlowContract` steps (Context -> Plan -> Confirm -> Trace).
    -   Manages the lifecycle of the `RuntimeContext`.

2.  **Action Execution Layer (AEL)**:
    -   Interface: `ActionExecutionLayer`.
    -   Implementation: `InMemoryAEL` (Reference).
    -   Responsibility: Executes discrete actions (e.g., LLM calls, Tool invocations) requested by modules.

3.  **Value State Layer (VSL)**:
    -   Interface: `ValueStateLayer`.
    -   Implementation: `InMemoryVSL` (Reference).
    -   Responsibility: Manages the persistence of Protocol Objects (Context, Plan, etc.) and the Event Log.

4.  **Module Registry**:
    -   Maps module names (e.g., "plan", "trace") to executable handlers.
    -   Handlers implement the `ModuleHandler` interface from L2.

## Dependencies

The Reference Runtime strictly depends only on:
-   `@mplp/core-protocol` (L1)
-   `@mplp/coordination` (L2)

It does **not** depend on specific L4 implementations, allowing it to remain vendor-neutral.
