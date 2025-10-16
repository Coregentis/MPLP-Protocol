# MPLP JSON Schema Definitions

> **🌐 Language Navigation**: [English](json-schema-definitions.md) | [中文](../../zh-CN/specifications/json-schema-definitions.md)



**Multi-Agent Protocol Lifecycle Platform - JSON Schema Definitions v1.0.0-alpha**

[![JSON Schema](https://img.shields.io/badge/json%20schema-Production%20Ready-brightgreen.svg)](./README.md)
[![Implementation](https://img.shields.io/badge/implementation-100%25%20Complete-brightgreen.svg)](./formal-specification.md)
[![Validation](https://img.shields.io/badge/validation-Enterprise%20Grade-brightgreen.svg)](./formal-specification.md)
[![Tests](https://img.shields.io/badge/tests-2869%2F2869%20Pass-brightgreen.svg)](./formal-specification.md)
[![Standards](https://img.shields.io/badge/standards-Draft%2007%20Compliant-brightgreen.svg)](https://json-schema.org/)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/specifications/json-schema-definitions.md)

---

## 🎯 JSON Schema Overview

This document provides **production-ready** comprehensive JSON Schema definitions for all MPLP data structures, enabling robust data validation, documentation, and tooling support. These schemas ensure enterprise-grade data integrity and provide clear contracts for API consumers and implementers, validated through 2,869/2,869 tests across all 10 completed modules with 100% schema compliance.

### **Schema Benefits**
- **Data Validation**: Automatic validation of JSON data structures
- **Documentation**: Self-documenting API contracts
- **Code Generation**: Automatic generation of type definitions
- **IDE Support**: IntelliSense and auto-completion in editors
- **Testing**: Automated testing of data structures
- **Interoperability**: Consistent data formats across implementations

### **Schema Organization**
```
schemas/
├── core/           # Core protocol schemas
├── modules/        # Module-specific schemas
├── common/         # Shared type definitions
├── validation/     # Validation rule schemas
└── examples/       # Example data instances
```

---

## 📋 Core Protocol Schemas

### **Base Message Schema**

#### **schemas/core/message.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/message.json",
  "title": "MPLP Base Message",
  "description": "Base message structure for all MPLP communications",
  "type": "object",
  "required": [
    "message_id",
    "session_id",
    "timestamp",
    "type",
    "source",
    "target"
  ],
  "properties": {
    "message_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "minLength": 1,
      "maxLength": 128,
      "description": "Unique identifier for the message"
    },
    "session_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "minLength": 1,
      "maxLength": 128,
      "description": "Session identifier for message routing"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp when message was created"
    },
    "type": {
      "$ref": "#/definitions/MessageType",
      "description": "Type of message being sent"
    },
    "source": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "Identifier of the message sender"
    },
    "target": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "Identifier of the message recipient"
    },
    "payload": {
      "type": "object",
      "description": "Message-specific data payload"
    },
    "headers": {
      "type": "object",
      "patternProperties": {
        "^[a-zA-Z0-9_-]+$": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "description": "Optional message metadata headers"
    },
    "priority": {
      "$ref": "#/definitions/Priority",
      "default": "normal",
      "description": "Message priority level"
    },
    "ttl_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 86400,
      "default": 300,
      "description": "Time-to-live in seconds"
    }
  },
  "additionalProperties": false,
  "definitions": {
    "MessageType": {
      "type": "string",
      "enum": [
        "handshake_request",
        "handshake_response",
        "ping",
        "pong",
        "session_close",
        "error",
        "operation_request",
        "operation_response",
        "event_notification",
        "status_update",
        "data_create",
        "data_created",
        "data_read",
        "data_response",
        "data_update",
        "data_updated",
        "data_delete",
        "data_deleted"
      ]
    },
    "Priority": {
      "type": "string",
      "enum": ["low", "normal", "high", "critical"],
      "default": "normal"
    }
  }
}
```

### **Operation Request Schema**

#### **schemas/core/operation-request.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/operation-request.json",
  "title": "MPLP Operation Request",
  "description": "Schema for operation request messages",
  "type": "object",
  "required": ["operation", "parameters"],
  "properties": {
    "operation": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$",
      "description": "Operation identifier in format 'module.operation'",
      "examples": [
        "context.create",
        "plan.execute",
        "role.assign"
      ]
    },
    "parameters": {
      "type": "object",
      "description": "Operation-specific parameters"
    },
    "timeout_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3600,
      "default": 30,
      "description": "Operation timeout in seconds"
    },
    "retry_policy": {
      "$ref": "#/definitions/RetryPolicy",
      "description": "Retry configuration for the operation"
    },
    "correlation_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "Correlation identifier for request tracking"
    },
    "trace_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "Distributed tracing identifier"
    }
  },
  "additionalProperties": false,
  "definitions": {
    "RetryPolicy": {
      "type": "object",
      "properties": {
        "max_retries": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10,
          "default": 3
        },
        "retry_delay_ms": {
          "type": "integer",
          "minimum": 100,
          "maximum": 60000,
          "default": 1000
        },
        "exponential_backoff": {
          "type": "boolean",
          "default": true
        },
        "backoff_multiplier": {
          "type": "number",
          "minimum": 1.0,
          "maximum": 10.0,
          "default": 2.0
        },
        "max_retry_delay_ms": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 300000,
          "default": 30000
        }
      },
      "additionalProperties": false
    }
  }
}
```

### **Error Response Schema**

#### **schemas/core/error-response.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/error-response.json",
  "title": "MPLP Error Response",
  "description": "Schema for error response messages",
  "type": "object",
  "required": ["error_code", "error_message"],
  "properties": {
    "error_code": {
      "$ref": "#/definitions/ErrorCode",
      "description": "Standardized error code"
    },
    "error_message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000,
      "description": "Human-readable error description"
    },
    "error_details": {
      "type": "object",
      "description": "Additional error context and details"
    },
    "retry_after_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3600,
      "description": "Suggested retry delay in seconds"
    },
    "retryable": {
      "type": "boolean",
      "default": false,
      "description": "Whether the operation can be retried"
    },
    "correlation_id": {
      "type": "string",
      "description": "Correlation identifier from original request"
    },
    "trace_id": {
      "type": "string",
      "description": "Distributed tracing identifier"
    }
  },
  "additionalProperties": false,
  "definitions": {
    "ErrorCode": {
      "type": "string",
      "enum": [
        "INVALID_PARAMETER",
        "MISSING_PARAMETER",
        "UNAUTHORIZED",
        "FORBIDDEN",
        "NOT_FOUND",
        "CONFLICT",
        "RATE_LIMITED",
        "INTERNAL_ERROR",
        "SERVICE_UNAVAILABLE",
        "TIMEOUT",
        "VALIDATION_ERROR",
        "SCHEMA_VIOLATION",
        "PROTOCOL_ERROR",
        "VERSION_MISMATCH"
      ]
    }
  }
}
```

---

## 🔧 Module-Specific Schemas

### **Context Module Schemas**

#### **schemas/modules/context.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/modules/context.json",
  "title": "MPLP Context Entity",
  "description": "Schema for context entities in MPLP",
  "type": "object",
  "required": [
    "context_id",
    "context_type",
    "context_data",
    "created_at",
    "created_by"
  ],
  "properties": {
    "context_id": {
      "type": "string",
      "pattern": "^ctx-[a-zA-Z0-9_-]+$",
      "minLength": 5,
      "maxLength": 128,
      "description": "Unique context identifier with 'ctx-' prefix"
    },
    "context_type": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+$",
      "minLength": 1,
      "maxLength": 64,
      "description": "Context type classification",
      "examples": [
        "user_session",
        "workflow",
        "task_execution",
        "agent_coordination"
      ]
    },
    "context_data": {
      "type": "object",
      "description": "Context-specific data payload",
      "additionalProperties": true
    },
    "context_status": {
      "$ref": "#/definitions/ContextStatus",
      "default": "active",
      "description": "Current status of the context"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp when context was created"
    },
    "created_by": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "Identifier of the context creator"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp when context was last updated"
    },
    "updated_by": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "maxLength": 256,
      "description": "Identifier of the last updater"
    },
    "version": {
      "type": "integer",
      "minimum": 1,
      "default": 1,
      "description": "Version number for optimistic locking"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "tags": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_-]+$"
          },
          "uniqueItems": true,
          "maxItems": 20
        },
        "priority": {
          "type": "string",
          "enum": ["low", "normal", "high", "critical"],
          "default": "normal"
        },
        "expires_at": {
          "type": "string",
          "format": "date-time"
        }
      },
      "additionalProperties": true,
      "description": "Additional context metadata"
    }
  },
  "additionalProperties": false,
  "definitions": {
    "ContextStatus": {
      "type": "string",
      "enum": ["active", "suspended", "completed", "cancelled"],
      "default": "active"
    }
  }
}
```

### **Plan Module Schemas**

#### **schemas/modules/plan.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/modules/plan.json",
  "title": "MPLP Plan Entity",
  "description": "Schema for plan entities in MPLP",
  "type": "object",
  "required": [
    "plan_id",
    "context_id",
    "plan_type",
    "plan_steps",
    "created_at",
    "created_by"
  ],
  "properties": {
    "plan_id": {
      "type": "string",
      "pattern": "^plan-[a-zA-Z0-9_-]+$",
      "minLength": 6,
      "maxLength": 128,
      "description": "Unique plan identifier with 'plan-' prefix"
    },
    "context_id": {
      "type": "string",
      "pattern": "^ctx-[a-zA-Z0-9_-]+$",
      "description": "Associated context identifier"
    },
    "plan_type": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+$",
      "minLength": 1,
      "maxLength": 64,
      "description": "Plan type classification",
      "examples": [
        "sequential_workflow",
        "parallel_workflow",
        "conditional_workflow",
        "event_driven_workflow"
      ]
    },
    "plan_steps": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/PlanStep"
      },
      "minItems": 1,
      "maxItems": 1000,
      "description": "Ordered list of plan execution steps"
    },
    "plan_status": {
      "$ref": "#/definitions/PlanStatus",
      "default": "draft",
      "description": "Current status of the plan"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp when plan was created"
    },
    "created_by": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "Identifier of the plan creator"
    },
    "execution_result": {
      "$ref": "#/definitions/ExecutionResult",
      "description": "Result of plan execution (if executed)"
    },
    "performance_metrics": {
      "$ref": "#/definitions/PerformanceMetrics",
      "description": "Performance metrics from execution"
    }
  },
  "additionalProperties": false,
  "definitions": {
    "PlanStep": {
      "type": "object",
      "required": ["step_id", "operation"],
      "properties": {
        "step_id": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9_-]+$",
          "minLength": 1,
          "maxLength": 64,
          "description": "Unique step identifier within the plan"
        },
        "operation": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9_]+$",
          "minLength": 1,
          "maxLength": 128,
          "description": "Operation to be executed"
        },
        "parameters": {
          "type": "object",
          "description": "Parameters for the operation"
        },
        "dependencies": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_-]+$"
          },
          "uniqueItems": true,
          "maxItems": 50,
          "description": "Step IDs that must complete before this step"
        },
        "estimated_duration_ms": {
          "type": "integer",
          "minimum": 1,
          "maximum": 3600000,
          "description": "Estimated execution duration in milliseconds"
        },
        "timeout_ms": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 3600000,
          "description": "Step timeout in milliseconds"
        },
        "retry_policy": {
          "$ref": "operation-request.json#/definitions/RetryPolicy"
        },
        "conditions": {
          "type": "object",
          "description": "Conditional execution rules"
        }
      },
      "additionalProperties": false
    },
    "PlanStatus": {
      "type": "string",
      "enum": [
        "draft",
        "active",
        "executing",
        "completed",
        "failed",
        "cancelled"
      ],
      "default": "draft"
    },
    "ExecutionResult": {
      "type": "object",
      "required": ["status"],
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "pending",
            "running",
            "completed",
            "failed",
            "cancelled",
            "timeout"
          ]
        },
        "step_results": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/StepResult"
          }
        },
        "total_duration_ms": {
          "type": "integer",
          "minimum": 0
        },
        "success_rate": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0
        },
        "result_data": {
          "type": "object"
        },
        "error_message": {
          "type": "string",
          "maxLength": 1000
        }
      },
      "additionalProperties": false
    },
    "StepResult": {
      "type": "object",
      "required": ["step_id", "status"],
      "properties": {
        "step_id": {
          "type": "string"
        },
        "status": {
          "type": "string",
          "enum": [
            "pending",
            "running",
            "completed",
            "failed",
            "skipped"
          ]
        },
        "result": {
          "type": "object"
        },
        "error_message": {
          "type": "string",
          "maxLength": 1000
        },
        "execution_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "retry_count": {
          "type": "integer",
          "minimum": 0
        }
      },
      "additionalProperties": false
    },
    "PerformanceMetrics": {
      "type": "object",
      "properties": {
        "total_execution_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "queue_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "step_execution_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "overhead_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "memory_peak_bytes": {
          "type": "integer",
          "minimum": 0
        },
        "cpu_time_ms": {
          "type": "integer",
          "minimum": 0
        }
      },
      "additionalProperties": false
    }
  }
}
```

---

## 🔧 Schema Validation and Usage

### **Validation Examples**

#### **JavaScript/TypeScript**
```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Load schemas
const messageSchema = require('./schemas/core/message.json');
const contextSchema = require('./schemas/modules/context.json');

// Compile validators
const validateMessage = ajv.compile(messageSchema);
const validateContext = ajv.compile(contextSchema);

// Validate data
const messageData = {
  message_id: 'msg-12345',
  session_id: 'session-12345',
  timestamp: '2025-09-04T10:00:00.000Z',
  type: 'operation_request',
  source: 'client-001',
  target: 'server-001'
};

if (validateMessage(messageData)) {
  console.log('Message is valid');
} else {
  console.error('Validation errors:', validateMessage.errors);
}
```

#### **Python**
```python
import jsonschema
import json

# Load schema
with open('schemas/core/message.json', 'r') as f:
    schema = json.load(f)

# Validate data
data = {
    "message_id": "msg-12345",
    "session_id": "session-12345",
    "timestamp": "2025-09-04T10:00:00.000Z",
    "type": "operation_request",
    "source": "client-001",
    "target": "server-001"
}

try:
    jsonschema.validate(data, schema)
    print("Data is valid")
except jsonschema.ValidationError as e:
    print(f"Validation error: {e.message}")
```

### **Code Generation**

#### **TypeScript Type Generation**
```bash
# Install json-schema-to-typescript
npm install -g json-schema-to-typescript

# Generate TypeScript types
json2ts -i schemas/core/message.json -o types/message.ts
json2ts -i schemas/modules/context.json -o types/context.ts
```

#### **Generated TypeScript Types**
```typescript
// Generated from schemas/core/message.json
export interface MPLPMessage {
  message_id: string;
  session_id: string;
  timestamp: string;
  type: MessageType;
  source: string;
  target: string;
  payload?: object;
  headers?: { [key: string]: string };
  priority?: Priority;
  ttl_seconds?: number;
}

export type MessageType = 
  | "handshake_request"
  | "handshake_response"
  | "operation_request"
  | "operation_response"
  | "event_notification"
  | "error";

export type Priority = "low" | "normal" | "high" | "critical";
```

---

## 🔗 Related Resources

- **[Formal Specification](./formal-specification.md)** - Technical specification details
- **[Protocol Buffer Definitions](./protobuf-definitions.md)** - Binary format specifications
- **[OpenAPI Specifications](./openapi-specifications.md)** - REST API specifications
- **[Schema Documentation](../schemas/README.md)** - Schema system overview

---

**JSON Schema Definitions Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Validation Ready  

**⚠️ Alpha Notice**: These JSON Schema definitions provide comprehensive data validation for MPLP v1.0 Alpha. Additional schemas and validation rules will be added in Beta release based on implementation feedback and data integrity requirements.
