# Repository Operating Rules for Codex

This repository is part of the Coregentis MPLP / Cognitive OS / SoloCrew / Validation Lab project family. Codex work here must preserve project boundaries and produce verifiable engineering evidence.

## Repository Layer

MPLP owns protocol objects, schemas, invariants, conformance vocabulary, and protocol documentation. Protocol core must stay product-neutral, runtime-neutral, vendor-neutral, and free of commercial validation claims.

## Repo Truth First

Before implementation, inspect repository truth:

- `git branch --show-current`
- `git status --short`
- `git rev-parse HEAD`
- `git rev-parse --verify origin/main || true`
- `git log --oneline -5`

Reuse existing assets before creating new files. Prefer updating an existing rule, skill, script, audit, or governance record over creating a duplicate document.

## Hard Boundaries

- Preserve protocol, runtime, product, validation, and publication boundaries.
- Do not modify release tags, release seals, package versions, publish plans, public website copy, schemas/v2 protocol objects, core package implementation logic, product source code, Validation Lab runtime/evidence logic, or public legal/compliance claims unless the owner explicitly approves that scope.
- Do not run `npm publish`, `npm deprecate`, PyPI upload, PyPI yank/delete, `git tag`, release seal creation, package version bump, or protocol schema primitive intake without owner approval.
- Do not make public legal, compliance, certification, regulator-approval, vendor-ranking, or official-standard claims without owner approval.

## MPLP Schema v2 Discipline

For MPLP `schemas/v2` work, use this order:

1. Invariant first.
2. Negative fixture second.
3. Object schema third.
4. Positive fixture fourth.
5. Validator and conformance gates last.

v1.0 module references to v2 objects must be pointer-only. Do not inline v2 object fields into v1 module schemas.

## Boundary Language

- No product, runtime, commercial, certification, legal-compliance, regulator-approval, or vendor-ranking language may leak into MPLP protocol core.
- No protocol authority may leak into product UI.
- Cognitive OS may bind to MPLP semantics but must not redefine MPLP protocol authority.
- Validation Lab may present deterministic evidence and adjudication but must not become a certification authority.
- SoloCrew UI must not expose internal protocol/runtime jargon as primary user-facing copy.

## Completion Discipline

Do not declare completion without reporting:

- files changed
- commands run
- pass/fail evidence
- final git status
- remaining risk

If a verification command is unavailable or inappropriate, state why instead of silently skipping it.
