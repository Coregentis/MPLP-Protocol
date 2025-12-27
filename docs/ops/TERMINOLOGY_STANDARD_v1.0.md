# MPLP Canonical Terminology Standard

**Version:** v1.0
**Status:** FROZEN
**Governance:** MPGC
**Date:** 2025-12-21

---

## Purpose

This document defines the **canonical terminology** for all MPLP publications, including:
- NPM package READMEs
- PyPI package READMEs
- Documentation (docs.mplp.io)
- Marketing materials
- GitHub descriptions

All future package updates MUST conform to this standard.

---

## Canonical Definitions

### Core Protocol Identity

| Term | Canonical Form | ❌ Incorrect Forms |
|:---|:---|:---|
| Protocol Name | **Multi-Agent Lifecycle Protocol (MPLP)** | MPLP Protocol (redundant) |
| Protocol Positioning | **Agent OS Protocol** | ~~Agent OS~~ (incomplete) |
| Full Description | **Agent OS Protocol for AI Agent Systems** | — |

### Standard Tagline

> **MPLP — The Agent OS Protocol for AI Agent Systems**

Or in longer form:

> **The Multi-Agent Lifecycle Protocol (MPLP) is the Agent OS Protocol that defines the lifecycle specification for AI agent systems.**

---

## README Template (Canonical)

All package READMEs must use this exact phrasing in the introduction:

```markdown
**Protocol:** MPLP v1.0.0 (Frozen)
**License:** Apache-2.0

The **@mplp/[package-name]** package provides **[description]** for the
**Multi-Agent Lifecycle Protocol (MPLP)** — the Agent OS Protocol for AI agent systems.
```

### ❌ Incorrect (Must Not Use)

```markdown
# Wrong: "Agent OS–level lifecycle specification"
# Wrong: "Agent OS for AI agents"
# Wrong: "the Agent OS–level lifecycle specification for AI agent systems"
```

### ✅ Correct (Must Use)

```markdown
# Correct: "the Agent OS Protocol for AI agent systems"
```

---

## Semantic Correction Queue

The following packages were published with incorrect terminology and require update in the next release:

| Package | Current Wording | Required Fix |
|:---|:---|:---|
| @mplp/core | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/coordination | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/schema | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/devtools | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/compliance | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/modules | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/runtime-minimal | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/sdk-ts | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| @mplp/integration-* | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |
| mplp-sdk (PyPI) | "Agent OS–level lifecycle specification" | → "Agent OS Protocol" |

**Action Required:** Next patch release must fix this terminology across all packages.

---

## Enforcement

1. All sync scripts (`batch-update-packages.js`) must use the canonical template
2. README generation must pull from this standard
3. PR reviews must check for terminology compliance

---

## Version History

| Version | Date | Change |
|:---|:---|:---|
| v1.0 | 2025-12-21 | Initial standard: "Agent OS Protocol" established |

---

**MPGC 2025-12-21**