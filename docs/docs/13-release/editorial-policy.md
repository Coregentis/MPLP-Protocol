---
title: Editorial Policy
description: Official Editorial Policy for MPLP documentation. Defines writing
  style, formatting standards, terminology usage, and documentation structure
  requirements.
keywords:
  - Editorial Policy
  - MPLP documentation
  - writing style
  - documentation standards
  - formatting guidelines
  - terminology
  - review process
sidebar_label: Editorial Policy
doc_status: normative
doc_role: guide
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_alignment:
  truth_level: T0D
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
  normativity_scope: docs_governance
  governance_alignment:
    policy_refs:
      - docs/docs/99-meta/frontmatter-policy.md
      - docs/docs/13-release/editorial-policy.md
    process_refs: []
normative_id: MPLP-CORE-EDITORIAL-POLICY
sidebar_position: 7
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Editorial Policy

**Version**: 1.0.0

## 1. Purpose

This document defines the editorial standards for MPLP documentation.

## 2. Writing Style

### 2.1 Tone

- Technical but accessible
- Concise and precise
- Active voice preferred

### 2.2 Formatting

| Element | Standard |
|:---|:---|
| Headings | Title Case for H1, Sentence case for H2+ |
| Code | Fenced blocks with language identifier |
| Tables | Markdown tables with left-aligned headers |
| Lists | Use `-` for unordered, `1.` for ordered |

### 2.3 Terminology

| Term | Usage |
|:---|:---|
| MPLP | Always uppercase |
| Context, Plan, Trace | Capitalized when referring to protocol objects |
| SDK | Uppercase |
| schema | Lowercase unless starting a sentence |

## 3. Documentation Structure

Each normative document MUST include:

1. **FROZEN Header**: Standard frozen specification banner
2. **Title**: Clear, descriptive H1 heading
3. **Purpose Section**: What this document covers
4. **Content Sections**: Numbered hierarchy
5. **Copyright Footer**: Apache 2.0 notice

## 4. Review Process

1. Author submits PR with documentation changes
2. At least one maintainer reviews
3. Check for technical accuracy and style compliance
4. Merge after approval

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
