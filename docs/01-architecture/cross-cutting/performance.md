---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Cross-Cutting Concern: Performance

## 1. Scope

This document defines the **Performance** cross-cutting concern, which governs the tracking of metrics, resource usage, and costs associated with agent execution.

**Boundaries**:
- **In Scope**: Latency tracking, Token usage, Cost calculation, Resource limits.
- **Out of Scope**: Performance optimization of the runtime itself.

## 2. Normative Definitions

- **Metric**: A measurable quantity (e.g., duration, token count).
- **Cost**: The financial impact of an operation (e.g., USD per token).
- **Budget**: A limit placed on accumulated costs.

## 3. Responsibilities (MUST/SHALL)

1.  **Measurement**: The runtime **MUST** measure the duration of all AEL actions.
2.  **Tracking**: The runtime **SHOULD** track LLM token usage (prompt/completion).
3.  **Budgeting**: The runtime **SHOULD** enforce budget limits and halt execution if exceeded.

## 4. Architecture Structure

Performance is implemented via:
- **L2 Trace Module**: Records spans with duration metadata.
- **L3 Orchestrator**: Enforces budget checks.
- **L4 Adapters**: Report raw usage metrics (e.g., token counts).

## 5. Binding Points

- **Schema**: `mplp-trace.schema.json` (Spans).
- **Events**: `CostAndBudgetEvent`.
- **PSG**: `psg.metrics` (optional).

## 6. Interaction Model

### Cost Tracking Flow
1.  L4 Adapter executes LLM call.
2.  L4 returns result + usage metrics (prompt_tokens, completion_tokens).
3.  L3 calculates cost based on model pricing.
4.  L3 updates accumulated project cost.
5.  L3 checks against Budget.
6.  L3 emits `CostAndBudgetEvent`.

## 7. Versioning & Invariants

- **Invariant**: Accumulated cost must be monotonically increasing.
- **Invariant**: Metrics must be associated with a specific Trace Span or Step.

## 8. Security / Safety Considerations

- **DoS Protection**: Budget limits act as a safeguard against runaway agent loops (financial DoS).
- **Accuracy**: Cost calculations should be treated as estimates unless verified by external billing.

## 9. References

- [L2: Coordination & Governance](../l2-coordination-governance.md)
- [Observability Overview](../../04-observability/mplp-observability-overview.md)
