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
from typing import Literal

class MplpId(BaseModel):
    """MplpId"""
    model_config = ConfigDict(extra="allow")

class Ref(BaseModel):
    """A standard reference to another MPLP object."""
    model_config = ConfigDict(extra="forbid")
    id: MplpId = Field(..., description="")
    module: Literal["context", "plan", "confirm", "trace", "role", "extension", "dialog", "collab", "core", "network"] = Field(..., description="The module name of the referenced object.")
    description: Optional[str] = Field(None, description="Optional description of the reference relationship.")

class BaseMeta(BaseModel):
    """BaseMeta"""
    model_config = ConfigDict(extra="allow")

class CommonTypes(BaseModel):
    """Common type definitions used across MPLP modules to ensure consistency and reduce duplication."""
    model_config = ConfigDict(extra="allow")

