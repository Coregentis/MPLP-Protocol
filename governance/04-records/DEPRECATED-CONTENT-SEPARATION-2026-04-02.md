---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "DEPRECATED-CONTENT-SEPARATION-2026-04-02"
title: "Deprecated Content Separation Record — 2026-04-02"
authority_scope:
  - governance_source
authority_basis:
  - governance_record
surface_role: canonical
active_governance_class: active_record
record_state: effective
---

# Deprecated Content Separation Record — 2026-04-02

## Purpose

This record separates active baseline content from historical and deprecated
materials that remain in the repository for provenance only.

It exists to prevent historical language, legacy repo mirrors, and archive-only
release instructions from polluting active MPLP guidance.

## Active Baseline Rule

The active baseline for current MPLP guidance is:

- repository root active documents
- `docs/` active documentation source
- `Coregentis/MPLP-Validation-Lab` separate Validation Lab release-line repository
- `MPLP_website/` active website source
- current governance, release, and closure records outside archive scopes

Active surfaces MUST NOT use deprecated repo mirrors or stale entry-model
language as current guidance.

## Historical / Deprecated Material Classes

The following material classes are historical-only unless explicitly re-promoted
by later governance:

- `governance/99-archive/**`
- Validation Lab historical/archive materials retained in the separate `Coregentis/MPLP-Validation-Lab` repository
- archived release reproduction notes that still mention `mplp_prerelease`
- `Validation_Lab_V2/**` as a non-authoritative archived `engineering_track`

These materials may be retained for provenance, chronology, or audit history,
but they MUST NOT be treated as current implementation or release guidance.

## Deprecated Reference Rule

The following references are now deprecated in active guidance:

- `https://github.com/Coregentis/mplp_prerelease`
- `https://github.com/AiSg-Coregentis/mplp_prerelease`
- legacy `governance/entity` path references

Active guidance should instead bind to:

- `https://github.com/Coregentis/MPLP-Protocol`
- `https://github.com/Coregentis/MPLP-Validation-Lab`
- `governance/05-specialized/entity.json`
- `governance/05-specialized/ENTITY_CANONICAL.yaml`
- `docs/static/assets/geo/mplp-entity.json`

## Execution Note

As part of this separation pass:

- active README/docs/Lab/website sources were updated away from stale entity and
  prerelease references
- historical `mplp_prerelease` usage was downgraded to historical-only where it
  remains in archive-oriented materials
- active gates/scripts were pointed at current repository and release-line references

## Effect

Future cleanup work should continue to:

- keep historical material in archive or explicitly historical scopes
- remove stale links from active surfaces
- avoid using archive-only release materials as current user instructions
