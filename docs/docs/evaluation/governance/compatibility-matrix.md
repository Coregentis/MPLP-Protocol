---
sidebar_position: 7
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-COMPAT-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Compatibility Matrix
sidebar_label: Compatibility Matrix
description: "Helper matrix for reading MPLP version domains and package compatibility at a high level."
authority: none
---

# Compatibility Matrix

## Purpose

This page is a **high-level compatibility helper**.

It must be read through explicit version domains rather than a flat version
ladder.

## Current Version Domains

| Domain | Current Value |
|:---|:---|
| `protocol_version` | `1.0.0` |
| `schema_bundle_version` | `2.0.0` |
| `invariant_bundle_version` | `2.0.0` |
| `validation_ruleset_version` | `ruleset-1.0` |
| `validation_lab_release_version` | `1.0.1` |
| `docs_release_version` | `1.0.0` |
| `website_release_version` | `1.0.0` |

## Public Package Surfaces

| Package Surface | Current Public Version | Role |
|:---|:---|:---|
| `@mplp/schema` | `1.0.6` | direct schema/data mirror |
| `@mplp/sdk-ts` | `1.0.7` | TypeScript facade helper |
| `@mplp/runtime-minimal` | `1.0.5` | runtime-minimal helper |
| `mplp-sdk` | `1.0.5` | Python protocol helper |

## Boundary

- Directory labels such as `schemas/v2/` are path labels, not standalone
  version doctrine.
- Public package compatibility must be read through package role plus explicit
  version domains.
- This helper page does not define compatibility law by itself.

## Related References

- [Entry Points](/docs/reference/entrypoints)
- [Versioning Policy](./versioning-policy.md)
- [TypeScript SDK Guide](/docs/guides/sdk/ts-sdk-guide)
- [Python SDK Guide](/docs/guides/sdk/py-sdk-guide)
