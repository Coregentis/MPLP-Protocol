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
from typing import Literal
from datetime import datetime
from typing import List
from mplp_sdk.models.common.trace_base import TraceBase
from mplp_sdk.models.common.events import Event
from mplp_sdk.models.common.common_types import Ref

class ConfirmGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class ConfirmCoreProperties(BaseModel):
    """ConfirmCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.).")
    confirm_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the approval request.")
    target_type: Literal["context", "plan", "trace", "extension", "other"] = Field(..., description="[PROTOCOL-CORE] Approval target type (type of the resource being approved).")
    target_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier of the resource being approved.")
    status: Literal["pending", "approved", "rejected", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Current status of the approval request.")
    requested_by_role: str = Field(..., description="[PROTOCOL-CORE] Identifier of the role initiating the approval request (should correspond to role_id in Role module).")
    requested_at: datetime = Field(..., description="[PROTOCOL-CORE] Approval request creation time (ISO 8601).")
    reason: Optional[str] = Field(None, description="[PROTOCOL-CORE] Reason for the request, for humans and Agents.")
    decisions: Optional[List[ConfirmDecisionCore]] = Field(None, description="[PROTOCOL-CORE] List of decision records related to this Confirm request.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference bound to this Confirm request (for cross-module tracing).")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this Confirm request (creation, decision, cancellation, etc.).")

class ConfirmDecisionCore(BaseModel):
    """[PROTOCOL-CORE] Minimal required semantics for a single approval decision record."""
    model_config = ConfigDict(extra="forbid")
    decision_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the decision record.")
    status: Literal["approved", "rejected", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Decision result status.")
    decided_by_role: str = Field(..., description="[PROTOCOL-CORE] Identifier of the role making the decision (should correspond to role_id in Role module).")
    decided_at: datetime = Field(..., description="[PROTOCOL-CORE] Decision time (ISO 8601).")
    reason: Optional[str] = Field(None, description="[PROTOCOL-CORE] Summary of the decision reason (optional).")

class Confirm(BaseModel):
    """Confirm Module Core Protocol: Describes the minimal required semantics (Core Profile) for approval requests and decision records."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.).")
    governance: Optional[ConfirmGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    confirm_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the approval request.")
    target_type: Literal["context", "plan", "trace", "extension", "other"] = Field(..., description="[PROTOCOL-CORE] Approval target type (type of the resource being approved).")
    target_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier of the resource being approved.")
    status: Literal["pending", "approved", "rejected", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Current status of the approval request.")
    requested_by_role: str = Field(..., description="[PROTOCOL-CORE] Identifier of the role initiating the approval request (should correspond to role_id in Role module).")
    requested_at: datetime = Field(..., description="[PROTOCOL-CORE] Approval request creation time (ISO 8601).")
    reason: Optional[str] = Field(None, description="[PROTOCOL-CORE] Reason for the request, for humans and Agents.")
    decisions: Optional[List[ConfirmDecisionCore]] = Field(None, description="[PROTOCOL-CORE] List of decision records related to this Confirm request.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference bound to this Confirm request (for cross-module tracing).")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this Confirm request (creation, decision, cancellation, etc.).")

