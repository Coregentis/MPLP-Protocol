---
entry_surface: documentation
entry_model_class: primary
doc_type: reference
normativity: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "DOC-REF-ENTRYPOINTS-001"
authority_scope:
  - specification_projection
  - explanatory_reference
surface_role: canonical
title: "Entry Points — Website, Documentation, Repository, Validation Lab"
description: "Reference overview of MPLP's 3+1 constitutional entry model, four public-facing surfaces, scoped authority model, and Validation_Lab_V2 legal position."
sidebar_position: 1
---

# Entry Points — Website, Documentation, Repository, Validation Lab

> **Document Type**: Non-Normative Reference  
> **Purpose**: Explain MPLP's 3+1 constitutional entry model, four public-facing surfaces, and scoped authority boundaries.

> [!NOTE] Constitutional Source Binding
> This page is a Documentation-surface reference projection of the active constitutional source files:
>
> - [`governance/01-constitutional/CONST-001_ENTRY_MODEL_SPEC.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/governance/01-constitutional/CONST-001_ENTRY_MODEL_SPEC.md)
> - [`governance/01-constitutional/CONST-002_DOCUMENT_FORMAT_SPEC.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/governance/01-constitutional/CONST-002_DOCUMENT_FORMAT_SPEC.md)
> - historical provenance: [`governance/04-records/MPGC-RATIFY-2026-01-22-CONST-001-003.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/governance/04-records/MPGC-RATIFY-2026-01-22-CONST-001-003.md)
>
> If this page diverges from the constitutional source files, the constitutional source files prevail.

MPLP exposes four public-facing surfaces under a 3+1 constitutional entry model.

This reference page is governed under `protocol_version: 1.0.0`. It does not define `validation_lab_release_version` or `validation_ruleset_version`; those remain separate version domains in the version taxonomy manifest.

> [!IMPORTANT] Truth Source vs Official Surfaces
> MPLP has one authoritative truth source for protocol definitions: the
> Repository.
>
> Documentation, Website, and Validation Lab are official MPLP public surfaces
> with bounded roles. They are not co-equal protocol truth sources.

## Truth Source vs Official Public Surfaces

| Classification | Surface(s) | Meaning |
|:---|:---|:---|
| **Authoritative truth source** | Repository | Defines protocol truth, schema truth, invariant truth, and governance source records |
| **Official public surfaces** | Repository, Documentation, Website, Validation Lab | Public entry surfaces operated by MPLP with bounded roles |

## Constitutional Entry Model

MPLP uses a **3+1 constitutional entry model**:

- **Primary constitutional entry classes**
  - Repository
  - Documentation
  - Website

- **Auxiliary constitutional entry class**
  - Validation Lab

Validation Lab is constitutionally recognized, but it is **not** a fourth protocol-defining primary surface.

## Public-Facing Surface Model

MPLP recognizes four official public-facing surfaces:

| Surface | Constitutional Class | Role | Canonical URI |
|:---|:---|:---|:---|
| Website | Primary | Discovery & Positioning | `https://www.mplp.io` |
| Documentation | Primary | Specification & Reference | `https://docs.mplp.io` |
| Repository | Primary | Source of Truth | `https://github.com/Coregentis/MPLP-Protocol` |
| Validation Lab | Auxiliary | Evidence Adjudication | `https://lab.mplp.io` |

These four surfaces are public-facing. They do **not** constitute four equal constitutional primaries, and they do **not** constitute four equal protocol truth sources.

## Scoped Authority Model

MPLP uses a **scoped authority** model rather than a single global authority claim.

### Repository

Authority scope:

- `protocol_truth`
- `schema_truth`
- `invariant_truth`
- `governance_source`

The Repository is the only authoritative truth source for protocol semantics,
schemas, invariants, and governance source records.

### Documentation

Authority scope:

- `specification_projection`
- `normative_reference_projection`
- `explanatory_reference`

Documentation is an official specification/reference surface that projects and
explains protocol truth. It does not supersede repository truth on schemas or
invariants, and it is not a co-equal truth source.

### Validation Lab

Authority scope:

- `evidence_adjudication`
- `ruleset_projection`
- `run_evidence_projection`
- `determination_outputs`

Validation Lab is an official public-facing auxiliary surface for evidence
adjudication. It does not define protocol truth and is not a parallel protocol
truth source.

Validation Lab authority attaches to sealed adjudication artifacts, ruleset-governed outputs, and evidence-linked determinations rather than to descriptive narrative alone.

### Website

Authority scope:

- `discovery`
- `positioning`
- `public_framing`

Website is an official discovery/positioning surface only. It does not define
protocol truth or adjudication truth and is not a co-equal truth source.

## Conflict Interpretation

When two surfaces appear to conflict, interpret them in this order:

1. Check whether both statements are within their valid authority scope.
2. Only if the scope overlap is valid, apply the constitutional conflict order:
   `Repository > Documentation > Validation Lab > Website`

This is not a universal "everything is ranked in one line" rule. It applies only within valid overlapping scope.

## Validation_Lab_V2 Legal Position

`Validation_Lab_V2` is **not** an independent MPLP surface.

It may only be described as one of the following:

- `release_line`
- `migration_line`
- `engineering_track`
- `archive`
- `external_reference`

It must not be described as:

- a new MPLP entry surface
- a new constitutional surface
- a parallel authoritative Validation Lab surface

## Surface Anchors

### Website Anchors

- [What is MPLP?](https://www.mplp.io/what-is-mplp) — Definition & disambiguation
- [POSIX Analogy](https://www.mplp.io/posix-analogy) — Conceptual lens (not compatibility)
- [Architecture](https://www.mplp.io/architecture) — High-level overview
- [Entity Card](https://www.mplp.io/assets/geo/mplp-entity.json) — Machine-readable definition

### Documentation Anchors

- [Specification](/docs/specification) — Normative protocol requirements
- [Guides](/docs/guides) — Implementation guidance
- [Evaluation](/docs/evaluation) — Conformance & testing
- [Meta](/docs/meta) — Governance & methodology

### Validation Lab Anchors

- [Lab Site](https://lab.mplp.io) — Evidence adjudication UI
- [Validation Lab Overview](/docs/evaluation/validation-lab) — Non-normative reference projection
- [Rulesets](/docs/evaluation/validation-lab/rulesets) — Reference projection of Lab ruleset concepts

### Repository Anchors

- [Schemas](https://github.com/Coregentis/MPLP-Protocol/tree/main/schemas/v2) — Repository truth-source anchor for JSON Schema definitions
- [Tests](https://github.com/Coregentis/MPLP-Protocol/tree/main/tests/golden/flows) — Golden flows & validators
- [Governance](https://github.com/Coregentis/MPLP-Protocol/tree/main/governance) — Constitutional records
- [Entity Definition](https://github.com/Coregentis/MPLP-Protocol/blob/main/governance/05-specialized/entity.json) — Canonical machine-readable entity package

## Where to Start

- **Understanding MPLP**: [What is MPLP?](https://www.mplp.io/what-is-mplp)
- **Reading the Spec**: [Specification](/docs/specification)
- **Implementing**: [SDK Guides](/docs/guides/sdk/ts-sdk-guide)
- **Verifying Evidence**: [Validation Lab Overview](/docs/evaluation/validation-lab)
- **Repository Truth Source**: [Schemas](https://github.com/Coregentis/MPLP-Protocol/tree/main/schemas/v2)

## Final Disambiguation

- MPLP has **four public-facing surfaces**
- MPLP has **three primary constitutional entry classes plus one auxiliary constitutional entry class**
- The **Repository alone** is the authoritative truth source for protocol definitions
- Validation Lab is **public-facing** and **auxiliary**
- Validation Lab is **not** a fourth protocol-defining primary
- `Validation_Lab_V2` is **not** an independent surface
