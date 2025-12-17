---
title: Mplp V1.0 Compliance Guide
description: "Guide defining MPLP v1.0 compliance levels: Data Compliance,
  Module Compliance, and Runtime Compliance. Explains criteria for runtimes,
  agents, and tools."
keywords:
  - Compliance Guide
  - MPLP compliance levels
  - data compliance
  - module compliance
  - runtime compliance
  - agent compatibility
  - standard criteria
sidebar_label: Compliance Guide
doc_status: informative
doc_role: guide
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# MPLP v1.0 Compliance Guide

## 1. Purpose

This guide defines what it means to be "MPLP Compliant". It establishes the criteria for runtimes, agents, and tools to claim compatibility with the MPLP v1.0 standard.

## 2. Compliance Levels

MPLP defines three levels of compliance:

### Level 1: Data Compliance
*   **Requirement**: The system can read/write valid MPLP JSON objects (Context, Plan, Trace).
*   **Validation**: Passes all L1 Schema validations (`schemas/v2/*.json`).
*   **Target**: Reporting tools, Dashboards, simple scripts.

### Level 2: Module Compliance
*   **Requirement**: The system implements the logic of the 10 L2 Modules.
*   **Validation**: Passes the "Golden Flow" test suite for module interactions.
*   **Target**: Lightweight agent frameworks, specialized solvers.

### Level 3: Runtime Compliance (Full)
*   **Requirement**: The system implements the full L3 Runtime specification (PSG, Event Bus, Drift Detection).
*   **Validation**: Passes the full Golden Test Suite including edge cases, error handling, and concurrency.
*   **Target**: Production-grade Agent Platforms.

## 3. Self-Certification

MPLP v1.0 relies on **Self-Certification**. Vendors must publish a completed "Compliance Checklist" (see `mplp-v1.0-compliance-checklist.md`) to claim support.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
