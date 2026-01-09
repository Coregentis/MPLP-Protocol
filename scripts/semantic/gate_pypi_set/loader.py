"""
Fact Loaders for PyPI Publish Gate

Responsible for reading and parsing configuration files.
Uses standard library where possible for maximum portability.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional

# Python 3.11+ has tomllib in stdlib
try:
    import tomllib
except ImportError:
    import tomli as tomllib  # fallback for 3.10

try:
    import yaml
except ImportError:
    yaml = None  # Will fail gracefully if YAML files need parsing


def load_pyproject(path: Path) -> Dict[str, Any]:
    """Load and parse pyproject.toml."""
    with open(path, "rb") as f:
        return tomllib.load(f)


def load_derivation_proof(path: Path) -> Optional[Dict[str, Any]]:
    """Load DERIVATION_PROOF.yaml if it exists."""
    if not path.exists():
        return None
    
    if yaml is None:
        raise RuntimeError("PyYAML is required to parse DERIVATION_PROOF.yaml")
    
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_bundle_manifest(path: Path) -> Optional[Dict[str, Any]]:
    """Load RELEASE_BUNDLE_MANIFEST.json if it exists."""
    if not path.exists():
        return None
    
    return json.loads(path.read_text(encoding="utf-8"))


def load_json(path: Path) -> Optional[Dict[str, Any]]:
    """Generic JSON loader."""
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))
