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

class DialogGovernance(BaseModel):
    """[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status."""
    model_config = ConfigDict(extra="forbid")
    lifecyclePhase: Optional[str] = Field(None, description="Current phase in the lifecycle fence (e.g., 'design', 'implementation', 'review').")
    truthDomain: Optional[str] = Field(None, description="The truth domain this object belongs to (e.g., 'requirements', 'architecture').")
    locked: Optional[bool] = Field(None, description="If true, this object cannot be modified except by specific governance overrides.")
    lastConfirmRef: Optional[Ref] = Field(None, description="Reference to the last Confirm decision that validated this state.")

class DialogCoreProperties(BaseModel):
    """DialogCoreProperties"""
    model_config = ConfigDict(extra="allow")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    dialog_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Dialog.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Associated Context ID.")
    thread_id: Optional[Uuid] = Field(None, description="[PROTOCOL-CORE] Dialog thread ID (for multi-turn dialog grouping).")
    status: Literal["active", "paused", "completed", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Dialog status.")
    messages: List[DialogMessageCore] = Field(..., description="[PROTOCOL-CORE] Dialog message list (Minimal Protocol Format).")
    started_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Dialog start time (ISO 8601).")
    ended_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Dialog end time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Audit trace reference associated with this dialog.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this dialog.")

class DialogMessageCore(BaseModel):
    """Minimal Protocol Format - Aligned with OpenAI/Anthropic standards"""
    model_config = ConfigDict(extra="forbid")
    role: Literal["user", "assistant", "system", "agent"] = Field(..., description="Message sender role.")
    content: str = Field(..., description="Message content (plain text).")
    timestamp: datetime = Field(..., description="Message timestamp (ISO 8601).")
    event: Optional[Event] = Field(None, description="Optional L1 Event reference (for deep integration with Trace module).")

class Dialog(BaseModel):
    """Dialog Module Core Protocol: Describes the dialog interaction semantics in multi-agent systems, adopting Minimal Protocol Format aligned with OpenAI/Anthropic standards."""
    model_config = ConfigDict(extra="forbid")
    meta: Metadata = Field(..., description="[PROTOCOL-CORE] MPLP protocol and schema metadata.")
    governance: Optional[DialogGovernance] = Field(None, description="[PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status.")
    dialog_id: Uuid = Field(..., description="[PROTOCOL-CORE] Global unique identifier for the Dialog.")
    context_id: Uuid = Field(..., description="[PROTOCOL-CORE] Associated Context ID.")
    thread_id: Optional[Uuid] = Field(None, description="[PROTOCOL-CORE] Dialog thread ID (for multi-turn dialog grouping).")
    status: Literal["active", "paused", "completed", "cancelled"] = Field(..., description="[PROTOCOL-CORE] Dialog status.")
    messages: List[DialogMessageCore] = Field(..., description="[PROTOCOL-CORE] Dialog message list (Minimal Protocol Format).")
    started_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Dialog start time (ISO 8601).")
    ended_at: Optional[datetime] = Field(None, description="[PROTOCOL-CORE] Dialog end time (ISO 8601).")
    trace: Optional[TraceBase] = Field(None, description="[PROTOCOL-CORE] Audit trace reference associated with this dialog.")
    events: Optional[List[Event]] = Field(None, description="[PROTOCOL-CORE] List of key events directly related to this dialog.")

