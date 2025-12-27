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

import pytest
from mplp.builders import build_context, build_plan, build_confirm, build_trace
from mplp.validation import validate_context, validate_plan, validate_confirm, validate_trace

def test_build_context_plan_confirm_trace_happy_path():
    # 1. Context
    ctx = build_context(
        title="Happy Path",
        root={"domain": "test", "environment": "ci"}
    )
    ok, errs = validate_context(ctx)
    assert ok, f"Context invalid: {errs}"
    assert ctx.root['environment'] == "ci"

    # 2. Plan
    plan = build_plan(
        ctx,
        title="My Plan",
        objective="Test",
        steps=[{"description": "Step 1"}]
    )
    ok, errs = validate_plan(plan)
    assert ok, f"Plan invalid: {errs}"
    assert plan.context_id == ctx.context_id
    assert len(plan.steps) == 1
    assert plan.steps[0].status == "pending" # Auto-filled

    # 3. Confirm
    confirm = build_confirm(plan, status="approved")
    ok, errs = validate_confirm(confirm)
    assert ok, f"Confirm invalid: {errs}"
    assert confirm.target_id == plan.plan_id
    assert confirm.status == "approved"

    # 4. Trace
    trace = build_trace(ctx, plan, confirm)
    ok, errs = validate_trace(trace)
    assert ok, f"Trace invalid: {errs}"
    assert trace.context_id == ctx.context_id
    assert trace.plan_id == plan.plan_id

