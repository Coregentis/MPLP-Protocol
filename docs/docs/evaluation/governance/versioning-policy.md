---
sidebar_position: 3
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-VERSION-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Versioning Policy
sidebar_label: Versioning Policy
description: "Reference view of MPLP version domains, anchored to the frozen version taxonomy manifest."
authority: Documentation Governance
---

# Versioning Policy

This page is a **reference projection** of the frozen MPLP version taxonomy
manifest. It does not define a competing version constitution.

## 1. Source Binding

The controlling source for version-domain meaning is:

- `governance/05-versioning/version-taxonomy-manifest.json`

If this page diverges from that manifest, the manifest prevails.

## 2. Version Domains

The frozen manifest defines these version domains:

- `protocol_version`
- `schema_bundle_version`
- `invariant_bundle_version`
- `validation_ruleset_version`
- `validation_lab_release_version`
- `docs_release_version`
- `website_release_version`
- `sdk_version`

## 3. Current Values

From the frozen manifest:

| Domain | Current Value |
|:---|:---|
| `protocol_version` | `1.0.0` |
| `schema_bundle_version` | `2.0.0` |
| `invariant_bundle_version` | `2.0.0` |
| `validation_ruleset_version` | `ruleset-1.0` |
| `validation_lab_release_version` | `1.0.1` |
| `docs_release_version` | `1.0.0` |
| `website_release_version` | `1.0.0` |
| `sdk_version["@mplp/sdk-ts"]` | `1.0.7` |
| `sdk_version["mplp-sdk"]` | `1.0.5` |

## 4. Canonical Rules

The frozen manifest also states:

- authority-bearing version references must use an explicit domain
- bare labels such as `v1`, `v2`, `current`, and `latest` are prohibited as
  canonical meaning
- historical aliases must be mapped or explicitly marked

## 5. Historical Alias Policy

The frozen manifest allows historical aliases such as:

- `v1`
- `v2`
- `current`
- `latest`
- `site-v*`
- `pack-v*`
- `rel-lab-*`

Those may remain in historical or explanatory contexts, but they must not carry
canonical meaning without explicit domain mapping.

## 6. Reading Rule

When version language appears in docs:

1. identify the domain first
2. check the frozen manifest if the meaning matters
3. do not infer canonical meaning from a bare version label alone

## 7. Related References

- [Entry Points](/docs/reference/entrypoints)
- [Validation Lab Overview](/docs/evaluation/validation-lab)

---

**Final Boundary**: this page is a reference projection of the frozen version
taxonomy manifest only. It is not an independent version constitution.
