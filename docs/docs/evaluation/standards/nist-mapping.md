---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-STD-NIST-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: NIST AI RMF Mapping
sidebar_label: NIST AI RMF Mapping
sidebar_position: 3
description: "MPLP standards mapping: NIST AI RMF Mapping. Relationship to external standards."
authority: none
---

# NIST AI RMF Mapping

## Normative Status

> [!IMPORTANT]
> **Informative Only**
> This document is **informative** and **non-normative**.
> All mappings are illustrative only and do not imply certification, endorsement, or compliance with any external standard.

## Scope Limitation

> [!WARNING]
> **No Automatic Conformance**
> Conformance with MPLP does **not** automatically guarantee Conformance with NIST AI RMF.
> Organizations must independently verify their Conformance with NIST requirements.

---

## 1. Overview

**NIST AI RMF 1.0** is a voluntary framework to better manage risks to individuals, organizations, and society associated with artificial intelligence. This mapping shows how MPLP capabilities support the four core functions of the NIST AI RMF: **GOVERN**, **MAP**, **MEASURE**, and **MANAGE**.

| Standard | Full Title | Scope |
|:---|:---|:---|
| NIST AI 100-1 | AI Risk Management Framework (AI RMF 1.0) | Guidelines for managing risks throughout the AI lifecycle |

---

## 2. MPLP to NIST AI RMF Mapping

### 2.1 GOVERN (Culture of Risk Management)

**NIST Goal**: Cultivate a culture of risk management.

| NIST Function | MPLP Support | MPLP Component |
|:---|:---|:---|
| **GOVERN 1** | Policies and processes | Protocol governance defines policies | `/docs/evaluation/governance` |
| **GOVERN 2** | Accountability structures | Confirm module ensures oversight | `mplp-confirm.schema.json` |
| **GOVERN 3** | Workforce diversity/equity | Role module defines capabilities | `mplp-role.schema.json` |

**MPLP Implementation**:
*   **Protocol-Level Governance**: The `Confirm` module ensures that governance is not an afterthought but a *blocking step* in the execution loop.
*   **Policy-as-Code**: Governance policies are defined in `Context` and enforced by `Confirm`.

### 2.2 MAP (Context Recognition)

**NIST Goal**: Context is recognized and risks are identified.

| NIST Function | MPLP Support | MPLP Component |
|:---|:---|:---|
| **MAP 1** | Context establishment | Context schema defines boundaries | `mplp-context.schema.json` |
| **MAP 2** | Categorization | Role module maps capabilities | `mplp-role.schema.json` |
| **MAP 3** | Risk identification | Impact analysis events | `impact_analysis` |

**MPLP Implementation**:
*   **`Context` Module**: Explicitly defines the operational context, boundaries, and objectives of the agent.
*   **`Role` Module**: Defines capabilities and limitations, mapping agent potential to specific risks.

### 2.3 MEASURE (Risk Assessment)

**NIST Goal**: Risks are assessed, analyzed, and tracked.

| NIST Function | MPLP Support | MPLP Component |
|:---|:---|:---|
| **MEASURE 1** | Methods and metrics | Observability standards | `/docs/specification/observability` |
| **MEASURE 2** | System evaluation | Trace replay & verification | `mplp-trace.schema.json` |
| **MEASURE 3** | Feedback mechanisms | Learning module | `schemas/v2/learning/` |

**MPLP Implementation**:
*   **`Trace` Module**: Provides immutable, replayable logs for measurement and audit.
*   **`Drift Detection`**: Continuously measures deviation from the Plan, providing a quantitative metric for "agent drift".

### 2.4 MANAGE (Risk Prioritization)

**NIST Goal**: Risks are prioritized and acted upon.

| NIST Function | MPLP Support | MPLP Component |
|:---|:---|:---|
| **MANAGE 1** | Risk prioritization | Plan objectives & constraints | `mplp-plan.schema.json` |
| **MANAGE 2** | Risk treatment | Intervention via Confirm | `mplp-confirm.schema.json` |
| **MANAGE 3** | Response and recovery | Plan correction & rollback | `status` transitions |

**MPLP Implementation**:
*   **`Plan` Module**: Allows for the insertion of mitigation steps into the agent's reasoning process.
*   **Governance Shells**: Can halt execution (Manage) if risks exceed thresholds defined in `Confirm`.

---

## 3. Specific Function Alignment

| NIST ID | Function | MPLP Mechanism |
| :--- | :--- | :--- |
| **MAP 1.1** | Context established | `Context` Module (Required) |
| **MEASURE 2.2** | System evaluation | `Trace` Replay & `Drift` Metrics |
| **MANAGE 2.3** | Incident response | `Confirm` (Intervention) & `Plan` (Correction) |

---

## 4. Disclaimer

This mapping is provided for **informational purposes only**. It does not constitute legal advice or certification.

Organizations seeking NIST AI RMF alignment should:
1. Consult with risk management professionals
2. Conduct independent risk assessments
3. Implement additional controls as required

---

**Related Standards**: NIST AI RMF 1.0  
**See Also**: [ISO 42001 Mapping](./iso-mapping)