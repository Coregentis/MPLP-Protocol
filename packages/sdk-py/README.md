# MPLP Python SDK

> **MPLP Python SDK – Reference runtime & models for the Multi-Agent Lifecycle Protocol (v1.0.0).**

This SDK provides a robust, schema-compliant implementation of the MPLP Protocol v1.0.0, enabling developers to build, execute, and observe complex multi-agent systems with strict adherence to the protocol's core standards.

## Features

- **Protocol Compliance**: Fully generated Pydantic v2 models derived directly from the official MPLP JSON Schemas (v1.0.0 Frozen).
- **Runtime Engine**: A flexible `ExecutionEngine` supporting both Single Agent (SA) and Multi-Agent (MAP) execution modes.
- **Observability**: Built-in distributed tracing and event emission (Plan, Trace, Collab events) with pluggable sinks.
- **Golden Flows**: Verified implementation of 5 core protocol flows (Single Agent, Multi-Agent, Risk Confirm, Error Recovery, Network Transport).
- **Type Safety**: Comprehensive type hinting and validation for all protocol objects.

## Installation

```bash
pip install mplp-sdk
```

## Quick Start

### Single Agent Execution

```python
import asyncio
from mplp.model.context import ContextFrame
from mplp.model.plan import PlanDocument
from mplp.runtime.engine import ExecutionEngine
from mplp.runtime.profiles import ExecutionProfile, ExecutionProfileKind
from mplp.observability.sinks import StdoutEventSink

# 1. Define Context and Plan (or load from JSON)
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
# (Implement LLMClient and ToolExecutor protocols)
engine = ExecutionEngine(llm=my_llm, tools=my_tools, sink=StdoutEventSink())

# 4. Run
async def main():
    result = await engine.run(profile)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

## Golden Flows

The SDK implements 5 "Golden Flows" that serve as canonical examples and verification tests for the protocol:

1.  **Flow-01 (Single Agent)**: Sequential execution of LLM and Tool steps.
2.  **Flow-02 (Multi-Agent)**: Role-based collaboration and step assignment.
3.  **Flow-03 (Risk Confirm)**: Handling of high-risk steps requiring explicit confirmation.
4.  **Flow-04 (Error Recovery)**: Graceful handling and reporting of execution errors.
5.  **Flow-05 (Network Transport)**: Serialization of execution state via `NetworkEnvelope`.

## Development

### Pre-Publish Gate

Before publishing a new version to PyPI, run the pre-publish script to ensure all schemas are synced, models generated, headers applied, and tests passed:

```bash
python packages/sdk-py/scripts/pre_publish.py
```

### Setup

```bash
# Install dependencies
pip install -e .[dev]
```

### Running Tests

```bash
# Run all tests
pytest tests/

# Run specific Golden Flow
# Run specific Golden Flow
pytest tests/test_flows_01_single_agent.py
```

## Quick Start

```python
from mplp.model import Context, Plan
from mplp.runtime import ExecutionEngine

# Initialize context and plan
ctx = Context(id="ctx-example", user={"id": "user-01"})
plan = Plan(id="plan-example", steps=[
    {"id": "step-01", "tool": "search", "args": {"query": "hello"}}
])

# Execute
engine = ExecutionEngine()
result = engine.run_single_agent(context=ctx, plan=plan)
print(f"Status: {result.status}")
```

See `examples/quickstart/` for runnable code.

## Examples

| Flow | Description | File |
|------|-------------|------|
| 01 | Single Agent | `examples/quickstart/quickstart_single_agent.py` |
| 02 | Multi-Agent | `examples/flow_02_multi_agent.py` |
| 03 | Risk Confirmation | `examples/flow_03_risk_confirm.py` |
| 04 | Error Recovery | `examples/flow_04_error_recovery.py` |
| 05 | Network Transport | `examples/flow_05_network_transport.py` |

## Further Documentation

- [Runtime Overview](docs/RUNTIME.md)
- [Event & Observability Model](docs/OBSERVABILITY.md)
- [Golden Flows (FLOW-01 ~ FLOW-05)](docs/FLOW-TESTS.md)
- [TS ↔ Python Parity Map](docs/PARITY-MAP.md)
- [Protocol Compatibility Notes](docs/PROTOCOL-COMPATIBILITY.md)
- [Schema & Protocol Versions](docs/SCHEMA-VERSION.md)
- [Python API Overview](docs/API.md)

## License

Apache-2.0
---

© 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
