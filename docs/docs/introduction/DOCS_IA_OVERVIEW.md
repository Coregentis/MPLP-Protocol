---
sidebar_position: 1
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Informative overview of the current MPLP docs reading paths and section roles."
canonical: /docs/introduction/DOCS_IA_OVERVIEW
title: Docs Information Architecture Overview
---

# Docs Information Architecture Overview

This page is a **structural helper** only.

It does not define protocol semantics, public-surface authority, or a new docs
governance model.

## Path A — Specification Path

**Audience**: protocol implementers, SDK/package maintainers, runtime builders

**Recommended Order**
1. [Entry Points](/docs/reference/entrypoints)
2. [Specification](/docs/specification)
3. [Modules](/docs/specification/modules)
4. [Profiles](/docs/specification/profiles)
5. [Observability](/docs/specification/observability)

## Path B — Evaluation Path

**Audience**: evaluators, auditors, governance reviewers

**Recommended Order**
1. [Entry Points](/docs/reference/entrypoints)
2. [Golden Flows](/docs/evaluation/golden-flows)
3. [Validation Lab Overview](/docs/evaluation/validation-lab)
4. [Conformance](/docs/evaluation/conformance)
5. [Evaluation Guide](/docs/guides/evaluation-guide)

## Path C — Builder Path

**Audience**: users of published SDK and runtime helper surfaces

**Recommended Order**
1. [Entry Points](/docs/reference/entrypoints)
2. [SDK Guides](/docs/guides/sdk)
3. [TypeScript SDK Guide](/docs/guides/sdk/ts-sdk-guide)
4. [Python SDK Guide](/docs/guides/sdk/py-sdk-guide)
5. [Runtime Guides](/docs/guides/runtime)

## Section Roles

| Section | Role |
|:---|:---|
| `/docs/specification` | Primary specification/reference projection |
| `/docs/evaluation` | Secondary evaluation/reference helpers |
| `/docs/guides` | Informative implementation guidance |
| `/docs/meta` | FAQ, roadmap, and release/meta helpers |
| `/docs/reference` | Entry and route helper surfaces |

## Boundary

Use this page to orient reading order only.
For authority split and current public-surface routing, always defer to
[Entry Points](/docs/reference/entrypoints).
