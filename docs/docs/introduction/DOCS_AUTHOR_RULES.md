---
sidebar_position: 2
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "This document defines the rules for adding or modifying documentation in the MPLP docs site."
canonical: /docs/introduction/DOCS_AUTHOR_RULES
title: Docs Author Rules
---

## 1. Before You Write

Before creating or modifying documentation:

- [ ] Confirm the content fits an existing section (see Sidebar Organization)
- [ ] Verify no duplicate content exists
- [ ] Identify the normative weight (Normative, Informative, Mixed)
- [ ] Check if this affects the Alignment Index

## 2. When You Must Update the Alignment Index

Update `REPO_DOCS_CODE_ALIGNMENT.md` when:

- [ ] A new schema is added
- [ ] A new package is published
- [ ] A new Golden Flow is defined
- [ ] Documentation claims change regarding code location

## 3. Frontmatter Requirements

All documentation files MUST include:

```yaml
---
sidebar_position: <number>
doc_type: reference | guide | specification
status: active | draft | deprecated
authority: <governance authority>
description: "<brief description>"
title: <page title>
---
```

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

## 5. Writing Style Guidelines

- Use clear, concise language
- Define acronyms on first use
- Link to source schemas when referencing protocol entities
- Use admonitions (`> [!NOTE]`, `> [!IMPORTANT]`) for callouts
- Maintain consistent heading hierarchy (H1 for title, H2 for sections)

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