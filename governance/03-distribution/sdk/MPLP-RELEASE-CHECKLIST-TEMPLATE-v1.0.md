---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-RELEASE-CHECKLIST-TEMPLATE-v1.0"
title: "MPLP Release Checklist Template v1.0"
---

# MPLP Release Checklist Template v1.0

## Purpose

This checklist template operationalizes:

- `governance/03-distribution/sdk/MPLP-MULTI-REPO-RELEASE-OPERATION-SHEET-v1.0.md`
- `governance/03-distribution/sdk/MPLP-RELEASE-READINESS-BASELINE-v1.0.md`
- `governance/03-distribution/sdk/CHECKLIST-SDK-RELEASE.md`

Use this file for one real release candidate at a time.

Do not start public promotion, SDK publication, or surface deployment until the
required records for the current stage are filled and the stage pass criteria
are satisfied.

## Release Record Header

Fill these fields for the current release candidate:

- `release_window_id`: `<PENDING>`
- `release_date_target`: `<PENDING>`
- `release_operator`: `<PENDING>`
- `protocol_tag_target`: `<PENDING: protocol-vX.Y.Z>`
- `source_commit`: `<PENDING>`
- `prerelease_validation_commit`: `<PENDING>`
- `public_export_commit`: `<PENDING>`
- `website_pinned_sha`: `<PENDING>`
- `validation_lab_pinned_sha`: `<PENDING>`
- `sdk_publish_set`: `<PENDING>`

## 1. Candidate Freeze In `MPLP-Protocol-Dev`

| Item | Content |
|:---|:---|
| Required Inputs | `MPLP-RELEASE-READINESS-BASELINE-v1.0.md`, current version-domain snapshot, intended release window scope |
| Command / Check | Freeze one candidate in `MPLP-Protocol-Dev`; record current commit with `git rev-parse HEAD`; record submodule SHAs with `git submodule status MPLP_website Validation_Lab`; confirm actual release-window inclusion for SDK / docs / website / Validation Lab |
| Pass Criterion | One authoritative candidate is frozen; release scope is explicit; `source_commit`, `website_pinned_sha`, and `validation_lab_pinned_sha` are captured as facts |
| Record To Fill | `source_commit`; `website_pinned_sha`; `validation_lab_pinned_sha`; `sdk_publish_set`; release-scope note |
| Blocker / Stop Rule | If candidate freeze is not explicit, if pinned SHAs are unknown, or if publish/deploy scope is ambiguous, stop and do not advance |

## 2. Dev-Side Gates

| Item | Content |
|:---|:---|
| Required Inputs | Frozen candidate commit, release baseline, approved version-domain snapshot |
| Command / Check | Run `node scripts/04-build/pre-release-check.mjs`; run `node scripts/semantic/gate-publish-set.mjs`; run `python scripts/semantic/gate_pypi_set/main.py`; complete the applicable stages in `CHECKLIST-SDK-RELEASE.md`; generate required artifacts under `artifacts/release/` |
| Pass Criterion | All required dev-side gates exit PASS; no blocked publish surfaces appear in publish sets; required release evidence artifacts exist |
| Record To Fill | Pre-release check result; `publish-set.json`; `publish-gate-report.json`; `pypi-set.json`; `pypi-gate-report.json`; SDK checklist status |
| Blocker / Stop Rule | Any gate FAIL, missing artifact, or unresolved version-domain mismatch blocks advancement |

## 3. `mplp_prerelease` Cleanliness / Export Validation

| Item | Content |
|:---|:---|
| Required Inputs | Frozen `source_commit`; `release-config.yaml`; clean export candidate from `MPLP-Protocol-Dev` |
| Command / Check | Export the same frozen candidate to `mplp_prerelease` using the approved clean-export process; verify include/exclude scope against `release-config.yaml`; confirm excluded surfaces are absent from the clean public export; confirm no semantic rework occurred after freeze |
| Pass Criterion | `mplp_prerelease` contains a clean export traceable to `source_commit`; excluded surfaces remain excluded; export cleanliness validation passes |
| Record To Fill | `prerelease_validation_commit`; export validation note; cleanliness verdict |
| Blocker / Stop Rule | If prerelease differs semantically from the frozen candidate, or if excluded/internal surfaces leak into the clean export, stop and do not promote |

## 4. Promote To `MPLP-Protocol`

| Item | Content |
|:---|:---|
| Required Inputs | Passing `prerelease_validation_commit`; frozen candidate lineage; approved tag target |
| Command / Check | Promote the validated clean export to `Coregentis/MPLP-Protocol`; create the main repository tag using the required pattern `protocol-vX.Y.Z`; create the public release entry using the same validated candidate lineage |
| Pass Criterion | `public_export_commit` is recorded; public repository state is traceable to `source_commit`; domain-qualified tag is applied; no bare `vX.Y.Z` tag is used as authoritative release meaning |
| Record To Fill | `public_export_commit`; `protocol_tag_target`; public release URL |
| Blocker / Stop Rule | If lineage to `source_commit` cannot be shown, or if a bare tag is used, or if promote occurs before prerelease validation is complete, stop |

## 5. SDK Publish Set Execution

| Item | Content |
|:---|:---|
| Required Inputs | Public repo promotion complete; approved `sdk_publish_set`; current `VERSION_REGISTRY.yaml`; required SDK release artifacts |
| Command / Check | Re-run `node scripts/semantic/gate-publish-set.mjs`; re-run `python scripts/semantic/gate_pypi_set/main.py`; run isolated verification for each npm package with `npm pack`; run isolated verification for each PyPI package with `python -m build`; publish only approved public surfaces after Stage 6 approval in `CHECKLIST-SDK-RELEASE.md` |
| Pass Criterion | Only approved public publish surfaces are published; isolated verification succeeds; published versions match intended values; no source mirrors or CI-only packages enter the publish set |
| Record To Fill | Actual published npm package list; actual published PyPI package list; isolated verification report; registry URLs; deprecation actions if any |
| Blocker / Stop Rule | If `MPLP-Protocol` promotion is incomplete, if any publish-set gate fails, if Stage 4 isolated verification fails, or if a blocked package enters the publish flow, stop |

## 6. Docs / Website / Validation Lab Deploy Window

| Item | Content |
|:---|:---|
| Required Inputs | Release-window scope decision; `docs_release_version`; `website_release_version`; `validation_lab_release_version`; pinned SHAs for changed surfaces |
| Command / Check | Deploy only the surfaces changed in this release window; deploy docs from the approved docs line; deploy website at `website_pinned_sha`; deploy Validation Lab at `validation_lab_pinned_sha`; verify public URLs after deploy |
| Pass Criterion | Each changed public surface is deployed within the same release window; unchanged surfaces are explicitly recorded as unchanged; release-note facts match deployed SHAs / version domains |
| Record To Fill | Docs deploy reference; website deploy reference; Validation Lab deploy reference; changed vs unchanged surface matrix |
| Blocker / Stop Rule | If a changed surface cannot be deployed or verified, do not mark release complete |

## 7. Backfill Of Commits, SHAs, Manifests, And Notes

| Item | Content |
|:---|:---|
| Required Inputs | Final public release facts from all completed prior stages |
| Command / Check | Fill `source_commit`, `prerelease_validation_commit`, `public_export_commit`, `website_pinned_sha`, and `validation_lab_pinned_sha`; update `artifacts/release/RELEASE_BUNDLE_MANIFEST.json`; confirm `publish-set.json`, `publish-gate-report.json`, `pypi-set.json`, and `pypi-gate-report.json`; update `governance/03-distribution/sdk/VERSION_REGISTRY.yaml` if SDK publication occurred; write the final release note with version-domain matrix and pinned SHAs |
| Pass Criterion | All required release facts are recorded; manifests and registry files are aligned; release notes contain the required version-domain and pinned-SHA fields; completion can be audited without guessing |
| Record To Fill | Final commit-chain facts; final release note URL/path; manifest backfill confirmation; version-registry backfill confirmation |
| Blocker / Stop Rule | If any required release fact remains guessed, omitted, or unrecorded, the release is not complete |

## Final Release Completion Check

All of the following must be true:

- [ ] Candidate frozen in `MPLP-Protocol-Dev`
- [ ] Dev-side gates passed
- [ ] `mplp_prerelease` cleanliness/export validation passed
- [ ] `MPLP-Protocol` promotion complete
- [ ] SDK publish completed only for approved public surfaces, if in scope
- [ ] docs / website / Validation Lab deploy window completed for changed surfaces
- [ ] commit chain and pinned SHAs backfilled
- [ ] manifests, registry records, and release notes backfilled

If any box remains unchecked, the release is not complete.
