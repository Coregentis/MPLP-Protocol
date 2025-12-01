---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP v1.0.0 Release Notes

**Date**: 2025-12-01
**Version**: 1.0.0 (Stable)
**Codename**: "Foundation"

---

## 1. Introduction

We are proud to announce the official release of **MPLP (Multi-Agent Lifecycle Protocol) v1.0.0**.

This release marks the transition from "Draft" to **"Stable Specification"**. It provides a complete, normative standard for building multi-agent systems that are:
-   **Interoperable**: Via strict JSON Schemas and Protocol Invariants.
-   **Observable**: Via a standardized Event Taxonomy (L2.5).
-   **Governance-Ready**: Via the Project Semantic Graph (L3).

### Official Protocol Name (v1.0)

For the avoidance of doubt, the protocol defined in this repository is officially named **“Multi-Agent Lifecycle Protocol” (MPLP)**. Any earlier drafts or documents that referred to “Multi-Agent Lifecycle Protocol” or other variants MUST be considered deprecated and non-normative.

## Public Specification Surface

The MPLP v1.0 public specification surface is limited to:

- `schemas/v2/`
- `docs/00-index` through `docs/13-release`
- `tests/golden/`
- `packages/*` (reference runtime and protocol packages)

Any other directories (for example `docs/99-meta/` or `internal/`) are internal archives and are **not part of the MPLP v1.0 public specification**.

All documentation, schemas, and golden tests are now **FROZEN**. Any future normative changes will require a v1.1 or v2.0 protocol upgrade.

---

## 2. Key Features

### 2.1 The 4-Layer Architecture
-   **L1 Core**: 100% Schema-validated JSON structures for Context, Plan, Trace, etc.
-   **L2 Coordination & Governance**: 10 normative modules defining the "Vocabulary" of agent interaction.
-   **L2.5 Profiles**: Standardized **SA (Single Agent)** and **MAP (Multi-Agent)** execution profiles.
-   **L3 Runtime**: The **Project Semantic Graph (PSG)** as the single source of truth.

### 2.2 Observability & Learning
-   **"3 Physical / 12 Logical" Event Model**: Balancing strict typing with semantic richness.
-   **Learning Loop**: Standardized collection points for `Intent`, `Delta`, and `Core` samples.

### 2.3 Governance & Compliance
-   **Golden Flows (FLOW-01 ~ 05)**: The definitive compliance test suite.
-   **Invariants**: 50+ runtime rules enforced by the protocol (e.g., `sa_context_must_be_active`).

---

## 3. Breaking Changes (since RC)

-   **Directory Structure**: Unified into `00-13` linear structure.
-   **Event Taxonomy**: Simplified to 3 physical schemas (`GraphUpdate`, `PipelineStage`, `RuntimeExecution`).
-   **Profile Specs**: Split into "Specification" (MD) and "Definition" (YAML) for machine readability.

---

## 4. Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| **Documentation** | `docs/` | The complete protocol specification. |
| **Schemas** | `schemas/v2/` | JSON Schema definitions. |
| **Golden Tests** | `tests/golden/` | Compliance test fixtures. |
| **Manifest** | `docs/00-index/mplp-v1.0-docs-manifest.yaml` | Machine-readable index of all docs. |

---

## 5. Acknowledgements

Thanks to the Coregentis Team and the Open Source Community for their contributions to the "Advanced Agentic Coding" initiative.

---

**MPLP v1.0.0 is now LIVE.**
