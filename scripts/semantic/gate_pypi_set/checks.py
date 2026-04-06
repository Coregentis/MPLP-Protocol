"""
Gate Checks for PyPI Publish Gate

Each function implements one governance invariant from METHOD-SDKR-08 §8.1.
These are the HARD-FAIL conditions that cannot be waived.
"""

from pathlib import Path
from typing import List, Optional
import hashlib

from .model import PythonPackage, DistArtifacts, GateCheckResult


# =============================================================================
# §8.1.2 Classification Check
# =============================================================================

def check_public_category(pkg: PythonPackage) -> GateCheckResult:
    """
    Verify package is classified as PUBLIC.
    INTERNAL and CI-ONLY packages MUST NOT be in Publish Set.
    """
    if pkg.category == "PUBLIC":
        return GateCheckResult(
            id="CLASSIFICATION",
            result="PASS",
            message=f"{pkg.name} is PUBLIC"
        )
    else:
        return GateCheckResult(
            id="CLASSIFICATION",
            result="FAIL",
            message=f"{pkg.name} has category '{pkg.category}', not PUBLIC"
        )


# =============================================================================
# §8.1.3 Derivation Proof Check
# =============================================================================

def check_derivation_proof_exists(pkg_path: Path) -> GateCheckResult:
    """
    Verify DERIVATION_PROOF.yaml exists in package directory.
    """
    proof_path = pkg_path / "DERIVATION_PROOF.yaml"
    
    if proof_path.exists():
        return GateCheckResult(
            id="DERIVATION_PROOF",
            result="PASS",
            message=f"Found {proof_path}"
        )
    else:
        return GateCheckResult(
            id="DERIVATION_PROOF",
            result="FAIL",
            message=f"Missing DERIVATION_PROOF.yaml at {pkg_path}"
        )


# =============================================================================
# §8.1.3 Distribution Artifacts Check
# =============================================================================

def check_dist_artifacts(dist_dir: Path) -> GateCheckResult:
    """
    Verify both sdist (.tar.gz) and wheel (.whl) exist.
    """
    if not dist_dir.exists():
        return GateCheckResult(
            id="ARTIFACTS",
            result="FAIL",
            message=f"Distribution directory not found: {dist_dir}"
        )
    
    files = list(dist_dir.iterdir())
    has_wheel = any(f.suffix == ".whl" for f in files)
    has_sdist = any(f.name.endswith(".tar.gz") for f in files)
    
    if has_wheel and has_sdist:
        return GateCheckResult(
            id="ARTIFACTS",
            result="PASS",
            message="Both wheel and sdist found"
        )
    else:
        missing = []
        if not has_wheel:
            missing.append("wheel")
        if not has_sdist:
            missing.append("sdist")
        return GateCheckResult(
            id="ARTIFACTS",
            result="FAIL",
            message=f"Missing distribution artifacts: {', '.join(missing)}"
        )


# =============================================================================
# §8.1.4 Version Synchronization Check
# =============================================================================

def check_version_sync(pkg_version: str, bundle_version: str) -> GateCheckResult:
    """
    Verify package version matches Release Bundle version (major.minor).
    """
    pkg_major_minor = ".".join(pkg_version.split(".")[:2])
    bundle_major_minor = ".".join(bundle_version.split(".")[:2])
    
    if pkg_major_minor == bundle_major_minor:
        return GateCheckResult(
            id="VERSION_SYNC",
            result="PASS",
            message=f"Version {pkg_version} matches bundle {bundle_version}"
        )
    else:
        return GateCheckResult(
            id="VERSION_SYNC",
            result="FAIL",
            message=f"Version mismatch: package={pkg_version}, bundle={bundle_version}"
        )


# =============================================================================
# Hash Verification (for Evidence Chain)
# =============================================================================

def compute_file_sha256(file_path: Path) -> Optional[str]:
    """Compute SHA256 hash of a file."""
    if not file_path.exists():
        return None
    
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def collect_dist_info(dist_dir: Path) -> DistArtifacts:
    """Collect distribution artifact information including hashes."""
    artifacts = DistArtifacts()
    
    if not dist_dir.exists():
        return artifacts
    
    for f in dist_dir.iterdir():
        if f.suffix == ".whl":
            artifacts.wheel_path = str(f)
            artifacts.wheel_sha256 = compute_file_sha256(f)
        elif f.name.endswith(".tar.gz"):
            artifacts.sdist_path = str(f)
            artifacts.sdist_sha256 = compute_file_sha256(f)
    
    return artifacts
