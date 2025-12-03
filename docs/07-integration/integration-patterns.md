---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Integration Patterns

This document describes how to combine L3 Runtime components with L4 Integration adapters.

## LLM Integration

**Pattern**: Inject `HttpLlmClient` into AEL.

The AEL can be configured to use `@mplp/integration-llm-http` to fulfill generation requests.
```typescript
const llmClient = new HttpLlmClient({ baseUrl: "..." }, fetch);
// AEL uses llmClient.generate(...)
```

## Tool Execution

**Pattern**: Register Tools with `InMemoryToolExecutor`.

Modules can delegate complex tasks to the Tool Executor.
```typescript
const tools = new InMemoryToolExecutor({
  "calculator": async (payload) => { /* ... */ }
});
// AEL delegates "tool_use" actions to tools.invoke(...)
```

## Storage Persistence

**Pattern**: Back VSL with `JsonFsStorage`.

To make the `InMemoryVSL` durable, it can write to the filesystem.
```typescript
const storage = new JsonFsStorage({ baseDir: "./data" });
// VSL writes snapshots to storage.write(...)
```

These patterns allow developers to compose a custom runtime environment tailored to their infrastructure needs while keeping the core protocol logic unchanged.

## Runtime ↔ SDK Compatibility Guarantees

The `@mplp/reference-runtime` provides strict compatibility guarantees with the official SDKs:

1.  **Output Validity**: All Protocol Objects (Context, Plan, Confirm, Trace) produced by the runtime are guaranteed to pass validation in both TypeScript and Python SDKs.
2.  **Cross-Language Equivalence**: The runtime output, when serialized to JSON, is structurally equivalent across languages (ignoring auto-generated IDs and timestamps).
3.  **Error Consistency**: Runtime errors are mapped to standard `ValidationResult` codes, ensuring consistent error handling logic in both TS and Python clients.

This compatibility is enforced via the `test:runtime-compat` suite in CI.
