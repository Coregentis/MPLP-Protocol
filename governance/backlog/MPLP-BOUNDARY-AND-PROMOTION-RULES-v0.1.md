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
> It does **not** create accepted protocol content and does **not** override the
> frozen MPLP core.

## 1. Purpose

This document defines the explicit ladder for deciding whether a concept should
remain:

- product convenience
- mother-runtime family abstraction
- cross-runtime reusable abstraction
- protocol-candidate
- protocol-law

Its purpose is to stop accidental protocol bloat from downstream usage pressure.

## 2. Promotion Ladder

### 2.1 Product Convenience

A concept stays at product level when it mainly packages:

- UI structure
- business-facing language
- product summaries, cards, consoles, or workflows
- product-specific management or operating semantics

Product convenience does **not** create MPLP authority.

### 2.2 Mother-Runtime Family Abstraction

A concept belongs at runtime-family level when it is needed to realize:

- orchestration
- state
- evidence handling
- policy
- bounded coordination

inside a runtime family, but is not yet proven as a universal interface
obligation.

Runtime-family abstraction does **not** create MPLP authority.

### 2.3 Cross-Runtime Reusable Abstraction

A concept reaches this stage when it has:

- pressure from more than one runtime family
- meaning that is no longer product-specific
- plausible reuse across implementations

This still does **not** make it protocol law.
It only makes protocol-candidate consideration plausible.

### 2.4 Protocol-Candidate

A concept is a protocol candidate only when it:

- looks implementation-independent
- looks vendor-neutral
- has plausible schema-level or invariant-level expression
- shows repeated pressure beyond one downstream product or one runtime

Even at this stage, it remains non-normative until a later explicit promotion
decision.

### 2.5 Protocol-Law

A concept becomes protocol law only when it is explicitly adopted into:

- schemas
- invariants
- normative documentation
- or other frozen protocol-core assets

No candidate becomes protocol law implicitly.

## 3. Required Evidence Before Promotion

Before any concept moves upward toward protocol-candidate status, the evidence
package must include all of the following:

### 3.1 Repeated Downstream Pressure

The concept must show repeated pressure in more than one bounded downstream
context.

### 3.2 Cross-Implementation Plausibility

The concept must remain meaningful across multiple implementation approaches,
not only one runtime or one product architecture.

### 3.3 Vendor-Neutral Semantics

The concept must be expressible without relying on:

- one vendor
- one provider
- one framework
- one runtime style

### 3.4 Schema-Shape Stability

The concept must be stable enough that a schema-level or invariant-level shape
can be discussed without constant redesign.

### 3.5 Non-Product-Specific Meaning

The concept must remain meaningful even when stripped of:

- product UI wording
- business-domain phrasing
- application-specific workflow packaging

### 3.6 Non-Overlap With Frozen Core

There must be a clear showing that current MPLP semantics cannot already host
the need.

## 4. Promotion Stop Rules

A concept must **not** be promoted when any of the following remain true:

- it is mainly product convenience
- it is mainly runtime-private realization
- it is still shaped by one product’s operating model
- it is still shaped by one runtime’s orchestration design
- it is not stable enough for schema-level discussion
- it duplicates or shadows existing MPLP truth

## 5. No Silent Promotion Rule

No downstream repository may silently promote semantics into MPLP by:

- usage volume alone
- repeated local implementation alone
- architectural preference alone
- convenience for one runtime or product alone

Downstream repetition may create candidate pressure.
It does **not** create protocol-law status.

## 6. Net Rule

MPLP should remain a small, hard, POSIX-like protocol core.

That means:

- most concepts should stay out
- some concepts may become runtime-family abstractions
- a smaller subset may become cross-runtime abstractions
- only the most proven abstractions may become protocol candidates
- almost none should become protocol law without explicit evidence and explicit
  governance action
