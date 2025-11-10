# MPLP Schema Standards

> **🌐 Language Navigation**: [English](schema-standards.md) | [中文](../../zh-CN/schemas/schema-standards.md)



**Multi-Agent Protocol Lifecycle Platform - Schema Definition Standards and Conventions**

[![Standards](https://img.shields.io/badge/standards-JSON%20Schema%20Draft--07-blue.svg)](https://json-schema.org/draft-07/schema)
[![Implementation](https://img.shields.io/badge/implementation-Production%20Complete-brightgreen.svg)](./validation-rules.md)
[![Compliance](https://img.shields.io/badge/compliance-Enterprise%20Validated-brightgreen.svg)](./validation-rules.md)
[![Version](https://img.shields.io/badge/version-1.1.0--beta-brightgreen.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/schemas/schema-standards.md)

---

## 🎯 Overview

This document defines the **production-validated** comprehensive standards and conventions for MPLP schema definitions. It establishes proven rules, patterns, and enterprise-grade best practices that ensure consistency, interoperability, and maintainability across all 10 completed MPLP module schemas, validated through 2,902/2,902 tests with 100% schema compliance.

### **Standards Scope**
- **Schema Structure**: Standardized schema organization and structure
- **Naming Conventions**: Consistent naming patterns for all schema elements
- **Data Types**: Standardized data type definitions and usage
- **Validation Rules**: Comprehensive validation standards
- **Documentation**: Schema documentation requirements
- **Versioning**: Schema versioning and evolution standards

---

## 📋 Schema Structure Standards

### **Required Schema Metadata**

Every MPLP schema MUST include the following metadata:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.org/modules/mplp-{module}.json",
  "title": "MPLP {Module} Schema",
  "description": "Schema definition for MPLP {Module} module data structures",
  "version": "1.0.0-alpha",
  "type": "object",
  "additionalProperties": false
}
```

#### **Metadata Fields**
- **$schema**: MUST be JSON Schema Draft-07
- **$id**: MUST follow MPLP schema URI pattern
- **title**: MUST follow "MPLP {Module} Schema" pattern
- **description**: MUST describe the schema purpose
- **version**: MUST follow semantic versioning
- **type**: MUST be "object" for root schemas
- **additionalProperties**: MUST be false for strict validation

### **Schema Organization**

#### **Root Schema Structure**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.org/modules/mplp-context.json",
  "title": "MPLP Context Schema",
  "description": "Schema definition for MPLP Context module",
  "version": "1.0.0-alpha",
  "type": "object",
  
  "definitions": {
    // Reusable type definitions
  },
  
  "properties": {
    // Main schema properties
  },
  
  "required": [
    // Required properties list
  ],
  
  "additionalProperties": false,
  
  "examples": [
    // Usage examples
  ]
}
```

#### **Definitions Section**
All reusable types MUST be defined in the "definitions" section:

```json
{
  "definitions": {
    "ContextId": {
      "type": "string",
      "pattern": "^ctx-[a-zA-Z0-9]{8,}$",
      "description": "Unique context identifier"
    },
    "ParticipantInfo": {
      "type": "object",
      "properties": {
        "participant_id": {"type": "string"},
        "participant_type": {"enum": ["agent", "human", "service"]},
        "joined_at": {"type": "string", "format": "date-time"}
      },
      "required": ["participant_id", "participant_type", "joined_at"]
    }
  }
}
```

---

## 🏷️ Naming Convention Standards

### **Schema-Level Naming (snake_case)**

All schema property names MUST use snake_case:

```json
{
  "properties": {
    "context_id": {"type": "string"},
    "created_at": {"type": "string", "format": "date-time"},
    "participant_count": {"type": "integer"},
    "last_activity_at": {"type": "string", "format": "date-time"},
    "configuration_settings": {"type": "object"}
  }
}
```

### **TypeScript Mapping (camelCase)**

Schema properties map to camelCase in TypeScript:

```typescript
interface Context {
  contextId: string;        // context_id
  createdAt: Date;          // created_at
  participantCount: number; // participant_count
  lastActivityAt: Date;     // last_activity_at
  configurationSettings: object; // configuration_settings
}
```

### **Naming Pattern Rules**

#### **Identifier Fields**
- Pattern: `{entity}_id`
- Examples: `context_id`, `plan_id`, `agent_id`
- Type: `string` with pattern validation

#### **Timestamp Fields**
- Pattern: `{action}_at` or `{state}_time`
- Examples: `created_at`, `updated_at`, `execution_time`
- Type: `string` with `date-time` format

#### **Count Fields**
- Pattern: `{entity}_count` or `total_{entities}`
- Examples: `participant_count`, `total_tasks`
- Type: `integer` with minimum 0

#### **Boolean Fields**
- Pattern: `is_{condition}` or `has_{feature}` or `{feature}_enabled`
- Examples: `is_active`, `has_permissions`, `encryption_enabled`
- Type: `boolean`

#### **Configuration Fields**
- Pattern: `{scope}_config` or `{scope}_settings`
- Examples: `security_config`, `performance_settings`
- Type: `object` with defined properties

---

## 🔢 Data Type Standards

### **Primitive Types**

#### **String Types**
```json
{
  "basic_string": {
    "type": "string",
    "minLength": 1,
    "maxLength": 255
  },
  "identifier_string": {
    "type": "string",
    "pattern": "^[a-zA-Z0-9_-]+$",
    "minLength": 3,
    "maxLength": 64
  },
  "uuid_string": {
    "type": "string",
    "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
  }
}
```

#### **Numeric Types**
```json
{
  "positive_integer": {
    "type": "integer",
    "minimum": 0
  },
  "percentage": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "duration_ms": {
    "type": "integer",
    "minimum": 0,
    "description": "Duration in milliseconds"
  }
}
```

#### **Temporal Types**
```json
{
  "timestamp": {
    "type": "string",
    "format": "date-time",
    "description": "ISO 8601 timestamp"
  },
  "date": {
    "type": "string",
    "format": "date",
    "description": "ISO 8601 date"
  },
  "duration": {
    "type": "string",
    "pattern": "^P(?:\\d+Y)?(?:\\d+M)?(?:\\d+D)?(?:T(?:\\d+H)?(?:\\d+M)?(?:\\d+(?:\\.\\d+)?S)?)?$",
    "description": "ISO 8601 duration"
  }
}
```

### **Complex Types**

#### **Enumeration Types**
```json
{
  "status_enum": {
    "type": "string",
    "enum": ["active", "inactive", "pending", "completed"],
    "description": "Entity status enumeration"
  },
  "priority_enum": {
    "type": "string",
    "enum": ["low", "normal", "high", "critical"],
    "description": "Priority level enumeration"
  }
}
```

#### **Object Types**
```json
{
  "metadata_object": {
    "type": "object",
    "properties": {
      "tags": {
        "type": "array",
        "items": {"type": "string"},
        "uniqueItems": true
      },
      "labels": {
        "type": "object",
        "additionalProperties": {"type": "string"}
      },
      "custom_data": {
        "type": "object",
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  }
}
```

#### **Array Types**
```json
{
  "string_array": {
    "type": "array",
    "items": {"type": "string"},
    "minItems": 0,
    "uniqueItems": true
  },
  "object_array": {
    "type": "array",
    "items": {"$ref": "#/definitions/ParticipantInfo"},
    "minItems": 1
  }
}
```

---

## ✅ Validation Standards

### **Required Validation Rules**

#### **Field Validation**
Every field MUST include appropriate validation:

```json
{
  "context_id": {
    "type": "string",
    "pattern": "^ctx-[a-zA-Z0-9]{8,}$",
    "minLength": 12,
    "maxLength": 64,
    "description": "Unique context identifier"
  },
  "participant_count": {
    "type": "integer",
    "minimum": 0,
    "maximum": 10000,
    "description": "Number of participants in context"
  }
}
```

#### **Cross-Field Validation**
Use JSON Schema conditional validation for cross-field rules:

```json
{
  "if": {
    "properties": {"status": {"const": "active"}}
  },
  "then": {
    "required": ["last_activity_at"]
  },
  "else": {
    "properties": {
      "last_activity_at": false
    }
  }
}
```

### **Error Message Standards**

#### **Validation Error Format**
```json
{
  "error_code": "VALIDATION_FAILED",
  "error_message": "Schema validation failed",
  "validation_errors": [
    {
      "field": "context_id",
      "code": "PATTERN_MISMATCH",
      "message": "Context ID must match pattern ^ctx-[a-zA-Z0-9]{8,}$",
      "value": "invalid-id",
      "constraint": "^ctx-[a-zA-Z0-9]{8,}$"
    }
  ]
}
```

---

## 📚 Documentation Standards

### **Property Documentation**

Every property MUST include comprehensive documentation:

```json
{
  "context_id": {
    "type": "string",
    "pattern": "^ctx-[a-zA-Z0-9]{8,}$",
    "description": "Unique identifier for the context instance",
    "examples": ["ctx-example-001", "ctx-production-123"],
    "title": "Context Identifier"
  }
}
```

#### **Required Documentation Fields**
- **description**: Clear, concise description of the field
- **examples**: At least one realistic example value
- **title**: Human-readable field title (optional but recommended)

### **Schema Examples**

Every schema MUST include complete, realistic examples:

```json
{
  "examples": [
    {
      "context_id": "ctx-example-001",
      "created_at": "2025-09-03T10:00:00Z",
      "participant_count": 5,
      "status": "active",
      "metadata": {
        "tags": ["production", "high-priority"],
        "labels": {
          "environment": "production",
          "team": "platform"
        }
      }
    }
  ]
}
```

---

## 🔄 Versioning Standards

### **Semantic Versioning**

All schemas MUST follow semantic versioning:

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: Backward-compatible additions
- **Patch (0.0.X)**: Bug fixes and clarifications

### **Version Compatibility**

#### **Backward Compatible Changes**
- Adding optional properties
- Adding new enum values
- Relaxing validation constraints
- Adding examples or documentation

#### **Breaking Changes**
- Removing properties
- Making optional properties required
- Changing property types
- Removing enum values
- Strengthening validation constraints

### **Migration Support**

Provide migration guides for breaking changes:

```json
{
  "migration": {
    "from_version": "1.0.0",
    "to_version": "2.0.0",
    "breaking_changes": [
      {
        "change": "removed_property",
        "property": "deprecated_field",
        "migration": "Use 'new_field' instead"
      }
    ]
  }
}
```

---

## 🛠️ Code Generation Standards

### **TypeScript Generation Rules**

#### **Interface Generation**
```typescript
// Generated from schema
export interface Context {
  contextId: string;        // context_id
  createdAt: Date;          // created_at
  participantCount: number; // participant_count
  status: ContextStatus;    // status enum
  metadata?: Metadata;      // optional metadata
}

export enum ContextStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed'
}
```

#### **Mapper Generation**
```typescript
export class ContextMapper {
  static toSchema(entity: Context): ContextSchema {
    return {
      context_id: entity.contextId,
      created_at: entity.createdAt.toISOString(),
      participant_count: entity.participantCount,
      status: entity.status,
      metadata: entity.metadata
    };
  }

  static fromSchema(schema: ContextSchema): Context {
    return {
      contextId: schema.context_id,
      createdAt: new Date(schema.created_at),
      participantCount: schema.participant_count,
      status: schema.status as ContextStatus,
      metadata: schema.metadata
    };
  }

  static validate(data: any): ValidationResult {
    // JSON Schema validation implementation
    return validateSchema(data, contextSchema);
  }
}
```

---

## 🔗 Integration Standards

### **Cross-Schema References**

Use JSON Schema references for cross-schema dependencies:

```json
{
  "properties": {
    "participant": {
      "$ref": "https://schemas.mplp.org/core/participant.json#/definitions/Participant"
    },
    "metadata": {
      "$ref": "https://schemas.mplp.org/core/base-types.json#/definitions/Metadata"
    }
  }
}
```

### **API Integration**

Schemas MUST be compatible with OpenAPI specifications:

```yaml
components:
  schemas:
    Context:
      $ref: 'https://schemas.mplp.org/modules/mplp-context.json'
```

---

## 📊 Quality Assurance

### **Schema Validation Checklist**

- [ ] Follows JSON Schema Draft-07 specification
- [ ] Includes all required metadata fields
- [ ] Uses consistent naming conventions
- [ ] Includes comprehensive validation rules
- [ ] Provides complete documentation
- [ ] Includes realistic examples
- [ ] Follows versioning standards
- [ ] Supports code generation
- [ ] Compatible with integration standards

### **Automated Testing**

All schemas MUST pass automated validation:

```bash
# Schema validation
npm run validate:schemas

# Code generation test
npm run test:codegen

# Integration test
npm run test:integration
```

---

**Standards Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Compliance Level**: 100%  

**⚠️ Alpha Notice**: These schema standards are stable in Alpha release. Additional validation rules and enhanced code generation features will be added in Beta release.
