---
entry_surface: repository
doc_type: governance
status: active
authority: MPLP public release governance
protocol_version: "1.0.0"
doc_id: "MPLP-RELEASE-SOP"
title: "MPLP Release SOP"
---

# MPLP Release SOP

## 1. Purpose

This SOP defines the current public MPLP release process across:

- `Coregentis/MPLP-Protocol`
- `Coregentis/MPLP-Official-Website`
- `Coregentis/MPLP-Validation-Lab`
- public npm package surfaces under `@mplp/*`
- public PyPI package surfaces such as `mplp-sdk`

It binds the recovered Protocol Public Manifest flow into repeatable release
work. It is the current canonical operational release SOP for public MPLP
releases. Older SDK-specific methods and release checklists remain useful
supporting records only where they do not conflict with this SOP.

## 2. Scope And Authority

`Coregentis/MPLP-Protocol` is the current public release source for MPLP
Protocol artifacts, schemas, public release manifests, governance records, SDK
source surfaces, and public package preparation.

`Coregentis/MPLP-Protocol-Dev` is the active Dev-side protocol/package/release
truth line for MPLP release-governance and package planning. This public repo
is the clean public OSS projection and public release subset; it is not a
substitute for Dev truth and must not be used as Dev package release-planning
authority. Do not merge Dev `main` directly into public `main`. Any
Dev-originated public candidate must be handled through a dedicated
owner-approved provenance, export, and projection record, not by direct branch
merge.

This authority wording alignment does not authorize public projection
execution, package publication, registry mutation, release-config mutation,
tagging, sealing, GitHub release creation, or merge.

Public OSS release changes must move through the protected PR path on
`Coregentis/MPLP-Protocol`. Direct public `main` pushes are not part of the
normal release path.

The future independent organization is reserved:

- `https://github.com/Multi-Agent-Lifecycle-Protocol`

It is informational only until a separate migration plan is approved and
executed. Current canonical repository and package metadata remain under
`Coregentis/*`.

## 3. Branch And PR Discipline

Release work uses a dedicated branch. Recommended branch names:

- `governance/<task-or-release-id>`
- `release/<release-window-id>`
- `package/<package-release-id>`
- `docs/<docs-release-id>`

Each public release PR must include:

- release scope and changed surfaces
- Protocol manifest status
- Website manifest sync status, when Website is in scope
- Validation Lab manifest pointer sync status, when Validation Lab is in scope
- package dry-run and replacement status, when packages are in scope
- identity and forbidden-overclaim scan status
- evidence file paths or release record paths

Required checks must run normally. Do not force merge, admin override, or bypass
failed required checks except under an emergency record described in Section 12.
Merge commits are preferred for governance or release-flow PRs so the release
history remains auditable.

## 4. Protocol Public Manifest Requirement

Every public release candidate must review the Protocol Public Manifest assets:

- `release-manifests/mplp-public-manifest.schema.json`
- `release-manifests/mplp-public-manifest.example.json`
- `scripts/semantic/validate-public-manifest.mjs`

The required local Protocol manifest gate is:

```bash
node scripts/semantic/validate-public-manifest.mjs
```

Before a public release can proceed:

- the manifest example must validate against the schema
- `protocol_version`, `protocol_release_tag`, and `protocol_commit_sha` must be
  consistent with the intended release candidate
- `canonical_repository` must remain
  `https://github.com/Coregentis/MPLP-Protocol` until repository migration is
  explicitly authorized
- `future_repository_target` may identify
  `https://github.com/Multi-Agent-Lifecycle-Protocol/MPLP-Protocol` only as a
  future target
- `package_replacement_status` must reflect the current package state
- `repo_migration_status` must not claim migration before it occurs
- `release_status.gates.submodule_removal_allowed` must remain false until the
  Website submodule removal prerequisites in Section 10 are met

The public manifest is a release metadata contract. It does not redefine
Protocol semantics and it does not make downstream surfaces protocol truth.

## 5. Website Manifest Sync Requirement

`Coregentis/MPLP-Official-Website` is a standalone discovery and positioning
surface. It consumes a vendored Protocol Public Manifest with a checksum and a
no-network validation gate.

For each release where Website display, metadata, links, package references, or
Protocol version references are in scope:

- sync the Website vendored manifest from the approved Protocol manifest
- update the Website checksum
- run the Website manifest validation/checksum gate
- run the Website normal test/build gates
- confirm Website does not present the future independent org as the current
  canonical repository
- confirm Website does not claim certification, endorsement, regulator
  approval, runtime authority, SDK authority, or protocol truth authority
- record the Website commit SHA or deployed release identifier in the release
  record

Website sync must be verified before public release completion if Website is in
scope for the release window.

The `MPLP_website` submodule in this repository must not be removed merely
because the Website manifest exists. Removal remains blocked until Section 10 is
satisfied.

## 6. Validation Lab Manifest Pointer Requirement

`Coregentis/MPLP-Validation-Lab` is a standalone, evidence-based adjudication
surface. It consumes or pins a vendored Protocol Public Manifest with a checksum
and a no-network validation gate.

For each release where Validation Lab protocol metadata, ruleset pointers,
schema references, evidence-pack references, or Lab public boundary text are in
scope:

- sync the Lab vendored manifest from the approved Protocol manifest
- update the Lab checksum
- run the Lab no-network manifest validation gate
- run the Lab normal test/build/semantic gates
- keep `protocol_version`, `validation_ruleset_version`,
  `validation_lab_release_version`, and evidence-pack version separate
- confirm Lab does not become Protocol truth authority
- confirm Lab remains non-certifying, non-endorsing, and not a regulator
  approval surface
- record the Lab commit SHA or release identifier in the release record

Manifest sync must not change evidence or adjudication semantics unless a
separate owner-approved task explicitly authorizes that change.

## 7. Package Release Gates

Package release work must follow the package clean replacement plan and the SDK
release methods where they do not conflict with this SOP:

- `governance/03-distribution/sdk/METHOD-SDKR-01_RELEASE_PIPELINE.md`
- `governance/03-distribution/sdk/METHOD-SDKR-05_RELEASE_MANIFEST.md`
- `governance/03-distribution/sdk/METHOD-SDKR-08_MULTI_PACKAGE_RELEASE_GOVERNANCE.md`
- `governance/03-distribution/sdk/METHOD-SDKR-09_RELEASE_READINESS.md`
- `governance/03-distribution/sdk/CHECKLIST-SDK-RELEASE.md`

No npm or PyPI package action is allowed until the clean replacement
implementation is separately approved.

Minimum package gates before any future package publication approval:

- identify the exact npm and PyPI publish set
- confirm source mirrors and private packages are excluded
- run the npm publish-set gate
- run the PyPI publish-set gate, if PyPI is in scope
- build each package intended for publication
- inspect `npm pack --dry-run` or `npm pack` output for each npm package
- inspect PyPI wheel/sdist contents for each PyPI package
- verify package repository URLs still point to `Coregentis/MPLP-Protocol` until
  repo migration is approved
- run active identity scans on package metadata and packed artifacts
- obtain owner approval after dry-run evidence and before registry action

Blocked until clean replacement approval:

- `npm publish`
- `npm deprecate`
- PyPI upload
- PyPI yank/delete
- release tag creation for package release purposes

Historical package versions must be preserved. Do not unpublish or delete
historical npm or PyPI versions.

## 8. Identity And Legal Surfaces

Active public release surfaces use `Jearon Wong` for current identity.

Historical records, frozen schemas, invariant evidence, registry evidence,
license history, and compatibility fixtures may preserve historical facts. Do
not bulk-rewrite identity strings across historical or frozen evidence.

Owner-review identity surfaces require a separate decision before migration.
Do not treat this SOP as approval to change them.

Release candidates must include an identity scan across active public surfaces
and package metadata relevant to the release window. Remaining hits must be
classified as one of:

- active migration required
- historical preserve
- frozen preserve
- owner decision required
- explanatory note candidate

## 9. Boundary And Overclaim Rules

Public release surfaces must not claim:

- MPLP certification
- endorsement by MPLP, Coregentis, Website, or Validation Lab
- regulator approval
- Website authority over Protocol truth
- Validation Lab authority over Protocol truth
- runtime authority
- SDK authority
- package version equals Protocol version unless explicitly stated
- future independent org as current canonical repository before migration

Boundary language may state that a surface is non-certifying, non-endorsing, not
regulator approval, evidence-based, discovery/positioning-only, or pointer-only.
Such negative or boundary uses must remain clear.

Every release candidate must run a forbidden-overclaim scan on changed active
surfaces and classify all matches.

## 10. Topology Normalization And Submodule Removal

Website and Validation Lab are standalone release-line repositories. Protocol
must not embed Website or Lab source in the final topology.

Do not remove or update `.gitmodules` or the `MPLP_website` submodule until all
of the following are true:

- Protocol Public Manifest schema and example exist and validate
- Website consumes a vendored Protocol manifest with checksum and gate
- Validation Lab consumes or pins a vendored Protocol manifest with checksum and
  gate
- this release SOP is merged
- a dedicated submodule removal PR proves no deployment path, release source,
  public URL, or source-of-truth relationship is lost
- the submodule removal PR verifies Protocol docs/build/release scripts no
  longer require `MPLP_website`
- the submodule removal PR records Website standalone checkout and manifest sync
  evidence

Submodule removal is a separate task. This SOP does not authorize it directly.

## 11. Release Checklist

Use this checklist for every public release window.

### 11.1 Protocol Gates

- [ ] dedicated release/governance branch created
- [ ] public `main` not pushed directly
- [ ] release scope and changed surfaces recorded
- [ ] `git diff --check` passes
- [ ] `node scripts/semantic/validate-public-manifest.mjs` passes
- [ ] root tests pass
- [ ] root lint passes
- [ ] docs build passes, when docs are in scope or touched
- [ ] `.gitmodules` unchanged unless this is an approved submodule PR
- [ ] `MPLP_website` gitlink unchanged unless this is an approved submodule PR

### 11.2 Manifest Checks

- [ ] Protocol manifest schema/example validates
- [ ] manifest commit/tag/version fields match intended release
- [ ] manifest checksum or downstream checksum is recorded where applicable
- [ ] `canonical_repository` remains `Coregentis/MPLP-Protocol`
- [ ] future org appears only as a future target
- [ ] package replacement and repo migration statuses are current

### 11.3 Website Gates

- [ ] Website vendored manifest sync needed/not-needed decision recorded
- [ ] Website manifest validation/checksum gate passes, if Website is in scope
- [ ] Website build/test gates pass, if Website is in scope
- [ ] Website does not override Protocol truth
- [ ] Website does not claim certification, endorsement, or regulator approval
- [ ] Website commit/deploy identifier recorded, if Website is in scope

### 11.4 Validation Lab Gates

- [ ] Validation Lab manifest pointer sync needed/not-needed decision recorded
- [ ] Lab no-network manifest validation/checksum gate passes, if Lab is in
  scope
- [ ] Lab quality/test/build/semantic gates pass, if Lab is in scope
- [ ] Lab remains non-certifying and non-normative
- [ ] Lab does not alter evidence/adjudication semantics unless separately
  authorized
- [ ] Lab commit/release identifier recorded, if Lab is in scope

### 11.5 Identity And Boundary Scans

- [ ] active identity scan completed on changed public surfaces
- [ ] remaining identity hits classified
- [ ] forbidden-overclaim scan completed on changed public surfaces
- [ ] no unsupported certification, endorsement, regulator approval, runtime
  authority, SDK authority, or Protocol truth authority claim introduced

### 11.6 Package Dry-Run Gates

- [ ] exact npm/PyPI publish set declared, if packages are in scope
- [ ] source mirrors/private packages excluded
- [ ] npm publish-set gate passes, if npm is in scope
- [ ] PyPI publish-set gate passes, if PyPI is in scope
- [ ] package build succeeds for every package in scope
- [ ] `npm pack` or `npm pack --dry-run` output inspected
- [ ] PyPI wheel/sdist output inspected
- [ ] package repository URLs remain under `Coregentis/*` until migration
- [ ] owner approval recorded before any registry action

### 11.7 Evidence And Merge Records

- [ ] release evidence record created or updated
- [ ] PR URL and number recorded
- [ ] required checks recorded
- [ ] merge commit recorded after merge
- [ ] post-merge HEAD recorded
- [ ] release note records changed/unchanged surfaces
- [ ] blocked actions explicitly preserved or separately authorized

## 12. Emergency, Rollback, And Supersession

Emergency bypass is allowed only when all of the following are true:

- the release owner declares an emergency
- the failing check is classified with evidence
- the bypass is recorded before or immediately after action
- the record names the exact branch, PR, commit, command, and operator
- a follow-up remediation task is created

Emergency bypass must not be used for package registry action, repository
migration, package URL migration, release tag creation, or submodule removal
unless the owner explicitly authorizes that exact irreversible action.

Rollback must not rewrite protected public history. Prefer:

- revert PRs
- forward-fix PRs
- package replacement versions after owner approval
- clear release notes that mark superseded artifacts

When this SOP supersedes old release instructions, retain old records for audit
and mark them as supporting or historical in release evidence. Do not delete
historical release records.

## 13. Current Blocked Actions

These actions remain blocked until a separate approved task authorizes them:

- package publish
- npm deprecate
- PyPI upload
- PyPI yank/delete
- repository migration
- package URL migration
- release tag creation
- schema v2 intake
- Website submodule removal
- GitHub settings changes

## 14. Non-Actions Of This SOP

This SOP does not:

- publish packages
- deprecate npm versions
- upload, yank, or delete PyPI releases
- create release tags
- migrate repositories
- change remotes
- change package repository URLs
- remove or update the `MPLP_website` submodule
- change Website source
- change Validation Lab source
- change GitHub settings
- approve broad identity rewrites
