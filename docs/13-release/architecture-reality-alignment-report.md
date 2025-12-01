---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Architecture Reality Alignment Report (RBCT)

```yaml\nFile: docs/13-release/architecture-reality-alignment-report.md
Status: Generated (Ground Truth)
Date: 2025-12-01
```

---

## 1. Executive Summary

This report establishes the **Ground Truth** for the `01-architecture` governance phase. It compares the actual codebase state (schemas, packages, tests) against the architectural documentation requirements.

**Overall Alignment Status**: 🟡 **PARTIAL ALIGNMENT**
- **L1 (Schemas)**: ✅ Strong alignment. 10 core modules + 12 event families exist.
- **L2 (Modules)**: ✅ Strong alignment. Module documentation matches schema reality.
- **L3 (Runtime)**: ⚠️ Partial alignment. Runtime glue specs exist, but package structure in `packages/reference-runtime` needs verification against spec claims.
- **L4 (Integration)**: ⚠️ Partial alignment. `packages/integration` exists with 4 sub-packages, but docs often refer to "no integration packages".

---

## 2. L1: Schemas & Invariants (Ground Truth)

**Location**: `schemas/v2/*.json` & `schemas/v2/events/*.json`

| Module | Schema File | Status |
| :--- | :--- | :--- |
| **Context** | `mplp-context.schema.json` | ✅ Exists |
| **Plan** | `mplp-plan.schema.json` | ✅ Exists |
| **Confirm** | `mplp-confirm.schema.json` | ✅ Exists |
| **Trace** | `mplp-trace.schema.json` | ✅ Exists |
| **Role** | `mplp-role.schema.json` | ✅ Exists |
| **Extension** | `mplp-extension.schema.json` | ✅ Exists |
| **Dialog** | `mplp-dialog.schema.json` | ✅ Exists |
| **Collab** | `mplp-collab.schema.json` | ✅ Exists |
| **Core** | `mplp-core.schema.json` | ✅ Exists |
| **Network** | `mplp-network.schema.json` | ✅ Exists |

**Event Families**:
- 12 Observability Families (GraphUpdate, PipelineStage, etc.) confirmed in `schemas/v2/events/`.
- 4 Integration Families confirmed in `schemas/v2/integration/`.
- 6 Learning Families confirmed in `schemas/v2/learning/`.

**Conclusion**: L1 documentation must strictly reference these filenames.

---

## 3. L2: Modules & Profiles (Ground Truth)

**Location**: `docs/02-modules/` & `docs/03-profiles/`

- **Modules**: 10 Markdown files exist, matching the 10 schemas.
- **Profiles**:
    - `mplp-sa-profile.yaml` (SA) ✅ Exists
    - `mplp-map-profile.yaml` (MAP) ✅ Exists
    - `map-events.md` & `sa-events.md` ✅ Exist

**Conclusion**: L2 architecture is well-defined. `l2-coordination-governance.md` must accurately reflect the SA/MAP split.

---

## 4. L3: Runtime & Execution (Ground Truth)

**Location**: `docs/06-runtime/` & `packages/reference-runtime/`

- **Specs**: `mplp-runtime-glue-overview.md`, `module-psg-paths.md`, `drift-detection-spec.md` exist.
- **Code**: `packages/reference-runtime` contains `orchestrator`, `ael`, `vsl`, `registry`.
- **Gap**: Documentation often treats Runtime Glue as purely speculative, but reference implementation exists.

**Conclusion**: `l3-execution-orchestration.md` must bridge the gap between the abstract "Runtime Glue" spec and the concrete reference implementation structure.

---

## 5. L4: Integration & Infra (Ground Truth)

**Location**: `docs/07-integration/` & `packages/integration/`

- **Specs**: `mplp-minimal-integration-spec.md` exists.
- **Code**: `packages/integration` contains:
    - `llm-http`
    - `storage-fs`
    - `storage-kv`
    - `tools-generic`
- **Critical Correction**: Historical docs claim "MPLP has no integration packages". **This is FALSE.** The `packages/integration` folder exists and contains adapters.

**Conclusion**: `l4-integration-infra.md` MUST be rewritten to acknowledge the existence of `packages/integration` as the reference implementation of L4.

---

## 6. Testing & Validation (Ground Truth)

**Location**: `tests/golden/flows/`

- **9 Golden Flows** confirmed:
    - `flow-01` to `flow-05` (Core)
    - `sa-flow-01`, `sa-flow-02` (SA Profile)
    - `map-flow-01`, `map-flow-02` (MAP Profile)

**Conclusion**: Architecture docs must cite these specific flows as the validation standard.

---

## 7. Action Items for Architecture Rewrite

1.  **Global**: Apply "Frozen Specification" header to all `01-architecture` files.
2.  **L1 Doc**: Update to explicitly list the 10 module schemas and 12 event schemas.
3.  **L2 Doc**: Formalize the SA/MAP profile distinction and link to `docs/03-profiles`.
4.  **L3 Doc**: Clarify "Runtime Glue" vs "Reference Runtime".
5.  **L4 Doc**: **MAJOR REWRITE**. Remove "no integration packages" claim. Document `packages/integration` contents.
6.  **Cross-cutting**: Ensure all 9 crosscuts (`docs/01-architecture/cross-cutting/`) are aligned with the `crosscut-psg-event-binding.md` spec in `06-runtime`.

---

**End of Report**
