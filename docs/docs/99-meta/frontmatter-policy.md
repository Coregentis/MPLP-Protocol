---
title: Docs Frontmatter Policy
description: Standards and policy for documentation metadata to ensure normative compliance.
doc_status: normative
doc_role: guide
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_version: 1.0.0
spec_level: CrossCutting
modules: []
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
    process_refs: []
normative_id: MPLP-CORE-FRONTMATTER-POLICY
sidebar_position: 3
---
# MPLP Docs Frontmatter Policy

> **Status**: APPROVED
> **Scope**: All documentation under \`docs/\`.

To maintain the **Normative Corpus** standards, all documentation files MUST adhere to the following Frontmatter policy.

## 1. Required Fields

Every \`.md\` or \`.mdx\` file MUST contain the following YAML frontmatter keys:

\`\`\`yaml
---
protocol_version: "1.0.0"
doc_status: normative | informative
doc_role: <see enum>
spec_level: <see enum>
modules: []  # List of relevant modules
---
\`\`\`

## 2. Enumerated Values

### 2.1 doc_status

*   `normative`: Documents that define binding requirements (MUST/SHALL).
*   `informative`: Documents that provide guidance, reasoning, or examples (non-binding).

### 2.2 doc_role

| Role | Meaning | Allowed Status |
|---|---|---|
| `normative_spec` | Core Specification text | `normative` |
| `normative_index` | The Corpus Index | `normative` |
| `policy` | Governance or Security Policy | `normative` |
| `defined_term` | Glossary Definition | `normative` |
| `guide` | Implementation Guide | `informative` |
| `example` | Code Sample | `informative` |
| `ops` | Operational Procedures | `informative` |
| `release_note` | Release History | `informative` |

### 2.3 spec_level

*   `L1` (Architecture)
*   `L2` (Core Modules)
*   `L3` (Orchestration)
*   `L4` (Integration)
*   `Profile` (Standard Constrains)
*   `CrossCutting` (Global Concerns)
*   `N/A` (Guides/Informative)

## 3. Automation & Enforcement

*   **Linting**: CI runs `npm run lint:fm` to enforce presence of these keys.
*   **Normalization**: Use `npm run normalize` to apply directory-based defaults.
*   **Drift**: Any deviation from the `Normative Corpus Index` definition for a `normative` file constitutes a drift.
