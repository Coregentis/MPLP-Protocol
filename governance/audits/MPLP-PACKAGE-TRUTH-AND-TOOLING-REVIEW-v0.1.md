---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-PACKAGE-TRUTH-AND-TOOLING-REVIEW-v0.1"
title: "MPLP Package Truth and Tooling Review v0.1"
surface_role: canonical
---

# MPLP Package Truth and Tooling Review v0.1

> **Non-Normative Tooling Closure Only**
>
> This document records current package/tooling truth in the checked-in
> repository. It does not change schemas, invariants, packages, or protocol law.

## 1. Purpose

This review exists to make current repo-local package truth less ambiguous.

The main question is not whether packages may be published in other contexts.
The main question is what this repository currently and truthfully provides as a
checked-in package/tooling surface today.

## 2. Root-Level Tooling Posture

Current root truth is bounded:

- the root repository has no truthful unified workspace type gate
- the root repository has no truthful unified workspace build gate
- root `npm test` is currently a no-op placeholder, not a protocol/package test
  gate
- package-level `tsconfig.json` files exist in multiple subtrees, but that does
  not add up to one verified root build posture
- checked-in package manifests often describe publish-oriented outputs rather
  than repo-local guaranteed artifacts

This means the current repository should not be read as a monorepo with a fully
executable root package/tooling contract.

## 3. Package Family Classification

### 3.1 `packages/npm/*`

The `packages/npm/*` tree is best read today as a publish-surface-oriented
package line, not as a uniformly locally consumable checked-in package line.

In the current checked-in repo:

- most package manifests declare `main` and `types` under `dist/`
- those `dist/` targets are not present in checked-in repo truth
- some packages still contain bounded source-side residue such as local
  `tsconfig.json`, tests, or `src/`
- that residue does not by itself make the package manifest truthful for
  repo-local consumption

### 3.2 `packages/sources/*`

The `packages/sources/*` tree is not one uniform source-package family.

Current checked-in truth is mixed:

- `packages/sources/validator/` is the clearest checked-in source package
  because it contains `src/` and a direct source-side build posture
- `packages/sources/sdk-ts/` identifies itself as a source mirror, but current
  checked-in contents are mirror/release-prep oriented and do not include a
  checked-in `src/` or `dist/`

So "`packages/sources/*` equals locally buildable source packages" is also not a
truthful blanket reading.

## 4. Safe vs Misleading Assumptions

### 4.1 Safe Current Assumptions

The following assumptions are currently safe:

- frozen protocol truth still lives in schemas, governance, and repository
  source records
- package metadata may still be meaningful for publish/release posture even when
  repo-local build artifacts are absent
- source/build/package posture is currently uneven across package families
- package/tooling posture needs explicit reading rather than inference

### 4.2 Misleading Current Assumptions

The following assumptions are misleading and should be rejected:

- "all `packages/npm/*` are locally consumable as checked-in packages"
- "declared `main` and `types` imply checked-in `dist/` reality"
- "the root repository already provides a truthful root type/build gate"
- "all `packages/sources/*` are equivalent locally buildable source packages"
- "tracked empty AppleDouble-style files are meaningful repo assets"

## 5. Tooling Irregularities Confirmed

This review confirmed several bounded tooling irregularities:

- multiple tracked empty `.!*` files were present in the repo and did not carry
  package or protocol meaning
- `packages/sources/validator/tsconfig.json` was encoded as UTF-16 LE with CRLF,
  unlike the repo's otherwise normal JSON/ASCII tooling posture
- package-level `dist/` expectations are often publish-oriented rather than
  checked-in truth

These are tooling/package-truth issues, not protocol-law issues.

## 6. Bounded Judgment

The current repo truth is best described as:

- frozen protocol repository first
- publish-surface metadata second
- uneven checked-in local package/tooling consumability

That is acceptable as long as it is stated explicitly and not over-read as a
fully unified root package workspace.

## 7. Bounded Hardening From This Wave

This wave hardens the repo by:

- recording a package-truth review under governance
- recording a package-by-package `dist/` reality matrix
- clarifying README/CHANGELOG wording around current tooling posture
- normalizing the validator source `tsconfig.json` into ordinary UTF-8 JSON
- removing tracked empty `.!*` files and ignoring future reintroduction

## 8. Residual Future Work

This wave does **not** solve all future tooling work.

Still-deferred work includes:

- deciding whether a truthful root-level type/build gate should exist
- deciding whether selected `packages/npm/*` should become locally consumable in
  checked-in form
- deciding whether selected source mirrors should be tightened further to avoid
  mixed publish/mirror expectations

Those would require separate, explicitly bounded tooling work.
