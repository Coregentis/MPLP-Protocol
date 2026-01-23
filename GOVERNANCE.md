---
wrapperClassName: governance-page
---

# MPLP Protocol Governance

The MPLP Protocol is governed by the **MPLP Protocol Governance Committee (MPGC)** to ensure stability, neutrality, and long-term evolution.

## Governance Clarification Record (2025-12-27)

The v1.1.0 release has been formally reclassified as an **Artifact Alignment Release**.
No protocol semantics beyond MPLP v1.0.0 were introduced.
The MPLP protocol specification remains at **v1.0.0 (FROZEN)**.

## Governance Structure

### MPLP Protocol Governance Committee (MPGC)
The MPGC is responsible for:
*   Approving new protocol versions (Major/Minor).
*   Reviewing and merging RFCs (Request for Comments).
*   Maintaining the "Frozen" status of released specifications.
*   Ensuring vendor neutrality.

**Current Chair**: [Coregentis](https://github.com/Coregentis)

## Decision Making Process

### 1. RFC (Request for Comments)
All normative changes must start as an RFC.
*   **Draft**: Proposal submitted as a GitHub Issue (RFC Template).
*   **Review**: Community discussion and MPGC technical review.
*   **Approval**: MPGC vote.
*   **Implementation**: Merged into `draft` or `next` branch.

### 2. Versioning Policy
MPLP follows [Semantic Versioning 2.0.0](https://semver.org/).
*   **Major (X.y.z)**: Breaking changes to schemas or flow contracts.
*   **Minor (x.Y.z)**: Backward-compatible additions (e.g., new optional fields).
*   **Patch (x.y.Z)**: Non-normative fixes (typos, clarifications) or critical security patches.

## Frozen Specification
Once a version is tagged as **FROZEN** (e.g., v1.0.0), no normative changes are permitted. Any required change triggers a new version number.

## Release Cycle
*   **Major Versions**: Driven by industry needs, typically 12-24 months.
*   **Minor Versions**: As needed for feature additions.
*   **Patch Versions**: As needed for maintenance.