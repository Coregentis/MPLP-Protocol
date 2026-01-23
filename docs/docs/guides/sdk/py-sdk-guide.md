---
sidebar_position: 2

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Python SDK guide for mplp package including installation, usage, and API reference."
title: Python SDK Guide

---



# Python SDK Guide


## 1. Purpose

The **MPLP Python SDK** (`mplp-sdk`) is the **Reference** implementation for Python. It provides a robust, schema-conformant implementation with full runtime support.

**PyPI Package**: [`mplp-sdk`](https://pypi.org/project/mplp-sdk/)

## 2. Installation

```bash
pip install mplp-sdk
```

## 3. Features

- **Protocol Conformance**: Fully generated Pydantic v2 models from canonical JSON Schemas.
- **Runtime Engine**: Flexible `ExecutionEngine` supporting SA and MAP execution modes.
- **Observability**: **Full Alignment** with 12 Event Families (Truth Source). Built-in Validator and NDJSON Exporter.
  - *Evidence*: See `project-governance/PDG_ALIGNMENT_EVIDENCE_REPORT_PY.md` (Internal).
- **Golden Flows**: 5 verified protocol flows (Single Agent, Multi-Agent, Risk Confirm, Error Recovery, Network Transport).

## 4. Quick Start

### 4.1 Single Agent Execution

```python
import asyncio
from mplp.model import Context, Plan
from mplp.validation import validate_context, validate_plan


context_data = {
    "title": "My Project",
    "domain": "code-assistance"
}
context = Context(**context_data)


is_valid = validate_context(context_data)


print(f"Context ID: {context.context_id}")
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

- `packages/pypi/mplp-sdk/README.md`
- `packages/sources/sdk-py/docs/RUNTIME.md`
- `packages/sources/sdk-py/docs/OBSERVABILITY.md`

## 7. Requirements

- Python >= 3.10
- pydantic >= 2.0, < 3.0