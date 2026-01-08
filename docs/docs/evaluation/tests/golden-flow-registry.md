---
sidebar_position: 4
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-TEST-REGISTRY-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Golden Flow Registry
sidebar_label: Flow Registry
description: "MPLP test documentation: Golden Flow Registry. Test suite structure and fixtures."
authority: Documentation Governance
---

# Golden Flow Registry

This registry lists the evaluation flows covered by the Golden Test Suite. For the detailed scenario definitions, refer to [Golden Flows](/docs/evaluation/golden-flows).

## Covered Flows

| Flow ID | Name | Evidence Focus |
| :--- | :--- | :--- |
| **Flow-01** | **Intent to Plan Transition** | Parsing a raw intent into a structured, valid Plan. |
| **Flow-02** | **Governed Execution** | Executing a plan with full observability and constraints. |
| **Flow-03** | **Multi-Agent Coordination Loop** | Managing handoffs and state sharing between agents. |
| **Flow-04** | **Drift Detection & Recovery** | Detecting when reality diverges from the Plan. |
| **Flow-05** | **Runtime Integration & External I/O** | Connecting to external tools and APIs. |

## Flow Specifications

For detailed specifications of the behavior evaluated by these flows, see:

- [GF-01: Single Agent Lifecycle](/docs/evaluation/golden-flows/gf-01)
- [GF-02: Multi-Agent Coordination](/docs/evaluation/golden-flows/gf-02)
- [GF-03: Drift Detection](/docs/evaluation/golden-flows/gf-03)
- [GF-04: Delta Intent](/docs/evaluation/golden-flows/gf-04)
- [GF-05: Governance](/docs/evaluation/golden-flows/gf-05)