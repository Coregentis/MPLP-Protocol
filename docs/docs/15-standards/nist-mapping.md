---
doc_type: informative
status: active
authority: Documentation Governance
description: ""
title: NIST AI RMF Mapping
---

# NIST AI RMF Mapping

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## Interpretation Notice

This document provides a mapping between MPLP and external standards. It is informative and does not replace the authoritative text of either specification.

## Non-Claims

Compliance with MPLP does not automatically guarantee compliance with external standards.

This document maps the **Multi-Agent Lifecycle Protocol (MPLP)** to the **NIST AI Risk Management Framework (AI RMF 1.0)**.

## Core Functions Mapping

MPLP provides the *technical substrate* to implement the NIST AI RMF functions.

### 1. GOVERN
**NIST Goal**: Cultivate a culture of risk management.
**MPLP Implementation**:
*   **Protocol-Level Governance**: The `Confirm` module ensures that governance is not an afterthought but a *blocking step* in the execution loop.
*   **Policy-as-Code**: Governance policies are defined in `Context` and enforced by `Confirm`.

### 2. MAP
**NIST Goal**: Context is recognized and risks are identified.
**MPLP Implementation**:
*   **`Context` Module**: Explicitly defines the operational context, boundaries, and objectives of the agent.
*   **`Role` Module**: Defines capabilities and limitations, mapping agent potential to specific risks.

### 3. MEASURE
**NIST Goal**: Risks are assessed, analyzed, and tracked.
**MPLP Implementation**:
*   **`Trace` Module**: Provides immutable, replayable logs for measurement and audit.
*   **`Drift Detection`**: Continuously measures deviation from the Plan, providing a quantitative metric for "agent drift".

### 4. MANAGE
**NIST Goal**: Risks are prioritized and acted upon.
**MPLP Implementation**:
*   **`Plan` Module**: Allows for the insertion of mitigation steps into the agent's reasoning process.
*   **Governance Shells**: Can halt execution (Manage) if risks exceed thresholds defined in `Confirm`.

## Specific Function Alignment

| NIST ID | Function | MPLP Mechanism |
| :--- | :--- | :--- |
| **MAP 1.1** | Context established | `Context` Module (Required) |
| **MEASURE 2.2** | System evaluation | `Trace` Replay & `Drift` Metrics |
| **MANAGE 2.3** | Incident response | `Confirm` (Intervention) & `Plan` (Correction) |

## Non-Goals
*   MPLP does not provide the *content* of the risk policies (e.g., "what is fair").
*   MPLP provides the *mechanism* to enforce them.