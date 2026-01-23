---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-CCK-INDEX-001"
repo_refs:
  schemas:
    - "schemas/v2/common/metadata.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Cross-Cutting Kernel Duties
sidebar_label: Kernel Duties
sidebar_position: 0
description: "MPLP architecture documentation: Cross-Cutting Kernel Duties. Defines structural requirements and layer responsibilities."
---

# Cross-Cutting Kernel Duties

## Scope

This specification defines the **11 cross-cutting kernel duties** that MUST be addressed by all MPLP-conformant runtimes. These duties span across all lifecycle phases and modules.

The 11 duties are:
1. Coordination
2. Error Handling
3. Event Bus
4. Learning Feedback
5. Observability
6. Orchestration
7. Performance
8. Protocol Versioning
9. Security
10. State Sync
11. Transaction

## Non-Goals

This specification does not mandate specific implementation details beyond the defined interfaces and invariants.

---

