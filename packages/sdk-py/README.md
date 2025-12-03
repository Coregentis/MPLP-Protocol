---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

# MPLP Python SDK

MPLP Protocol v1.0 Python SDK – schema v2 faithful models and builders.
Powered by Pydantic v2.

## Installation

```bash
pip install -e .
```

## Usage Example

```python
from mplp_sdk.builders import build_context, build_plan, build_confirm, build_trace
from mplp_sdk.validation import validate_trace

# 1. Build Context
ctx = build_context(
    title="Demo Context",
    root={"domain": "demo", "environment": "development"},
)

# 2. Build Plan
plan = build_plan(
    ctx,
    steps=[{"step_id": "step-1", "description": "Do something important"}],
)

# 3. Build Confirm
confirm = build_confirm(plan, status="approved")

# 4. Build Trace
trace = build_trace(ctx, plan, confirm)

# 5. Validate
ok, errors = validate_trace(trace)
assert ok, f"Trace should be valid, got errors: {errors}"
print("Flow executed successfully!")
```
