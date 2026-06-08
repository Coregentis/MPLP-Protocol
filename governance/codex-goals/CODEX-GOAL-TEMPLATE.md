# Codex Goal Template

Use this template for bounded Goal Mode tasks in this repository family. If `/goal` is not available in the current IDE surface, simulate Goal Mode by copying this template into the task prompt and keeping the same stopping condition, forbidden actions, and owner approval boundary.

## Goal

State the concrete objective and the verifiable stopping condition.

## Task Governance Router Result

This section is mandatory before direct file edits, substantive judgment,
verification gates, release actions, publish/upload actions, tag, seal, merge,
or cross-repo actions.

Run or internally satisfy `TASK-GOVERNANCE-ROUTER-01` using
`.agents/skills/task-governance-router/SKILL.md`.

Declare:

```yaml
task_governance_router:
  router_id: TASK-GOVERNANCE-ROUTER-01
  router_skill: .agents/skills/task-governance-router/SKILL.md
  router_run_before_substantive_work:
  task_type:
  selected_local_governance_baseline:
  local_baseline_evidence_table:
  sot_layer:
  applicable_repo_governance_methods:
  applicable_harness_methods:
  applicable_agents_or_review_perspectives:
  applicable_skills:
  required_gates:
  forbidden_actions:
  stop_conditions:
  evidence_outputs:
  owner_decision_required:
  final_verdict:
```

If this router result is missing, stop with
`BLOCKED_TASK_GOVERNANCE_ROUTER_NOT_RUN`.

## Repository

Name the exact repository path and current branch. Do not assume cloud threads, marketplace features, app-only visibility, or cloud-only execution.

## Coregentis Workspace Authority Check

Declare:

```yaml
coregentis_workspace_authority:
  canonical_workspace_root: /Users/jasonwang/Documents/AI_Dev/Coregentis
  current_repo:
  authoritative_repo:
  current_remote:
  authoritative_remote:
  repo_role:
  upstream_sot:
  downstream_derivatives:
  v1_status: frozen_migration_evidence_source
  cross_repo_sync_in_scope: false
```

## SOT Classification

Classify all touched surfaces before editing:

| SOT Layer | Applies? | Surfaces | Authority |
|:---|:---|:---|:---|
| `L0 Protocol Truth` |  |  | MPLP-Protocol-Dev only unless explicitly authorized |
| `L1 Projection Source` |  |  | repo-specific source or public projection |
| `L2 Generated Artifact` |  |  | generated from declared source only |
| `L3 Verification Evidence` |  |  | evidence, not authorization |
| `L4 Publication Surface` |  |  | owner approval required for public claims |
| `L5 Downstream Runtime/Product` |  |  | downstream only |
| `L6 Codex Execution Governance` |  |  | AGENTS, config, skills, goal template |

## Development Method Execution Table

| Method | Required? | Evidence |
|:---|:---|:---|
| `SCTM` | yes | Goal model and SOT classification |
| `GLFB` | yes | Governance/authorization decision matrix |
| `ITCM` | yes | Repo, object, authority, and derivation topology |
| `RBCT` | yes | Bounded stage plan and stop condition |
| `VIM` | yes | Forbidden-action and risk matrix |
| `PRM` | yes | Retrospective and hardening notes |

## Methodology Separation Table

| Repository Method | Applies? | Surface | Evidence |
|:---|:---|:---|:---|
| `DIV` |  | Generated/provenance surface | Derivation evidence |
| `TSV` |  | Truth-source references | Reference closure |
| `XCV` |  | Cross-surface consistency | Consistency evidence |
| `SCV` |  | Projection completeness | Surface coverage |
| `SUC` |  | SDK/API/runtime usage | Usage evidence |
| `EVC` |  | Version/evolution transition | Compatibility evidence |

## Two-Layer Governance Alignment Table

| Layer | Required Declaration | Status |
|:---|:---|:---|
| Repository Governance | repo role, source/evidence/generated/publication surfaces, remote authority, wrong-authority blockers |  |
| Codex Agentic Harness | required skill, Goal preflight, SOT layer, authorized mutations, forbidden mutations, final verdict |  |

## Local Governance Baseline Evidence Table

This section is mandatory for every non-trivial task before execution
continues. Dynamic governance baseline selection is a precondition for every
non-trivial task. The prompt may define the task and discovery procedure; it
must not be used as policy authority when local governance baseline evidence
exists.

Required rule:

`Prompt assertions are not governance authority unless supported by local repository evidence.`

Produce this local baseline evidence table before any substantive decision,
planning conclusion, edit, verification gate that depends on a policy
classification, release action, publish/upload action, merge, tag, seal, or
cross-repo action:

| Decision Area | Local Evidence File | Evidence Signal | Derived Rule | Confidence | Conflict? | Action |
| ------------- | ------------------- | --------------- | ------------ | ---------- | --------- | ------ |

Allowed confidence values:

- `HIGH_LOCAL_BASELINE_EXPLICIT`
- `MEDIUM_LOCAL_BASELINE_DERIVED`
- `LOW_LOCAL_BASELINE_INFERRED`
- `CONFLICTING_BASELINE`
- `MISSING_BASELINE`

If confidence is `LOW_LOCAL_BASELINE_INFERRED`, `CONFLICTING_BASELINE`, or
`MISSING_BASELINE` for a decision that affects mutation, stop before mutation.

Required blocked verdicts:

- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_MISSING`
- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_CONFLICT`
- `BLOCKED_PROMPT_POLICY_OVERRIDES_LOCAL_BASELINE`
- `BLOCKED_DYNAMIC_BASELINE_SELECTION_NOT_PERFORMED`
- `BLOCKED_SUBSTANTIVE_DECISION_WITHOUT_LOCAL_EVIDENCE`

Use package policy discovery only when package-related, version baseline
discovery only when release/version-related, copyright baseline discovery only
when legal/copyright-related, and cross-repo boundary discovery when more than
one repo is involved.

## Release / Projection Workflow Discovery

This section is mandatory when the task touches or could touch release-like
surfaces. Run or internally satisfy
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` using
`.agents/skills/release-projection-governance-router/SKILL.md` after
repo-truth-first and `TASK-GOVERNANCE-ROUTER-01`, before substantive judgment,
edits, gates, release actions, publish/upload actions, projection, deploy,
merge, tag, or seal.

Declare:

```yaml
release_projection_governance_router:
  router_id: RELEASE-PROJECTION-GOVERNANCE-ROUTER-01
  router_skill: .agents/skills/release-projection-governance-router/SKILL.md
  router_run_before_release_like_work:
  release_like_task:
  repo_role:
  workflow_type:
  local_standard_source_files:
  required_gates:
  required_agents_or_review_perspectives:
  external_baseline_checks:
  required_owner_authorization:
  allowed_mutations:
  forbidden_actions:
  stop_conditions:
  evidence_outputs:
  discovery_verdict:
```

If release-like workflow discovery is skipped or cannot be completed from local
evidence for a mutation-affecting decision, stop with the matching blocker:

- `BLOCKED_DYNAMIC_RELEASE_WORKFLOW_DISCOVERY_NOT_PERFORMED`
- `BLOCKED_RELEASE_GOVERNANCE_BASELINE_MISSING`
- `BLOCKED_RELEASE_GOVERNANCE_BASELINE_CONFLICT`
- `BLOCKED_PUBLISHED_VERSION_BASELINE_MISSING`
- `BLOCKED_REGISTRY_BASELINE_DRIFT`
- `BLOCKED_PUBLIC_PROJECTION_STANDARD_MISSING`
- `BLOCKED_PUBLIC_PROJECTION_STANDARD_CONFLICT`
- `BLOCKED_CROSS_REPO_PROJECTION_NOT_AUTHORIZED`
- `BLOCKED_TAG_SEAL_RELEASE_NOT_AUTHORIZED`
- `BLOCKED_SUBSTANTIVE_RELEASE_DECISION_WITHOUT_LOCAL_EVIDENCE`

## Branch

Create or use a task branch from current `main` unless the owner instructs otherwise. Report whether the branch continues an existing Codex ops branch or is a follow-up branch.

## PR Topology

State the PR URL, base branch, base SHA, head branch, head SHA, whether the base is the default branch, and whether the PR is stacked. Stacked PRs must be declared. A final PR to `main` is required before merge unless the owner explicitly approves a stacked merge sequence.

## Required Skills

List any required `.agents/skills/*/SKILL.md` workflows. `.agents/skills` is the Codex discovery path; `.codex/skills` is retained as the project-internal ops source and compatibility copy.

Default required skill for non-trivial goals:

- `agentic-harness-goal-preflight`
- `release-projection-governance-router` when release-like surfaces are in scope

## Required Subagents Or Custom Agents

List any required `.codex/agents/*.toml` reviewers and the lane each must cover. Standard lanes:

- `package_surface_auditor`
- `release_governance_reviewer`
- `protocol_schema_reviewer`
- `product_boundary_reviewer`
- `runtime_binding_reviewer`
- `publication_claim_reviewer`

Default lane policy: use no subagent for trivial docs typos, one subagent for isolated repo-specific review, and multiple subagents for release, schema, runtime, publication, or cross-repo tasks. Subagents return P0/P1/P2 findings to the parent.

Prompt pattern:

```text
Spawn one subagent per relevant review lane, wait for all results, then consolidate findings into a single parent report. Do not let subagents perform release mutation, version bump, schema intake, public-claim changes, or merge actions.
```

Subagents run review lanes only unless the task explicitly authorizes edits. They inherit sandbox and approval boundaries, must not publish, upload, tag, seal, bump versions, mutate registries, intake schema primitives, merge PRs, or change public claims, and must classify findings as P0/P1/P2 with files inspected and commands run.

## Plan Mode Or Simulated Plan Mode

For medium or high-risk work, write a short plan before edits. Include the intended files, commands, and stopping condition. Update the plan as gates pass or fail.

## Scope

Define allowed files, allowed semantics, and explicit non-goals.

## Out-Of-Scope Surfaces

List surfaces that must not change, including package versions, registries, tags, release seals, protocol schema primitives, product behavior, runtime behavior, Validation Lab evidence logic, public legal/compliance claims, and merge state.

## Forbidden Actions

State forbidden publish, upload, deprecate, yank, delete, dist-tag mutation, tag, seal, package-version, schema-intake, product-behavior, runtime-behavior, public-claim, or broad-rewrite actions.

## Forbidden Action Matrix

| Action | Allowed? | Owner Authorization Required? | Evidence |
|:---|:---|:---|:---|
| No npm publish | no | yes |  |
| No PyPI upload | no | yes |  |
| No tag | no | yes |  |
| No seal | no | yes |  |
| No merge | no | yes |  |
| Registry mutation | no | yes |  |
| Package version change | no | yes |  |
| L0 schema mutation | no | yes |  |
| Cross-repo sync | no unless explicitly scoped | yes |  |

## Stopping Condition

Define the exact evidence that proves the goal is complete.

## Owner Approval Boundary

Stop before any action requiring owner approval, including release mutation, registry mutation, public legal/compliance claim changes, schema primitive intake, package version changes, product behavior changes, runtime behavior changes, release seal creation, merge, or tag creation.

## Merge Boundary

Merge is forbidden by default. Merge is allowed only for an explicit `FINAL_MERGE` or `PR_FINALIZATION` task that names the PR URL, expected head SHA, passing gates, clean worktree, and owner instruction.

## Package Release Rule

External npm/PyPI registry validation is required before no-op closure or version-bump planning. Before publish, regenerate the publish plan, inspect dry-run artifacts, and require an explicit owner approval sentence. Do not mutate registry state from a planning task.

## Instruction Size Guard

Run `wc -c AGENTS.md`. Warn above 24000 bytes. Block if critical boundaries may be truncated.

## Required Commands

Include repo truth, existing-script inspection, and relevant non-mutating verification commands:

```bash
git branch --show-current
git status --short
git rev-parse HEAD
git rev-parse --verify origin/main || true
git rev-parse --verify origin/codex/latest-ops-foundation-wave-01 || true
git log --oneline -5
git diff --check
scripts/codex/repo-truth-first.sh
wc -c AGENTS.md
if [ -d .codex/skills ] && [ -d .agents/skills ]; then diff -qr .codex/skills .agents/skills; fi
```

## Final Report Format

```yaml
completion_report:
  task_id:
  repository:
  branch:
  starting_head:
  final_local_head:
  final_origin_branch_head:
  pr_url:
  pr_base_branch:
  pr_base_sha:
  pr_head_branch:
  pr_head_sha:
  pr_is_stacked:
  recommended_merge_topology:
  files_changed:
  required_skills:
  required_subagents:
  skill_discovery_resolution:
  config_added_or_updated:
  custom_agents_added_or_updated:
  skills_added_or_updated:
  goal_templates_added_or_updated:
  scripts_added_or_updated:
  commands_run:
  pass_fail_results:
  skill_mirror_drift_result:
  agents_md_byte_size:
  forbidden_actions_confirmation:
  final_git_status:
  remaining_risks:
  exact_verdict:
```

## Allowed Final Verdicts

- `<TASK_ID>_READY_FOR_REMOTE_REVIEW`
- `<TASK_ID>_NOT_READY_WITH_BLOCKERS`
- `<TASK_ID>_BLOCKED`

## Sample Goal Mode Invocation

```text
/goal Complete <TASK-ID> until <VERIFIABLE_STOPPING_STATE>. Stop before publish, upload, deprecate, yank, delete, dist-tag mutation, tag, release seal, version bump, schema primitive intake, product behavior change, runtime behavior change, or public legal/compliance claim change.
```

Package release governance example:

```text
/goal Complete MPLP-PACKAGE-OWNER-APPROVED-VERSION-BUMP-PLANNING-WAVE-01 until a version-bump plan is ready for owner review. Stop before editing versions, publishing, uploading, tagging, deprecating, yanking, deleting, or mutating registry state.
```
