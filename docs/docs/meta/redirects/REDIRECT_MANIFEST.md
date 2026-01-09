---
doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
sidebar_position: 1
description: "MPLP meta documentation: REDIRECT_MANIFEST. Release and maintenance information."
---

# Redirect Manifest — Docs IA v1

**Version:** B-2  
**Generated:** 2026-01-01  
**Alignment Ref:** v1.3.1  
**Status:** ACTIVE

---

## Purpose

This manifest documents all URL redirects required after the B-1 Docs IA restructure.

All old numeric-prefix URLs are redirected to their new 4-tier locations.

---

## Directory-Level Redirect Rules

| Old Path Prefix | New Path Prefix | Tier |
|-----------------|-----------------|------|
| `/docs/meta/index/` | `/docs/introduction/` | META |
| `/docs/specification/architecture/` | `/docs/specification/architecture/` | SPECIFICATION |
| `/docs/specification/modules/` | `/docs/specification/modules/` | SPECIFICATION |
| `/docs/specification/profiles/` | `/docs/specification/profiles/` | SPECIFICATION |
| `/docs/specification/observability/` | `/docs/specification/observability/` | SPECIFICATION |
| `/docs/guides/examples/learning-notes/` | `/docs/guides/examples/learning-notes/` | GUIDES |
| `/docs/evaluation/golden-flows/` | `/docs/evaluation/golden-flows/` | EVALUATION |
| `/docs/specification/integration/` | `/docs/specification/integration/` | SPECIFICATION |
| `/docs/guides/examples/` | `/docs/guides/examples/_merged_from_07a/` | GUIDES |
| `/docs/guides/` | `/docs/guides/` | GUIDES |
| `/docs/evaluation/tests/` | `/docs/evaluation/tests/` | EVALUATION |
| `/docs/guides/sdk/` | `/docs/guides/sdk/` | GUIDES |
| `/docs/guides/examples/` | `/docs/guides/examples/` | GUIDES |
| `/docs/evaluation/governance/` | `/docs/evaluation/governance/` | EVALUATION |
| `/docs/meta/release/` | `/docs/meta/release/` | META |
| `/docs/guides/runtime/` | `/docs/guides/runtime/` | GUIDES |
| `/docs/evaluation/standards/` | `/docs/evaluation/standards/` | EVALUATION |
| `/docs/evaluation/conformance/` | `/docs/evaluation/conformance/` | EVALUATION |
| `/docs/guides/enterprise/` | `/docs/guides/enterprise/` | GUIDES |
| `/docs/guides/adoption/` | `/docs/guides/adoption/` | GUIDES |
| `/docs/meta/` | `/docs/meta/` | META |

---

## Implementation

Redirects are implemented via `@docusaurus/plugin-client-redirects`.

Machine-readable rules: `REDIRECTS.json`

---

## Governance

- Changes to redirects require Class-2 Manifest
- Redirect removal requires evidence that old URLs have zero traffic

---

**Frozen:** 2026-01-01
