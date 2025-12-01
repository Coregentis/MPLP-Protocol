# Copyright 2025 邦士（北京）网络科技有限公司.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Invariant rule evaluation engine - Protocol-level validation rules.

Implements all invariant rules semantically aligned with TypeScript golden-validator.ts.
Each rule is a pure function that validates a single constraint.
"""

import re
from typing import List, Any, Dict, NamedTuple
from datetime import datetime


class Invariant(NamedTuple):
    """Invariant definition from YAML."""
    id: str
    path: str
    rule: str
    description: str = ""
    scope: str = ""


class InvariantFailure(NamedTuple):
    """Invariant validation failure."""
    path: str
    message: str


def is_uuid_v4(value: Any) -> bool:
    """Check if value is a valid UUID v4."""
    if not isinstance(value, str):
        return False
    # UUID v4 regex (case-insensitive)
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    return re.match(pattern, value, re.IGNORECASE) is not None


def is_non_empty_string(value: Any) -> bool:
    """Check if value is a non-empty string (after stripping whitespace)."""
    return isinstance(value, str) and len(value.strip()) > 0


def is_exists(value: Any) -> bool:
    """Check if value exists (not None)."""
    return value is not None


def is_iso_datetime(value: Any) -> bool:
    """Check if value is a valid ISO 8601 datetime string."""
    if not isinstance(value, str):
        return False
    try:
        datetime.fromisoformat(value.replace('Z', '+00:00'))
        return True
    except (ValueError, AttributeError):
        return False


def get_eq_expected_value(rule: str, root_object: Dict[str, Any]) -> Any:
    """
    Extract expected value from eq() rule.
    
    Supports:
    - eq("literal-string") - matches literal string
    - eq(context.context_id) - matches value at path in root_object
    
    Args:
        rule: Rule string like 'eq("1.0.0")' or 'eq(context.context_id)'
        root_object: Root object for path resolution
        
    Returns:
        Expected value to compare against
    """
    if not rule.startswith('eq(') or not rule.endswith(')'):
        raise ValueError(f"Invalid eq rule: {rule}")
    
    arg = rule[3:-1]  # Extract content between eq( and )
    
    # Check if it's a quoted string literal
    if arg.startswith('"') and arg.endswith('"'):
        return arg[1:-1]  # Remove quotes
    
    # Otherwise, it's a path - resolve from root_object
    from .path_utils import get_value_nodes_by_path
    nodes = get_value_nodes_by_path(root_object, arg)
    if nodes:
        return nodes[0].value
    return None


def evaluate_invariant(
    invariant: Invariant,
    root_object: Dict[str, Any],
    scope_object: Any
) -> List[InvariantFailure]:
    """
    Evaluate an invariant against a scope object.
    
    Uses wildcard path expansion to evaluate invariant against all matching nodes.
    Returns a failure for each node that doesn't satisfy the rule.
    
    Args:
        invariant: Invariant to evaluate
        root_object: Complete flow object (for eq() cross-references)
        scope_object: Scoped object to validate (e.g., plan JSON)
        
    Returns:
        List of InvariantFailure for nodes that failed validation
    """
    from .path_utils import get_value_nodes_by_path
    
    failures: List[InvariantFailure] = []
    
    # Get all nodes matching the path (with wildcard expansion)
    nodes = get_value_nodes_by_path(scope_object, invariant.path)
    
    if not nodes:
        # Path not found - might be expected for optional fields
        return failures
    
    for node in nodes:
        passed = True
        error_msg = ""
        
        if invariant.rule == "uuid-v4":
            if not is_uuid_v4(node.value):
                passed = False
                error_msg = f"Expected UUID v4, got {node.value}"
                
        elif invariant.rule == "non-empty-string":
            if not is_non_empty_string(node.value):
                passed = False
                error_msg = "Expected non-empty string"
                
        elif invariant.rule == "exists":
            if not is_exists(node.value):
                passed = False
                error_msg = "Expected value to exist"
                
        elif invariant.rule == "iso-datetime":
            if not is_iso_datetime(node.value):
                passed = False
                error_msg = f"Expected ISO datetime, got {node.value}"
                
        elif invariant.rule.startswith("eq("):
            try:
                expected_val = get_eq_expected_value(invariant.rule, root_object)
                if node.value != expected_val:
                    passed = False
                    error_msg = f"Expected {expected_val}, got {node.value}"
            except Exception as e:
                passed = False
                error_msg = f"eq() evaluation failed: {e}"
                
        elif invariant.rule.startswith("min-length(") and invariant.rule.endswith(")"):
            # New rule: min-length(N) - for arrays or strings
            try:
                arg = invariant.rule[len("min-length("):-1]
                min_len = int(arg)
                
                if isinstance(node.value, (list, str)):
                    actual_len = len(node.value)
                    if actual_len < min_len:
                        passed = False
                        error_msg = f"Expected min length {min_len}, got {actual_len}"
                else:
                    passed = False
                    error_msg = f"min-length applicable only to list/str, got {type(node.value).__name__}"
            except ValueError as e:
                passed = False
                error_msg = f"Invalid min-length argument: {invariant.rule}"
                
        elif invariant.rule.startswith("enum(") and invariant.rule.endswith(")"):
            # New rule: enum(val1,val2,val3)
            try:
                raw = invariant.rule[len("enum("):-1]
                allowed = [item.strip() for item in raw.split(",") if item.strip()]
                allowed_set = set(allowed)
                
                if node.value not in allowed_set:
                    passed = False
                    error_msg = f"Expected one of {sorted(allowed_set)}, got {node.value!r}"
            except Exception as e:
                passed = False
                error_msg = f"enum() evaluation failed: {e}"
        
        if not passed:
            failures.append(InvariantFailure(
                path=node.path,
                message=f"Invariant {invariant.id} failed: {error_msg}"
            ))
    
    return failures

