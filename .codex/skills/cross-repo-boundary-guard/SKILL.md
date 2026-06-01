---
name: cross-repo-boundary-guard
description: Use when a task touches MPLP, Cognitive OS, SoloCrew, Validation Lab, website, docs, runtime, protocol, evidence, publication, or brand surfaces. Prevents boundary drift.
---

# Cross-Repo Boundary Guard

## Authority Map

MPLP owns:

- protocol objects
- schemas
- invariants
- conformance vocabulary
- protocol docs

Cognitive OS owns:

- runtime substrate
- execution semantics
- DTOs
- evidence pipeline
- protocol bindings

SoloCrew owns:

- product UX
- founder console
- secretary/cell interaction
- projection-safe workflow views

Validation Lab owns:

- evidence packs
- deterministic adjudication
- pointer resolution
- failure cases
- public validation UI

JearonWong.com owns:

- articles
- essays
- white papers
- brand narrative
- publication pages
- social distribution assets

## Required Boundary Check

Before implementation, classify every changed file:

```yaml
boundary_check:
  file:
  repo_layer:
  allowed_semantics:
  forbidden_semantics:
  risk:
```

## Forbidden Drift

- MPLP must not contain product UI language.
- SoloCrew must not claim protocol authority.
- Cognitive OS must not redefine MPLP semantics.
- Validation Lab must not become certification authority.
- Website must not claim regulator approval or official standard status.
