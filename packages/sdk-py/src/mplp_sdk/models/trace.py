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

from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from mplp_sdk.models.common.meta import Metadata
from typing import Optional
from pydantic import Field
from mplp_sdk.models.common.identifiers import Uuid
from mplp_sdk.models.common.trace_base import TraceBase
from typing import Literal
from datetime import datetime
from typing import List
from mplp_sdk.models.common.events import Event
from typing import Dict, Any
from mplp_sdk.models.common.common_types import Ref

class TraceGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class TraceCoreProperties(BaseModel):
    """TraceCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    trace_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Trace.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this Trace belongs to.")
    plan_id: Optional[Uuid] = Field(None, description="[PROTOCOL-CORE] Identifier of the Plan associated with this Trace (if any).")
    root_span: TraceBase = Field(..., description="[PROTOCOL-CORE] Root span definition of the Trace (follows L1 trace-base structure).")
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Current status of the Trace.")
    started_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Trace start time (ISO 8601).")
    finished_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Trace finish time (ISO 8601, optional if not finished).")
    segments: Optional[List[TraceSegmentCore]] = Field(None, description="[PROTOCOL-CORE] Key execution segments in the Trace (can correspond to multiple spans or phased aggregations).")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of events directly related to this Trace (errors, retries, status changes, etc.).")

class TraceSegmentCore(BaseModel):
    """[PROTOCOL-CORE] Key segments in execution tracing, used to express an auditable execution interval at the protocol layer."""
    model_config = ConfigDict(extra="forbid")
    segment_id: Uuid = Field(..., description="[PROTOCOL-CORE] Segment identifier.")
    parent_segment_id: Optional[Uuid] = Field(None, description="[PROTOCOL-CORE] Parent segment identifier (optional if root segment).")
    label: str = Field(..., description="[PROTOCOL-CORE] Segment label/name, for human and Agent identification of the interval.")
    status: Literal["pending", "running", "completed", "failed", "cancelled", "skipped"] = Field(..., description="[PROTOCOL-CORE] Segment status.")
    started_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Segment start time.")
    finished_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Segment finish time (optional if not finished).")
    attributes: Optional[Dict[str, Any]] = Field(None, description="[PROTOCOL-CORE] Key context attributes related to this segment (key-value form, for tracing and audit).")

class Trace(BaseModel):
    """Trace Module Core Protocol: Describes the minimal required semantics (Core Profile) for execution trace resources (Trace) and their key segments and events."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    governance: Optional[TraceGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    trace_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Trace.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this Trace belongs to.")
    plan_id: Optional[Uuid] = Field(None, description="[PROTOCOL-CORE] Identifier of the Plan associated with this Trace (if any).")
    root_span: TraceBase = Field(..., description="[PROTOCOL-CORE] Root span definition of the Trace (follows L1 trace-base structure).")
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Current status of the Trace.")
    started_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Trace start time (ISO 8601).")
    finished_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Trace finish time (ISO 8601, optional if not finished).")
    segments: Optional[List[TraceSegmentCore]] = Field(None, description="[PROTOCOL-CORE] Key execution segments in the Trace (can correspond to multiple spans or phased aggregations).")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of events directly related to this Trace (errors, retries, status changes, etc.).")

