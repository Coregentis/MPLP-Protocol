---
sidebar_position: 8

doc_type: attestation
normativity: informative
status: active
authority: MPGC
description: "Formal attestation of Learning Module capabilities for MPLP v1.0.0."
title: Learning Attestation v1.0.0

---

:::info[Attestation]

This document mirrors the protocol definition for reference only.
:::

# Learning Attestation v1.0.0

**Protocol**: MPLP v1.0.0 (Frozen)  
**Date**: 2025-12-30  
**Governance**: MPGC

## 1. Truth Sources
The Learning Module implementation is strictly derived from the following **Frozen Truth Sources**:
- **Taxonomy**: `schemas/v2/taxonomy/learning-taxonomy.yaml`
- **Invariants**: `schemas/v2/invariants/learning-invariants.yaml`
- **Schemas**: `schemas/v2/learning/*.schema.json`

## 2. SDK Status
The Reference SDKs have achieved **Full Alignment** with the Learning Module specification.

| Language | Validator | Exporter | Hooks | Version |
|:---|:---|:---|:---|:---|
| **TypeScript** | Full | Full | Full | v1.0.7+ |
| **Python** | Full | Full | Full | v1.0.8+ |

## 3. Evidence
All claims are supported by sealed Evidence Reports:
- **Alignment & Exporter**: [`PDG_ALIGNMENT_EVIDENCE_REPORT_LEARNING.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/project-governance/PDG_ALIGNMENT_EVIDENCE_REPORT_LEARNING.md)
- **Collection Hooks**: [`PDG_ALIGNMENT_EVIDENCE_REPORT_LEARNING_HOOKS.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/project-governance/PDG_ALIGNMENT_EVIDENCE_REPORT_LEARNING_HOOKS.md)

## 4. Disclaimer
This attestation confirms **conformance** to the MPLP v1.0.0 specification based on automated evidence. It does **not** certify the quality of learning outcomes or endorse any specific AI model performance. Learning capabilities are **optional** and disabled by default.
