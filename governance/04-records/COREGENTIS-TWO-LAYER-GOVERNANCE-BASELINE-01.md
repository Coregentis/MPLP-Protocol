---
entry_surface: repository
entry_model_class: projection
doc_type: governance
status: final
authority: repository
doc_id: "COREGENTIS-TWO-LAYER-GOVERNANCE-BASELINE-01"
surface_role: public_oss_projection_governance
record_state: final
title: "Coregentis Two-Layer Governance Baseline 01"
---

# Coregentis Two-Layer Governance Baseline 01

## Purpose

This record closes the Coregentis two-layer governance baseline for
`MPLP-Protocol` as the public OSS projection repo.

The Coregentis canonical workspace root is
`/Users/jasonwang/Documents/AI_Dev/Coregentis`.

## Repository Role

| Field | Value |
|:---|:---|
| Repo | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol` |
| Role | `PUBLIC_OSS_PROJECTION` |
| Authoritative upstream | `/Users/jasonwang/Documents/AI_Dev/Coregentis/MPLP-Protocol-Dev` |
| Remote authority | `origin` after inspection, task branches only unless explicitly authorized |
| Not authority for | Dev package truth, source recovery, package publication, registry mutation, release seal, public main/default push |

## Two-Layer Governance

Layer A: Repository Governance defines public projection source surfaces,
generated/evidence surfaces, projection boundaries, remote authority, release
boundaries, and wrong-authority blockers.

Layer B: Codex Agentic Harness requires
`.agents/skills/agentic-harness-goal-preflight/SKILL.md` and
`governance/codex-goals/CODEX-GOAL-TEMPLATE.md` for every non-trivial Goal.
Goals must execute `SCTM`, `GLFB`, `ITCM`, `RBCT`, `VIM`, and `PRM`.

Repository methods `DIV`, `TSV`, `XCV`, `SCV`, `SUC`, and `EVC` apply only when
the Goal touches their relevant repository surfaces.

## SOT Boundary

| Layer | Boundary |
|:---|:---|
| `L0 Protocol Truth` | MPLP-Protocol-Dev unless a governed public projection goal explicitly scopes otherwise |
| `L1 Projection Source` | Public OSS source projected from Dev truth |
| `L2 Generated Artifact` | Generated output only when provenance is declared |
| `L3 Verification Evidence` | Evidence only, not release or mutation authority |
| `L4 Publication Surface` | Public OSS surface, owner approval required for public projection push/release claims |
| `L5 Downstream Runtime/Product` | Cognitive OS and SoloCrew consume downstream |
| `L6 Codex Execution Governance` | `AGENTS.md`, `.codex/config.toml`, `.agents/skills`, `.codex/skills`, Goal Template |

## Forbidden Authority Misuse

This repo must not be used for package/source recovery, Dev-only package
decisions, npm publish, PyPI upload, registry mutation, package version changes,
tag creation, release seal creation, PR merge, L0 schema mutation, or public
main/default branch push without explicit owner authorization.

V1.0_release is frozen as migration/evidence source only and must not be
treated as global MPLP SOT.

## Cross-Repo Rules

Dev -> Public OSS projection requires an explicit projection goal. Public -> Dev
backflow requires explicit drift review and owner approval. No cross-repo sync,
copy, cherry-pick, source restoration, or dist restoration is authorized by this
baseline.

## Blocking Verdicts

Relevant blockers include:

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

## Forbidden Action Compliance

No npm publish. No PyPI upload. No tag. No seal. No merge. No registry
mutation. No package version change. No L0 schema mutation. No package artifact
generation. No source/dist restoration. No public projection push is authorized
by this baseline.

## Final Verdict

`PUBLIC_OSS_PROJECTION_TWO_LAYER_GOVERNANCE_BASELINE_RECORDED`
