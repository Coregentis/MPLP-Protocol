---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VERSION-TAXONOMY-MANIFEST"
title: "Version Taxonomy Manifest"
authority_scope:
  - governance_source
authority_basis:
  - governance_record
surface_role: canonical
active_governance_class: semantic_doctrine
---

# Version Taxonomy Manifest

## 1. Purpose

This manifest defines the canonical version-domain model for MPLP governance, documentation, and public-facing references.

Its purpose is to eliminate version-domain ambiguity across protocol, schema, invariant, Lab, documentation, website, and SDK materials.

This document does **not** rename all historical artifacts. It defines the canonical semantic mapping that future governance, documentation, and gates MUST use.

Frontmatter `protocol_version` denotes the applicable MPLP protocol baseline.
References in this document to `v1.x governance` describe governance-line scope,
not a second protocol semantic version.

## 2. Scope

This manifest governs:

- constitutional and governance records
- public-facing repository summaries
- documentation reference pages
- Validation Lab governance and release records
- version-domain validation gates

This manifest does **not** require immediate renaming of all historical files, release labels, or archived records.

## 3. Canonical Version Domains

The following eight version domains are canonical for MPLP v1.x governance:

| Domain | Meaning | Canonical Current Value |
|:---|:---|:---|
| `protocol_version` | Frozen MPLP protocol semantic version | `1.0.0` |
| `schema_bundle_version` | Version of the canonical root schema bundle | `2.0.0` |
| `invariant_bundle_version` | Version of the canonical invariant bundle aligned to the root schema bundle | `2.0.0` |
| `validation_ruleset_version` | Active Validation Lab adjudication ruleset identifier | `ruleset-1.0` |
| `validation_lab_release_version` | Current release identifier for the published Validation Lab repository | `1.0.1` |
| `docs_release_version` | Current release identifier for docs.mplp.io source/deploy line | `1.0.0` |
| `website_release_version` | Current release identifier for mplp.io source/deploy line | `1.0.0` |
| `sdk_version` | Package-scoped SDK release version | package-specific |

## 4. Canonical Usage Rules

### 4.1 Version Domain Requirement

Any governance-level, specification-level, or public-facing version reference MUST map to an explicit version domain.

It is not sufficient to write `v1`, `v2`, `current`, or `latest` without making the target domain clear.

### 4.2 Bare Version Prohibition

The following bare forms are non-canonical and MUST NOT carry authoritative version meaning by themselves:

- `v1`
- `v2`
- `current`
- `latest`

These may appear only as:

- historical shorthand
- UI shorthand backed by a canonical mapping
- or explanatory aliases that explicitly resolve to a canonical version domain

### 4.3 Domain-Specific Meaning

- `protocol_version` means MPLP protocol truth version only
- `schema_bundle_version` means canonical schema bundle version only
- `invariant_bundle_version` means canonical invariant bundle version only
- `validation_ruleset_version` means Validation Lab ruleset version only
- `validation_lab_release_version` means published Validation Lab release line only
- `docs_release_version` means docs source/deploy line only
- `website_release_version` means website source/deploy line only
- `sdk_version` means package-scoped SDK release only

No domain may be used as shorthand for another.

## 5. Historical Alias Policy

Historical labels are allowed to persist in titles, filenames, archive records, and legacy release materials, but they are downgraded to alias status unless explicitly promoted by future governance action.

### 5.1 Historical Alias Classes

The following historical alias classes are recognized:

- `v1`
- `v2`
- `current`
- `latest`
- `site-v*`
- `pack-v*`
- `rel-lab-*`

### 5.2 Historical Alias Rule

Historical aliases MUST NOT be treated as canonical version domains on their own.

If a historical alias appears in a governance, documentation, or public-facing context, at least one of the following must also be true:

- it is explicitly marked historical
- it is accompanied by a canonical version-domain mapping
- it is used only as a filename or archive tag and not as a semantic authority claim

### 5.3 Lab-Specific Historical Labels

The following Lab historical label families remain valid as historical labels, but are not promoted to first-class version domains in P1:

- `site-v*`
- `pack-v*`
- `rel-lab-*`

They MUST be treated as legacy label families until future governance explicitly promotes them into the canonical version-domain model.

## 6. Required Cross-Mapping

The repository currently contains multiple live and historical version vocabularies. The minimum required mapping layer is:

- `protocol_version: 1.0.0`
- `schema_bundle_version: 2.0.0`
- `invariant_bundle_version: 2.0.0`
- `validation_ruleset_version: ruleset-1.0`
- `validation_lab_release_version: 1.0.1`
- `docs_release_version: 1.0.0`
- `website_release_version: 1.0.0`
- `sdk_version`:
  - `@mplp/sdk-ts: 1.0.7`
  - `mplp-sdk: 1.0.5`

This mapping is intentionally conservative. It defines the current canonical interpretation layer without forcing immediate renaming of every historical release artifact.

## 7. Governance Consequence

From adoption of this manifest forward:

- key governance and public-facing materials must identify version references by domain
- gates may reject bare version language in authority-bearing contexts
- future cleanup work may reduce historical alias usage, but such cleanup is not a prerequisite for this manifest to be valid

## 8. Non-Goals

This manifest does **not**:

- rename all historical files
- collapse all Lab release label families
- resolve all dependency-governance issues
- repair SDK mirror drift
- or perform a repo-wide cleanup sweep

It defines the semantic taxonomy only.

## 9. Record History

| Version | Date | Description |
|:---|:---|:---|
| v1.0.0 | 2026-03-28 | Initial canonical version-domain taxonomy for MPLP governance and public-facing materials |
