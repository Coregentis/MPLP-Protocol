---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-CCK-TXN-INFO-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: "Transaction — Conceptual Overview"
sidebar_label: "Transaction Explained"
sidebar_position: 22
description: "MPLP architecture documentation: Transaction — Conceptual Overview. Defines structural requirements and layer responsibilities."
authority: protocol
---


# Transaction — Conceptual Overview

> **Audience**: Implementers, Architects, Runtime Authors
> **Governance Rule**: DGP-30

## 1. What Transaction Refers To

**Transaction** in MPLP refers to the **atomicity dimension** that concerns how multi-step state changes can be treated as indivisible units. It relates to VSL transactional interfaces and rollback semantics.

Transaction is **not a database feature**. It is a **conceptual boundary** for atomic state management.

## 2. Conceptual Areas Covered by Transaction

| Conceptual Area | Description |
|:---|:---|
| **Atomic Updates** | Relates to treating multiple changes as one unit |
| **Rollback** | Concerns reverting to previous consistent state |
| **Commit Semantics** | Is involved in finalizing state changes |
| **Compensation** | Relates to undo strategies for complex operations |

## 3. What Transaction Does NOT Do

- ❌ Mandate ACID properties
- ❌ Define distributed transaction protocols
- ❌ Prescribe two-phase commit
- ❌ Require specific isolation levels

## 4. Where Normative Semantics Are Defined

| Normative Source | What It Covers |
|:---|:---|
| **L3 Execution & Orchestration** | Rollback mechanisms, compensation |
| **L1-L4 Architecture Deep Dive** | Atomic state transitions, VSL transactions |

## 5. Conceptual Relationships

<MermaidDiagram id="17d435b8a51f9f7a" />

## 6. Reading Path

1. **[L3 Execution & Orchestration](../l3-execution-orchestration.md)** — Rollback, compensation
2. **[L1-L4 Architecture Deep Dive](../l1-l4-architecture-deep-dive.md)** — Atomic transactions

---

**Governance Rule**: DGP-30
**See Also**: [Transaction Anchor](transaction.md) (Normative)
