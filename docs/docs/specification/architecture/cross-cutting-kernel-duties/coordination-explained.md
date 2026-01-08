---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-CCK-COORD-INFO-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: "Coordination — Conceptual Overview"
sidebar_label: "Coordination Explained"
sidebar_position: 2
description: "MPLP architecture documentation: Coordination — Conceptual Overview. Defines structural requirements and layer responsibilities."
authority: protocol
---


# Coordination — Conceptual Overview

> **Audience**: Implementers, Architects
> **Governance Rule**: DGP-30

## 1. What Coordination Refers To

**Coordination** in MPLP refers to the **multi-agent collaboration dimension** that concerns how multiple agents work together within a session. It spans the Collab, Dialog, Network, and Role modules.

Coordination is **not a standalone module**. It is a **conceptual area** that describes patterns for agent interaction in MAP (Multi-Agent Profile) scenarios.

## 2. Conceptual Areas Covered by Coordination

Coordination **concerns** the following areas:

| Conceptual Area | Description |
|:---|:---|
| **Collab Modes** | Relates to 5 coordination patterns (broadcast, round_robin, orchestrated, swarm, pair) |
| **Participant Management** | Concerns the roster of agents in a session |
| **Turn Semantics** | Is involved in turn dispatch and completion patterns |
| **Inter-Agent Communication** | Relates to Dialog module message threading |
| **Topology** | Concerns Network module role-to-node mappings |

## 3. What Coordination Does NOT Do

- ❌ Define specific coordination algorithms
- ❌ Prescribe agent communication protocols
- ❌ Mandate consensus mechanisms
- ❌ Define leader election strategies

## 4. Where Normative Semantics Are Defined

| Normative Source | What It Covers |
|:---|:---|
| **Collab Module** (`mplp-collab.schema.json`) | Session structure, mode enum, participants |
| **MAP Invariants** (`map-invariants.yaml`) | 9 rules for multi-agent requirements |
| **L2 Coordination & Governance** | Coordination patterns and module interactions |

## 5. Conceptual Relationships

<MermaidDiagram id="a91d9bc3493e7f5a" />

## 6. Reading Path

1. **[Collab Module](../../modules/collab-module.md)** — Session management
2. **[MAP Profile](../../profiles/map-profile.md)** — Multi-agent profile
3. **[L2 Coordination & Governance](../l2-coordination-governance.md)** — Coordination patterns

---

**Governance Rule**: DGP-30
**See Also**: [Coordination Anchor](coordination.md) (Normative)
