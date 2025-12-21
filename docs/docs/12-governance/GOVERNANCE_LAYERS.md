# Governance Layers

> **Status**: Normative | FROZEN
> **Compliance**: ✅ THREE-ENTRY COMPLIANT
> **Version**: 1.0.0
> **Last Updated**: 2025-12-21

> [!NOTE]
> **Governance Interpretation Notice**
>
> This page explains **how MPLP governance is structured**, not the protocol specification itself.
> For protocol positioning and intent, refer to [mplp.io/governance](https://mplp.io/governance/overview).

To ensure clarity and prevent scope creep, MPLP governance is divided into three distinct layers. Each layer has its own scope, authority, and change process.

## 🧭 How to Use This Section

| Your Goal | Start Here |
|:----------|:-----------|
| **View formal policies** | [Governance Statement](./GOVERNANCE_STATEMENT.md) |
| **Evaluate for investment** | [How to Evaluate MPLP](./HOW_TO_EVALUATE_MPLP.md) |
| **Understand trust model** | [External Trust Overview](./EXTERNAL_TRUST_OVERVIEW.md) |
| **Check compatibility** | [Compatibility Matrix](./compatibility-matrix.md) |

## 1. Protocol Governance (MPGC)
**Authority**: MPLP Protocol Governance Committee (MPGC)
**Scope**:
*   The **Protocol Specification** (L1-L4).
*   **Normative** definitions (Modules, Schemas, Lifecycle).
*   **Compliance** criteria.
*   "What MPLP *is*."

**Change Process**:
*   Requires **RFC** (Request for Comments).
*   Requires **MPGC Voting**.
*   Strict Versioning (Semantic Versioning).
*   **High Friction** to ensure stability.

## 2. Documentation Governance
**Authority**: Documentation Maintainers
**Scope**:
*   **Explanations**, Tutorials, Guides.
*   **Clarifications** of the Protocol (without changing semantics).
*   **Mappings** to external standards (e.g., ISO, NIST).
*   Site structure and navigation.

**Change Process**:
*   Standard Pull Request (PR) review.
*   **Medium Friction** to ensure accuracy.
*   Must align with Protocol semantics but does not require MPGC vote unless it reinterprets a normative rule.

## 3. Website Governance
**Authority**: Website Maintainers
**Scope**:
*   **Protocol Positioning** and Discovery.
*   **SEO** and Machine Readability.
*   **User Experience** (UX) of the entry points.
*   "How MPLP is *presented* as a Reference Surface."

**Change Process**:
*   Standard PR review.
*   **Low Friction** for rapid iteration.
*   **Constraint**: Must never contradict the Protocol or Documentation.

## Interaction Model

| Scenario | Layer 1 (Protocol) | Layer 2 (Docs) | Layer 3 (Website) |
| :--- | :--- | :--- | :--- |
| **New Feature** | Defines the Spec | Explains the Feature | Announces the Feature |
| **Clarification** | No Change | Updates Text | No Change |
| **Rebranding** | No Change | Updates Style | Updates Design |
| **New Standard Alignment** | No Change | Adds Mapping Doc | Adds Badge/Claim |

> [!IMPORTANT]
> **The Website cannot make Protocol promises.**
> Any claim made on the Website (e.g., "ISO Compliant") must be backed by a **Documentation** artifact, which in turn must be traceable to **Protocol** features.
