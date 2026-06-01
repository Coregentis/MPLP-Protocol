---
name: repo-truth-first-audit
description: Use before any implementation, refactor, release, schema, docs, or governance task. Inspect branch, HEAD, remote, dirty status, existing files, reusable assets, and why new files are needed.
---

# Repo Truth First Audit

Before making changes, Codex must inspect repository truth.

## Required Commands

Run or equivalent:

```bash
git branch --show-current
git status --short
git rev-parse HEAD
git rev-parse --verify origin/main || true
git log --oneline -5
```

## Required Investigation

Identify:

- current branch
- current local HEAD
- remote HEAD if available
- dirty files
- relevant existing directories
- relevant existing tests
- reusable assets
- missing assets
- why new files are necessary

## Output Format

Before implementation, report:

```yaml
repo_truth:
  branch:
  local_head:
  origin_main_head:
  dirty_status:
  relevant_existing_files:
  reusable_assets:
  missing_assets:
  why_new_files_needed:
  proposed_change_surface:
```

## Rules

- Do not create new files before this audit.
- Do not rewrite existing architecture without explaining why extension is insufficient.
- Prefer update over new document.
