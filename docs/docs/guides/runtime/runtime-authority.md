---

title: Runtime Authority & Scope
sidebar_label: Authority & Scope
sidebar_position: 1
doc_type: normative
normativity: normative
status: draft
authority: MPGC
audience: implementer

description: "MPLP runtime guide: Runtime Authority & Scope. Implementation guidance for runtime components."
---


# Runtime Authority & Scope

> **Profile**: 14-Golden  

## Scope

This document defines the **allowed authority and execution boundaries**
of the MPLP L3 Runtime for **Golden Flow execution only (FLOW-01 ~ FLOW-05)**.

## Allowed Capabilities

The Runtime MAY perform **only** the following:

- **A. Runtime Core**: Runtime execution and trace generation (Identity, Timeline, Trace).
- **D. Tool Invocation**: Tool invocation with evidence events.
- **E. File System**: File system updates with evidence events.
- **H. Profiles**: SA / MAP profile runtime evidence emission.
- **J. Invariants**: Evidence generation required for invariant evaluation.

## Explicit Non-Goals

The Runtime does NOT:

- **B. Pipeline**: Implement pipeline or stage orchestration.
- **C. Semantic Graph**: Update or manage semantic graphs (PSG).
- **F. Git**: Integrate with Git systems.
- **G. CI**: Integrate with CI systems.
- **I. Learning**: Generate learning samples.
- **Validation**: Perform invariant adjudication or validation.

## Authority Boundaries

The Runtime MUST NOT:

- Modify schema semantics.
- Implicitly repair or alter execution paths.
- Claim validation, certification, or compliance outcomes.
- Act as a Reference Implementation (it is a Reference Execution Substrate).
