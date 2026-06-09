---
entry_surface: repository
entry_model_class: primary
doc_type: attestation
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPGC-RATIFY-ENTRY-MODEL-REALIGNMENT"
title: "MPGC Ratification Record — Entry Model Realignment"
authority_scope:
  - governance_source
authority_basis:
  - governance_record
surface_role: canonical
active_governance_class: active_record
record_state: ratified
---

# MPGC Ratification Record — Entry Model Realignment

**Record ID**: MPGC-RATIFY-ENTRY-MODEL-REALIGNMENT  
**Status**: Ratified Record  
**Authority**: MPGC  
**Governance Revision**: v1.2.0  
**Applicable Protocol Version**: 1.0.0  
**Related Constitutional Documents**:
- `CONST-001_ENTRY_MODEL_SPEC.md`
- `CONST-002_DOCUMENT_FORMAT_SPEC.md`

---

## 1. Purpose

This ratification record formally adopts the Entry Model Realignment package for MPLP governance.

The purpose of this ratification is to unify:

- the constitutional entry model,
- the recognized public-facing surface model,
- the scoped authority model,
- and the legal position of Validation Lab and Validation_Lab_V2.

This record is authoritative as an MPGC governance record and activates the constitutional changes described below.

This record ratifies governance alignment under the applicable `protocol_version`; it does not itself define a `validation_lab_release_version` or `validation_ruleset_version`.

---

## 2. Ratified Constitutional Changes

MPGC hereby ratifies the following constitutional changes.

### 2.1 Ratified Constitutional Entry Model

MPLP SHALL use a **3+1 constitutional entry model**:

- **Primary constitutional entry classes**
  - Repository
  - Documentation
  - Website

- **Auxiliary constitutional entry class**
  - Validation Lab

### 2.2 Ratified Public-Facing Surface Model

MPLP SHALL recognize **four public-facing surfaces**:

- Repository
- Documentation
- Website
- Validation Lab

This public-facing surface model is distinct from, and does not replace, the constitutional entry model.

### 2.3 Ratified Scoped Authority Model

MPLP SHALL use a **scoped authority model**.

No recognized surface is universally authoritative for all subject matter. Each recognized surface is authoritative only within its defined authority scope.

The ratified authority-scope structure is:

- **Repository**
  - protocol_truth
  - schema_truth
  - invariant_truth
  - governance_source

- **Documentation**
  - specification_projection
  - normative_reference_projection
  - explanatory_reference

- **Validation Lab**
  - evidence_adjudication
  - ruleset_projection
  - run_evidence_projection
  - determination_outputs

- **Website**
  - discovery
  - positioning
  - public_framing

---

## 3. Ratified V2 Legal Position

MPGC hereby ratifies that **Validation_Lab_V2 is not an independent constitutional surface** and is not a distinct public-facing MPLP surface.

Validation_Lab_V2 MAY exist only in one of the following legal roles:

- `release_line`
- `migration_line`
- `engineering_track`
- `archive`
- `external_reference`

Validation_Lab_V2 MUST NOT be described, governed, or presented as:

- a new MPLP entry surface,
- a parallel constitutional surface,
- or a second authoritative in-repository Validation Lab surface.

Where `Validation_Lab` and `Validation_Lab_V2` materially overlap, one MUST be designated authoritative and the other MUST be reduced to a non-authoritative role through an explicit authority designation record.

---

## 4. Activated Constitutional Documents

The following constitutional documents are hereby ratified in their updated form:

- `CONST-001_ENTRY_MODEL_SPEC.md`
- `CONST-002_DOCUMENT_FORMAT_SPEC.md`

These two documents SHALL be read together.

For purposes of entry model governance:

- `CONST-001` defines the constitutional entry model, public-facing surface model, scoped authority model, and `Validation_Lab_V2` legal position.
- `CONST-002` defines the document-format and metadata rules required to express and validate those governance distinctions in governed MPLP documentation.

---

## 5. Required Public Wording Alignment

From the effective date of this ratification forward, MPLP-controlled public materials MUST NOT use any of the following formulations except as explicitly marked historical:

- `three entry points`
- `four equal entry points`
- `Validation_Lab_V2 is a new surface`

The canonical public wording SHALL be:

> MPLP exposes four public-facing surfaces under a 3+1 constitutional entry model.

This wording requirement applies to all affected MPLP-controlled public materials, including repository-facing summaries, documentation reference pages, and evaluation-oriented guidance.

---

## 6. Authorized Follow-up Work

MPGC hereby authorizes the following follow-up work streams.

### PR-2 — Lab Truth Chain Repair

Authorized scope:

- repair Validation Lab invariant synchronization and truth-chain binding,
- align Lab-derived invariant sources to Repository truth sources,
- eliminate obsolete or legacy invariant source paths.

### PR-3 — V2 Ownership Collapse

Authorized scope:

- eliminate dual-authoritative Lab ambiguity,
- designate authoritative Lab home,
- reduce non-authoritative overlapping line to an allowed non-surface role.

### PR-4 — Version Taxonomy Manifest

Authorized scope:

- define version-domain separation across protocol, schema, invariant bundle, ruleset, lab release, docs release, website release, and SDK release identifiers.

### PR-5 — Surface Cleanup

Authorized scope:

- remove stale entry-model language,
- align `README` and public docs wording,
- remove invalid V2 surface implications,
- normalize surface-facing governance language.

---

## 7. Effective Governance Consequences

From the effective date of this ratification forward:

1. MPLP governance MUST interpret entry-model language according to:
   - the 3+1 constitutional entry model,
   - the 4 public-facing surface model,
   - and the scoped authority model.

2. Validation Lab MUST be treated as:
   - a recognized public-facing MPLP surface,
   - an auxiliary constitutional entry class,
   - and a non-protocol-defining adjudication surface.

3. Validation_Lab_V2 MUST NOT be treated as:
   - an independent surface,
   - a new entry class,
   - or a second in-repository authoritative Lab surface.

4. Any governed document or public wording that conflicts with this ratification becomes governance debt and MUST be corrected in the authorized follow-up work.

---

## 8. Non-Goals of This Ratification

This ratification does NOT:

- change protocol semantics,
- modify schema semantics,
- redefine Golden Flows,
- change Validation Lab adjudication logic,
- or grant certification or compliance status to MPLP or any implementation.

This ratification governs entry-model structure, surface classification, metadata expression, and legal/topological alignment only.

---

## 9. Effective Date

This ratification becomes effective upon MPGC approval and merge of the corresponding constitutional patch set.

**Governance Revision**: `v1.2.0`  
**Applicable Protocol Version**: `1.0.0`  
**Ratification State**: `ACTIVE UPON MERGE`

---

## 10. Record History

| Version | Date | Description |
|:---|:---|:---|
| v1.2.0 | 2026-XX-XX | Ratified 3+1 constitutional entry model, 4 public-facing surfaces, scoped authority model, and non-surface legal position of Validation_Lab_V2 |

---

**End of Record**
