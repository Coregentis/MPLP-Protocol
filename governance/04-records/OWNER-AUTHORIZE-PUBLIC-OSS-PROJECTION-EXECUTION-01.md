---
entry_surface: repository
doc_type: governance
status: active
authority: MPLP public OSS projection execution governance
protocol_version: "1.0.0"
doc_id: "OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01"
title: "Owner Authorize Public OSS Projection Execution 01"
created_at: "2026-06-08"
goal_id: "OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01"
---

# Owner Authorize Public OSS Projection Execution 01

## Scope

This record captures the owner-authorized public OSS projection execution in
`Coregentis/MPLP-Protocol`.

Authorized write target:

- `Coregentis/MPLP-Protocol`

Read-only authority source:

- `Coregentis/MPLP-Protocol-Dev`

Execution plan:

- `PUBLIC-OSS-PROJECTION-PLAN-01`

Execution branch:

- `codex/owner-authorize-public-oss-projection-execution-01`

This is branch-only public projection execution. It does not authorize merge to
public main, tag, seal, GitHub release, npm publish, PyPI upload, registry
mutation, website deploy, Validation Lab publication, Cognitive OS mutation,
SoloCrew mutation, V1 mutation, branch deletion, or wholesale Dev-to-public
copy/sync.

## Router Result

`TASK-GOVERNANCE-ROUTER-01` and
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` were applied before projection
mutation.

Task classification:

- `owner_authorized_public_oss_projection_execution`
- `public_projection_execution_branch_only`
- `post_dev_release_public_projection`
- `no_merge_no_tag_no_seal`

SOT layer classification:

- `L1 Projection Source execution`
- `L3 Verification Evidence`
- `L4 Publication Surface`
- `L6 Codex Execution Governance`

Selected public baseline:

- `AGENTS.md`
- `.agents/skills/task-governance-router/SKILL.md`
- `.agents/skills/release-projection-governance-router/SKILL.md`
- `governance/release/MPLP-RELEASE-SOP.md`
- `governance/04-records/PUBLIC-OSS-PROJECTION-READINESS-DRIFT-REVIEW-01.md`
- `governance/04-records/PUBLIC-OSS-PROJECTION-PLAN-01.md`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/*.json`

Selected Dev authority source baseline:

- Dev `origin/main` commit `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- Dev release evidence closure record
- Dev published-package matrix
- Dev package files read by `git show origin/main:<path>` for allowlisted
  package surfaces

Prompt assertions were not treated as governance authority unless supported by
local repository evidence.

## Repo Truth

Public repo:

- starting branch: `codex/public-oss-projection-plan-01`
- starting HEAD: `f35bed3d6f62c75a6e24d5a549b3d958d8525101`
- execution branch:
  `codex/owner-authorize-public-oss-projection-execution-01`
- public `origin/main`: `574d13d20b829c0c8768bc7916186f01dcf5ff46`
- public worktree before mutation: clean

Dev repo read-only:

- observed branch:
  `codex/release-projection-governance-harness-codification-01`
- Dev local HEAD observed:
  `93bcc881cc45e13d12dcc4d0ba26b8f11d996b23`
- Dev `origin/main`: `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- Dev worktree observed clean

The execution source is Dev `origin/main`, not the Dev local governance branch.

## Plan Integrity

`PUBLIC-OSS-PROJECTION-PLAN-01` was present and complete before mutation.

Verified plan components:

- projection allowlist
- projection denylist
- redaction rules
- execution gate plan
- stop-condition plan
- Website/Lab downstream decision
- package dist handling decision
- release-config handling decision
- owner authorization requirements

Dev `origin/main` still matched the plan-bound source commit. Public execution
started from the pushed planning branch head.

## Applied Projection Changes

Projected public-safe release evidence:

- `artifacts/release/publish-set.json`
- `artifacts/release/pypi-set.json`
- `release-manifests/mplp-public-manifest.example.json`

Projected package surfaces:

- `packages/npm/conformance/package.json`
- `packages/npm/conformance/README.md`
- `packages/npm/conformance/src/index.ts`
- `packages/npm/conformance/package-lock.json`
- `packages/npm/devtools/package.json`
- `packages/npm/devtools/README.md`

Created public execution governance/evidence:

- `governance/04-records/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01.md`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/*.json`

`packages/npm/conformance/package-lock.json` was included as a gate-driven
package consistency surface for the allowlisted `conformance` package. It
removes the stale active `@mplp/compliance` dependency lock. Package `dist`
remained excluded and unchanged.

## Public Manifest Handling

The public manifest package entries were updated to public registry facts:

- 11 main npm release-set packages are recorded as published.
- `@mplp/devtools@1.0.6` is recorded as published optional tooling.
- `@mplp/compliance@1.0.5` is recorded as skipped legacy alias boundary.
- `mplp-sdk@1.0.6` is recorded as published on PyPI.

The top-level release boundary remains conservative because the local manifest
gate requires it:

- `release_status.state`: `draft`
- `release_status.public_release_ready`: `false`
- `package_replacement_status.status`: `planned_not_published`
- `package_replacement_status.package_actions_executed`: `false`

This branch does not claim final public release completion.

## Release-set / PyPI-set Handling

`artifacts/release/publish-set.json` was aligned to the owner-authorized
11-package npm release-set:

- `@mplp/schema@1.0.7`
- `@mplp/conformance@1.0.1`
- `@mplp/core@1.0.7`
- `@mplp/coordination@1.0.7`
- `@mplp/integration-llm-http@1.0.6`
- `@mplp/integration-storage-fs@1.0.6`
- `@mplp/integration-storage-kv@1.0.6`
- `@mplp/integration-tools-generic@1.0.6`
- `@mplp/modules@1.0.6`
- `@mplp/runtime-minimal@1.0.6`
- `@mplp/sdk-ts@1.0.8`

Excluded from this main release-set:

- `@mplp/compliance`
- `@mplp/devtools`
- `@mplp/validator`

`artifacts/release/pypi-set.json` was aligned to `mplp-sdk@1.0.6` and uses a
repo-relative public path. It no longer points to `V1.0_release` or to a local
absolute path.

The legacy public `scripts/semantic/gate-publish-set.mjs` was not used as a
committed release-set generator for this branch because it scans all public
packages and rewrites the set to include package surfaces excluded by this
owner-authorized projection plan. This incompatibility is recorded as evidence,
and the script output was not retained.

## Package Boundaries

`@mplp/conformance`:

- projected from Dev `origin/main`
- moved from legacy compatibility alias wording to forward conformance helper
  surface wording
- active `@mplp/compliance` dependency/import was removed
- package metadata gate passed

`@mplp/devtools`:

- projected from Dev `origin/main`
- active dependency now points at `@mplp/conformance`
- README records `@mplp/devtools@1.0.6` as optional developer tooling without
  claiming local CLI smoke completion
- package metadata gate passed
- no publish action was performed

Package `dist` remains excluded by `PUBLIC-OSS-PROJECTION-PLAN-01`. Therefore
this public OSS branch does not claim that the local public repo tarball is the
registry package artifact source for CLI behavior.

`@mplp/compliance`:

- not reintroduced as active release-set package
- summary-only legacy alias boundary
- no deprecation action was performed

`@mplp/validator`:

- remains internal/CI-only boundary
- not projected as public package

## Gates

Gates run:

- repo-truth-first in public repo
- repo-truth-first read-only in Dev repo
- task governance router application
- release projection governance router application
- plan integrity check
- JSON parse for plan and execution evidence
- public manifest validation
- package metadata gates for `@mplp/conformance` and `@mplp/devtools`
- `npm pack --dry-run --json` package inventory checks for `@mplp/conformance`
  and `@mplp/devtools`
- release-set / pypi-set projection verification
- active compliance dependency/import/export scan
- no-secret scan
- no-local-path scan
- no raw Dev evidence leakage scan
- internal harness projection scan
- package dist mutation scan
- protected surface diff review
- `git diff --check`

Docs gates were not run because no docs source changed. Schema gates were not
run because no schema source changed. Registry mutation gates were not run
because no npm/PyPI publish/upload/deprecate/dist-tag action was authorized or
performed.

## Website / Lab / Downstream Boundary

No Website, Validation Lab, Cognitive OS, SoloCrew, or V1 workspace mutation
was performed.

Because the public manifest changed, the follow-up goals required by
`PUBLIC-OSS-PROJECTION-PLAN-01` remain:

- `WEBSITE-PROTOCOL-MANIFEST-POINTER-SYNC-01`
- `VALIDATION-LAB-PROTOCOL-MANIFEST-POINTER-SYNC-01`

## Forbidden Action Compliance

Not performed:

- merge to public main
- tag
- seal
- GitHub release
- npm publish
- PyPI upload
- twine upload
- registry mutation
- npm dist-tag mutation
- npm deprecate
- Dev repo mutation
- Website repo mutation
- Validation Lab repo mutation
- Cognitive OS mutation
- SoloCrew mutation
- V1 mutation
- deploy
- branch deletion
- credential/token access
- raw Dev evidence copy
- internal harness copy
- wholesale Dev-to-public sync

## Evidence

Evidence bundle:

- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/repo-truth-before.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/task-governance-router-result.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/release-projection-router-result.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/local-baseline-evidence-table.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/agent-reviewer-selection.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/owner-projection-authorization.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/projection-plan-integrity-check.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/source-target-execution-map.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/applied-projection-changes.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/redaction-application-check.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/public-manifest-verification.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/release-set-pypi-set-verification.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/package-surface-gate-results.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/no-secret-no-local-path-check.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/no-raw-dev-evidence-leakage-check.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/website-lab-downstream-followup-boundary.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/post-projection-diff-review.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/no-forbidden-action-compliance.json`
- `artifacts/governance/OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01/final-verdict.json`

## Verdict

`COMPLETE_PUBLIC_OSS_PROJECTION_EXECUTION_BRANCH_READY_FOR_REVIEW`

Recommended next goal:

`PUBLIC-OSS-PROJECTION-EXECUTION-BRANCH-REVIEW-01`
