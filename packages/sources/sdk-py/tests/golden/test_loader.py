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

"""
Unit tests for loader - Flow and invariant loading from filesystem.

Tests that loader correctly reads fixtures shared with TypeScript Golden Harness.
"""

import pytest
from pathlib import Path
from .harness.loader import (
    load_invariants_from_yaml,
    load_global_invariants,
    load_flow_json_files,
    load_golden_flow,
    load_all_golden_flows
)


class TestLoadInvariants:
    """Test invariant loading from YAML files."""
    
    def test_load_plan_invariants(self):
        """Load plan.yaml invariants."""
        # From: packages/sources/sdk-py/tests/golden/test_loader.py
        # Need 6 parents: test_loader.py -> golden -> tests -> sdk-py -> sources -> packages -> repo_root
        repo_root = Path(__file__).parent.parent.parent.parent.parent.parent
        yaml_path = repo_root / "tests" / "golden" / "invariants" / "plan.yaml"
        
        if not yaml_path.exists():
            pytest.skip(f"Invariants file not found: {yaml_path}")
        
        invariants = load_invariants_from_yaml(yaml_path)
        assert len(invariants) > 0
        
        # Check that all invariants have scope set
        for inv in invariants:
            assert inv.scope == "plan"
            assert inv.id
            assert inv.path
            assert inv.rule
    
    def test_load_global_invariants(self):
        """Load all global invariants."""
        repo_root = Path(__file__).parent.parent.parent.parent.parent.parent
        invariants_root = repo_root / "tests" / "golden" / "invariants"
        
        if not invariants_root.exists():
            pytest.skip(f"Invariants directory not found: {invariants_root}")
        
        invariants_by_scope = load_global_invariants(invariants_root)
        
        # Should have at least plan invariants
        assert "plan" in invariants_by_scope
        assert len(invariants_by_scope["plan"]) > 0
        
        #  May have context, confirm, trace invariants too
        for scope, invs in invariants_by_scope.items():
            assert scope in ["context", "plan", "confirm", "trace"]
            assert len(invs) > 0


class TestLoadFlow:
    """Test flow loading from filesystem."""
    
    def test_load_flow_01_json_files(self):
        """Load FLOW-01 JSON files."""
        repo_root = Path(__file__).parent.parent.parent.parent.parent.parent
        flow_dir = repo_root / "tests" / "golden" / "flows" / "flow-01-single-agent-plan"
        
        if not flow_dir.exists():
            pytest.skip(f"Flow directory not found: {flow_dir}")
        
        # Load input files
        input_data = load_flow_json_files(flow_dir, "input")
        assert "context" in input_data
        assert "plan" in input_data
        assert input_data["context"]["root"]["domain"] == "golden-test"
        
        # Load expected files
        expected_data = load_flow_json_files(flow_dir, "expected")
        assert "context" in expected_data
        assert "plan" in expected_data
        assert expected_data["plan"]["title"] == "Golden Plan"
    
    def test_load_flow_01_complete(self):
        """Load complete FLOW-01 definition."""
        repo_root = Path(__file__).parent.parent.parent.parent.parent.parent
        flow_dir = repo_root / "tests" / "golden" / "flows" / "flow-01-single-agent-plan"
        invariants_root = repo_root / "tests" / "golden" / "invariants"
        
        if not flow_dir.exists():
            pytest.skip(f"Flow directory not found: {flow_dir}")
        
        global_invariants = load_global_invariants(invariants_root)
        flow = load_golden_flow(flow_dir, global_invariants)
        
        assert flow.flow_id == "FLOW-01"
        assert "Single Agent Plan" in flow.name
        assert "context" in flow.input
        assert "plan" in flow.input
        assert "context" in flow.expected
        assert "plan" in flow.expected
        assert "plan" in flow.invariants
        assert len(flow.invariants["plan"]) > 0
    
    def test_load_all_flows(self):
        """Load all golden flows."""
        flows = load_all_golden_flows()
        
        if len(flows) == 0:
            pytest.skip("No golden flows found")
        
        # Should have at least FLOW-01
        flow_ids = [f.flow_id for f in flows]
        assert "FLOW-01" in flow_ids
        
        flow_01 = next(f for f in flows if f.flow_id == "FLOW-01")
        assert flow_01.name
        assert "context" in flow_01.input
        assert "plan" in flow_01.expected
