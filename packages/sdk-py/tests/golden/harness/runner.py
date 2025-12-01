# Copyright 2025 邦士（北京）网络科技有限公司.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
