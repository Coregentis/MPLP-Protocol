---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-CORE-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-core.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Core Module
sidebar_label: Core Module
sidebar_position: 1
description: "MPLP module specification: Core Module. Defines schema requirements and invariants."
---

# Core Module

## Scope

This specification defines the normative schema requirements for the **Core module** (protocol-level manifest) as represented by `schemas/v2/mplp-core.schema.json`.

## Non-Goals

This specification does not define implementation details, runtime behavior beyond schema-defined obligations, or vendor/framework-specific integrations.

---

## 1. Purpose

The Core Module represents the **protocol-level manifest** of an MPLP instance, declaring protocol version, enabled modules, and profile bindings. It is not a functional module but a **normative manifest anchor**.

> [!NOTE]
> **Manifest-Only Design**
> 
> Core Module intentionally contains minimal content. All schema definitions and invariants are specified in [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol). This page serves as a structural anchor in the Modules directory.

## 2. Related Documents

**Architecture**:
- [Architecture Overview](/docs/specification/architecture)
- [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol)

**Schemas**:
- `schemas/v2/mplp-core.schema.json`

---

**Required Fields**: meta, core_id, protocol_version, status, modules  
**Available Modules** (10): context, plan, confirm, trace, role, extension, dialog, collab, core, network  
**Status Enum**: draft → active → deprecated → archived