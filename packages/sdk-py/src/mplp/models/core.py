# MPLP v1.0.0 FROZEN
# Governance: MPGC

from typing import List, Dict, Any, Optional, Union, Literal
from pydantic import BaseModel, Field, UUID4
from datetime import datetime
from .common import Metadata

class TraceSpan(BaseModel):
    trace_id: UUID4
    span_id: UUID4
    context_id: UUID4
    name: Optional[str] = None
    status: Literal["running", "completed", "failed"] = "running"
    
    class Config:
        extra = "allow"

class Context(BaseModel):
    meta: Metadata
    context_id: UUID4
    root: Dict[str, Any]
    title: str
    status: Literal["active", "archived"]
    
    # Missing fields
    summary: Optional[str] = None
    owner_role: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    trace: Optional[Any] = None # Circular dependency with Trace? Use Any for now
    tags: Optional[List[str]] = None
    constraints: Optional[Dict[str, Any]] = None
    events: Optional[List[Any]] = None
    language: Optional[str] = None
    governance: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"

class PlanStep(BaseModel):
    step_id: UUID4
    description: str
    status: Literal["pending", "running", "completed", "failed", "skipped"] = "pending"
    tool: Optional[str] = None
    args: Optional[Dict[str, Any]] = None
    
    class Config:
        extra = "allow"

class Plan(BaseModel):
    meta: Metadata
    plan_id: UUID4
    context_id: UUID4
    title: str
    objective: str
    status: Literal["draft", "pending", "approved", "rejected", "completed", "failed", "cancelled"]
    steps: List[PlanStep]
    
    # Missing fields
    requested_at: Optional[datetime] = None
from typing import List, Dict, Any, Optional, Union, Literal
from pydantic import BaseModel, Field, UUID4
from datetime import datetime
from .common import Metadata

class TraceSpan(BaseModel):
    trace_id: UUID4
    span_id: UUID4
    context_id: UUID4
    name: Optional[str] = None
    status: Literal["running", "completed", "failed"] = "running"
    
    class Config:
        extra = "allow"

class Context(BaseModel):
    meta: Metadata
    context_id: UUID4
    root: Dict[str, Any]
    title: str
    status: Literal["active", "archived"]
    
    # Missing fields
    summary: Optional[str] = None
    owner_role: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    trace: Optional[Any] = None # Circular dependency with Trace? Use Any for now
    tags: Optional[List[str]] = None
    constraints: Optional[Dict[str, Any]] = None
    events: Optional[List[Any]] = None
    language: Optional[str] = None
    governance: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"

class PlanStep(BaseModel):
    step_id: UUID4
    description: str
    status: Literal["pending", "running", "completed", "failed", "skipped"] = "pending"
    tool: Optional[str] = None
    args: Optional[Dict[str, Any]] = None
    
    class Config:
        extra = "allow"

class Plan(BaseModel):
    meta: Metadata
    plan_id: UUID4
    context_id: UUID4
    title: str
    objective: str
    status: Literal["draft", "pending", "approved", "rejected", "completed", "failed", "cancelled"]
    steps: List[PlanStep]
    
    # Missing fields
    requested_at: Optional[datetime] = None
    events: Optional[List[Any]] = None
    trace: Optional[Any] = None

    class Config:
        extra = "allow"

class Confirm(BaseModel):
    meta: Metadata
    confirm_id: UUID4
    target_id: UUID4
    target_type: str
    status: Literal["pending", "approved", "rejected"]
    requested_by_role: str
    reason: Optional[str] = None
    
    # Missing fields
    requested_at: datetime
    events: Optional[List[Any]] = None
    decisions: Optional[List[Any]] = None
    governance: Optional[Dict[str, Any]] = None
    trace: Optional[Any] = None

    class Config:
        extra = "allow"

class Trace(BaseModel):
    meta: Metadata
    trace_id: UUID4
    context_id: UUID4
    plan_id: UUID4
    status: Literal["running", "completed", "failed"]
    root_span: TraceSpan
    events: List[Any] = Field(default_factory=list)
    
    # Missing fields
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    governance: Optional[Dict[str, Any]] = None
    segments: Optional[List[Any]] = None

    class Config:
        extra = "allow"
