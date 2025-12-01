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
from typing import List
from datetime import datetime
from mplp_sdk.models.common.trace_base import TraceBase
from mplp_sdk.models.common.events import Event
from mplp_sdk.models.common.common_types import Ref

class RoleGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class RoleCoreProperties(BaseModel):
    """RoleCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.).")
    role_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Role.")
    name: str = Field(..., description="[PROTOCOL-CORE] Human-readable name of the role (e.g., 'planner', 'reviewer', 'executor').")
    description: Optional[str] = Field(None, description="[PROTOCOL-CORE] Detailed description of the role function, for humans and Agents.")
    capabilities: Optional[List[str]] = Field(None, description="[PROTOCOL-CORE] List of capability/permission tags possessed by the role (e.g., 'plan.create', 'confirm.approve').")
    created_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Role creation time (ISO 8601).")
    updated_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Role last update time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Audit trace reference associated with this role.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this role (creation, permission changes, deactivation, etc.).")

class Role(BaseModel):
    """Role Module Core Protocol: Describes the minimal required semantics (Core Profile) for capability declarations, permission declarations, and behavioral identity models in multi-agent systems."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.).")
    governance: Optional[RoleGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    role_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Role.")
    name: str = Field(..., description="[PROTOCOL-CORE] Human-readable name of the role (e.g., 'planner', 'reviewer', 'executor').")
    description: Optional[str] = Field(None, description="[PROTOCOL-CORE] Detailed description of the role function, for humans and Agents.")
    capabilities: Optional[List[str]] = Field(None, description="[PROTOCOL-CORE] List of capability/permission tags possessed by the role (e.g., 'plan.create', 'confirm.approve').")
    created_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Role creation time (ISO 8601).")
    updated_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Role last update time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Audit trace reference associated with this role.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this role (creation, permission changes, deactivation, etc.).")

