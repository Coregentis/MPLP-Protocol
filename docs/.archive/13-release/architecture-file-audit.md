## 1. Audit Scope

**Directory**: `docs/01-architecture/`
**Files Scanned**:
- `architecture-overview.md`
- `l1-core-protocol.md`
- `l2-coordination-governance.md`
- `l3-execution-orchestration.md`
- `l4-integration-infra.md`
- `schema-conventions.md`
- `cross-cutting/*.md` (14 files)

---

## 2. Findings Summary

| Check Item | Status | Notes |
| :--- | :--- | :--- |
| **Frozen Headers** | ✅ PASS | Present in all sampled files. |
| **Internal Refs** | ⚠️ WARN | "RBCT" mentioned in `architecture-overview.md` history. |
| **Deprecated Terms** | ✅ PASS | "Learning & Planning" correctly marked as deprecated. |
| **Schema Refs** | ✅ PASS | References to `schemas/v2/*.json` are correct. |
| **Crosscut Count** | ❌ FAIL | `architecture-overview.md` says 9, `cross-cutting/overview.md` says 12. Directory has 14 files. |
| **Template Compliance** | ❌ FAIL | Files do not follow the strict 9-section "Architecture Spec Template". |

---

## 3. Detailed File Analysis

### 3.1 `architecture-overview.md`
- **Status**: Needs Rewrite.
- **Issues**:
    - Uses "RBCT" in version history (internal term).
    - Structure does not match the new "Binding Points" requirement.
    - Lists 9 crosscuts, conflicting with other docs.

### 3.2 `l4-integration-infra.md`
- **Status**: Needs Rewrite.
- **Issues**:
    - Good content, but needs to fit the "Architecture Spec Template".
    - "RBCT" mentioned in history.

### 3.3 `cross-cutting/` Directory
- **Status**: Needs Consolidation & Rewrite.
- **Conflict**:
    - **9 Core Crosscuts**: coordination, error-handling, event-bus, orchestration, performance, protocol-version, security, state-sync, transaction.
    - **Extras in Dir**: `ael.md`, `vsl.md` (L3 concepts?), `learning-feedback.md`, `observability.md` (L2/L3 layers?).
- **Action**:
    - Move `ael.md` and `vsl.md` to `docs/06-runtime/` or merge into `l3-execution-orchestration.md`.
    - Move `learning-feedback.md` and `observability.md` to their respective folders (`05-learning`, `04-observability`) or keep as high-level summaries if they truly cross-cut.
    - Standardize on the **9 Core Crosscuts** for the `cross-cutting` folder to match `architecture-overview.md`.

---

## 4. Remediation Plan

1.  **Rewrite Core Files**: Apply the 9-section template to all L1-L4 docs.
2.  **Sanitize Content**: Remove "RBCT", "SCTM", "GLFB" references from public text.
3.  **Resolve Crosscuts**:
    - Define the "Official 9 Crosscuts".
    - Relocate non-crosscut files (`ael`, `vsl`, etc.) to appropriate L3/L2 sections.
4.  **Deep Dive**: Create `l1-l4-architecture-deep-dive.md` to cover complex interactions (like AEL/VSL) that don't fit in the high-level specs.

---

**End of Audit**
