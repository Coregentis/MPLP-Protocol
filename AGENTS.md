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
