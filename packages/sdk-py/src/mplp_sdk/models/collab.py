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
from typing import List
from datetime import datetime
from mplp_sdk.models.common.trace_base import TraceBase
from mplp_sdk.models.common.events import Event
from mplp_sdk.models.common.common_types import Ref

class CollabGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class CollabCoreProperties(BaseModel):
    """CollabCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] Protocol and schema metadata.")
    collab_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the collaboration session.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this collaboration session belongs to.")
    title: str = Field(..., description="[PROTOCOL-CORE] Collaboration session title.")
    purpose: str = Field(..., description="[PROTOCOL-CORE] Description of the purpose/goal of the collaboration.")
    mode: Literal["broadcast", "round_robin", "orchestrated", "swarm", "pair"] = Field(..., description="[PROTOCOL-CORE] Collaboration mode (broadcast, round_robin, orchestrated, etc.).")
    status: Literal["draft", "active", "suspended", "completed", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Collaboration session status.")
    participants: List[CollabParticipantCore] = Field(..., description="[PROTOCOL-CORE] List of roles/Agents participating in the collaboration.")
    created_at: datetime = Field(..., description="[PROTOCOL-CORE] Creation time (ISO 8601).")
    updated_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Last update time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference bound to this collaboration session.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this collaboration.")

class CollabParticipantCore(BaseModel):
    """[PROTOCOL-CORE] Minimal required semantics for a collaboration participant."""
    model_config = ConfigDict(extra="forbid")
    participant_id: str = Field(..., description="[PROTOCOL-CORE] Participant identifier (can be Role/Agent/External ID).")
    role_id: Optional[str] = Field(None, description="[PROTOCOL-CORE] Role ID bound to this participant (corresponds to role_id in Role module).")
    kind: Literal["agent", "human", "system", "external"] = Field(..., description="[PROTOCOL-CORE] Participant type.")
    display_name: Optional[str] = Field(None, description="[PROTOCOL-CORE] Display name (for human identification).")

class Collab(BaseModel):
    """Collab Module Core Protocol: Describes the minimal required semantics (Core Profile) for multi-agent / multi-role collaboration sessions."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] Protocol and schema metadata.")
    governance: Optional[CollabGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    collab_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the collaboration session.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this collaboration session belongs to.")
    title: str = Field(..., description="[PROTOCOL-CORE] Collaboration session title.")
    purpose: str = Field(..., description="[PROTOCOL-CORE] Description of the purpose/goal of the collaboration.")
    mode: Literal["broadcast", "round_robin", "orchestrated", "swarm", "pair"] = Field(..., description="[PROTOCOL-CORE] Collaboration mode (broadcast, round_robin, orchestrated, etc.).")
    status: Literal["draft", "active", "suspended", "completed", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Collaboration session status.")
    participants: List[CollabParticipantCore] = Field(..., description="[PROTOCOL-CORE] List of roles/Agents participating in the collaboration.")
    created_at: datetime = Field(..., description="[PROTOCOL-CORE] Creation time (ISO 8601).")
    updated_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Last update time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference bound to this collaboration session.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this collaboration.")

