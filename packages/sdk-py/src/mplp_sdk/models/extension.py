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
from typing import Dict, Any
from mplp_sdk.models.common.trace_base import TraceBase
from typing import List
from mplp_sdk.models.common.events import Event
from mplp_sdk.models.common.common_types import Ref

class ExtensionGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class ExtensionCoreProperties(BaseModel):
    """ExtensionCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    extension_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Extension.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this Extension belongs to.")
    name: str = Field(..., description="[PROTOCOL-CORE] Extension name (human-readable).")
    extension_type: Literal["capability", "policy", "integration", "transformation", "validation", "other"] = Field(..., description="[PROTOCOL-CORE] Extension type classification.")
    version: str = Field(..., description="[PROTOCOL-CORE] Extension version (SemVer format).")
    status: Literal["registered", "active", "inactive", "deprecated"] = Field(..., description="[PROTOCOL-CORE] Extension status.")
    config: Optional[Dict[str, Any]] = Field(None, description="[PROTOCOL-CORE] Extension configuration object (L2 safe, implementation details excluded).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference bound to this Extension.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this Extension.")

class Extension(BaseModel):
    """Extension Module Core Protocol: Describes the minimal required semantics (Core Profile) for the MPLP plugin system, capability injection, and protocol enhancement points."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    governance: Optional[ExtensionGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    extension_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Extension.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this Extension belongs to.")
    name: str = Field(..., description="[PROTOCOL-CORE] Extension name (human-readable).")
    extension_type: Literal["capability", "policy", "integration", "transformation", "validation", "other"] = Field(..., description="[PROTOCOL-CORE] Extension type classification.")
    version: str = Field(..., description="[PROTOCOL-CORE] Extension version (SemVer format).")
    status: Literal["registered", "active", "inactive", "deprecated"] = Field(..., description="[PROTOCOL-CORE] Extension status.")
    config: Optional[Dict[str, Any]] = Field(None, description="[PROTOCOL-CORE] Extension configuration object (L2 safe, implementation details excluded).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference bound to this Extension.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this Extension.")

