---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-MULTI-REPO-RELEASE-OPERATION-SHEET-v1.0"
---

# MPLP Multi-Repo Release Operation Sheet v1.0

## 1. Purpose

This operation sheet defines the practical release flow for MPLP across:

- the private development trunk
- the prerelease staging repository
- the clean public repository
- the website release line
- the Validation Lab release line
- the public npm and PyPI SDK surfaces

It operationalizes the already-approved governance and version-domain model.

It does not create a new release doctrine.
It applies the existing distribution and versioning rules to the current
repository topology.

## 2. Governing Baseline

This sheet must be interpreted together with:

- `governance/05-versioning/version-taxonomy-manifest.json`
- `governance/03-distribution/sdk/METHOD-SDKR-01_RELEASE_PIPELINE.md`
- `governance/03-distribution/sdk/METHOD-SDKR-08_MULTI_PACKAGE_RELEASE_GOVERNANCE.md`
- `governance/03-distribution/sdk/METHOD-SDKR-09_RELEASE_READINESS.md`
- `governance/03-distribution/sdk/CHECKLIST-SDK-RELEASE.md`
- `release-config.yaml`

### 2.1 Version-Domain Rule

Authoritative outward-facing release meaning MUST use explicit version domains.

Current canonical version domains are:

- `protocol_version`
- `schema_bundle_version`
- `invariant_bundle_version`
- `validation_ruleset_version`
- `validation_lab_release_version`
- `docs_release_version`
- `website_release_version`
- `sdk_version`

The root repository `package.json.version` is not the outward-facing release
meaning for MPLP.

## 3. Five-Repository Role Model

### 3.1 Repository Roles

| Repository | Role | Release Function |
|:---|:---|:---|
| `Coregentis/MPLP-Protocol-Dev` | Private development trunk | Authoritative integration and release-source candidate |
| `Coregentis/mplp_prerelease` | Prerelease staging repository | Cleanliness and export-preview validation |
| `Coregentis/MPLP-Protocol` | Clean public repository | Official open-source release repository |
| `Coregentis/MPLP-Official-Website` | Website release line | Official website deploy surface |
| `Coregentis/MPLP-Validation-Lab` | Validation Lab release line | Official Validation Lab deploy surface |

### 3.2 Excluded Line

`Coregentis/MPLP-Validation-Lab-V2` is excluded from the formal release path
defined in this sheet unless future governance explicitly promotes it into the
official release topology.

### 3.3 Documentation Line Clarification

`docs` is not a sixth repository in the release topology.

It is source-included in `MPLP-Protocol` but deploy-separated as an independent
documentation release line.

## 4. Hard Release Decisions

The following execution decisions are fixed by this sheet.

### 4.1 Candidate Continuity

One authoritative source candidate from `MPLP-Protocol-Dev` MUST flow through:

`MPLP-Protocol-Dev` -> `mplp_prerelease` -> `MPLP-Protocol`

This means:

- no semantic rework is allowed after the candidate is frozen
- prerelease is a cleanliness and export validation step, not a second authoring step
- public promotion must be traceable back to one frozen source candidate

### 4.2 Commit Recording Rule

Because the clean public repository may be mechanically exported and therefore
may not preserve the identical Git commit hash, every release record MUST carry:

- `source_commit` = authoritative candidate commit from `MPLP-Protocol-Dev`
- `prerelease_validation_commit` = validated staging commit in `mplp_prerelease`
- `public_export_commit` = actual published commit in `MPLP-Protocol`

### 4.3 Main Repository Tag Rule

The main repository tag MUST use an explicit domain-qualified form.

Required pattern:

- `protocol-vX.Y.Z`

Example:

- `protocol-v1.0.0`

Bare tags like `v1.0.0` must not be used as the authoritative main repository
release tag.

### 4.4 SDK Publish Ordering Rule

SDK registry publication MUST occur only after promotion to
`Coregentis/MPLP-Protocol` is complete.

Public packages must not precede the public protocol baseline they refer to.

### 4.5 SDK Publish Scope Rule

Public SDK publication is change-based, not automatically full-bundle by default.

Release only:

- public packages whose publish surface changed
- required downstream package surfaces that must move with them

Do not republish the entire public package set by default.

### 4.6 Surface Deploy Synchronization Rule

Website, Documentation, and Validation Lab do not require atomic simultaneous
deployment.

They must instead satisfy:

- deployment within the same release window when changed
- release notes record the pinned SHA or release version for each surface
- unchanged surfaces may remain on their prior deployed release

### 4.7 Release Note Recording Rule

Every main repository release note MUST record at minimum:

- `protocol_version`
- `schema_bundle_version`
- `invariant_bundle_version`
- `validation_ruleset_version`
- `docs_release_version`
- `website_release_version`
- `validation_lab_release_version`
- `sdk_version` matrix
- `website_pinned_sha`
- `validation_lab_pinned_sha`
- `source_commit`
- `public_export_commit`

## 5. Publish-Surface Rules

### 5.1 Source Mirrors Must Not Publish

The following are source mirrors and must not be published directly:

- `packages/sources/sdk-ts`
- `packages/sources/sdk-py`

They exist only as build/release preparation surfaces for:

- `packages/npm/sdk-ts`
- `packages/pypi/mplp-sdk`

### 5.2 Public SDK Publish Surfaces

Registry publication is allowed only from:

- `packages/npm/*` public package surfaces
- `packages/pypi/*` public package surfaces

### 5.3 CI-Only Package Block

`@mplp/validator` is CI-only and must never enter the publish set.

## 6. Current Public SDK Surfaces

### 6.1 npm Public Surfaces

Current public npm surfaces include:

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
- `@mplp/compliance` (deprecated compatibility alias)

### 6.2 PyPI Public Surface

Current public PyPI surface:

- `mplp-sdk`

### 6.3 Current Canonical SDK Versions

Use the version registry and version taxonomy manifest as authority.

Current published SDK anchors:

- `@mplp/sdk-ts = 1.0.7`
- `mplp-sdk = 1.0.5`

## 7. Release Sequence

### Stage 0 — Freeze Candidate In Dev

In `MPLP-Protocol-Dev`:

- freeze the release candidate commit
- confirm all version domains
- confirm website and Validation Lab pinned SHAs
- identify the exact SDK publish set
- prepare release intent and evidence artifacts

Output:

- `source_commit`
- candidate release evidence

### Stage 1 — Run Dev-Side Release Gates

Run the required release and publish gates in the dev repository.

Minimum:

- root prerelease check
- npm publish-set gate
- PyPI publish-set gate
- SDK release readiness checklist
- isolated pre-publish verification

Any gate failure blocks advancement.

### Stage 2 — Export To `mplp_prerelease`

Export the frozen candidate into `mplp_prerelease`.

Rules:

- export must be mechanical
- no semantic editing is allowed at this stage
- the staging repo exists only to verify clean public export properties

Output:

- `prerelease_validation_commit`

### Stage 3 — Validate Cleanliness In `mplp_prerelease`

Verify that the prerelease export:

- contains only intended OSS content
- excludes website and Validation Lab subrepo content from the main release bundle
- contains the correct submodule pointers
- contains no internal-only or blocked package surfaces
- preserves the frozen candidate meaning

If this stage fails, return to `MPLP-Protocol-Dev`.

### Stage 4 — Promote To `MPLP-Protocol`

Promote the validated export into `Coregentis/MPLP-Protocol`.

Rules:

- this is the official open-source repository release
- record `source_commit`, `prerelease_validation_commit`, and `public_export_commit`
- create the official protocol-domain tag (`protocol-vX.Y.Z`)
- publish the clean source release bundle from this repository

### Stage 5 — Publish SDK Registry Surfaces

Only after Stage 4 passes:

- publish changed npm public surfaces
- publish changed PyPI public surfaces
- run post-publish verification from the registries

### Stage 6 — Deploy Surface Repositories

Deploy the changed release lines as needed:

- website
- docs
- Validation Lab

Deployment is release-window coordinated, but not required to be atomic if a
surface did not change.

### Stage 7 — Record Final Release State

Update the governance/release records:

- `governance/03-distribution/sdk/VERSION_REGISTRY.yaml`
- `artifacts/release/RELEASE_BUNDLE_MANIFEST.json`
- `artifacts/release/publish-set.json`
- `artifacts/release/publish-gate-report.json`
- `artifacts/release/pypi-set.json`
- `artifacts/release/pypi-gate-report.json`
- final main repository release note / release card
- recorded pinned website and Validation Lab SHAs in that release note

## 8. SDK Publish Order

When the dependency graph requires ordered publication, use this sequence:

1. `@mplp/core`
2. `@mplp/schema`
3. `@mplp/modules`
4. `@mplp/coordination`
5. `@mplp/runtime-minimal`
6. `@mplp/integration-*`
7. `@mplp/compliance` if changed and still intentionally maintained
8. `@mplp/conformance` if changed
9. `@mplp/devtools`
10. `@mplp/sdk-ts`
11. `mplp-sdk`

This order ensures facade and alias layers never publish ahead of their lower
dependencies.

## 9. Mandatory Gate Set

### 9.1 npm

- `node scripts/semantic/gate-publish-set.mjs`
- `node scripts/semantic/verify-publish-only.mjs`

### 9.2 PyPI

- `python scripts/semantic/gate_pypi_set/main.py`

### 9.3 Release

- `npm run pre-release`
- `governance/03-distribution/sdk/CHECKLIST-SDK-RELEASE.md`

## 10. Release Notes Minimum Schema

Each official release note must contain:

- release title
- `protocol_version`
- `source_commit`
- `prerelease_validation_commit`
- `public_export_commit`
- `website_pinned_sha`
- `validation_lab_pinned_sha`
- `docs_release_version`
- `website_release_version`
- `validation_lab_release_version`
- `sdk_version` matrix
- publish-set summary
- changed surfaces summary
- unchanged surfaces summary

## 11. Non-Goals

This sheet does not:

- promote `Validation_Lab_V2` into the official release line
- collapse all repositories into one version number
- replace SDK governance methods
- override version taxonomy governance
- authorize source mirrors as publish targets

## 12. Operational Summary

In short:

- develop in `MPLP-Protocol-Dev`
- validate cleanliness in `mplp_prerelease`
- promote only verified clean exports into `MPLP-Protocol`
- publish SDKs only after public promotion
- deploy website/docs/Lab as independent release lines
- record explicit version domains and pinned SHAs in the final release note
