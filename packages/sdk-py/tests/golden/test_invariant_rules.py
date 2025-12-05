# MPLP v1.0.0 FROZEN
# Governance: MPGC

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
Unit tests for invariant_rules - Protocol-level rule validation.

Tests semantic alignment with TypeScript golden-validator.ts rule implementations.
"""

import pytest
from .harness.invariant_rules import (
    Invariant, InvariantFailure,
    is_uuid_v4, is_non_empty_string, is_exists, is_iso_datetime,
    get_eq_expected_value, evaluate_invariant
)


class TestRuleValidators:
    """Test individual rule validator functions."""
    
    def test_is_uuid_v4_valid(self):
        """Valid UUID v4 passes."""
        assert is_uuid_v4("550e8400-e29b-41d4-a716-446655440000")
        assert is_uuid_v4("550E8400-E29B-41D4-A716-446655440000")  # case-insensitive
    
    def test_is_uuid_v4_invalid(self):
        """Invalid UUIDs fail."""
        assert not is_uuid_v4("not-a-uuid")
        assert not is_uuid_v4("550e8400-e29b-51d4-a716-446655440000")  # wrong version
        assert not is_uuid_v4(123)  # not a string
        assert not is_uuid_v4(None)
    
    def test_is_non_empty_string_valid(self):
        """Non-empty strings pass."""
        assert is_non_empty_string("valid string")
        assert is_non_empty_string("a")
    
    def test_is_non_empty_string_invalid(self):
        """Empty or whitespace-only strings fail."""
        assert not is_non_empty_string("")
        assert not is_non_empty_string("   ")
        assert not is_non_empty_string("\t\n")
        assert not is_non_empty_string(123)  # not a string
    
    def test_is_exists_valid(self):
        """Any non-None value passes."""
        assert is_exists("string")
        assert is_exists(0)
        assert is_exists(False)
        assert is_exists([])
    
    def test_is_exists_invalid(self):
        """None fails."""
        assert not is_exists(None)
    
    def test_is_iso_datetime_valid(self):
        """Valid ISO 8601 datetimes pass."""
        assert is_iso_datetime("2025-01-01T00:00:00.000Z")
        assert is_iso_datetime("2025-01-01T00:00:00+00:00")
        assert is_iso_datetime("2025-01-01T00:00:00")
    
    def test_is_iso_datetime_invalid(self):
        """Invalid datetime strings fail."""
        assert not is_iso_datetime("not-a-date")
        assert not is_iso_datetime("2025-13-01")  # invalid month
        assert not is_iso_datetime(123)  # not a string


class TestEqRule:
    """Test eq() rule parsing and evaluation."""
    
    def test_eq_literal_string(self):
        """Extract literal string from eq("...")."""
        val = get_eq_expected_value('eq("1.0.0")', {})
        assert val == "1.0.0"
    
    def test_eq_path_reference(self):
        """Extract value from path reference."""
        root = {"context": {"context_id": "abc-123"}}
        val = get_eq_expected_value('eq(context.context_id)', root)
        assert val == "abc-123"
    
    def test_eq_invalid_syntax(self):
        """Raise error on invalid eq() syntax."""
        with pytest.raises(ValueError, match="Invalid eq rule"):
            get_eq_expected_value('invalid', {})


class TestEvaluateInvariant:
    """Test invariant evaluation against objects."""
    
    def test_uuid_v4_passes(self):
        """UUID v4 invariant passes for valid UUID."""
        inv = Invariant(
            id="test_uuid",
            path="plan_id",
            rule="uuid-v4"
        )
        obj = {"plan_id": "550e8400-e29b-41d4-a716-446655440000"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_uuid_v4_fails(self):
        """UUID v4 invariant fails for invalid UUID."""
        inv = Invariant(
            id="test_uuid",
            path="plan_id",
            rule="uuid-v4"
        )
        obj = {"plan_id": "not-a-uuid"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert "test_uuid" in failures[0].message
        assert "Expected UUID v4" in failures[0].message
    
    def test_non_empty_string_passes(self):
        """Non-empty string invariant passes."""
        inv = Invariant(
            id="test_non_empty",
            path="title",
            rule="non-empty-string"
        )
        obj = {"title": "Valid Title"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_non_empty_string_fails(self):
        """Non-empty string invariant fails for empty string."""
        inv = Invariant(
            id="test_non_empty",
            path="title",
            rule="non-empty-string"
        )
        obj = {"title": "   "}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
    
    def test_wildcard_all_pass(self):
        """Wildcard path with all passing values."""
        inv = Invariant(
            id="test_wildcard",
            path="steps[*].description",
            rule="non-empty-string"
        )
        obj = {"steps": [{"description": "A"}, {"description": "B"}]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_wildcard_one_fails(self):
        """Wildcard path with one failing value."""
        inv = Invariant(
            id="test_wildcard",
            path="steps[*].description",
            rule="non-empty-string"
        )
        obj = {"steps": [{"description": "A"}, {"description": ""}]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert failures[0].path == "steps[1].description"
    
    def test_eq_literal_passes(self):
        """eq() with literal value passes."""
        inv = Invariant(
            id="test_eq",
            path="meta.protocol_version",
            rule='eq("1.0.0")'
        )
        obj = {"meta": {"protocol_version": "1.0.0"}}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_eq_path_passes(self):
        """eq() with path reference passes."""
        inv = Invariant(
            id="test_eq",
            path="context_id",
            rule='eq(context.context_id)',
            scope="plan"
        )
        root = {"context": {"context_id": "abc-123"}, "plan": {"context_id": "abc-123"}}
        scope_obj = root["plan"]
        failures = evaluate_invariant(inv, root, scope_obj)
        assert len(failures) == 0
    
    def test_eq_path_fails(self):
        """eq() with path reference fails on mismatch."""
        inv = Invariant(
            id="test_eq",
            path="context_id",
            rule='eq(context.context_id)',
            scope="plan"
        )
        root = {"context": {"context_id": "abc-123"}, "plan": {"context_id": "xyz-789"}}
        scope_obj = root["plan"]
        failures = evaluate_invariant(inv, root, scope_obj)
        assert len(failures) == 1
        assert "Expected abc-123" in failures[0].message


class TestMinLengthRule:
    """Test min-length(N) rule for arrays and strings."""
    
    def test_min_length_list_passes(self):
        """List with sufficient length passes."""
        inv = Invariant(
            id="test_min_len",
            path="items",
            rule="min-length(3)"
        )
        obj = {"items": [1, 2, 3]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_min_length_list_exact(self):
        """List with exact minimum length passes."""
        inv = Invariant(
            id="test_min_len",
            path="items",
            rule="min-length(2)"
        )
        obj = {"items": [1, 2]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_min_length_list_fails(self):
        """List shorter than minimum fails."""
        inv = Invariant(
            id="test_min_len",
            path="items",
            rule="min-length(5)"
        )
        obj = {"items": [1, 2, 3]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert "Expected min length 5, got 3" in failures[0].message
    
    def test_min_length_string_passes(self):
        """String with sufficient length passes."""
        inv = Invariant(
            id="test_min_len",
            path="text",
            rule="min-length(5)"
        )
        obj = {"text": "hello world"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_min_length_string_fails(self):
        """String shorter than minimum fails."""
        inv = Invariant(
            id="test_min_len",
            path="text",
            rule="min-length(10)"
        )
        obj = {"text": "short"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert "Expected min length 10, got 5" in failures[0].message
    
    def test_min_length_wrong_type(self):
        """Non-list/string type fails with appropriate message."""
        inv = Invariant(
            id="test_min_len",
            path="number",
            rule="min-length(3)"
        )
        obj = {"number": 123}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert "min-length applicable only to list/str" in failures[0].message


class TestEnumRule:
    """Test enum(...) rule for value constraints."""
    
    def test_enum_passes(self):
        """Value in allowed set passes."""
        inv = Invariant(
            id="test_enum",
            path="status",
            rule="enum(pending,active,completed)"
        )
        obj = {"status": "active"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_enum_fails(self):
        """Value not in allowed set fails."""
        inv = Invariant(
            id="test_enum",
            path="status",
            rule="enum(pending,active,completed)"
        )
        obj = {"status": "unknown"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert "Expected one of" in failures[0].message
        assert "unknown" in failures[0].message
    
    def test_enum_with_whitespace(self):
        """Enum values with whitespace are trimmed."""
        inv = Invariant(
            id="test_enum",
            path="status",
            rule="enum( pending , active , completed )"
        )
        obj = {"status": "pending"}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_enum_wildcard_all_pass(self):
        """Enum with wildcard path - all values pass."""
        inv = Invariant(
            id="test_enum",
            path="steps[*].status",
            rule="enum(pending,completed)"
        )
        obj = {"steps": [{"status": "pending"}, {"status": "completed"}, {"status": "pending"}]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 0
    
    def test_enum_wildcard_one_fails(self):
        """Enum with wildcard path - one value fails."""
        inv = Invariant(
            id="test_enum",
            path="steps[*].status",
            rule="enum(pending,completed)"
        )
        obj = {"steps": [{"status": "pending"}, {"status": "invalid"}, {"status": "completed"}]}
        failures = evaluate_invariant(inv, {}, obj)
        assert len(failures) == 1
        assert failures[0].path == "steps[1].status"
        assert "invalid" in failures[0].message
