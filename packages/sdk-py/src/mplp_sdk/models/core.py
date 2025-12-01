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
from mplp_sdk.models.common.trace_base import TraceBase
from mplp_sdk.models.common.events import Event
from mplp_sdk.models.common.common_types import Ref

class CoreGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class CoreCoreProperties(BaseModel):
    """CoreCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="")
    core_id: Uuid = Field(..., description="")
    protocol_version: str = Field(..., description="")
    status: Literal["draft", "active", "deprecated", "archived"] = Field(..., description="")
    modules: List[CoreModuleDescriptor] = Field(..., description="")
    trace: Optional[TraceBase] = Field(None, description="")
    events: Optional[List[Event]] = Field(None, description="")

class CoreModuleDescriptor(BaseModel):
    """[PROTOCOL-CORE] L2 module descriptor (used to declare which modules are enabled in the current instance)."""
    model_config = ConfigDict(extra="forbid")
    module_id: Literal["context", "plan", "confirm", "trace", "role", "extension", "dialog", "collab", "core", "network"] = Field(..., description="[PROTOCOL-CORE] Module identifier.")
    version: str = Field(..., description="[PROTOCOL-CORE] Protocol version used by this module in the current instance (SemVer recommended).")
    status: Literal["enabled", "disabled", "experimental", "deprecated"] = Field(..., description="[PROTOCOL-CORE] Status of this module in the current instance.")
    required: Optional[bool] = Field(None, description="[PROTOCOL-CORE] Whether this module is mandatory for the current instance.")
    description: Optional[str] = Field(None, description="[PROTOCOL-CORE] Brief description of the module, for humans and Agents.")

class Core(BaseModel):
    """Core Module Core Protocol: Describes the minimal required semantics (Core Profile) for an MPLP protocol instance's version, enabled modules, and overall state."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    governance: Optional[CoreGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    core_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the current Core instance.")
    protocol_version: str = Field(..., description="[PROTOCOL-CORE] Major version number of the current MPLP protocol instance (e.g., 1.0.0).")
    status: Literal["draft", "active", "deprecated", "archived"] = Field(..., description="[PROTOCOL-CORE] Lifecycle status of the current Core instance.")
    modules: List[CoreModuleDescriptor] = Field(..., description="[PROTOCOL-CORE] List of L2 modules enabled in the current protocol instance.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Main Trace reference bound to this Core instance, used for auditing Core layer configuration changes.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events related to this Core instance (version upgrades, module enable/disable, etc.).")

