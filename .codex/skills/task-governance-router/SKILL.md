# Task Governance Router

## Purpose

`TASK-GOVERNANCE-ROUTER-01` is the mandatory execution-layer router for
non-trivial Codex tasks in this repository family.

The router chooses what to inspect and what to require; it does not replace
repository governance. It is a discovery mechanism, not a policy override.
Local repository evidence outranks prompt assertions.

## When To Use

Use this skill before any non-trivial task that involves judgment, planning,
file edits, verification gates, release work, package work, cross-repo work,
public claims, credentials, tags, seals, merges, or registry actions.

Skip only for trivial, self-contained tasks that do not depend on repository
state or governance classification.

## Required Inputs

- Current working directory and repository path.
- User request or goal text.
- `AGENTS.md` or the local authoritative agent contract.
- `.codex/config.toml`.
- `governance/codex-goals/CODEX-GOAL-TEMPLATE.md`, when present.
- `scripts/codex/repo-truth-first.sh`, when present.
- `.agents/skills/**` and `.codex/skills/**`, when present.
- `.codex/agents/*.toml` or equivalent reviewer definitions, when present.
- Local governance records relevant to the requested task.

## Required Router Outputs

Before substantive judgment or mutation, internally satisfy or explicitly
record:

1. `repo_truth_summary`
2. `local_governance_baseline_selection`
3. `task_type_classification`
4. `sot_layer_classification`
5. `applicable_repository_governance_methods`
6. `applicable_codex_harness_methods`
7. `applicable_agent_or_reviewer_selection`
8. `applicable_skill_selection`
9. `applicable_gate_selection`
10. `forbidden_action_matrix`
11. `stop_condition_matrix`
12. `evidence_output_plan`

## Discovery Steps

1. Run `scripts/codex/repo-truth-first.sh` if present.
2. Identify repo role, branch, HEAD, remote, dirty state, and upstream SOT.
3. Inspect local governance files before accepting prompt policy assertions.
4. Select the applicable local baseline for the task domain.
5. Classify task type and SOT layer.
6. Select repository governance methods and Codex harness methods.
7. Select reviewer perspectives and concrete agent files if present.
8. Select required gates from local scripts, skills, and records.
9. Build forbidden action and stop-condition matrices.
10. Define evidence outputs before edits or irreversible actions.

If the prompt conflicts with local governance, stop. If local governance is
missing, conflicting, or low-confidence for a mutation-affecting decision, stop.

## Task Type Classifier

Classify at least one:

- `governance_baseline`
- `package_release`
- `package_publish`
- `package_preflight`
- `version_alignment`
- `copyright_owner_surface`
- `schema_protocol`
- `docs_projection`
- `website_projection`
- `public_oss_projection`
- `validation_lab_evidence`
- `runtime_downstream`
- `product_downstream`
- `cross_repo_sync`
- `release_evidence_closure`
- `credential_readiness`
- `post_publish_verification`
- `devtools_or_validator_or_compliance_status`
- `unknown_or_mixed`

For each selected type, discover from local evidence:

- upstream SOT
- allowed mutation surfaces
- forbidden mutation surfaces
- required gates
- required evidence
- required owner decision, if any
- required agents, reviewers, and skills

Do not hardcode package status, repo role, or authorization from the prompt.

## Release-Like Workflow Delegation

If a task is release-like, also run or internally satisfy
`RELEASE-PROJECTION-GOVERNANCE-ROUTER-01` using
`.agents/skills/release-projection-governance-router/SKILL.md` before
substantive judgment, edits, gates, release action, publish/upload, projection,
deploy, merge, tag, or seal.

Release-like surfaces include package publish/upload, version or manifest
changes, publish-set or pypi-set changes, registry baselines, credential
readiness, post-publish verification, release evidence closure, public OSS
projection, website deploy or release notice, Validation Lab publication,
downstream release pointer changes, cross-repo sync/projection, GitHub release,
Git tag, release seal, and merge-to-release workflows.

The release/projection router must complete the local workflow discovery table.
If it cannot be completed from local evidence for a mutation-affecting decision,
stop with the matching release/projection blocker.

## SOT Layer Classifier

Classify touched surfaces:

| Layer | Meaning |
| --- | --- |
| `L0 Protocol Truth` | Protocol schemas, invariants, normative protocol definitions |
| `L1 Projection Source` | Repo-specific source or public projection source |
| `L2 Generated Artifact` | Generated or derived files |
| `L3 Verification Evidence` | Evidence, logs, reports, validation artifacts |
| `L4 Publication Surface` | Public docs, website, README, package metadata, release notes |
| `L5 Downstream Runtime/Product` | Runtime or product behavior surfaces |
| `L6 Codex Execution Governance` | AGENTS, config, skills, goal templates, repo-truth scripts |

## Local Baseline Evidence Table

Use this format:

| Decision Area | Local Evidence File | Evidence Signal | Derived Rule | Confidence | Conflict? | Action |
| --- | --- | --- | --- | --- | --- | --- |

Allowed confidence:

- `HIGH_LOCAL_BASELINE_EXPLICIT`
- `MEDIUM_LOCAL_BASELINE_DERIVED`
- `LOW_LOCAL_BASELINE_INFERRED`
- `CONFLICTING_BASELINE`
- `MISSING_BASELINE`

Stop before mutation when confidence is `LOW_LOCAL_BASELINE_INFERRED`,
`CONFLICTING_BASELINE`, or `MISSING_BASELINE` for a mutation-affecting decision.

## Repository Governance Method Selector

Select local repository methods only when the task touches their surfaces:

- `DIV`: derivation integrity verification
- `TSV`: truth-source verification
- `XCV`: cross-consistency verification
- `SCV`: surface coverage verification
- `SUC`: usage conformance verification
- `EVC`: evidence/version compatibility verification
- package/release gates discovered locally
- copyright, projection, and release records discovered locally

## Codex Agentic Harness Method Selector

For non-trivial tasks, select applicable harness methods:

- `SCTM`: structured context and task model
- `GLFB`: governance logic and feedback boundary
- `ITCM`: information topology and context map
- `RBCT`: risk-bounded change trajectory
- `VIM`: verification and invariants matrix
- `PRM`: post-run retrospective and memory
- `TASK-GOVERNANCE-ROUTER-01`: this router

## Agent / Reviewer Selection Matrix

Inspect `.codex/agents/*.toml` or equivalent definitions. Select concrete
agents when available; otherwise select mandatory review perspectives without
claiming actual subagent execution.

Agent selection is advisory unless the local Codex runtime supports actual
agent invocation. The review perspective and evidence requirements are
mandatory.

Minimum review perspectives:

| Perspective | Use When |
| --- | --- |
| `governance_secretariat` | governance baselines, records, task routing |
| `release_manager` | release planning, release evidence, tags, seals |
| `package_surface_reviewer` | npm/PyPI/package/README/package surface tasks |
| `schema_protocol_reviewer` | schema, invariant, protocol truth tasks |
| `copyright_owner_surface_reviewer` | owner/legal/copyright surface tasks |
| `projection_boundary_reviewer` | public OSS, website, lab, cross-repo projection |
| `validation_evidence_reviewer` | validation lab, evidence, run packs |
| `runtime_downstream_reviewer` | Cognitive OS/runtime downstream tasks |
| `product_downstream_reviewer` | SoloCrew/product downstream tasks |
| `security_no_secret_reviewer` | credentials, auth readiness, secret hygiene |

## Gate Selector

Select gates from local evidence. Examples:

- repo-truth-first
- skill mirror diff
- TOML parse
- JSON parse
- markdown/frontmatter checks
- protected surface scan
- package README/install smoke gate
- package consistency release gate
- schema/protocol gates
- public-claim scans
- runtime/product tests
- no-secret scans

Green gates do not equal owner authorization.

## Forbidden Action Matrix

Declare whether each action is allowed, forbidden, or owner-authorization
required:

- publish, upload, deprecate, yank/delete
- npm dist-tag mutation
- credential or token access/printing
- package version change
- package manifest change
- source/dist runtime package change
- L0 schema change
- release-set or pypi-set change
- public website content change
- product/runtime semantic change
- public projection mutation
- cross-repo sync/copy/cherry-pick
- tag, seal, merge, GitHub release
- deployment

Publish/upload/tag/seal/merge/version/schema/public projection require explicit
local evidence plus owner authorization.

## Stop Conditions

Stop with the matching verdict:

- `BLOCKED_TASK_GOVERNANCE_ROUTER_NOT_RUN`
- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_MISSING`
- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_CONFLICT`
- `BLOCKED_AGENT_SELECTION_NOT_PERFORMED`
- `BLOCKED_REQUIRED_GATE_SELECTION_NOT_PERFORMED`
- `BLOCKED_PROMPT_POLICY_OVERRIDES_LOCAL_BASELINE`
- `BLOCKED_SUBSTANTIVE_DECISION_WITHOUT_LOCAL_EVIDENCE`
- `BLOCKED_PATCH_GATE_FAILURE`

## Evidence Output Requirements

For governance-router tasks, evidence should include:

- repo inventory
- baseline sources inspected
- files changed by repo
- config summary
- skill summary and mirror status
- goal-template summary
- agent/reviewer selection matrix
- required phrase scan
- no-forbidden-surface-change scan
- final verdict

## Final Verdict Vocabulary

- `COMPLETE_TASK_GOVERNANCE_ROUTER_ACTIVE_ALL_REPOS`
- `PARTIAL_TASK_GOVERNANCE_ROUTER_ACTIVE_PUBLIC_PUSH_PENDING`
- `PARTIAL_TASK_GOVERNANCE_ROUTER_BLOCKED_BY_LOCAL_BASELINE_GAP`
- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_MISSING`
- `BLOCKED_LOCAL_GOVERNANCE_BASELINE_CONFLICT`
- `BLOCKED_PATCH_GATE_FAILURE`
