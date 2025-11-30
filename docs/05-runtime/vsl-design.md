# Value State Layer (VSL) Design

The VSL abstracts state persistence, ensuring the runtime can be stateless while preserving the history of the collaboration.

## Interface

```typescript
export interface ValueStateLayer {
  snapshot(key: string, value: any): Promise<void>;
  appendEvent(event: MplpEvent): Promise<void>;
  getEvents(filter?: EventFilter): Promise<MplpEvent[]>;
}
```

## Reference Implementation: `InMemoryVSL`

The current reference implementation stores state in JavaScript `Map` and Arrays.

-   **Persistence**: Ephemeral (lost on process exit).
-   **Integration**: Can be easily wrapped or replaced to use `@mplp/integration-storage-fs` or `kv` for durability.

## Integration with L4

The VSL is the natural consumer of L4 Storage adapters. A production VSL would use:
-   `@mplp/integration-storage-kv` for fast state lookups.
-   `@mplp/integration-storage-fs` (or S3) for archival of large trace logs.
