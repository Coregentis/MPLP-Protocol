---
title: Docs Information Architecture Overview
sidebar_label: IA Overview
sidebar_position: 0
---

# Documentation Information Architecture (IA)

> **Status**: FROZEN
> **Version**: 1.0
> **Authority**: Documentation Governance

This page defines **how to read and navigate** the MPLP Documentation.
It does **not** introduce new protocol semantics.

---

## Who This Documentation Is For

The MPLP Docs serve **three distinct reader intents**.
Choose the path that matches your goal.

---

## Path A — Specification Path (Implementers)

**Audience**: Protocol implementers, SDK authors, runtime builders
**Goal**: Correct, complete implementation of MPLP

**Recommended Order**
1. [Architecture](/docs/architecture/architecture-overview) — L1–L4 layer model
2. [Core Modules](/docs/modules/core-module) — 10 module specifications
3. [Schemas](/docs/architecture/schema-conventions) — JSON Schema contracts
4. Cross-Cutting Duties
5. [Golden Flows](/docs/golden-flows) — validation scenarios

**Normative Weight**: High
**Change Sensitivity**: Protocol-level

---

## Path B — Evaluation Path (Enterprises & Auditors)

**Audience**: Enterprises, architects, compliance reviewers
**Goal**: Evaluate governance, safety, and standard alignment

**Recommended Order**
1. [Governance Overview](/docs/governance/GOVERNANCE_STATEMENT) — MPGC structure
2. [Governance Layers](/docs/governance/GOVERNANCE_LAYERS) — Authority boundaries
3. [Standards Mapping](/docs/standards/positioning) — ISO / NIST / W3C
4. [Golden Flows](/docs/golden-flows) — evidence of correctness
5. [Repo-Docs-Code Alignment](/docs/index/REPO_DOCS_CODE_ALIGNMENT) — traceability

**Normative Weight**: Informative / Referential
**Change Sensitivity**: Governance-aware

---

## Path C — Builder Path (SDK & Runtime Users)

**Audience**: Developers using MPLP libraries and runtimes
**Goal**: Build systems on top of MPLP

**Recommended Order**
1. [SDK Overview](/docs/sdk/ts-sdk-guide) — Package structure
2. [Runtime Concepts](/docs/runtime/runtime-glue-overview) — AEL / VSL / PSG
3. [Examples & Recipes](/docs/examples/single-agent-flow) — Practical usage
4. [Golden Flows](/docs/golden-flows) — expected behavior

**Normative Weight**: Mixed
**Change Sensitivity**: Implementation-level

---

## Document Types

| Type | Meaning | Example |
|:-----|:--------|:--------|
| **Normative** | Defines protocol obligations | Module specs, Schemas |
| **Informative** | Explains usage, mapping, or context | Standards mapping, Guides |
| **Reference** | Points to code, tests, or artifacts | Alignment Index, API Reference |

---

## Sidebar Organization

| Section | Content Type | Path |
|:--------|:-------------|:-----|
| Reference | Overview, Glossary, API | `/docs/index` |
| Architecture | L1–L4 specification | `/docs/architecture` |
| Modules | 10 module specs | `/docs/modules` |
| Profiles | SA / MAP | `/docs/profiles` |
| Observability | Trace, Drift | `/docs/observability` |
| Golden Flows | Validation scenarios | `/docs/golden-flows` |
| Runtime | AEL / VSL / PSG | `/docs/runtime` |
| SDK | Package documentation | `/docs/sdk` |
| Examples | Practical recipes | `/docs/examples` |
| Governance | MPGC, policies | `/docs/governance` |
| Standards | ISO, NIST, W3C mapping | `/docs/standards` |

---

This IA is **structural only** and does not modify any existing specification.
