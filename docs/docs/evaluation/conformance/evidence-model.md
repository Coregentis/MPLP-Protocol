---
sidebar_position: 2
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-CONF-EVIDENCE-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Evidence Model
sidebar_label: Evidence Model
description: "MPLP conformance evaluation: Evidence Model. Non-normative guidance for protocol conformance assessment."
authority: none
---

# Evidence Model

## 1. Purpose

This document defines **what constitutes valid evidence** for MPLP conformance evaluation.

The core question this answers:

> "What artifacts do I need to export for my system to be evaluable?"

## 2. Evidence Definition

**Evidence** is any artifact that:
1. Uses MPLP JSON Schema
2. Contains protocol version metadata
3. Is self-describing (no external context required)
4. Is immutable after export

### 2.1 Evidence vs. Implementation Details

| Evidence (Evaluable) | NOT Evidence (Implementation) |
|:---|:---|
| Exported JSON objects | Runtime memory state |
| Schema-valid artifacts | Internal data structures |
| Trace segments | Debug logs |
| Confirm decisions | UI interactions |

## 3. Evidence Types

### 3.1 Core Evidence (Required for Conformance)

| Type | Schema | Purpose |
|:---|:---|:---|
| **Context** | `mplp-context.schema.json` | Initial state and constraints |
| **Plan** | `mplp-plan.schema.json` | Intent and step structure |
| **Trace** | `mplp-trace.schema.json` | Execution history |
| **Confirm** | `mplp-confirm.schema.json` | Governance gate records |

### 3.2 Supporting Evidence (Recommended)

| Type | Schema | Purpose |
|:---|:---|:---|
| **Events** | `mplp-*-event.schema.json` | Runtime observability |
| **Snapshots** | Implementation-specific | State checkpoints |
| **Manifest** | Export metadata | Version and timestamp |

## 4. Evidence Pack Structure

An Evidence Pack is a collection of evidence for one or more lifecycle executions:

```
evidence-pack/
├── manifest.json           # Export metadata
├── contexts/
│   └── ctx-123.json
├── plans/
│   └── plan-456.json
├── traces/
│   └── trace-789.json
├── confirms/
│   └── confirm-abc.json
└── events/                 # Optional
    └── events.ndjson
```

### 4.1 Manifest Structure

```json
{
  "manifest_version": "1.0.0",
  "protocol_version": "1.0.0",
  "exported_at": "2025-12-28T00:00:00Z",
  "exporter": "mplp-sdk-ts@1.0.5",
  "contents": {
    "contexts": 1,
    "plans": 1,
    "traces": 1,
    "confirms": 2,
    "events": 150
  }
}
```

## 5. Evidence Validity Requirements

### 5.1 Schema Validity

All evidence MUST pass JSON Schema validation:

```bash
# Validate using MPLP validator
mplp validate --schema mplp-plan ./plans/plan-456.json
```

### 5.2 Referential Integrity

Evidence MUST maintain referential integrity:

| Object | MUST Reference |
|:---|:---|
| Plan | Valid `context_id` |
| Trace | Valid `context_id` and `plan_id` |
| Confirm | Valid `target_id` (Plan or Step) |
| Step | Valid `plan_id` |

### 5.3 Temporal Consistency

Timestamps MUST be logically consistent:

- Trace `finished_at` ≥ `started_at`
- Child segments within parent time bounds
- Events ordered by timestamp

### 5.4 ID Uniqueness

All IDs MUST be:
- UUID v4 format
- Unique within their type
- Immutable after creation

## 6. Evidence Chain

Evidence forms a **chain of linked objects**:

```
Context
   │
   └──► Plan
          │
          ├──► Step 1 ──► Confirm (optional)
          │
          ├──► Step 2
          │
          └──► Step 3
   │
   └──► Trace
          │
          ├──► Segment 1
          │
          ├──► Segment 2
          │
          └──► Segment 3
```

**Chain Completeness Rule**: For L2 conformance, the chain from Context to Trace MUST be complete.

## 7. What is NOT Evidence

The following are **not valid evidence** for conformance:

| Artifact | Why Not |
|:---|:---|
| Debug logs | Unstructured, implementation-specific |
| Console output | Not schema-validated |
| Screenshots | Not machine-readable |
| Source code | Implementation, not behavior |
| Configuration files | Implementation parameters |

These may be useful for debugging but cannot be used for conformance evaluation.

## 8. Evidence Export Requirements

A conformant runtime SHOULD provide:

1. **Export API**: Programmatic access to evidence
2. **Bulk Export**: Ability to export complete Evidence Packs
3. **Manifest Generation**: Automatic manifest creation
4. **Validation**: Pre-export validation option

### 8.1 Minimal Export Example

```typescript
import { exportEvidencePack } from '@mplp/sdk-ts';

const pack = await exportEvidencePack({
  contextId: 'ctx-123',
  includeEvents: true,
  outputPath: './evidence-pack'
});

console.log('Exported:', pack.manifest.contents);
```

## 9. Related Documentation

- [Conformance Model](./conformance-model.md) — How MPLP defines conformance
- [Evidence Authority](/docs/evaluation/governance) — Governance definition
- [Schema Reference](/docs/introduction/api-quick-reference) — Schema definitions

---

**Scope**: Defines evidence types, validity requirements, pack structure  
**Exclusions**: Implementation details, debug artifacts
