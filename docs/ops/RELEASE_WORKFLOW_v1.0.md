# MPLP Release Workflow (v1.0)

**Status**: Active
**Governance**: Project Governance (DGP)

---

## Overview

MPLP employs a **governed release process** that strictly separates **Protocol Semantics** from **Project Artifacts**. This ensures that updates to documentation, tooling, or the website do not inadvertently imply changes to the normative protocol specification.

## Release Identity

Every MPLP release is defined by three distinct version axes:

1.  **Protocol Version**: The semantic version of the normative specification (e.g., `v1.0.0`). This is **FROZEN** and only changes with MPGC approval.
2.  **Repository Version**: The internal state identifier of the codebase.
3.  **Release Version**: The public identifier for a specific distribution (e.g., GitHub Release `v1.1.0`).

## Release Types

To maintain semantic clarity, releases are classified into two types:

*   **Semantic Release**: Introduces new or modified protocol semantics. Requires a Protocol Version bump.
*   **Artifact Alignment Release**: Updates documentation, tooling, SDKs, or infrastructure. **No protocol semantic changes.**

## Governance Process

All releases undergo a strict governance gate before publication:

1.  **Separation of Concerns**: The website and protocol artifacts are built and released independently to prevent coupling.
2.  **Artifact Purity**: Protocol release artifacts are built from a "pure" state, excluding website code and internal tooling.
3.  **Governance Sign-off**: Every release must be explicitly authorized with a declared Release Type and scope.

> **Note**: This document provides a high-level overview of the release policy. Detailed operational procedures are maintained internally under `project-governance/`.