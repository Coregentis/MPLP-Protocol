"""
Golden Runner - Orchestrate golden flow validation.

Executes all golden flows and collects results for reporting.
"""

from typing import List
from .loader import load_all_golden_flows
from .golden_validator import validate_golden_flow, GoldenCheckResult


def run_all_golden_flows() -> List[GoldenCheckResult]:
    """
    Load and validate all golden flows.
    
    Returns:
        List of GoldenCheckResult for each flow
    """
    flows = load_all_golden_flows()
    results = []
    
    for flow in flows:
        print(f"\n🔍 Validating {flow.flow_id}: {flow.name}...")
        result = validate_golden_flow(flow)
        
        if result.passed:
            print(f"✅ PASS")
        else:
            print(f"❌ FAIL")
            for error in result.all_errors:
                print(f"   - {error}")
        
        results.append(result)
    
    passed_count = sum(1 for r in results if r.passed)
    print(f"\n📊 Summary: {passed_count}/{len(results)} Passed")
    
    return results
