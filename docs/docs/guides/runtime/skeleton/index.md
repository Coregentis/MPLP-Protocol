---
sidebar_position: 8

title: Runtime Reference Skeleton
description: Interface-Level Contract for Profile-14-Golden Runtime
status: draft
doc_type: normative
normativity: normative

authority: Documentation Governance
---


# Runtime Reference Skeleton (Profile-14-Golden)

This directory contains the **Interface-Level Contract** for the MPLP Runtime under **Profile-14-Golden**.

## Purpose

To provide a rigorous, type-safe definition of the Runtime's **Evidence Emission** responsibilities without mandating internal implementation details or execution logic.

## Scope

*   **Profile**: 14-Golden (FLOW-01 ~ FLOW-05)
*   **Nature**: Non-Executable (No model calls, no side effects)
*   **Focus**: Evidence Schema Binding & Event Sinks

## Contents

*   [`runtime.ts`](./runtime.ts): The main Runtime class skeleton.
*   [`events.ts`](./events.ts): Schema-bound event type definitions.
*   [`sinks.ts`](./sinks.ts): Abstractions for evidence persistence.
*   [`evidence-pack.ts`](./evidence-pack.ts): Artifact naming contracts.

## Non-Goals

*   This skeleton does NOT implement a Pipeline Controller.
*   This skeleton does NOT perform PSG mutations.
*   This skeleton does NOT interact with Git or CI systems.
*   This skeleton does NOT execute Rollback or Drift logic.
