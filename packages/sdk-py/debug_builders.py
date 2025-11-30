import sys
sys.path.insert(0, 'src')

from mplp_sdk.builders import build_context, build_plan, build_confirm, build_trace
from mplp_sdk.validation import validate_context, validate_plan, validate_confirm, validate_trace

print("Test: Building Context...")
try:
    ctx = build_context(
        title="Test Context",
        root={"domain": "test", "environment": "ci"}
    )
    print(f"✓ Context built: {ctx.title}")
    ok, errs = validate_context(ctx)
    print(f"  Validation: {'✓ OK' if ok else '✗ FAILED'}")
    if not ok:
        for err in errs:
            print(f"    - {err}")
except Exception as e:
    print(f"✗ Failed: {e}")
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
    sys.exit(1)

print("\nTest: Buliding Plan...")
try:
    plan = build_plan(
        ctx,
        title="My Plan",
        objective="Test Objective",
        steps=[{"description": "Step 1"}]
    )
    print(f"✓ Plan built: {plan.title}")
    ok, errs = validate_plan(plan)
    print(f"  Validation: {'✓ OK' if ok else '✗ FAILED'}")
except Exception as e:
    print(f"✗ Failed: {e}")
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
    sys.exit(1)

print("\nTest: Building Confirm...")
try:
    confirm = build_confirm(plan, status="approved")
    print(f"✓ Confirm built: {confirm.status}")
    ok, errs = validate_confirm(confirm)
    print(f"  Validation: {'✓ OK' if ok else '✗ FAILED'}")
except Exception as e:
    print(f"✗ Failed: {e}")
    sys.exit(1)

print("\nTest: Building Trace...")
try:
    trace = build_trace(ctx, plan, confirm)
    print(f"✓ Trace built: {trace.status}")
    ok, errs = validate_trace(trace)
    print(f"  Validation: {'✓ OK' if ok else '✗ FAILED'}")
except Exception as e:
    print(f"✗ Failed: {e}")
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
    sys.exit(1)

print("\n✓ All builders work!")
