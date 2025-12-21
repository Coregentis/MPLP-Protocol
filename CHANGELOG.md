## [1.1.0] - 2025-12-22

### 🎨 World-Class Documentation & UI/UX Overhaul
- **UI/UX**: Implemented a "World-Class" design system with refined typography (Inter, JetBrains Mono), "Slate" dark mode, and responsive card-based navigation.
- **Navigation**: Introduced `PathCard` components and "Next Steps" patterns for intuitive user journeys.
- **Standards**: Full alignment with W3C, ISO, and NIST mapping documentation.
- **SDK Docs**: Updated TypeScript and Python SDK guides to reflect the latest published packages (`@mplp/sdk-ts` v1.0.5, `mplp-sdk` v1.0.3).
- **SEO**: Clarified SEO strategy with strict separation of concerns between `mplp.io` (Marketing) and `docs.mplp.io` (Reference).

## [1.0.3] - 2025-12-06

### 🔒 World-Class Release Hardening
- **Protocol**: v1.0.0 (FROZEN).
- **SDKs**: TypeScript v1.0.3, Python v1.0.0.
- **Governance**: Full frozen header compliance across all artifacts.
- **Packaging**: Strict whitelist enforcement for NPM and PyPI.
- **Verification**: Golden Flows 01-05 verified on both runtimes.
- **Audit**: Comprehensive pre-release audit completed (Governance, Docs, Code, Packaging). **RELEASE READY**.

## [1.0.0-rc.1] - 2025-12-05

### 📦 Python SDK Governance & Packaging
- **Governance**: Applied MPLP v1.0.x governance headers across all Python source files and docs.
- **Documentation**: Added comprehensive documentation pack (`PARITY-MAP`, `PROTOCOL-COMPATIBILITY`, `RUNTIME`, etc.).
- **Packaging**: Cleaned distribution package (removed `tests`, `internal`, `scripts`).
- **Note**: Protocol behavior unchanged; parity with TS confirmed in Phase 0.

## [1.0.0] - 2025-12-01

### 🚀 Frozen Specification Release
- **Status**: **FROZEN**. All normative artifacts are now locked.
- **Scope**:
  - **Documentation**: Complete `docs/00-13` stack with Frozen Headers.
  - **Schemas**: `schemas/v2` is the Single Source of Truth.
  - **Tests**: Golden Test Suite (FLOW-01 ~ 05) is the Compliance Standard.

### ✨ Key Features
- **4-Layer Architecture**: L1 (Core) -> L2 (Modules) -> L3 (Runtime) -> L4 (Integration).
- **"3 Physical / 12 Logical" Event Model**: Standardized observability.
- **Vendor Neutrality**: Abstract `LlmClient` and `ToolExecutor` interfaces.
- **Governance**: Formal MIP process and Versioning Policy.

### ⚠️ Breaking Changes (since 0.9.x)
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

### P0–P6 Completed
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
---

© 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
