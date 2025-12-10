# MPLP v1.0.0 FROZEN
# Governance: MPGC

import pytest
from mplp.model import Context, Plan
from mplp.runtime import ExecutionEngine

def test_single_agent_flow():
    # Minimal test based on Flow 01
    ctx = Context(id="ctx-flow-01", user={"id": "user-01"})
    plan = Plan(id="plan-flow-01", steps=[
        {"id": "step-01", "tool": "search", "args": {"query": "hello"}}
    ])
    
    engine = ExecutionEngine()
    result = engine.run_single_agent(context=ctx, plan=plan)
    
    assert result.status == "completed"
    assert result.artifacts is not None
