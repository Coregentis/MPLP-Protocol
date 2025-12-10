---
title: Python SDK Guide
description: "Official guide for the MPLP Python SDK (mplp). Covers installation, features, quick start for single-agent execution, and golden flow verification."
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Python SDK Guide, MPLP Python SDK, mplp package, Pydantic models, execution engine, observability, golden flows, Python quick start]
sidebar_label: Python SDK Guide
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Python SDK Guide

## 1. Purpose

The **MPLP Python SDK** (`mplp`) is the **Official** implementation for Python. It provides a robust, schema-compliant implementation with full runtime support.

## 2. Installation

```bash
pip install mplp
```

## 3. Features

- **Protocol Compliance**: Fully generated Pydantic v2 models from official JSON Schemas.
- **Runtime Engine**: Flexible `ExecutionEngine` supporting SA and MAP execution modes.
- **Observability**: Built-in distributed tracing and event emission with pluggable sinks.
- **Golden Flows**: 5 verified protocol flows (Single Agent, Multi-Agent, Risk Confirm, Error Recovery, Network Transport).

## 4. Quick Start

### 4.1 Single Agent Execution

```python
import asyncio
from mplp.model.context import ContextFrame
from mplp.model.plan import PlanDocument
from mplp.runtime.engine import ExecutionEngine
from mplp.runtime.profiles import ExecutionProfile, ExecutionProfileKind
from mplp.observability.sinks import StdoutEventSink

# 1. Define Context and Plan
context = ContextFrame(...)
plan = PlanDocument(...)

# 2. Create Execution Profile
profile = ExecutionProfile(
    profileId="demo-profile",
    kind=ExecutionProfileKind.SA,
    context=context,
    plan=plan
)

# 3. Initialize Engine with LLM and Tools
engine = ExecutionEngine(llm=my_llm, tools=my_tools, sink=StdoutEventSink())

# 4. Run
async def main():
    result = await engine.run(profile)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

## 5. Golden Flows

| Flow | Description | Test File |
|:---|:---|:---|
| 01 | Single Agent | `tests/test_flows_01_single_agent.py` |
| 02 | Multi-Agent | `tests/test_flows_02_multi_agent.py` |
| 03 | Risk Confirmation | `tests/test_flows_03_risk_confirm.py` |
| 04 | Error Recovery | `tests/test_flows_04_error_recovery.py` |
| 05 | Network Transport | `tests/test_flows_05_network_transport.py` |

## 6. Further Documentation

- `packages/sdk-py/docs/RUNTIME.md`
- `packages/sdk-py/docs/OBSERVABILITY.md`
- `packages/sdk-py/docs/FLOW-TESTS.md`

## 7. Requirements

- Python >= 3.10
- pydantic >= 2.0, < 3.0

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
