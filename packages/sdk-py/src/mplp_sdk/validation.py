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
MPLP SDK Validation Module

Provides standardized validation functions for all MPLP protocol objects.
Returns structured ValidationResult for consistent error handling across languages.

Conformance: schema-mapping-standard.md Section 5
"""

from typing import NamedTuple, List, Union, Type
from pydantic import ValidationError, BaseModel
from .models import Context, Plan, Confirm, Trace


class ValidationErrorItem(NamedTuple):
    """
    Standardized validation error item.
    
    Attributes:
        path: Field path using dot/bracket notation (e.g., "meta.protocol_version", "steps[0].step_id")
        code: Standard error code (required, type, enum, pattern, format, etc.)
        message: Human-readable error description
    """
    path: str
    code: str
    message: str


class ValidationResult(NamedTuple):
    """
    Standardized validation result structure.
    
    Attributes:
        ok: Whether validation succeeded
        errors: List of validation errors (empty if ok=True)
    """
    ok: bool
    errors: List[ValidationErrorItem]


# Pydantic error type → MPLP standard code mapping
CODE_MAP = {
    'missing': 'required',
    'value_error.missing': 'required',
    'type_error': 'type',
    'type_error.integer': 'type',
    'type_error.float': 'type',
    'type_error.str': 'type',
    'type_error.bool': 'type',
    'type_error.list': 'type',
    'type_error.dict': 'type',
    'string_type': 'type',
    'int_type': 'type',
    'float_type': 'type',
    'bool_type': 'type',
    'dict_type': 'type',
    'list_type': 'type',
    'datetime_parsing': 'format',
    'datetime_object_invalid': 'format',
    'datetime_from_date_parsing': 'format',
    'value_error.datetime': 'format',
    'value_error.const': 'enum',
    'literal_error': 'enum',
    'enum': 'enum',
    'string_pattern_mismatch': 'pattern',
    'value_error.str.regex': 'pattern',
    'string_too_short': 'min_length',
    'string_too_long': 'max_length',
    'value_error.any_str.min_length': 'min_length',
    'value_error.any_str.max_length': 'max_length',
    'value_error.number.not_gt': 'minimum',
    'value_error.number.not_ge': 'minimum',
    'value_error.number.not_lt': 'maximum',
    'value_error.number.not_le': 'maximum',
    'extra_forbidden': 'extra_forbidden',
    'value_error.extra': 'extra_forbidden',
}


def _normalize_error_path(err: dict) -> str:
    """
    Normalize Pydantic error location to standard path format.
    
    Examples:
        ('meta', 'protocol_version') → "meta.protocol_version"
        ('steps', 0, 'step_id') → "steps[0].step_id"
        ('root', 'user_id') → "root.user_id"
    
    Args:
        err: Pydantic error dictionary with 'loc' tuple
        
    Returns:
        Normalized path string
    """
    loc = err.get('loc', ())
    if not loc:
        return ''
    
    path = ''
    for part in loc:
        if isinstance(part, int):
            # Array index - use bracket notation
            path += f'[{part}]'
        else:
            # Object property - use dot notation
            if path:
                path += f'.{part}'
            else:
                path = str(part)
    
    return path


def _map_pydantic_errors(exc: ValidationError) -> ValidationResult:
    """
    Convert Pydantic ValidationError to standard ValidationResult.
    
    Args:
        exc: Pydantic ValidationError exception
        
    Returns:
        StandardizedValidationResult with mapped error codes and paths
    """
    items: List[ValidationErrorItem] = []
    
    for err in exc.errors():
        path = _normalize_error_path(err)
        type_ = err.get('type', '')
        
        # Map Pydantic error type to standard code
        code = CODE_MAP.get(type_, 'unknown')
        
        # Get human-readable message
        msg = err.get('msg', '')
        
        items.append(ValidationErrorItem(path=path, code=code, message=msg))
    
    if not items:
        return ValidationResult(ok=True, errors=[])
    
    return ValidationResult(ok=False, errors=items)


def validate_context(data: Union[Context, dict]) -> ValidationResult:
    """
    Validate Context object or dictionary against MPLP Context schema.
    
    Args:
        data: Context instance or dictionary to validate
        
    Returns:
        ValidationResult with ok=True if valid, or ok=False with error details
    """
    try:
        if isinstance(data, dict):
            Context.model_validate(data)
        elif isinstance(data, Context):
            # Re-validate to catch any model inconsistencies
            Context.model_validate(data.model_dump())
        else:
            return ValidationResult(
                ok=False,
                errors=[ValidationErrorItem(
                    path='',
                    code='type',
                    message=f'Expected Context or dict, got {type(data).__name__}'
                )]
            )
        return ValidationResult(ok=True, errors=[])
    except ValidationError as exc:
        return _map_pydantic_errors(exc)


def validate_plan(data: Union[Plan, dict]) -> ValidationResult:
    """
    Validate Plan object or dictionary against MPLP Plan schema.
    
    Args:
        data: Plan instance or dictionary to validate
        
    Returns:
        ValidationResult with ok=True if valid, or ok=False with error details
    """
    try:
        if isinstance(data, dict):
            Plan.model_validate(data)
        elif isinstance(data, Plan):
            Plan.model_validate(data.model_dump())
        else:
            return ValidationResult(
                ok=False,
                errors=[ValidationErrorItem(
                    path='',
                    code='type',
                    message=f'Expected Plan or dict, got {type(data).__name__}'
                )]
            )
        return ValidationResult(ok=True, errors=[])
    except ValidationError as exc:
        return _map_pydantic_errors(exc)


def validate_confirm(data: Union[Confirm, dict]) -> ValidationResult:
    """
    Validate Confirm object or dictionary against MPLP Confirm schema.
    
    Args:
        data: Confirm instance or dictionary to validate
        
    Returns:
        ValidationResult with ok=True if valid, or ok=False with error details
    """
    try:
        if isinstance(data, dict):
            Confirm.model_validate(data)
        elif isinstance(data, Confirm):
            Confirm.model_validate(data.model_dump())
        else:
            return ValidationResult(
                ok=False,
                errors=[ValidationErrorItem(
                    path='',
                    code='type',
                    message=f'Expected Confirm or dict, got {type(data).__name__}'
                )]
            )
        return ValidationResult(ok=True, errors=[])
    except ValidationError as exc:
        return _map_pydantic_errors(exc)


def validate_trace(data: Union[Trace, dict]) -> ValidationResult:
    """
    Validate Trace object or dictionary against MPLP Trace schema.
    
    Args:
        data: Trace instance or dictionary to validate
        
    Returns:
        ValidationResult with ok=True if valid, or ok=False with error details
    """
    try:
        if isinstance(data, dict):
            Trace.model_validate(data)
        elif isinstance(data, Trace):
            Trace.model_validate(data.model_dump())
        else:
            return ValidationResult(
                ok=False,
                errors=[ValidationErrorItem(
                    path='',
                    code='type',
                    message=f'Expected Trace or dict, got {type(data).__name__}'
                )]
            )
        return ValidationResult(ok=True, errors=[])
    except ValidationError as exc:
        return _map_pydantic_errors(exc)
