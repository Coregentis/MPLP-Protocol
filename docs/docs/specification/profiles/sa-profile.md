---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-SA-001"
sidebar_position: 1

# UI metadata (non-normative; excluded from protocol semantics)
title: Single-Agent Profile (SA)
sidebar_label: SA Profile
description: "MPLP profile specification: Single-Agent Profile (SA). Defines conformance requirements for execution profiles."
---
# Single-Agent Profile (SA)

## Scope

This specification defines the Single-Agent Profile (SA), the minimal constraint set for single-agent execution.

## Non-Goals

This specification does not define scheduling algorithms, execution runtimes, or inter-agent coordination.


## 1. Purpose

The **Single-Agent Profile (SA)** defines the **minimal constraint set** required for executing MPLP in a single-agent context.

It specifies **what MUST hold true**, not **how execution is implemented**.

**Design Principle**: "One agent, one context, one plan → complete traceability"

## 2. Profile Characteristics

- Execution involves **exactly one agent**
- No inter-agent coordination or consensus
- All lifecycle guarantees are enforced locally
- Multi-Agent semantics are explicitly out of scope

## 3. Normative Definition

The normative definition of the SA Profile is declared in:

| Artifact | Location | Role |
|:---|:---|:---|
| **Profile Manifest** | `schemas/v2/profiles/sa-profile.yaml` | Declares enabled modules and constraints |
| **Invariants** | `schemas/v2/invariants/sa-invariants.yaml` | 9 normative invariant rules |
| **Events** | [SA Events](sa-events.md) | 7 mandatory + 1 recommended events |
| **Event Schema** | `schemas/v2/events/mplp-sa-event.schema.json` | Event structure definition |

> [!NOTE]
> **Normative Anchor Design**
> 
> This document acts as a **normative anchor** pointing to the constraint definitions, not a behavioral specification. All invariants and execution semantics are defined in the referenced artifacts.

## 4. Relationship to MAP Profile

| Aspect | SA Profile | MAP Profile |
|:---|:---|:---|
| Agent Count | Exactly 1 | 1 or more |
| Coordination | None | Required (Collab module) |
| Governance | Local | Distributed |
| Consensus | Not applicable | Required |
| Profile Role | **Baseline** | Extension of SA |

## 5. Required Modules

**From**: `schemas/v2/profiles/sa-profile.yaml`

| Module | Requirement | Role |
|:---|:---:|:---|
| Core | REQUIRED | Protocol manifest |
| Context | REQUIRED | World state anchor |
| Plan | REQUIRED | Task decomposition |
| Trace | REQUIRED | Execution audit |
| Role | REQUIRED | Permission boundaries |

## 6. Out of Scope

- Scheduling algorithms
- Execution runtimes
- SDK or framework implementations
- Optimization strategies
- Inter-agent coordination

## 7. Related Documents

**Profiles**:
- [MAP Profile](map-profile.md) — Multi-agent extension
- [SA Events](sa-events.md) — Event specification

**Architecture**:
- [L3 Execution & Orchestration](/docs/specification/architecture)

**Normative Artifacts**:
- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/invariants/sa-invariants.yaml`

---

**Profile Type**: Baseline (required for all MPLP implementations)  
**Required Modules**: Core, Context, Plan, Trace, Role (5)  
**Invariants**: 9 (defined in sa-invariants.yaml)