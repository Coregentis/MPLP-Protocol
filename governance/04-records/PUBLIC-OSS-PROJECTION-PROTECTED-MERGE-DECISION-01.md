---
entry_surface: repository
doc_type: governance-decision
status: active
authority: MPLP public OSS projection protected merge decision governance
protocol_version: "1.0.0"
doc_id: "PUBLIC-OSS-PROJECTION-PROTECTED-MERGE-DECISION-01"
title: "Public OSS Projection Protected Merge Decision 01"
created_at: "2026-06-08"
goal_id: "PUBLIC-OSS-PROJECTION-PROTECTED-MERGE-DECISION-01"
---

# Public OSS Projection Protected Merge Decision 01

## Scope

This record decides whether the reviewed public OSS projection execution branch
is eligible for a later owner-authorized protected merge execution into public
`main`.

Canonical workspace root:

- `/Users/jasonwang/Documents/AI_Dev/Coregentis`

Primary target repository:

- `Coregentis/MPLP-Protocol`

Read-only authority source repository:

- `Coregentis/MPLP-Protocol-Dev`

Reviewed projection execution branch:

- `codex/owner-authorize-public-oss-projection-execution-01`
- reviewed target HEAD:
  `98ab309dc00393efe7dc1f35d259b519a6c9bf93`

Review branch:

- `codex/public-oss-projection-execution-branch-review-01`
- review HEAD:
  `d957615bc7ad1d686a23e68da4236ccc2aee5d8f`

Branch/release/proposal baseline branch:

- `codex/public-oss-branch-release-proposal-governance-baseline-01`
- baseline HEAD:
  `e28ef5add9773d9600485135d7fb8bc1bfac8bbc`

This is not a merge execution goal. This record does not merge, delete
branches, tag, seal, create a GitHub release, publish/upload packages, mutate
registries, mutate Website, mutate Validation Lab, mutate downstream repos,
mutate Dev, mutate V1, or modify projection payload files.

## Router Result

`TASK-GOVERNANCE-ROUTER-01` and
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` were applied before this decision
record was created.

Task classification:

- `public_oss_projection_protected_merge_decision`
- `projection_branch_merge_readiness_decision`
- `branch_release_proposal_baseline_applied`
- `no_merge_no_tag_no_seal`

SOT layer classification:

- `L1 Projection Source merge-readiness decision`
- `L3 Verification Evidence`
- `L4 Publication Surface governance`
- `L6 Codex Execution Governance`

Selected public baseline:

- `AGENTS.md`
- `.codex/config.toml`
- `.agents/skills/task-governance-router/SKILL.md`
- `.agents/skills/release-projection-governance-router/SKILL.md`
- `governance/codex-goals/CODEX-GOAL-TEMPLATE.md`
- `governance/release/MPLP-RELEASE-SOP.md`
- `GOVERNANCE.md`
- `CONTRIBUTING.md`
- `release-config.yaml`
- projection plan, execution, review, and branch/release/proposal baseline
  records

Selected Dev comparison baseline:

- Dev `AGENTS.md`
- Dev `origin/main` observed as
  `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- Dev protected merge and release/projection governance records, read-only

Selected branch/release/proposal baseline:

- `governance/04-records/PUBLIC-OSS-BRANCH-RELEASE-PROPOSAL-GOVERNANCE-BASELINE-01.md`

Prompt assertions were not treated as governance authority unless supported by
local repository evidence.

## Repo Truth

Public repo:

- decision branch:
  `codex/public-oss-projection-protected-merge-decision-01`
- starting branch:
  `codex/public-oss-branch-release-proposal-governance-baseline-01`
- starting HEAD:
  `e28ef5add9773d9600485135d7fb8bc1bfac8bbc`
- public `origin/main`:
  `574d13d20b829c0c8768bc7916186f01dcf5ff46`
- target execution branch:
  `codex/owner-authorize-public-oss-projection-execution-01`
- target execution branch HEAD:
  `98ab309dc00393efe7dc1f35d259b519a6c9bf93`
- review branch HEAD:
  `d957615bc7ad1d686a23e68da4236ccc2aee5d8f`
- baseline branch HEAD:
  `e28ef5add9773d9600485135d7fb8bc1bfac8bbc`

Dev repo read-only:

- observed branch:
  `codex/release-projection-governance-harness-codification-01`
- observed local HEAD:
  `93bcc881cc45e13d12dcc4d0ba26b8f11d996b23`
- Dev `origin/main`:
  `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- worktree state: clean

## Local Baseline Evidence Table

| Decision Area | Local Evidence File | Evidence Signal | Derived Rule | Confidence | Conflict? | Action |
|:---|:---|:---|:---|:---|:---|:---|
| Public repo role | `AGENTS.md`; `.codex/config.toml`; release SOP | Public repo is clean OSS projection; Dev is release/package truth | Decide merge readiness here; do not mutate Dev | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Projection execution authority | `OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-EXECUTION-01` | Branch-only projection executed; no merge/tag/seal/release authorized | Treat execution branch as reviewed candidate only | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Projection review closure | `PUBLIC-OSS-PROJECTION-EXECUTION-BRANCH-REVIEW-01` and evidence | Review verified target HEAD, payload compliance, safety, and readiness for protected merge decision | Merge decision may mark eligible for later owner merge execution | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Branch baseline | `PUBLIC-OSS-BRANCH-RELEASE-PROPOSAL-GOVERNANCE-BASELINE-01` | Branch existence is evidence only; merge requires exact owner authorization | This decision does not merge; later goal must name exact branch/SHA | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| SOP merge path | `MPLP-RELEASE-SOP.md` | Public release changes require protected PR path and merge evidence | Later execution must use protected PR/merge path and record merge commit | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Release/tag/seal boundary | `AGENTS.md`; release router; SOP Sections 11-14 | Tag, seal, GitHub release, registry mutation remain separate owner-authorized actions | Keep all forbidden in this goal | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |

No decision in this record depends on low, conflicting, or missing local
evidence.

## Branch Lineage / Readiness Check

Current lineage evidence:

- target branch remote HEAD:
  `98ab309dc00393efe7dc1f35d259b519a6c9bf93`
- public `origin/main` HEAD:
  `574d13d20b829c0c8768bc7916186f01dcf5ff46`
- target branch ahead/behind vs `origin/main`: `+14 / -0`
- target branch contains `origin/main`: yes
- target branch is contained in review branch: yes
- review branch is contained in branch/release/proposal baseline branch: yes
- target branch is contained in baseline branch: yes
- target branch is not contained in `origin/main`: merge has not already
  occurred

The reviewed execution branch is therefore lineage-safe for merge-readiness
decision. Because later review and baseline records sit above the target branch,
the recommended later merge execution source should be the final pushed head of
this decision branch, not the older target execution branch alone, so that
review and decision evidence are included in the protected PR.

## Projection Review Closure Check

`PUBLIC-OSS-PROJECTION-EXECUTION-BRANCH-REVIEW-01` verified:

- target branch and expected target HEAD matched
- allowlist compliance passed
- denylist compliance passed
- redaction compliance passed
- release-config unchanged in execution payload
- package `dist/**` unchanged
- public manifest validation passed
- Website/Lab/downstream follow-ups recorded and not mutated
- no merge/tag/seal/release occurred
- no registry mutation occurred
- no credential values, `.npmrc`, `.pypirc`, env values, raw npm/PyPI
  stdout/stderr, raw Dev evidence, raw Dev package preflight evidence,
  forbidden local path leakage, node_modules, venv, wheels, sdists, tarballs,
  or package dist mutation were found
- `@mplp/conformance` had no active `@mplp/compliance`
  dependency/import/export
- `@mplp/devtools` active dependency points to `@mplp/conformance`

Review final verdict:

- `COMPLETE_PUBLIC_OSS_PROJECTION_BRANCH_REVIEW_READY_FOR_PROTECTED_MERGE_DECISION`

## Public SOP Merge Decision Check

The public SOP requirements are satisfied up to decision stage:

- dedicated branch: yes
- public `main` not pushed directly: yes
- release/projection scope recorded: yes
- protocol manifest status recorded: yes
- Website/Lab needed-or-not-needed decision recorded: yes, follow-ups remain
  `WEBSITE-PROTOCOL-MANIFEST-POINTER-SYNC-01` and
  `VALIDATION-LAB-PROTOCOL-MANIFEST-POINTER-SYNC-01`
- package dry-run/replacement status recorded where package surfaces are in
  scope: yes
- identity and forbidden-overclaim scan status recorded: yes
- evidence paths recorded: yes
- merge commit: not applicable yet; must be recorded by later merge execution
  goal if owner authorizes merge
- post-merge HEAD: not applicable yet; must be recorded by later merge
  execution goal if owner authorizes merge

## Branch / Release / Proposal Baseline Check

`PUBLIC-OSS-BRANCH-RELEASE-PROPOSAL-GOVERNANCE-BASELINE-01` applies.

Decision classification:

- target execution branch:
  `ACTIVE_PROJECTION_BRANCH` and `MERGE_CANDIDATE`
- review branch:
  `ACTIVE_REVIEW_BRANCH` and `MERGE_CANDIDATE`
- baseline branch:
  `ACTIVE_REVIEW_BRANCH` / governance follow-up branch supporting merge
  readiness decision
- decision branch:
  `MERGE_CANDIDATE` after this record is pushed and reviewed

Branch cleanup remains separate. Branch deletion requires later inventory,
lineage proof, governance record mapping, no-unique-commit-loss proof, and
owner authorization naming exact branches.

Branch existence is not governance authority. The authority for later merge
execution must be an owner authorization naming the exact PR/branch/SHA and
scope.

## Evidence Hygiene Check

Evidence hygiene passed for this decision:

- no credential values read, printed, copied, or committed
- no `.npmrc` or `.pypirc` contents inspected or committed
- no raw npm/PyPI stdout or stderr copied into this record
- no raw Dev evidence copied
- no internal harness files copied from Dev
- no node_modules, venv, wheels, sdists, or tarballs added
- no projected package/release/manifest content modified in this decision goal
- local paths appear only as repo-truth governance evidence where already
  required by local operating rules

## Protected Merge Decision

Decision:

`ELIGIBLE_FOR_LATER_OWNER_AUTHORIZED_PROTECTED_MERGE_EXECUTION`

The reviewed projection execution payload is eligible for a later protected
merge execution, subject to exact owner authorization and final pre-merge gate
rerun.

This decision does not authorize or perform merge execution.

Required source for later merge execution:

- preferred source branch:
  `codex/public-oss-projection-protected-merge-decision-01`
- preferred source commit:
  the final pushed HEAD of this decision branch
- reason: it contains the reviewed execution branch, the projection review
  record, the branch/release/proposal governance baseline, and this protected
  merge decision record

Minimum later merge execution requirements:

- owner authorization naming the exact source branch, final pushed source HEAD,
  target branch `main`, repo, and mutation category
- protected PR path to public `main`
- final repo-truth-first
- final public manifest validation
- final JSON parse for relevant evidence
- final skill mirror diff
- final no-secret/no-raw-evidence/no-local-path leakage scan
- final protected surface scan
- final no tag/seal/GitHub release/registry mutation confirmation unless
  separately authorized
- merge commit and post-merge `main` HEAD recorded after merge

## Remaining Blockers

No blockers remain for owner merge execution authorization.

Remaining non-blocking follow-ups:

- Website manifest pointer sync, if owner wants Website pointer update after
  public merge
- Validation Lab manifest pointer sync, if owner wants Lab pointer update after
  public merge
- branch inventory cleanup plan after merge state is settled
- tag/seal/GitHub release policy remains separate and not authorized here

## Files Changed

This goal changes only:

- `governance/04-records/PUBLIC-OSS-PROJECTION-PROTECTED-MERGE-DECISION-01.md`
- `artifacts/governance/PUBLIC-OSS-PROJECTION-PROTECTED-MERGE-DECISION-01/*.json`

## Non-Actions

This goal did not:

- merge to public `main`
- create, close, or delete PRs
- delete branches
- tag
- seal
- create a GitHub release
- publish/upload packages
- mutate registries or dist-tags
- deprecate or yank packages
- mutate package/source/schema/docs/release-manifest content
- mutate Website, Validation Lab, Cognitive OS, SoloCrew, Dev, or V1
- deploy
- access credential values

## Recommended Next Goal

`OWNER-AUTHORIZE-PUBLIC-OSS-PROJECTION-MERGE-EXECUTION-01`

## Final Verdict

`COMPLETE_PUBLIC_OSS_PROJECTION_MERGE_DECISION_READY_FOR_OWNER_MERGE_EXECUTION`
