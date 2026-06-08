# Repository Operating Rules for Codex

This repository is part of the Coregentis MPLP / Cognitive OS / SoloCrew / Validation Lab project family. Codex work here must preserve project boundaries and produce verifiable engineering evidence.

## Repository Layer

MPLP owns protocol objects, schemas, invariants, conformance vocabulary, and protocol documentation. The 10-module v1 baseline remains the protocol anchor. Protocol core must stay product-neutral, runtime-neutral, vendor-neutral, and free of product, commercial validation, certification, regulator-approval, legal-compliance proof, or vendor-ranking claims. v1 references to v2 objects must remain pointer-only; do not inline product, runtime, or commercial semantics into protocol core.

## Coregentis Workspace Authority

The Coregentis canonical workspace root is
`/Users/jasonwang/Documents/AI_Dev/Coregentis`.

This repository is the MPLP public OSS projection. It is not MPLP protocol,
package, or release Dev truth. MPLP-Protocol-Dev is protocol/package/release Dev truth:
`/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol-Dev`.

V1.0_release is frozen as migration/evidence source. Do not treat
V1.0_release as global MPLP SOT.
V1.0_release is frozen as migration/evidence source; do not treat V1.0_release as global MPLP SOT.

Do not perform package/source recovery, Dev-only package decisions, publish,
upload, tag, seal, merge, or public projection push from this repo without an
explicit public projection or release goal. Cross-repo sync requires an
explicit migration, backport, or projection goal.

Future Dev-side goals remain `DEV-HARNESS-BACKPORT-01` and
`PACKAGE-DEV-TRUTH-SOURCE-RECOVERY-PLAN-01`; this repo grants no publish, no upload, no tag, no seal, and no merge authorization.

## Repo Truth First

Before implementation, inspect repository truth:

- `git branch --show-current`
- `git status --short`
- `git rev-parse HEAD`
- `git rev-parse --verify origin/main || true`
- `git log --oneline -5`

Reuse existing assets before creating new files. Prefer updating an existing rule, skill, script, audit, or governance record over creating a duplicate document.

## Codex Skill Discovery

- `.agents/skills/*/SKILL.md` is the repository-scoped Codex skill discovery path.
- `.codex/skills/*/SKILL.md` is retained as the project-internal ops source and compatibility copy.
- Keep mirrored skills same-named and content-equivalent; do not create divergent SOPs.

## Two-Layer Governance

Every non-trivial Goal in this repo must satisfy both governance layers before
implementation:

- Layer A: Repository Governance. Declare this repo's public OSS projection
  role, source surfaces, generated/evidence surfaces, release/publication
  boundaries, authoritative remote, upstream Dev truth, downstream
  projections, and forbidden authority misuse.
- Layer B: Codex Agentic Harness. Use
  `.agents/skills/agentic-harness-goal-preflight/SKILL.md` and
  `governance/codex-goals/CODEX-GOAL-TEMPLATE.md` to execute `SCTM`, `GLFB`,
  `ITCM`, `RBCT`, `VIM`, and `PRM` before and after the bounded Goal.

Repository governance methods `DIV`, `TSV`, `XCV`, `SCV`, `SUC`, and `EVC`
apply only when the task touches their relevant surfaces. Public OSS projection
work must remain downstream of MPLP-Protocol-Dev truth and must not become
package/source recovery, registry mutation, or L0 protocol authority.

Required blocked verdicts for wrong-authority or owner-approval violations:

- `BLOCKED_WORKSTREAM_AUTHORITY_MISMATCH`
- `BLOCKED_LOCAL_REPO_AUTHORITY_MISMATCH`
- `BLOCKED_REMOTE_AUTHORITY_MISMATCH`
- `BLOCKED_CROSS_REPO_SYNC_NOT_AUTHORIZED`
- `BLOCKED_OWNER_AUTHORIZATION_REQUIRED`
- `BLOCKED_PUBLIC_PROJECTION_AUTHORIZATION_REQUIRED`
- `BLOCKED_V1_USED_AS_GLOBAL_MPLP_SOT`
- `BLOCKED_DEV_TRUTH_REQUIRED`
- `BLOCKED_DOWNSTREAM_REPO_USED_AS_PROTOCOL_TRUTH`
- `BLOCKED_SCHEMA_TRUTH_SOURCE_MISSING`
- `BLOCKED_L0_MUTATION_WITHOUT_SCHEMA_INTAKE`
- `BLOCKED_PACKAGE_RECOVERY_IN_PROJECTION_REPO`
- `BLOCKED_PACKAGE_PREFLIGHT_FROM_STALE_PROJECTION`
- `BLOCKED_PACKAGE_PUBLICATION_AUTHORIZATION_REQUIRED`
- `BLOCKED_PACKAGE_ARTIFACT_PROVENANCE_MISSING`

## Local Governance Baseline Discovery

Every non-trivial Codex task must discover, cite, and apply this repository's
local governance baseline before making any substantive decision or mutation.
Dynamic governance baseline selection is a precondition for every non-trivial
task.

The user prompt and assistant prompt may define the requested task and discovery
procedure, but they do not override local repository governance. Prompt
assertions are not governance authority unless supported by local repository
evidence. If prompt assertions conflict with local evidence, stop and report
the conflict.

Every non-trivial task must produce a local baseline evidence table before
execution continues:

| Decision Area | Local Evidence File | Evidence Signal | Derived Rule | Confidence | Conflict? | Action |
|:---|:---|:---|:---|:---|:---|:---|

Allowed confidence values are `HIGH_LOCAL_BASELINE_EXPLICIT`,
`MEDIUM_LOCAL_BASELINE_DERIVED`, `LOW_LOCAL_BASELINE_INFERRED`,
`CONFLICTING_BASELINE`, and `MISSING_BASELINE`. Stop before mutation when a
mutation-affecting decision depends on low, conflicting, or missing evidence.

Required local-baseline blocker verdicts:

- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_MISSING`
- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_CONFLICT`
- `BLOCKED_PROMPT_POLICY_OVERRIDES_LOCAL_BASELINE`
- `BLOCKED_DYNAMIC_BASELINE_SELECTION_NOT_PERFORMED`
- `BLOCKED_SUBSTANTIVE_DECISION_WITHOUT_LOCAL_EVIDENCE`

Use package policy discovery only when a task is package-related, version
baseline discovery only when a task is release/version-related, copyright
baseline discovery only when a task touches legal/copyright attribution, and
cross-repo boundary discovery when more than one repository is involved. Do not
hard-code package status, release versions, copyright owner conclusions, public
projection permission, or protocol authority from the prompt.

## Task Governance Router

`TASK-GOVERNANCE-ROUTER-01` is mandatory before every non-trivial task. It is a
discovery mechanism, not a policy override: local repository evidence outranks
prompt assertions.

Before substantive judgment or mutation, Codex must use
`.agents/skills/task-governance-router/SKILL.md` to satisfy or record:

- repo truth summary
- local governance baseline selection
- task type classification
- SOT layer classification
- applicable repository governance methods
- applicable Codex Agentic Harness methods
- applicable agent or reviewer selection
- applicable skill selection
- applicable gate selection
- forbidden action matrix
- stop condition matrix
- evidence output plan

The router must classify package, release, schema, projection, website,
validation, runtime, product, credential, post-publish, evidence-closure, and
unknown/mixed tasks from local evidence. It must not hard-code package status,
version strategy, repo authority, or public projection permission from the
prompt.

If the router is not run, stop with
`BLOCKED_TASK_GOVERNANCE_ROUTER_NOT_RUN`. If agent/reviewer selection or
required gate selection is missing, stop with
`BLOCKED_AGENT_SELECTION_NOT_PERFORMED` or
`BLOCKED_REQUIRED_GATE_SELECTION_NOT_PERFORMED`.

Green gates do not equal owner authorization. Publish, upload, deprecate,
dist-tag mutation, package version changes, package manifest changes, L0 schema
changes, public projection mutation, tag, seal, merge, GitHub release,
deployment, and credential access require explicit local evidence plus owner
authorization.

## Release / Projection Governance Router

For any task that touches or could touch release-like surfaces, run
`.agents/skills/release-projection-governance-router/SKILL.md` after
repo-truth-first and `TASK-GOVERNANCE-ROUTER-01`, before substantive judgment,
edits, gates, or irreversible action.

Release-like surfaces include npm/PyPI publication, package version or manifest
changes, publish-set or pypi-set changes, registry baselines, credential
readiness, post-publish verification, release evidence closure, public OSS
projection, website deploy or release notice, Validation Lab publication,
downstream release pointer changes, cross-repo sync/projection, Git tag,
release seal, GitHub release, and merge-to-release workflows.

The release/projection router must complete a local evidence table for repo
role, workflow type, local standard source files, required gates, reviewer
lanes, external baselines, owner authorization, allowed mutations, forbidden
actions, stop conditions, and evidence outputs. If the table cannot be
completed from local evidence for a mutation-affecting decision, stop with the
matching release/projection blocker.

For version-bump planning, owner-approved version implementation, publish
planning, or publish execution, the version baseline is the latest published
npm or PyPI registry version for each exact package name. Current local
`package.json`, `pyproject.toml`, generated dist, release-set files, pypi-set
files, prior PRs, green gates, or historical artifacts are repo state or
evidence only; they are not the authority baseline for deciding the next public
package version.

## Hard Boundaries

- Preserve protocol, runtime, product, validation, and publication boundaries.
- Normal task-authorized changes may modify files within the explicitly scoped repository layer, including low-risk code or docs that the current task asks for.
- Owner approval is required for high-risk or irreversible changes, including release mutation, registry mutation, public legal/compliance claims, package version changes, schema primitive intake, provider-send behavior, auth/payment/data-deletion flows, runtime authority changes, and merge/tag/seal actions.
- Forbidden without explicit owner approval:
  - `npm publish`
  - `npm deprecate`
  - npm dist-tag add/remove
  - PyPI upload
  - PyPI yank/delete
  - `git tag`
  - release seal creation
  - package version bump
  - schema object intake
  - external registry mutation
- Do not make public certification, regulator-approval, vendor-ranking, official-standard, or legal-compliance proof claims without owner approval.
- Do not over-block normal task-authorized development.

## MPLP Schema v2 Discipline

For MPLP `schemas/v2` work, use this order:

1. Invariant first.
2. Negative fixture second.
3. Object schema third.
4. Positive fixture fourth.
5. Validator and conformance gates last.

v1.0 module references to v2 objects must be pointer-only. Do not inline v2 object fields into v1 module schemas.

## Boundary Language

- No product, runtime, commercial, certification, legal-compliance, regulator-approval, or vendor-ranking language may leak into MPLP protocol core.
- No protocol authority may leak into product UI.
- Cognitive OS may bind to MPLP semantics but must not redefine MPLP protocol authority.
- Validation Lab may present deterministic evidence and adjudication but must not become a certification authority.
- SoloCrew UI must not expose internal protocol/runtime jargon as primary user-facing copy.

## Standard Subagent Lanes

Use `.codex/agents/*.toml` reviewers only when the parent task explicitly requests them. Relevant lanes include `package_surface_auditor`, `release_governance_reviewer`, `protocol_schema_reviewer`, `product_boundary_reviewer`, `runtime_binding_reviewer`, and `publication_claim_reviewer`.

Default lane policy: use no subagent for trivial docs typos, one subagent for isolated repo-specific review, and multiple subagents for release, schema, runtime, publication, or cross-repo tasks. MPLP-Protocol defaults to `protocol_schema_reviewer`, with `release_governance_reviewer` and `package_surface_auditor` as secondary lanes when the task touches package surfaces, schema intake, conformance, or release planning.

Subagents run review lanes only unless edits are explicitly authorized. They inherit sandbox and approval boundaries, must not publish, upload, tag, seal, bump versions, mutate registries, intake schema primitives, merge PRs, or change public claims, and must return P0/P1/P2 findings to the parent with files inspected and commands run.

## Completion Discipline

Do not declare completion without reporting:

- files changed
- commands run
- pass/fail evidence
- final git status
- remaining risk

If a verification command is unavailable or inappropriate, state why instead of silently skipping it.
