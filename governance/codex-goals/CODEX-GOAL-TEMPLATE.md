# Codex Goal Template

Use this template for bounded Goal Mode tasks in this repository family.

## Goal

State the concrete objective and the verifiable stopping condition.

## Repository

Name the exact repository path and current branch. Do not assume cloud threads or app-only features.

## Branch

Create or use a task branch from current `main` unless the owner instructs otherwise.

## Required Skills

List any required `.codex/skills/*/SKILL.md` workflows.

## Required Subagents

List any required `.codex/agents/*.toml` reviewers and the lane each must cover.

## Scope

Define allowed files, allowed semantics, and explicit non-goals.

## Forbidden Actions

State forbidden publish, upload, deprecate, yank, tag, seal, package-version, schema-intake, public-claim, or broad-rewrite actions.

## Stopping Condition

Define the exact evidence that proves the goal is complete.

## Owner Approval Boundary

Stop before any action requiring owner approval, including release mutation, public legal/compliance claim changes, schema primitive intake, or package version changes.

## Commands To Run

Include repo truth, existing-script inspection, and relevant non-mutating verification commands.

## Final Report Format

```yaml
completion_report:
  task_id:
  repository:
  branch:
  starting_head:
  final_head:
  files_changed:
  reused_existing_assets:
  new_files_created_and_why:
  config_added_or_updated:
  custom_agents_added_or_updated:
  skills_added_or_updated:
  goal_templates_added_or_updated:
  scripts_added_or_updated:
  commands_run:
  pass_fail_results:
  forbidden_actions_confirmation:
  final_git_status:
  remaining_risks:
  exact_verdict:
```

## Allowed Final Verdicts

- `<TASK_ID>_READY_FOR_REVIEW`
- `<TASK_ID>_BLOCKED`

## Sample Goal Mode Invocation

```text
/goal Complete <TASK-ID> until <VERIFIABLE_STOPPING_STATE>. Stop before publish, upload, deprecate, tag, seal, version bump, or public legal/compliance claim change.
```
