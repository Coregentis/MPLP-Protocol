# Reference Runtime Design

The `@mplp/reference-runtime` package implements the L3 execution standard.

## Structure

```text
src/
  types/          # RuntimeContext, RuntimeResult
  ael/            # Action Execution Layer (InMemoryAEL)
  vsl/            # Value State Layer (InMemoryVSL)
  registry/       # RuntimeModuleRegistry
  orchestrator/   # Flow Orchestrators (single-agent.ts)
  index.ts        # Public API
```

## Core Concepts

### RuntimeContext
Holds the transient state of the current execution, including:
-   `ids`: Run ID, correlation ID.
-   `coordination`: References to current Protocol Objects (Context, Plan, etc.).
-   `events`: In-memory buffer of recent events.

### RuntimeResult
Standardized output format for all orchestrators:
-   `success`: Boolean status.
-   `output`: The final flow output (e.g., `SingleAgentFlowOutput`).
-   `context`: The final `RuntimeContext`.
-   `error`: Optional error details.

### Module Registry
A simple map connecting abstract module names (defined in L2 Flow Contracts) to concrete `ModuleHandler` implementations. This allows the orchestrator to be generic and unaware of specific module logic.
