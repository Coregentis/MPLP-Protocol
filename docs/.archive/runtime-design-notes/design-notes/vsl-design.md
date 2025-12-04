---

# Value State Layer (VSL) Design

## 1. Relation to L1/L2 Specification
This document is **Non-Normative**. It provides implementation guidance for the [VSL Specification](../../01-architecture/cross-cutting/vsl.md). It describes the reference implementation found in `@mplp/reference-runtime`.

## 2. Overview


The VSL abstracts state persistence, ensuring the runtime can be stateless while preserving the history of the collaboration. It acts as the "memory" of the agent.

## 2. Interface Definition

```typescript
export interface ValueStateLayer {
  snapshot(key: string, value: any): Promise<void>;
  appendEvent(event: MplpEvent): Promise<void>;
  getEvents(filter?: EventFilter): Promise<MplpEvent[]>;
}
```

## 3. Reference Implementation: `InMemoryVSL`

The current reference implementation stores state in JavaScript `Map` and Arrays.

-   **Persistence**: Ephemeral (lost on process exit).
-   **Performance**: Extremely fast, suitable for unit tests and short-lived CLI runs.
-   **Integration**: Can be easily wrapped or replaced to use `@mplp/integration-storage-fs` or `kv` for durability.

## 4. Integration with L4

The VSL is the natural consumer of L4 Storage adapters. A production VSL would use:
-   `@mplp/integration-storage-kv` (Redis/DynamoDB) for fast state lookups and locking.
-   `@mplp/integration-storage-fs` (S3/GCS) for archival of large trace logs and artifacts.

## 5. Future Evolution

Future versions of the VSL may include:
-   **Vector Store Integration**: For long-term semantic memory.
-   **Graph Database Support**: For native PSG persistence.
