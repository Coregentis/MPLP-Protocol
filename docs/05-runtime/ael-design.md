# Action Execution Layer (AEL) Design

The AEL abstracts the execution of side-effects, such as calling LLMs or invoking external tools.

## Interface

```typescript
export interface ActionExecutionLayer {
  execute(action: Action): Promise<ActionResult>;
}
```

## Reference Implementation: `InMemoryAEL`

The current reference implementation is a lightweight stub designed for testing and simple examples.

-   **Behavior**: Echoes actions or executes simple in-memory logic.
-   **Extensibility**: Designed to be replaced by a robust implementation that delegates to `@mplp/integration-llm-http` or `@mplp/integration-tools-generic`.

In a production setup, the AEL would be the component responsible for:
-   Rate limiting.
-   Cost tracking.
-   Security sandboxing of tool execution.
