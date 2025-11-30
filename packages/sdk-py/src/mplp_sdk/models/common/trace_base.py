from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from mplp_sdk.models.common.identifiers import Uuid
from typing import Optional
from pydantic import Field
from typing import Dict, Any

class TraceBase(BaseModel):
    """Common base fields for Trace / Span structures. Designed based on W3C Trace Context standard, providing a unified tracing context for the MPLP execution chain. Supports distributed tracing and parent-child relationships of execution steps."""
    model_config = ConfigDict(extra="forbid")
    trace_id: Uuid = Field(..., description="Identifier for a complete execution chain. All related Spans share the same trace_id.")
    span_id: Uuid = Field(..., description="Identifier for the current step or operation. Each Span has a unique span_id.")
    parent_span_id: Optional[Uuid] = Field(None, description="Identifier of the parent step's span_id. Can be omitted if it is a root span.")
    context_id: Optional[Uuid] = Field(None, description="Identifier of the Context Root. Associates the Trace with a specific project context.")
    attributes: Optional[Dict[str, Any]] = Field(None, description="Additional attributes (key-value pairs) to extend trace information. Can contain custom metadata, tags, etc.")

