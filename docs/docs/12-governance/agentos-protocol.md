# Agent OS Protocol Overview

> [!IMPORTANT]
> **Normative Status**: **FROZEN v1.0.0**
> 
> This document defines the high-level positioning of MPLP as an "Agent OS" protocol layer.

## 1. The Agent OS Concept

MPLP is not a standalone operating system, but a **Protocol for Agent Operating Systems**. It defines the semantic interface between the "Kernel" (the runtime) and the "Applications" (the agents).

### 1.1 The Protocol Stack

| Layer | Name | Responsibility |
|:---|:---|:---|
| **L4** | Integration | External tool and API bindings |
| **L3** | Execution | State transitions and orchestration |
| **L2** | Governance | Normative modules (Plan, Trace, Confirm, etc.) |
| **L1** | Core | Primitive types and event schemas |

## 2. OS-Level Obligations

A compliant Agent OS must fulfill the **11 Kernel Duties**, ensuring that agents behave predictably across different hardware and model backends.

## 3. Reference Implementation

The [Reference Implementation](https://github.com/Coregentis/MPLP-Protocol/tree/main/packages/sources/sdk-ts) provides a baseline for building Agent OS components that adhere to this protocol.

---

© 2025 Bangshi Beijing Network Technology Limited Company
