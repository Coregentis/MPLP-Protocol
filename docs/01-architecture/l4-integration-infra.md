> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
| :--- | :--- | :--- |
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
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
