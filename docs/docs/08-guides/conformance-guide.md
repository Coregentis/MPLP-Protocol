---
title: Conformance Guide
description: Guide for achieving MPLP v1.0 conformance. Defines data, module, and runtime conformance levels and self-verification procedures.
keywords: [MPLP, conformance, compliance, validation, certification, self-verification, levels, L1, L2, L3]
sidebar_label: Conformance Guide
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

> [!NOTE]
> **Informative, not normative**
>
> This guide is provided for information purposes only. It does not define the protocol itself.

# Conformance Guide

## 1. Purpose

This guide defines what it means to be "MPLP Conformant". It establishes the criteria for runtimes, agents, and tools to claim compatibility with the MPLP v1.0 standard.

## 2. Conformance Levels

MPLP defines three levels of conformance:

### Level 1: Data Conformance
*   **Requirement**: The system can read/write valid MPLP JSON objects (Context, Plan, Trace).
*   **Validation**: Passes all L1 Schema validations (`schemas/v2/*.json`).
*   **Target**: Reporting tools, Dashboards, simple scripts.

### Level 2: Module Conformance
*   **Requirement**: The system executes the logic defined by the 10 L2 Modules.
*   **Validation**: Passes the "Golden Flow" test suite for module interactions.
*   **Target**: Lightweight agent frameworks, specialized solvers.

### Level 3: Runtime Conformance (Full)
*   **Requirement**: The system executes the full L3 Runtime specification (PSG, Event Bus, Drift Detection).
*   **Validation**: Passes the full Golden Test Suite including edge cases, error handling, and concurrency.
*   **Target**: Production-grade Agent Platforms.

## 3. Self-Verification

MPLP v1.0 relies on **Self-Verification**. Vendors must publish a completed "Conformance Checklist" (see `conformance-checklist.md`) to claim support.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
