# Trace Module Schema Reference

## 📋 Overview

This document provides the complete JSON Schema reference for the Trace Module, based on the actual schema definitions used in MPLP v1.0. All schemas follow JSON Schema Draft-07 specification and implement the dual naming convention.

## 🎯 Schema Information

- **Schema Version**: Draft-07
- **File Location**: `src/schemas/core-modules/mplp-trace.json`
- **Naming Convention**: snake_case (Schema) ↔ camelCase (TypeScript)
- **Validation**: Strict validation with comprehensive error reporting

## 📊 Core Schema Definitions

### TraceSchema (Root Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/trace.json",
  "title": "MPLP Trace Schema",
  "description": "Schema for MPLP trace records with comprehensive tracking capabilities",
  "type": "object",
  "required": [
    "trace_id",
    "context_id",
    "trace_type",
    "severity",
    "timestamp",
    "trace_operation",
    "protocol_version",
    "event"
  ],
  "properties": {
    "trace_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9-_]+$",
      "minLength": 1,
      "maxLength": 100,
      "description": "Unique identifier for the trace record"
    },
    "context_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9-_]+$",
      "minLength": 1,
      "maxLength": 100,
      "description": "Associated context identifier"
    },
    "plan_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9-_]+$",
      "minLength": 1,
      "maxLength": 100,
      "description": "Associated plan identifier (optional)"
    },
    "task_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9-_]+$",
      "minLength": 1,
      "maxLength": 100,
      "description": "Associated task identifier (optional)"
    },
    "trace_type": {
      "$ref": "#/definitions/TraceType"
    },
    "severity": {
      "$ref": "#/definitions/Severity"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of the trace record"
    },
    "trace_operation": {
      "$ref": "#/definitions/TraceOperation"
    },
    "protocol_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "MPLP protocol version"
    },
    "event": {
      "$ref": "#/definitions/EventObject"
    },
    "context_snapshot": {
      "$ref": "#/definitions/ContextSnapshot"
    },
    "error_information": {
      "$ref": "#/definitions/ErrorInformation"
    },
    "decision_log": {
      "$ref": "#/definitions/DecisionLog"
    },
    "trace_details": {
      "$ref": "#/definitions/TraceDetails"
    }
  },
  "additionalProperties": false
}
```

### Enumeration Definitions

#### TraceType
```json
{
  "TraceType": {
    "type": "string",
    "enum": [
      "execution",
      "monitoring", 
      "audit",
      "performance",
      "error",
      "decision"
    ],
    "description": "Type of trace record indicating the purpose and category"
  }
}
```

#### Severity
```json
{
  "Severity": {
    "type": "string",
    "enum": [
      "debug",
      "info",
      "warn", 
      "error",
      "critical"
    ],
    "description": "Severity level of the trace record"
  }
}
```

#### TraceOperation
```json
{
  "TraceOperation": {
    "type": "string",
    "enum": [
      "start",
      "record",
      "analyze",
      "export",
      "archive",
      "update"
    ],
    "description": "Operation being performed on the trace"
  }
}
```

#### EventType
```json
{
  "EventType": {
    "type": "string",
    "enum": [
      "start",
      "progress",
      "checkpoint",
      "completion",
      "failure",
      "timeout",
      "interrupt"
    ],
    "description": "Type of event being traced"
  }
}
```

#### EventCategory
```json
{
  "EventCategory": {
    "type": "string",
    "enum": [
      "system",
      "user",
      "external",
      "automatic"
    ],
    "description": "Category of the event source"
  }
}
```

### Complex Object Definitions

#### EventObject
```json
{
  "EventObject": {
    "type": "object",
    "required": ["type", "name", "category", "source"],
    "properties": {
      "type": {
        "$ref": "#/definitions/EventType"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200,
        "description": "Human-readable event name"
      },
      "description": {
        "type": "string",
        "maxLength": 1000,
        "description": "Detailed event description"
      },
      "category": {
        "$ref": "#/definitions/EventCategory"
      },
      "source": {
        "$ref": "#/definitions/EventSource"
      },
      "data": {
        "type": "object",
        "description": "Additional event-specific data",
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  }
}
```

#### EventSource
```json
{
  "EventSource": {
    "type": "object",
    "required": ["component"],
    "properties": {
      "component": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100,
        "description": "Source component identifier"
      },
      "service": {
        "type": "string",
        "maxLength": 100,
        "description": "Source service name"
      },
      "instance": {
        "type": "string",
        "maxLength": 100,
        "description": "Source instance identifier"
      },
      "version": {
        "type": "string",
        "pattern": "^\\d+\\.\\d+\\.\\d+$",
        "description": "Source component version"
      }
    },
    "additionalProperties": false
  }
}
```

#### ContextSnapshot
```json
{
  "ContextSnapshot": {
    "type": "object",
    "properties": {
      "variables": {
        "type": "object",
        "description": "Context variables at the time of trace",
        "additionalProperties": true
      },
      "call_stack": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/CallStackFrame"
        },
        "description": "Execution call stack"
      },
      "environment": {
        "$ref": "#/definitions/EnvironmentInfo"
      }
    },
    "additionalProperties": false
  }
}
```

#### CallStackFrame
```json
{
  "CallStackFrame": {
    "type": "object",
    "required": ["function", "file", "line"],
    "properties": {
      "function": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200,
        "description": "Function name"
      },
      "file": {
        "type": "string",
        "minLength": 1,
        "maxLength": 500,
        "description": "File path"
      },
      "line": {
        "type": "integer",
        "minimum": 1,
        "description": "Line number"
      },
      "column": {
        "type": "integer",
        "minimum": 1,
        "description": "Column number"
      }
    },
    "additionalProperties": false
  }
}
```

#### EnvironmentInfo
```json
{
  "EnvironmentInfo": {
    "type": "object",
    "properties": {
      "node_version": {
        "type": "string",
        "description": "Node.js version"
      },
      "platform": {
        "type": "string",
        "description": "Operating system platform"
      },
      "architecture": {
        "type": "string",
        "description": "System architecture"
      },
      "memory_usage": {
        "type": "object",
        "properties": {
          "rss": {"type": "number"},
          "heap_total": {"type": "number"},
          "heap_used": {"type": "number"},
          "external": {"type": "number"}
        }
      }
    },
    "additionalProperties": false
  }
}
```

#### ErrorInformation
```json
{
  "ErrorInformation": {
    "type": "object",
    "required": ["error_code", "error_message", "error_type"],
    "properties": {
      "error_code": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50,
        "description": "Error code identifier"
      },
      "error_message": {
        "type": "string",
        "minLength": 1,
        "maxLength": 1000,
        "description": "Human-readable error message"
      },
      "error_type": {
        "$ref": "#/definitions/ErrorType"
      },
      "stack_trace": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/StackTraceFrame"
        },
        "description": "Error stack trace"
      },
      "recovery_actions": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/RecoveryAction"
        },
        "description": "Suggested recovery actions"
      }
    },
    "additionalProperties": false
  }
}
```

#### ErrorType
```json
{
  "ErrorType": {
    "type": "string",
    "enum": [
      "validation",
      "authentication",
      "authorization",
      "not_found",
      "conflict",
      "timeout",
      "network",
      "database",
      "system",
      "business",
      "unknown"
    ],
    "description": "Classification of error type"
  }
}
```

#### DecisionLog
```json
{
  "DecisionLog": {
    "type": "object",
    "required": [
      "decision_point",
      "available_options",
      "selected_option",
      "reasoning",
      "confidence",
      "timestamp"
    ],
    "properties": {
      "decision_point": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200,
        "description": "Decision point identifier"
      },
      "available_options": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/DecisionOption"
        },
        "minItems": 1,
        "description": "Available decision options"
      },
      "selected_option": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100,
        "description": "Selected option identifier"
      },
      "reasoning": {
        "type": "string",
        "minLength": 1,
        "maxLength": 2000,
        "description": "Decision reasoning explanation"
      },
      "confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Confidence level (0-1)"
      },
      "timestamp": {
        "type": "string",
        "format": "date-time",
        "description": "Decision timestamp"
      }
    },
    "additionalProperties": false
  }
}
```

#### DecisionOption
```json
{
  "DecisionOption": {
    "type": "object",
    "required": ["id", "name", "score"],
    "properties": {
      "id": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100,
        "description": "Option identifier"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200,
        "description": "Option name"
      },
      "description": {
        "type": "string",
        "maxLength": 1000,
        "description": "Option description"
      },
      "score": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Option evaluation score"
      },
      "pros": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Option advantages"
      },
      "cons": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Option disadvantages"
      }
    },
    "additionalProperties": false
  }
}
```

#### TraceDetails
```json
{
  "TraceDetails": {
    "type": "object",
    "properties": {
      "trace_level": {
        "$ref": "#/definitions/TraceLevel"
      },
      "sampling_rate": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Trace sampling rate"
      },
      "retention_days": {
        "type": "integer",
        "minimum": 1,
        "maximum": 3650,
        "description": "Trace retention period in days"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50
        },
        "uniqueItems": true,
        "description": "Trace tags for categorization"
      },
      "metadata": {
        "type": "object",
        "description": "Additional trace metadata",
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  }
}
```

#### TraceLevel
```json
{
  "TraceLevel": {
    "type": "string",
    "enum": [
      "minimal",
      "basic",
      "detailed",
      "comprehensive",
      "debug"
    ],
    "description": "Level of detail for trace recording"
  }
}
```

## 🔍 Schema Validation

### Validation Rules
- **Required Fields**: Must be present and non-null
- **String Patterns**: Regex validation for IDs and versions
- **Length Constraints**: Minimum and maximum length validation
- **Format Validation**: ISO 8601 for timestamps, semantic versioning
- **Range Validation**: Numeric ranges for scores and confidence
- **Enum Validation**: Strict enumeration value checking

### Validation Examples

#### Valid Trace Record
```json
{
  "trace_id": "trace-001",
  "context_id": "ctx-001",
  "trace_type": "execution",
  "severity": "info",
  "timestamp": "2025-08-27T10:00:00.000Z",
  "trace_operation": "start",
  "protocol_version": "1.0.0",
  "event": {
    "type": "start",
    "name": "Process Started",
    "category": "system",
    "source": {
      "component": "main-service"
    }
  }
}
```

#### Schema Validation Errors
```json
{
  "errors": [
    {
      "field": "trace_id",
      "message": "Required field missing",
      "code": "REQUIRED_FIELD"
    },
    {
      "field": "severity",
      "message": "Invalid enum value: 'invalid'",
      "code": "ENUM_VALIDATION"
    },
    {
      "field": "timestamp",
      "message": "Invalid date-time format",
      "code": "FORMAT_VALIDATION"
    }
  ]
}
```

## 🧪 Schema Testing

### Validation Testing
```typescript
describe('Schema Validation', () => {
  it('should validate correct trace schema', () => {
    const validTrace = TraceTestFactory.createValidTraceSchema();
    const result = TraceMapper.validateSchema(validTrace);
    expect(result).toBeDefined();
  });

  it('should reject invalid trace schema', () => {
    const invalidTrace = { trace_id: '' }; // Missing required fields
    expect(() => TraceMapper.validateSchema(invalidTrace))
      .toThrow('Invalid trace schema data');
  });
});
```

### Schema Evolution
- **Backward Compatibility**: New versions maintain compatibility
- **Version Management**: Semantic versioning for schema changes
- **Migration Support**: Automated schema migration tools
- **Deprecation Policy**: Gradual deprecation of old schema versions

---

**Schema Version**: 1.0.0  
**JSON Schema**: Draft-07  
**Last Updated**: 2025-08-31
**Validation**: 100% Coverage
