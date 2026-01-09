# Python Basic Flow Example

This example demonstrates basic **MPLP (Multi-Agent Lifecycle Protocol)** usage with the Python SDK.

It shows how to use the Builder API to construct valid protocol objects programmatically.

## Setup

```bash
cd V1.0-release/packages/sdk-py
python -m venv .venv
# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -e .[dev]
```

## Running the Example

```python
from mplp_sdk.builders import build_context, build_plan, build_confirm, build_trace
from mplp_sdk.validation import validate_trace

# Step 1: Create Context
ctx = build_context(
    title="My Project",
    root={"domain": "my-domain", "environment": "development"}
)
print(f"Created Context: {ctx.context_id}")

# Step 2: Create Plan
plan = build_plan(
    ctx,
    title="Implementation Plan",
    objective="Build the feature",
    steps=[
        {"description": "Design the architecture"},
        {"description": "Implement core logic"},
        {"description": "Write tests"}
    ]
)
print(f"Created Plan: {plan.plan_id} with {len(plan.steps)} steps")

# Step 3: Get Confirmation
confirm = build_confirm(plan, status="approved", reviewer="lead-dev")
print(f"Confirmation status: {confirm.status}")

# Step 4: Create Trace
trace = build_trace(ctx, plan, confirm)
print(f"Created Trace: {trace.trace_id}")

# Step 5: Validate
ok, errors = validate_trace(trace)
if ok:
    print("✓ All validations passed!")
else:
    print(f"✗ Validation errors: {errors}")
```

## Testing

```bash
cd V1.0-release
# Set PYTHONPATH to include the SDK source
# Windows (PowerShell):
$env:PYTHONPATH="packages/sdk-py/src"
# Linux/Mac:
export PYTHONPATH="packages/sdk-py/src"

pytest packages/sdk-py/tests
```

## Next Steps


---
**License**: [Apache 2.0](../../LICENSE.txt)