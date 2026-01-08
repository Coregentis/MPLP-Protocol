---
sidebar_position: 2

doc_type: informative
normativity: informative
title: Conformance Checklist
description: Self-verification checklist for assessing MPLP v1.0 conformance levels (L1-L3).
sidebar_label: Conformance Checklist
status: active
authority: Documentation Governance
canonical: /docs/guides/conformance-checklist

---



# Conformance Checklist


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