---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-STD-ISO-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: ISO 42001 Mapping
sidebar_label: ISO 42001 Mapping
sidebar_position: 2
description: "MPLP standards mapping: ISO 42001 Mapping. Relationship to external standards."
authority: none
---

# ISO 42001 Mapping

## Normative Status

> [!IMPORTANT]
> **Informative Only**
> This document is **informative** and **non-normative**.
> All mappings are illustrative only and do not imply certification, endorsement, or compliance with any external standard.

## Scope Limitation

This mapping highlights conceptual correspondences between MPLP constructs and selected ISO themes (e.g. lifecycle governance, auditability).
It does **not** claim that MPLP satisfies, implements, or replaces any ISO standard or certification process.

> [!WARNING]
> **No Automatic Conformance**
> Conformance with MPLP does **not** automatically guarantee Conformance with ISO 42001.
> Organizations must independently verify their Conformance with ISO requirements.

---

## 1. Overview

**ISO/IEC 42001:2023** is the international standard for AI Management Systems (AIMS). This mapping shows how MPLP capabilities support organizations in implementing an AI Management System.

| Standard | Full Title | Scope |
|:---|:---|:---|
| ISO/IEC 42001:2023 | AI Management System | Requirements for establishing, implementing, maintaining and continually improving an AI management system |

---

## 2. MPLP to ISO 42001 Control Mapping

### 2.1 Context of the Organization (Clause 4)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 4.1 Understanding the organization | Context schema captures domain and environment | `mplp-context.schema.json` |
| 4.2 Interested parties | Stakeholder tracking via roles | `requested_by_role`, `decided_by_role` |
| 4.3 Scope of AIMS | Context boundaries define scope | `context.root.domain` |

### 2.2 Leadership (Clause 5)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 5.1 Leadership commitment | Confirm module ensures human oversight | `mplp-confirm.schema.json` |
| 5.2 AI policy | Protocol governance defines policies | `/docs/evaluation/governance` |
| 5.3 Roles and responsibilities | Role bindings in all schemas | `*_by_role` fields |

### 2.3 Planning (Clause 6)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 6.1 Risk assessment | Impact analysis in observability | `impact_analysis` event family |
| 6.2 AI objectives | Plan objectives are required | `plan.objective` |
| 6.3 Planning of changes | Change tracking via trace | `mplp-trace.schema.json` |

### 2.4 Support (Clause 7)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 7.1 Resources | SDK provides implementation tools | `@mplp/sdk-ts`, `mplp` (Python) |
| 7.2 Competence | Role-based permissions | `agent_role` in steps |
| 7.4 Communication | Event emission for transparency | Observability module |
| 7.5 Documented information | Trace provides audit trail | Full trace history |

### 2.5 Operation (Clause 8)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 8.1 Operational planning | Plan schema structures operations | `mplp-plan.schema.json` |
| 8.2 AI system lifecycle | Full lifecycle coverage (L1-L4) | Architecture layers |
| 8.3 Third-party considerations | Integration module | `/docs/specification/integration` |
| 8.4 AI system impact assessment | Delta intent and impact analysis | `delta_intent`, `impact_analysis` |

### 2.6 Performance Evaluation (Clause 9)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 9.1 Monitoring and measurement | Full observability | `/docs/specification/observability` |
| 9.2 Internal audit | Trace provides audit evidence | `mplp-trace.schema.json` |
| 9.3 Management review | Confirm module for approvals | `mplp-confirm.schema.json` |

### 2.7 Improvement (Clause 10)

| ISO 42001 Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 10.1 Nonconformity and corrective action | Status transitions track issues | `status` enums |
| 10.2 Continual improvement | Learning module captures feedback | `schemas/v2/learning/` |

---

## 3. Coverage Summary

| ISO 42001 Clause | Coverage Level | Notes |
|:---|:---|:---|
| Clause 4 (Context) | ✓ Strong | Context schema directly supports |
| Clause 5 (Leadership) | ✓ Strong | Confirm module ensures oversight |
| Clause 6 (Planning) | ✓ Strong | Plan schema with objectives |
| Clause 7 (Support) | ✓ Strong | SDK and observability |
| Clause 8 (Operation) | ✓ Strong | Full lifecycle coverage |
| Clause 9 (Performance) | ✓ Strong | Trace and observability |
| Clause 10 (Improvement) | ✓ Strong | Learning and feedback |

---

## 4. Disclaimer

This mapping is provided for **informational purposes only**. It does not constitute legal advice or certification.

Organizations seeking ISO 42001 certification should:
1. Consult with accredited certification bodies
2. Conduct independent gap analysis
3. Implement additional controls as required

---

**Related Standards**: ISO/IEC 42001:2023  
**See Also**: [NIST AI RMF Mapping](./nist-mapping)
