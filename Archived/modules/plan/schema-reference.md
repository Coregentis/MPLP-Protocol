# Plan Module Schema Reference

## 📋 **Overview**

The Plan Module uses JSON Schema (Draft-07) for data validation and structure definition. All schemas follow the dual naming convention with snake_case for schema definitions and camelCase for TypeScript implementations.

**Schema Version**: Draft-07  
**Naming Convention**: snake_case (Schema) ↔ camelCase (TypeScript)  
**Validation**: Strict validation with comprehensive error reporting

## 🗂️ **Core Schemas**

### **PlanSchema**
The main schema for plan entities.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/plan.json",
  "title": "Plan Schema",
  "description": "Schema for intelligent task planning and coordination",
  "type": "object",
  "required": [
    "plan_id",
    "context_id",
    "name",
    "status",
    "priority",
    "protocol_version",
    "timestamp"
  ],
  "properties": {
    "plan_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for the plan"
    },
    "context_id": {
      "type": "string",
      "format": "uuid",
      "description": "Associated context identifier"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255,
      "description": "Plan name"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "Optional plan description"
    },
    "status": {
      "type": "string",
      "enum": ["draft", "approved", "active", "paused", "completed", "cancelled", "failed"],
      "description": "Current plan status"
    },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"],
      "description": "Plan priority level"
    },
    "protocol_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "MPLP protocol version"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Plan creation/update timestamp"
    },
    "tasks": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Task"
      },
      "description": "Array of plan tasks"
    },
    "milestones": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Milestone"
      },
      "description": "Array of plan milestones"
    },
    "resources": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ResourceAllocation"
      },
      "description": "Array of resource allocations"
    },
    "risks": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/RiskItem"
      },
      "description": "Array of identified risks"
    },
    "audit_trail": {
      "$ref": "#/definitions/AuditTrail",
      "description": "Audit trail configuration"
    },
    "monitoring_integration": {
      "type": "object",
      "description": "Monitoring integration settings"
    },
    "performance_metrics": {
      "type": "object",
      "description": "Performance metrics data"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Creation timestamp"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp"
    },
    "created_by": {
      "type": "string",
      "description": "Creator identifier"
    },
    "updated_by": {
      "type": "string",
      "description": "Last updater identifier"
    }
  },
  "definitions": {
    "Task": {
      "type": "object",
      "required": ["task_id", "name", "type", "status", "priority"],
      "properties": {
        "task_id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "description": {
          "type": "string",
          "maxLength": 1000
        },
        "type": {
          "type": "string",
          "enum": ["atomic", "composite", "milestone", "review"]
        },
        "status": {
          "type": "string",
          "enum": ["pending", "running", "completed", "failed", "cancelled"]
        },
        "priority": {
          "type": "string",
          "enum": ["critical", "high", "medium", "low"]
        },
        "estimated_duration": {
          "type": "number",
          "minimum": 0
        },
        "actual_duration": {
          "type": "number",
          "minimum": 0
        },
        "completion_percentage": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "assigned_to": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "dependencies": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TaskDependency"
          }
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "metadata": {
          "type": "object"
        }
      }
    },
    "TaskDependency": {
      "type": "object",
      "required": ["task_id", "type"],
      "properties": {
        "task_id": {
          "type": "string",
          "format": "uuid"
        },
        "type": {
          "type": "string",
          "enum": ["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"]
        },
        "lag": {
          "type": "number"
        },
        "lag_unit": {
          "type": "string",
          "enum": ["minutes", "hours", "days", "weeks"]
        }
      }
    },
    "Milestone": {
      "type": "object",
      "required": ["id", "name", "status", "target_date"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "description": {
          "type": "string",
          "maxLength": 1000
        },
        "status": {
          "type": "string",
          "enum": ["pending", "in_progress", "completed", "failed"]
        },
        "target_date": {
          "type": "string",
          "format": "date-time"
        },
        "actual_date": {
          "type": "string",
          "format": "date-time"
        },
        "criteria": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "dependencies": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uuid"
          }
        },
        "deliverables": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "ResourceAllocation": {
      "type": "object",
      "required": ["resource_id", "resource_name", "type", "allocated_amount"],
      "properties": {
        "resource_id": {
          "type": "string",
          "format": "uuid"
        },
        "resource_name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "type": {
          "type": "string",
          "enum": ["human", "material", "financial", "technical"]
        },
        "allocated_amount": {
          "type": "number",
          "minimum": 0
        },
        "total_capacity": {
          "type": "number",
          "minimum": 0
        },
        "unit": {
          "type": "string",
          "maxLength": 50
        },
        "allocation_period": {
          "type": "object",
          "properties": {
            "start_date": {
              "type": "string",
              "format": "date-time"
            },
            "end_date": {
              "type": "string",
              "format": "date-time"
            }
          }
        }
      }
    },
    "RiskItem": {
      "type": "object",
      "required": ["id", "name", "level", "status", "probability", "impact"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "description": {
          "type": "string",
          "maxLength": 1000
        },
        "category": {
          "type": "string",
          "maxLength": 100
        },
        "level": {
          "type": "string",
          "enum": ["low", "medium", "high", "critical"]
        },
        "status": {
          "type": "string",
          "enum": ["identified", "assessed", "mitigated", "accepted", "occurred"]
        },
        "probability": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "impact": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "mitigation_plan": {
          "type": "string",
          "maxLength": 2000
        },
        "owner": {
          "type": "string",
          "maxLength": 255
        }
      }
    },
    "AuditTrail": {
      "type": "object",
      "required": ["enabled"],
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "retention_days": {
          "type": "integer",
          "minimum": 1,
          "maximum": 3650
        },
        "events": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/AuditEvent"
          }
        }
      }
    },
    "AuditEvent": {
      "type": "object",
      "required": ["event_id", "event_type", "timestamp", "user_id"],
      "properties": {
        "event_id": {
          "type": "string",
          "format": "uuid"
        },
        "event_type": {
          "type": "string",
          "enum": ["created", "updated", "deleted", "executed", "optimized", "validated"]
        },
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "user_id": {
          "type": "string"
        },
        "details": {
          "type": "object"
        },
        "ip_address": {
          "type": "string",
          "format": "ipv4"
        },
        "user_agent": {
          "type": "string"
        }
      }
    }
  }
}
```

## 🔄 **Request/Response Schemas**

### **CreatePlanRequestSchema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/create-plan-request.json",
  "title": "Create Plan Request Schema",
  "type": "object",
  "required": ["context_id", "name"],
  "properties": {
    "context_id": {
      "type": "string",
      "format": "uuid",
      "description": "Associated context identifier"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255,
      "description": "Plan name"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "Optional plan description"
    },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"],
      "default": "medium",
      "description": "Plan priority level"
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "type"],
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255
          },
          "description": {
            "type": "string",
            "maxLength": 1000
          },
          "type": {
            "type": "string",
            "enum": ["atomic", "composite", "milestone", "checkpoint"]
          },
          "priority": {
            "type": "string",
            "enum": ["critical", "high", "medium", "low"],
            "default": "medium"
          }
        }
      },
      "maxItems": 1000,
      "description": "Initial tasks for the plan"
    },
    "milestones": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "target_date"],
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255
          },
          "target_date": {
            "type": "string",
            "format": "date-time"
          },
          "criteria": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "maxItems": 100,
      "description": "Initial milestones for the plan"
    }
  }
}
```

### **PlanOperationResultSchema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/plan-operation-result.json",
  "title": "Plan Operation Result Schema",
  "type": "object",
  "required": ["success"],
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Operation success status"
    },
    "plan_id": {
      "type": "string",
      "format": "uuid",
      "description": "Plan identifier (when applicable)"
    },
    "message": {
      "type": "string",
      "description": "Human-readable result message"
    },
    "metadata": {
      "type": "object",
      "description": "Additional operation metadata"
    },
    "error": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string",
          "description": "Error code"
        },
        "message": {
          "type": "string",
          "description": "Error message"
        },
        "details": {
          "type": "object",
          "description": "Additional error details"
        }
      },
      "required": ["code", "message"],
      "description": "Error information (when success is false)"
    }
  }
}
```

## 📊 **Validation Rules**

### **Field Validation Rules**

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `plan_id` | string | Yes | UUID format, unique |
| `context_id` | string | Yes | UUID format, must exist |
| `name` | string | Yes | 1-255 characters, non-empty |
| `description` | string | No | Max 2000 characters |
| `status` | enum | Yes | One of: draft, approved, active, paused, completed, cancelled, failed |
| `priority` | enum | Yes | One of: critical, high, medium, low |
| `protocol_version` | string | Yes | Semantic version format (x.y.z) |
| `timestamp` | string | Yes | ISO 8601 date-time format |

### **Business Rules**

1. **Plan Status Transitions**:
   - `draft` → `approved`, `cancelled`
   - `approved` → `active`, `cancelled`
   - `active` → `paused`, `completed`, `failed`, `cancelled`
   - `paused` → `active`, `cancelled`
   - `completed`, `failed`, `cancelled` → (terminal states)

2. **Task Dependencies**:
   - No circular dependencies allowed
   - Dependency tasks must exist within the same plan
   - Dependency types must be valid

3. **Resource Allocation**:
   - `allocated_amount` cannot exceed `total_capacity`
   - Resource allocation periods cannot overlap for the same resource

4. **Risk Assessment**:
   - `probability` and `impact` must be between 0 and 1
   - Risk level is calculated based on probability × impact

## 🔧 **Schema Validation Examples**

### **Valid Plan Creation Request**
```json
{
  "context_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Software Development Plan",
  "description": "Complete development lifecycle plan",
  "priority": "high",
  "tasks": [
    {
      "name": "Requirements Analysis",
      "description": "Gather and analyze requirements",
      "type": "milestone",
      "priority": "critical"
    },
    {
      "name": "System Design",
      "description": "Design system architecture",
      "type": "composite",
      "priority": "high"
    }
  ],
  "milestones": [
    {
      "name": "Requirements Complete",
      "target_date": "2025-09-15T00:00:00Z",
      "criteria": [
        "All requirements documented",
        "Stakeholder approval received"
      ]
    }
  ]
}
```

### **Invalid Plan Creation Request (Validation Errors)**
```json
{
  "context_id": "invalid-uuid",           // Error: Invalid UUID format
  "name": "",                             // Error: Empty name not allowed
  "priority": "urgent",                   // Error: Invalid priority value
  "tasks": [
    {
      "name": "Task 1",
      "type": "invalid_type"               // Error: Invalid task type
    }
  ]
}
```

### **Validation Error Response**
```json
{
  "success": false,
  "error": {
    "code": "SCHEMA_VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {
          "field": "context_id",
          "message": "must be a valid UUID",
          "value": "invalid-uuid"
        },
        {
          "field": "name",
          "message": "must not be empty",
          "value": ""
        },
        {
          "field": "priority",
          "message": "must be one of: critical, high, medium, low",
          "value": "urgent"
        },
        {
          "field": "tasks[0].type",
          "message": "must be one of: atomic, composite, milestone, checkpoint",
          "value": "invalid_type"
        }
      ]
    }
  }
}
```

## 🎯 **Schema Extensions**

### **Custom Validation Rules**
The Plan Module supports custom validation rules for specific business requirements:

```json
{
  "custom_rules": [
    {
      "rule_id": "max_tasks_per_plan",
      "description": "Maximum number of tasks per plan",
      "condition": "tasks.length <= 1000",
      "severity": "error"
    },
    {
      "rule_id": "milestone_future_date",
      "description": "Milestone target date must be in the future",
      "condition": "milestones.every(m => new Date(m.target_date) > new Date())",
      "severity": "warning"
    }
  ]
}
```

### **Schema Versioning**
The Plan Module supports schema versioning for backward compatibility:

- **v1.0.0**: Initial schema version
- **v1.1.0**: Added risk management fields
- **v1.2.0**: Enhanced task dependency support
- **v2.0.0**: Major schema restructuring (future)

## 📝 **Schema Generation**

### **TypeScript Interface Generation**
```bash
# Generate TypeScript interfaces from JSON Schema
npm run generate:types

# Validate schema files
npm run validate:schemas

# Update schema documentation
npm run docs:schemas
```

### **Schema File Locations**
```
src/schemas/
├── mplp-plan.json              # Main plan schema
├── mplp-plan-request.json      # Request schemas
├── mplp-plan-response.json     # Response schemas
└── mplp-plan-validation.json   # Validation rules
```

---

**Schema Version**: 1.0.0
**JSON Schema Draft**: 07
**Last Updated**: 2025-08-30
**Validation Library**: [AJV](https://ajv.js.org/)
