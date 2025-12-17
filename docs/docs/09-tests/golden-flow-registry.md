---
title: Golden Flow Registry
description: Registry of Golden Flows for MPLP v1.0. Lists all normative test
  scenarios (FLOW-01 to FLOW-25) with descriptions, required events, and key PSG
  paths.
keywords:
  - Golden Flow Registry
  - MPLP test flows
  - test scenarios
  - normative tests
  - protocol compliance
  - flow specifications
  - test catalog
sidebar_label: Golden Flow Registry
doc_status: normative
doc_role: test_spec
protocol_version: 1.0.0
spec_level: CrossCutting
normative_id: MPLP-TEST-GOLDEN
permalink: /tests/golden-flow-registry
normative_refs: []
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs:
    - local_path: tests/golden/flows/sa-flow-02-step-evaluation
      binding: mention
    - local_path: tests/golden/flows/sa-flow-01-basic
      binding: mention
    - local_path: tests/golden/flows/map-flow-02-broadcast-fanout
      binding: mention
    - local_path: tests/golden/flows/map-flow-01-turn-taking
      binding: mention
    - local_path: tests/golden/flows/flow-05-single-agent-confirm-required
      binding: mention
    - local_path: tests/golden/flows/flow-04-single-agent-llm-enrichment
      binding: mention
    - local_path: tests/golden/flows/flow-03-single-agent-with-tools
      binding: mention
    - local_path: tests/golden/flows/flow-02-single-agent-large-plan
      binding: mention
    - local_path: tests/golden/flows/flow-01-single-agent-plan
      binding: mention
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Golden Flow Registry

This registry documents all Golden Flows in the MPLP v1.0 specification. Flow IDs correspond to actual test directories in `tests/golden/flows/`.

## 1. Registry Overview

| Flow ID | Directory Name | Core Modules | Profile |
|---------|----------------|--------------|---------|
| `flow-01` | `flow-01-single-agent-plan` | Context, Plan, Trace | SA |
| `flow-02` | `flow-02-single-agent-large-plan` | Context, Plan, Trace | SA |
| `flow-03` | `flow-03-single-agent-with-tools` | Extension, Trace | SA |
| `flow-04` | `flow-04-single-agent-llm-enrichment` | Dialog, Trace | SA |
| `flow-05` | `flow-05-single-agent-confirm-required` | Confirm, Trace | SA |
| `sa-flow-01` | `sa-flow-01-basic` | Context, Plan, Trace | SA |
| `sa-flow-02` | `sa-flow-02-step-evaluation` | Context, Plan, Trace | SA |
| `map-flow-01` | `map-flow-01-turn-taking` | Collab, Role, Network | MAP |
| `map-flow-02` | `map-flow-02-broadcast-fanout` | Collab, Network | MAP |

---

## 2. Flow Specifications

### 2.1 flow-01-single-agent-plan
-   **Description**: Basic linear execution of a 3-step plan.
-   **Required Events**: `GraphUpdateEvent`, `RuntimeExecutionEvent`.
-   **Key PSG Paths**: `psg.plans` (read), `psg.execution_traces` (write).

### 2.2 flow-02-single-agent-large-plan
-   **Description**: Stress test with 50+ steps.
-   **Required Events**: Same as flow-01, plus `PipelineStageEvent` for batching.
-   **Key PSG Paths**: `psg.plans` (heavy read).

### 2.3 flow-03-single-agent-with-tools
-   **Description**: Execution invoking external tools via Extension Module.
-   **Required Events**: `RuntimeExecutionEvent` (executor_kind=tool).
-   **Key PSG Paths**: `psg.tool_adapters`.

### 2.4 flow-04-single-agent-llm-enrichment
-   **Description**: Using LLM to enrich context/plan.
-   **Required Events**: `RuntimeExecutionEvent` (executor_kind=llm).
-   **Key PSG Paths**: `psg.dialog_threads`.

### 2.5 flow-05-single-agent-confirm-required
-   **Description**: Human-in-the-loop approval flow.
-   **Required Events**: `GraphUpdateEvent` (Confirm decision).
-   **Key PSG Paths**: `psg.approval_nodes`.

### 2.6 sa-flow-01-basic
-   **Description**: Baseline validation for SA Profile.
-   **Required Events**: SA Profile specific events.
-   **Key PSG Paths**: `psg.profiles.sa`.

### 2.7 sa-flow-02-step-evaluation
-   **Description**: Detailed step-by-step evaluation tracking.
-   **Required Events**: Step status transitions.
-   **Key PSG Paths**: `psg.plans.steps`.

### 2.8 map-flow-01-turn-taking
-   **Description**: Round-robin collaboration between 2 agents.
-   **Required Events**: `MAPSessionStarted`, `MAPTurnDispatched`, `MAPTurnCompleted`.
-   **Key PSG Paths**: `psg.collaboration_sessions`.

### 2.9 map-flow-02-broadcast-fanout
-   **Description**: One-to-many broadcast.
-   **Required Events**: `MAPBroadcastSent`, `MAPBroadcastReceived`.
-   **Key PSG Paths**: `psg.network_topology`.

---

## 3. Directory Structure

Each flow directory follows this structure:

```
tests/golden/flows/{flow-id}/
 README.md        # Flow description and expected behavior
 input/           # Initial state    context.json # Optional    plan.json    # Optional
 expected/        # Expected output
     context.json # Final context state
     plan.json    # Final plan state
```

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
