---
wrapperClassName: governance-page
---

# MPLP Protocol Governance

The MPLP Protocol is governed by the **MPLP Protocol Governance Committee (MPGC)** to ensure stability, neutrality, and long-term evolution.

This repository is the **Source of Truth** surface within MPLP's 3+1 constitutional entry model.

Within that model:
- the **Repository** is authoritative for protocol truth, schema truth, invariant truth, and governance source records
- **Documentation** is the specification and reference projection surface
- **Website** is the discovery and positioning surface
- **Validation Lab** is the auxiliary evidence-adjudication surface

## Governance Clarification Record (2025-12-27)

The v1.1.0 release has been formally reclassified as an **Artifact Alignment Release**.
No protocol semantics beyond MPLP v1.0.0 were introduced.
The MPLP protocol specification remains at **v1.0.0 (FROZEN)**.

Repository-facing version meaning follows the explicit version-domain model defined in:
- `governance/05-versioning/VERSION-TAXONOMY-MANIFEST.md`
- `governance/05-versioning/version-taxonomy-manifest.json`

In this repository:
- `protocol_version` identifies the frozen MPLP protocol semantic version
- schema and invariant bundles are versioned separately from `protocol_version`
- docs, website, Validation Lab, and SDK release identities are versioned independently of the protocol truth line
- bare version labels must not be treated as authoritative release meaning without an explicit version-domain mapping

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
MPLP governance uses explicit version domains rather than a single undifferentiated version label.
*   **`protocol_version`**: frozen MPLP protocol semantic version.
*   **`schema_bundle_version` / `invariant_bundle_version`**: canonical schema/invariant bundle versions.
*   **`validation_ruleset_version` / `validation_lab_release_version`**: Validation Lab ruleset and release-line versions.
*   **`docs_release_version` / `website_release_version`**: docs and website release-line versions.
*   **`sdk_version`**: package-scoped SDK release version.

Where Semantic Versioning applies, it applies within the relevant version domain rather than as one repository-wide public version meaning.

## Frozen Specification
Once a version is tagged as **FROZEN** (e.g., v1.0.0), no normative changes are permitted. Any required change triggers a new version number.

## Release Cycle
*   **Major Versions**: Driven by industry needs, typically 12-24 months.
*   **Minor Versions**: As needed for feature additions.
*   **Patch Versions**: As needed for maintenance.
