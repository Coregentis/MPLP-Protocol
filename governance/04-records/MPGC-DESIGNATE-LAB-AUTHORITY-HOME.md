---
entry_surface: repository
entry_model_class: primary
doc_type: attestation
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPGC-DESIGNATE-LAB-AUTHORITY-HOME"
title: "MPGC Designation Record — Validation Lab Authority Home"
authority_scope:
  - governance_source
authority_basis:
  - governance_record
surface_role: canonical
active_governance_class: active_record
record_state: effective
---

# MPGC Designation Record — Validation Lab Authority Home

**Record ID**: MPGC-DESIGNATE-LAB-AUTHORITY-HOME  
**Status**: Active Governance Record  
**Authority**: MPGC  
**Effective Governance Revision**: v1.2.0  
**Applicable Protocol Version**: 1.0.0  
**Depends on**:
- `CONST-001_ENTRY_MODEL_SPEC.md`
- `CONST-002_DOCUMENT_FORMAT_SPEC.md`
- `MPGC-RATIFY-ENTRY-MODEL-REALIGNMENT.md`

---

## 1. Purpose

This record designates the authoritative Validation Lab home for MPLP's public-facing release topology from the root repository governance surface and defines the non-authoritative reduction of `Validation_Lab_V2`.

This record also documents the validation basis used to determine that the published Validation Lab repository has absorbed the core V2 governance, release, schema, projection, and gate assets needed for public-facing operation.

---

## 2. Authority Home Designation

Within the current MPLP repository-governance scope:

- **Authoritative public-facing Lab home**: `Coregentis/MPLP-Validation-Lab`
- **Root-repo representation mode**: link-only reference from `MPLP-Protocol`
- **Non-authoritative line**: `Validation_Lab_V2`
- **Reduction mode for `Validation_Lab_V2`**: `engineering_track`

`Coregentis/MPLP-Validation-Lab` is the only authoritative public-facing Validation Lab home for MPLP.

The root `MPLP-Protocol` repository MUST reference that Lab surface by link/pointer only and MUST NOT present `Validation_Lab` as an in-repository public source surface.

`Validation_Lab_V2` is not an independent MPLP surface and must not be treated as a second authoritative Lab home.

---

## 3. Validation Basis

The following validation basis was used to support this designation.

### 3.1 Governance and Release Assets

The published Validation Lab release-line repository and site provide the public-facing Lab home required for ongoing MPLP operation:

- repository: `https://github.com/Coregentis/MPLP-Validation-Lab`
- site: `https://lab.mplp.io`

Repository-facing references in `MPLP-Protocol` therefore do not need to present `Validation_Lab` as an in-repository public source surface.

### 3.2 Schema and Projection Assets

The published Validation Lab repository already absorbs the governance, release, schema, projection, and gate asset classes needed for public-facing operation.

Those asset classes therefore do not require `Validation_Lab_V2` to remain a second authoritative surface, and they do not justify treating the root repository as the public source host for Validation Lab.

### 3.3 V2 Gate and Engineering Assets

The published Validation Lab repository already contains the gate and engineering entrypoints needed to continue V2-related work without relying on `Validation_Lab_V2` as a public-facing authority home.

### 3.4 Route-Layer Absorption

V2 route-layer functionality has been absorbed into the published Lab home in two forms:

- directly exposed published routes such as:
  - `/runs`
  - `/rulesets`
  - `/releases`
  - `/coverage`
  - `/policies`
This means the published Validation Lab repository is the correct public-facing home even where V2 route concepts were renamed, merged, or internally retained rather than preserved as one-to-one public routes.

---

## 4. Duplication and Reduction Rules

The following duplication rules now apply:

1. `Coregentis/MPLP-Validation-Lab` remains authoritative as the Validation Lab release-line repository.
2. `Validation_Lab_V2` is non-authoritative and may only operate as an `engineering_track`.
3. Duplicate V2 governance texts must not remain simultaneously authoritative when the release-line Validation Lab repository already carries the authoritative public-facing home.
4. Duplicate or legacy mirrors must be reduced to one of:
   - pointer-only
   - non-authoritative mirror
   - archive note
   - engineering-track notice

---

## 5. Affected Asset Classes

This designation applies to the following duplicated or overlapping V2 asset classes:

- V2 seal records
- V2 scope / dispute freeze records
- V2 governance mirrors
- V2 repo root README and surface framing
- V2 release and projection references that could otherwise imply a second authoritative home

---

## 6. Effective Rule

From the effective date of this record forward:

- all public-facing or governance-facing references must treat `Coregentis/MPLP-Validation-Lab` as the authoritative Lab home;
- root-repository references to Validation Lab must remain link-only and must not present `Validation_Lab` as an in-repository public source surface;
- `Validation_Lab_V2` must be described only as a non-authoritative `engineering_track` unless superseded by future MPGC action;
- no document may present `Validation_Lab_V2` as:
  - a new MPLP surface,
  - a second authoritative Lab home,
  - or a co-equal public Lab authority.

---

## 7. Non-Goals

This designation record does NOT:

- change protocol semantics,
- change Validation Lab adjudication logic,
- collapse or rewrite all V2 engineering assets,
- or remove the ability to retain V2 code and governance artifacts for engineering-track purposes.

---

## 8. Record History

| Version | Date | Description |
|:---|:---|:---|
| v1.2.0 | 2026-03-28 | Designated `Coregentis/MPLP-Validation-Lab` as the authoritative public-facing Lab home and reduced `Validation_Lab_V2` to non-authoritative `engineering_track` status |

---

**End of Record**
