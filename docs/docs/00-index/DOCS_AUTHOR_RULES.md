---
doc_type: reference
status: active
authority: Documentation Governance
description: "This document defines the rules for **adding or modifyi..."
canonical: /docs/00-index/DOCS_AUTHOR_RULES
title: Docs Author Rules
---

# Docs Author Rules

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 2. When You Must Update the Alignment Index

Update `REPO_DOCS_CODE_ALIGNMENT.md` when:

- [ ] A new schema is added
- [ ] A new package is published
- [ ] A new Golden Flow is defined
- [ ] Documentation claims change regarding code location

## 4. Sidebar Organization Rules

| Category | Content Type | May Contain |
|:---------|:-------------|:------------|
| Reference | Overview, Glossary | Non-normative |
| Architecture | L1鈥揕4 specs | Normative |
| Modules | Module specs | Normative |
| Golden Flows | Validation scenarios | Normative |
| Governance | Policies, statements | Mixed |
| Standards | External mappings | Informative |
| SDK / Runtime | Implementation docs | Reference |
| Compliance / Enterprise / Adoption | Guidance | Informative |

**Do not mix normative and informative content in the same page.**

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