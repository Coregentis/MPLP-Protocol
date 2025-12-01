---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP Python SDK Guide


## Overview

The MPLP Python SDK provides:
- **Schema-faithful Pydantic v2 models** - Auto-generated from JSON Schemas with exact field mapping
- **Builder functions** - Easy-to-use helpers for creating protocol objects
- **Validation utilities** - Runtime validation for Context, Plan, Confirm, and Trace

## Vendor Neutrality

The SDK is designed to be **Vendor Neutral**. It provides:
- **Protocol Types**: Generated from `schemas/v2/`.
- **Validation Logic**: Based on `schemas/v2/invariants/`.

It does **NOT** include:
- Hardcoded dependencies on specific LLM providers (e.g., OpenAI, Anthropic).
- Proprietary cloud service bindings.

## Installation

```bash
cd V1.0-release/packages/sdk-py
pip install -e .[dev]
```

## Quick Start

```python
from mplp_sdk import (
    build_context,
    build_plan,
    build_confirm,
    build_trace,
    validate_trace,
)

# 1. Create Context
ctx = build_context(
    title="Demo Context",
    root={"domain": "demo", "environment": "development"},
)

# 2. Create Plan
plan = build_plan(
    ctx,
    title="Implementation Plan",
    objective="Complete the feature",
    steps=[{"description": "Implement core logic"}],
)

# 3. Create Confirm
confirm = build_confirm(plan, status="approved")

# 4. Create Trace
trace = build_trace(ctx, plan, confirm)

# 5. Validate
result = validate_trace(trace)
assert result.ok, f"Trace should be valid, got errors: {result.errors}"
```

## Model Generation

Models are auto-generated from JSON Schemas using:

```bash
cd V1.0-release
pnpm codegen:py-models
```

This generates strict Pydantic v2 models in `packages/sdk-py/src/mplp_sdk/models/` with:
- Exact field mappings from schema properties
- Type-safe enum literals
- Nested model classes for complex objects
- Proper `extra="allow"/"forbid"` configuration based on `additionalProperties`

## Architecture

The Python SDK focuses on **schema-faithful modeling and payload construction**. Flow execution is handled by:
- The TypeScript reference runtime (`@mplp/reference-runtime`)
- Future Python-native runtimes

## API Reference

### Builders

- `build_context(title, root, ...)` → `Context`
- `build_plan(context, steps, ...)` → `Plan`
- `build_confirm(plan, status, ...)` → `Confirm`
- `build_trace(context, plan, confirm, ...)` → `Trace`

### Validation

- `validate_context(data)` → `ValidationResult`
- `validate_plan(data)` → `ValidationResult`
- `validate_confirm(data)` → `ValidationResult`
- `validate_trace(data)` → `ValidationResult`

### Event System

The Python SDK models support the **"3 Physical / 12 Logical"** event strategy.

#### Physical Models
- `PipelineStageEvent`
- `GraphUpdateEvent`
- `RuntimeExecutionEvent`

#### Usage
```python
from mplp_sdk.models import PipelineStageEvent

event = PipelineStageEvent(
    stage="plan",
    status="running",
    # ...
)
```

Each validation function returns a `ValidationResult` object with:
- `ok`: bool
- `errors`: List[ValidationErrorItem] (path, code, message)

```python
result = validate_context(data)
if not result.ok:
    for err in result.errors:
        print(f"[{err.code}] {err.path}: {err.message}")
```

## Testing

```bash
cd V1.0-release
export PYTHONPATH="packages/sdk-py/src"  # or set $env:PYTHONPATH on Windows
pytest packages/sdk-py/tests
```

Tests include:
- Schema alignment verification
- Builder happy path scenarios
- Invalid input error handling
