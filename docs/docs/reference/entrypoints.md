---
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Four-entry model anchors for Website, Docs, Repo, and Validation Lab."
sidebar_position: 1
---

# Entry Points — Website, Documentation, Repository, Validation Lab

> **Document Type**: Non-Normative Reference  
> **Purpose**: Anchor closure for four-entry model  

## Four-Entry Model

MPLP information is organized across four authoritative sources, each with a distinct role:

### Website (www.mplp.io)

**Role**: Discovery & Positioning

Conceptual positioning, ecosystem overview, and evaluation entry points.

**Key Anchors**:
- [What is MPLP?](https://www.mplp.io/what-is-mplp) — Definition & disambiguation
- [POSIX Analogy](https://www.mplp.io/posix-analogy) — Conceptual lens (not compatibility)
- [Architecture](https://www.mplp.io/architecture) — High-level overview
- [Entity Card](https://www.mplp.io/assets/geo/mplp-entity.json) — Machine-readable definition

**Not**: Normative specifications, certification programs, or authority claims.

### Documentation (docs.mplp.io)

**Role**: Specification & Reference

Normative requirements, informative explanations, and implementation guidance.

**Key Sections**:
- [Specification](/docs/specification) — Normative protocol requirements
- [Guides](/docs/guides) — Implementation guidance
- [Evaluation](/docs/evaluation) — Conformance & testing
- [Meta](/docs/meta) — Governance & methodology

**Not**: Positioning narratives or marketing claims.

### Validation Lab (lab.mplp.io)

**Role**: Evidence & Adjudication

Evidence-based verdict generation for Lifecycle Guarantees (LG-01~05) using versioned deterministic rulesets.

**Key Anchors**:
- [Lab Site](https://lab.mplp.io) — Evidence adjudication UI
- [Guarantees Overview](https://lab.mplp.io/guarantees) — LG-01~05 summary
- [Rulesets](https://lab.mplp.io/rulesets) — Versioned adjudication rules

**Not**: Protocol semantics definition, certification provider, or implementation adapator.

### Repository (GitHub)

**Role**: Source of Truth

Schemas, tests, governance records, and machine-readable definitions.

**Key Resources**:
- [Schemas](https://github.com/Coregentis/MPLP-Protocol/tree/main/schemas/v2) — JSON Schema definitions (authoritative)
- [Tests](https://github.com/Coregentis/MPLP-Protocol/tree/main/tests/golden/flows) — Golden flows & validators
- [Governance](https://github.com/Coregentis/MPLP-Protocol/tree/main/governance) — Constitutional records
- [Entity Definition](https://github.com/Coregentis/MPLP-Protocol/tree/main/governance/entity) — Canonical entity package

**Not**: Positioning content or tutorials.

## Disambiguation Statements

To prevent semantic misidentification, the following statements apply across all entry points:

1. **MPLP = Multi-Agent Lifecycle Protocol** (not "Multi-Perspective License Protocol")
2. **MPLP is not a software license** and does not define licensing terms
3. **MPLP is not POSIX** (POSIX is used as a conceptual lens only, not a compatibility claim)
4. **No certification program exists** — MPLP does not certify, endorse, or audit implementations

## Where to Start

- **Understanding MPLP**: [What is MPLP?](https://www.mplp.io/what-is-mplp)
- **Reading the Spec**: [Specification](/docs/specification)
- **Implementing**: [SDK Guides](/docs/guides/sdk/ts-sdk-guide)
- **Verifying Conformance**: [Evaluation](/docs/evaluation)
- **Machine-Readable**: [Entity Card](https://www.mplp.io/assets/geo/mplp-entity.json)

## Authority & Truth Source

**Repository schemas and tests are authoritative.**

For normative requirements, always refer to:
1. Specification pages (this documentation)
2. JSON Schema files in `schemas/v2/`
3. Golden flow tests in `tests/golden/flows/`

Website content is for discovery and positioning only.
