---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-BOUNDARY-AND-PROMOTION-RULES-v0.1"
title: "MPLP Boundary and Promotion Rules v0.1"
surface_role: canonical
---

# MPLP Boundary and Promotion Rules v0.1

> **Non-Normative Governance Frame**
>
> This document defines a candidate-triage and promotion frame only.
> It does **not** add accepted protocol content and does **not** override frozen
> MPLP constitutional or schema truth.

## 1. Purpose

This document defines the explicit decision rules for separating:

- protocol obligation
- runtime-family design
- product projection

Its job is to reduce accidental protocol bloat when new abstractions emerge from
runtime or product work.

## 2. Three-Layer Boundary Rule

### 2.1 Protocol obligation

A concept belongs in MPLP only when it defines a reusable interface obligation
that independent implementations must be able to express or honor.

Protocol-layer concepts should therefore be:

- implementation-independent
- runtime-family-independent
- product-independent
- expressible through schema/invariant-level truth

### 2.2 Runtime-family design

A concept belongs in a runtime family when it is needed to realize behavior,
state, orchestration, policy, or evidence inside a specific runtime substrate or
runtime stack, but is not yet proven to be a universal protocol obligation.

Runtime-family concepts may be:

- reusable across products
- upstream of product projections
- still too realization-sensitive for protocol promotion

### 2.3 Product projection

A concept belongs in product projection when it packages runtime truth into:

- UX-facing structure
- business-facing operating language
- dashboard, console, or management surfaces
- product-specific cards, workflows, and summaries

Product projection concepts must not be elevated into protocol law by
convenience.

## 3. Default Placement Rule

When placement is ambiguous, the default is:

1. keep it out of MPLP
2. keep it in runtime-family space if reusable runtime need is proven
3. otherwise keep it in product projection space

The burden of proof is therefore on promotion upward, not on keeping concepts
downstream.

## 4. Promotion Checklist

A candidate should only be considered for protocol promotion if it passes all
of the following checks.

### 4.1 Cross-runtime relevance

Question:

- Is the concept needed across more than one runtime family, not just one
  runtime implementation?

### 4.2 Implementation independence

Question:

- Can the concept be expressed without assuming a specific orchestrator, store,
  policy engine, tool layer, or product architecture?

### 4.3 Cross-business relevance

Question:

- Does the concept remain meaningful across different business domains rather
  than only one product's operating model?

### 4.4 Evidence expressibility

Question:

- Can the concept be represented as protocol-level evidence, interface shape, or
  lifecycle obligation without depending on hidden runtime internals?

### 4.5 Repeated validation outside one product

Question:

- Has the concept been validated in repeated use outside one product line or one
  product-driven design wave?

### 4.6 Non-overlap with current MPLP semantics

Question:

- Is this concept genuinely new at the protocol boundary, or can the need
  already be expressed through existing MPLP modules, events, or evidence
  semantics?

## 5. Promotion Stop Rules

A candidate must **not** be promoted when any of the following remain true:

- it is only justified by one runtime family
- it is only justified by one product
- it encodes business-specific operating language
- it depends on one UI or dashboard shape
- it assumes a specific runtime architecture
- it duplicates meaning already covered by existing MPLP truth

## 6. Promotion Evidence Package

Before any candidate can move beyond backlog status, the minimum evidence
package should include:

- statement of cross-runtime relevance
- statement of cross-business relevance
- explanation of why current MPLP semantics are insufficient
- at least two independent usage contexts or validation cases
- proof that the abstraction is implementation-independent enough for protocol
  treatment
- explicit non-overlap analysis against current schemas, invariants, and golden
  flows

## 7. Promotion Decision Rule

Passing the checklist does not automatically promote a candidate.

It only makes a candidate eligible for a separate governance decision.

Actual protocol promotion would still require:

- explicit governance action
- explicit protocol version-domain handling
- explicit schema/invariant/doc updates in a later, separate wave

## 8. Net Rule

MPLP should grow only when a candidate proves:

- cross-runtime value
- cross-business value
- implementation independence
- evidence-level expressibility
- repeated validation beyond one product

If any of those are missing, the concept stays in runtime-family or product
space.
