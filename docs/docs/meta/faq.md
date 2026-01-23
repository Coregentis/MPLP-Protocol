---
sidebar_position: 1

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Frequently Asked Questions about MPLP Protocol."
title: FAQ

---

# FAQ


## General

### What is MPLP?

MPLP (Multi-Agent Lifecycle Protocol) is an open standard that defines how AI agents create, execute, and observe plans in a controlled, interoperable manner.

### What problem does MPLP address?

MPLP addresses **protocol-level concerns** such as:
- **Interoperability**: Standardizing agent-to-agent communication
- **Observability**: Defining trace formats for execution history
- **Governance**: Specifying hooks for human-in-the-loop confirmation
- **Portability**: Decoupling agent logic from vendor runtimes

> [!NOTE]
> These are protocol properties, not guarantees of any specific implementation.

### Is MPLP open source?

Yes. The protocol specification and reference implementations are licensed under Apache 2.0.

## Architecture

### What are the protocol layers?

| Layer | Scope |
|:---|:---|
| **L1 Core** | Context, Plan, Confirm, Trace schemas |
| **L2 Coordination** | Role, Dialog, Collab, Network modules |
| **L3 Execution** | Extension, Learning modules |
| **L4 Integration** | Events and standards for external systems |

> [!IMPORTANT]
> **L3 and L4 describe protocol interaction surfaces, not required runtime components.**
> MPLP does not mandate a specific execution engine or learning system.

### What is the Project Semantic Graph (PSG)?

The PSG is the logical graph model of all protocol objects during execution. It tracks Context, Plan, steps, and their relationships.

### Can I extend MPLP?

Yes. Use the `Extension` module for custom data without breaking compliance.

## Implementation

### Can I modify the schemas?

For FROZEN versions (v1.0.0):
- Breaking changes not allowed
- Additive changes (new optional fields) allowed via Extension module

### How do I verify my implementation?

1. Validate outputs against the **L1 Schemas**
2. Pass the **Golden Test Suite** flows
3. Use the SDK validators

### Which SDKs are available?

> [!NOTE]
> The following SDKs are **reference implementations** maintained by the community.
> Availability does not imply endorsement or completeness.

| SDK | Package | Installation |
|:---|:---|:---|
| TypeScript | `@mplp/sdk-ts` | `npm install @mplp/sdk-ts` |
| Python | `mplp` | `pip install mplp` |

## Support

### Where can I report bugs?

GitHub Issues: https://github.com/coregentis/MPLP-Protocol/issues

### How do I contribute?

See [MIP Process](/docs/evaluation/governance/protocol-governance.md) for protocol changes.