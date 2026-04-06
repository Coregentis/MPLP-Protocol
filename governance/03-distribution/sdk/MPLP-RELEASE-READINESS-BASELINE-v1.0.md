---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-RELEASE-READINESS-BASELINE-v1.0"
title: "MPLP Release Readiness Baseline v1.0"
---

# MPLP Release Readiness Baseline v1.0

## 1. Release Intent

This document establishes the single release-readiness baseline for the next MPLP
public release window.

This baseline is for:

- a clean public OSS release window for the frozen `protocol_version: 1.0.0`
- promotion of one frozen source candidate from the private development trunk to
  the clean public repository
- coordinated release-window preparation for SDK, docs, website, and Validation
  Lab surfaces under their own version domains

This release is:

- `protocol/public OSS release`: YES
- `patch release`: only for downstream independently versioned surfaces if they
  changed; not assumed for `protocol_version`
- `clean publication release`: YES

Release-window inclusion:

- `SDK`: included in the release window, publish only if the approved public
  publish surfaces changed
- `docs`: included in the release window as an independent deploy line if changed
- `website`: included in the release window as an independent deploy line if changed
- `Validation Lab`: included in the release window as an independent deploy line
  if changed

This baseline does not create a new release doctrine.
It applies the already-approved multi-repo release model to the next public
release candidate.

## 2. Version Domain Snapshot

Canonical version domains captured from
`governance/05-versioning/version-taxonomy-manifest.json`:

- `protocol_version`: `1.0.0`
- `schema_bundle_version`: `2.0.0`
- `invariant_bundle_version`: `2.0.0`
- `validation_ruleset_version`: `ruleset-1.0`
- `validation_lab_release_version`: `1.0.1`
- `docs_release_version`: `1.0.0`
- `website_release_version`: `1.0.0`
- `sdk_version` matrix:
  - `@mplp/sdk-ts`: `1.0.7`
  - `mplp-sdk`: `1.0.5`

Current public npm publish-surface versions captured from `packages/npm/*`:

- `@mplp/core`: `1.0.6`
- `@mplp/schema`: `1.0.6`
- `@mplp/modules`: `1.0.5`
- `@mplp/coordination`: `1.0.6`
- `@mplp/runtime-minimal`: `1.0.5`
- `@mplp/integration-llm-http`: `1.0.5`
- `@mplp/integration-storage-fs`: `1.0.5`
- `@mplp/integration-storage-kv`: `1.0.5`
- `@mplp/integration-tools-generic`: `1.0.5`
- `@mplp/devtools`: `1.0.5`
- `@mplp/conformance`: `1.0.0`
- `@mplp/compliance`: `1.0.5`
- `@mplp/sdk-ts`: `1.0.7`

Current public PyPI publish-surface version:

- `mplp-sdk`: `1.0.5`

This section is a snapshot only.
It does not guess or pre-authorize new version values.

## 3. Repo Topology For This Release

The release topology for this baseline is the approved five-repository model:

| Repository | Role | Release Function In This Window |
|:---|:---|:---|
| `Coregentis/MPLP-Protocol-Dev` | Private development trunk | Authoritative frozen source candidate |
| `Coregentis/mplp_prerelease` | Prerelease staging repository | Cleanliness and export validation |
| `Coregentis/MPLP-Protocol` | Clean public repository | Official public OSS release target |
| `Coregentis/MPLP-Official-Website` | Website release line | Website deploy target |
| `Coregentis/MPLP-Validation-Lab` | Validation Lab release line | Validation Lab deploy target |

Additional clarification:

- `docs` is source-included in `MPLP-Protocol` but deploy-separated as an
  independent documentation release line
- `Validation_Lab_V2` is outside the current outward release line and is not
  part of this baseline

## 4. Candidate Commit Chain

The following fields are required and must remain explicit placeholders until
the release candidate is frozen and validated:

| Field | Required Value |
|:---|:---|
| `source_commit` | `<PENDING: authoritative commit from MPLP-Protocol-Dev>` |
| `prerelease_validation_commit` | `<PENDING: validated commit in mplp_prerelease>` |
| `public_export_commit` | `<PENDING: actual published commit in MPLP-Protocol>` |
| `website_pinned_sha` | `<PENDING: MPLP-Official-Website pinned SHA>` |
| `validation_lab_pinned_sha` | `<PENDING: MPLP-Validation-Lab pinned SHA>` |

Rules:

- these fields must not be guessed
- `source_commit` must anchor the whole release candidate
- `prerelease_validation_commit` must record the staging state that passed
  cleanliness/export validation
- `public_export_commit` must record the actual public clean repository state

## 5. Publish Surface Decision

### 5.1 Main Repo Release Surface

Main repository release surface for this window:

- `Coregentis/MPLP-Protocol`
- release tag pattern: `protocol-vX.Y.Z`
- public source bundle built from the root repository using `release-config.yaml`

The main repository is not a registry package surface.

### 5.2 Actual SDK Publish Surfaces

Actual public SDK publish surfaces for this release window are limited to:

- npm public surfaces in `packages/npm/*`
  - `@mplp/core`
  - `@mplp/schema`
  - `@mplp/modules`
  - `@mplp/coordination`
  - `@mplp/runtime-minimal`
  - `@mplp/integration-llm-http`
  - `@mplp/integration-storage-fs`
  - `@mplp/integration-storage-kv`
  - `@mplp/integration-tools-generic`
  - `@mplp/devtools`
  - `@mplp/sdk-ts`
  - `@mplp/conformance`
  - `@mplp/compliance` as deprecated compatibility alias
- PyPI public surface in `packages/pypi/*`
  - `mplp-sdk`

Publication remains change-based.
This baseline does not assume all public packages will be republished.

### 5.3 Docs Deploy Line

Docs release surface:

- source-included in `MPLP-Protocol`
- deploy-separated as the documentation line
- versioned by `docs_release_version`

### 5.4 Website Deploy Line

Website release surface:

- `Coregentis/MPLP-Official-Website`
- pinned through `website_pinned_sha`
- versioned by `website_release_version`

### 5.5 Validation Lab Deploy Line

Validation Lab release surface:

- `Coregentis/MPLP-Validation-Lab`
- pinned through `validation_lab_pinned_sha`
- versioned by `validation_lab_release_version`

### 5.6 Excluded Surfaces

Excluded from this release baseline:

- `Coregentis/MPLP-Validation-Lab-V2`
- `packages/sources/sdk-ts`
- `packages/sources/sdk-py`
- `@mplp/validator`
- `mplp_prerelease` as a public release surface
- submodule contents `MPLP_website/**` and `Validation_Lab/**` from the root OSS
  bundle built via `release-config.yaml`
- the root workspace `package.json.version` as public release meaning

## 6. Gate Inventory

The following gates/checks must pass before promotion or publish.

### 6.1 Dev-Side Baseline Gates

- root prerelease check:
  - `node scripts/04-build/pre-release-check.mjs`
- release bundle eligibility against `release-config.yaml`
- explicit version-domain review against:
  - `governance/05-versioning/version-taxonomy-manifest.json`
  - `governance/03-distribution/sdk/VERSION_REGISTRY.yaml`

### 6.2 SDK Publish Gates

- npm publish-set gate:
  - `node scripts/semantic/gate-publish-set.mjs`
- PyPI publish-set gate:
  - `python scripts/semantic/gate_pypi_set/main.py`
- SDK release-readiness framework:
  - `governance/03-distribution/sdk/CHECKLIST-SDK-RELEASE.md`
  - Stages 0-8 remain mandatory
- Stage 4 isolated verification remains non-negotiable

### 6.3 Candidate Promotion Gates

- `MPLP-Protocol-Dev -> mplp_prerelease`
  - source candidate frozen
  - baseline fields prepared
  - release gates passing
- `mplp_prerelease -> MPLP-Protocol`
  - prerelease cleanliness/export validation passing
  - no semantic rework after candidate freeze
  - clean public export traceable to one frozen source candidate

### 6.4 Surface Release Checks

For any changed release line in the window:

- docs build/deploy verification
- website build/deploy verification
- Validation Lab build/deploy verification

### 6.5 Post-Publish Verification

- npm registry install/import verification
- PyPI registry install/import verification
- release note and registry backfill verification

## 7. Exclusion / Non-Release Scope

The following are not part of this release:

- any new semantic or governance baseline
- Validation_Lab_V2 outward promotion
- source mirror publication
- CI-only package publication
- implicit republish of every public package by default
- atomic simultaneous deploy requirement for docs, website, and Validation Lab
- any guessed commit, SHA, or unpublished version value

## 8. Release Decision Rule

### 8.1 Dev -> prerelease

Promotion from `MPLP-Protocol-Dev` to `mplp_prerelease` is allowed only when:

- one source candidate is frozen
- version-domain snapshot is confirmed
- candidate commit chain fields remain explicit and unresolved only where
  freeze/promotion has not yet occurred
- dev-side gates listed in Section 6 pass

### 8.2 prerelease -> MPLP-Protocol

Promotion from `mplp_prerelease` to `MPLP-Protocol` is allowed only when:

- prerelease validation confirms clean export suitability
- no blocked/forbidden surfaces remain in the public export set
- `prerelease_validation_commit` is recorded
- the public export remains traceable to the frozen `source_commit`

### 8.3 SDK Publish

SDK publish is allowed only when:

- `MPLP-Protocol` public promotion is complete
- npm and PyPI publish-set gates pass
- SDK release-readiness checklist is complete
- isolated verification passes
- the publish set contains only approved public publish surfaces

### 8.4 Release Completion

This release is complete only when:

- `MPLP-Protocol` public OSS release is published
- required changed release lines in docs / website / Validation Lab are deployed
  within the same release window
- registry publication, if any, is complete and verified
- `source_commit`, `prerelease_validation_commit`, `public_export_commit`,
  `website_pinned_sha`, and `validation_lab_pinned_sha` are filled
- release notes and registry / manifest records are backfilled

This document is the authoritative preparation baseline for the next release
window until superseded by an updated baseline or a finalized execution record.
