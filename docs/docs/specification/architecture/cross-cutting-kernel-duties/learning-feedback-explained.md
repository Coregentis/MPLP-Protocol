---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-CCK-LEARN-INFO-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: "Learning Feedback — Conceptual Overview"
sidebar_label: "Learning Feedback Explained"
sidebar_position: 8
description: "MPLP architecture documentation: Learning Feedback — Conceptual Overview. Defines structural requirements and layer responsibilities."
authority: protocol
---


# Learning Feedback — Conceptual Overview

> **Audience**: Implementers, ML Engineers
> **Governance Rule**: DGP-30

## 1. What Learning Feedback Refers To

**Learning Feedback** in MPLP refers to the **improvement dimension** that concerns how agent experiences are captured for reinforcement learning and fine-tuning.

Learning Feedback is **not a training pipeline**. It is a **conceptual area** for structured experience capture.

## 2. Conceptual Areas Covered by Learning Feedback

| Conceptual Area | Description |
|:---|:---|
| **Learning Samples** | Relates to structured experience records |
| **User Feedback** | Concerns approval/rejection signals from Confirm |
| **Intent Resolution** | Is involved in intent-to-plan mapping samples |
| **Delta Impact** | Relates to change prediction samples |

## 3. What Learning Feedback Does NOT Do

- ❌ Define training algorithms
- ❌ Mandate specific ML frameworks
- ❌ Prescribe model architectures
- ❌ Define reward functions

## 4. Where Normative Semantics Are Defined

| Normative Source | What It Covers |
|:---|:---|
| **Learning Schemas** (`learning/*.schema.json`) | Sample structures |
| **Learning Invariants** | 12 rules for sample structure |
| **Confirm Module** | User feedback capture |

## 5. Conceptual Relationships

<MermaidDiagram id="ff768c08ae1fcb6d" />

## 6. Reading Path

1. **[Learning Overview](../../../guides/examples/learning-notes/learning-overview.md)**
> **Note**: The Learning Sample Specification is currently under revision.

---

**Governance Rule**: DGP-30
**See Also**: [Learning Feedback Anchor](learning-feedback.md) (Normative)
