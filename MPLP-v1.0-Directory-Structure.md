# MPLP Protocol v1.0 Directory Structure

This document outlines the standard directory structure for the MPLP Protocol repository.

## Root Directory

| Path | Description |
| :--- | :--- |
| `.github/` | GitHub Actions workflows and templates. |
| `docs/` | Official protocol documentation (Markdown). |
| `examples/` | Minimal runnable examples and reference implementations. |
| `packages/` | Source code for official MPLP NPM packages. |
| `schemas/` | JSON Schema source files (Single Source of Truth). |
| `scripts/` | Utility scripts for validation, build, and maintenance. |
| `tests/` | Compliance test suite and golden fixtures. |
| `CHANGELOG.md` | Version history and release notes. |
| `CONTRIBUTING.md` | Guidelines for contributors. |
| `LICENSE.txt` | Apache 2.0 License. |
| `README.md` | Project overview and entry point. |
| `SECURITY.md` | Security policy and reporting guidelines. |

## Key Subdirectories

### `docs/`
- `00-index/`: Documentation entry points.
- `01-architecture/`: Core architecture and design documents.
- `02-modules/` to `07-integration/`: Layer-specific specifications.
- `99-meta/`: Governance, roadmap, and meta-documentation.

### `schemas/`
- `v2/`: Current version of JSON Schemas.
  - `common/`: Shared types and definitions.
  - `events/`: Event schemas (L1).
  - `modules/`: Module interface schemas (L2).

### `packages/`
- `@mplp/core`: L1 Core Protocol types and validators.
- `@mplp/schema`: Schema distribution package.
- `@mplp/modules`: L2 Module definitions.
- `@mplp/coordination`: L2 Coordination contracts.
- `@mplp/runtime-minimal`: L3 Reference Runtime.
- `@mplp/compliance`: Compliance testing tools.
- `@mplp/sdk-ts`: Unified TypeScript SDK.
- `@mplp/devtools`: Developer tools CLI.
- `@mplp/integration-*`: L4 Integration adapters.

### `tests/`
- `golden/`: Golden Test Suite fixtures and runner.
- `schema-alignment/`: Cross-language schema verification.
