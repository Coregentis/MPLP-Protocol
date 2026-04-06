---
entry_surface: documentation
entry_model_class: primary
doc_type: guide
normativity: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "DOC-GUIDE-EVAL-001"
authority_scope:
  - explanatory_reference
surface_role: canonical
description: "Guide for evaluating MPLP for enterprise architects and compliance reviewers."
canonical: /docs/guides/evaluation-guide
title: How to Evaluate MPLP
---

# How to Evaluate MPLP

> [!NOTE] Constitutional Source Binding
> This guide is a Documentation-surface projection of the active constitutional evaluation boundary defined by:
>
> - [`governance/01-constitutional/CONST-001_ENTRY_MODEL_SPEC.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/governance/01-constitutional/CONST-001_ENTRY_MODEL_SPEC.md)
> - [`governance/01-constitutional/CONST-002_DOCUMENT_FORMAT_SPEC.md`](https://github.com/Coregentis/MPLP-Protocol/blob/main/governance/01-constitutional/CONST-002_DOCUMENT_FORMAT_SPEC.md)
>
> Protocol truth remains repository-backed. If this guide diverges from constitutional source files or repository-backed protocol truth, those upstream sources prevail.

MPLP exposes four public-facing surfaces under a 3+1 constitutional entry model.

Validation Lab is a public-facing auxiliary surface for evidence adjudication under MPLP's 3+1 constitutional entry model.

Validation Lab does not define protocol truth; protocol truth remains anchored in repository-backed schemas and invariants.

In this guide, protocol semantics, adjudication ruleset semantics, and Validation Lab release identity are versioned separately and MUST NOT be conflated.

## If You Are an Enterprise Architect

**Goal**: Assess technical fit and governance posture

**Reading Order** (30 minutes):
1. [Architecture Overview](/docs/specification/architecture) — L1-L4 layer model
2. [Modules](/docs/specification/modules/core-module) — 10 module specifications
3. [Golden Flows](/docs/evaluation/golden-flows) — Validation scenarios
4. [Standards Mapping](/docs/evaluation/standards/positioning) — ISO/NIST/W3C alignment
5. [Validation Lab Overview](/docs/evaluation/validation-lab) — Evidence adjudication boundary and terminology

**Key Questions Answered**:
- What does the protocol define?
- What remains repository truth versus documentation projection?
- How do I evaluate implementation evidence without confusing protocol truth and adjudication outputs?

## If You Are an Auditor / Compliance Reviewer

**Goal**: Gather evidence, verify boundaries, and trace claims to source artifacts

**Reading Order** (60 minutes):
1. Repository-backed truth sources — schemas, invariants, and governance records
2. [Golden Flows](/docs/evaluation/golden-flows) — Validation evidence model
3. [Standards Mapping](/docs/evaluation/standards/positioning) — External alignment boundaries
4. [Validation Lab Overview](/docs/evaluation/validation-lab) — Auxiliary adjudication surface
5. [Entry Points Reference](/docs/reference/entrypoints) — Constitutional entry model, public surfaces, and scoped authority

**Key Questions Answered**:
- Are protocol claims backed by repository truth?
- Are evaluation outputs correctly scoped to Validation Lab?
- Are governance controls and surface boundaries documented?

## Evaluation Boundary

Use this boundary model during evaluation:

- **Repository**: protocol truth, schema truth, invariant truth, governance source
- **Documentation**: specification and reference projection
- **Website**: discovery and positioning
- **Validation Lab**: evidence adjudication, ruleset projection, run evidence, and determination outputs

Validation Lab is public-facing and important, but it is not a fourth protocol-defining primary.

`Validation_Lab_V2`, if referenced in related materials, must only be treated as a `release_line`, `migration_line`, `engineering_track`, `archive`, or `external_reference` and not as an independent MPLP surface.

## Verification Checklist

Before concluding your evaluation, verify:

- [ ] You understand the 3+1 constitutional entry model
- [ ] You understand the four public-facing surfaces
- [ ] You understand that Validation Lab is auxiliary, not a protocol-defining primary
- [ ] You know where protocol truth is anchored: repository-backed schemas and invariants
- [ ] You know where evidence adjudication truth is anchored: Validation Lab sealed and evidence-linked outputs
- [ ] You understand the standards-mapping scope and limitations

**MPLP Documentation Governance**  
**2026-03-27**
