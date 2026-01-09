---
sidebar_position: 1

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Defines signals that indicate MPLP adoption stages."
title: Adoption Signals
keywords: [MPLP, Adoption, Signals, Lifecycle]
sidebar_label: Signals

---



# Adoption Signals


## 1. Purpose

This document defines **signals** that indicate MPLP adoption stages.

Signals are **observable indicators**, not metrics. They answer:

> "What evidence suggests this system is at a particular adoption stage?"

## 2. Signal Definition

A signal is an **observable artifact or behavior** that indicates adoption progress.

Signals are:
- **Self-verifiable** — No external authority required
- **Technical** — Based on artifacts, not claims
- **Non-prescriptive** — Presence indicates stage, absence does not indicate failure

## 3. Signals by Stage

### 3.1 Evaluation Stage Signals

| Signal | Description | Verification |
|:---|:---|:---|
| **SDK Installed** | MPLP SDK present in project | `package.json` or `requirements.txt` |
| **Schema Downloaded** | MPLP schemas in project | `schemas/v2/*.json` present |
| **Docs Accessed** | Documentation read | (External signal, not verified) |
| **Golden Flow Attempted** | Test fixtures run | Test logs or artifacts |

### 3.2 Pilot Stage Signals

| Signal | Description | Verification |
|:---|:---|:---|
| **Context Created** | First Context object generated | Valid `mplp-context.schema.json` artifact |
| **Plan Generated** | First Plan object generated | Valid `mplp-plan.schema.json` artifact |
| **Trace Recorded** | First Trace object generated | Valid `mplp-trace.schema.json` artifact |
| **Evidence Pack Exported** | Full evidence pack created | Manifest + linked artifacts |
| **Conformance Evaluated** | Binary conformance result | CONFORMANT or NON-CONFORMANT |

### 3.3 Production Stage Signals

| Signal | Description | Verification |
|:---|:---|:---|
| **Ongoing Evidence** | Evidence packs generated regularly | Multiple dated exports |
| **Confirm Gates Active** | High-risk actions gated | Confirm objects in evidence |
| **Audit Readiness** | Evidence chain complete | Can answer audit questions |
| **Version Binding** | Protocol version declared | `meta.protocolVersion` in all artifacts |

## 4. Signal Progression

Signals form a **natural progression**:

```
Evaluation:
  ├── SDK Installed
  ├── Schema Downloaded
  └── Golden Flow Attempted
        │
        ▼
Pilot:
  ├── Context Created
  ├── Plan Generated
  ├── Trace Recorded
  └── Evidence Pack Exported
        │
        ▼
Production:
  ├── Ongoing Evidence
  ├── Confirm Gates Active
  └── Audit Readiness
```

## 5. What Signals Are NOT

Signals are **NOT**:

| NOT | Reason |
|:---|:---|
| **Requirements** | Absence doesn't mean failure |
| **Checkboxes** | Not a compliance checklist |
| **Metrics** | Not measured or scored |
| **Certifications** | No external validation |

Signals are **indicators**, not gates.

## 6. Self-Verification

Organizations can self-verify adoption stage by checking signals:

```typescript
function getAdoptionStage(signals: Signal[]): Stage {
  if (signals.includes('ongoing_evidence') && 
      signals.includes('audit_readiness')) {
    return 'production';
  }
  if (signals.includes('evidence_pack_exported')) {
    return 'pilot';
  }
  if (signals.includes('sdk_installed')) {
    return 'evaluation';
  }
  return 'none';
}
```

This is **self-declared** — no external authority validates or certifies the result.

## 7. Related Documentation

- [Adoption Index](./index.mdx) — Adoption lifecycle definition
- [Evidence Model](/docs/evaluation/conformance) — Evidence validity
- [Conformance Model](/docs/evaluation/conformance) — Conformance classes

---

**Purpose**: Observable indicators of adoption stage  
**Key Principle**: Signals are indicators, not requirements
