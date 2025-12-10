---
title: Mplp V1.0 Compliance Checklist
description: Official checklist for self-certifying MPLP v1.0 compliance. Covers requirements for Core Protocol, Modules, Runtime, and Profiles to ensure interoperability.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Compliance Checklist, MPLP compliance, self-certification, v1.0 requirements, core protocol, module compliance, runtime compliance, interoperability]
sidebar_label: Compliance Checklist
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# MPLP v1.0 Compliance Checklist

## 1. Core Protocol (L1)
- [ ] **Schema Validation**: All inputs/outputs validated against `schemas/v2/*.json`.
- [ ] **UUIDs**: All entities use UUID v4.
- [ ] **Timestamps**: All timestamps are ISO 8601 UTC.
- [ ] **Invariants**: Passes all normative invariants (e.g., `sa-invariants.yaml`).

## 2. Modules (L2)
- [ ] **Context**: Supports `active`, `suspended`, `closed` states.
- [ ] **Plan**: Enforces dependency DAG; prevents cycles.
- [ ] **Confirm**: Blocks execution of `proposed` plans until approved.
- [ ] **Trace**: Emits immutable trace spans.
- [ ] **Role**: Enforces role-based permissions.
- [ ] **Dialog**: Maintains message history.
- [ ] **Collab**: Supports at least one mode (e.g., `broadcast`).
- [ ] **Extension**: Validates tool configurations.
- [ ] **Core**: Reports protocol version correctly.
- [ ] **Network**: Maps roles to nodes.

## 3. Runtime (L3)
- [ ] **PSG**: Maintains a single source of truth graph.
- [ ] **Events**: Emits `pipeline_stage` and `graph_update` events.
- [ ] **Drift**: Detects file system drift (at least passive detection).
- [ ] **Rollback**: Supports basic snapshot/restore or compensation.

## 4. Profiles
- [ ] **SA Profile**: Supports single-agent sequential execution.
- [ ] **MAP Profile** (Optional): Supports multi-agent collaboration.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
