---
sidebar_position: 1
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-TEST-OVERVIEW-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Golden Test Suite Overview
sidebar_label: Test Suite Overview
description: "MPLP test documentation: Golden Test Suite Overview. Test suite structure and fixtures."
authority: none
---

# Golden Test Suite Overview

## 1. Philosophy

The Golden Test Suite serves as a **reference evidence artifact** for the MPLP v1.0 Protocol. It provides a standardized set of input/output pairs that demonstrate the expected behavior of a conformant runtime.

It is **not** a certification tool or a compliance enforcement mechanism. It is a collection of data fixtures that implementers can use to verify their own alignment with the protocol.

## 2. Evidence Scope

The suite provides evidence for the following protocol areas:

| Flow ID | Name | Evidence Focus |
| :--- | :--- | :--- |
| **FLOW-01** | **Single Agent – Happy Path** | L1 Core (Context/Plan) Schema Alignment |
| **FLOW-02** | **Single Agent – Large Plan** | L1 Core (Trace/Constraints) Invariant Adherence |
| **FLOW-03** | **Single Agent – With Tools** | L2 Coordination (agent_role/Extension) |
| **FLOW-04** | **Single Agent with LLM Enrichment** | L3 Runtime (AEL) Plan Generation |
| **FLOW-05** | **Single Agent with Confirm Required** | L2 Coordination (Confirm/Trace) Approval Flow |

## 3. Artifact Structure

The suite consists of:
- **Fixtures**: JSON files defining inputs (Context, Plan) and expected outputs (Trace, Events).
- **Registry**: A catalog of defined test scenarios (see [Golden Flow Registry](./golden-flow-registry.md)).
- **Format Specification**: Definitions of the fixture directory structure (see [Golden Fixture Format](./golden-fixture-format.md)).

## 4. Intended Audience

This documentation is intended for:
- **Protocol Implementers**: To understand the expected data shapes for specific scenarios.
- **SDK Maintainers**: To verify SDK output against standardized fixtures.
- **CI Integrators**: To understand the structure of the test artifacts.