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

class NetworkGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class NetworkCoreProperties(BaseModel):
    """NetworkCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    network_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the network.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this network belongs to.")
    name: str = Field(..., description="[PROTOCOL-CORE] Network name.")
    description: Optional[str] = Field(None, description="[PROTOCOL-CORE] Brief description of the network.")
    topology_type: Literal["single_node", "hub_spoke", "mesh", "hierarchical", "hybrid", "other"] = Field(..., description="[PROTOCOL-CORE] Network topology type.")
    status: Literal["draft", "provisioning", "active", "degraded", "maintenance", "retired"] = Field(..., description="[PROTOCOL-CORE] Network lifecycle status.")
    nodes: Optional[List[NetworkNodeCore]] = Field(None, description="[PROTOCOL-CORE] Collection of core nodes in the network.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference associated with this network.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events related to this network.")

class NetworkNodeCore(BaseModel):
    """[PROTOCOL-CORE] Minimal required semantics for a network node."""
    model_config = ConfigDict(extra="forbid")
    node_id: Uuid = Field(..., description="[PROTOCOL-CORE] Node identifier.")
    name: Optional[str] = Field(None, description="[PROTOCOL-CORE] Node name.")
    kind: Literal["agent", "service", "database", "queue", "external", "other"] = Field(..., description="[PROTOCOL-CORE] Node type.")
    role_id: Optional[str] = Field(None, description="[PROTOCOL-CORE] Role identifier corresponding to this node (should correspond to role_id in Role module).")
    status: Literal["active", "inactive", "degraded", "unreachable", "retired"] = Field(..., description="[PROTOCOL-CORE] Current status of the node.")

class Network(BaseModel):
    """Network Module Core Protocol: Describes the minimal required semantics (Core Profile) for the topology and node collection of a multi-agent collaboration network."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    governance: Optional[NetworkGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    network_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the network.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Identifier of the Context this network belongs to.")
    name: str = Field(..., description="[PROTOCOL-CORE] Network name.")
    description: Optional[str] = Field(None, description="[PROTOCOL-CORE] Brief description of the network.")
    topology_type: Literal["single_node", "hub_spoke", "mesh", "hierarchical", "hybrid", "other"] = Field(..., description="[PROTOCOL-CORE] Network topology type.")
    status: Literal["draft", "provisioning", "active", "degraded", "maintenance", "retired"] = Field(..., description="[PROTOCOL-CORE] Network lifecycle status.")
    nodes: Optional[List[NetworkNodeCore]] = Field(None, description="[PROTOCOL-CORE] Collection of core nodes in the network.")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Trace reference associated with this network.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events related to this network.")

