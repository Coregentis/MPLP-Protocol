---
doc_type: governance
status: frozen
authority: Documentation Governance
description: "**ID**: DGP-XX **Version**: 1.0 **..."
canonical: /docs/12-governance/DOCS_GOVERNANCE_LEDGER
title: Documentation Governance Ledger
---

# Documentation Governance Ledger

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

This ledger records all governance-level changes to the MPLP documentation and website surfaces.

## 2025-12-26 — Website Navigation Authority Enforcement (GOV-WEB-01)

**Type:** Governance Rule Enforcement
**Protocol Impact:** None (MPLP v1.0.0 unchanged)
**Affected Surfaces:** mplp.io navigation, footer, internal linking

### Rule
- **Semantic Hierarchy:** Website navigation MUST reflect T0–T4 semantic hierarchy.
- **Definitional Support:** FAQ/References MUST NOT precede specification anchors.
- **Docs Linking:** Docs links MUST appear only under Specification grouping.

### Rationale
Prevents AI and human readers from misidentifying normative specification as definitional authority.

### Status
**ENFORCED**

## 2025-12-23 鈥?Semantic Governance Restructuring (Release Gate-0)

**Type:** Terminology and URL standardization
**Protocol Impact:** None (MPLP v1.0.0 unchanged)
**Tag:** `1.1.1`

### Changes
- Replaced "MPLP-compliant" with "MPLP-conformant" (19 instances)
- Standardized URLs to https://www.mplp.io
- Added T4 strategic definition pages

### Status
**Accepted**