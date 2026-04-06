---
entry_surface: repository
doc_type: governance
status: approved
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-PUBLIC-PROMOTION-VERIFICATION-SUBSTRATE-ADJUDICATION-v0.1"
title: "MPLP Public Promotion Verification Substrate Adjudication v0.1"
---

# MPLP Public Promotion Verification Substrate Adjudication v0.1

## 1. Executive Decision

本文件用于补齐当前 frozen governance objects 中关于 `Phase 4` branch 内
verification substrate 的最小治理缺口。

它只裁决：

- branch 内 `Phase 4` verification 所需 gate scripts
- gate helpers / outputs
- verification-only dist artifact handling

它不裁决：

- general payload import
- public promotion branch update
- public tag publication
- release identity authority change
- public tag namespace change

本文件是：

- a minimal phase-scoped governance adjudication
- subordinate to:
  - `MPLP-PUBLIC-PROMOTION-POLICY-BASELINE-v0.1.md`
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-SPEC-v0.1.md`
  - `MPLP-PUBLIC-PROMOTION-IMPORT-EXCLUDE-ADJUDICATION-MATRIX-v0.1.md`

本文件创建的唯一目的，是合法解锁 branch 内 `Phase 4` verification substrate。

## 2. Governing Inputs

本裁决建立在以下 frozen objects 之上：

- policy baseline:
  - `MPLP-PUBLIC-PROMOTION-POLICY-BASELINE-v0.1.md`
  - commit `616c8db52`
- execution spec:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-SPEC-v0.1.md`
  - commit `361867886`
- import/exclude adjudication matrix:
  - `MPLP-PUBLIC-PROMOTION-IMPORT-EXCLUDE-ADJUDICATION-MATRIX-v0.1.md`
  - commit `d2caf8457`
- execution review:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-REVIEW-2026-04-06.md`
  - commit `043a87914`
- execution approval:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-APPROVAL-2026-04-06.md`
  - commit `749c2a424`

已知 blocker adjudication:

- blocker type:
  - `verification substrate governance gap`
- high-level path verdict:
  - `missing_governance_layer`

## 3. Verification Substrate Adjudication Scope

本文件只处理以下三类 surface：

1. `gate_script`
2. `helper_surface`
3. `verification_output_surface`
4. `verification_only_artifact`

注意：

- 本文件不重新裁决一般 payload import
- 本文件不推翻 matrix 对 `public_defer` 的语义
- 它只为 `Phase 4` 创建一个受限、显式、不可外推的 verification substrate 例外层

## 4. Gate Script Authorization Matrix

| surface_path | substrate_role | phase_scope | execution_decision | payload_status | rationale | stop_condition_if_misused |
|:---|:---|:---|:---|:---|:---|:---|
| `scripts/04-build/pre-release-check.mjs` | `gate_script` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Approved execution sequence explicitly requires in-branch public-line verification; this script is the top-level gate runner | If used outside `Phase 4`, or treated as general payload import, stop execution immediately |
| `scripts/semantic/gate-publish-set.mjs` | `gate_script` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Approved Phase 4 requires rerunning publish-set verification on the promotion branch | If used to justify general script import beyond Phase 4, stop execution immediately |
| `scripts/semantic/gate_pypi_set/main.py` | `gate_script` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Approved Phase 4 requires rerunning the PyPI publish gate in-branch | If used outside `Phase 4`, or to bypass dist-artifact limits defined below, stop execution immediately |

## 5. Helper and Output Surface Authorization Matrix

| surface_path | substrate_role | phase_scope | execution_decision | payload_status | rationale | stop_condition_if_misused |
|:---|:---|:---|:---|:---|:---|:---|
| `scripts/04-build/update-frozen-headers.mjs` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct helper invoked by `pre-release-check.mjs` in `--check` mode | If imported as general payload or executed in apply/mutating mode outside approved verification context, stop execution |
| `scripts/03-docs/semantic/semantic-lint.mjs` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct helper invoked by `pre-release-check.mjs` | If imported outside verification substrate scope, stop execution |
| `scripts/03-docs/semantic/mapping-health.mjs` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct helper invoked by `pre-release-check.mjs` | If used to expand promotion payload, stop execution |
| `scripts/03-docs/verify-governance-styling.mjs` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct helper invoked by `pre-release-check.mjs` | If imported outside verification-only scope, stop execution |
| `scripts/semantic/gate_pypi_set/__init__.py` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Required package entry for `python3 -m scripts.semantic.gate_pypi_set.main` | If omitted or treated as general payload, Phase 4 becomes invalid |
| `scripts/semantic/gate_pypi_set/checks.py` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct relative import from `main.py`; contains normative gate checks | If imported outside Phase 4 scope, stop execution |
| `scripts/semantic/gate_pypi_set/loader.py` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct relative import from `main.py`; required for `pyproject` and manifest loading | If omitted or expanded into general payload, stop execution |
| `scripts/semantic/gate_pypi_set/model.py` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct relative import from `main.py`; required for gate model objects | If omitted or repurposed outside verification scope, stop execution |
| `scripts/semantic/gate_pypi_set/report.py` | `helper_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `not_general_payload` | Direct relative import from `main.py`; required to emit gate evidence outputs | If omitted or treated as payload source, stop execution |
| `artifacts/release/publish-set.json` | `verification_output_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `verification_only` | Expected output target of `gate-publish-set.mjs`; must be part of the verification substrate so gate output is attributable and not unexplained drift | If treated as general promotion payload, stop execution |
| `artifacts/release/publish-gate-report.json` | `verification_output_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `verification_only` | Expected gate evidence output for publish-set verification | If retained beyond verification role without separate release-truth citation, stop execution |
| `artifacts/release/pypi-set.json` | `verification_output_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `verification_only` | Expected output target of the PyPI gate | If used as general payload, stop execution |
| `artifacts/release/pypi-gate-report.json` | `verification_output_surface` | `Phase 4 only` | `AUTHORIZE_IMPORT_FOR_PHASE4` | `verification_only` | Expected gate evidence output for the PyPI gate | If used outside verification/evidence role, stop execution |

## 6. Verification-Only Artifact Adjudication

### 6.1 Dist Artifact Verdict

`packages/pypi/mplp-sdk/dist/*` is adjudicated as:

- `verification_only_artifact`
- `phase_scope`: `Phase 4 only`
- `execution_decision`: `AUTHORIZE_VERIFICATION_ONLY_ARTIFACT_IMPORT`
- `payload_status`: `verification_only`

### 6.2 Authorized Range

The authorized verification-only artifact range is strictly limited to:

- `packages/pypi/mplp-sdk/dist/*.whl`
- `packages/pypi/mplp-sdk/dist/*.tar.gz`

This authorization exists only because the frozen PyPI gate directly checks:

- existence of wheel artifacts
- existence of sdist artifacts

and branch-internal Phase 4 verification has already been approved as the
required execution model.

### 6.3 Limited Exception Rule

This authorization is a narrow exception to the matrix’s existing defer meaning.

It does not cancel the matrix.
It refines it for one phase-scoped purpose only:

- branch-internal `Phase 4` verification

Therefore:

- these dist artifacts remain `not general payload`
- they remain unusable as release payload precedent
- they do not become generally importable surfaces

### 6.4 Stop Condition If Misused

Execution must stop immediately if:

- any dist artifact outside the authorized `packages/pypi/mplp-sdk/dist/*` range
  is imported under this adjudication
- authorized dist artifacts are carried forward as general promotion payload
- authorized dist artifacts are used to justify public publish or branch/tag
  update in this pass

## 7. Cross-Cut Guardrails

### Rule 1 — Verification Substrate Is Not General Payload

All verification substrate imports authorized by this document are:

- phase-scoped
- verification-scoped
- not general promotion payload

They must not be reinterpreted as a broader import right.

### Rule 2 — Phase-Limited Authorization

This authorization applies only to:

- branch-internal `Phase 4` verification

It does not automatically extend to:

- `Phase 5` promotion branch truth sealing
- public branch update
- public tag publication

### Rule 3 — Verification-Only Artifact Guard

Authorized `dist` artifacts are allowed only in a verification-only role.

They must not:

- override matrix defer semantics for other phases
- become general payload
- become publish authorization

### Rule 4 — No Silent Expansion

Execution may not silently expand this adjudication to:

- scripts not listed here
- helpers not listed here
- artifacts not listed here
- output families not listed here

Any such expansion requires a separate adjudication.

## 8. Final Adjudication Verdict

- `APPROVED_AND_FROZEN`

This adjudication closes the minimal governance gap identified by the Phase 4
blocker adjudication:

- gate scripts and helpers are now explicitly authorized as branch-internal
  verification substrate
- required verification output surfaces are now explicitly authorized
- `packages/pypi/mplp-sdk/dist/*` now has a narrow verification-only import
  authorization

This verdict does not rerun Phase 4.
It only makes Phase 4 legally executable under frozen governance constraints.

## 9. Approval Effect

Once frozen, this adjudication becomes the governing source for:

- what verification substrate may be imported into the promotion branch for
  `Phase 4`
- what verification outputs may be written/retained during `Phase 4`
- how `packages/pypi/mplp-sdk/dist/*` may be used in verification-only form

It does not authorize:

- general payload expansion
- public push
- public tag update
- execution beyond the approved verification role defined here
