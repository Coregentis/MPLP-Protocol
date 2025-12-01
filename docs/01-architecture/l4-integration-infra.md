---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# L4: Integration Infrastructure

## 1. Scope

This document defines **L4 (Integration Infrastructure)**, the optional boundary layer that connects the abstract MPLP runtime to real-world external systems.

**Boundaries**:
- **In Scope**: LLM Client Adapters, Storage Adapters, Tool Execution Frameworks, Integration Event definitions.
- **Out of Scope**: Core protocol logic (L1/L2), Runtime state management (L3).

## 2. Normative Definitions

- **Adapter**: A software component that translates between MPLP internal interfaces and external APIs.
- **LLM Client**: An adapter for Large Language Model inference services (e.g., OpenAI, Anthropic).
- **Storage Adapter**: An adapter for persisting the PSG (e.g., File System, Key-Value Store).
- **Tool Executor**: An adapter for running external tools (e.g., linters, compilers).

## 3. Responsibilities (MUST/SHALL)

1.  **Isolation**: L4 adapters **MUST** isolate external dependencies from the L3 runtime.
2.  **Interchangeability**: L4 adapters **SHOULD** be interchangeable (e.g., swapping File System for S3) without changing L3 logic.
3.  **Vendor Neutrality**: L4 interfaces **MUST NOT** expose vendor-specific types in their public signatures.
4.  **Event Emission**: L4 adapters **SHOULD** emit `ExternalIntegrationEvent` to track external interactions.

## 4. Architecture Structure

L4 is a collection of pluggable packages:

```mermaid
graph TD
    L3[L3 Runtime] --> LLM[LLM Adapter<br/>(integration/llm-http)]
    L3 --> Storage[Storage Adapter<br/>(integration/storage-fs)]
    L3 --> Tools[Tool Adapter<br/>(integration/tools-generic)]
    LLM --> ExtLLM[External LLM API]
    Storage --> ExtFS[File System / DB]
    Tools --> ExtBin[External Binaries]
```

### Reference Packages
| Package | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `integration/llm-http` | LLM Client | ✅ Reference | HTTP-based client for OpenAI-compatible APIs. |
| `integration/storage-fs` | Storage | ✅ Reference | JSON file system persistence. |
| `integration/storage-kv` | Storage | ✅ Reference | In-memory key-value store. |
| `integration/tools-generic` | Tool Executor | ✅ Reference | Local tool execution framework. |

## 5. Binding Points

### 5.1 Schema Binding (L1)
- L4 adapters use L1 `Extension` schemas for tool definitions.

### 5.2 Event Binding (L2)
- L4 adapters emit `ExternalIntegrationEvent` (defined in L2) to the L3 Event Bus.

### 5.3 L3 Binding
- L4 adapters implement interfaces defined by L3 (e.g., `LlmClient`, `Storage`).
- L4 instances are injected into the L3 Orchestrator at runtime.

## 6. Interaction Model

1.  **Injection**: User configures L3 with specific L4 adapters (e.g., `new Orchestrator({ llm: new HttpLlmClient(...) })`).
2.  **Invocation**: L3 calls L4 interface method (e.g., `llm.complete(prompt)`).
3.  **Translation**: L4 adapter translates call to external API request.
4.  **Execution**: External system processes request.
5.  **Response**: L4 adapter translates external response to MPLP standard format.
6.  **Observability**: L4 emits `ExternalIntegrationEvent` with latency and cost metrics.

## 7. Versioning & Invariants

- **Adapter Versioning**: L4 packages are versioned independently of the protocol.
- **Interface Stability**: The interfaces L4 implements (defined in L3) are stable within a Major protocol version.

## 8. Security / Safety Considerations

- **Credential Management**: L4 adapters **MUST** handle API keys and secrets securely (e.g., via environment variables, not hardcoded).
- **Output Sanitization**: L4 adapters **SHOULD** sanitize external outputs before returning them to L3.
- **Rate Limiting**: L4 adapters **SHOULD** implement rate limiting and backoff to protect external services.

## 9. References

- [Integration Spec](../07-integration/mplp-minimal-integration-spec.md)
- [Integration Event Taxonomy](../07-integration/integration-event-taxonomy.yaml)
- [L3: Execution & Orchestration](l3-execution-orchestration.md)
