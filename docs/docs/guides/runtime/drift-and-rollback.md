---
sidebar_position: 5

doc_type: reference
normativity: informative
status: draft
authority: none
description: "Non-authoritative runtime guide for drift detection and rollback patterns in MPLP runtimes."
title: Drift and Rollback
keywords: [MPLP, Drift Detection, Rollback, PSG, Runtime, Transaction]
sidebar_label: Drift and Rollback

---

# Drift and Rollback

> **Status**: Draft runtime guide  
> **Authority**: Non-authoritative documentation surface  
> **Boundary**: This page describes runtime implementation patterns. It does not
> define new protocol requirements or introduce new protocol event types.

## 1. Purpose

This guide describes common runtime patterns for:

- detecting divergence between expected MPLP state and observed external state
- preserving traceability when a runtime compensates or reverts actions
- organizing snapshot/restore behavior around PSG/VSL-oriented runtimes

The canonical protocol baseline still lives in repository-backed schemas,
invariants, taxonomy, and governance sources.

## 2. Scope

This page is about **runtime guidance**, not protocol truth.

It is appropriate for:

- implementation teams designing runtime reconciliation behavior
- runtime authors deciding how to snapshot, restore, or compensate state
- readers who need a conceptual map between PSG/VSL and rollback patterns

It is **not** the place to define:

- new normative event names
- a mandated storage engine
- a single rollback algorithm
- enterprise HA/DR architecture
- a single vendor-specific runtime design

## 3. Drift in MPLP Terms

In MPLP terms, **drift** is a runtime-observed discrepancy between:

- the state a conformant runtime expects from its PSG/VSL-backed model
- and the state actually observed in files, repositories, tools, or external systems

PSG remains the logical state model. Runtime implementations are responsible for
detecting when their observed world no longer matches that model.

## 4. Detection Strategies

Common runtime strategies include:

| Strategy | Description | Typical Tradeoff |
|:---|:---|:---|
| Passive detection | Detect divergence during normal reads or state refreshes | Lower overhead, slower discovery |
| Active polling | Periodically compare expected vs observed state | Higher overhead, earlier discovery |
| Invariant-triggered detection | Re-check relevant invariants during important state changes | Good semantic signal, narrower coverage |

Runtimes may combine these strategies. MPLP does not require one single
mechanism.

## 5. What to Record When Drift Is Observed

This guide does **not** mint new protocol event types such as
`DriftDetectedEvent` or `RollbackInitiated`.

Instead, runtimes should record drift and recovery using the protocol surfaces
that already exist, for example:

- `graph_update` evidence when the logical graph is reconciled
- `pipeline_stage` evidence when a step or stage fails, pauses, resumes, or is aborted
- `compensation_plan` reasoning when a runtime prepares or executes compensating actions
- `trace` content that explains what happened, what was rolled back, and why

If a product introduces local runtime-specific events beyond the current MPLP
taxonomy, those should be clearly labeled as product/runtime-local rather than as
protocol event-family truth.

## 6. Rollback Patterns

Rollback in MPLP runtime guidance means restoring a runtime to a coherent state
after failure, rejection, or unsafe divergence.

Common patterns include:

| Pattern | Runtime Meaning | Boundary |
|:---|:---|:---|
| PSG snapshot/restore | Restore the runtime's logical state model to a known checkpoint | Runtime design choice |
| VSL transaction rollback | Revert persisted state abstraction changes when the storage layer supports it | Runtime/storage choice |
| External compensation | Attempt inverse actions for external side effects | Best-effort runtime behavior |
| User-mediated recovery | Ask for confirm/review before continuing after divergence | Governance/runtime coordination |

MPLP does not require every runtime to implement every pattern.

## 7. Suggested Snapshot Boundary

Reasonable runtime checkpoints often include:

- before a high-risk plan step
- at pipeline-stage boundaries
- before applying external side effects
- before a multi-step transactional sequence

What gets snapshotted is implementation-defined. Typical candidates include:

- PSG state
- VSL state
- relevant working files
- external action manifests needed for compensation

## 8. Trace Preservation

A rollback or compensation path should remain visible in the trace story.

Good runtime hygiene includes:

- retaining the original failure evidence
- appending recovery/compensation evidence rather than erasing prior state
- making it possible to reconstruct what failed, what was reverted, and what remained

This is a runtime guidance principle, not a new protocol object definition.

## 9. Relationship to Runtime Glue

This page should be read together with:

- [Runtime Glue Overview](runtime-glue-overview.md)
- [PSG Overview](psg.md)
- [Crosscut PSG Event Binding](crosscut-psg-event-binding.md)
- [Value State Layer](vsl.md)

Those pages define the broader runtime/specification context. This page narrows
to drift and rollback patterns within that context.

## 10. Non-Goals

This guide does not define:

- a canonical `DriftDetectedEvent`
- a canonical `RollbackCompleted` event
- a required transaction manager
- a required compensation registry
- a required storage snapshot format

If a runtime needs those mechanisms, they belong either:

- in runtime-local implementation code, or
- in a future explicitly governed protocol/runtime artifact

## 11. Implementation Reading

The safest interpretation of this page is:

- protocol truth defines the state model, invariants, and event families
- runtimes decide how to detect divergence and how to recover
- this page provides guidance for that runtime design space without upgrading
  guidance into new normative protocol requirements

---

**Final Boundary**: this page is an implementation-facing runtime guide. It is
not a protocol truth source, not a normative release gate, and not a source of
new protocol event definitions.
