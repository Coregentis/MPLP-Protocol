---
doc_type: governance
status: frozen
authority: Documentation Governance
description: ""
title: Editorial Policy
---

# Editorial Policy

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

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