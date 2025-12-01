---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Learning Collection Points (MPLP v1.0)

> This document defines the standard **Collection Points** where the Runtime SHOULD generate Learning Samples.

---

## 1. Overview

The Learning Loop operates by capturing **Learning Samples** at specific moments in the execution lifecycle. These moments are called **Collection Points**.

In v1.0, we focus on 3 key families: `Core`, `Intent`, and `Delta`.

---

## 2. Collection Point Matrix

| Lifecycle Phase | Trigger Event | Sample Family | Purpose |
|-----------------|---------------|---------------|---------|
| **Planning** | Plan generated from User Request | `Intent` | Capture how User Intent maps to Plan Structure. |
| **Planning** | User modifies/rejects Plan | `Delta` | Capture the correction (Delta) to improve future planning. |
| **Execution** | Step completes successfully | `Core` | Capture Input/Output pair for the tool/agent. |
| **Execution** | Step fails and is fixed | `Core` | Capture Failure/Fix pair. |
| **Review** | User provides explicit feedback | `Core` | Capture explicit RLHF signal. |

---

## 3. Detailed Specifications

### 3.1 Intent Resolution Point
- **Trigger**: `SAPlanEvaluated` or `IntentEvent`
- **Data Source**: User Prompt + Generated Plan
- **Output**: `LearningSampleIntent`
- **Schema**: `mplp-learning-sample-intent.schema.json`

### 3.2 Plan Revision Point
- **Trigger**: `DeltaIntentEvent`
- **Data Source**: Original Plan + User Feedback + Revised Plan
- **Output**: `LearningSampleDelta`
- **Schema**: `mplp-learning-sample-delta.schema.json`

### 3.3 Execution Completion Point
- **Trigger**: `SAStepCompleted` or `RuntimeExecutionEvent` (status=completed)
- **Data Source**: Step Input + Step Output
- **Output**: `LearningSampleCore`
- **Schema**: `mplp-learning-sample-core.schema.json`

---

## 4. Storage

Learning Samples are typically stored in a dedicated **Learning Store** (separate from the Trace), but may be referenced in the Trace via `LearningSampleGenerated` events (optional).
