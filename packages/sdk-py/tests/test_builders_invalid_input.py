import pytest
from mplp_sdk.builders import build_plan, build_confirm, build_context
from mplp_sdk.validation import validate_plan, validate_confirm, validate_context

def test_plan_missing_required():
    # Manually creating invalid dict
    invalid_plan = {
        "meta": {}, # Invalid meta
        "plan_id": "123", # Invalid UUID
        # Missing context_id, title, etc.
    }
    ok, errs = validate_plan(invalid_plan)
    assert not ok
    assert len(errs) > 0

def test_confirm_invalid_enum():
    # Build a valid confirm first
    ctx = build_context("T", {"domain": "d"})
    plan = build_plan(ctx, [], title="P", objective="O")
    confirm = build_confirm(plan)
    
    # Tamper with status
    # Since confirm is a model, we can't easily set invalid enum if validated on assignment.
    # But we can try to validate a dict with invalid status.
    data = confirm.model_dump()
    data["status"] = "super_approved" # Invalid
    
    ok, errs = validate_confirm(data)
    assert not ok
    assert any("status" in e for e in errs)

def test_invalid_uuid():
    ctx = build_context("T", {"domain": "d"})
    data = ctx.model_dump()
    data["context_id"] = "not-a-uuid"
    
    ok, errs = validate_context(data)
    assert not ok
    # Error message should mention pattern or uuid
    assert any("context_id" in e for e in errs)
