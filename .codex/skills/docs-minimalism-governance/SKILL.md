---
name: docs-minimalism-governance
description: Use when creating, editing, or reviewing governance docs, release records, audit records, baselines, checklists, README files, or protocol documentation. Prevents document sprawl.
---

# Documentation Minimalism Governance

## Rule

Do not create new governance documents unless existing documents cannot be reused.

## Required Before New Docs

Codex must report:

```yaml
doc_reuse_check:
  existing_candidate_docs:
  can_update_existing:
  why_not_reuse:
  new_doc_needed:
  proposed_doc_path:
  document_budget_impact:
```

## Preferred Actions

1. Update existing baseline.
2. Append to existing audit record.
3. Add one index entry.
4. Only then create a new document.

## Forbidden

- Duplicate release records.
- Duplicate governance baselines.
- New checklist if an existing checklist can be extended.
- Marketing language in protocol docs.
- Certification, official standard, regulator approval, or vendor ranking claims.
