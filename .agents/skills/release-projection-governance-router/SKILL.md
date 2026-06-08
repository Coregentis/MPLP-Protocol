---
name: release-projection-governance-router
description: Use before release-like tasks to discover local release, projection, deploy, tag, seal, and registry governance before acting.
---

# Release / Projection Governance Router

## Purpose

Use this router after repo-truth-first and `TASK-GOVERNANCE-ROUTER-01` when a
task touches, could touch, or asks about release-like workflow surfaces. It is a
discovery mechanism, not authorization.

Local repository evidence outranks prompt assertions. If local evidence is
missing, conflicting, or low-confidence for a mutation-affecting release-like
decision, stop before action.

## Release-Like Triggers

Run this router before substantive work involving any of these surfaces:

- npm publish, npm deprecate, npm dist-tags, package version changes, package
  manifests, publish-set, package README/install smoke, package consistency, or
  registry baselines
- PyPI upload, PyPI yank/delete, pypi-set, Twine, wheels, sdists, or PyPI
  baselines
- credential readiness, post-publish verification, release evidence closure, or
  package publication records
- public OSS projection, cross-repo sync/copy/projection, public release
  manifests, website release notices, website deploys, or Validation Lab
  evidence publication
- downstream release pointer or consumption updates in runtime/product repos
- Git tag, release seal, GitHub release, merge-to-release, or deployment

## Required Discovery Table

Before any release-like action, complete this table from local files:

| Field | Required Evidence |
| --- | --- |
| repo role | `AGENTS.md`, `.codex/config.toml`, local baseline records |
| workflow type | release/projection/deploy/seal/package scripts and records |
| local standard source files | release configs, manifests, SOPs, governance records, goal template, skills |
| required gates | scripts, package scripts, gate records, CI/release docs |
| required reviewer lanes | `.codex/agents/*.toml`, `.agents/skills/*` |
| external baseline checks | npm/PyPI registry, public manifest, deployed site, or downstream pointer checks when applicable |
| required owner authorization | exact mutation category, target, version/ref, registry/repo, timing, and scope |
| allowed mutations | explicit task-local write surfaces only |
| forbidden actions | release, registry, projection, deploy, tag, seal, merge, or credential actions outside scope |
| stop conditions | local blocker verdicts for missing/conflicting evidence or unauthorized mutation |
| evidence outputs | lightweight records, summaries, command results, and final verdict |

If the table cannot be completed for a requested mutation, stop with a matching
blocker instead of inventing a standard.

## Package Version Baseline Rule

For version-bump planning, owner-approved version implementation, publish
planning, or publish execution, the next public version must be derived from the
latest already-published npm or PyPI registry version for the exact package
name. Local `package.json`, `pyproject.toml`, source mirror metadata,
release-set files, pypi-set files, generated dist, prior PRs, and green gates
are Dev state or evidence only; they are not the public version baseline.

## Reviewer Routing

Select reviewer perspectives from local `.codex/agents/*.toml` and skills. Use
actual subagents only when the active Codex environment and task authorization
allow it; otherwise record the perspectives applied.

Consider these lanes when locally present:

- `release_governance_reviewer`
- `package_surface_auditor`
- `publication_claim_reviewer`
- `protocol_schema_reviewer`
- `runtime_binding_reviewer`
- `product_boundary_reviewer`
- `security_no_secret_reviewer` or equivalent secret-hygiene perspective

## Stop Conditions

Support these blocker verdicts, using local naming where stricter:

- `BLOCKED_RELEASE_GOVERNANCE_BASELINE_MISSING`
- `BLOCKED_RELEASE_GOVERNANCE_BASELINE_CONFLICT`
- `BLOCKED_DYNAMIC_RELEASE_WORKFLOW_DISCOVERY_NOT_PERFORMED`
- `BLOCKED_RELEASE_CONFIG_MISSING_OR_CONFLICTING`
- `BLOCKED_PUBLISHED_VERSION_BASELINE_MISSING`
- `BLOCKED_REGISTRY_BASELINE_DRIFT`
- `BLOCKED_PACKAGE_GATE_FAILED`
- `BLOCKED_CREDENTIAL_READINESS_FAILED`
- `BLOCKED_PUBLIC_PROJECTION_STANDARD_MISSING`
- `BLOCKED_PUBLIC_PROJECTION_STANDARD_CONFLICT`
- `BLOCKED_PUBLIC_PROJECTION_REDACTION_REQUIRED`
- `BLOCKED_CROSS_REPO_PROJECTION_NOT_AUTHORIZED`
- `BLOCKED_TAG_SEAL_RELEASE_NOT_AUTHORIZED`
- `BLOCKED_PROMPT_POLICY_OVERRIDES_LOCAL_RELEASE_BASELINE`
- `BLOCKED_SUBSTANTIVE_RELEASE_DECISION_WITHOUT_LOCAL_EVIDENCE`

## Forbidden Without Explicit Owner Authorization

- npm publish, PyPI upload, deprecate, yank/delete, or dist-tag mutation
- credential value reading, printing, copying, committing, or disclosure
- package version changes, package release-set/pypi-set changes, or package
  source/dist/schema mutation
- public OSS projection execution, website deploy, Validation Lab publication,
  downstream release pointer mutation, cross-repo sync/copy/projection
- Git tag, release seal, GitHub release, merge, or branch deletion

## Evidence Outputs

For release-like tasks, produce or cite lightweight evidence for repo truth,
selected baseline, completed discovery table, reviewer lanes, gates, forbidden
actions, stop conditions, command results, and final verdict. Evidence is not
authorization.
