---
sidebar_position: 9
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-TRUST-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: External Governance & Trust Overview
sidebar_label: External Trust Overview
description: "MPLP governance documentation: External Governance & Trust Overview. Governance processes and policies."
authority: Documentation Governance
---

# External Governance & Trust Overview

## What MPLP Is NOT

Before evaluating MPLP, it is important to understand what the protocol explicitly **does not claim to be**:

| MPLP Is NOT | Explanation |
|:---|:---|
| A Product | MPLP is a protocol specification, not a software product |
| A Company | MPLP is governed by an open committee (MPGC), not a corporation |
| A Certification Body | MPLP does not certify vendors or issue compliance badges |
| A Vendor Lock-in | MPLP is vendor-neutral by design |
| A Runtime | MPLP defines semantics, not implementations |

## What MPLP IS

| MPLP IS | Explanation |
|:---|:---|
| An Open Protocol | Freely available specification for AI agent lifecycle management |
| Vendor-Neutral | Any vendor can implement without approval |
| Governed | Changes require formal RFC and MPGC voting |
| Versioned | Semantic versioning with frozen guarantees |
| Observable | All agent actions are traceable by design |

## Trust Model

### Self-Declaration Model

MPLP uses a **self-declaration model** for conformance:

1. **Implementers** declare their own conformance level
2. **MPLP** provides validation tools (schema validators, invariant checkers)
3. **Users** evaluate implementations using MPLP's published criteria
4. **MPGC** does NOT audit, certify, or endorse implementations

### No "MPLP Certified" Claims

## Governance Transparency

| Artifact | Location | Purpose |
|:---|:---|:---|
| Protocol Specification | This documentation site | Definitions |
| Reference Implementation | GitHub repository | SDK and runtime examples |
| Governance Policies | `/12-governance/` | Change processes |
| RFC Archive | `/mips/` | Proposal history |

## How to Evaluate MPLP

For detailed evaluation criteria, see:

- [Evaluation Guide](/docs/guides/evaluation-guide.md)
- [Evidence Model](/docs/evaluation/conformance)
- [Compatibility Matrix](./compatibility-matrix.md)

## Related Documents

- [Governance Constitution](./index.mdx) — Formal governance structure
- [Protocol Governance](./protocol-governance.md) — Proposal submission process