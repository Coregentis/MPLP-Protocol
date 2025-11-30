"""
Golden Flow-01 Test - Protocol-level validation of FLOW-01 (Single Agent Plan).

This test validates that FLOW-01 passes all golden test criteria:
- Schema validation
- Structural comparison
- Invariant checks (including wildcard paths like steps[*].description)
"""

import pytest
from .harness.runner import run_all_golden_flows


def test_golden_flow_01_passes():
    """
    FLOW-01 (Single Agent Plan) must pass all validations.
    
    This is the acceptance criteria for P7.3.E Python Golden Harness.
    """
    results = run_all_golden_flows()
    
    # Find FLOW-01
    flow_01 = next((r for r in results if r.flow_id == "FLOW-01"), None)
    assert flow_01 is not None, "FLOW-01 not found in golden flows"
    
    # FLOW-01 must pass
    if not flow_01.passed:
        error_msg = f"FLOW-01 failed with {len(flow_01.all_errors)} errors:\n"
        error_msg += "\n".join(f"  - {e}" for e in flow_01.all_errors)
        pytest.fail(error_msg)
    
    assert flow_01.passed, "FLOW-01 must pass all validations"


def test_all_golden_flows_pass():
    """
    All golden flows should pass (stricter requirement).
    
    Currently we only have FLOW-01, but this will validate all 25 flows
    as they are implemented.
    """
    results = run_all_golden_flows()
    
    failed_flows = [r for r in results if not r.passed]
    
    if failed_flows:
        error_msg = f"{len(failed_flows)} flow(s) failed:\n"
        for flow in failed_flows:
            error_msg += f"\n{flow.flow_id}:\n"
            error_msg += "\n".join(f"  - {e}" for e in flow.all_errors)
        pytest.fail(error_msg)
    
    assert len(failed_flows) == 0, "All golden flows must pass"
