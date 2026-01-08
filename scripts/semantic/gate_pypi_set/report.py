"""
Evidence Output for PyPI Publish Gate

Responsible for writing standardized gate artifacts.
"""

import json
from pathlib import Path
from typing import Any, Dict


def write_json(path: Path, data: Dict[str, Any]) -> None:
    """Write JSON to file, creating parent directories as needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_pypi_set(output_dir: Path, pypi_set: Dict[str, Any]) -> Path:
    """Write pypi-set.json artifact."""
    path = output_dir / "pypi-set.json"
    write_json(path, pypi_set)
    return path


def write_gate_report(output_dir: Path, report: Dict[str, Any]) -> Path:
    """Write pypi-gate-report.json artifact."""
    path = output_dir / "pypi-gate-report.json"
    write_json(path, report)
    return path
