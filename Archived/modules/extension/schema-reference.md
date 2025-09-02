# Extension Module Schema Reference

## 📋 **Overview**

The Extension Module uses JSON Schema (Draft-07) for data validation and structure definition. All schemas follow the dual naming convention with snake_case for schema definitions and camelCase for TypeScript implementations.

**Schema File**: `src/schemas/mplp-extension.json`  
**Schema Version**: Draft-07  
**Naming Convention**: snake_case (Schema) ↔ camelCase (TypeScript)  
**Validation**: Strict validation with comprehensive error reporting

## 🗂️ **Core Schema Structure**

### **ExtensionSchema (Root Schema)**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/extension.json",
  "title": "MPLP Extension Schema",
  "description": "Schema for MPLP Extension entities",
  "type": "object",
  "required": [
    "extension_id",
    "context_id",
    "name",
    "display_name",
    "description",
    "version",
    "extension_type",
    "status",
    "protocol_version",
    "timestamp",
    "compatibility",
    "configuration",
    "extension_points",
    "api_extensions",
    "event_subscriptions",
    "lifecycle",
    "security",
    "metadata",
    "audit_trail",
    "performance_metrics",
    "monitoring_integration",
    "version_history",
    "search_metadata",
    "event_integration"
  ],
  "properties": {
    "extension_id": {
      "type": "string",
      "pattern": "^ext-[a-zA-Z0-9-]+$",
      "description": "Unique extension identifier"
    },
    "context_id": {
      "type": "string",
      "pattern": "^ctx-[a-zA-Z0-9-]+$",
      "description": "Associated context identifier"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "pattern": "^[a-z0-9-]+$",
      "description": "Extension name (lowercase, alphanumeric, hyphens)"
    },
    "display_name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Human-readable extension name"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000,
      "description": "Extension description"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$",
      "description": "Semantic version (e.g., 1.0.0, 1.0.0-beta.1)"
    },
    "extension_type": {
      "type": "string",
      "enum": ["plugin", "adapter", "connector", "middleware", "hook", "transformer"],
      "description": "Type of extension"
    },
    "status": {
      "type": "string",
      "enum": ["installed", "active", "inactive", "disabled", "error", "updating", "uninstalling"],
      "description": "Current extension status"
    },
    "protocol_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "MPLP protocol version"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Last modification timestamp"
    }
  }
}
```

### **ExtensionCompatibilitySchema**
```json
{
  "type": "object",
  "required": ["mplp_version", "required_modules", "dependencies", "conflicts"],
  "properties": {
    "mplp_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Compatible MPLP version"
    },
    "required_modules": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["context", "plan", "confirm", "trace", "role", "extension", "core", "collab", "dialog", "network"]
      },
      "description": "Required MPLP modules"
    },
    "dependencies": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/DependencySchema"
      },
      "description": "Extension dependencies"
    },
    "conflicts": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Conflicting extensions"
    }
  }
}
```

### **DependencySchema**
```json
{
  "type": "object",
  "required": ["name", "version", "optional", "reason"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Dependency name"
    },
    "version": {
      "type": "string",
      "pattern": "^[\\^~]?\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$",
      "description": "Dependency version range"
    },
    "optional": {
      "type": "boolean",
      "description": "Whether dependency is optional"
    },
    "reason": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Reason for dependency"
    }
  }
}
```

### **ExtensionConfigurationSchema**
```json
{
  "type": "object",
  "required": ["schema", "current_config", "default_config", "validation_rules"],
  "properties": {
    "schema": {
      "type": "object",
      "description": "JSON Schema for configuration validation"
    },
    "current_config": {
      "type": "object",
      "description": "Current configuration values"
    },
    "default_config": {
      "type": "object",
      "description": "Default configuration values"
    },
    "validation_rules": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ValidationRuleSchema"
      },
      "description": "Custom validation rules"
    }
  }
}
```

### **ExtensionPointSchema**
```json
{
  "type": "object",
  "required": ["id", "name", "type", "description", "parameters", "return_type", "async", "execution_order"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Extension point identifier"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Extension point name"
    },
    "type": {
      "type": "string",
      "enum": ["hook", "filter", "action", "api_endpoint", "event_listener"],
      "description": "Extension point type"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Extension point description"
    },
    "parameters": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ParameterSchema"
      },
      "description": "Extension point parameters"
    },
    "return_type": {
      "type": "string",
      "description": "Return type specification"
    },
    "async": {
      "type": "boolean",
      "description": "Whether extension point is asynchronous"
    },
    "timeout": {
      "type": "integer",
      "minimum": 100,
      "maximum": 300000,
      "description": "Timeout in milliseconds"
    },
    "retry_policy": {
      "$ref": "#/definitions/RetryPolicySchema"
    },
    "conditional_execution": {
      "$ref": "#/definitions/ConditionalExecutionSchema"
    },
    "execution_order": {
      "type": "integer",
      "minimum": 1,
      "maximum": 1000,
      "description": "Execution order priority"
    }
  }
}
```

### **ApiExtensionSchema**
```json
{
  "type": "object",
  "required": ["endpoint", "method", "handler", "middleware", "authentication", "rate_limit", "validation", "documentation"],
  "properties": {
    "endpoint": {
      "type": "string",
      "pattern": "^/[a-zA-Z0-9/_-]*$",
      "description": "API endpoint path"
    },
    "method": {
      "type": "string",
      "enum": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      "description": "HTTP method"
    },
    "handler": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Handler function name"
    },
    "middleware": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Middleware stack"
    },
    "authentication": {
      "$ref": "#/definitions/AuthenticationConfigSchema"
    },
    "rate_limit": {
      "$ref": "#/definitions/RateLimitConfigSchema"
    },
    "validation": {
      "$ref": "#/definitions/ValidationConfigSchema"
    },
    "documentation": {
      "$ref": "#/definitions/ApiDocumentationSchema"
    }
  }
}
```

### **EventSubscriptionSchema**
```json
{
  "type": "object",
  "required": ["event_pattern", "handler", "filter_conditions", "delivery_guarantee", "dead_letter_queue", "retry_policy", "batch_processing"],
  "properties": {
    "event_pattern": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Event pattern to match (supports wildcards)"
    },
    "handler": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Event handler function name"
    },
    "filter_conditions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/FilterConditionSchema"
      },
      "description": "Event filtering conditions"
    },
    "delivery_guarantee": {
      "type": "string",
      "enum": ["at_most_once", "at_least_once", "exactly_once"],
      "description": "Message delivery guarantee"
    },
    "dead_letter_queue": {
      "$ref": "#/definitions/DeadLetterQueueConfigSchema"
    },
    "retry_policy": {
      "$ref": "#/definitions/RetryPolicySchema"
    },
    "batch_processing": {
      "$ref": "#/definitions/BatchProcessingConfigSchema"
    }
  }
}
```

### **ExtensionSecuritySchema**
```json
{
  "type": "object",
  "required": ["sandbox_enabled", "resource_limits", "code_signing", "permissions"],
  "properties": {
    "sandbox_enabled": {
      "type": "boolean",
      "description": "Whether sandboxing is enabled"
    },
    "resource_limits": {
      "$ref": "#/definitions/ResourceLimitsSchema"
    },
    "code_signing": {
      "$ref": "#/definitions/CodeSigningSchema"
    },
    "permissions": {
      "$ref": "#/definitions/PermissionsSchema"
    }
  }
}
```

### **ExtensionMetadataSchema**
```json
{
  "type": "object",
  "required": ["author", "license", "keywords", "category", "screenshots"],
  "properties": {
    "author": {
      "$ref": "#/definitions/AuthorSchema"
    },
    "organization": {
      "$ref": "#/definitions/OrganizationSchema"
    },
    "license": {
      "$ref": "#/definitions/LicenseSchema"
    },
    "homepage": {
      "type": "string",
      "format": "uri",
      "description": "Extension homepage URL"
    },
    "repository": {
      "$ref": "#/definitions/RepositorySchema"
    },
    "documentation": {
      "type": "string",
      "format": "uri",
      "description": "Documentation URL"
    },
    "support": {
      "$ref": "#/definitions/SupportSchema"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
      },
      "maxItems": 20,
      "description": "Extension keywords for search"
    },
    "category": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "description": "Extension category"
    },
    "screenshots": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "uri"
      },
      "maxItems": 10,
      "description": "Screenshot URLs"
    }
  }
}
```

## 🔄 **Schema Validation**

### **Validation Rules**
1. **Required Fields**: All required fields must be present
2. **Type Validation**: Fields must match specified types
3. **Format Validation**: String formats (date-time, uri, etc.) are validated
4. **Pattern Validation**: String patterns are enforced
5. **Range Validation**: Numeric ranges are validated
6. **Enum Validation**: Enum values are strictly enforced

### **Custom Validation**
```typescript
// Example custom validation rule
{
  "field": "version",
  "type": "string",
  "required": true,
  "pattern": "^\\d+\\.\\d+\\.\\d+$",
  "custom_validator": "semantic_version"
}
```

### **Validation Error Format**
```json
{
  "valid": false,
  "errors": [
    {
      "field": "extension_type",
      "message": "must be one of: plugin, adapter, connector, middleware, hook, transformer",
      "value": "invalid_type",
      "path": "/extension_type"
    }
  ]
}
```

## 📊 **Schema Statistics**

### **Schema Complexity**
- **Total Properties**: 150+
- **Required Properties**: 25
- **Optional Properties**: 125+
- **Nested Objects**: 20+
- **Array Properties**: 15+
- **Enum Properties**: 8

### **Validation Performance**
- **Simple Validation**: <1ms
- **Complex Validation**: <5ms
- **Batch Validation**: <10ms per item
- **Schema Compilation**: <50ms

## 🔗 **Schema Relationships**

### **Dependencies**
```
ExtensionSchema
├── ExtensionCompatibilitySchema
│   └── DependencySchema
├── ExtensionConfigurationSchema
│   └── ValidationRuleSchema
├── ExtensionPointSchema
│   ├── ParameterSchema
│   ├── RetryPolicySchema
│   └── ConditionalExecutionSchema
├── ApiExtensionSchema
│   ├── AuthenticationConfigSchema
│   ├── RateLimitConfigSchema
│   ├── ValidationConfigSchema
│   └── ApiDocumentationSchema
├── EventSubscriptionSchema
│   ├── FilterConditionSchema
│   ├── DeadLetterQueueConfigSchema
│   ├── RetryPolicySchema
│   └── BatchProcessingConfigSchema
├── ExtensionSecuritySchema
│   ├── ResourceLimitsSchema
│   ├── CodeSigningSchema
│   └── PermissionsSchema
└── ExtensionMetadataSchema
    ├── AuthorSchema
    ├── OrganizationSchema
    ├── LicenseSchema
    ├── RepositorySchema
    └── SupportSchema
```

## 🛠️ **Schema Usage Examples**

### **Valid Extension Schema**
```json
{
  "extension_id": "ext-my-plugin-001",
  "context_id": "ctx-project-001",
  "name": "my-plugin",
  "display_name": "My Custom Plugin",
  "description": "A custom plugin for enhanced functionality",
  "version": "1.0.0",
  "extension_type": "plugin",
  "status": "active",
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-27T10:00:00.000Z",
  "compatibility": {
    "mplp_version": "1.0.0",
    "required_modules": ["context"],
    "dependencies": [],
    "conflicts": []
  },
  "configuration": {
    "schema": {"type": "object"},
    "current_config": {"enabled": true},
    "default_config": {"enabled": false},
    "validation_rules": []
  },
  "extension_points": [],
  "api_extensions": [],
  "event_subscriptions": [],
  "lifecycle": {
    "install_date": "2025-08-27T10:00:00.000Z",
    "last_update": "2025-08-27T10:00:00.000Z",
    "activation_count": 1,
    "error_count": 0,
    "performance_metrics": {
      "average_response_time": 50,
      "throughput": 100,
      "error_rate": 0,
      "memory_usage": 1024,
      "cpu_usage": 5,
      "last_measurement": "2025-08-27T10:00:00.000Z"
    },
    "health_check": {
      "enabled": true,
      "interval": 30000,
      "timeout": 5000,
      "healthy_threshold": 2,
      "unhealthy_threshold": 3
    }
  },
  "security": {
    "sandbox_enabled": true,
    "resource_limits": {
      "max_memory": 104857600,
      "max_cpu": 50,
      "max_file_size": 10485760,
      "max_network_connections": 10,
      "allowed_domains": [],
      "blocked_domains": []
    },
    "code_signing": {
      "required": false,
      "trusted_signers": []
    },
    "permissions": {
      "file_system": {"read": [], "write": [], "execute": []},
      "network": {"allowed_hosts": [], "allowed_ports": [], "protocols": []},
      "database": {"read": [], "write": [], "admin": []},
      "api": {"endpoints": [], "methods": [], "rate_limit": 100}
    }
  },
  "metadata": {
    "author": {"name": "Developer Name"},
    "license": {"type": "MIT"},
    "keywords": ["plugin"],
    "category": "utility",
    "screenshots": []
  },
  "audit_trail": {
    "events": [],
    "compliance_settings": {
      "retention_period": 365,
      "encryption_required": false,
      "audit_level": "standard"
    }
  },
  "performance_metrics": {
    "activation_latency": 100,
    "execution_time": 50,
    "memory_footprint": 1024,
    "cpu_utilization": 5,
    "network_latency": 10,
    "error_rate": 0,
    "throughput": 100,
    "availability": 99.9,
    "efficiency_score": 95,
    "health_status": "healthy",
    "alerts": []
  },
  "monitoring_integration": {
    "providers": ["prometheus"],
    "endpoints": [],
    "dashboards": [],
    "alerting": {
      "enabled": true,
      "channels": ["email"],
      "thresholds": {
        "error_rate": 5,
        "response_time": 1000,
        "availability": 95
      }
    }
  },
  "version_history": {
    "versions": [],
    "auto_versioning": {
      "enabled": false,
      "strategy": "semantic",
      "triggers": ["api_change"]
    }
  },
  "search_metadata": {
    "indexed_fields": ["name", "description"],
    "search_strategies": [],
    "facets": []
  },
  "event_integration": {
    "event_bus": {
      "provider": "internal",
      "connection_string": "",
      "topics": []
    },
    "event_routing": {
      "rules": [],
      "default_route": "default"
    },
    "event_transformation": {
      "enabled": false,
      "rules": []
    }
  }
}
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-31
**Maintainer**: MPLP Development Team
