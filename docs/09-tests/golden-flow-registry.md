## 1. Registry Overview

| Flow ID | Name | Core Modules | Profile |
|---------|------|--------------|---------|
| `FLOW-01` | Single Agent Plan | Context, Plan, Trace | SA |
| `FLOW-02` | Single Agent Large Plan | Context, Plan, Trace | SA |
| `FLOW-03` | Single Agent with Tools | Extension, Trace | SA |
| `FLOW-04` | Single Agent LLM Enrichment | Dialog, Trace | SA |
| `FLOW-05` | Single Agent Confirm Required | Confirm, Trace | SA |
| `SA-01` | SA Basic | Context, Plan, Trace | SA |
| `SA-02` | SA Step Evaluation | Context, Plan, Trace | SA |
| `MAP-01` | Turn Taking | Collab, Role, Network | MAP |
| `MAP-02` | Broadcast Fanout | Collab, Network | MAP |

---

## 2. Flow Specifications

### 2.1 FLOW-01: Single Agent Plan
-   **Description**: Basic linear execution of a 3-step plan.
-   **Required Events**: `GraphUpdateEvent`, `RuntimeExecutionEvent`.
-   **Key PSG Paths**: `psg.plans` (read), `psg.execution_traces` (write).

### 2.2 FLOW-02: Single Agent Large Plan
-   **Description**: Stress test with 50+ steps.
-   **Required Events**: Same as FLOW-01, plus `PipelineStageEvent` for batching.
-   **Key PSG Paths**: `psg.plans` (heavy read).

### 2.3 FLOW-03: Single Agent with Tools
-   **Description**: Execution invoking external tools via Extension module.
-   **Required Events**: `RuntimeExecutionEvent` (executor_kind=tool).
-   **Key PSG Paths**: `psg.tool_adapters`.

### 2.4 FLOW-04: Single Agent LLM Enrichment
-   **Description**: Using LLM to enrich context/plan.
-   **Required Events**: `RuntimeExecutionEvent` (executor_kind=llm).
-   **Key PSG Paths**: `psg.dialog_threads`.

### 2.5 FLOW-05: Single Agent Confirm Required
-   **Description**: Human-in-the-loop approval flow.
-   **Required Events**: `GraphUpdateEvent` (Confirm decision).
-   **Key PSG Paths**: `psg.approval_nodes`.

### 2.6 SA-01: SA Basic
-   **Description**: Baseline validation for SA Profile.
-   **Required Events**: SA Profile specific events.
-   **Key PSG Paths**: `psg.profiles.sa`.

### 2.7 SA-02: SA Step Evaluation
-   **Description**: Detailed step-by-step evaluation tracking.
-   **Required Events**: Step status transitions.
-   **Key PSG Paths**: `psg.plans.steps`.

### 2.8 MAP-01: Turn Taking
-   **Description**: Round-robin collaboration between 2 agents.
-   **Required Events**: `MAPSessionStarted`, `MAPTurnDispatched`, `MAPTurnCompleted`.
-   **Key PSG Paths**: `psg.collaboration_sessions`.

### 2.9 MAP-02: Broadcast Fanout
-   **Description**: One-to-many broadcast.
-   **Required Events**: `MAPBroadcastSent`, `MAPBroadcastReceived`.
-   **Key PSG Paths**: `psg.network_topology`.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
