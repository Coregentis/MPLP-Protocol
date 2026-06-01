# Codex Goal Template

Use this template for bounded Goal Mode tasks in this repository family. If `/goal` is not available in the current IDE surface, simulate Goal Mode by copying this template into the task prompt and keeping the same stopping condition, forbidden actions, and owner approval boundary.

## Goal

State the concrete objective and the verifiable stopping condition.

## Repository

Name the exact repository path and current branch. Do not assume cloud threads, marketplace features, app-only visibility, or cloud-only execution.

## Branch

Create or use a task branch from current `main` unless the owner instructs otherwise. Report whether the branch continues an existing Codex ops branch or is a follow-up branch.

## PR Topology

State the PR URL, base branch, base SHA, head branch, head SHA, whether the base is the default branch, and whether the PR is stacked. Stacked PRs must be declared. A final PR to `main` is required before merge unless the owner explicitly approves a stacked merge sequence.

## Required Skills

List any required `.agents/skills/*/SKILL.md` workflows. `.agents/skills` is the Codex discovery path; `.codex/skills` is retained as the project-internal ops source and compatibility copy.

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
