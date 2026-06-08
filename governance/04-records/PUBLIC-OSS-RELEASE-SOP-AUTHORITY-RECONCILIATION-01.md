---
entry_surface: repository
doc_type: governance
status: active
authority: MPLP public release governance
protocol_version: "1.0.0"
doc_id: "PUBLIC-OSS-RELEASE-SOP-AUTHORITY-RECONCILIATION-01"
title: "Public OSS Release SOP Authority Reconciliation 01"
created_at: "2026-06-08"
goal_id: "PUBLIC-OSS-RELEASE-SOP-AUTHORITY-RECONCILIATION-01"
---

# Public OSS Release SOP Authority Reconciliation 01

## Scope

This record reconciles stale authority wording in
`governance/release/MPLP-RELEASE-SOP.md` with current local Dev/Public
governance evidence.

Allowed mutation:

- `governance/release/MPLP-RELEASE-SOP.md` authority wording only
- this public governance record
- lightweight evidence under
  `artifacts/governance/PUBLIC-OSS-RELEASE-SOP-AUTHORITY-RECONCILIATION-01/`

Forbidden and not performed:

- Dev-to-public sync/copy/projection execution
- package release, publish, upload, registry mutation, dist-tag mutation, or
  deprecation
- package/source/dist/schema mutation
- `release-config.yaml` mutation
- publish-set or pypi-set mutation
- website, Validation Lab, Cognitive OS, SoloCrew, or V1 mutation
- tag, seal, GitHub release, merge, or branch deletion
- credential or token access

## Router Result

`TASK-GOVERNANCE-ROUTER-01` and
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` were applied before mutation.

Task classification:

- `public_oss_release_sop_authority_reconciliation`
- `projection_governance_authority_alignment`
- `release_process_governance`
- `non_projection_execution`

SOT layer classification:

- `L4 Publication Surface`
- `L6 Codex Execution Governance`

## Decision

The public SOP previously stated that
`Coregentis/MPLP-Protocol-Dev` remained a historical internal line. Current
local evidence shows that statement is stale and conflicts with the current
Dev/Public authority model.

Current evidence:

- Public `AGENTS.md` defines this repo as public OSS projection and
  `MPLP-Protocol-Dev` as protocol/package/release Dev truth.
- Public `.codex/config.toml` points `authoritative_dev_truth` to
  `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol-Dev`.
- Dev `AGENTS.md` defines `MPLP-Protocol-Dev` as the full Dev-side
  package/release/protocol truth line.
- Dev `MPLP-DEV-PUBLIC-REPO-AUTHORITY-DOCTRINE-2026-06-02.md` defines Dev as
  full Dev-side development and release-governance truth and Public as clean
  projection.
- Dev `MPLP-RELEASE-PROJECTION-POLICY.md` defines Dev-to-Public projection
  flow and states that projection policy does not authorize package
  publication, repository migration, tags, or downstream implementation.
- Dev `PUBLIC-OSS-PROJECTION-STANDARD-DISCOVERY-01` and
  `RELEASE-PROJECTION-GOVERNANCE-HARNESS-CODIFICATION-01` both record this
  SOP language as drift/gap requiring reconciliation before projection
  execution.

The SOP now states that Dev is active Dev-side protocol/package/release truth,
while preserving the public release safety boundary: do not merge Dev `main`
directly into public `main`; Dev-originated public candidates require a
dedicated owner-approved provenance, export, and projection record.

## Non-Effects

This reconciliation changes authority language only. It does not change public
projection scope, package release readiness, release-config semantics, public
manifest contents, package publish-set contents, package artifacts, schemas, or
registry state.

## Evidence

Evidence bundle:

`artifacts/governance/PUBLIC-OSS-RELEASE-SOP-AUTHORITY-RECONCILIATION-01/`

## Final Verdict

`COMPLETE_PUBLIC_OSS_RELEASE_SOP_AUTHORITY_RECONCILED`
