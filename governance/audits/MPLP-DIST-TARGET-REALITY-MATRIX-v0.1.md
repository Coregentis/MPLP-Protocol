---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-DIST-TARGET-REALITY-MATRIX-v0.1"
title: "MPLP Dist Target Reality Matrix v0.1"
surface_role: canonical
---

# MPLP Dist Target Reality Matrix v0.1

> **Repo-Local Reality Matrix Only**
>
> This matrix records checked-in repo truth. It does not adjudicate whether a
> package may be publishable in another release context.

| Package Path | Declared `main` | Declared `types` | Target Exists In Repo | Repo-Local Manifest Truth | Current Posture | Recommended Bounded Treatment |
| --- | --- | --- | --- | --- | --- | --- |
| `packages/npm/compliance` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented legacy package surface | keep as-is but document as publish-oriented |
| `packages/npm/conformance` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented alias package with checked-in `src/` residue | keep as-is but document as publish-oriented |
| `packages/npm/coordination` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/core` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/devtools` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/integration-llm-http` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/integration-storage-fs` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/integration-storage-kv` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/integration-tools-generic` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/modules` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public package surface | keep as-is but document as publish-oriented |
| `packages/npm/runtime-minimal` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public runtime helper surface | keep as-is but document as publish-oriented |
| `packages/npm/schema` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public schema/data mirror surface | keep as-is but document as publish-oriented |
| `packages/npm/sdk-ts` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | publish-oriented public facade package | keep as-is but document as publish-oriented |
| `packages/npm/validator` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful for repo-local consumption | CI-only/package-target surface with absent checked-in build outputs | keep as-is but document as publish/CI oriented |
| `packages/sources/sdk-ts` | `dist/index.js` | `dist/index.d.ts` | No / No | not truthful as a checked-in locally buildable source package | source-mirror / release-prep package, publish-blocked | mark source-mirror posture explicitly and defer manifest tightening |
| `packages/sources/validator` | `src/index.ts` | none declared | `src/index.ts` exists | truthful as a checked-in source package | source-side build package for validator tooling | keep as source-side package and normalize tooling posture |

## Notes

- "Target Exists In Repo" means the exact `main` / `types` target path is
  present in checked-in repository contents.
- "Repo-Local Manifest Truth" evaluates whether the manifest is truthful for
  direct repo-local consumption without assuming an external publish/build
  context.
- This matrix is intentionally package-truth-focused. It does not change
  package publication semantics or protocol semantics.
