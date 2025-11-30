from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Annotated
from pydantic import Field

Uuid = Annotated[str, Field(pattern=r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")]

