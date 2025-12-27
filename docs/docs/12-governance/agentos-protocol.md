---
doc_type: governance
status: frozen
authority: Documentation Governance
description: "**ID**: DGP-XX **Version**: 1.0 **Status**: FROZE..."
canonical: /docs/12-governance/agentos-protocol
title: Agent OS Protocol
---

# Agent OS Protocol

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

## 1. The Agent OS Concept

MPLP is not a standalone operating system, but a **Protocol for Agent Operating Systems**. It defines the semantic interface between the "Kernel" (the runtime) and the "Applications" (the agents).

### 1.1 The Protocol Stack

| Layer | Name | Responsibility |
|:---|:---|:---|
| **L4** | Integration | External tool and API bindings |
| **L3** | Execution | State transitions and orchestration |
| **L2** | Governance | Normative modules (Plan, Trace, Confirm, etc.) |
| **L1** | Core | Primitive types and event schemas |

## 2. OS-Level Obligations

MPLP defines 11 Kernel Duties as canonical lifecycle and governance semantics. An Agent OS鈥揷lass system may be evaluated against these duties for semantic alignment, ensuring agents have predictable lifecycle behavior across different hardware and model backends.

## 3. Reference Implementation

The [Reference Implementation](https://github.com/Coregentis/MPLP-Protocol/tree/main/packages/sources/sdk-ts) provides a baseline for building Agent OS components that adhere to this protocol.