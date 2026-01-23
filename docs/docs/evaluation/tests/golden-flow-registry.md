---
sidebar_position: 4
entry_surface: documentation
doc_type: informative
normativity: informative
status: active
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-TEST-REGISTRY-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Golden Flow Registry
sidebar_label: Flow Registry
description: "MPLP test documentation: Golden Flow Registry. Authoritative list of evaluation scenarios."
authority: none
---

# Golden Flow Registry

> [!IMPORTANT]
> **Truth Source:** `tests/golden/flows/*` is authoritative. Any website/docs name drift is a bug.

Golden Flows are **evaluation scenarios**, not conceptual capabilities. Names must match the test directory structure exactly.

## Core v1.0 Compliance Boundary (FLOW-01~05)

| Flow ID | **Name** | Source of Truth | Modules Tested |
| :--- | :--- | :--- | :--- |
| **FLOW-01** | **Single Agent – Happy Path** | `flow-01-single-agent-plan` | Context, Plan |
| **FLOW-02** | **Single Agent – Large Plan** | `flow-02-single-agent-large-plan` | Context, Plan |
| **FLOW-03** | **Single Agent – With Tools** | `flow-03-single-agent-with-tools` | Context, Plan, Extension |
| **FLOW-04** | **Single Agent with LLM Enrichment** | `flow-04-single-agent-llm-enrichment` | Context, Plan, Core |
| **FLOW-05** | **Single Agent with Confirm Required** | `flow-05-single-agent-confirm-required` | Context, Plan, Confirm, Trace |

## Profile-Level Flows

### SA Profile (SA-FLOW-01~02)

| Flow ID | **Name** | Source of Truth | Modules Tested |
| :--- | :--- | :--- | :--- |
| **SA-FLOW-01** | **SA Basic Execution** | `sa-flow-01-basic` | Context, Plan |
| **SA-FLOW-02** | **SA Multi-Step Evaluation** | `sa-flow-02-step-evaluation` | Context, Plan |

### MAP Profile (MAP-FLOW-01~02)

| Flow ID | **Name** | Source of Truth | Modules Tested |
| :--- | :--- | :--- | :--- |
| **MAP-FLOW-01** | **MAP Turn-Taking Session** | `map-flow-01-turn-taking` | Context, Plan, Collab, Role |
| **MAP-FLOW-02** | **MAP Broadcast Fan-out** | `map-flow-02-broadcast-fanout` | Context, Plan, Collab, Role |

---

## Flow Specifications

For detailed specifications of the behavior evaluated by these flows, see:

- [FLOW-01: Single Agent – Happy Path](/docs/evaluation/golden-flows/gf-01)
- [FLOW-02: Single Agent – Large Plan](/docs/evaluation/golden-flows/gf-02)
- [FLOW-03: Single Agent – With Tools](/docs/evaluation/golden-flows/gf-03)
- [FLOW-04: Single Agent with LLM Enrichment](/docs/evaluation/golden-flows/gf-04)
- [FLOW-05: Single Agent with Confirm Required](/docs/evaluation/golden-flows/gf-05)

---

## Governance

- **Golden Flows** = Evaluation scenarios (tests/golden/flows)
- **Protocol Capabilities** = Positioning vocabulary (non-normative)
- These two layers must not be conflated.