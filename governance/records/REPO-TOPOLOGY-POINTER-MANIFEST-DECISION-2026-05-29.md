---
entry_surface: repository
doc_type: governance_record
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "REPO-TOPOLOGY-POINTER-MANIFEST-DECISION-2026-05-29"
---

# Repo Topology Pointer Manifest Decision - 2026-05-29

**Record ID**: REPO-TOPOLOGY-POINTER-MANIFEST-DECISION-2026-05-29
**Status**: Draft Governance Record
**Protocol Version**: 1.0.0
**Repository**: Coregentis/MPLP-Protocol
**Decision Scope**: Protocol public manifest contract, Website pointer relation, and Validation Lab pointer relation.

## 1. Decision

MPLP-Protocol is the source of protocol manifest truth. Website and Validation Lab must consume Protocol release metadata through the Protocol Public Manifest rather than through source embedding or submodule-style coupling.

This record introduces the in-repository manifest source files:

- `release-manifests/mplp-public-manifest.schema.json`
- `release-manifests/mplp-public-manifest.example.json`

## 2. Website Boundary

The Website remains the standalone discovery and positioning surface for MPLP.

The existing `MPLP_website` submodule remains temporarily attached. It must not be removed until Website manifest consumption has been implemented and verified.

Website must not override:

- protocol truth
- schema truth
- release truth
- package publication truth

Website may consume manifest fields for public copy, canonical URLs, SEO/GEO metadata, package version display, documentation links, Validation Lab pointers, and copyright/trademark notices.

## 3. Validation Lab Boundary

Validation Lab remains standalone and is not embedded in the current MPLP-Protocol repository.

Validation Lab consumes Protocol release metadata through manifest and pointer records. It must preserve the following boundaries:

- non-certifying
- non-normative
- evidence-based verdicts only
- no endorsement
- no regulator approval
- no runtime authority
- no SDK authority
- no protocol truth override

## 4. Repository Migration Boundary

The future independent organization is reserved:

```text
https://github.com/Multi-Agent-Lifecycle-Protocol
```

No repository migration is performed by this decision. Current canonical repository URLs remain under `Coregentis/*` until explicit migration authorization.

Package repository URLs remain unchanged.

## 5. Submodule Removal Deferral

Submodule removal is deferred because the downstream consumption path must exist before the historical coupling is removed.

The required sequence is:

1. Approve the manifest contract.
2. Add Protocol manifest schema and example.
3. Update Website to consume the manifest.
4. Update Validation Lab pointer relation.
5. Verify downstream builds and boundaries.
6. Remove the Website submodule in a dedicated later PR.
7. Update release SOP to require manifest updates and pointer validation.

## 6. Acceptance Gates

Future implementation must satisfy:

- the example manifest validates against the schema
- Website build consumes the manifest without hardcoded protocol drift
- Validation Lab references the manifest without certification claims
- submodule removal PR shows no lost Website deployment path
- release SOP requires manifest update before public release

## 7. Non-Actions

This record does not:

- remove `MPLP_website`
- edit `.gitmodules`
- modify Website source
- modify Validation Lab source
- change package versions
- publish npm or PyPI packages
- deprecate npm packages
- yank PyPI releases
- change remotes
- migrate repositories
- change GitHub settings
- create release tags

## 8. Related Governance Inputs

- `MPLP-WEBSITE-POINTER-MANIFEST-CONTRACT-2026-05-29.md`
- `protocol-public-manifest-contract.json`
- `website-pointer-contract.json`
- `validation-lab-pointer-contract.json`
- `topology-normalization-roadmap.json`

---

End of record.
