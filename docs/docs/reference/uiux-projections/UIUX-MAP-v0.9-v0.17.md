# UI/UX SSOT Projection Map (v0.9–v0.17)

This table provides the human-readable mapping between Validation Lab routes and their authoritative manifest anchors.

| Route | UI Surface | Evidence Role | Primary Anchor Ref (JSON Pointer) | Docs Projection |
| :--- | :--- | :--- | :--- | :--- |
| `/validation` | Validation Dashboard | dashboard | `/anchors/seal_v17_0_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/validation-lab) |
| `/validation/samples` | Evidence Gallery | gallery | `/anchors/sample_set_manifest_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/conformance/evidence-model) |
| `/rulesets/evolution` | Evolution Hub | report | `/anchors/ruleset_diff_index_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/governance/versioning-policy) |
| `/adjudication` | Adjudication Proofs | proof | `/anchors/cross_verified_report_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/conformance/reviewability) |
| `/coverage` | Coverage Matrix | matrix | `/anchors/shipyard_v15/matrix_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/conformance/conformance-model) |
| `/policies/contract` | Evidence Pack Contract | policy | `/anchors/integrity/audit_freeze_manifest_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/conformance/evidence-model) |
| `/runs` | Curated Runs | run | `/anchors/integrity/audit_freeze_manifest_sha256` | [Ref](https://docs.mplp.io/docs/evaluation/tests/golden-flow-registry) |

## Invariants & Compliance
All routes listed above are subject to the following non-normative constraints:
*   **NO_HASH_COPY**: No secondary hashing or repackaging in the UI.
*   **SSOT_POINTER_ONLY**: All identity claims must resolve via manifest pointers.
*   **NON_CERTIFICATION**: Results are institutional evidence-based verdicts, not official marks or endorsements.

---
*Date: 2026-01-25. Verification Gate: `gate-uiux-coverage.ts`.*
