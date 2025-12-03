---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
## 1. Governance Scope

**Objective**: Standardize the "Cross-Cutting Concerns" documentation to align with the 9 Core Crosscuts defined in the Architecture Overview.

**Files Governed**: `docs/01-architecture/cross-cutting/*.md`

---

## 2. The 9 Core Crosscuts (Standardized)

The following files have been rewritten to strictly follow the "Architecture Spec Template" (Frozen Spec):

| Concern | File | Status |
| :--- | :--- | :--- |
| **Coordination** | `coordination.md` | ✅ Rewritten |
| **Error Handling** | `error-handling.md` | ✅ Rewritten |
| **Event Bus** | `event-bus.md` | ✅ Rewritten |
| **Orchestration** | `orchestration.md` | ✅ Rewritten |
| **Performance** | `performance.md` | ✅ Rewritten |
| **Protocol Version** | `protocol-version.md` | ✅ Rewritten |
| **Security** | `security.md` | ✅ Rewritten |
| **State Sync** | `state-sync.md` | ✅ Rewritten |
| **Transaction** | `transaction.md` | ✅ Rewritten |

---

## 3. Cleanup Actions

The following files in `docs/01-architecture/cross-cutting/` are **NOT** part of the 9 Core Crosscuts and should be considered deprecated or moved:

- `ael.md` -> Move to `docs/06-runtime/` or merge into L3.
- `vsl.md` -> Move to `docs/06-runtime/` or merge into L3.
- `observability.md` -> Redundant with `docs/04-observability/`.
- `learning-feedback.md` -> Redundant with `docs/05-learning/`.

**Recommendation**: In a future cleanup pass, move these files out of `01-architecture/cross-cutting` to avoid confusion. For now, `overview.md` correctly lists only the 9 core concerns.

---

## 4. Compliance Verification

- **Frozen Header**: All 9 files contain the standard Frozen Header.
- **Template**: All 9 files follow the 9-section structure (Scope, Definitions, Responsibilities, etc.).
- **Alignment**: All 9 files align with the definitions in `architecture-overview.md`.

---

**End of Report**
