---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Action Execution Layer (AEL) Design

## 1. Relation to L1/L2 Specification
This document is **Non-Normative**. It provides implementation guidance for the [AEL Specification](../../01-architecture/cross-cutting/ael.md). It describes the reference implementation found in `@mplp/reference-runtime`.

## 2. Overview


The AEL abstracts the execution of side-effects, such as calling LLMs or invoking external tools. It provides a unified interface for "doing things" in the runtime, separating intent (Plan) from execution (Action).

## 2. Interface Definition

```typescript
export interface ActionExecutionLayer {
  /**
   * Execute a discrete action.
   * @param action The action definition (type, payload)
   * @returns The result of the execution
   */
  execute(action: Action): Promise<ActionResult>;
}
```

## 3. Reference Implementation: `InMemoryAEL`

The current reference implementation (`@mplp/reference-runtime/ael`) is a lightweight stub designed for testing and simple examples.

-   **Behavior**: Echoes actions or executes simple in-memory logic.
-   **Extensibility**: Designed to be replaced by a robust implementation that delegates to `@mplp/integration-llm-http` or `@mplp/integration-tools-generic`.

## 4. Production Considerations

In a production setup, the AEL is the critical control point for:
-   **Rate Limiting**: Preventing API quota exhaustion.
-   **Cost Tracking**: Monitoring token usage per tenant/user.
-   **Sandboxing**: Running untrusted tool code in isolated environments (e.g., Firecracker microVMs or WASM).
-   **Secret Management**: Injecting API keys at runtime without exposing them to the agent logic.

