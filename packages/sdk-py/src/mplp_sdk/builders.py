from datetime import datetime, timezone
from uuid import uuid4
from typing import Any, Dict, List, Optional
from .models import Context, Plan, Confirm, Trace
from .models.common import Metadata

def _create_meta(
    protocol_version: str = "1.0.0",
    schema_version: str = "1.0.0",
    **extra: Dict[str, Any]
) -> Metadata:
    return Metadata(
        protocol_version=protocol_version,
        schema_version=schema_version,
        created_at=datetime.now(timezone.utc),
        **extra
    )

def build_context(
    title: str,
    root: Dict[str, Any],
    environment: str = "development",
    protocol_version: str = "1.0.0",
    schema_version: str = "1.0.0",
    context_id: Optional[str] = None,
    summary: Optional[str] = None,
    tags: Optional[List[str]] = None,
    language: Optional[str] = None,
    owner_role: Optional[str] = None,
    constraints: Optional[Dict[str, Any]] = None,
    **extra_fields: Any,
) -> Context:
    if context_id is None:
        context_id = str(uuid4())
    
    root_data = root.copy()
    if "environment" not in root_data:
        root_data["environment"] = environment

    # Build base context with required fields
    context_data = {
        "meta": _create_meta(protocol_version, schema_version),
        "context_id": context_id,
        "title": title,
        "root": root_data,
        "status": "active"
    }
    
    # Add optional fields if provided
    if summary is not None:
        context_data["summary"] = summary
    if tags is not None:
        context_data["tags"] = tags
    if language is not None:
        context_data["language"] = language
    if owner_role is not None:
        context_data["owner_role"] = owner_role
    if constraints is not None:
        context_data["constraints"] = constraints
    
    # Add any extra fields
    context_data.update(extra_fields)

    return Context(**context_data)

def build_plan(
    context: Context,
    steps: List[Dict[str, Any]],
    owner: Optional[str] = None,
    plan_id: Optional[str] = None,
    **extra_fields: Dict[str, Any],
) -> Plan:
    if plan_id is None:
        plan_id = str(uuid4())

    # Enrich steps
    enriched_steps = []
    for i, step in enumerate(steps):
        s = step.copy()
        if "step_id" not in s:
            s["step_id"] = str(uuid4())
        if "status" not in s:
            s["status"] = "pending"
        enriched_steps.append(s)

    title = extra_fields.pop("title", f"Plan for {context.title}")
    objective = extra_fields.pop("objective", "Default Objective")

    return Plan(
        meta=_create_meta(),
        plan_id=plan_id,
        context_id=context.context_id,
        title=title,
        objective=objective,
        status="draft",
        steps=enriched_steps,
        **extra_fields
    )

def build_confirm(
    plan: Plan,
    status: str = "approved",
    reviewer: Optional[str] = None,
    confirm_id: Optional[str] = None,
    **extra_fields: Dict[str, Any],
) -> Confirm:
    if confirm_id is None:
        confirm_id = str(uuid4())

    return Confirm(
        meta=_create_meta(),
        confirm_id=confirm_id,
        target_type="plan",
        target_id=plan.plan_id,
        status=status,
        requested_by_role=reviewer or "system",
        requested_at=datetime.now(timezone.utc).isoformat(), # Schema says string
        **extra_fields
    )

def build_trace(
    context: Context,
    plan: Plan,
    confirm: Optional[Confirm] = None,
    root_span_name: str = "root",
    trace_id: Optional[str] = None,
    **extra_fields: Dict[str, Any],
) -> Trace:
    if trace_id is None:
        trace_id = str(uuid4())

    # Import TraceBase
    from .models.common import TraceBase

    root_span = TraceBase(
        trace_id=trace_id,
        span_id=str(uuid4()),
        context_id=context.context_id
    )

    return Trace(
        meta=_create_meta(),
        trace_id=trace_id,
        context_id=context.context_id,
        plan_id=plan.plan_id,
        status="running",
        root_span=root_span,
        **extra_fields
    )

