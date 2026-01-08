#!/usr/bin/env python3
"""
MPLP PyPI Publish Gate - CLI Entry Point

Reference Implementation for METHOD-SDKR-08 §8.1.5 / §8.1.6

Usage:
    python -m gate_pypi_set
    # or
    python scripts/semantic/gate_pypi_set/main.py

Exit Codes:
    0 = PASS (all packages in publish set are valid)
    1 = FAIL (violations found - release blocked)

Output:
    artifacts/release/pypi-set.json
    artifacts/release/pypi-gate-report.json

© 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
"""

import sys
from datetime import datetime, timezone
from pathlib import Path

from .model import PythonPackage, GateReport, GateCheckResult, PyPISet
from .loader import load_pyproject, load_bundle_manifest
from .checks import (
    check_public_category,
    check_derivation_proof_exists,
    check_dist_artifacts,
    check_version_sync,
)
from .report import write_pypi_set, write_gate_report


# =============================================================================
# Configuration
# =============================================================================

ROOT_DIR = Path(__file__).parent.parent.parent.parent  # scripts/semantic/gate_pypi_set -> root
PYPI_PACKAGES_DIR = ROOT_DIR / "packages" / "pypi"
ARTIFACT_DIR = ROOT_DIR / "artifacts" / "release"
BUNDLE_MANIFEST_PATH = ARTIFACT_DIR / "RELEASE_BUNDLE_MANIFEST.json"

GATE_NAME = "pypi-publish-gate"


# =============================================================================
# Main Gate Logic
# =============================================================================

def discover_packages() -> list[PythonPackage]:
    """
    Automatically discover Python packages in packages/pypi/.
    Manual specification of publish targets is NOT permitted.
    """
    packages = []
    
    if not PYPI_PACKAGES_DIR.exists():
        print(f"Warning: {PYPI_PACKAGES_DIR} does not exist")
        return packages
    
    for pkg_dir in PYPI_PACKAGES_DIR.iterdir():
        if not pkg_dir.is_dir():
            continue
        
        pyproject_path = pkg_dir / "pyproject.toml"
        if not pyproject_path.exists():
            continue
        
        try:
            pyproject = load_pyproject(pyproject_path)
            project = pyproject.get("project", {})
            tool_mplp = pyproject.get("tool", {}).get("mplp", {})
            
            # Determine category from tool.mplp or default to PUBLIC
            # (Python packages without explicit category are assumed PUBLIC
            # since private packages wouldn't be in packages/pypi/)
            category = "PUBLIC"
            if tool_mplp.get("ci_only"):
                category = "CI-ONLY"
            elif tool_mplp.get("internal"):
                category = "INTERNAL"
            
            packages.append(PythonPackage(
                name=project.get("name", pkg_dir.name),
                version=project.get("version", "0.0.0"),
                path=str(pkg_dir),
                category=category
            ))
        except Exception as e:
            print(f"Error loading {pyproject_path}: {e}")
    
    return packages


def run_gate() -> int:
    """
    Execute the PyPI Publish Gate.
    Returns exit code (0 = PASS, 1 = FAIL).
    """
    print("=" * 60)
    print("MPLP PyPI Publish Gate - METHOD-SDKR-08 §8.1.5")
    print("=" * 60)
    
    checks: list[GateCheckResult] = []
    violations: list[str] = []
    
    # 1. Load bundle manifest (if exists)
    bundle_version = "1.0.0"  # Default
    bundle = load_bundle_manifest(BUNDLE_MANIFEST_PATH)
    if bundle:
        bundle_version = bundle.get("bundle_version", bundle_version)
        print(f"\nBundle Version: {bundle_version}")
    else:
        print(f"\nWarning: Bundle manifest not found at {BUNDLE_MANIFEST_PATH}")
        print("Using default version for validation")
    
    # 2. Discover packages (automatic - manual specification forbidden)
    packages = discover_packages()
    print(f"\nDiscovered {len(packages)} Python package(s):")
    
    # 3. Build Publish Set (filter to PUBLIC only)
    publish_set = PyPISet()
    
    for pkg in packages:
        print(f"\n  Checking: {pkg.name} ({pkg.category})")
        
        pkg_path = Path(pkg.path)
        dist_dir = pkg_path / "dist"
        
        # Check 1: Classification
        classification_result = check_public_category(pkg)
        checks.append(classification_result)
        if classification_result.result == "FAIL":
            violations.append(f"Classification: {pkg.name}")
            print(f"    [BLOCKED] {classification_result.message}")
            continue
        
        # Only PUBLIC packages proceed to further checks
        publish_set.packages.append(pkg)
        
        # Check 2: Derivation Proof
        proof_result = check_derivation_proof_exists(pkg_path)
        checks.append(proof_result)
        if proof_result.result == "FAIL":
            violations.append(f"Derivation Proof: {pkg.name}")
            print(f"    [FAIL] {proof_result.message}")
        else:
            print(f"    [PASS] {proof_result.message}")
        
        # Check 3: Distribution Artifacts
        dist_result = check_dist_artifacts(dist_dir)
        checks.append(dist_result)
        if dist_result.result == "FAIL":
            violations.append(f"Artifacts: {pkg.name}")
            print(f"    [FAIL] {dist_result.message}")
        else:
            print(f"    [PASS] {dist_result.message}")
        
        # Check 4: Version Sync
        version_result = check_version_sync(pkg.version, bundle_version)
        checks.append(version_result)
        if version_result.result == "FAIL":
            violations.append(f"Version Sync: {pkg.name}")
            print(f"    [FAIL] {version_result.message}")
        else:
            print(f"    [PASS] {version_result.message}")
    
    # 4. Determine status
    status = "PASS" if not violations else "FAIL"
    
    # 5. Generate report
    report = GateReport(
        gate=GATE_NAME,
        timestamp=datetime.now(timezone.utc).isoformat(),
        bundle_version=bundle_version,
        status=status,
        checks=checks,
        violations=violations
    )
    
    # 6. Write artifacts
    write_pypi_set(ARTIFACT_DIR, publish_set.to_dict())
    write_gate_report(ARTIFACT_DIR, report.to_dict())
    
    # 7. Print summary
    print("\n" + "=" * 60)
    print("GATE SUMMARY")
    print("=" * 60)
    print(f"  Total packages:     {len(packages)}")
    print(f"  In Publish Set:     {len(publish_set.packages)}")
    print(f"  Checks performed:   {len(checks)}")
    print(f"  Violations:         {len(violations)}")
    print(f"")
    print(f"  Output: {ARTIFACT_DIR}/")
    print("")
    
    if status == "FAIL":
        print("❌ GATE FAIL: Violations detected!")
        for v in violations:
            print(f"   - {v}")
        print("")
        print("   This gate is NOT waivable.")
        print("   See: METHOD-SDKR-08 §8.1.5")
        return 1
    
    print("✅ GATE PASS: All packages in Publish Set are valid.")
    print("")
    print(f"   Publish Set: {', '.join(p.name for p in publish_set.packages)}")
    return 0


def main():
    """CLI entry point."""
    sys.exit(run_gate())


if __name__ == "__main__":
    main()
