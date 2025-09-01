# Dialog Module Schema Reference

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2025-08-31
**Schema File**: `src/schemas/mplp-dialog.json`
**Naming Convention**: Dual naming (snake_case ↔ camelCase)
**Validation**: 100% Schema compliance

This document provides comprehensive reference for the Dialog Module JSON Schema with dual naming convention, including all field definitions, validation rules, and Schema-TypeScript mapping.

## 📋 **Schema Overview**

The Dialog Module uses JSON Schema Draft-07 for data validation and structure definition. The schema defines the complete structure for dialog management with intelligent capabilities and multi-modal support.

### **Schema Metadata**
- **Schema ID**: `https://mplp.dev/schemas/dialog/v1.0.0`
- **Schema Version**: `1.0.0`
- **Draft Version**: `draft-07`
- **Content Type**: `application/json`

## 🏗️ **Root Schema Structure**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/dialog/v1.0.0",
  "title": "MPLP Dialog Schema",
  "description": "Schema for MPLP Dialog Module - Intelligent Dialog Management",
  "type": "object",
  "required": [
    "protocol_version",
    "timestamp",
    "dialog_id",
    "name",
    "participants",
    "status",
    "created_at",
    "updated_at",
    "capabilities"
  ],
  "properties": {
    // Schema properties defined below
  }
}
```

## 📊 **Core Properties**

### **Basic Protocol Fields**

#### **protocol_version**
```json
{
  "protocol_version": {
    "type": "string",
    "pattern": "^\\d+\\.\\d+\\.\\d+$",
    "description": "MPLP protocol version",
    "examples": ["1.0.0", "1.1.0"]
  }
}
```

#### **timestamp**
```json
{
  "timestamp": {
    "type": "string",
    "format": "date-time",
    "description": "ISO 8601 timestamp",
    "examples": ["2025-01-27T10:30:00.000Z"]
  }
}
```

#### **dialog_id**
```json
{
  "dialog_id": {
    "type": "string",
    "format": "uuid",
    "description": "Unique dialog identifier",
    "examples": ["550e8400-e29b-41d4-a716-446655440000"]
  }
}
```

#### **name**
```json
{
  "name": {
    "type": "string",
    "minLength": 1,
    "maxLength": 255,
    "description": "Dialog name",
    "examples": ["Customer Support Dialog", "AI Assistant Chat"]
  }
}
```

#### **participants**
```json
{
  "participants": {
    "type": "array",
    "items": {
      "type": "string",
      "minLength": 1
    },
    "minItems": 1,
    "uniqueItems": true,
    "description": "List of participant IDs",
    "examples": [["user-123", "agent-456"]]
  }
}
```

#### **status**
```json
{
  "status": {
    "type": "string",
    "enum": ["active", "paused", "completed", "terminated"],
    "description": "Dialog status",
    "default": "active"
  }
}
```

### **Timestamp Fields**

#### **created_at / updated_at**
```json
{
  "created_at": {
    "type": "string",
    "format": "date-time",
    "description": "Dialog creation timestamp"
  },
  "updated_at": {
    "type": "string",
    "format": "date-time",
    "description": "Last update timestamp"
  }
}
```

## 🧠 **Capabilities Schema**

### **Capabilities Object**
```json
{
  "capabilities": {
    "type": "object",
    "required": ["basic"],
    "properties": {
      "basic": {
        "$ref": "#/definitions/capability"
      },
      "intelligent_control": {
        "$ref": "#/definitions/capability"
      },
      "critical_thinking": {
        "$ref": "#/definitions/capability"
      },
      "knowledge_search": {
        "$ref": "#/definitions/capability"
      },
      "multimodal": {
        "$ref": "#/definitions/capability"
      },
      "context_awareness": {
        "$ref": "#/definitions/capability"
      },
      "emotional_intelligence": {
        "$ref": "#/definitions/capability"
      },
      "creative_problem_solving": {
        "$ref": "#/definitions/capability"
      },
      "ethical_reasoning": {
        "$ref": "#/definitions/capability"
      },
      "adaptive_learning": {
        "$ref": "#/definitions/capability"
      }
    },
    "additionalProperties": false
  }
}
```

### **Capability Definition**
```json
{
  "definitions": {
    "capability": {
      "type": "object",
      "required": ["enabled"],
      "properties": {
        "enabled": {
          "type": "boolean",
          "description": "Whether the capability is enabled"
        },
        "configuration": {
          "type": "object",
          "description": "Capability-specific configuration",
          "additionalProperties": true
        },
        "priority": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "description": "Capability priority (0-10)"
        }
      },
      "additionalProperties": false
    }
  }
}
```

## 🎯 **Strategy Schema**

### **Strategy Configuration**
```json
{
  "strategy": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["guided", "free-form", "structured", "adaptive"],
        "description": "Dialog strategy type",
        "default": "adaptive"
      },
      "rounds": {
        "type": "object",
        "properties": {
          "max_rounds": {
            "type": "number",
            "minimum": 1,
            "description": "Maximum number of dialog rounds"
          },
          "current_round": {
            "type": "number",
            "minimum": 0,
            "description": "Current dialog round"
          }
        }
      },
      "exit_criteria": {
        "type": "object",
        "properties": {
          "timeout": {
            "type": "number",
            "minimum": 0,
            "description": "Timeout in milliseconds"
          },
          "max_turns": {
            "type": "number",
            "minimum": 1,
            "description": "Maximum number of turns"
          },
          "completion_conditions": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Conditions for dialog completion"
          }
        }
      },
      "adaptation_rules": {
        "type": "object",
        "description": "Rules for strategy adaptation",
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  }
}
```

## 🔄 **Context Schema**

### **Context Configuration**
```json
{
  "context": {
    "type": "object",
    "properties": {
      "session_id": {
        "type": "string",
        "description": "Session identifier"
      },
      "context_id": {
        "type": "string",
        "description": "Context identifier"
      },
      "knowledge_base": {
        "type": "string",
        "description": "Knowledge base identifier"
      },
      "previous_dialogs": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Previous dialog IDs"
      },
      "memory_settings": {
        "type": "object",
        "properties": {
          "retention_policy": {
            "type": "string",
            "enum": ["session", "persistent", "temporary"]
          },
          "max_memory_size": {
            "type": "number",
            "minimum": 0
          }
        }
      }
    },
    "additionalProperties": false
  }
}
```

## ⚙️ **Configuration Schema**

### **Dialog Configuration**
```json
{
  "configuration": {
    "type": "object",
    "properties": {
      "max_turns": {
        "type": "number",
        "minimum": 1,
        "maximum": 1000,
        "description": "Maximum number of dialog turns"
      },
      "timeout": {
        "type": "number",
        "minimum": 0,
        "description": "Dialog timeout in milliseconds"
      },
      "enable_logging": {
        "type": "boolean",
        "description": "Enable dialog logging",
        "default": true
      },
      "enable_metrics": {
        "type": "boolean",
        "description": "Enable metrics collection",
        "default": true
      },
      "custom_settings": {
        "type": "object",
        "description": "Custom configuration settings",
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  }
}
```

## 🎭 **Multi-modal Schema**

### **Multi-modal Support**
```json
{
  "multimodal_support": {
    "type": "array",
    "items": {
      "type": "string",
      "enum": ["text", "voice", "image", "video", "gesture", "touch"]
    },
    "uniqueItems": true,
    "description": "Supported modalities"
  },
  "input_modes": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "Supported input modes"
  },
  "output_modes": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "Supported output modes"
  },
  "processing_options": {
    "type": "object",
    "properties": {
      "parallel_processing": {
        "type": "boolean",
        "description": "Enable parallel processing"
      },
      "quality_settings": {
        "type": "object",
        "properties": {
          "audio_quality": {
            "type": "string",
            "enum": ["low", "medium", "high"]
          },
          "image_quality": {
            "type": "string",
            "enum": ["low", "medium", "high"]
          }
        }
      }
    }
  }
}
```

## 📊 **Metadata Schema**

### **Metadata and Audit**
```json
{
  "metadata": {
    "type": "object",
    "properties": {
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Dialog tags"
      },
      "category": {
        "type": "string",
        "description": "Dialog category"
      },
      "priority": {
        "type": "number",
        "minimum": 0,
        "maximum": 10,
        "description": "Dialog priority"
      },
      "owner": {
        "type": "string",
        "description": "Dialog owner ID"
      }
    }
  },
  "audit_trail": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "action": {
          "type": "string"
        },
        "user_id": {
          "type": "string"
        },
        "details": {
          "type": "object"
        }
      },
      "required": ["timestamp", "action"]
    }
  },
  "performance_metrics": {
    "type": "object",
    "properties": {
      "response_time": {
        "type": "number",
        "minimum": 0
      },
      "processing_time": {
        "type": "number",
        "minimum": 0
      },
      "memory_usage": {
        "type": "number",
        "minimum": 0
      }
    }
  }
}
```

## ✅ **Validation Examples**

### **Valid Dialog Schema**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "dialog_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Customer Support Dialog",
  "description": "AI-powered customer support conversation",
  "participants": ["user-123", "agent-456"],
  "status": "active",
  "created_at": "2025-01-27T10:30:00.000Z",
  "updated_at": "2025-01-27T10:30:00.000Z",
  "capabilities": {
    "basic": {
      "enabled": true,
      "priority": 10
    },
    "intelligent_control": {
      "enabled": true,
      "priority": 8,
      "configuration": {
        "auto_escalation": true
      }
    },
    "context_awareness": {
      "enabled": true,
      "priority": 7
    }
  },
  "strategy": {
    "type": "adaptive",
    "exit_criteria": {
      "timeout": 1800000,
      "max_turns": 50
    }
  },
  "multimodal_support": ["text", "voice"],
  "configuration": {
    "enable_logging": true,
    "enable_metrics": true
  }
}
```

### **Schema Validation Usage**
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import dialogSchema from './mplp-dialog.json';

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(dialogSchema);

// Validate dialog data
const isValid = validate(dialogData);
if (!isValid) {
  console.error('Validation errors:', validate.errors);
}
```

## 🔧 **Schema Utilities**

### **Schema Validation Helper**
```typescript
export class DialogSchemaValidator {
  private static validator = ajv.compile(dialogSchema);

  static validate(data: unknown): ValidationResult {
    const isValid = this.validator(data);
    return {
      valid: isValid,
      errors: this.validator.errors || [],
      data: isValid ? data as DialogSchema : null
    };
  }

  static validateAndThrow(data: unknown): DialogSchema {
    const result = this.validate(data);
    if (!result.valid) {
      throw new ValidationError('Invalid dialog schema', result.errors);
    }
    return result.data!;
  }
}
```

---

**Schema Version**: 1.0.0  
**Module Version**: 1.0.0  
**Last Updated**: 2025-01-27  
**Status**: Production Ready  
**Validation**: JSON Schema Draft-07 Compliant
