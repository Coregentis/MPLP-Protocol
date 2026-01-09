"""
Data Models for PyPI Publish Gate

These models are NORMATIVE and designed for 1:1 translation to Go/Rust.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any


@dataclass
class PythonPackage:
    """Represents a Python package in the publish set."""
    name: str
    version: str
    path: str
    category: str  # PUBLIC / INTERNAL / CI-ONLY
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DistArtifacts:
    """Python distribution artifacts (wheel + sdist)."""
    sdist_path: Optional[str] = None
    wheel_path: Optional[str] = None
    sdist_sha256: Optional[str] = None
    wheel_sha256: Optional[str] = None
    
    @property
    def has_sdist(self) -> bool:
        return self.sdist_path is not None
    
    @property
    def has_wheel(self) -> bool:
        return self.wheel_path is not None
    
    @property
    def is_complete(self) -> bool:
        return self.has_sdist and self.has_wheel


@dataclass
class GateCheckResult:
    """Result of a single gate check."""
    id: str
    result: str  # PASS / FAIL
    message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        d = {"id": self.id, "result": self.result}
        if self.message:
            d["message"] = self.message
        return d


@dataclass
class GateReport:
    """Complete gate verification report."""
    gate: str
    timestamp: str
    bundle_version: str
    status: str  # PASS / FAIL
    checks: List[GateCheckResult] = field(default_factory=list)
    violations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "gate": self.gate,
            "timestamp": self.timestamp,
            "bundleVersion": self.bundle_version,
            "status": self.status,
            "checks": [c.to_dict() for c in self.checks],
            "violations": self.violations
        }


@dataclass
class PyPISet:
    """Python Publish Set - the computed set of packages to publish."""
    ecosystem: str = "pypi"
    packages: List[PythonPackage] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "ecosystem": self.ecosystem,
            "packages": [p.to_dict() for p in self.packages]
        }
