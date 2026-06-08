---
entry_surface: repository
doc_type: governance
status: active
authority: MPLP public OSS projection governance
protocol_version: "1.0.0"
doc_id: "PUBLIC-OSS-PROJECTION-PLAN-01"
title: "Public OSS Projection Plan 01"
created_at: "2026-06-08"
goal_id: "PUBLIC-OSS-PROJECTION-PLAN-01"
---

# Public OSS Projection Plan 01

## Scope

This record creates an owner-ready execution plan for a later public OSS
projection from Dev-side MPLP protocol/package/release truth into the public
OSS projection repository.

Canonical workspace root:

- `/Users/jasonwang/Documents/AI_Dev/Coregentis`

Primary planning target:

- `Coregentis/MPLP-Protocol`

Read-only authority comparison source:

- `Coregentis/MPLP-Protocol-Dev`

This is planning and governance baseline work only. It does not authorize or
perform public projection execution, Dev-to-public copy/sync, package release,
publish/upload, registry mutation, release-config mutation, package/source
mutation, dist mutation, schema mutation, docs mutation, release-manifest
mutation, Website deploy, Validation Lab publication, downstream sync, tag,
seal, GitHub release, merge, branch deletion, or credential access.

## Governance Baseline Adoption

The following rules become baseline preconditions for future public OSS
projection and release-like work in this repository:

- Dynamic local governance baseline selection is mandatory before every
  non-trivial task and before any substantive decision or mutation.
- `TASK-GOVERNANCE-ROUTER-01` is mandatory before non-trivial task execution.
- `RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` is mandatory when a task touches or
  could touch release-like, projection, package, registry, downstream release
  pointer, tag, seal, GitHub release, or merge surfaces.
- Prompt assertions are not governance authority unless supported by local
  repository evidence.
- Green gates, clean worktrees, prior plans, prior evidence, or merged PRs do
  not create owner authorization for a new mutation category.
- Future version planning or release execution must use the latest published
  npm/PyPI registry version for each exact package name as the version
  baseline. Local `package.json`, `pyproject.toml`, generated dist, release-set
  files, pypi-set files, prior PRs, and historical artifacts remain evidence
  only.
- Public OSS projection execution must use an owner-authorized, plan-specific
  allowlist and denylist. Do not rely on broad path classes in
  `release-config.yaml` as projection permission.
- Public projection must be file-level projection only. Do not merge Dev
  `main` directly into public `main`, and do not wholesale-copy Dev repo
  surfaces.
- Raw Dev governance evidence, raw package-preflight evidence, credential/auth
  evidence, local execution logs, and raw npm/PyPI stdout/stderr are not public
  projection surfaces.

## Router Result

`TASK-GOVERNANCE-ROUTER-01` and
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` were applied before this governance
record was created.

Task classification:

- `public_oss_projection_plan`
- `owner_ready_projection_execution_planning`
- `projection_allowlist_denylist_planning`
- `release_process_governance`
- `non_projection_execution`

SOT layer classification:

- `L1 Projection Source planning`
- `L3 Verification Evidence`
- `L4 Publication Surface planning`
- `L6 Codex Execution Governance`

Selected public baseline:

- `AGENTS.md`
- `.codex/config.toml`
- `.agents/skills/task-governance-router/SKILL.md`
- `.agents/skills/release-projection-governance-router/SKILL.md`
- `governance/codex-goals/CODEX-GOAL-TEMPLATE.md`
- `governance/release/MPLP-RELEASE-SOP.md`
- `release-config.yaml`
- `PUBLIC-OSS-PROJECTION-READINESS-DRIFT-REVIEW-01`

Selected Dev comparison baseline:

- Dev `origin/main` commit `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- Dev `governance/release/MPLP-RELEASE-PROJECTION-POLICY.md`
- Dev public-repo authority doctrine
- Dev release evidence closure record
- Dev release-set and pypi-set
- Dev package manifests and READMEs as read-only comparison evidence

Actual subagent invocation was attempted and blocked by the current thread
limit. The selected reviewer perspectives were applied locally:

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

- branch: `codex/public-oss-projection-plan-01`
- starting HEAD: `bb9d33c6a0576e9d04db648f03e879d5dd154abb`
- public `origin/main`: `574d13d20b829c0c8768bc7916186f01dcf5ff46`
- worktree state before record creation: clean except this goal's untracked
  evidence directory
- skill mirror drift: `NO`

Dev repo read-only:

- observed branch: `codex/release-projection-governance-harness-codification-01`
- local HEAD observed:
  `93bcc881cc45e13d12dcc4d0ba26b8f11d996b23`
- Dev `origin/main`: `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- worktree state: clean

Future projection execution must re-run repo-truth-first in both repos and must
stop if Dev `origin/main` or the public start HEAD no longer match the
owner-authorized baseline.

## Local Baseline Evidence Table

| Decision Area | Local Evidence File | Evidence Signal | Derived Rule | Confidence | Conflict? | Action |
|:---|:---|:---|:---|:---|:---|:---|
| Repo authority | `AGENTS.md`; `.codex/config.toml` | Public repo is clean OSS projection; Dev repo is package/release Dev truth | Plan in public; compare Dev read-only | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Projection standard | Dev projection policy; public SOP; drift review | Projection requires allowlist/denylist and no direct Dev main merge | Future execution must use exact allowlist and file-level projection | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Release-config handling | `release-config.yaml`; drift review | Config is bundle input, not full redaction policy; broad governance and package classes exist | Use plan-specific allowlist/denylist; do not mutate config now | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Plan allowlist |
| Package dist boundary | `release-config.yaml`; drift review | `**/dist/**` is excluded from public release bundle | Keep dist as registry artifact only unless separately authorized | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Block dist projection |
| Website/Lab scope | SOP Sections 5-6; vendored manifest evidence | Website/Lab are downstream pointer consumers and become stale if manifest changes | Select Option B follow-up pointer-sync goals if manifest changes | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Plan follow-ups |
| Package policy | Dev publish evidence; drift review; registry facts | 11 npm packages and PyPI package released; Devtools handled separately; compliance legacy; validator internal | Align public summaries later; exclude compliance/validator; treat Devtools as optional tooling summary | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Plan |

No mutation-affecting decision in this plan depends on low, conflicting, or
missing local evidence.

## Source / Target Plan

| Field | Planned Value |
|:---|:---|
| Dev source commit | `00f57406005fe0a23f27c2e3e82a8c27e99dba6d` |
| Dev source type | Dev `origin/main` authority snapshot |
| Public target repo | `Coregentis/MPLP-Protocol` |
| Current planning branch | `codex/public-oss-projection-plan-01` |
| Future execution branch | `codex/public-oss-projection-execution-01` |
| Current public start HEAD | `bb9d33c6a0576e9d04db648f03e879d5dd154abb` |
| Current public `origin/main` | `574d13d20b829c0c8768bc7916186f01dcf5ff46` |
| Projection method | Exact allowlist file-level projection only |
| Direct Dev merge | Forbidden |
| Wholesale copy | Forbidden |

The Dev local governance branch may inform future router/policy work only if
merged or explicitly owner-authorized before execution. It does not replace Dev
`origin/main` as the package/release truth snapshot for this plan.

## Projection Allowlist

Future projection execution may include only owner-authorized instances of the
following classes, and every selected file must pass suitability gates:

- `release-manifests/mplp-public-manifest.example.json`
- `release-manifests/mplp-public-manifest.schema.json` only if schema changes
  are explicitly planned
- `artifacts/release/publish-set.json`
- `artifacts/release/pypi-set.json`
- selected package manifests, READMEs, and source files where drift is proven
  and package gates pass
- `packages/npm/conformance/package.json`
- `packages/npm/conformance/README.md`
- `packages/npm/conformance/src/**`
- `packages/npm/devtools/package.json`
- `packages/npm/devtools/README.md`
- `packages/npm/devtools/src/**`
- selected `docs/docs/**` and `docs/src/**` source files only if drift is
  proven and docs/public-claim gates pass
- `schemas/v2/**`, `tests/**`, and `examples/**` only if future preflight
  detects public-safe drift
- a public-safe execution summary record under `governance/04-records/**`
- lightweight public evidence under the execution goal evidence directory

This allowlist is not self-executing. It defines candidate surfaces for the
next owner authorization and future execution goal.

## Projection Denylist

Denylist overrides broad includes in `release-config.yaml`.

Forbidden projection surfaces:

- raw Dev `artifacts/governance/**`
- raw Dev `artifacts/package-preflight/**`
- credential/auth readiness evidence
- local path execution logs
- private owner decision records not public-safe
- Dev `.codex/**` wholesale copy
- Dev `.agents/**` wholesale copy
- Dev `scripts/codex/**` wholesale copy
- Dev `governance/codex-goals/CODEX-GOAL-TEMPLATE.md` wholesale copy
- raw npm/PyPI execution stdout/stderr
- package `dist` files under `**/dist/**`
- `node_modules/**`
- `venv/**`
- wheels, sdists, tarballs, and staging directories
- `MPLP_website/**`
- `Validation_Lab/**`
- `Cognitive_OS/**`
- `SoloCrew/**`
- V1 migration/evidence workspace content
- `.npmrc`, `.pypirc`, `.env*`, or secret/config files
- docs generated output such as `docs/build/**`, `docs/.docusaurus/**`, and
  `docs/.cache/**`

Do not project `governance/04-records/**` wholesale. Do not project
`packages/**` wholesale. Do not project package `dist` files even if registry
package artifacts contain built dist.

## Redaction Rules

Future projection execution must apply these redaction rules:

- Replace machine-specific paths with repo-relative paths or named repo labels
  unless a governance record explicitly documents local repo truth.
- Summarize registry execution by package, version, and result only.
- Omit raw npm/twine command output, credential readiness detail, auth context,
  local temp paths, and token references.
- Project only public owner identity and current public copyright conclusions;
  keep private owner decision evidence out.
- Describe `@mplp/devtools` as public optional tooling only when package gates
  and owner authorization support that status. Do not imply new publish
  authorization.
- Describe `@mplp/compliance` as a legacy alias boundary excluded from the
  current release set. Do not perform or imply deprecation without separate
  owner authorization.
- Describe `@mplp/validator` as internal CI-only and absent from the public
  package set.
- State Website/Lab pointer status and follow-up goal need without mutating
  downstream repos in the Protocol projection execution goal.

## Package Policy Boundaries

`@mplp/compliance`:

- status: legacy alias boundary
- future publish: no
- projection handling: summary-only boundary where needed
- registry mutation: not authorized
- deprecation: not authorized by this plan

`@mplp/validator`:

- status: internal CI-only
- future publish: no
- projection handling: exclude from public package set
- registry mutation: not authorized

`@mplp/devtools`:

- status: public optional developer tooling package
- projection handling: candidate public package surface and summary
- package source/README changes: require package gates
- publish action: not authorized by this plan

Already-published npm and PyPI package facts may be used as public summary
evidence in future projection execution, but registry facts are not authority
to publish, deprecate, dist-tag, upload, tag, seal, or merge.

## Public Manifest / Website / Lab Decision

Selected decision: Option B.

Future execution should update the Protocol public repo first, then open
separate immediate follow-up pointer-sync goals for Website and Validation Lab
if the public manifest changes.

Rationale:

- The public SOP requires a Website/Lab needed-or-not-needed decision.
- Website and Validation Lab consume vendored Protocol public manifests and
  checksums.
- They become stale if the Protocol public manifest changes.
- Mutating Website and Validation Lab in the same Protocol execution goal would
  cross repo boundaries without separate owner authorization.

Required follow-up goals if manifest changes:

- `WEBSITE-PROTOCOL-MANIFEST-POINTER-SYNC-01`
- `VALIDATION-LAB-PROTOCOL-MANIFEST-POINTER-SYNC-01`

Option A remains valid only if the owner explicitly excludes downstream pointer
freshness from the release window. Option C should be used only if the owner
declares Website/Lab pointer freshness part of the same public release
completion criteria.

## release-config.yaml Handling

Decision:

`PLAN_SPECIFIC_ALLOWLIST_DENYLIST_SUFFICIENT_FOR_NEXT_EXECUTION_PLAN`

No `release-config.yaml` mutation is required or authorized in this plan. The
file remains useful bundle input, but it is not a full redaction policy and it
does not authorize broad projection. The next execution goal should use this
plan's allowlist/denylist to narrow broad `governance/04-records/**` and
`packages/**` classes and to block dist/raw evidence leakage.

Stop and create a separate release-config amendment goal if the owner wants
broad automated projection semantics rather than exact allowlist execution.

## Package Dist Handling

Decision:

`PACKAGE_DIST_REMAINS_REGISTRY_ARTIFACT_ONLY_FOR_PUBLIC_OSS_PROJECTION`

Package dist is excluded by `release-config.yaml` and is not a public OSS
projection surface for the next execution goal. Public OSS projection should
carry source, manifest, README, and public-safe summary surfaces. Registry
packages carry built dist artifacts only after package gates and owner publish
authorization.

Future dist projection would require:

- separate owner decision
- release-config amendment
- package artifact provenance gate
- protected surface review

## Execution Gate Plan

Before future projection execution:

- run repo-truth-first in public repo and Dev repo
- confirm Dev source commit equals the owner-authorized commit
- confirm public start/base HEAD equals the owner-authorized baseline
- run `TASK-GOVERNANCE-ROUTER-01`
- run `RELEASE-PROJECTION-GOVERNANCE-ROUTER-01`
- check plan allowlist/denylist conformance
- validate public manifest before and after any manifest mutation
- prove `release-config.yaml` is unchanged unless an owner-authorized config
  amendment exists
- run identity/legal scan
- run forbidden-overclaim scan
- run no-secret scan
- run no-local-path scan
- run package README/install smoke if package surfaces mutate
- run package consistency release gate if package surfaces mutate
- run docs build/lint if docs mutate
- run Website/Lab needed-or-not-needed decision gate

After future projection execution:

- run `git diff --check`
- parse all changed JSON evidence/manifests
- check governance record frontmatter
- validate public manifest
- review protected surfaces against the authorized allowlist
- run package gates for any package surface mutation
- run docs gates for any docs mutation
- scan for raw Dev evidence leakage
- scan for credential/token leakage
- scan for local path leakage
- run forbidden-overclaim scan
- prove `release-config.yaml` is unchanged unless authorized
- run final repo-truth-first
- verify local and remote branch HEAD after push

Package release gates were not run for this plan-only goal because no package,
manifest, source, dist, docs, registry, publish-set, or pypi-set surface was
mutated.

## Stop Conditions

Future projection execution must stop on:

- `BLOCKED_DEV_MAIN_TRUTH_DRIFT`
- `BLOCKED_PUBLIC_ORIGIN_MAIN_DRIFT`
- `BLOCKED_RELEASE_CONFIG_SCOPE_AMBIGUITY`
- `BLOCKED_PROJECTION_ALLOWLIST_AMBIGUITY`
- `BLOCKED_RAW_DEV_EVIDENCE_LEAKAGE`
- `BLOCKED_LOCAL_PATH_LEAKAGE`
- `BLOCKED_CREDENTIAL_LEAKAGE`
- `BLOCKED_PACKAGE_GATE_FAILED`
- `BLOCKED_MANIFEST_VALIDATION_FAILED`
- `BLOCKED_IDENTITY_OWNER_SCAN_UNRESOLVED`
- `BLOCKED_OVERCLAIM_SCAN_UNRESOLVED`
- `BLOCKED_WEBSITE_LAB_SCOPE_AMBIGUITY`
- `BLOCKED_PUBLIC_PACKAGE_DIST_SCOPE_UNCLEAR`
- `BLOCKED_OWNER_AUTHORIZATION_REQUIRED`
- `BLOCKED_TASK_GOVERNANCE_ROUTER_NOT_RUN`
- `BLOCKED_DYNAMIC_RELEASE_WORKFLOW_DISCOVERY_NOT_PERFORMED`

## Owner Authorization Required Next

Recommended next goal:

`OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01`

That authorization must include:

- exact Dev source commit
- exact public base/start HEAD
- exact public branch name
- exact allowlisted files or path classes
- explicit release-config handling decision
- package dist exclusion confirmation
- Website/Lab same-window or follow-up decision
- package surface mutation permission if package manifests, READMEs, or source
  files are included
- docs mutation permission if docs files are included
- confirmation of no registry, tag, seal, merge, deploy, publish, or upload
  action

This plan does not authorize:

- projection execution
- Dev copy/sync
- package publish/upload
- registry mutation
- tag, seal, GitHub release, or merge
- Website/Lab sync
- package version bump
- release-config mutation

## Evidence

Evidence bundle:

- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/repo-truth.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/task-governance-router-result.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/release-projection-router-result.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/local-baseline-evidence-table.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/agent-reviewer-selection.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/source-target-plan.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/projection-allowlist.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/projection-denylist.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/projection-redaction-rules.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/execution-gate-plan.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/stop-condition-plan.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/public-manifest-website-lab-decision-plan.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/release-config-handling-decision.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/package-dist-handling-decision.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/owner-authorization-requirements.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/no-mutation-compliance.json`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PLAN-01/final-verdict.json`

## Verdict

`COMPLETE_PUBLIC_OSS_PROJECTION_PLAN_READY_FOR_OWNER_EXECUTION_AUTHORIZATION`

Meaning:

- The public OSS projection plan is recorded.
- The plan is ready for owner execution authorization.
- No projection execution was performed.
- No package, source, dist, schema, docs, release manifest, publish-set,
  pypi-set, or release-config surface was mutated.
- The next action is exactly one owner authorization goal:
  `OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01`.
