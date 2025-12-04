# MPLP Repository Management and Release Policy v1.0

> **Status**: Active
> **Version**: 1.0.0
> **Last Updated**: 2025-12-05
> **Governance**: MPLP Protocol Governance Committee (MPGC)

---

## 1. Repository Architecture (Dual-Repo Strategy)

To balance open-source transparency with internal agility, MPLP adopts a strict **Dual-Repository Strategy**.

### 1.1 Public Repository: `Coregentis/MPLP-Protocol`
*   **Role**: The **Single Source of Truth** for the MPLP Protocol Standard.
*   **Audience**: Public, Implementers, Community.
*   **Constraints**:
    *   **Single Branch**: Only `main` exists. No feature/dev branches.
    *   **Cleanliness**: Contains ONLY released, validated, and normative content.
    *   **No Drafts**: No `/internal`, `/drafts`, or `/experiments` directories.
*   **Content**:
    *   Normative Specifications (`docs/00-07`, `schemas/v2`)
    *   Reference Implementation (`packages/*`)
    *   Public Governance (`GOVERNANCE.md`, `CONTRIBUTING.md`)

### 1.2 Private Development Repository: `Coregentis/MPLP-Protocol-Dev`
*   **Role**: The **Active Workspace** for all development, drafting, and experimentation.
*   **Audience**: Internal Team, AI Assistants.
*   **Capabilities**:
    *   Full Git-Flow (Feature branches, Develop, Release).
    *   Internal Documentation (`/internal`, `/notes`).
    *   Experimental Code (`/experiments`, `/playground`).
    *   Commercial Integrations (TracePilot hooks).
*   **Workflow**: All work happens here. Releases are "snapshots" synced to the Public Repo.

---

## 2. Versioning & Tagging Strategy

We enforce a unified versioning scheme across Protocol, Git, and NPM.

### 2.1 Protocol Version (SemVer)
*   **Format**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
*   **Rules**:
    *   **MAJOR**: Breaking changes to Normative Schemas or Flows.
    *   **MINOR**: New features/capabilities (backward compatible).
    *   **PATCH**: Non-normative fixes (typos, clarifications) or bug fixes that do not alter the spec.
*   **Frozen Header**: The version in `> [!FROZEN]` headers MUST match the Protocol Version.

### 2.2 Git Tags
*   **Public Repo (`MPLP-Protocol`)**:
    *   Format: `vX.Y.Z` (e.g., `v1.0.0`, `v1.0.1`)
    *   Meaning: A strictly compliant, frozen public release.
*   **Private Repo (`MPLP-Protocol-Dev`)**:
    *   Format: `dev-vX.Y.Z-rc.N` (e.g., `dev-v1.0.2-rc.1`)
    *   Meaning: Internal checkpoints and release candidates.

### 2.3 NPM Package Versions
*   **Scope**: All 12 `@mplp/*` packages.
*   **Strategy**: Unified Versioning.
    *   All packages share the same version number (e.g., `1.0.2`) to ensure compatibility.
    *   **Alignment**: `MAJOR.MINOR` should track the Protocol Version. `PATCH` can increment faster for implementation fixes.

---

## 3. Content Governance

### 3.1 Public Repository Allowlist
Only files and directories in this list may exist in the Public Repository:

*   `README.md`, `CHANGELOG.md`, `LICENSE.txt`
*   `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `GOVERNANCE.md`, `MAINTAINERS.md`
*   `docs/` (Subdirectories: `00-13`)
*   `schemas/v2/`
*   `schemas/invariants/`
*   `packages/` (The 12 official packages)
*   `tests/golden/`
*   `.github/` (Issue Templates, Workflows)
*   `release-config.yaml`

### 3.2 Private Repository Exclusives (Blocklist for Public)
These must **NEVER** be synced to Public:

*   `internal/`
*   `drafts/`
*   `playground/`
*   `experiments/`
*   `scripts/internal-*`
*   `notes/`
*   Any commercial/proprietary code.

---

## 4. Branching Strategy

### 4.1 Public Repo
*   **`main`**: Protected. Read-only for direct pushes. Updated ONLY via "Release Sync" PRs or Fast-Forward merges from a clean release snapshot.

### 4.2 Private Repo
*   **`main`**: Stable development head.
*   **`develop`** (Optional): Integration branch.
*   **`feature/NAME`**: Standard working branches.
*   **`release/X.Y.Z`**: Release stabilization branch.
*   **`hotfix/X.Y.Z`**: Emergency fixes.

---

## 5. Standard Release SOP (Standard Operating Procedure)

**Role**: AI Assistant / Release Manager

### Phase 1: Preparation (in `MPLP-Protocol-Dev`)
1.  **Branch**: Create `release/vX.Y.Z` from `main`.
2.  **Version Bump**: Update `package.json` (root & packages) and `CHANGELOG.md`.
3.  **Hardening**: Ensure all `README`, `LICENSE`, and Metadata are correct.
4.  **Validation**: Run `pnpm install && pnpm -r test && pnpm -r build`.
5.  **Tag**: Create internal tag `dev-vX.Y.Z-rc.1`.

### Phase 2: Public Sync (The "Snapshot")
1.  **Clone**: Checkout `MPLP-Protocol` (Public) locally.
2.  **Clean**: `git checkout main && git pull && rm -rf *` (except `.git`).
3.  **Copy**: Copy **Allowlist** content from Dev `release/vX.Y.Z` to Public.
4.  **Verify**: Run `pnpm install && pnpm test` in the Public folder to ensure self-sufficiency.
5.  **Push**: Commit as "chore: sync vX.Y.Z" and push to Public `main`.
6.  **Tag**: Push tag `protocol-vX.Y.Z`.

### Phase 3: NPM Publication
1.  **Source**: Execute from **Public Repository** folder.
2.  **Dry Run**: `pnpm -r publish --access public --dry-run`.
3.  **Publish**: `pnpm -r publish --access public`.
4.  **Verify**: Check NPM registry for update.

---

## 6. Governance & Frozen Headers

### 6.1 Strict Header Rules
Frozen Headers (`> [!FROZEN]`) are **strictly restricted** to:
1.  **Normative Docs**: `docs/00-07/**`
2.  **Schemas**: `schemas/v2/**`
3.  **Invariants**: `schemas/invariants/**`

**ALL** other files (Code, Guides, READMEs) must **NOT** have a Frozen Header. They should only have a standard Copyright/License footer or header.

### 6.2 Header Format
```markdown
> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: YYYY-MM-DD
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.
```
