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

This record designates the authoritative Validation Lab home within the current repository governance scope and defines the non-authoritative reduction of `Validation_Lab_V2`.

This record also documents the validation basis used to determine that the published Validation Lab repository has absorbed the core V2 governance, release, schema, projection, and gate assets needed for public-facing operation.

---

## 2. Authority Home Designation

Within this repository governance scope:

- **Authoritative Lab home**: `Validation_Lab`
- **Non-authoritative line**: `Validation_Lab_V2`
- **Reduction mode for `Validation_Lab_V2`**: `engineering_track`

`Validation_Lab` is the only authoritative Lab home within this repository governance scope.

`Validation_Lab_V2` is not an independent MPLP surface and must not be treated as a second authoritative Lab home.

---

## 3. Validation Basis

The following validation basis was used to support this designation.

### 3.1 Governance and Release Assets

The published repository already contains the V2 governance and release asset sets required for ongoing public-facing and operational use:

- `Validation_Lab/governance/v2/`
- `Validation_Lab/releases/v2/`
- top-level V2 governance artifacts such as:
  - `Validation_Lab/governance/v2-seal.md`
  - `Validation_Lab/governance/v2-seal-rc2.md`
  - `Validation_Lab/governance/v2-seal-rc3.md`
  - `Validation_Lab/governance/scope-freeze-v2.md`
  - `Validation_Lab/governance/dispute-freeze-v2.md`
  - `Validation_Lab/governance/linkmap.v2.yaml`
  - `Validation_Lab/governance/gates/gate-registry-v2.json`

### 3.2 Schema and Projection Assets

The published repository already contains the V2 schema and projection assets needed for public-facing use:

- `Validation_Lab/schemas/v2/`
- `Validation_Lab/public/_data/v2/`

These assets are present in the published Lab home and therefore do not require `Validation_Lab_V2` to remain a second authoritative surface.

### 3.3 V2 Gate and Engineering Assets

The published repository already contains the V2 gate and engineering entrypoints under:

- `Validation_Lab/scripts/gates/v2/`
- `Validation_Lab/app/v2/`
- `Validation_Lab/lib/v2/`

The published Lab home therefore already contains the in-repo engineering and projection structures necessary to continue V2-related work without relying on `Validation_Lab_V2` as a public-facing authority home.

### 3.4 Route-Layer Absorption

V2 route-layer functionality has been absorbed into the published Lab home in two forms:

- directly exposed published routes such as:
  - `/runs`
  - `/rulesets`
  - `/releases`
  - `/coverage`
  - `/policies`
- retained internal V2 implementation assets under:
  - `Validation_Lab/app/v2/`
  - `Validation_Lab/public/_data/v2/`

This means the published Validation Lab repository is the correct public-facing home even where V2 route concepts were renamed, merged, or internally retained rather than preserved as one-to-one public routes.

---

## 4. Duplication and Reduction Rules

The following duplication rules now apply:

1. `Validation_Lab` remains authoritative.
2. `Validation_Lab_V2` is non-authoritative and may only operate as an `engineering_track`.
3. Duplicate V2 governance texts inside `Validation_Lab` must not remain simultaneously authoritative when a top-level authoritative file already exists.
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

- all public-facing or governance-facing references must treat `Validation_Lab` as the authoritative Lab home;
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
| v1.2.0 | 2026-03-28 | Designated `Validation_Lab` as the only authoritative Lab home and reduced `Validation_Lab_V2` to non-authoritative `engineering_track` status |

---

**End of Record**
