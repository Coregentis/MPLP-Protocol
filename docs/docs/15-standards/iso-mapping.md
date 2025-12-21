# ISO Standards Alignment

> **Status**: Informative
> **Version**: 1.0.0
> **Last Updated**: 2025-12-21

> [!NOTE]
> **Interpretation Notice**
>
> This page provides an **informative mapping** between MPLP and ISO standards.
> It does **not** imply certification, compliance, or endorsement.
> For positioning and intent, refer to [mplp.io/standards](https://mplp.io/standards/positioning).

This document defines how the **Multi-Agent Lifecycle Protocol (MPLP)** aligns with relevant ISO standards, specifically regarding AI system lifecycle, governance, and risk management.

## Disclaimer
> [!IMPORTANT]
> MPLP is **designed to facilitate compliance** with these standards but does not constitute a certification in itself. Adopting MPLP provides the *technical primitives* (Trace, Confirm, Plan) required to satisfy the *process obligations* defined by ISO.

## ISO/IEC 42001 (AI Management System)

| ISO Clause | MPLP Module / Duty | Alignment Type | Description |
| :--- | :--- | :--- | :--- |
| **6.1 Actions to address risks** | `Confirm` Module | **Enabler** | The `Confirm` module provides the hook for risk scoring and policy checks before action execution. |
| **8.2 AI System Impact Assessment** | `Trace` Module | **Enabler** | Full replayability allows for post-hoc impact analysis and audit. |
| **9.1 Monitoring, measurement** | `Drift Detection` | **Direct Map** | MPLP's Drift Detection (Cross-Cutting Duty) directly fulfills the requirement for continuous monitoring. |

## ISO/IEC 23053 (AI Systems Framework)

| ISO Concept | MPLP Concept | Alignment |
| :--- | :--- | :--- |
| **AI System Lifecycle** | **Agent Lifecycle** | **Compatible** | MPLP defines a stricter, state-machine-based lifecycle that fits within the broader ISO lifecycle definition. |
| **Controllability** | **Governance Shells** | **Direct Map** | MPLP Governance Shells provide the technical mechanism for controllability. |

## Gap Analysis
* **Organizational Process**: MPLP does not cover human-layer organizational processes (hiring, training) required by ISO.
* **Data Quality**: MPLP assumes data quality is managed by the `Context` provider; it does not enforce data cleaning standards.
