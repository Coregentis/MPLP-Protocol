---
entry_surface: repository
doc_type: governance-baseline
status: active
authority: MPLP public OSS branch release proposal governance
protocol_version: "1.0.0"
doc_id: "PUBLIC-OSS-BRANCH-RELEASE-PROPOSAL-GOVERNANCE-BASELINE-01"
title: "Public OSS Branch Release Proposal Governance Baseline 01"
created_at: "2026-06-08"
goal_id: "PUBLIC-OSS-BRANCH-RELEASE-PROPOSAL-GOVERNANCE-BASELINE-01"
---

# Public OSS Branch Release Proposal Governance Baseline 01

## Scope

This record codifies the public OSS branch, release-object, and
proposal/candidate lifecycle baseline for `Coregentis/MPLP-Protocol`.

Canonical workspace root:

- `/Users/jasonwang/Documents/AI_Dev/Coregentis`

Primary target repository:

- `Coregentis/MPLP-Protocol`

Read-only authority comparison repository:

- `Coregentis/MPLP-Protocol-Dev`

This is a governance baseline codification record. It does not perform branch
cleanup, branch deletion, merge, tag, release seal, GitHub release creation,
public projection execution, package publish/upload, registry mutation,
package/source/schema/docs/release-manifest mutation, Website sync, Validation
Lab sync, downstream sync, Dev mutation, or V1 mutation.

## Source Evidence Summary

This baseline is derived from local repository evidence:

- `AGENTS.md`
- `.codex/config.toml`
- `.agents/skills/task-governance-router/SKILL.md`
- `.agents/skills/release-projection-governance-router/SKILL.md`
- `governance/codex-goals/CODEX-GOAL-TEMPLATE.md`
- `governance/release/MPLP-RELEASE-SOP.md`
- `GOVERNANCE.md`
- `CONTRIBUTING.md`
- `release-config.yaml`
- `release-manifests/mplp-public-manifest.schema.json`
- `governance/05-versioning/version-taxonomy-manifest.json`
- `governance/candidates/*`
- `governance/mpgc-intake/*`
- `governance/mpgc-review/*`
- current public branch, tag, and PR state
- read-only Dev comparison evidence from `MPLP-Protocol-Dev`

Prompt assertions and prior assistant suggestions were treated as hypotheses
only. The prior discovery result is recorded as evidence input in
`artifacts/governance/PUBLIC-OSS-BRANCH-RELEASE-PROPOSAL-GOVERNANCE-BASELINE-01/prior-discovery-input-summary.json`;
it is not an independent governance authority.

## Router Result

`TASK-GOVERNANCE-ROUTER-01` and
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` were applied before this record was
created.

Task classification:

- `public_oss_branch_release_proposal_governance_baseline`
- `branch_lifecycle_governance`
- `release_object_governance`
- `proposal_candidate_lifecycle_governance`
- `non_cleanup_non_merge_non_release_execution`

SOT layer classification:

- `L1 Projection Source governance`
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
- `release-manifests/mplp-public-manifest.schema.json`
- current public Git branch, tag, and PR state

Selected Dev comparison baseline:

- Dev `AGENTS.md`
- Dev `origin/main` observed as
  `00f57406005fe0a23f27c2e3e82a8c27e99dba6d`
- Dev release/projection policy and authority doctrine records
- Dev release/projection governance harness codification records

## Repo Truth

Public repo:

- branch used for this goal:
  `codex/public-oss-branch-release-proposal-governance-baseline-01`
- starting branch:
  `codex/public-oss-projection-execution-branch-review-01`
- starting HEAD:
  `d957615bc7ad1d686a23e68da4236ccc2aee5d8f`
- public `origin/main`:
  `574d13d20b829c0c8768bc7916186f01dcf5ff46`
- worktree state before this goal's edits: clean
- skill mirror drift before this goal's edits: `NO`

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
| Public repo role | `AGENTS.md`; `.codex/config.toml`; release SOP | Public repo is clean OSS projection; Dev repo is package/release Dev truth | Codify public lifecycle governance here; do not back-drive Dev truth | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Branch discipline | release SOP Section 3; Git branch inventory | Release work uses dedicated branches; current task/projection/governance branches exist | Classify branch roles and lifecycle states before cleanup or merge | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Branch cleanup | release SOP Section 12; branch containment evidence | Old records are retained; no explicit branch cleanup policy existed | Require inventory, lineage proof, record mapping, and owner authorization before remote deletion | `MEDIUM_LOCAL_BASELINE_DERIVED` | No | Codify baseline |
| Release object separation | `GOVERNANCE.md`; version taxonomy; manifest schema | Protocol, package, docs, website, lab, and SDK versions are separate domains | Do not collapse protocol version, package version, public projection snapshot, tag, seal, and GitHub release | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Tag/seal/GitHub release boundary | `AGENTS.md`; release SOP Sections 11-14; release router | Tag, seal, GitHub release, merge, and registry mutation require explicit owner authorization | Baseline record does not authorize them | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Proposal/candidate authority | `GOVERNANCE.md`; `CONTRIBUTING.md`; RFC template; MPGC candidate records | Normative changes start as RFC issues; candidate files are pre-RFC/non-normative | Proposal records/issues are authority; branches are editing vehicles only | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Candidate lifecycle status | MPGC candidate backlog/intake/review records | Candidate states include draft, pre-RFC, backlog-only, review-preparation, decision-needed outcomes | Codify only locally supported states and keep remaining lifecycle states as gaps | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Public projection branch boundary | projection plan and branch review records | Projection execution branches are not releases, tags, seals, or merge approvals | Branch existence is evidence only, not governance authority | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Apply |
| Package release boundary | release SOP Section 7; Dev AGENTS read-only evidence | Package registry action requires exact owner approval and registry baseline; public repo is not Dev package truth | Do not run package gates or mutate package surfaces in this baseline goal | `HIGH_LOCAL_BASELINE_EXPLICIT` | No | Preserve boundary |

No mutation-affecting decision in this baseline depends on low, conflicting, or
missing local evidence.

## Branch Lifecycle Baseline

### Branch Classes

| Branch Class | Baseline Rule | Evidence |
|:---|:---|:---|
| long-lived public branch | `main` is the stable public OSS projection line. | current branch inventory; release SOP protected PR path |
| maintenance branch | Reserved for future owner decision; no active local standard or branch evidence defines it today. | `UNKNOWN_LOCAL_STANDARD_GAP` |
| next/future version branch | `draft` or `next` appears in `GOVERNANCE.md` for RFC implementation; creation requires owner/MPGC decision and must not be inferred from task branches. | `GOVERNANCE.md` |
| Codex task branch | Short-lived execution/planning/review vehicle for bounded Codex goals. | current `codex/*` branch inventory; routers |
| projection execution branch | Short-lived vehicle for owner-authorized projection execution; not a release, tag, seal, or merge approval. | projection plan and branch review records |
| projection review branch | Short-lived review vehicle for validating a projection branch before merge decision. | `PUBLIC-OSS-PROJECTION-EXECUTION-BRANCH-REVIEW-01` |
| release branch | Dedicated branch for release-window work. | release SOP Section 3 |
| governance branch | Dedicated branch for governance records or release-flow records. | release SOP Section 3; merged `governance/*` PRs |
| proposal/candidate branch | Editing vehicle only. The proposal issue/record is the proposal SOT. | `GOVERNANCE.md`; `CONTRIBUTING.md`; MPGC candidate records |
| abandoned branch | Branch with unique commits not contained in `main` or the current active review line and no current owner-approved path. | branch inventory evidence |
| superseded branch | Branch whose commits are contained in a newer active branch or governance record, but which is not yet merged to `main`. | branch containment evidence |
| merged-delete-eligible branch | Branch whose commits are contained in `origin/main` and whose PR/governance record is preserved. | PR #1-#7 and #9 evidence |

### Lifecycle Statuses

| Status | Meaning | Allowed Action In This Baseline Goal |
|:---|:---|:---|
| `LONG_LIVED_PUBLIC_MAIN` | Stable public OSS projection line. | Observe only |
| `ACTIVE_REVIEW_BRANCH` | Current review branch or branch under active owner/Codex review. | Observe/codify only |
| `ACTIVE_PROJECTION_BRANCH` | Projection execution branch with owner authorization for projection payload. | Observe/codify only |
| `ACTIVE_PLAN_BRANCH` | Planning branch without execution authority. | Observe/codify only |
| `MERGE_CANDIDATE` | Branch may be proposed for protected PR/merge decision after gates. | No merge here |
| `SUPERSEDED_CANDIDATE` | Branch appears contained in a newer active branch but still needs record/owner cleanup decision. | No deletion here |
| `MERGED_DELETE_ELIGIBLE_CANDIDATE` | Branch appears contained in `origin/main` and has preserved PR/governance evidence. | No deletion here |
| `ABANDONED_REVIEW_REQUIRED` | Branch is not contained in `main` or the active review line and needs separate review. | No deletion here |
| `KEEP_TEMPORARILY_PENDING_OWNER_DECISION` | Branch has unclear or pending governance status. | No deletion here |
| `UNKNOWN_REQUIRES_GOVERNANCE_DECISION` | Branch class or disposition cannot be safely derived from local evidence. | No deletion here |

### Codex Task Branch TTL

No exact time-based TTL is defined by local evidence. This baseline therefore
uses lifecycle transitions instead of calendar TTL:

1. `ACTIVE_PLAN_BRANCH`
2. `ACTIVE_PROJECTION_BRANCH` or `ACTIVE_REVIEW_BRANCH`, when applicable
3. `MERGE_CANDIDATE`, `SUPERSEDED_CANDIDATE`,
   `MERGED_DELETE_ELIGIBLE_CANDIDATE`, `ABANDONED_REVIEW_REQUIRED`, or
   `UNKNOWN_REQUIRES_GOVERNANCE_DECISION`
4. cleanup plan
5. explicit owner-authorized cleanup execution

## Branch Cleanup Authorization Policy

Branch cleanup is a separate mutation category. It requires a future cleanup
goal and must not be performed from this baseline goal.

Before any remote branch deletion, Codex must produce:

- full local and remote branch inventory
- current `origin/main` HEAD
- branch SHA and upstream tracking state
- ahead/behind count against `origin/main`
- containment proof against `origin/main`
- containment proof against any active review/projection branch
- mapped PR URL and PR state, if available
- mapped governance record path, if available
- proof that no unique unmerged commit would be lost
- owner authorization naming exact branches to delete
- final no-tag/no-merge/no-release/no-registry compliance record

Branch existence alone is not governance authority. Governance state must be
recorded in PRs, governance records, release manifests, or proposal records.

## PR And Merge Boundary

Public release or projection changes must move through a protected PR path.
Direct public `main` pushes are not part of the normal release path.

Merge is not authorized by branch existence, green checks, merged predecessor
PRs, clean worktree state, local evidence, or this baseline record. A merge
goal must name the PR, expected head SHA, base branch, required gates, and
owner authorization.

## Release Object Taxonomy

| Release Object | Meaning | Requires Public Main Merge First? | Requires Tag/Seal/GitHub Release? | Requires Package Registry Publication? | Owner Authorization |
|:---|:---|:---|:---|:---|:---|
| protocol semantic release | Normative protocol/schema/specification version. | Yes for public release surface. | Tag/seal only if separately authorized. | No. | Required; MPGC/RFC path for normative change. |
| package registry release | npm/PyPI package publication for exact package/version. | Not automatically; public records may be separate. | No, unless a package release tag is separately authorized. | Yes. | Required for exact packages, versions, registries, timing, and scope. |
| public projection release | Public repo snapshot/projection of Dev-approved public-safe surfaces. | Yes before public `main` truth. | No, unless separately authorized. | No. | Required for projection execution and merge. |
| public manifest update | Release metadata contract for Website/Lab/public consumers. | Yes before public release truth. | No by itself. | No by itself. | Required when release/projection scope changes. |
| Git tag | Immutable Git ref marking a release or frozen version state. | Yes unless emergency record says otherwise. | It is the tag action. | No by itself. | Required. |
| GitHub release | Public GitHub release object and announcement surface. | Yes unless separately authorized. | Usually references tag; creation is separate. | No by itself. | Required. |
| release seal | Governance closure/seal record. | Usually after gates and intended release state. | Seal action is separate. | No by itself. | Required. |
| Website pointer update | Downstream Website consumption of public manifest/release pointer. | Depends on Website sync goal. | No by itself. | No. | Required when Website is in scope. |
| Validation Lab pointer update | Downstream Lab consumption of public manifest/release pointer. | Depends on Lab sync goal. | No by itself. | No. | Required when Lab is in scope. |

Package version, protocol version, public projection snapshot, Git tag, release
seal, and GitHub release are separate governance objects. Do not collapse them
into a single version concept unless a future local governance record explicitly
does so.

## Release Stop Conditions

Stop before action if any requested release-like mutation lacks local evidence
or owner authorization:

- package publish/upload/deprecate/yank/delete/dist-tag mutation
- package version or package manifest change
- release-set or pypi-set change
- public projection execution
- public manifest release-state mutation
- Website or Validation Lab pointer mutation
- Git tag
- release seal
- GitHub release
- merge
- repository migration or package URL migration
- credential value access, printing, copying, or exposure

## Proposal And Candidate Lifecycle Baseline

### RFC Baseline

Normative changes must start as an RFC issue using the RFC template. The
locally supported RFC lifecycle is:

- `Draft`: proposal submitted as a GitHub Issue
- `Review`: community discussion and MPGC technical review
- `Approval`: MPGC vote
- `Implementation`: merged into `draft` or `next` branch

This baseline does not create `draft` or `next` branches and does not approve
any normative change.

### Candidate Baseline

The local MPGC candidate records support a pre-RFC, non-normative candidate
surface. Locally supported candidate states and outcomes include:

- `draft`
- `pre_rfc`
- `non_normative_candidate_backlog`
- `review_preparation_ready`
- `decision_needed`
- `reject`
- `defer`
- `keep_backlog`
- `open_rfc`
- `request_more_evidence`
- `accept_as_guide_work_item`
- `accept_as_profile_work_item`
- `accept_as_binding_work_item`

Candidate records may discuss MPGC, profile, binding, guide, and schema-shaped
pressure, but they remain non-normative until a future owner/MPGC decision
opens or approves a formal path.

### Proposal Branch Rule

Proposal or candidate branches are editing vehicles only. They do not determine
proposal status, acceptance, rejection, supersession, implementation, or release
truth. Proposal authority must be recorded in the RFC issue, proposal record,
candidate record, MPGC decision record, PR, or release manifest, as applicable.

Long-lived proposal branches are not locally authorized by this baseline.
Create or retain them only under a future owner-approved proposal branch policy.

### Proposal Public-Safe Boundary

Public-safe proposal surfaces:

- RFC issues and public PR discussions
- public candidate backlog records
- public MPGC intake/review preparation records that explicitly remain
  non-normative/pre-RFC
- public proposal decision records

Dev-private or owner-decision-required proposal surfaces:

- raw Dev evidence
- implementation-private evidence
- local execution logs
- credential/auth evidence
- package preflight raw output
- product/runtime-private traces
- owner-private planning notes not prepared for public projection

## Harness And Router Integration

This baseline is referenced by:

- `AGENTS.md`
- `.codex/config.toml`
- `.agents/skills/task-governance-router/SKILL.md`
- `.codex/skills/task-governance-router/SKILL.md`
- `.agents/skills/release-projection-governance-router/SKILL.md`
- `.codex/skills/release-projection-governance-router/SKILL.md`
- `governance/codex-goals/CODEX-GOAL-TEMPLATE.md`

The harness integration is a pointer and precondition update only. It does not
authorize branch cleanup, merge, tag, seal, release, public projection
execution, package mutation, or registry mutation.

## Unknowns And Gaps Retained

These gaps are retained for later owner decision:

- exact time-based TTL for Codex task branches
- exact branch cleanup execution workflow and branch deletion batch format
- maintenance branch naming and creation policy
- long-lived proposal branch policy
- GitHub release naming, body, and asset convention
- release seal convention and seal record template
- public projection release naming convention
- complete candidate lifecycle beyond current pre-RFC records
- draft/next branch creation criteria for future normative RFC implementation

## Non-Actions

This baseline did not:

- delete, close, or create any branch beyond the authorized task branch
- merge, rebase, or cherry-pick
- create a PR
- create a tag
- create a release seal
- create a GitHub release
- execute public projection
- mutate package/source/schema/docs/release-manifest surfaces
- publish or upload packages
- mutate npm, PyPI, Website, Validation Lab, downstream repos, Dev repo, or V1
- read, print, copy, commit, or expose credentials or tokens

## Recommended Next Goal

`PUBLIC-OSS-BRANCH-INVENTORY-CLEANUP-PLAN-01`

This next goal should use this baseline to classify each branch and produce an
owner-ready cleanup plan. It must not delete branches unless separately
authorized.

## Final Verdict

`COMPLETE_PUBLIC_OSS_BRANCH_RELEASE_PROPOSAL_GOVERNANCE_BASELINE_CODIFIED`
