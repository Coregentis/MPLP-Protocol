## [docs-meta-hardening] — 2026-01-09

### 📋 Docs Meta Hardening & DocIdentityHeader Single Source

#### Legacy Meta Cleanup
- **Removed ~1200 lines** of duplicate/conflicting meta blocks from 161 pages
- Deleted all `:::warning[Non-Normative]`, `FROZEN SPECIFICATION`, blockquote meta patterns
- Gate v2 upgraded: detects 8 forbidden pattern types (A-H)

#### Frontmatter Completeness Enforcement
- **Gate v3**: Validates normativity enumeration (normative/informative/formative)
- **Backfilled** normativity for 153 pages, description for 100 pages, authority for 55 pages
- All 162 pages now have complete frontmatter (0 UNKNOWN)

#### getDocIdentity.ts Hardening
- Removed `doc_type` as `normativity` fallback (was causing UNKNOWN badges)
- Added console warning for legacy doc_type usage
- Only valid normativity enum values now accepted

#### Scripts Added
- `scripts/gates/docs-legacy-meta-gate.mjs` (Gate v2 - forbidden pattern detection)
- `scripts/gates/docs-frontmatter-gate.mjs` (Gate v3 - normativity enum validation)
- `scripts/gates/docs-description-backfill.mjs` (batch description generator)
- `scripts/gates/docs-authority-backfill.mjs` (batch authority generator)
- `scripts/gates/docs-normativity-backfill.mjs` (batch normativity generator)

#### Gate Status
- Gate 1-4: PASSED (Entity Alignment)
- Gate v2: PASSED (0 legacy meta violations)
- Gate v3: PASSED (162 complete, 0 UNKNOWN)

---

## [sdk-release-2026-01-04] — 2026-01-04

### 📦 Multi-Package SDK Release (npm + PyPI)

#### SDK Packages Published
- **npm**: 13 packages in `@mplp/*` scope (version bump from published)
  - @mplp/core@1.0.6, @mplp/schema@1.0.5, @mplp/sdk-ts@1.0.6
  - @mplp/conformance@1.0.0 (NEW - replaces compliance)
  - @mplp/coordination@1.0.6, @mplp/modules@1.0.5, @mplp/runtime-minimal@1.0.5
  - @mplp/devtools@1.0.5, @mplp/integration-*@1.0.5, @mplp/compliance@1.0.5 (DEPRECATED)
- **PyPI**: mplp-sdk@1.0.4 (Python >=3.9 support)

#### Governance Enhancements
- **METHOD-SDKR-08**: Multi-Package Release Governance (FROZEN v1.0)
  - §6.6 Hash Evidence Strategy (SHA-256 artifact verification)
  - §6.7 Version Verification (registry duplicate check)
  - §8.1 Python Profile (PyPI Release Governance)
- **CHECKLIST-SDK-RELEASE.md**: Upgraded with METHOD references for every check item
- **Gate Implementations**: npm (`gate-publish-set.mjs`) and PyPI (`gate_pypi_set/`)

#### Deprecation
- `@mplp/compliance` marked [LEGACY] → use `@mplp/conformance`

#### Housekeeping
- Copyright year updated 2025 → 2026
- DERIVATION_PROOF.yaml present for all 14 packages

---

## [internal-governance-fix] — 2025-12-26

### 🔧 Internal Build System Fix (Non-User-Facing)

#### Changed
- Build/Test/Typecheck now run only on `packages/sources/**` (not full workspace)
- Root scripts updated to use `pnpm --filter "./packages/sources/**" -r ...`
- Deleted `src/` directories from all `packages/npm/*` (publish-only = artifact-only)

#### Added
- `verify:npm` script for publish-only workspace verification
- `scripts/semantic/verify-publish-only.mjs` verification gate
- Validator marked as `private: true` (CI-only, non-publication)

#### Governance
- OPS_GOVERNANCE_LOG entries: Sources Package Structure, Publish-Only Isolation, CI Validator Non-Publication
- Enforced: publish-only workspaces are artifact-only (no src, no tsc build)
- CI Validator = internal verification infrastructure, NOT external publication

#### Impact
- No change to published npm packages
- Monorepo build graph isolation prevents future miscompilation

---

## [authority-alignment-v1] — 2025-12-25

### 🎯 Authority & Semantic Alignment (Interpretive Layer)

#### Added
- Authority semantic layering on homepage (Full name → Definition → Slogan → Structure)
- Seven stable anchor pages for sitelinks extraction (/architecture, /modules, /kernel-duties, /golden-flows, /governance, /faq, /references)
- JSON-LD structure tree (DefinedTermSet, WebSite hasPart, FAQPage, CollectionPage)
- Sitemap additive expansion to include anchor pages
- FAQ (36 Q&A) including AI citation scenarios
- References page with layer-based, non-endorsement contextual mappings (MCP, A2A, LangChain, CrewAI, AutoGen)
- Docs authority boundary notice (mplp.io definitional vs docs normative)
- Semantic terminology guardrail + CI semantic lint gate

#### Governance
- Enforced DGP-00 terminology constraints across public surfaces
- Established explicit definitional/normative authority split for AI/search interpretation
- Updated WEBSITE_TO_DOCS_ROUTING_TABLE with 7 anchor mappings

#### Non-Goals
- No certification, endorsement, or compliance verdicts introduced
- No protocol schema or normative obligation changes
- Protocol remains MPLP v1.0.0 (Frozen)

---
## [1.1.1] - 2025-12-23

### 馃彌锔?Semantic Governance Restructuring (Release Gate-0)

#### Website Governance
- **Directory Promotion**: `_temp_website` 鈫?`MPLP_website` (official website sub-repository)
- **Governance Artifacts**: Created `semantic-positioning-anchors.yaml` (FROZEN), `seo-jsonld-contract.md`, `canonical-cross-surface-mapping.yaml`
- **T0 Identity Alignment**: Updated Home Hero, JSON-LD, README with INV-02/INV-03 invariants
- **T4 New Pages**: Added `/standards/regulatory-positioning`, `/standards/protocol-evaluation`, `/standards/what-mplp-is-not`

#### Terminology Standardization
- **MPLP-conformant**: Replaced 19 instances of forbidden term "MPLP-compliant" with "MPLP-conformant" across website and docs
- **Golden Flows Language**: Changed "must pass" to "is expected to pass" for verification scenarios (INV-04 compliance)

#### URL Standardization
- **Official Website**: Standardized all references to `https://www.mplp.io` (50+ files)
- **Package.json**: Updated homepage field in 13 npm packages
- **Docs Site**: Updated all cross-surface links to use canonical URLs

#### Release Gate-0 Audit
- **Phase A-F**: Full pre-push audit completed (builds, links, semantics, cross-surface mapping)
- **Final Verdict**: PASS 鈥?Semantic Governance STABLE

---

## [1.1.0] - 2025-12-22


### 馃帹 World-Class Documentation & UI/UX Overhaul
- **UI/UX**: Implemented a "World-Class" design system with refined typography (Inter, JetBrains Mono), "Slate" dark mode, and responsive card-based navigation.
- **Navigation**: Introduced `PathCard` components and "Next Steps" patterns for intuitive user journeys.
- **Standards**: Full alignment with W3C, ISO, and NIST mapping documentation.
- **SDK Docs**: Updated TypeScript and Python SDK guides to reflect the latest published packages (`@mplp/sdk-ts` v1.0.5, `mplp-sdk` v1.0.3).
- **SEO**: Clarified SEO strategy with strict separation of concerns between `mplp.io` (Marketing) and `docs.mplp.io` (Reference).

## [1.0.3] - 2025-12-06

### 馃敀 World-Class Release Hardening
- **Protocol**: v1.0.0 (FROZEN).
- **SDKs**: TypeScript v1.0.3, Python v1.0.0.
- **Governance**: Full frozen header compliance across all artifacts.
- **Packaging**: Strict whitelist enforcement for NPM and PyPI.
- **Verification**: Golden Flows 01-05 verified on both runtimes.
- **Audit**: Comprehensive pre-release audit completed (Governance, Docs, Code, Packaging). **RELEASE READY**.

## [1.0.0-rc.1] - 2025-12-05

### 馃摝 Python SDK Governance & Packaging
- **Governance**: Applied MPLP v1.0.x governance headers across all Python source files and docs.
- **Documentation**: Added comprehensive documentation pack (`PARITY-MAP`, `PROTOCOL-COMPATIBILITY`, `RUNTIME`, etc.).
- **Packaging**: Cleaned distribution package (removed `tests`, `internal`, `scripts`).
- **Note**: Protocol behavior unchanged; parity with TS confirmed in Phase 0.

## [1.0.0] - 2025-12-01

### 馃殌 Frozen Specification Release
- **Status**: **FROZEN**. All normative artifacts are now locked.
- **Scope**:
  - **Documentation**: Complete `docs/00-13` stack with Frozen Headers.
  - **Schemas**: `schemas/v2` is the Single Source of Truth.
  - **Tests**: Golden Test Suite (FLOW-01 ~ 05) is the Compliance Standard.

### 鉁?Key Features
- **4-Layer Architecture**: L1 (Core) -> L2 (Modules) -> L3 (Runtime) -> L4 (Integration).
- **"3 Physical / 12 Logical" Event Model**: Standardized observability.
- **Vendor Neutrality**: Abstract `LlmClient` and `ToolExecutor` interfaces.
- **Governance**: Formal MIP process and Versioning Policy.

### 鈿狅笍 Breaking Changes (since 0.9.x)
- **Directory Structure**: Unified into `00-13` linear structure.
- **Event Taxonomy**: Simplified to 3 physical schemas.
- **Profile Specs**: Split into MD and YAML.

## [0.9.2-alpha] - 2025-11-29

### P7.H5 Validation Standardization
- **Core Protocol**: Standardized `ValidationResult` structure (ok, errors[]) across TS and Python.
- **Error Codes**: Implemented unified error codes (required, type, enum, pattern, format, etc.).
- **Cross-Language**: Verified strict error equivalence between TS (Ajv) and Python (Pydantic).
- **Python SDK**: Updated `validate_*` functions to return `ValidationResult` NamedTuple.

## [0.9.1-alpha] - 2025-11-29

### P7.H4 Cross-Language Builders
- **Builders**: Aligned JSON output of TS and Python builders.
- **Testing**: Added cross-language builder comparison infrastructure.

## [0.9.0-alpha] - 2025-11-29

### P0鈥揚6 Completed
- **Schemas**: Migrated and standardized v2 schemas to `schemas/v2`.
- **Core Protocol**: Implemented `@mplp/core-protocol` with generated types and validators.
- **Coordination**: Implemented `@mplp/coordination` with flow contracts and event definitions.
- **Reference Runtime**: Implemented `@mplp/reference-runtime` with:
  - `RuntimeContext` and `RuntimeResult` types.
  - `InMemoryAEL` (Action Execution Layer) and `InMemoryVSL` (Value State Layer).
  - `runSingleAgentFlow` orchestrator.
- **Integration Layer**: Added `@mplp/integration-*` packages:
  - `llm-http`: Generic HTTP LLM client.
  - `tools-generic`: Abstract tool executor.
  - `storage-fs`: JSON file storage.
  - `storage-kv`: In-memory Key-Value store.
- **Examples**: Added `ts-single-agent-basic` runnable example.