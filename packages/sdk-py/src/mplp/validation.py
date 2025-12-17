# MPLP v1.0.0 FROZEN
# Governance: MPGC

from typing import List, Any, Dict, Optional, NamedTuple
from pydantic import ValidationError
from .models import Context, Plan, Confirm, Trace

class ValidationErrorItem(NamedTuple):
    path: str
    code: str
    message: str

class ValidationResult(NamedTuple):
    ok: bool
    errors: List[ValidationErrorItem]

def _validate_model(model_cls, data: Any) -> ValidationResult:
    try:
        if isinstance(data, model_cls):
            return ValidationResult(ok=True, errors=[])
            
        if hasattr(data, "model_dump"):
            data = data.model_dump()
            
        model_cls(**data)
        return ValidationResult(ok=True, errors=[])
    except ValidationError as e:
        errors = []
        for err in e.errors():
            # Map Pydantic errors to our structure
            loc = ".".join(str(x) for x in err["loc"])
            code = err["type"]
            msg = err["msg"]
            
            # Map specific codes if needed
            if code == "missing":
                code = "required"
            elif code == "string_type":
                code = "type"
            elif code == "value_error.const":
                code = "enum"
            elif code == "uuid_parsing":
                code = "pattern"
            elif code == "literal_error":
                code = "enum"
            # Add more mappings as needed to match test expectations
            
            errors.append(ValidationErrorItem(path=loc, code=code, message=msg))
        return ValidationResult(ok=False, errors=errors)

def validate_context(data: Dict[str, Any]) -> ValidationResult:
    return _validate_model(Context, data)

def validate_plan(data: Dict[str, Any]) -> ValidationResult:
    return _validate_model(Plan, data)

def validate_confirm(data: Dict[str, Any]) -> ValidationResult:
    return _validate_model(Confirm, data)

def validate_trace(data: Dict[str, Any]) -> ValidationResult:
    return _validate_model(Trace, data)
