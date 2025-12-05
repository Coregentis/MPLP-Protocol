# MPLP v1.0.0 FROZEN
# Governance: MPGC

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

import json
import os
from pathlib import Path
import pytest

# Add src to path for imports
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "packages" / "sdk-py" / "src"))

from mplp_sdk.builders import build_context, build_plan, build_confirm, build_trace
from mplp_sdk.validation import validate_context, validate_plan, validate_confirm, validate_trace

# Calculate paths relative to this test file  
TEST_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TEST_DIR.parents[3]
FIXTURES_DIR = PROJECT_ROOT / "tests" / "cross-language" / "builders" / "fixtures"
OUT_DIR = PROJECT_ROOT / "tests" / "cross-language" / "builders" /  "out" / "py"

def test_python_builders_cross_language():
    """Generate JSON from canonical fixture using Python builders"""
    
    # Ensure output directory exists
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load input fixture
    input_path = FIXTURES_DIR / "single-agent-input.json"
    with open(input_path, 'r') as f:
        input_data = json.load(f)
    
    # Build Context
    ctx = build_context(
        title=input_data['title'],
        root=input_data['root'],
        owner_role=input_data.get('owner_role'),
        tags=input_data.get('tags'),
        language=input_data.get('language'),
        constraints=input_data.get('constraints')
    )
    
    # Validate Context
    ok, errors = validate_context(ctx)
    assert ok, f"Context validation failed: {errors}"
    
    # Build Plan
    plan = build_plan(
        ctx,
        title=input_data['plan']['title'],
        objective=input_data['plan']['objective'],
        steps=input_data['plan']['steps']
    )
    
    # Validate Plan
    ok, errors = validate_plan(plan)
    assert ok, f"Plan validation failed: {errors}"
    
    # Build Confirm
    confirm = build_confirm(
        plan,
        status=input_data['confirm']['status'],
        reviewer=input_data['confirm'].get('reviewer'),
        reason=input_data['confirm'].get('reason')
    )
    
    # Validate Confirm
    ok, errors = validate_confirm(confirm)
    assert ok, f"Confirm validation failed: {errors}"
    
    # Build Trace
    trace = build_trace(ctx, plan, confirm)
    
    # Validate Trace
    ok, errors = validate_trace(trace)
    assert ok, f"Trace validation failed: {errors}"
    
    # Assemble result using Pydantic's model_dump with exclude_none
    result = {
        "context": ctx.model_dump(mode="json", exclude_none=True),
        "plan": plan.model_dump(mode="json", exclude_none=True),
        "confirm": confirm.model_dump(mode="json", exclude_none=True),
        "trace": trace.model_dump(mode="json", exclude_none=True)
    }
    
    # Write to output
    output_path = OUT_DIR / "single-agent.json"
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    # Assertions
    assert output_path.exists()
    assert result['context'] is not None
    assert result['plan'] is not None
    assert result['confirm'] is not None
    assert result['trace'] is not None
    
    # Verify ID relationships
    assert result['plan']['context_id'] == result['context']['context_id']
    assert result['confirm']['target_id'] == result['plan']['plan_id']
    assert result['trace']['context_id'] == result['context']['context_id']
