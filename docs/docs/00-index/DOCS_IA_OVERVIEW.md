---
doc_type: reference
status: active
authority: Documentation Governance
description: "This page defines **how to read and ..."
canonical: /docs/00-index/DOCS_IA_OVERVIEW
title: Docs Information Architecture Overview
---

# Docs Information Architecture Overview

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## Path A 鈥?Specification Path (Implementers)

**Audience**: Protocol implementers, SDK authors, runtime builders
**Goal**: Correct, complete implementation of MPLP

**Recommended Order**
1. [Architecture](/docs/architecture/architecture-overview) 鈥?L1鈥揕4 layer model
2. [Core Modules](/docs/modules/core-module) 鈥?10 module specifications
3. [Schemas](/docs/architecture/schema-conventions) 鈥?JSON Schema contracts
4. Cross-Cutting Duties
5. [Golden Flows](/docs/golden-flows) 鈥?validation scenarios

**Normative Weight**: High
**Change Sensitivity**: Protocol-level

## Path C 鈥?Builder Path (SDK & Runtime Users)

**Audience**: Developers using MPLP libraries and runtimes
**Goal**: Build systems on top of MPLP

**Recommended Order**
1. [SDK Overview](/docs/sdk/ts-sdk-guide) 鈥?Package structure
2. [Runtime Concepts](/docs/runtime/runtime-glue-overview) 鈥?AEL / VSL / PSG
3. [Examples & Recipes](/docs/examples/single-agent-flow) 鈥?Practical usage
4. [Golden Flows](/docs/golden-flows) 鈥?expected behavior

**Normative Weight**: Mixed
**Change Sensitivity**: Implementation-level

## Sidebar Organization

| Section | Content Type | Path |
|:--------|:-------------|:-----|
| Reference | Overview, Glossary, API | `/docs/index` |
| Architecture | L1鈥揕4 specification | `/docs/architecture` |
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