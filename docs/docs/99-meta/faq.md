---
doc_type: informative
status: active
authority: Documentation Governance
description: ""
title: FAQ
---

# FAQ

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

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
| Python | `mplp` | `pip install mplp` |

## Support

### Where can I report bugs?

GitHub Issues: https://github.com/coregentis/MPLP-Protocol/issues

### How do I contribute?

See [MIP Process](../12-governance/mip-process.md) for protocol changes.