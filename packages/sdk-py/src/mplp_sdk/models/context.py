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
from typing import Dict, Any
from datetime import datetime
from mplp_sdk.models.common.trace_base import TraceBase
from mplp_sdk.models.common.events import Event
from typing import Annotated
from mplp_sdk.models.common.common_types import Ref

class ContextCorePropertiesRoot(BaseModel):
    """[PROTOCOL-CORE] Context root node definition (business domain, environment, entry point resources, etc.)."""
    model_config = ConfigDict(extra="allow")
    domain: str = Field(..., description="[PROTOCOL-CORE] Business domain identifier.")
    environment: str = Field(..., description="[PROTOCOL-CORE] Runtime environment identifier (e.g., development, production).")
    entry_point: Optional[str] = Field(None, description="[PROTOCOL-CORE] Entry point resource identifier.")


class ContextGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")


class ContextRoot(BaseModel):
    """[PROTOCOL-CORE] Context root node definition (business domain, environment, entry point resources, etc.)."""
    model_config = ConfigDict(extra="allow")
    domain: str = Field(..., description="[PROTOCOL-CORE] Business domain identifier.")
    environment: str = Field(..., description="[PROTOCOL-CORE] Runtime environment identifier (e.g., development, production).")
    entry_point: Optional[str] = Field(None, description="[PROTOCOL-CORE] Entry point resource identifier.")

class ContextCoreProperties(BaseModel):
    """ContextCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata (version, source, cross-cutting tags, etc.).")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Context.")
    root: ContextCorePropertiesRoot = Field(..., description="[PROTOCOL-CORE] Context root node definition (business domain, environment, entry point resources, etc.).")
    title: str = Field(..., description="[PROTOCOL-CORE] Context title, used for human and Agent identification of the project/session.")
    summary: Optional[str] = Field(None, description="[PROTOCOL-CORE] Brief summary of the Context (background, scope, etc.).")
    status: Literal["draft", "active", "suspended", "archived", "closed"] = Field(..., description="[PROTOCOL-CORE] Current lifecycle status of the Context.")
    tags: Optional[List[str]] = Field(None, description="[PROTOCOL-CORE] List of tags for classification and retrieval.")
    language: Optional[str] = Field(None, description="[PROTOCOL-CORE] Primary working language of the Context (e.g., en, zh-CN).")
    owner_role: Optional[str] = Field(None, description="[PROTOCOL-CORE] Identifier of the primary owner role (should correspond to role_id in Role module).")
    constraints: Optional[Dict[str, Any]] = Field(None, description="[PROTOCOL-CORE] Key constraints for the Context, such as security boundaries, compliance requirements, budget, or deadlines.")
    created_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Context creation time (ISO 8601).")
    updated_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Context last update time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Main Trace reference bound to this Context (for global tracing).")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this Context (creation, status change, archiving, etc.).")

Uuid = Annotated[str, Field(pattern=r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")]

class Context(BaseModel):
    """Context Module Core Protocol: Describes the context resources and their minimal required semantics (Core Profile) for a multi-agent collaboration project/session."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata (version, source, cross-cutting tags, etc.).")
    governance: Optional[ContextGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Context.")
    root: ContextRoot = Field(..., description="[PROTOCOL-CORE] Context root node definition (business domain, environment, entry point resources, etc.).")
    title: str = Field(..., description="[PROTOCOL-CORE] Context title, used for human and Agent identification of the project/session.")
    summary: Optional[str] = Field(None, description="[PROTOCOL-CORE] Brief summary of the Context (background, scope, etc.).")
    status: Literal["draft", "active", "suspended", "archived", "closed"] = Field(..., description="[PROTOCOL-CORE] Current lifecycle status of the Context.")
    tags: Optional[List[str]] = Field(None, description="[PROTOCOL-CORE] List of tags for classification and retrieval.")
    language: Optional[str] = Field(None, description="[PROTOCOL-CORE] Primary working language of the Context (e.g., en, zh-CN).")
    owner_role: Optional[str] = Field(None, description="[PROTOCOL-CORE] Identifier of the primary owner role (should correspond to role_id in Role module).")
    constraints: Optional[Dict[str, Any]] = Field(None, description="[PROTOCOL-CORE] Key constraints for the Context, such as security boundaries, compliance requirements, budget, or deadlines.")
    created_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Context creation time (ISO 8601).")
    updated_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Context last update time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Main Trace reference bound to this Context (for global tracing).")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this Context (creation, status change, archiving, etc.).")

