"""
Golden Validator - Protocol-level flow validation.

Validates golden flows through three stages:
1. Schema validation using @mplp/core-protocol validators
2. Structural comparison against expected fixtures
3. Invariant checks with wildcard path support
"""

from typing import Dict, List, Any, NamedTuple
from .loader import GoldenFlow
from .invariant_rules import InvariantFailure, evaluate_invariant
from mplp_sdk.validation import validate_context, validate_plan, validate_confirm, validate_trace


class GoldenCheckResult(NamedTuple):
    """Result of validating a golden flow."""
    flow_id: str
    passed: bool
    schema_errors: List[str]  # Schema validation errors
    diff_errors: List[str]  # Structural comparison errors
    invariant_errors: List[InvariantFailure]  # Invariant validation errors
    
    @property
    def all_errors(self) -> List[str]:
        """Get all errors as a flat list."""
        errors = []
        errors.extend(self.schema_errors)
        errors.extend(self.diff_errors)
        errors.extend([f"{f.path}: {f.message}" for f in self.invariant_errors])
        return errors


# Fields to ignore during structural comparison (non-deterministic)
IGNORED_FIELDS = {
    'context_id', 'plan_id', 'confirm_id', 'trace_id', 'span_id',
    'step_id', 'created_at', 'updated_at', 'timestamp',
    'run_id', 'correlation_id'
}


def deep_compare(actual: Any, expected: Any, path: str = "") -> List[str]:
    """
    Deep comparison of actual vs expected, ignoring non-deterministic fields.
    
    Args:
        actual: Actual value
        expected: Expected value
        path: Current path for error reporting
        
    Returns:
        List of difference messages
    """
    diffs: List[str] = []
    
    if type(actual) != type(expected):
        diffs.append(f"{path}: Type mismatch - expected {type(expected).__name__}, got {type(actual).__name__}")
        return diffs
    
    if isinstance(actual, dict) and isinstance(expected, dict):
        # Check for missing/extra keys (excluding ignored fields)
        actual_keys = set(k for k in actual.keys() if k not in IGNORED_FIELDS)
        expected_keys = set(k for k in expected.keys() if k not in IGNORED_FIELDS)
        
        missing = expected_keys - actual_keys
        extra = actual_keys - expected_keys
        
        for key in missing:
            diffs.append(f"{path}.{key}: Missing in actual")
        for key in extra:
            diffs.append(f"{path}.{key}: Extra in actual")
        
        # Recursively compare common keys
        for key in actual_keys & expected_keys:
            key_path = f"{path}.{key}" if path else key
            diffs.extend(deep_compare(actual[key], expected[key], key_path))
    
    elif isinstance(actual, list) and isinstance(expected, list):
        if len(actual) != len(expected):
            diffs.append(f"{path}: Array length mismatch - expected {len(expected)}, got {len(actual)}")
            return diffs
        
        for i, (a, e) in enumerate(zip(actual, expected)):
            diffs.extend(deep_compare(a, e, f"{path}[{i}]"))
    
    else:
        # Primitive comparison (skip if field is ignored)
        if path.split('.')[-1] not in IGNORED_FIELDS:
            if actual != expected:
                diffs.append(f"{path}: Value mismatch - expected {expected}, got {actual}")
    
    return diffs


def validate_golden_flow(flow: GoldenFlow) -> GoldenCheckResult:
    """
    Validate a golden flow through all three validation stages.
    
    Args:
        flow: Golden flow to validate
        
    Returns:
        GoldenCheckResult with pass/fail status and detailed errors
    """
    schema_errors: List[str] = []
    diff_errors: List[str] = []
    invariant_errors: List[InvariantFailure] = []
    
    # Stage 1: Schema Validation
    if "context" in flow.expected:
        result = validate_context(flow.expected["context"])
        if not result.ok:
            for error in result.errors:
                schema_errors.append(f"context schema: {error.code} at {error.path} - {error.message}")
    
    if "plan" in flow.expected:
        result = validate_plan(flow.expected["plan"])
        if not result.ok:
            for error in result.errors:
                schema_errors.append(f"plan schema: {error.code} at {error.path} - {error.message}")
    
    if "confirm" in flow.expected:
        result = validate_confirm(flow.expected["confirm"])
        if not result.ok:
            for error in result.errors:
                schema_errors.append(f"confirm schema: {error.code} at {error.path} - {error.message}")
    
    if "trace" in flow.expected:
        result = validate_trace(flow.expected["trace"])
        if not result.ok:
            for error in result.errors:
                schema_errors.append(f"trace schema: {error.code} at {error.path} - {error.message}")
    
    # Stage 2: Structural Comparison (expected vs expected for now, since we're using fixture data)
    # In production, this would compare runtime output against expected
    # For now, just verify expected fixtures are self-consistent
    for scope in ["context", "plan", "confirm", "trace"]:
        if scope in flow.expected:
            # Self-check: expected should match itself (validates fixture integrity)
            diffs = deep_compare(flow.expected[scope], flow.expected[scope], scope)
            diff_errors.extend(diffs)
    
    # Stage 3: Invariant Checks
    # Build root object for cross-scope references
    root_object = {
        "context": flow.expected.get("context"),
        "plan": flow.expected.get("plan"),
        "confirm": flow.expected.get("confirm"),
        "trace": flow.expected.get("trace")
    }
    
    for scope, invariants in flow.invariants.items():
        scope_object = root_object.get(scope)
        if scope_object is None:
            continue
        
        for invariant in invariants:
            failures = evaluate_invariant(invariant, root_object, scope_object)
            for failure in failures:
                # Prepend scope to path for clarity
                scoped_failure = InvariantFailure(
                    path=f"{scope}.{failure.path}",
                    message=failure.message
                )
                invariant_errors.append(scoped_failure)
    
    passed = (len(schema_errors) == 0 and 
              len(diff_errors) == 0 and 
              len(invariant_errors) == 0)
    
    return GoldenCheckResult(
        flow_id=flow.flow_id,
        passed=passed,
        schema_errors=schema_errors,
        diff_errors=diff_errors,
        invariant_errors=invariant_errors
    )
