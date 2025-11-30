import pytest
import json
import os
from pathlib import Path
from mplp_sdk.validation import (
    validate_context,
    validate_plan,
    validate_confirm,
    validate_trace
)

# Paths
CURRENT_DIR = Path(__file__).parent
ROOT_DIR = CURRENT_DIR.parent.parent.parent.parent
FIXTURES_DIR = ROOT_DIR / "tests" / "cross-language" / "validation" / "fixtures"
OUT_DIR = ROOT_DIR / "tests" / "cross-language" / "validation" / "out" / "py"

# Ensure output directory exists
os.makedirs(OUT_DIR, exist_ok=True)

def get_fixtures():
    return [
        "context_missing_required.json",
        "plan_step_missing_id.json",
        "confirm_invalid_enum.json",
        "context_invalid_uuid.json",
        "context_invalid_datetime.json",
        "context_extra_forbidden.json"
    ]

@pytest.mark.parametrize("fixture_name", get_fixtures())
def test_cross_language_validation(fixture_name):
    fixture_path = FIXTURES_DIR / fixture_name
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Determine validator
    if fixture_name.startswith("context"):
        result = validate_context(data)
    elif fixture_name.startswith("plan"):
        result = validate_plan(data)
    elif fixture_name.startswith("confirm"):
        result = validate_confirm(data)
    elif fixture_name.startswith("trace"):
        result = validate_trace(data)
    else:
        pytest.fail(f"Unknown fixture type: {fixture_name}")
    
    # Convert result to dict for JSON serialization
    result_dict = {
        "ok": result.ok,
        "errors": [
            {
                "path": e.path,
                "code": e.code,
                "message": e.message
            }
            for e in result.errors
        ]
    }
    
    # Write output
    out_path = OUT_DIR / fixture_name
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result_dict, f, indent=2)
    
    # Basic assertions
    assert result.ok is False
    assert len(result.errors) > 0
