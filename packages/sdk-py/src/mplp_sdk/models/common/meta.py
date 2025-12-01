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
from typing import Optional
from pydantic import Field
from datetime import datetime
from typing import List
from typing import Literal

class Metadata(BaseModel):
    """Common metadata structure for all MPLP objects. Provides version control, creation info, tags, and cross-cutting concern declarations. All top-level objects in L2/L3/L4 should include the meta field."""
    model_config = ConfigDict(extra="forbid")
    protocol_version: str = Field(..., description="MPLP protocol version, using Semantic Versioning.")
    schema_version: str = Field(..., description="Schema version used by the current object, using Semantic Versioning.")
    created_at: Optional[datetime] = Field(None, description="Object creation time (ISO 8601 format).")
    created_by: Optional[str] = Field(None, description="Creator identifier (User ID / Agent Name / System ID).")
    updated_at: Optional[datetime] = Field(None, description="Object last update time (ISO 8601 format).")
    updated_by: Optional[str] = Field(None, description="Last updater identifier.")
    tags: Optional[List[str]] = Field(None, description="Set of tags for indexing/search. Supports custom classification and retrieval.")
    cross_cutting: Optional[List[Literal["coordination", "error-handling", "event-bus", "orchestration", "performance", "protocol-version", "security", "state-sync", "transaction"]]] = Field(None, description="Declares cross-cutting concerns enabled for the current object (one of the 9 concerns in Governance Plane).")

