---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-RELEASE-CHECKLIST-2026-04-05-public-oss-01"
title: "MPLP Release Checklist 2026-04-05 Public OSS 01"
---

# MPLP Release Checklist 2026-04-05 Public OSS 01

Derived from:

- `governance/03-distribution/sdk/MPLP-MULTI-REPO-RELEASE-OPERATION-SHEET-v1.0.md`
- `governance/03-distribution/sdk/MPLP-RELEASE-READINESS-BASELINE-v1.0.md`
- `governance/03-distribution/sdk/MPLP-RELEASE-CHECKLIST-TEMPLATE-v1.0.md`

## Release Record Header

- `release_window_id`: `2026-04-05-public-oss-01`
- `release_date_target`: `2026-04-05`
- `release_operator`: `jasonwang`
- `protocol_tag_target`: `protocol-v1.0.0`
- `source_commit`: `<PENDING: final root freeze commit for this release candidate>`
- `prerelease_validation_commit`: `<PENDING>`
- `public_export_commit`: `<PENDING>`
- `website_pinned_sha`: `da5d4618cecf4e1ceec2866f33f8b9f0453a4a71`  
  note: frozen website candidate `W1`
- `validation_lab_pinned_sha`: `8010b74b854b1128d89632c474a8844c924a43a2`  
  note: frozen Validation_Lab candidate `L1`
- `sdk_publish_set`: candidate publish set pending gate validation:
  - `@mplp/compliance@1.0.5`
  - `@mplp/conformance@1.0.0`
  - `@mplp/coordination@1.0.6`
  - `@mplp/core@1.0.6`
  - `@mplp/devtools@1.0.5`
  - `@mplp/integration-llm-http@1.0.5`
  - `@mplp/integration-storage-fs@1.0.5`
  - `@mplp/integration-storage-kv@1.0.5`
  - `@mplp/integration-tools-generic@1.0.5`
  - `@mplp/modules@1.0.5`
  - `@mplp/runtime-minimal@1.0.5`
  - `@mplp/schema@1.0.6`
  - `@mplp/sdk-ts@1.0.7`
  - `mplp-sdk@1.0.5`

## 1. Candidate Freeze In `MPLP-Protocol-Dev`

| Item | Content |
|:---|:---|
| Required Inputs | `MPLP-RELEASE-READINESS-BASELINE-v1.0.md`, current version-domain snapshot, intended release window scope |
| Command / Check | Executed: `git status --short`; `git rev-parse HEAD`; `git branch --show-current`; `git submodule status MPLP_website Validation_Lab`; `git ls-files --stage MPLP_website Validation_Lab`; `git -C Validation_Lab rev-parse HEAD`; `git -C Validation_Lab status --short`; package-change scan across `packages/npm` and `packages/pypi` |
| Pass Criterion | One authoritative candidate is frozen; release scope is explicit; `source_commit`, `website_pinned_sha`, and `validation_lab_pinned_sha` are captured as facts |
| Record To Fill | `source_commit`, `website_pinned_sha`, `validation_lab_pinned_sha`, `sdk_publish_set`, release-scope note |
| Blocker / Stop Rule | If candidate freeze is not explicit, if pinned SHAs are unknown, or if publish/deploy scope is ambiguous, stop and do not advance |

### 1.1 Findings

- Current root branch: `main`
- Current root freeze commit: `<PENDING>`
- Remote topology present:
  - `protocol-dev` -> `Coregentis/MPLP-Protocol-Dev`
  - `origin` -> `Coregentis/mplp_prerelease`
  - `origin-oss` -> `Coregentis/MPLP-Protocol`
- Website frozen candidate `W1`:
  - `da5d4618cecf4e1ceec2866f33f8b9f0453a4a71`
- Validation Lab frozen candidate `L1`:
  - `8010b74b854b1128d89632c474a8844c924a43a2`
- Candidate publish set has changed public publish surfaces in both `packages/npm/*`
  and `packages/pypi/*`

### 1.2 Stage 1 Integrity Judgment

`Stage 1 = BLOCKED`

Reason:

- root worktree is dirty
- root has not yet been aligned to frozen `W1`
- root tracked `Validation_Lab/**` has not yet been aligned to frozen `L1`

This means the final `source_commit` does not yet exist for the current root
workspace state.

### 1.3 Immediate Stop Rule Triggered

Do not start Stage 2 yet.

Stage 1 must be completed first by producing a real frozen candidate state such
that:

- root release candidate changes are committed or otherwise reduced to one frozen
  authoritative candidate commit
- root gitlink for `MPLP_website` is updated to frozen `W1`
- root tracked `Validation_Lab/**` is aligned to frozen `L1`
- the `sdk_publish_set` is explicitly approved for this release window

## 2. Dev-Side Gates

Status: `PENDING — DO NOT START BEFORE STAGE 1 PASS`

## 3. `mplp_prerelease` Cleanliness / Export Validation

Status: `PENDING — DO NOT START BEFORE STAGE 1 AND 2 PASS`

## 4. Promote To `MPLP-Protocol`

Status: `PENDING — DO NOT START BEFORE PRERELEASE VALIDATION PASS`

## 5. SDK Publish Set Execution

Status: `PENDING — DO NOT START BEFORE PUBLIC PROMOTION PASS`

## 6. Docs / Website / Validation Lab Deploy Window

Status: `PENDING — DO NOT START BEFORE RELEASE WINDOW FACTS ARE APPROVED`

## 7. Backfill Of Commits, SHAs, Manifests, And Notes

Status: `PENDING — DO NOT START BEFORE PRIOR STAGES COMPLETE`
