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

