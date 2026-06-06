---
name: agentic-harness-goal-preflight
description: Apply Coregentis two-layer governance before, during, and after non-trivial Codex goals.
---

# Agentic Harness Goal Preflight

Use this skill for every non-trivial Goal in this repository. The Coregentis
canonical workspace root is `/Users/jasonwang/Documents/AI_Dev/Coregentis`.
This repository must execute two-layer governance before implementation:

- Layer A: Repository Governance for repo truth, remote authority, source
  surfaces, generated artifacts, evidence surfaces, publication boundaries, and
  cross-repo sync boundaries.
- Layer B: Codex Agentic Harness for Goal execution using `SCTM`, `GLFB`,
  `ITCM`, `RBCT`, `VIM`, and `PRM`.

`V1.0_release` is frozen as migration/evidence source only. It is not global
MPLP SOT.

## Methodology Separation

| Method ID | Layer | Purpose | Evidence |
|:---|:---|:---|:---|
| `SCTM` | Codex Agentic Harness | Convert the user request into a governed task model | Goal model and SOT classification |
| `GLFB` | Codex Agentic Harness | Separate technical possibility, governance permission, owner authorization, and strategic correctness | Decision matrix |
| `ITCM` | Codex Agentic Harness | Map repositories, objects, layers, authority, and derivation edges | Topology and constraint map |
| `RBCT` | Codex Agentic Harness | Bound the work to one staged Goal with stop conditions | Stage plan |
| `VIM` | Codex Agentic Harness | Identify forbidden actions, irreversible risks, impact, and mitigation | Forbidden-action matrix |
| `PRM` | Codex Agentic Harness | Convert findings into method hardening and retrospective evidence | Retrospective |
| `DIV` | Repository Governance | Verify derivation boundary and provenance | Derivation evidence |
| `TSV` | Repository Governance | Verify truth-source references and dependency closure | Truth-source evidence |
| `XCV` | Repository Governance | Verify cross-surface consistency | Consistency evidence |
| `SCV` | Repository Governance | Verify projection surface completeness | Surface coverage evidence |
| `SUC` | Repository Governance | Verify usage conformance | Usage evidence |
| `EVC` | Repository Governance | Verify evolution compatibility | Compatibility evidence |

Do not confuse Codex execution methods with repository verification methods.
Use repository methods only when the Goal touches their relevant surfaces.

## Mandatory Goal Preflight

Every non-trivial Goal must declare:

- workstream
- current local repo
- authoritative local repo
- current tracking remote
- authoritative remote
- allowed push target, if push is in scope
- forbidden remotes
- SOT layer `L0` through `L6`
- upstream SOT
- downstream derivatives
- authorized mutations
- forbidden mutations
- cross-repo sync in scope or not
- owner authorization required or not
- repo governance methods applicable
- final stop condition

SOT layers:

- `L0 Protocol Truth`
- `L1 Projection Source`
- `L2 Generated Artifact`
- `L3 Verification Evidence`
- `L4 Publication Surface`
- `L5 Downstream Runtime/Product`
- `L6 Codex Execution Governance`

## Required Execution Order

1. `SCTM`: clarify task and model governed intent.
2. `GLFB`: separate feasibility, permission, and owner authorization.
3. `ITCM`: map repo topology, SOT layers, upstream/downstream dependencies, and constraints.
4. `RBCT`: define the bounded stage plan and stop conditions.
5. `VIM`: identify forbidden actions and mitigation.
6. Execute only authorized governance or task-scope actions.
7. `PRM`: record retrospective evidence and hardening recommendations.

## Repository / Remote Authority

Default authority matrix:

| Workstream | Authoritative local repo | Authoritative remote | Forbidden without explicit owner authorization |
|:---|:---|:---|:---|
| MPLP protocol/package/release Dev truth | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol-Dev` | Dev repo `origin` after inspection | public OSS push, publish, upload, tag, seal, merge |
| MPLP public OSS projection | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol` | public projection `origin` after inspection | source recovery, package preflight from stale projection, public main/default push |
| Cognitive OS runtime downstream | `/Users/jasonwang/Documents/AI_Dev/Coregentis/Cognitive_OS` | repo `origin` after inspection | treating runtime evidence as protocol truth |
| SoloCrew product downstream | `/Users/jasonwang/Documents/AI_Dev/Coregentis/SoloCrew` | repo `origin` after inspection | treating product need as protocol truth |
| Validation evidence surface | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Validation-Lab` | repo `origin` after inspection | treating validation evidence as protocol truth or package publication root |
| Website publication surface | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Official-Website` | repo `origin` after inspection | treating website copy as protocol truth |
| V1.0_release migration source | `/Users/jasonwang/Documents/AI_Dev/V1.0_release` | no active development authority | active development or global SOT use |

## Blocked Verdicts

Stop before mutation and report the relevant verdict:

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
- `BLOCKED_RUNTIME_NEED_DIRECTLY_MUTATES_PROTOCOL`
- `BLOCKED_PRODUCT_NEED_DIRECTLY_MUTATES_PROTOCOL`
- `BLOCKED_VALIDATION_SURFACE_USED_AS_PROTOCOL_TRUTH`
- `BLOCKED_WEBSITE_USED_AS_PROTOCOL_TRUTH`

## Forbidden Actions

Unless the owner explicitly authorizes the exact action and scope:

- No npm publish
- No PyPI upload
- No tag
- No seal
- No merge
- no registry mutation
- no package version change
- no L0 schema mutation
- no package artifact generation
- no source/dist restoration
- no cross-repo sync
- no public projection push

## Final Report

Every Goal must close with files changed, commands run, evidence, final git
status, remaining risks, forbidden-action compliance, and exact verdict.
