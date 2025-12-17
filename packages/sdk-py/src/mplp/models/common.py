# MPLP v1.0.0 FROZEN
# Governance: MPGC

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class Metadata(BaseModel):
    protocol_version: str
    schema_version: str
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    tags: Optional[List[str]] = None
    cross_cutting: Optional[Dict[str, Any]] = None
    extra: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        extra = "allow"
