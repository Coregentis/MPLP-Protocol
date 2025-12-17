---
title: FAQ
description: Frequently Asked Questions about MPLP. Covers general information,
  architecture, implementation details, schemas, SDKs, and support resources.
keywords:
  - MPLP FAQ
  - frequently asked questions
  - MPLP architecture
  - protocol layers
  - SDK support
  - implementation guide
  - troubleshooting
sidebar_label: FAQ
doc_status: normative
doc_role: guide
protocol_alignment:
  truth_level: T0D
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
  normativity_scope: docs_governance
  governance_alignment:
    policy_refs:
      - docs/docs/99-meta/frontmatter-policy.md
    process_refs: []
normative_id: MPLP-CORE-FAQ
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Frequently Asked Questions (FAQ)

## General

### What is MPLP?

MPLP (Multi-Agent Lifecycle Protocol) is an open standard that defines how AI agents create, execute, and observe plans in a controlled, interoperable manner.

### What problem does MPLP solve?

MPLP provides:
- **Interoperability**: Agents from different vendors can work together
- **Observability**: Full traceability of agent actions
- **Governance**: Human-in-the-loop confirmation for high-risk actions
- **Portability**: Switch between LLM providers without code changes

### Is MPLP open source?

Yes. MPLP is licensed under Apache 2.0.

## Architecture

### What are the protocol layers?

| Layer | Scope |
|:---|:---|
| **L1 Core** | Context, Plan, Confirm, Trace schemas |
| **L2 Coordination** | Role, Dialog, Collab, Network modules |
| **L3 Execution** | Extension, Learning modules |
| **L4 Integration** | Events and standards for external systems |

### What is the Plan State Graph (PSG)?

The PSG is the in-memory representation of all protocol objects during execution. It tracks Context, Plan, steps, and their relationships.

### Can I extend MPLP?

Yes. Use the `Extension` module for custom data without breaking compliance.

## Implementation

### Can I modify the schemas?

For FROZEN versions (v1.0.0):
- Breaking changes not allowed
- Additive changes (new optional fields) allowed

### How do I verify my implementation?

1. Validate outputs against the **L1 Schemas**
2. Pass the **Golden Test Suite** flows
3. Use the SDK validators

### Which SDKs are available?

| SDK | Package | Installation |
|:---|:---|:---|
| TypeScript | `@mplp/sdk-ts` | `npm install @mplp/sdk-ts` |
| Python | `mplp-sdk` | `pip install mplp-sdk` |

## Support

### Where can I report bugs?

GitHub Issues: https://github.com/coregentis/MPLP-Protocol/issues

### How do I contribute?

See [MIP Process](../12-governance/mip-process.md) for protocol changes.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
