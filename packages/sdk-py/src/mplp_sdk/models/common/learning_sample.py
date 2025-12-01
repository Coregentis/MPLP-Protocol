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
from mplp_sdk.models.common.identifiers import Uuid
from typing import Optional
from pydantic import Field
from typing import Dict, Any
from typing import List
from typing import Literal
from datetime import datetime

class LearningSampleErrorInfo(BaseModel):
    """Error details if action failed."""
    model_config = ConfigDict(extra="forbid")
    error_code: Optional[str] = Field(None, description="")
    error_message: Optional[str] = Field(None, description="")
    stack_trace: Optional[str] = Field(None, description="")


class LearningSampleTokenUsage(BaseModel):
    """LLM token consumption metrics."""
    model_config = ConfigDict(extra="forbid")
    total_tokens: Optional[float] = Field(None, description="")
    prompt_tokens: Optional[float] = Field(None, description="")
    completion_tokens: Optional[float] = Field(None, description="")
    by_agent: Optional[List[Dict[str, Any]]] = Field(None, description="Token usage breakdown by agent.")


class LearningSampleUserFeedback(BaseModel):
    """Human feedback on the action/result."""
    model_config = ConfigDict(extra="forbid")
    decision: Optional[Literal["approve", "reject", "override", "unknown"]] = Field(None, description="")
    comment: Optional[str] = Field(None, description="")
    rating: Optional[float] = Field(None, description="")


class LearningSampleTimestamps(BaseModel):
    """Execution timeline."""
    model_config = ConfigDict(extra="forbid")
    started_at: datetime = Field(..., description="")
    completed_at: Optional[datetime] = Field(None, description="")

class LearningSample(BaseModel):
    """Structured learning sample for MPLP v1.0 runtimes."""
    model_config = ConfigDict(extra="forbid")
    sample_id: Uuid = Field(..., description="Unique identifier for this learning sample.")
    project_id: str = Field(..., description="Project identifier this sample belongs to.")
    intent_before: Optional[Dict[str, Any]] = Field(None, description="Structured representation of the original intent (can reference Context/Plan).")
    plan: Optional[Dict[str, Any]] = Field(None, description="Structured representation of the plan used (can reference Plan module).")
    delta_intents: Optional[List[Dict[str, Any]]] = Field(None, description="Array of delta intents proposed/applied.")
    graph_before: Optional[Dict[str, Any]] = Field(None, description="Optional snapshot or summary of the knowledge graph before the change.")
    graph_after: Optional[Dict[str, Any]] = Field(None, description="Optional snapshot or summary of the knowledge graph after the change.")
    pipeline_path: Optional[List[str]] = Field(None, description="Sequence of pipeline stages traversed.")
    success_flag: bool = Field(..., description="Whether the action/intent succeeded.")
    error_info: Optional[LearningSampleErrorInfo] = Field(None, description="Error details if action failed.")
    token_usage: Optional[LearningSampleTokenUsage] = Field(None, description="LLM token consumption metrics.")
    execution_time_ms: Optional[float] = Field(None, description="Execution time in milliseconds.")
    impact_score: Optional[float] = Field(None, description="Impact score (0.0-1.0).")
    user_feedback: Optional[LearningSampleUserFeedback] = Field(None, description="Human feedback on the action/result.")
    governance_decisions: Optional[List[Dict[str, Any]]] = Field(None, description="Governance rules evaluated during execution.")
    timestamps: LearningSampleTimestamps = Field(..., description="Execution timeline.")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata (extensibility point).")
    vendor_extensions: Optional[Dict[str, Any]] = Field(None, description="Optional vendor-specific extensions. Structure is implementation-defined and MUST NOT conflict with core protocol fields.")

