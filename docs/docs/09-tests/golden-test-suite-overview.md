---
title: Golden Test Suite Overview
description: Overview of the MPLP Golden Test Suite. Validates the 5 Normative Golden Flows (Flow-01 to Flow-05) as defined in the SOT.
sidebar_label: Test Suite Overview
sidebar_position: 1
---

# Golden Test Suite Overview

> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **SOT Reference**: README v1.0.0 Section 9

## 1. Philosophy

The Golden Test Suite validates that a runtime implementation adheres to the **MPLP v1.0 Protocol**. It is not a unit test suite for the SDKs, but a **conformance suite** for the Protocol itself.

## 2. Compliance Boundary (v1.0)

To claim "MPLP v1.0 Compliance", a runtime MUST pass **Flow-01 through Flow-05**.

| Flow ID | Name | Core Focus |
| :--- | :--- | :--- |
| **Flow-01** | **Intent to Plan Transition** | L1 Core (Context/Plan) |
| **Flow-02** | **Governed Execution** | L1 Core (Trace/Constraints) |
| **Flow-03** | **Multi-Agent Coordination Loop** | L2 Coordination (Collab/Role) |
| **Flow-04** | **Drift Detection & Recovery** | L3 Runtime (Drift/Recovery) |
| **Flow-05** | **Runtime Integration & External I/O** | L4 Integration (Extension/Network) |

## 3. Running Tests

### 3.1 TypeScript
```bash
pnpm test:golden
```

### 3.2 Python
```bash
pytest packages/sdk-py/tests/golden
```

## 4. Fixture Format

See [Golden Fixture Format](./golden-fixture-format.md).
