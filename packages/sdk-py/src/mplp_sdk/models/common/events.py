from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from mplp_sdk.models.common.identifiers import Uuid
from typing import Optional
from pydantic import Field
from datetime import datetime
from typing import Dict, Any
from typing import Any
from typing import Union

class Event(BaseModel):
    """Base model for all event structures in MPLP. Designed based on CloudEvents v1.0 core fields, providing unified event identification, type, source, and timestamp. ExecutionEvent, StateTransitionEvent, etc., are extensions of this."""
    model_config = ConfigDict(extra="forbid")
    event_id: Uuid = Field(..., description="Unique identifier for the event (UUID v4).")
    event_type: str = Field(..., description="Event type identifier, e.g., execution.started / vsl.transition.applied / plan.created. Uses dot-separated namespace format.")
    source: str = Field(..., description="Event source, typically a module or component identifier. Can be a module name (e.g., 'context') or component path (e.g., 'runtime.ael').")
    timestamp: datetime = Field(..., description="Event occurrence time (ISO 8601 format).")
    trace_id: Optional[Uuid] = Field(None, description="Optional trace ID to associate the event with a specific Trace.")
    data: Optional[Union[Dict[str, Any], Any]] = Field(None, description="")

