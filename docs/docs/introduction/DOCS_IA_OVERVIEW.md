---
sidebar_position: 1
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "This page defines how to read and navigate the MPLP documentation site, with recommended reading paths for different audiences."
canonical: /docs/introduction/DOCS_IA_OVERVIEW
title: Docs Information Architecture Overview
---

## Path A — Specification Path (Implementers)

**Audience**: Protocol implementers, SDK authors, runtime builders
**Goal**: Correct, complete implementation of MPLP

**Recommended Order**
1. [Architecture](/docs/specification/architecture) — L1–L4 layer model
2. [Core Modules](/docs/specification/modules/core-module) — 10 module specifications
3. [Schemas](/docs/specification/architecture) — JSON Schema contracts
4. Cross-Cutting Duties
5. [Golden Flows](/docs/evaluation/golden-flows) — validation scenarios

**Normative Weight**: High
**Change Sensitivity**: Protocol-level

## Path B — Governance Path (Contributors & Maintainers)

**Audience**: Project contributors, documentation maintainers, governance committee members
**Goal**: Understand contribution rules, governance policies, and quality standards

**Recommended Order**
1. [Author Rules](/docs/introduction/DOCS_AUTHOR_RULES) — Documentation contribution guidelines
2. Alignment Index (Coming Soon) — Docs-to-code mapping
3. [Protocol Governance](/docs/evaluation/governance/protocol-governance) — MPGC policies
4. [Standards Mapping](/docs/evaluation/standards/positioning) — External standard alignment

**Normative Weight**: Mixed
**Change Sensitivity**: Governance-level

## Path C — Builder Path (SDK & Runtime Users)

**Audience**: Developers using MPLP libraries and runtimes
**Goal**: Build systems on top of MPLP

**Recommended Order**
1. [SDK Overview](/docs/guides/sdk/ts-sdk-guide) — Package structure
2. [Runtime Concepts](/docs/guides/runtime/runtime-glue-overview) — AEL / VSL / PSG
3. [Examples & Recipes](/docs/guides/examples/single-agent-flow) — Practical usage
4. [Golden Flows](/docs/evaluation/golden-flows) — expected behavior

**Normative Weight**: Mixed
**Change Sensitivity**: Implementation-level

## Sidebar Organization

| Section | Content Type | Path |
|:--------|:-------------|:-----|
| Reference | Overview, Glossary, API | `/docs/index` |
| Architecture | L1–L4 specification | `/docs/architecture` |
| Modules | 10 module specs | `/docs/modules` |
| Profiles | SA / MAP | `/docs/profiles` |
| Observability | Trace, Drift | `/docs/observability` |
| Golden Flows | Validation scenarios | `/docs/evaluation/golden-flows/index` |
| Runtime | AEL / VSL / PSG | `/docs/runtime` |
| SDK | Package documentation | `/docs/sdk` |
| Examples | Practical recipes | `/docs/examples` |
| Governance | MPGC, policies | `/docs/governance` |
| Standards | ISO, NIST, W3C mapping | `/docs/standards` |

---

This IA is **structural only** and does not modify any existing specification.