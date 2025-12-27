# MPLP v1.0.0 FROZEN
# Governance: MPGC

from typing import List, Dict, Any, Optional
from uuid import uuid4
from datetime import datetime, timezone
from .models import Context, Plan, Confirm, Trace, PlanStep, TraceSpan
from .models.common import Metadata

def _create_meta() -> Metadata:
    return Metadata(
        protocol_version="1.0.0",
        schema_version="1.0.0",
        created_at=datetime.now(timezone.utc)
    )

def build_context(title: str, root: Dict[str, Any], **kwargs) -> Context:
    print(f"DEBUG: build_context kwargs={kwargs} type={type(kwargs)}")
    # Ensure status is provided or default to active
    if "status" not in kwargs:
        kwargs["status"] = "active"
        
    return Context(
        meta=_create_meta(),
        context_id=uuid4(),
        title=title,
        root=root,
        **kwargs
    )

def build_plan(context: Context, title: str, objective: str, steps: List[Dict[str, Any]], **kwargs) -> Plan:
    plan_steps = []
    for s in steps:
        # Ensure step status
        s_copy = s.copy()
        if "status" not in s_copy:
            s_copy["status"] = "pending"
            
        desc = s_copy.pop("description", "")
            
        plan_steps.append(PlanStep(
            step_id=uuid4(),
            description=desc,
            **s_copy
        ))
    
    # Ensure status
    if "status" not in kwargs:
        kwargs["status"] = "draft"

    return Plan(
        meta=_create_meta(),
        plan_id=uuid4(),
        context_id=context.context_id,
        title=title,
        objective=objective,
        steps=plan_steps,
        **kwargs
    )

def build_confirm(plan: Plan, status: str = "pending", requested_by_role: str = "user", **kwargs) -> Confirm:
    if "requested_at" not in kwargs:
        kwargs["requested_at"] = datetime.now(timezone.utc)
        
    return Confirm(
        meta=_create_meta(),
        confirm_id=uuid4(),
        target_id=plan.plan_id,
        target_type="plan",
        status=status,
        requested_by_role=requested_by_role,
        **kwargs
    )

def build_trace(context: Context, plan: Plan, confirm: Optional[Confirm] = None, **kwargs) -> Trace:
    trace_id = uuid4()
    
    # Ensure status
    if "status" not in kwargs:
        kwargs["status"] = "running"
        
    return Trace(
        meta=_create_meta(),
        trace_id=trace_id,
        context_id=context.context_id,
        plan_id=plan.plan_id,
        root_span=TraceSpan(
            trace_id=trace_id,
            span_id=uuid4(),
            context_id=context.context_id,
            name="root",
            status="running"
        ),
        **kwargs
    )
