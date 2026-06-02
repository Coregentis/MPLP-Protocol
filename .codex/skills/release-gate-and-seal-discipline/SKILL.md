---
name: release-gate-and-seal-discipline
description: Use before declaring any task, PR, release, RC, seal, deployment, or merge complete. Requires commands run, pass/fail evidence, remote truth, and remaining risk.
---

# Release Gate and Seal Discipline

Codex must not declare completion without verification.

## Required Report

```yaml
completion_report:
  branch:
  starting_head:
  final_head:
  files_changed:
  commands_run:
  pass_fail_results:
  tests_added_or_updated:
  governance_records_changed:
  remote_truth_checked:
  final_git_status:
  remaining_risks:
  exact_verdict:
```

## Common Checks

Use repo-specific commands if available. Otherwise inspect package scripts first:

```bash
cat package.json | sed -n '1,160p'
```

Then run available gates:

```bash
git diff --check
pnpm run build
pnpm run lint
pnpm run test
```

If commands differ, explain why.

## Forbidden

- Do not say "done" without command output summary.
- Do not tag release without owner approval.
- Do not create seal record without owner approval.
- Do not claim live deployment unless repo truth, build truth, remote truth, and live truth are checked.
