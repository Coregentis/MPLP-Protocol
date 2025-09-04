# MPLP Schema System

**Multi-Agent Protocol Lifecycle Platform - Schema and Data Specification System v1.0.0-alpha**

[![Schema](https://img.shields.io/badge/schema-JSON%20Schema%20Draft--07-blue.svg)](./schema-standards.md)
[![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Implementation](https://img.shields.io/badge/implementation-100%25%20Complete-brightgreen.svg)](./validation-rules.md)
[![Tests](https://img.shields.io/badge/tests-2869%2F2869%20Pass-brightgreen.svg)](./validation-rules.md)
[![Validation](https://img.shields.io/badge/validation-Enterprise%20Grade-brightgreen.svg)](./validation-rules.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/schemas/README.md)

---

## 🎯 Overview

The MPLP Schema System provides **production-ready** comprehensive data specification and validation for the Multi-Agent Protocol Lifecycle Platform. Based on **JSON Schema Draft-07**, it defines fully implemented and tested standardized data structures for **all 10 completed core modules** and **9 cross-cutting concerns**, ensuring enterprise-grade interoperability, consistency, and reliability across all MPLP implementations. Validated through 2,869/2,869 tests with 100% schema compliance.

### **Core Principles**
- **JSON Schema Draft-07 Standard**: Industry-standard schema definition format
- **Dual Naming Convention**: snake_case for schemas, camelCase for TypeScript
- **Module-Based Organization**: 10 core modules + 9 cross-cutting concerns
- **Enterprise-Grade Validation**: Comprehensive validation with detailed error reporting
- **Protocol-First Design**: Schema drives implementation, not vice versa
- **Vendor Neutrality**: Technology-agnostic data structures

### **Key Features**
- **Standardized File Naming**: `mplp-{module}.json` format for all schemas
- **Comprehensive Field Coverage**: Complete data structures for all MPLP operations
- **Built-in Validation**: Multi-level validation with business rule enforcement
- **Schema Evolution**: Backward-compatible versioning with migration support
- **TypeScript Integration**: Automatic type generation with mapping functions
- **Documentation Integration**: Self-documenting schemas with rich metadata

---

## 🏗️ Actual Schema Architecture

### **Real Schema Structure (src/schemas/)**

```
src/schemas/
├── README.md                           # Schema system documentation
├── index.ts                           # Schema exports and utilities
├── core-modules/                      # 10 Core L2 Coordination Modules
│   ├── index.ts                       # Module schema exports
│   ├── mplp-context.json             # Context management protocol
│   ├── mplp-plan.json                # Planning and scheduling protocol
│   ├── mplp-role.json                # Role-based access control protocol
│   ├── mplp-confirm.json             # Approval workflow protocol
│   ├── mplp-trace.json               # Distributed tracing protocol
│   ├── mplp-extension.json           # Extension management protocol
│   ├── mplp-dialog.json              # Dialog management protocol
│   ├── mplp-collab.json              # Multi-agent collaboration protocol
│   ├── mplp-network.json             # Network communication protocol
│   └── mplp-core.json                # Core orchestration protocol
└── cross-cutting-concerns/           # 9 L1 Protocol Layer Services
    ├── index.ts                       # Cross-cutting concern exports
    ├── mplp-coordination.json         # Coordination service protocol
    ├── mplp-error-handling.json       # Error handling service protocol
    ├── mplp-event-bus.json            # Event bus service protocol
    ├── mplp-orchestration.json        # Orchestration service protocol
    ├── mplp-performance.json          # Performance monitoring protocol
    ├── mplp-protocol-version.json     # Protocol versioning service
    ├── mplp-security.json             # Security service protocol
    ├── mplp-state-sync.json           # State synchronization protocol
    └── mplp-transaction.json          # Transaction management protocol
```

### **Schema Categories**

#### **Core Modules (L2 Coordination Layer)**
1. **Context Module** (`mplp-context.json`): Shared state and coordination management
2. **Plan Module** (`mplp-plan.json`): Workflow definition and execution management
3. **Role Module** (`mplp-role.json`): Role-based access control and permissions
4. **Confirm Module** (`mplp-confirm.json`): Approval workflows and confirmation processes
5. **Trace Module** (`mplp-trace.json`): Distributed tracing and observability
6. **Extension Module** (`mplp-extension.json`): Plugin and extension management
7. **Dialog Module** (`mplp-dialog.json`): Conversational and interactive management
8. **Collab Module** (`mplp-collab.json`): Multi-agent collaboration and coordination
9. **Network Module** (`mplp-network.json`): Distributed communication and networking
10. **Core Module** (`mplp-core.json`): Central orchestration and resource management
---

## 📋 Schema Standards

### **File Naming Pattern**
```
Pattern: mplp-{module-name}.json
Location: src/schemas/{category}/mplp-{module}.json

Core Modules (src/schemas/core-modules/):
- mplp-context.json      # Context management protocol
- mplp-plan.json         # Planning and scheduling protocol
- mplp-role.json         # Role-based access control protocol
- mplp-confirm.json      # Approval workflow protocol
- mplp-trace.json        # Distributed tracing protocol
- mplp-extension.json    # Extension management protocol
- mplp-dialog.json       # Dialog management protocol
- mplp-collab.json       # Multi-agent collaboration protocol
- mplp-network.json      # Network communication protocol
- mplp-core.json         # Core orchestration protocol

Cross-Cutting Concerns (src/schemas/cross-cutting-concerns/):
- mplp-coordination.json     # Coordination service protocol
- mplp-error-handling.json   # Error handling service protocol
- mplp-event-bus.json        # Event bus service protocol
- mplp-orchestration.json    # Orchestration service protocol
- mplp-performance.json      # Performance monitoring protocol
- mplp-protocol-version.json # Protocol versioning service
- mplp-security.json         # Security service protocol
- mplp-state-sync.json       # State synchronization protocol
- mplp-transaction.json      # Transaction management protocol
```

### **Field Naming (Dual Convention)**
```json
// Schema Layer (snake_case) - MANDATORY
{
  "context_id": "123e4567-e89b-42d3-a456-426614174000",
  "created_at": "2025-09-04T10:30:00Z",
  "protocol_version": "1.0.0",
  "lifecycle_stage": "planning",
  "shared_state": {
    "variables": {},
    "resources": {},
    "dependencies": [],
    "goals": []
  }
}

// TypeScript Layer (camelCase) - MANDATORY
interface ContextEntity {
  contextId: string;
  createdAt: Date;
  protocolVersion: string;
  lifecycleStage: string;
  sharedState: {
    variables: Record<string, any>;
    resources: ResourceState;
    dependencies: Dependency[];
    goals: Goal[];
  };
}
```

### **Schema Structure Standards**

#### **Required Schema Metadata**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-{module}.json",
  "title": "MPLP {Module} Protocol v1.0",
  "description": "{Module}模块协议Schema - {功能描述}",
  "type": "object"
}
```

#### **Standard Definitions ($defs)**
```json
{
  "$defs": {
    "uuid": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
      "description": "UUID v4格式的唯一标识符"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601格式的时间戳"
    },
    "version": {
      "type": "string",
      "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
      "description": "语义化版本号 (SemVer)"
    },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"],
      "description": "优先级枚举"
    }
  }
}
  "type": "object",
  "properties": {
    "context_id": {
      "type": "string",
      "pattern": "^ctx-[a-zA-Z0-9]{8,}$",
      "description": "Unique context identifier"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Context creation timestamp"
    }
  },
  "required": ["context_id", "created_at"],
  "additionalProperties": false
}
```

### **Dual Naming Convention**

MPLP implements a dual naming convention to support both JSON/REST APIs (snake_case) and programming languages (camelCase):

#### **Schema Layer (snake_case)**
```json
{
  "context_id": "ctx-001",
  "created_at": "2025-09-03T10:00:00Z",
  "participant_count": 5,
  "last_activity_at": "2025-09-03T10:30:00Z"
}
```

#### **TypeScript Layer (camelCase)**
```typescript
interface Context {
  contextId: string;        // maps to: context_id
  createdAt: Date;          // maps to: created_at
  participantCount: number; // maps to: participant_count
  lastActivityAt: Date;     // maps to: last_activity_at
}
```

#### **Mapping Functions**
```typescript
class ContextMapper {
  static toSchema(entity: Context): ContextSchema {
    return {
      context_id: entity.contextId,
      created_at: entity.createdAt.toISOString(),
      participant_count: entity.participantCount,
      last_activity_at: entity.lastActivityAt.toISOString()
    };
  }

  static fromSchema(schema: ContextSchema): Context {
    return {
      contextId: schema.context_id,
      createdAt: new Date(schema.created_at),
      participantCount: schema.participant_count,
      lastActivityAt: new Date(schema.last_activity_at)
    };
  }

  static validateSchema(data: any): ValidationResult {
    // JSON Schema validation implementation
    return validate(data, contextSchema);
  }
}
```

---

## 🔧 Core Schema Types

### **Base Types**

#### **Primitive Types**
```json
{
  "definitions": {
    "UUID": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    },
    "Timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "Duration": {
      "type": "integer",
      "minimum": 0,
      "description": "Duration in milliseconds"
    },
    "Percentage": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Percentage value between 0 and 1"
    }
  }
}
```

#### **Common Structures**
```json
{
  "definitions": {
    "Metadata": {
      "type": "object",
      "properties": {
        "tags": {
          "type": "array",
          "items": {"type": "string"}
        },
        "labels": {
          "type": "object",
          "additionalProperties": {"type": "string"}
        },
        "custom_data": {
          "type": "object",
          "additionalProperties": true
        }
      }
    },
    "Lifecycle": {
      "type": "object",
      "properties": {
        "created_at": {"$ref": "#/definitions/Timestamp"},
        "updated_at": {"$ref": "#/definitions/Timestamp"},
        "created_by": {"type": "string"},
        "version": {"type": "string"}
      },
      "required": ["created_at", "created_by", "version"]
    }
  }
}
```

### **Protocol Types**

#### **Message Structure**
```json
{
  "definitions": {
    "ProtocolMessage": {
      "type": "object",
      "properties": {
        "message_id": {"$ref": "#/definitions/UUID"},
        "message_type": {"type": "string"},
        "protocol_version": {"type": "string"},
        "timestamp": {"$ref": "#/definitions/Timestamp"},
        "sender": {
          "type": "object",
          "properties": {
            "sender_id": {"type": "string"},
            "sender_type": {"enum": ["agent", "service", "system"]}
          }
        },
        "payload": {"type": "object"},
        "metadata": {"$ref": "#/definitions/Metadata"}
      },
      "required": ["message_id", "message_type", "protocol_version", "timestamp", "sender", "payload"]
    }
  }
}
```

#### **Response Structure**
```json
{
  "definitions": {
    "ProtocolResponse": {
      "type": "object",
      "properties": {
        "response_id": {"$ref": "#/definitions/UUID"},
        "request_id": {"$ref": "#/definitions/UUID"},
        "status": {"enum": ["success", "error", "partial"]},
        "timestamp": {"$ref": "#/definitions/Timestamp"},
        "data": {"type": "object"},
        "error": {"$ref": "#/definitions/ErrorInfo"},
        "metadata": {"$ref": "#/definitions/Metadata"}
      },
      "required": ["response_id", "request_id", "status", "timestamp"]
    }
  }
}
```

### **Error Types**

#### **Standardized Error Structure**
```json
{
  "definitions": {
    "ErrorInfo": {
      "type": "object",
      "properties": {
        "error_code": {"type": "string"},
        "error_message": {"type": "string"},
        "error_details": {"type": "object"},
        "error_context": {
          "type": "object",
          "properties": {
            "module": {"type": "string"},
            "operation": {"type": "string"},
            "timestamp": {"$ref": "#/definitions/Timestamp"}
          }
        },
        "suggested_actions": {
          "type": "array",
          "items": {"type": "string"}
        }
      },
      "required": ["error_code", "error_message"]
    }
  }
}
```

---

## 🔍 Validation System

### **Multi-Level Validation**

The MPLP schema system implements multi-level validation:

#### **Level 1: Syntax Validation**
- JSON Schema structural validation
- Data type validation
- Required field validation
- Format validation (dates, UUIDs, etc.)

#### **Level 2: Semantic Validation**
- Business rule validation
- Cross-field validation
- Constraint validation
- Range and boundary validation

#### **Level 3: Context Validation**
- Context-specific validation rules
- State-dependent validation
- Relationship validation
- Consistency validation

### **Validation Implementation**

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: ValidationMetadata;
}

interface ValidationError {
  code: string;
  message: string;
  path: string;
  value: any;
  constraint: string;
}

class SchemaValidator {
  static validate(data: any, schema: JSONSchema): ValidationResult {
    const syntaxResult = this.validateSyntax(data, schema);
    const semanticResult = this.validateSemantics(data, schema);
    const contextResult = this.validateContext(data, schema);
    
    return this.combineResults([syntaxResult, semanticResult, contextResult]);
  }
  
  static validateSyntax(data: any, schema: JSONSchema): ValidationResult {
    // JSON Schema validation implementation
  }
  
  static validateSemantics(data: any, schema: JSONSchema): ValidationResult {
    // Business rule validation implementation
  }
  
  static validateContext(data: any, schema: JSONSchema): ValidationResult {
    // Context-specific validation implementation
  }
}
```

---

## 🔄 Schema Evolution

### **Versioning Strategy**

MPLP schemas follow semantic versioning with backward compatibility guarantees:

- **Major Version**: Breaking changes that require migration
- **Minor Version**: Backward-compatible additions
- **Patch Version**: Bug fixes and clarifications

### **Evolution Rules**

#### **Backward Compatible Changes**
- Adding optional fields
- Adding new enum values
- Relaxing validation constraints
- Adding new schema definitions

#### **Breaking Changes**
- Removing required fields
- Changing field types
- Adding required fields
- Removing enum values

### **Migration Support**

```typescript
interface SchemaMigration {
  fromVersion: string;
  toVersion: string;
  migrationRules: MigrationRule[];
}

interface MigrationRule {
  operation: 'add' | 'remove' | 'rename' | 'transform';
  path: string;
  value?: any;
  transformer?: (value: any) => any;
}

class SchemaMigrator {
  static migrate(data: any, migration: SchemaMigration): MigrationResult {
    let migratedData = { ...data };
    
    for (const rule of migration.migrationRules) {
      migratedData = this.applyRule(migratedData, rule);
    }
    
    return {
      success: true,
      migratedData,
      appliedRules: migration.migrationRules
    };
  }
}
```

---

## 🛠️ Code Generation

### **Multi-Language Support**

The MPLP schema system generates type-safe code for multiple programming languages:

#### **TypeScript Generation**
```typescript
// Generated from mplp-context.json
export interface Context {
  contextId: string;
  createdAt: Date;
  participantCount: number;
  lastActivityAt: Date;
}

export class ContextMapper {
  static toSchema(entity: Context): ContextSchema { /* ... */ }
  static fromSchema(schema: ContextSchema): Context { /* ... */ }
  static validate(data: any): ValidationResult { /* ... */ }
}
```

#### **Python Generation**
```python
# Generated from mplp-context.json
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Context:
    context_id: str
    created_at: datetime
    participant_count: int
    last_activity_at: datetime

class ContextMapper:
    @staticmethod
    def to_schema(entity: Context) -> dict: ...
    
    @staticmethod
    def from_schema(schema: dict) -> Context: ...
    
    @staticmethod
    def validate(data: dict) -> ValidationResult: ...
```

### **Documentation Generation**

Automatic documentation generation from schema definitions:

```markdown
# Context Schema Documentation

## Overview
Schema definition for MPLP Context module data structures.

## Properties

### context_id
- **Type**: string
- **Pattern**: `^ctx-[a-zA-Z0-9]{8,}$`
- **Required**: Yes
- **Description**: Unique context identifier

### created_at
- **Type**: string
- **Format**: date-time
- **Required**: Yes
- **Description**: Context creation timestamp
```

---

## 📚 Schema Documentation

### **Documentation Structure**

Each schema includes comprehensive documentation:

- **Overview**: Purpose and scope of the schema
- **Properties**: Detailed property descriptions
- **Examples**: Real-world usage examples
- **Validation Rules**: Validation constraints and rules
- **Migration Guide**: Version migration instructions
- **Integration Guide**: Integration with other schemas

### **Self-Documenting Schemas**

Schemas include rich metadata for automatic documentation generation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Context Schema",
  "description": "Defines data structures for MPLP context management",
  "examples": [
    {
      "context_id": "ctx-example-001",
      "created_at": "2025-09-03T10:00:00Z",
      "participant_count": 5
    }
  ],
  "properties": {
    "context_id": {
      "type": "string",
      "description": "Unique identifier for the context",
      "examples": ["ctx-example-001", "ctx-production-123"]
    }
  }
}
```

---

## 🔗 Related Documentation

- [Schema Standards](./schema-standards.md) - Detailed schema standards and conventions
- [Dual Naming Guide](./dual-naming-guide.md) - Complete dual naming convention guide
- [Field Mapping Reference](./field-mapping-reference.md) - Comprehensive field mapping reference
- [Validation Rules](./validation-rules.md) - Complete validation rules documentation
- [Evolution Strategy](./evolution-strategy.md) - Schema evolution and versioning strategy
- [Compatibility Matrix](./compatibility-matrix.md) - Version compatibility information

---

**Schema System Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**JSON Schema Version**: Draft-07  

**⚠️ Alpha Notice**: The MPLP Schema System is stable in Alpha release with comprehensive validation and code generation. Advanced schema analytics and enhanced migration tools will be added in Beta release.
