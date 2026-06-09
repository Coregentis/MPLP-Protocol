---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "GOV-README"
title: "MPLP Governance Index"
authority_scope:
  - governance_source
authority_basis:
  - projection_only
surface_role: canonical
active_governance_class: active_index_or_router
---

# MPLP Governance Index

> [!IMPORTANT]
> **Minimal Canonical Governance Index**
>
> This file is the active governance index for repository classification and
> change routing.
> It classifies governance materials by active status and handling rule.
> It does **not** replace constitutional doctrine, version taxonomy, or source
> records.

> [!NOTE]
> `status: draft` is the repository lifecycle value required for governance
> documents under `CONST-002`.
> This file is still the active canonical routing and classification layer for
> governance handling.

## Canonical Sources

Use these first when a governance question affects semantic authority:

- `01-constitutional/`
- `05-versioning/`
- `global-alignment-baseline.yaml`
- active authority records in `04-records/`
- `EXECUTION_ORDER.md` for execution sequencing only

## Buckets

| Bucket | Meaning | Use Rule |
|:---|:---|:---|
| `canonical-active` | Current active governance source or bounded runtime-consumed governance support | May guide active work within declared scope |
| `frozen-historical` | Retained historical governance line or archive set | Keep for provenance only; do not treat as current guidance |
| `release-evidence` | Attestation, seal, closure, audit, or release proof | Evidence only; do not treat as current doctrine |
| `generated-derived` | Machine-generated report, export, or regenerated artifact | Regenerate from sources; not semantic authority |
| `unknown-quarantine` | Unsafe, stale, broken-pointer, or conflicting residue | Do not use as active guidance until normalized |

## Active Governance Classes

| Class | Meaning |
|:---|:---|
| `constitutional_doctrine` | Constitutional doctrine that defines repository governance meaning |
| `semantic_doctrine` | Active semantic governance outside the constitutional layer |
| `active_index_or_router` | Active routing, indexing, or classification layer |
| `active_record` | Active repository record whose conclusion or disposition remains in force |
| `operational_support` | Active operational/gate support material |
| `pointer_only` | Active or retained pointer with no standalone doctrine authority |

### Metadata Convention

- `active_governance_class` identifies how an active governance file should be interpreted.
- `record_state` is used only on `active_record` files when record finality or
  effectivity needs to be explicit.
- `status` remains the repository lifecycle field required by `CONST-002`; it is
  not the sole indicator of whether a record is currently in force.
- `authority: none` may still appear on active routing, record, and operational
  files when they do not define doctrine directly.

## Path Classification

| Path / File Family | Bucket | Authority Class | Notes |
|:---|:---|:---|:---|
| `01-constitutional/**` | `canonical-active` | semantic authority | Constitutional baseline |
| `02-methods/**` | `canonical-active` | semantic authority | Verification and audit methods |
| `03-distribution/sdk/**` except approval-only records | `canonical-active` | semantic authority | Active SDK governance |
| `04-records/MPGC-RATIFY-*` | `canonical-active` | semantic authority | Ratified source records |
| `04-records/MPGC-RECORD-2026-01-22-CROSS-ENTRY-PROJECTION-ALIGNMENT.md` | `canonical-active` | semantic authority | Cross-entry governance record |
| `04-records/MPGC-DESIGNATE-LAB-AUTHORITY-HOME.md` | `canonical-active` | semantic authority | Active Lab-home designation |
| `04-records/UNIFIED-RECTIFICATION-MAINLINE-CLOSURE.md` | `canonical-active` | semantic authority | Mainline closure baseline |
| `04-records/A-LINE-CLOSURE-RECORD-2026-04-01.md` | `canonical-active` | semantic authority | A-line closure record |
| `04-records/VALIDATION_LAB_V2-TAIL-DISPOSITION-2026-04-01.md` | `canonical-active` | semantic authority | Archived-tail handling rule |
| `04-records/DEPRECATED-CONTENT-SEPARATION-2026-04-02.md` | `canonical-active` | semantic authority | Active deprecated-content separation rule |
| `04-records/AUDIT-ARTIFACT-ARCHIVE-2026-04-01.md` | `canonical-active` | semantic authority | Active archive demotion record |
| `05-versioning/**` | `canonical-active` | semantic authority | Canonical version-domain baseline |
| `global-alignment-baseline.yaml`, `global-alignment-current.yaml` | `canonical-active` | runtime-consumed active file | Machine-readable cross-surface baseline |
| `05-specialized/entity.json`, `05-specialized/ENTITY_CANONICAL.yaml`, `05-specialized/ENTITY_DISAMBIGUATION_POLICY.md`, `05-specialized/ECOSYSTEM_ANCHORS.json` | `canonical-active` | semantic authority | Identity and disambiguation support |
| `05-specialized/DEPRECATION_PLAN.md`, `05-specialized/SCRIPT_*.md` | `canonical-active` | semantic authority | Internal governance support |
| `06-operations/gates/**`, `06-operations/linkmap/**`, `06-operations/schemas/**`, `06-operations/ALLOW-LINKMAP-01.yaml`, `06-operations/DEPENDENCY-GOVERNANCE-NOTE.md`, `06-operations/LINKMAP_*.txt` | `canonical-active` | runtime-consumed active file | Internal execution support; not doctrine |
| `README.md`, `EXECUTION_ORDER.md` | `canonical-active` | semantic authority | Index and routing only |
| `04-records/SEAL-*`, `04-records/AUDIT-*`, `04-records/PHASE-*`, `04-records/FREEZE_*`, `04-records/GOV-ADDENDUM-*`, `04-records/FR-ENTITY-ALIGNMENT-*` | `release-evidence` | historical evidence | Do not use as current doctrine |
| `03-distribution/sdk/MPGC_APPROVAL_SDKR_v1.0.md` | `release-evidence` | historical evidence | Approval evidence |
| `governance/audits/**` | `release-evidence` | historical evidence | Audit and drift evidence |
| `06-operations/artifacts/release/**` | `release-evidence` | historical evidence | Release packet evidence |
| `06-operations/artifacts/**` excluding release packets already listed | `generated-derived` | generated | Regenerate from source tools |
| `06-operations/docs-link-map*.json`, `06-operations/docs-banner-gate.report.json`, `06-operations/docs-sensitive-terms.report.*`, `06-operations/docs-audit/**` | `generated-derived` | generated | Generated reports |
| `99-archive/**` | `frozen-historical` | historical evidence | Archive line |
| `GOVERNANCE.md` | `unknown-quarantine` | quarantined unsafe residue | Non-canonical root pointer only |
| `../MPLP_website/governance/**` | `unknown-quarantine` | quarantined unsafe residue | Broken/stale website governance residue |
| `../MPLP_website/website-governance/**` | `unknown-quarantine` | quarantined unsafe residue | Historical website governance residue |
| `../Validation_Lab/governance/v2/**` | `unknown-quarantine` | quarantined unsafe residue | Non-authoritative mirror subtree |
| `../Validation_Lab_V2/**` | `frozen-historical` | historical evidence | Archived engineering track; not active guidance |

## Handling Rules

- Preserve semantic authority first. If a file conflicts with `01-constitutional/`,
  `05-versioning/`, or current source records, those sources prevail.
- Treat runtime-consumed active files as bounded support assets, not as doctrine.
- Retain release evidence and frozen historical files, but keep them visibly
  non-active.
- Do not use unknown-quarantine files as active guidance until their status is
  normalized.

## Quick Start

1. Read `01-constitutional/CONST-001_ENTRY_MODEL_SPEC.md`
2. Read `01-constitutional/CONST-002_DOCUMENT_FORMAT_SPEC.md`
3. Read `05-versioning/VERSION-TAXONOMY-MANIFEST.md`
4. Use active `04-records/` source records for boundary and closure questions
5. Use `06-operations/` only for execution support, not doctrine
