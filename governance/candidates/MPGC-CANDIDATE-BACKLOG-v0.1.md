---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPGC-CANDIDATE-BACKLOG-v0.1"
title: "MPGC Candidate Backlog v0.1"
surface_role: candidate_backlog
---

# MPGC Candidate Backlog v0.1

> **Non-Normative Candidate Backlog Only**
>
> This document records candidate pressure from downstream implementation
> evidence. It does not amend MPLP schemas, specifications, module semantics,
> core protocol law, package surfaces, profiles, bindings, or validation
> claims.

## 1. Document Control

- doc_id: MPGC-CANDIDATE-BACKLOG-v0.1
- task_id: TRI-REPO-MPLP-CANDIDATE-BACKLOG-REGISTRATION-WAVE-01
- status: non-normative candidate backlog
- date: 2026-05-05
- authority_order: MPLP -> Cognitive_OS -> SoloCrew
- source_rebaseline_ref: SoloCrew commit 5b238ca26d2912b2a7fbf239065d6ea9932d95ea
- cgos_current_line_ref: f9f22b0f742740d8fcc3a0ad05ef56dee0a8cc0a
- mplp_repo_head_start: 2b89ee839fbf54c1fb282bca93ae1fc080aa1772
- no_schema_change: true
- no_core_law_change: true
- no_normative_promotion: true
- no_conformance_claim: true
- no_certification_or_endorsement: true
- no_cognitive_os_canonicalization: true
- no_solocrew_product_semantics: true

## 2. Executive Summary

This backlog is registered because the current tri-repo line produced repeated
downstream evidence patterns across SoloCrew product pressure and Cognitive_OS
neutral runtime/public surfaces. The rebaseline at SoloCrew
`5b238ca26d2912b2a7fbf239065d6ea9932d95ea` identified candidate handling as the
remaining process gap after finding low implementation pollution and no
protocol boundary violation.

No MPLP normative change occurs now because the evidence comes from one
downstream app line and one implementation-layer runtime package surface. That
is enough to track candidate pressure, but not enough to change schemas, core
law, module semantics, profiles, bindings, or protocol validation posture.

This registration restores the agreed flow: SoloCrew product demand generated
implementation pressure, Cognitive_OS mapped that pressure into neutral
projection/evidence surfaces, and MPLP now records candidate-only backlog items
for later governance instead of absorbing downstream vocabulary or runtime
implementation details.

## 3. Candidate Admission Rules

- A candidate must come from repeated downstream evidence, not one isolated
  convenience request.
- A candidate must not encode product-specific semantics as protocol
  vocabulary.
- A candidate must not encode Cognitive_OS implementation law, package maps,
  DTO field names, or runtime internals as MPLP law.
- A candidate must be versioned and non-normative while it is in backlog.
- A candidate requires future MPGC review before any protocol change can occur.
- A candidate may become guide, profile, or binding candidate material later,
  but this backlog does not advance it automatically.

## 4. Candidate Registry Table

| Candidate ID | Type | Source | Related modules | Related runtime concepts | Summary | Current decision |
| --- | --- | --- | --- | --- | --- | --- |
| `MPGC-CANDIDATE-EVIDENCE-OMISSION-BOUNDARY-FLAGS-01` | `MPLP_BINDING_CANDIDATE` | CGOS first/second/third-wave DTO patterns | Trace, Confirm, Core, Context | Observability, Runtime Glue, Learning Feedback | repeated use of `safe_evidence_refs`, `omission_markers`, `runtime_private_fields_omitted`, and `boundary_flags` | non-normative backlog only |
| `MPGC-CANDIDATE-RUNTIME-SESSION-EVIDENCE-01` | `MPGC_BACKLOG_CANDIDATE` | SoloCrew bridge blocker and CGOS third-wave runtime-session DTOs | Context, Trace, Core | Runtime Glue, VSL, PSG, Observability | runtime session posture/evidence without constructor or runtime-private exposure | non-normative backlog only |
| `MPGC-CANDIDATE-WORKER-LIFECYCLE-EVIDENCE-01` | `MPGC_BACKLOG_CANDIDATE` | SoloCrew bridge blocker and CGOS third-wave worker-lifecycle DTOs | Role, Collab, Trace, Core | Runtime Glue, Observability | worker lifecycle observation/evidence without lifecycle runtime authority | non-normative backlog only |
| `MPGC-CANDIDATE-DOWNSTREAM-RUNTIME-BRIDGE-MIGRATION-01` | `NON_NORMATIVE_GUIDE_CANDIDATE` | SoloCrew legacy CGOS relative bridge debt and package-subpath migration chain | Core, Extension, Network, Trace | Runtime Glue, Observability | guidance candidate for migrating downstream apps from runtime internals to projection/evidence-safe package surfaces | non-normative backlog only |
| `MPGC-CANDIDATE-PROJECTION-SAFE-PACKAGE-SURFACE-01` | `NON_NORMATIVE_GUIDE_CANDIDATE` | CGOS private package export chain and SoloCrew import spikes | Core, Extension, Network | Runtime Glue | optional guide candidate for package/export surface hygiene, explicitly not protocol package law | non-normative backlog only |
| `MPGC-CANDIDATE-ACTION-DISPATCH-BOUNDARY-EVIDENCE-01` | `PROFILE_CANDIDATE` | CGOS runtime-action-request and dispatch-boundary evidence DTOs | Plan, Confirm, Trace, Extension, Network | AEL, Runtime Glue, Observability | evidence pattern for action request and dispatch denial without provider, channel, or tool authority | non-normative backlog only |
| `MPGC-CANDIDATE-LEARNING-CORRECTION-EVIDENCE-01` | `MPGC_BACKLOG_CANDIDATE` | CGOS learning-correction evidence DTO and SoloCrew correction/learning needs | Context, Plan, Trace | Learning Feedback, Observability | learning/correction capture evidence without training authority or mutation writeback | non-normative backlog only |

## 5. Candidate Detail Sections

### 5.1 MPGC-CANDIDATE-EVIDENCE-OMISSION-BOUNDARY-FLAGS-01

- candidate_id: MPGC-CANDIDATE-EVIDENCE-OMISSION-BOUNDARY-FLAGS-01
- title: Evidence, omission marker, and boundary flag candidate
- type: MPLP_BINDING_CANDIDATE
- source evidence: CGOS first-wave, second-wave, and third-wave DTO patterns.
- downstream product origin: downstream needs for reviewable operating-loop
  evidence, persistence continuity, learning/correction capture, action
  review, runtime session continuity, and worker lifecycle visibility.
- Cognitive_OS implementation evidence: repeated DTO field families for
  `safe_evidence_refs`, `omission_markers`,
  `runtime_private_fields_omitted`, and explicit no-authority
  `boundary_flags`.
- related MPLP modules: Trace, Confirm, Core, Context.
- related runtime concepts: Observability, Runtime Glue, Learning Feedback.
- problem statement: downstream implementations repeatedly need a way to expose
  evidence posture and omitted private payload posture without creating runtime
  authority or normative protocol fields.
- why candidate-only now: the current evidence is implementation-layer and has
  not been validated across independent downstream runtimes.
- why no schema/core-law change now: the repeated field families are DTO
  implementation evidence, not accepted MPLP object families.
- explicit non-goals: no standard field names, no required DTO shape, no
  runtime-private payload access, no execution authority, and no mutation
  authority.
- forbidden claims: no conformance claim, no certification claim, no
  endorsement claim, no protocol acceptance claim, and no implementation
  canonicalization claim.
- future governance path: collect cross-downstream evidence, compare with
  existing Trace and Confirm semantics, and decide in a separate owner-approved
  wave whether this remains backlog-only or becomes binding-consideration
  material.

### 5.2 MPGC-CANDIDATE-RUNTIME-SESSION-EVIDENCE-01

- candidate_id: MPGC-CANDIDATE-RUNTIME-SESSION-EVIDENCE-01
- title: Runtime session evidence posture candidate
- type: MPGC_BACKLOG_CANDIDATE
- source evidence: SoloCrew bridge blocker analysis and CGOS third-wave
  runtime-session summary/evidence DTOs.
- downstream product origin: downstream runtime continuity and internal
  dependency cleanup needs.
- Cognitive_OS implementation evidence: non-executing runtime-session summary
  and evidence surfaces that omit constructors, service instances, mutable
  state, provider dispatch, channel dispatch, tool invocation, storage writes,
  and mutation writeback.
- related MPLP modules: Context, Trace, Core.
- related runtime concepts: Runtime Glue, VSL, PSG, Observability.
- problem statement: downstream apps may need session posture evidence without
  exposing live runtime handles or creating session lifecycle authority.
- why candidate-only now: runtime session posture remains implementation-layer
  and may vary by runtime.
- why no schema/core-law change now: a single downstream app plus one runtime
  implementation line is not enough evidence for protocol semantics.
- explicit non-goals: no session object model, no constructor exposure, no live
  handle exposure, no package-surface requirement, and no lifecycle authority.
- forbidden claims: no conformance claim, no certification claim, no
  endorsement claim, no official implementation claim, and no protocol
  promotion claim.
- future governance path: reassess after downstream third-wave import evidence
  and after additional runtime implementations show whether a neutral session
  evidence posture recurs.

### 5.3 MPGC-CANDIDATE-WORKER-LIFECYCLE-EVIDENCE-01

- candidate_id: MPGC-CANDIDATE-WORKER-LIFECYCLE-EVIDENCE-01
- title: Worker lifecycle observation evidence candidate
- type: MPGC_BACKLOG_CANDIDATE
- source evidence: SoloCrew bridge blocker analysis and CGOS third-wave
  worker-lifecycle summary/evidence DTOs.
- downstream product origin: downstream needs for worker lifecycle visibility
  and internal dependency cleanup.
- Cognitive_OS implementation evidence: non-executing worker-lifecycle summary
  and evidence surfaces that deny lifecycle transition authority, mutable worker
  record exposure, service instance exposure, storage writes, mutation
  writeback, and training authority.
- related MPLP modules: Role, Collab, Trace, Core.
- related runtime concepts: Runtime Glue, Observability.
- problem statement: downstream consumers may need worker lifecycle observation
  without gaining authority to change worker state or call lifecycle methods.
- why candidate-only now: worker lifecycle posture is close to runtime
  implementation behavior and must not become protocol law by convenience.
- why no schema/core-law change now: existing evidence is not yet
  cross-implementation proof of a stable MPLP abstraction.
- explicit non-goals: no worker runtime class, no worker store, no lifecycle
  transition method, no mutable record, and no revision mutation surface.
- forbidden claims: no conformance claim, no certification claim, no
  endorsement claim, no official implementation claim, and no protocol
  promotion claim.
- future governance path: keep backlog-held until multiple downstream consumers
  demonstrate neutral lifecycle observation needs separate from runtime control.

### 5.4 MPGC-CANDIDATE-DOWNSTREAM-RUNTIME-BRIDGE-MIGRATION-01

- candidate_id: MPGC-CANDIDATE-DOWNSTREAM-RUNTIME-BRIDGE-MIGRATION-01
- title: Downstream runtime bridge migration governance candidate
- type: NON_NORMATIVE_GUIDE_CANDIDATE
- source evidence: SoloCrew legacy CGOS relative bridge debt, Cognitive_OS
  package-subpath export sequence, and downstream import spike evidence.
- downstream product origin: downstream dependency cleanup need for replacing
  fragile runtime-internal imports with projection/evidence-safe public package
  surfaces.
- Cognitive_OS implementation evidence: private package exports for
  runtime/public projection/evidence surfaces across operator review, first
  wave, second wave, and third wave surfaces.
- related MPLP modules: Core, Extension, Network, Trace.
- related runtime concepts: Runtime Glue, Observability.
- problem statement: downstream applications may need governance guidance for
  moving away from runtime internals without treating that migration as MPLP
  law.
- why candidate-only now: bridge migration is downstream implementation
  sequencing, not protocol semantics.
- why no schema/core-law change now: no MPLP schema can decide local package
  import ownership, application bridge shape, or runtime dependency strategy.
- explicit non-goals: no package manager rule, no dependency publication rule,
  no bridge replacement claim, no downstream migration claim, and no runtime
  implementation mandate.
- forbidden claims: no official dependency claim, no conformance claim, no
  certification claim, no endorsement claim, and no implementation
  canonicalization claim.
- future governance path: gather more downstream migration evidence and decide
  whether a non-normative guide note is useful without changing protocol
  semantics.

### 5.5 MPGC-CANDIDATE-PROJECTION-SAFE-PACKAGE-SURFACE-01

- candidate_id: MPGC-CANDIDATE-PROJECTION-SAFE-PACKAGE-SURFACE-01
- title: Projection-safe package surface guidance candidate
- type: NON_NORMATIVE_GUIDE_CANDIDATE
- source evidence: CGOS private package export chain and SoloCrew package
  import spikes.
- downstream product origin: downstream need to consume safe public surfaces
  instead of runtime internals.
- Cognitive_OS implementation evidence: private package map entries for
  runtime/public DTO, evidence, and handoff surfaces that avoid runtime-private
  imports and authority-bearing exports.
- related MPLP modules: Core, Extension, Network.
- related runtime concepts: Runtime Glue.
- problem statement: implementation ecosystems may benefit from guidance that
  package surfaces should expose projection/evidence-safe objects rather than
  runtime internals, while keeping package mechanics outside protocol law.
- why candidate-only now: package export hygiene is repository and ecosystem
  practice, not a protocol object or module duty.
- why no schema/core-law change now: package subpaths do not define MPLP
  semantics, invariants, or validation requirements.
- explicit non-goals: no MPLP package export law, no package publication, no
  official dependency posture, no runtime package mandate, and no profile
  creation.
- forbidden claims: no official dependency claim, no conformance claim, no
  certification claim, no endorsement claim, and no protocol promotion claim.
- future governance path: keep as optional guide-candidate material only if
  multiple downstream implementation lines independently repeat the pattern.

### 5.6 MPGC-CANDIDATE-ACTION-DISPATCH-BOUNDARY-EVIDENCE-01

- candidate_id: MPGC-CANDIDATE-ACTION-DISPATCH-BOUNDARY-EVIDENCE-01
- title: Action request and dispatch boundary evidence candidate
- type: PROFILE_CANDIDATE
- source evidence: CGOS runtime-action-request summary DTO and runtime-dispatch
  boundary evidence DTO.
- downstream product origin: downstream task/action review and operator review
  needs.
- Cognitive_OS implementation evidence: action request and dispatch boundary
  evidence surfaces that express blocked or deferred dispatch posture without
  provider, channel, or tool invocation authority.
- related MPLP modules: Plan, Confirm, Trace, Extension, Network.
- related runtime concepts: AEL, Runtime Glue, Observability.
- problem statement: downstream systems may need portable evidence around
  action requests and dispatch denial without granting execution or integration
  authority.
- why candidate-only now: the current shape is derived from one implementation
  layer and should not become a profile without additional governance.
- why no schema/core-law change now: no accepted cross-runtime action-dispatch
  evidence profile exists in this wave.
- explicit non-goals: no provider dispatch, no channel dispatch, no tool
  invocation, no execution authority, no integration binding, and no profile
  creation in this task.
- forbidden claims: no conformance claim, no certification claim, no
  endorsement claim, no official implementation claim, and no profile acceptance
  claim.
- future governance path: compare with existing Plan, Confirm, Trace,
  Extension, and Network semantics before any separate profile-candidate
  advancement.

### 5.7 MPGC-CANDIDATE-LEARNING-CORRECTION-EVIDENCE-01

- candidate_id: MPGC-CANDIDATE-LEARNING-CORRECTION-EVIDENCE-01
- title: Learning correction evidence candidate
- type: MPGC_BACKLOG_CANDIDATE
- source evidence: CGOS learning-correction evidence DTO and SoloCrew
  correction/learning needs.
- downstream product origin: downstream needs for bounded correction capture
  and user-preference continuity.
- Cognitive_OS implementation evidence: learning-correction evidence surface
  that records correction posture without training authority, storage write
  authority, or mutation writeback authority.
- related MPLP modules: Context, Plan, Trace.
- related runtime concepts: Learning Feedback, Observability.
- problem statement: downstream systems may need a repeatable way to record
  correction evidence while denying automatic training or mutable state effects.
- why candidate-only now: learning feedback semantics are sensitive and need
  broader evidence before any protocol-level consideration.
- why no schema/core-law change now: the current evidence remains DTO-level and
  implementation-layer only.
- explicit non-goals: no training authority, no mutation writeback, no memory
  store law, no user-profile protocol object, and no automatic learning
  semantics.
- forbidden claims: no conformance claim, no certification claim, no
  endorsement claim, no official implementation claim, and no protocol
  promotion claim.
- future governance path: gather additional downstream correction evidence and
  compare it against Context, Plan, and Trace before any future MPGC review.

## 6. Non-Goals

- no MPLP schema change
- no MPLP core law change
- no normative promotion
- no profile creation in this task
- no binding implementation in this task
- no conformance, certification, or endorsement claim
- no Cognitive_OS canonicalization
- no SoloCrew product vocabulary in protocol
- no package publication or official dependency claim

## 7. Relationship to SoloCrew

SoloCrew provided downstream evidence through product/runtime needs, bridge debt,
and import-spike pressure. SoloCrew remains the product and application layer.
Its product semantics do not enter MPLP vocabulary through this backlog.

Bridge replacement remains SoloCrew and Cognitive_OS implementation work. It is
not MPLP law, not a protocol duty, and not advanced by this document.

## 8. Relationship to Cognitive_OS

Cognitive_OS provided implementation evidence through neutral runtime/public DTO,
evidence, bundle, and private package export surfaces. Cognitive_OS remains a
non-binding downstream runtime implementation for purposes of this backlog.

Cognitive_OS package exports are not MPLP exports. Cognitive_OS DTOs are not MPLP
schemas, profiles, bindings, or core protocol objects.

## 9. Future MPGC Governance Path

Future MPGC handling should:

- collect more downstream evidence before considering advancement
- compare these patterns against other future downstream apps and runtime
  implementations
- decide separately whether any item should become guide, profile, or binding
  candidate material
- require separate owner authorization for any normative change
- preserve MPLP v1 stability unless a later authorized governance wave proves a
  stronger need

## 10. Decision

`MPGC_CANDIDATE_BACKLOG_REGISTERED_NON_NORMATIVE_NO_PROTOCOL_CHANGE`

## 11. Next Allowed Task

`CGOS-THIRD-WAVE-RUNTIME-SESSION-WORKER-LIFECYCLE-PACKAGE-EXPORT-VERIFICATION-AND-DOWNSTREAM-READINESS-WAVE-01`

The owner may also pause development.
