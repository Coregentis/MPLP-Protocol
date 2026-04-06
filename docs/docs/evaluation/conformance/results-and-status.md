---
sidebar_position: 4
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-CONF-RESULTS-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Results & Status
sidebar_label: Results & Status
description: "Secondary helper page for reading evaluation and adjudication outputs without creating a universal result doctrine."
authority: none
---

# Results & Status

This page is a **helper for reading outputs** from different MPLP-related
surfaces.

It does not define a universal evaluator outcome contract, and it does not
override the output vocabulary of the emitting surface.

## Read Outputs By Surface

| Surface | What To Read |
|:---|:---|
| Repository tests | test results and fixture outcomes in their own context |
| Validation Lab | admission, adjudication, ruleset, and verdict fields from Lab outputs |
| Docs helper pages | explanatory summaries only |

## Common Output Labels You May Encounter

Depending on the emitting surface, you may encounter labels such as:

- `PASS`
- `FAIL`
- `NOT_EVALUATED`
- `NOT_ADMISSIBLE`
- `ADJUDICATED`
- `REGISTERED`

These labels must be interpreted in the context of the emitting surface rather
than through a docs-side universal outcome ladder.

## Current Reading Order

If you need to interpret a published Lab result:

1. [Validation Lab Overview](/docs/evaluation/validation-lab)
2. [Rulesets](/docs/evaluation/validation-lab/rulesets)
3. [Evidence Pack Contract](/docs/evaluation/validation-lab/evidence-pack-contract)
4. [Reviewability](/docs/evaluation/conformance/reviewability)

## Boundary

- this page does not define evaluator law
- this page does not define certification semantics
- this page does not create a docs-side result taxonomy

The emitting repository or Validation Lab surface prevails on actual result
meaning.
