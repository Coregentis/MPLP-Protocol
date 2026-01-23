# MPLP Documentation Site — Changelog

All notable changes to the MPLP Documentation site (docs.mplp.io).

---

## [gsc-fix-v1.2] — 2026-01-21

### 🔧 GSC Soft 404 Fix

#### Added
- `@docusaurus/plugin-client-redirects` for `/index` → `/` redirect
- Fixes GSC "Soft 404" at `docs.mplp.io/index`

#### Gate-LINK-03
- **PASS**: 0 violations (105 pattern hits, all negated boundary language)
- v1.2.2.2 balanced FP ruleset with ~90 patterns

#### Build
- 178 docs indexed
- Lunr search index generated

---

## [authority-alignment-v1] — 2025-12-25


### Added
- Authority Boundary callout on intro.mdx landing page
- DOCS_GOVERNANCE_LEDGER.md for governance change tracking
- Authority Split section in WEBSITE_TO_DOCS_ROUTING_TABLE.md

### Changed
- Routing table now includes 7 anchor page mappings
- Explicit distinction: mplp.io (definitional) vs docs.mplp.io (normative)

### Governance
- Established that docs does not redefine MPLP's public definitions
- All definitional authority directed to mplp.io

---

## [1.1.1] — 2025-12-23

### Changed
- Replaced "MPLP-compliant" with "MPLP-conformant" across docs
- Updated URL references to https://www.mplp.io

---

## [1.1.0] — 2025-12-22

### Added
- World-Class documentation design overhaul
- PathCard navigation components
- Standards alignment pages (ISO, NIST, W3C)