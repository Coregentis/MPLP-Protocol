# MPLP v1.0.0 FROZEN
# Governance: MPGC

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class Context:
    id: str
    user: Dict[str, Any] = field(default_factory=dict)
    state: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Plan:
    id: str
    steps: List[Dict[str, Any]] = field(default_factory=list)
