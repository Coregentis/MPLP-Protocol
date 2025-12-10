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
import json
import os
from pathlib import Path
from mplp.validation import (
    validate_context,
    validate_plan,
    validate_confirm,
    validate_trace
)
from mplp.models import Context, Plan, Confirm, Trace

# Paths
CURRENT_DIR = Path(__file__).parent
ROOT_DIR = CURRENT_DIR.parent.parent.parent.parent
RUNTIME_OUT_TS_DIR = ROOT_DIR / "tests" / "cross-language" / "runtime" / "out" / "ts"
RUNTIME_OUT_PY_DIR = ROOT_DIR / "tests" / "cross-language" / "runtime" / "out" / "py"

# Ensure output directory exists
os.makedirs(RUNTIME_OUT_PY_DIR, exist_ok=True)

class TestRuntimeFromTs:
    """H6.2: Validate TS Runtime JSON with Python SDK"""

    def test_validate_runtime_context(self):
        with open(RUNTIME_OUT_TS_DIR / "context.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        result = validate_context(data)
        assert result.ok is True, f"Context validation failed: {result.errors}"
        
        # H6.3 Prep: Re-dump from Python model
        model = Context(**data)
        with open(RUNTIME_OUT_PY_DIR / "context.json", "w", encoding="utf-8") as f:
            f.write(model.model_dump_json(exclude_none=True, indent=2))

    def test_validate_runtime_plan(self):
        with open(RUNTIME_OUT_TS_DIR / "plan.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        result = validate_plan(data)
        assert result.ok is True, f"Plan validation failed: {result.errors}"

        # H6.3 Prep
        model = Plan(**data)
        with open(RUNTIME_OUT_PY_DIR / "plan.json", "w", encoding="utf-8") as f:
            f.write(model.model_dump_json(exclude_none=True, indent=2))

    def test_validate_runtime_confirm(self):
        with open(RUNTIME_OUT_TS_DIR / "confirm.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        result = validate_confirm(data)
        assert result.ok is True, f"Confirm validation failed: {result.errors}"

        # H6.3 Prep
        model = Confirm(**data)
        with open(RUNTIME_OUT_PY_DIR / "confirm.json", "w", encoding="utf-8") as f:
            f.write(model.model_dump_json(exclude_none=True, indent=2))

    def test_validate_runtime_trace(self):
        with open(RUNTIME_OUT_TS_DIR / "trace.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        result = validate_trace(data)
        assert result.ok is True, f"Trace validation failed: {result.errors}"

        # H6.3 Prep
        model = Trace(**data)
        with open(RUNTIME_OUT_PY_DIR / "trace.json", "w", encoding="utf-8") as f:
            f.write(model.model_dump_json(exclude_none=True, indent=2))

    def test_invariants(self):
        """Check ID relationships across files"""
        with open(RUNTIME_OUT_TS_DIR / "context.json", encoding="utf-8") as f: ctx = json.load(f)
        with open(RUNTIME_OUT_TS_DIR / "plan.json", encoding="utf-8") as f: plan = json.load(f)
        with open(RUNTIME_OUT_TS_DIR / "confirm.json", encoding="utf-8") as f: confirm = json.load(f)
        with open(RUNTIME_OUT_TS_DIR / "trace.json", encoding="utf-8") as f: trace = json.load(f)

        assert plan["context_id"] == ctx["context_id"]
        assert confirm["target_id"] == plan["plan_id"]
        assert trace["context_id"] == ctx["context_id"]
        assert trace["plan_id"] == plan["plan_id"]
        assert trace["root_span"]["trace_id"] == trace["trace_id"]
