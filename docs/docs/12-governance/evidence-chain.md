# Evidence Chain Specification

> [!IMPORTANT]
> **Normative Status**: **FROZEN v1.0.0**
> 
> This document defines the requirements for maintaining an auditable evidence chain in MPLP-compliant systems.

## 1. Definition

The **Evidence Chain** is a cryptographically linked sequence of protocol objects that prove the "Who, What, When, and Why" of every agent action.

## 2. Chain Components

| Object | Evidence Provided |
|:---|:---|
| **Context** | The initial intent and constraints |
| **Plan** | The intended sequence of actions |
| **Confirm** | Explicit authorization for high-risk steps |
| **Trace** | The actual execution record and outcomes |

## 3. Linking Mechanism

Objects are linked via `Ref` fields and `trace_id` bindings. A complete evidence chain allows an auditor to reconstruct the entire lifecycle of an agent request from a single `trace_id`.

---

© 2025 Bangshi Beijing Network Technology Limited Company
