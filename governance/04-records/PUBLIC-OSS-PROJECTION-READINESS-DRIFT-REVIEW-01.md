---
entry_surface: repository
doc_type: governance
status: active
authority: MPLP public OSS projection governance
protocol_version: "1.0.0"
doc_id: "PUBLIC-OSS-PROJECTION-READINESS-DRIFT-REVIEW-01"
title: "Public OSS Projection Readiness Drift Review 01"
created_at: "2026-06-08"
goal_id: "PUBLIC-OSS-PROJECTION-READINESS-DRIFT-REVIEW-01"
---

# Public OSS Projection Readiness Drift Review 01

## Scope

This record reviews drift between the current public OSS projection repo and
the Dev-side MPLP protocol/package/release truth line.

Write target:

- `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol`

Read-only authority comparison source:

- `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol-Dev`

This is a review and readiness decision only. It does not authorize or perform
public projection execution, Dev-to-public sync/copy, package release,
publish/upload, registry mutation, release-config mutation, package/source
mutation, dist mutation, schema mutation, docs mutation, release-manifest
mutation, Website deploy, Validation Lab publication, downstream sync, tag,
seal, GitHub release, merge, branch deletion, or credential access.

## Router Result

`TASK-GOVERNANCE-ROUTER-01` and
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` were applied before evidence
mutation.

Task classification:

- `public_oss_projection_readiness_drift_review`
- `public_projection_boundary_review`
- `release_process_governance`
- `non_projection_execution`

SOT layer classification:

- `L1 Projection Source review`
- `L3 Verification Evidence`
- `L4 Publication Surface`
- `L6 Codex Execution Governance`

Selected local baseline:

- public `AGENTS.md`
- public `.codex/config.toml`
- public `.agents/skills/task-governance-router/SKILL.md`
- public `.agents/skills/release-projection-governance-router/SKILL.md`
- public `governance/release/MPLP-RELEASE-SOP.md`
- public `release-config.yaml`
- prior public `PUBLIC-OSS-RELEASE-SOP-AUTHORITY-RECONCILIATION-01`
- Dev `MPLP-RELEASE-PROJECTION-POLICY.md`
- Dev `MPLP-DEV-PUBLIC-REPO-AUTHORITY-DOCTRINE-2026-06-02.md`
- Dev `PUBLIC-OSS-PROJECTION-STANDARD-DISCOVERY-01`
- Dev `RELEASE-EVIDENCE-CLOSURE-AND-PUBLIC-PROJECTION-PLAN-01`

Actual subagent invocation was attempted and blocked by the current thread
limit. The selected reviewer perspectives were therefore applied locally:

- governance secretariat
- release governance reviewer
- projection boundary reviewer
- security/no-secret reviewer
- package surface auditor
- docs projection reviewer
- Website boundary reviewer
- Validation Lab boundary reviewer

## Repo Truth

Public repo:

- branch: `codex/public-oss-projection-readiness-drift-review-01`
- starting HEAD: `20ecad2ee28116d92310111dbc64de3593b50ce3`
- public `origin/main`: `574d13d20b829c0c8768bc7916186f01dcf5ff46`

Dev repo read-only:

- branch observed: `codex/release-projection-governance-harness-codification-01`
- local HEAD observed: `93bcc881cc45e13d12dcc4d0ba26b8f11d996b23`
- Dev `origin/main`: `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`

Dev `origin/main` is the main authority snapshot for release-set and publish
evidence. The local Dev governance branch adds projection-standard discovery
and release-projection router codification, so it is used as local governance
comparison evidence, not as a replacement for Dev `origin/main`.

## Drift Summary

Detected public drift:

- Public `artifacts/release/publish-set.json` still reflects an older
  13-package set including `@mplp/compliance` and `@mplp/devtools` at old
  versions.
- Dev `artifacts/release/publish-set.json` reflects the current 11-package
  npm release set.
- Public `artifacts/release/pypi-set.json` still points `mplp-sdk@1.0.5` to a
  V1 path.
- Dev `artifacts/release/pypi-set.json` reflects `mplp-sdk@1.0.6` under
  `Coregentis/MPLP-Protocol-Dev`.
- Public manifest package status still says `planned_not_published`, while
  live npm/PyPI registry checks show the released package versions are visible.
- Public package manifests and READMEs contain package-surface drift that
  requires package gates before any projection mutation. Examples include
  public `@mplp/conformance` and `@mplp/devtools` still referencing
  `@mplp/compliance` where Dev has moved toward `@mplp/schema` /
  `@mplp/conformance`.
- `schemas/v2/**`, `tests/**`, and `examples/**` showed no source drift in the
  current sampled comparison.
- Docs source has limited drift after excluding generated docs artifacts.
- Website and Validation Lab vendored manifests still match the old public
  manifest and therefore remain stale if the public manifest is updated.

Expected projection lag:

- Dev raw `artifacts/governance/**` evidence is not public-projected by
  default.
- Dev package-preflight raw execution logs are not public-projected by default.
- Dev-only release governance can require public summary records rather than
  raw record projection.

## Classification Summary

Public projection candidates:

- public manifest status update
- package manifests / README / source after package gates
- docs source after docs and public-claim gates
- schemas/tests/examples if future drift appears

Public summary-only candidates:

- `artifacts/release/publish-set.json`
- `artifacts/release/pypi-set.json`
- Dev release evidence closure summaries
- npm/PyPI publish evidence summaries
- Website and Validation Lab manifest pointer decisions

Dev-private or internal-only:

- raw Dev `artifacts/governance/**`
- raw `artifacts/package-preflight/**`
- credential/security/token records
- local path execution logs
- embedded Website or Validation Lab source
- build outputs, `node_modules`, `dist`, docs generated artifacts

Blocked by owner decision or release-config ambiguity:

- broad `governance/04-records/**` projection, because Dev contains private
  owner, credential, publish, and operational records
- package `dist` projection, because `release-config.yaml` excludes
  `**/dist/**` while registry package artifacts may need generated dist in the
  package-publication channel
- `@mplp/compliance` public boundary/deprecation handling
- exact Website and Validation Lab pointer sync scope

## Release Config And SOP Review

`release-config.yaml` matches between public and Dev in the sampled comparison,
but it is not a full redaction policy and it is not projection authorization.
It includes broad public surfaces such as `packages/**` and
`governance/04-records/**`, and excludes `**/dist/**`, build outputs, Website
and Lab embedded source, internal operations, reports, and release scripts.

Current SOP is authority-consistent after
`PUBLIC-OSS-RELEASE-SOP-AUTHORITY-RECONCILIATION-01`. It still requires public
manifest validation, Website/Lab needed-or-not-needed decisions, and package
gates when packages are in scope.

## Public Manifest / Website / Lab Boundary

Public manifest validation passed:

```bash
node scripts/semantic/validate-public-manifest.mjs
```

Website and Validation Lab both currently vendored the same stale manifest:

- manifest id: `mplp-public-manifest-1.0.0-draft-650e5b2f`
- package status: `planned_not_published`

Website and Lab are not in scope for mutation in this review. If a later public
projection updates the Protocol public manifest, owner decision is required on
whether Website and Lab pointer sync are in the same release window or separate
follow-up goals.

## Readiness Decision

Verdict:

`COMPLETE_PUBLIC_OSS_PROJECTION_DRIFT_REVIEW_READY_FOR_OWNER_PROJECTION_PLAN`

Meaning:

- The public repo is ready for an owner-authorized projection plan.
- It is not ready for projection execution from this goal.
- A later plan must name exact public files/surfaces, redaction rules, gates,
  and owner decisions.

Recommended next goal:

`PUBLIC-OSS-PROJECTION-PLAN-01`

## Evidence

Evidence bundle:

`artifacts/governance/PUBLIC-OSS-PROJECTION-READINESS-DRIFT-REVIEW-01/`

Required evidence files:

- `repo-truth.json`
- task governance router result JSON
- `release-projection-router-result.json`
- `local-baseline-evidence-table.json`
- `agent-reviewer-selection.json`
- `dev-main-authority-snapshot.json`
- `public-repo-current-state.json`
- `drift-detection-summary.json`
- `projection-drift-classification-matrix.json`
- `release-config-and-sop-consistency-review.json`
- `public-manifest-website-lab-boundary-review.json`
- `projection-readiness-decision.json`
- `no-mutation-compliance.json`
- `final-verdict.json`

## Non-Actions

No projection execution, Dev-to-public sync/copy, package release,
publish/upload, registry mutation, release-config mutation,
release-set/pypi-set mutation, package/source/dist/schema/docs mutation,
release-manifest mutation, Website/Lab/downstream mutation, tag, seal, GitHub
release, merge, branch deletion, V1 mutation, or credential access was
performed.
