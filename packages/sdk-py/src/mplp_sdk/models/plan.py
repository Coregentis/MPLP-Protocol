from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from mplp_sdk.models.common.meta import Metadata
from typing import Optional
from pydantic import Field
from mplp_sdk.models.common.identifiers import Uuid
from typing import Literal
from typing import List
from mplp_sdk.models.common.trace_base import TraceBase
from mplp_sdk.models.common.events import Event

class PlanCoreProperties(BaseModel):
    """PlanCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.).")
    plan_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Plan.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this Plan belongs to.")
    title: str = Field(..., description="[PROTOCOL-CORE] Plan title (brief description for humans and Agents).")
    objective: str = Field(..., description="[PROTOCOL-CORE] Description of the objective to be achieved by the Plan.")
    status: Literal["draft", "proposed", "approved", "in_progress", "completed", "cancelled", "failed"] = Field(..., description="[PROTOCOL-CORE] Status of the Plan in its lifecycle.")
    steps: List[PlanStepCore] = Field(..., description="[PROTOCOL-CORE] List of core steps decomposed from the Plan.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Main execution trace reference associated with this Plan.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly associated with this Plan (changes, approvals, status transitions, etc.).")

class PlanStepCore(BaseModel):
    """[PROTOCOL-CORE] Minimal required semantics for a plan step (excluding execution engine, scheduling policy implementation details)."""
    model_config = ConfigDict(extra="forbid")
    step_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the step.")
    description: str = Field(..., description="[PROTOCOL-CORE] Content of the work to be completed in the step.")
    status: Literal["pending", "in_progress", "completed", "blocked", "skipped", "failed"] = Field(..., description="[PROTOCOL-CORE] Current status of the step.")
    dependencies: Optional[List[Uuid]] = Field(None, description="[PROTOCOL-CORE] List of other step IDs that this step depends on.")
    agent_role: Optional[str] = Field(None, description="[PROTOCOL-CORE] Identifier of the role responsible for this step (should correspond to role_id in Role module).")
    order_index: Optional[int] = Field(None, description="[PROTOCOL-CORE] Sort index in the current Plan, used for defining execution order or display order.")

class Plan(BaseModel):
    """Plan Module Core Protocol: Describes the plan objects and their lifecycle minimal required semantics (Core Profile) in multi-agent collaboration."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.).")
    plan_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Plan.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this Plan belongs to.")
    title: str = Field(..., description="[PROTOCOL-CORE] Plan title (brief description for humans and Agents).")
    objective: str = Field(..., description="[PROTOCOL-CORE] Description of the objective to be achieved by the Plan.")
    status: Literal["draft", "proposed", "approved", "in_progress", "completed", "cancelled", "failed"] = Field(..., description="[PROTOCOL-CORE] Status of the Plan in its lifecycle.")
    steps: List[PlanStepCore] = Field(..., description="[PROTOCOL-CORE] List of core steps decomposed from the Plan.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Main execution trace reference associated with this Plan.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly associated with this Plan (changes, approvals, status transitions, etc.).")

