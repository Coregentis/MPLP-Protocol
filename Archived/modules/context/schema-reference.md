# Context Module Schema Reference

## 📋 **Schema Overview**

The Context Module uses JSON Schema Draft-07 for data validation with a strict dual naming convention:
- **Schema Layer**: snake_case (for JSON/API)
- **TypeScript Layer**: camelCase (for application code)

**Schema File**: `src/schemas/mplp-context.json`  
**Schema Version**: Draft-07  
**Naming Convention**: snake_case  

## 🏗️ **Core Schema Structure**

### **Main Context Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/context.json",
  "title": "MPLP Context Schema",
  "description": "Schema for MPLP Context management protocol",
  "type": "object",
  "required": [
    "protocol_version",
    "timestamp", 
    "context_id",
    "name",
    "status",
    "lifecycle_stage",
    "shared_state",
    "access_control",
    "configuration",
    "audit_trail"
  ],
  "properties": {
    "protocol_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "MPLP protocol version"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp"
    },
    "context_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique context identifier"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255,
      "description": "Context name"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "Context description"
    },
    "status": {
      "$ref": "#/definitions/context_status"
    },
    "lifecycle_stage": {
      "$ref": "#/definitions/lifecycle_stage"
    },
    "shared_state": {
      "$ref": "#/definitions/shared_state"
    },
    "access_control": {
      "$ref": "#/definitions/access_control"
    },
    "configuration": {
      "$ref": "#/definitions/configuration"
    },
    "audit_trail": {
      "$ref": "#/definitions/audit_trail"
    },
    "monitoring_integration": {
      "$ref": "#/definitions/monitoring_integration"
    },
    "performance_metrics": {
      "$ref": "#/definitions/performance_metrics"
    },
    "version_history": {
      "$ref": "#/definitions/version_history"
    },
    "search_metadata": {
      "$ref": "#/definitions/search_metadata"
    },
    "caching_policy": {
      "$ref": "#/definitions/caching_policy"
    },
    "sync_configuration": {
      "$ref": "#/definitions/sync_configuration"
    },
    "error_handling": {
      "$ref": "#/definitions/error_handling"
    },
    "integration_endpoints": {
      "$ref": "#/definitions/integration_endpoints"
    },
    "event_integration": {
      "$ref": "#/definitions/event_integration"
    }
  }
}
```

## 🔧 **Schema Definitions**

### **Context Status**
```json
{
  "context_status": {
    "type": "string",
    "enum": ["active", "suspended", "completed", "terminated"],
    "description": "Current status of the context"
  }
}
```

### **Lifecycle Stage**
```json
{
  "lifecycle_stage": {
    "type": "string", 
    "enum": ["planning", "executing", "monitoring", "completed"],
    "description": "Current lifecycle stage of the context"
  }
}
```

### **Shared State**
```json
{
  "shared_state": {
    "type": "object",
    "required": ["variables", "resources", "dependencies", "goals"],
    "properties": {
      "variables": {
        "type": "object",
        "additionalProperties": true,
        "description": "Shared variables accessible to all agents"
      },
      "resources": {
        "type": "object",
        "required": ["allocated", "requirements"],
        "properties": {
          "allocated": {
            "type": "object",
            "additionalProperties": true,
            "description": "Currently allocated resources"
          },
          "requirements": {
            "type": "object", 
            "additionalProperties": true,
            "description": "Resource requirements"
          }
        }
      },
      "dependencies": {
        "type": "array",
        "items": {
          "type": "string",
          "format": "uuid"
        },
        "description": "Context dependencies"
      },
      "goals": {
        "type": "array",
        "items": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "description": "Context goals and objectives"
      }
    }
  }
}
```

### **Access Control**
```json
{
  "access_control": {
    "type": "object",
    "required": ["owner", "permissions"],
    "properties": {
      "owner": {
        "type": "object",
        "required": ["user_id", "role"],
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "description": "Owner user ID"
          },
          "role": {
            "$ref": "#/definitions/user_role"
          }
        }
      },
      "permissions": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/permission"
        },
        "description": "Access permissions for other users"
      }
    }
  }
}
```

### **User Role**
```json
{
  "user_role": {
    "type": "string",
    "enum": ["admin", "manager", "developer", "viewer", "user"],
    "description": "User role in the system"
  }
}
```

### **Permission**
```json
{
  "permission": {
    "type": "object",
    "required": ["user_id", "role", "permissions"],
    "properties": {
      "user_id": {
        "type": "string",
        "format": "uuid"
      },
      "role": {
        "$ref": "#/definitions/user_role"
      },
      "permissions": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["read", "write", "delete", "admin"]
        }
      },
      "granted_at": {
        "type": "string",
        "format": "date-time"
      },
      "expires_at": {
        "type": "string",
        "format": "date-time"
      }
    }
  }
}
```

### **Configuration**
```json
{
  "configuration": {
    "type": "object",
    "required": ["timeout_settings", "persistence"],
    "properties": {
      "timeout_settings": {
        "type": "object",
        "required": ["default_timeout", "max_timeout"],
        "properties": {
          "default_timeout": {
            "type": "integer",
            "minimum": 1000,
            "maximum": 3600000,
            "description": "Default timeout in milliseconds"
          },
          "max_timeout": {
            "type": "integer", 
            "minimum": 1000,
            "maximum": 3600000,
            "description": "Maximum timeout in milliseconds"
          }
        }
      },
      "persistence": {
        "type": "object",
        "required": ["enabled", "storage_backend"],
        "properties": {
          "enabled": {
            "type": "boolean",
            "description": "Enable persistence"
          },
          "storage_backend": {
            "type": "string",
            "enum": ["memory", "database", "file"],
            "description": "Storage backend type"
          }
        }
      }
    }
  }
}
```

### **Audit Trail**
```json
{
  "audit_trail": {
    "type": "object",
    "required": ["enabled", "retention_days", "audit_events", "compliance_settings"],
    "properties": {
      "enabled": {
        "type": "boolean",
        "description": "Enable audit trail"
      },
      "retention_days": {
        "type": "integer",
        "minimum": 1,
        "maximum": 3650,
        "description": "Audit log retention in days"
      },
      "audit_events": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/audit_event"
        }
      },
      "compliance_settings": {
        "type": "object",
        "required": ["retention_period", "encryption_required"],
        "properties": {
          "retention_period": {
            "type": "string",
            "pattern": "^\\d+[ymd]$",
            "description": "Compliance retention period (e.g., '7y', '90d')"
          },
          "encryption_required": {
            "type": "boolean",
            "description": "Require encryption for audit data"
          }
        }
      }
    }
  }
}
```

### **Audit Event**
```json
{
  "audit_event": {
    "type": "object",
    "required": ["event_id", "timestamp", "user_id", "action", "resource"],
    "properties": {
      "event_id": {
        "type": "string",
        "format": "uuid"
      },
      "timestamp": {
        "type": "string",
        "format": "date-time"
      },
      "user_id": {
        "type": "string",
        "format": "uuid"
      },
      "action": {
        "type": "string",
        "enum": ["create", "read", "update", "delete", "access"]
      },
      "resource": {
        "type": "string",
        "description": "Resource identifier"
      },
      "details": {
        "type": "object",
        "additionalProperties": true,
        "description": "Additional event details"
      },
      "ip_address": {
        "type": "string",
        "format": "ipv4"
      },
      "user_agent": {
        "type": "string",
        "maxLength": 500
      }
    }
  }
}
```

## 🔄 **Dual Naming Convention**

### **Schema to TypeScript Mapping**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type |
|---------------------------|------------------------------|------|
| `context_id` | `contextId` | UUID |
| `created_at` | `createdAt` | Date |
| `updated_at` | `updatedAt` | Date |
| `lifecycle_stage` | `lifecycleStage` | LifecycleStage |
| `shared_state` | `sharedState` | SharedState |
| `access_control` | `accessControl` | AccessControl |
| `timeout_settings` | `timeoutSettings` | TimeoutSettings |
| `audit_trail` | `auditTrail` | AuditTrail |
| `monitoring_integration` | `monitoringIntegration` | MonitoringIntegration |
| `performance_metrics` | `performanceMetrics` | PerformanceMetrics |
| `version_history` | `versionHistory` | VersionHistory |
| `search_metadata` | `searchMetadata` | SearchMetadata |
| `caching_policy` | `cachingPolicy` | CachingPolicy |
| `sync_configuration` | `syncConfiguration` | SyncConfiguration |
| `error_handling` | `errorHandling` | ErrorHandling |
| `integration_endpoints` | `integrationEndpoints` | IntegrationEndpoints |
| `event_integration` | `eventIntegration` | EventIntegration |

### **Mapping Implementation**
```typescript
class ContextMapper {
  static toSchema(entity: ContextEntityData): ContextSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      lifecycle_stage: entity.lifecycleStage,
      shared_state: {
        variables: entity.sharedState.variables,
        resources: entity.sharedState.resources,
        dependencies: entity.sharedState.dependencies,
        goals: entity.sharedState.goals
      },
      access_control: {
        owner: {
          user_id: entity.accessControl.owner.userId,
          role: entity.accessControl.owner.role
        },
        permissions: entity.accessControl.permissions.map(p => ({
          user_id: p.userId,
          role: p.role,
          permissions: p.permissions,
          granted_at: p.grantedAt,
          expires_at: p.expiresAt
        }))
      },
      // ... additional field mappings
    };
  }

  static fromSchema(schema: ContextSchema): ContextEntityData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp as Timestamp,
      contextId: schema.context_id as UUID,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      lifecycleStage: schema.lifecycle_stage,
      sharedState: {
        variables: schema.shared_state.variables,
        resources: schema.shared_state.resources,
        dependencies: schema.shared_state.dependencies,
        goals: schema.shared_state.goals
      },
      accessControl: {
        owner: {
          userId: schema.access_control.owner.user_id as UUID,
          role: schema.access_control.owner.role
        },
        permissions: schema.access_control.permissions.map(p => ({
          userId: p.user_id as UUID,
          role: p.role,
          permissions: p.permissions,
          grantedAt: p.granted_at as Timestamp,
          expiresAt: p.expires_at as Timestamp
        }))
      },
      // ... additional field mappings
    };
  }

  static validateSchema(data: unknown): data is ContextSchema {
    // JSON Schema validation implementation
    return ajv.validate(contextSchema, data);
  }
}
```

## ✅ **Schema Validation**

### **Validation Rules**
- **Required Fields**: All required fields must be present
- **Type Validation**: All fields must match specified types
- **Format Validation**: UUIDs, dates, emails must be valid
- **Range Validation**: Numbers must be within specified ranges
- **Pattern Validation**: Strings must match specified patterns
- **Enum Validation**: Values must be from allowed enums

### **Custom Formats**
```typescript
// UUID format validation
ajv.addFormat('uuid', {
  type: 'string',
  validate: (data: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data)
});

// Date-time format validation
ajv.addFormat('date-time', {
  type: 'string',
  validate: (data: string) => !isNaN(Date.parse(data))
});
```

### **Validation Examples**
```typescript
// Valid context schema
const validContext = {
  protocol_version: "1.0.0",
  timestamp: "2025-01-25T12:00:00.000Z",
  context_id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Valid Context",
  status: "active",
  lifecycle_stage: "planning",
  shared_state: {
    variables: {},
    resources: { allocated: {}, requirements: {} },
    dependencies: [],
    goals: []
  },
  access_control: {
    owner: { user_id: "550e8400-e29b-41d4-a716-446655440001", role: "admin" },
    permissions: []
  },
  // ... other required fields
};

// Validation
const isValid = ContextMapper.validateSchema(validContext);
console.log('Is valid:', isValid); // true
```

## 🔍 **Schema Evolution**

### **Versioning Strategy**
- **Backward Compatibility**: New versions maintain backward compatibility
- **Deprecation Process**: Old fields marked as deprecated before removal
- **Migration Support**: Automatic migration between schema versions
- **Version Detection**: Schema version field for compatibility checking

### **Schema Updates**
- **Additive Changes**: New optional fields can be added
- **Breaking Changes**: Require new schema version
- **Field Deprecation**: Gradual removal process with warnings
- **Format Changes**: Careful validation and migration

---

**Schema Version**: 1.0.0  
**JSON Schema Draft**: 07  
**Last Updated**: 2025-01-25  
**Status**: Production Ready
