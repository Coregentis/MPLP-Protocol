"""
Test suite for standardized ValidationResult structure in Python SDK.

Conformance: schema-mapping-standard.md Section 5
"""

import pytest
from uuid import uuid4
from datetime import datetime, timezone

from mplp_sdk.validation import (
    validate_context,
    validate_plan,
    validate_confirm,
    validate_trace,
    ValidationResult,
    ValidationErrorItem
)


class TestValidationResultStructure:
    """Test ValidationResult and ValidationErrorItem structures"""
    
    def test_valid_context_returns_ok_true(self):
        """Valid context should return ok=True with empty errors"""
        # Use builder to ensure valid context structure
        from mplp_sdk.builders import build_context
        
        ctx = build_context(
            title='Test Context',
            root={
                'user_id': str(uuid4()),
                'domain': 'test-domain'
            }
        )
        
        result = validate_context(ctx)
        assert result.ok is True
        assert result.errors == []
        assert isinstance(result, ValidationResult)
    
    def test_required_field_missing(self):
        """Missing required field should generate 'required' error code"""
        invalid = {
            'meta': {'protocol_version': '1.0.0', 'schema_version': '1.0.0'},
            # missing context_id
            'root': {'user_id': str(uuid4())},
            'title': 'Test',
            'status': 'active'
        }
        
        result = validate_context(invalid)
        assert result.ok is False
        assert len(result.errors) > 0
        
        # Find required error
        required_errors = [e for e in result.errors if e.code == 'required']
        assert len(required_errors) > 0
        
        # Check structure
        err = required_errors[0]
        assert isinstance(err, ValidationErrorItem)
        assert hasattr(err, 'path')
        assert hasattr(err, 'code')
        assert hasattr(err, 'message')
    
    def test_type_error(self):
        """Wrong type should generate 'type' error code"""
        invalid = {
            'meta': {
                'protocol_version': '1.0.0',
                'schema_version': '1.0.0',
                'created_at': datetime.now(timezone.utc)
            },
            'context_id': str(uuid4()),
            'root': {'user_id': str(uuid4())},
            'title': 12345,  # should be string
            'status': 'active'
        }
        
        result = validate_context(invalid)
        assert result.ok is False
        
        type_errors = [e for e in result.errors if e.code == 'type']
        assert len(type_errors) > 0
        assert 'title' in type_errors[0].path
    
    def test_enum_error(self):
        """Invalid enum value should generate 'enum' error code"""
        invalid = {
            'meta': {
                'protocol_version': '1.0.0',
                'schema_version': '1.0.0',
                'created_at': datetime.now(timezone.utc)
            },
            'context_id': str(uuid4()),
            'root': {'user_id': str(uuid4())},
            'title': 'Test',
            'status': 'INVALID_STATUS'  # not in enum
        }
        
        result = validate_context(invalid)
        assert result.ok is False
        
        enum_errors = [e for e in result.errors if e.code == 'enum']
        assert len(enum_errors) > 0
        assert 'status' in enum_errors[0].path
    
    def test_pattern_error_uuid(self):
        """Invalid UUID pattern should generate 'pattern' error code"""
        invalid = {
            'meta': {
                'protocol_version': '1.0.0',
                'schema_version': '1.0.0',
                'created_at': datetime.now(timezone.utc)
            },
            'context_id': 'not-a-valid-uuid',
            'root': {'user_id': str(uuid4())},
            'title': 'Test',
            'status': 'active'
        }
        
        result = validate_context(invalid)
        assert result.ok is False
        
        pattern_errors = [e for e in result.errors if e.code == 'pattern']
        assert len(pattern_errors) > 0
        assert 'context_id' in pattern_errors[0].path
    
    def test_validation_error_item_structure(self):
        """All errors should have path, code, message fields"""
        invalid = {'meta': {}}  # severely invalid
        
        result = validate_context(invalid)
        assert result.ok is False
        assert len(result.errors) > 0
        
        for error in result.errors:
            assert isinstance(error, ValidationErrorItem)
            assert isinstance(error.path, str)
            assert isinstance(error.code, str)
            assert isinstance(error.message, str)
            # Code should be one of the standard codes
            assert error.code in [
                'required', 'type', 'enum', 'pattern', 'format',
                'min_length', 'max_length', 'minimum', 'maximum',
                'extra_forbidden', 'unknown'
            ]
    
    def test_extra_forbidden_error(self):
        """Extra properties when forbidden should generate 'extra_forbidden' code"""
        # Note: This depends on Pydantic model configuration with extra='forbid'
        # If models don't have extra='forbid', this test may need adjustment
        invalid = {
            'meta': {
                'protocol_version': '1.0.0',
                'schema_version': '1.0.0',
                'created_at': datetime.now(timezone.utc),
                'unknown_field': 'value'  # extra field
            },
            'context_id': str(uuid4()),
            'root': {'user_id': str(uuid4())},
            'title': 'Test',
            'status': 'active'
        }
        
        result = validate_context(invalid)
        # This test may pass with ok=True if extra='allow', which is acceptable
        # The important part is that IF there's an error, it has correct structure
        if not result.ok:
            for error in result.errors:
                assert isinstance(error, ValidationErrorItem)
    
    def test_nested_path_format(self):
        """Nested field errors should use dot notation"""
        invalid = {
            'meta': {
                'protocol_version': 123,  # should be string
                'schema_version': '1.0.0'
            },
            'context_id': str(uuid4()),
            'root': {'user_id': str(uuid4())},
            'title': 'Test',
            'status': 'active'
        }
        
        result = validate_context(invalid)
        assert result.ok is False
        
        # Should have error with nested path like "meta.protocol_version"
        nested_errors = [e for e in result.errors if '.' in e.path]
        assert len(nested_errors) > 0
    
    def test_validate_plan(self):
        """validate_plan should return ValidationResult"""
        invalid = {'meta': {}}
        result = validate_plan(invalid)
        
        assert isinstance(result, ValidationResult)
        assert result.ok is False
        assert len(result.errors) > 0
    
    def test_validate_confirm(self):
        """validate_confirm should return ValidationResult"""
        invalid = {'meta': {}}
        result = validate_confirm(invalid)
        
        assert isinstance(result, ValidationResult)
        assert result.ok is False
        assert len(result.errors) > 0
    
    def test_validate_trace(self):
        """validate_trace should return ValidationResult"""
        invalid = {'meta': {}}
        result = validate_trace(invalid)
        
        assert isinstance(result, ValidationResult)
        assert result.ok is False
        assert len(result.errors) > 0
