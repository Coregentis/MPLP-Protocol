---
sidebar_position: 5
doc_type: governance
normativity: informative
status: draft
authority: Documentation Governance
description: "Editorial standards for MPLP documentation including writing style, formatting, terminology, and review process."
title: Editorial Policy
---

# Editorial Policy


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

1. **Authority Block**: Standard authority reference block (MUST appear before H1)
2. **FROZEN Header**: Standard frozen specification banner (if applicable)
3. **Title**: Clear, descriptive H1 heading
4. **Purpose Section**: What this document covers
5. **Content Sections**: Numbered hierarchy
6. **Copyright Footer**: Apache 2.0 notice

## 4. Review Process

1. Author submits PR with documentation changes
2. At least one maintainer reviews
3. Check for technical accuracy and style compliance
4. Merge after approval

## 5. Versioning

Documentation follows semantic versioning aligned with protocol versions:

- **Major**: Breaking changes or restructures
- **Minor**: New sections or significant additions
- **Patch**: Typo fixes, clarifications

---

**Documentation Governance**
**2025-12-21**