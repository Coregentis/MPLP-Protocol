# MPLP v1.0.0 FROZEN
# Governance: MPGC

from mplp.model import Context, Plan
from mplp.runtime import ExecutionEngine

def main():
    # Minimal example based on Flow 01
    ctx = Context(id="ctx-example", user={"id": "user-01"})
    plan = Plan(id="plan-example", steps=[
        {"id": "step-01", "tool": "search", "args": {"query": "hello"}}
    ])
    
    engine = ExecutionEngine()
    result = engine.run_single_agent(context=ctx, plan=plan)
    
    print(f"Execution Status: {result.status}")
    print(f"Artifacts: {result.artifacts}")

if __name__ == "__main__":
    main()
