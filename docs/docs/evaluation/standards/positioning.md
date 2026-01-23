---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-STD-POS-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Standards Positioning
sidebar_label: Standards Positioning
sidebar_position: 1
description: "MPLP standards mapping: Standards Positioning. Relationship to external standards."
authority: none
---

# Standards Positioning

## Normative Status

> [!IMPORTANT]
> **Informative Only**
> This document is **informative** and **non-normative**.
> It defines the conceptual relationship between MPLP and external standards.

---

## 1. Overview

MPLP is designed to be the **implementation layer** for high-level AI governance frameworks. While ISO and NIST define *what* should be governed, MPLP defines *how* to record and enforce those governance requirements at the protocol level.

## 2. Standards Mapping

| Standard | Description | Mapping Document |
|:---|:---|:---|
| **ISO/IEC 42001** | AI Management System Standard | [ISO Mapping](./iso-mapping) |
| **NIST AI RMF** | AI Risk Management Framework | [NIST Mapping](./nist-mapping) |
| **EU AI Act** | EU AI Act High-Risk Requirements (Articles 9–15) | [EU AI Act Mapping](./eu-ai-act-mapping) |

## 3. Positioning Principles

1.  **Mechanism, Not Policy**: MPLP provides the *mechanism* (Confirm, Trace) to enforce policies, but does not dictate the *content* of those policies (e.g., "fairness" definitions).
2.  **Complementary, Not Competing**: MPLP works *with* existing standards, providing the technical evidence trail required for audits.
3.  **Vendor Neutral**: MPLP is not tied to any specific model provider or cloud platform, ensuring governance portability.

---

**Related Standards**: ISO 42001, NIST AI RMF