---
title: Docs Author Rules
sidebar_label: Author Rules
sidebar_position: 99
---

# Documentation Author Rules

> **Status**: FROZEN
> **Version**: 1.0
> **Authority**: Documentation Governance

This document defines the rules for **adding or modifying** MPLP documentation.

---

## 1. When You Can Add a New Page

You **may** add a new documentation page if:

- [ ] It explains existing protocol semantics (no new concepts)
- [ ] It fits an existing section category
- [ ] It does not make new external claims (standards, compliance)
- [ ] It does not require MPGC approval

You **must escalate** to Documentation Governance if:

- The page introduces a new section
- The page could be interpreted as a protocol claim
- The page references external standards not already documented

---

## 2. When You Must Update the Alignment Index

Update `REPO_DOCS_CODE_ALIGNMENT.md` when:

- [ ] A new schema is added
- [ ] A new package is published
- [ ] A new Golden Flow is defined
- [ ] Documentation claims change regarding code location

---

## 3. When Governance Escalation is Required

| Situation | Escalation Level |
|:----------|:-----------------|
| New section in sidebar | Documentation Governance |
| New external standard claim | Documentation Governance + Website Governance |
| New protocol semantic | **MPGC** |
| Change to normative content | **MPGC** |

---

## 4. Sidebar Organization Rules

| Category | Content Type | May Contain |
|:---------|:-------------|:------------|
| Reference | Overview, Glossary | Non-normative |
| Architecture | L1–L4 specs | Normative |
| Modules | Module specs | Normative |
| Golden Flows | Validation scenarios | Normative |
| Governance | Policies, statements | Mixed |
| Standards | External mappings | Informative |
| SDK / Runtime | Implementation docs | Reference |
| Compliance / Enterprise / Adoption | Guidance | Informative |

**Do not mix normative and informative content in the same page.**

---

## 5. Forbidden Actions

- ❌ Adding "compliant/certified/endorsed" language
- ❌ Adding vendor endorsements or logos
- ❌ Adding CTAs or marketing language
- ❌ Bypassing the Alignment Index
- ❌ Creating orphan pages (not linked from sidebar)

---

## 6. Review Checklist (Before Merge)

- [ ] Content fits existing section
- [ ] No new protocol claims
- [ ] No new external standard claims
- [ ] Alignment Index updated (if applicable)
- [ ] Links work
- [ ] Build passes

---

**Documentation Governance**
**2025-12-21**
