import pytest
import json
from pathlib import Path
from mplp_sdk.validation import validate_plan

# Paths
CURRENT_DIR = Path(__file__).parent
ROOT_DIR = CURRENT_DIR.parent.parent.parent.parent
RUNTIME_OUT_TS_DIR = ROOT_DIR / "tests" / "cross-language" / "runtime" / "out" / "ts"

class TestRuntimeErrorFromTs:
    """H6.4: Validate Runtime Error JSON with Python SDK"""

    def test_validate_error_plan(self):
        error_plan_path = RUNTIME_OUT_TS_DIR / "error-plan.json"
        
        if not error_plan_path.exists():
            pytest.fail(f"Missing error-plan.json at {error_plan_path}")
            
        with open(error_plan_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        result = validate_plan(data)
        
        # 1. Assert validation failed
        assert result.ok is False, "Expected validation to fail for invalid plan"
        
        # 2. Assert specific error (missing plan_id)
        # TS side: code='required', path='plan_id'
        
        missing_id_error = next(
            (e for e in result.errors if e.code == 'required' and 'plan_id' in e.path), 
            None
        )
        
        assert missing_id_error is not None, f"Expected 'required' error for 'plan_id', got: {result.errors}"
        
        # Note: Pydantic might report path as just 'plan_id' or empty string if it's a top-level field missing from input dict?
        # But since we pass a dict to validate_plan, Pydantic validates it against Plan model.
        # If plan_id is missing, it should be a required field error.
        # Let's verify the path.
        assert missing_id_error.path == 'plan_id' or missing_id_error.path == '', \
            f"Path mismatch. Expected 'plan_id', got '{missing_id_error.path}'"
