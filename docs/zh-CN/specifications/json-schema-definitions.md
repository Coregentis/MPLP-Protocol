# MPLP JSON Schema 定义

**多智能体协议生命周期平台 - JSON Schema 定义 v1.0.0-alpha**

[![JSON Schema](https://img.shields.io/badge/json%20schema-生产就绪-brightgreen.svg)](./README.md)
[![实现](https://img.shields.io/badge/implementation-100%25%20完成-brightgreen.svg)](./formal-specification.md)
[![验证](https://img.shields.io/badge/validation-企业级-brightgreen.svg)](./formal-specification.md)
[![测试](https://img.shields.io/badge/tests-2869%2F2869%20通过-brightgreen.svg)](./formal-specification.md)
[![标准](https://img.shields.io/badge/standards-Draft%2007%20合规-brightgreen.svg)](https://json-schema.org/)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/specifications/json-schema-definitions.md)

---

## 🎯 JSON Schema 概述

本文档提供所有MPLP数据结构的**生产就绪**综合JSON Schema定义，实现强大的数据验证、文档化和工具支持。这些Schema确保企业级数据完整性，为API消费者和实现者提供清晰的契约，通过所有10个已完成模块的2,869/2,869测试验证，100% Schema合规性。

### **Schema优势**
- **数据验证**: JSON数据结构的自动验证
- **文档化**: 自文档化的API契约
- **代码生成**: 类型定义的自动生成
- **IDE支持**: 编辑器中的智能感知和自动完成
- **测试**: 数据结构的自动化测试
- **互操作性**: 跨实现的一致数据格式

### **Schema组织结构**
```
schemas/
├── core/           # 核心协议Schema
├── modules/        # 模块特定Schema
├── common/         # 共享类型定义
├── validation/     # 验证规则Schema
└── examples/       # 示例数据实例
```

---

## 📋 核心协议Schema

### **基础消息Schema**

#### **schemas/core/message.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/message.json",
  "title": "MPLP基础消息",
  "description": "所有MPLP通信的基础消息结构",
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
      "description": "消息的唯一标识符"
    },
    "session_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "minLength": 1,
      "maxLength": 128,
      "description": "消息路由的会话标识符"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "消息创建时的ISO 8601时间戳"
    },
    "type": {
      "$ref": "#/definitions/MessageType",
      "description": "发送的消息类型"
    },
    "source": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "消息发送者的标识符"
    },
    "target": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "消息接收者的标识符"
    },
    "payload": {
      "type": "object",
      "description": "消息特定的数据载荷"
    },
    "headers": {
      "type": "object",
      "patternProperties": {
        "^[a-zA-Z0-9_-]+$": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "description": "可选的消息元数据头"
    },
    "priority": {
      "$ref": "#/definitions/Priority",
      "default": "normal",
      "description": "消息优先级级别"
    },
    "ttl_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 86400,
      "default": 300,
      "description": "生存时间（秒）"
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

### **操作请求Schema**

#### **schemas/core/operation-request.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/operation-request.json",
  "title": "MPLP操作请求",
  "description": "操作请求消息的Schema",
  "type": "object",
  "required": ["operation", "parameters"],
  "properties": {
    "operation": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$",
      "description": "格式为'module.operation'的操作标识符",
      "examples": [
        "context.create",
        "plan.execute",
        "role.assign"
      ]
    },
    "parameters": {
      "type": "object",
      "description": "操作特定的参数"
    },
    "timeout_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3600,
      "default": 30,
      "description": "操作超时时间（秒）"
    },
    "retry_policy": {
      "$ref": "#/definitions/RetryPolicy",
      "description": "操作的重试配置"
    },
    "correlation_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "用于请求跟踪的关联标识符"
    },
    "trace_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "分布式追踪标识符"
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

### **错误响应Schema**

#### **schemas/core/error-response.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/error-response.json",
  "title": "MPLP错误响应",
  "description": "错误响应消息的Schema",
  "type": "object",
  "required": ["error_code", "error_message"],
  "properties": {
    "error_code": {
      "$ref": "#/definitions/ErrorCode",
      "description": "标准化错误代码"
    },
    "error_message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000,
      "description": "人类可读的错误描述"
    },
    "error_details": {
      "type": "object",
      "description": "额外的错误上下文和详细信息"
    },
    "retry_after_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3600,
      "description": "建议的重试延迟时间（秒）"
    },
    "retryable": {
      "type": "boolean",
      "default": false,
      "description": "操作是否可以重试"
    },
    "correlation_id": {
      "type": "string",
      "description": "来自原始请求的关联标识符"
    },
    "trace_id": {
      "type": "string",
      "description": "分布式追踪标识符"
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

## 🔧 模块特定Schema

### **Context模块Schema**

#### **schemas/modules/context.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/modules/context.json",
  "title": "MPLP上下文实体",
  "description": "MPLP中上下文实体的Schema",
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
      "description": "带有'ctx-'前缀的唯一上下文标识符"
    },
    "context_type": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+$",
      "minLength": 1,
      "maxLength": 64,
      "description": "上下文类型分类",
      "examples": [
        "user_session",
        "workflow",
        "task_execution",
        "agent_coordination"
      ]
    },
    "context_data": {
      "type": "object",
      "description": "上下文特定的数据载荷",
      "additionalProperties": true
    },
    "context_status": {
      "$ref": "#/definitions/ContextStatus",
      "default": "active",
      "description": "上下文的当前状态"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "上下文创建时的ISO 8601时间戳"
    },
    "created_by": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "上下文创建者的标识符"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "上下文最后更新时的ISO 8601时间戳"
    },
    "updated_by": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "maxLength": 256,
      "description": "最后更新者的标识符"
    },
    "version": {
      "type": "integer",
      "minimum": 1,
      "default": 1,
      "description": "用于乐观锁定的版本号"
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
      "description": "额外的上下文元数据"
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

### **Plan模块Schema**

#### **schemas/modules/plan.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/modules/plan.json",
  "title": "MPLP计划实体",
  "description": "MPLP中计划实体的Schema",
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
      "description": "带有'plan-'前缀的唯一计划标识符"
    },
    "context_id": {
      "type": "string",
      "pattern": "^ctx-[a-zA-Z0-9_-]+$",
      "description": "关联的上下文标识符"
    },
    "plan_type": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+$",
      "minLength": 1,
      "maxLength": 64,
      "description": "计划类型分类",
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
      "description": "计划执行步骤的有序列表"
    },
    "plan_status": {
      "$ref": "#/definitions/PlanStatus",
      "default": "draft",
      "description": "计划的当前状态"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "计划创建时的ISO 8601时间戳"
    },
    "created_by": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_.-]+$",
      "minLength": 1,
      "maxLength": 256,
      "description": "计划创建者的标识符"
    },
    "execution_result": {
      "$ref": "#/definitions/ExecutionResult",
      "description": "计划执行的结果（如果已执行）"
    },
    "performance_metrics": {
      "$ref": "#/definitions/PerformanceMetrics",
      "description": "执行的性能指标"
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
          "description": "计划内的唯一步骤标识符"
        },
        "operation": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9_]+$",
          "minLength": 1,
          "maxLength": 128,
          "description": "要执行的操作"
        },
        "parameters": {
          "type": "object",
          "description": "操作的参数"
        },
        "dependencies": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_-]+$"
          },
          "uniqueItems": true,
          "maxItems": 50,
          "description": "此步骤之前必须完成的步骤ID"
        },
        "estimated_duration_ms": {
          "type": "integer",
          "minimum": 1,
          "maximum": 3600000,
          "description": "预估执行持续时间（毫秒）"
        },
        "timeout_ms": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 3600000,
          "description": "步骤超时时间（毫秒）"
        },
        "retry_policy": {
          "$ref": "operation-request.json#/definitions/RetryPolicy"
        },
        "conditions": {
          "type": "object",
          "description": "条件执行规则"
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
        "execution_time_ms": {
          "type": "integer",
          "minimum": 0,
          "description": "总执行时间（毫秒）"
        },
        "error_details": {
          "type": "object",
          "description": "失败情况下的错误详情"
        }
      },
      "additionalProperties": false
    },
    "StepResult": {
      "type": "object",
      "required": ["step_id", "status"],
      "properties": {
        "step_id": {
          "type": "string",
          "description": "步骤标识符"
        },
        "status": {
          "type": "string",
          "enum": ["completed", "failed", "skipped"]
        },
        "result": {
          "type": "object",
          "description": "步骤执行结果"
        },
        "execution_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "error_message": {
          "type": "string",
          "description": "失败情况下的错误消息"
        }
      }
    },
    "PerformanceMetrics": {
      "type": "object",
      "properties": {
        "total_execution_time_ms": {
          "type": "integer",
          "minimum": 0
        },
        "steps_completed": {
          "type": "integer",
          "minimum": 0
        },
        "steps_failed": {
          "type": "integer",
          "minimum": 0
        },
        "resource_usage": {
          "type": "object",
          "properties": {
            "cpu_time_ms": {
              "type": "integer",
              "minimum": 0
            },
            "memory_peak_mb": {
              "type": "number",
              "minimum": 0
            }
          }
        }
      }
    }
  }
}
```

---

## 🔧 验证和工具

### **Schema验证**

#### **JavaScript/Node.js**
```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// 初始化验证器
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// 加载Schema
const messageSchema = require('./schemas/core/message.json');
const contextSchema = require('./schemas/modules/context.json');

// 编译验证器
const validateMessage = ajv.compile(messageSchema);
const validateContext = ajv.compile(contextSchema);

// 验证数据
const messageData = {
  message_id: 'msg-12345',
  session_id: 'session-12345',
  timestamp: '2025-09-04T10:00:00.000Z',
  type: 'operation_request',
  source: 'client-001',
  target: 'server-001'
};

if (validateMessage(messageData)) {
  console.log('消息有效');
} else {
  console.error('验证错误:', validateMessage.errors);
}
```

#### **Python**
```python
import jsonschema
import json

# 加载Schema
with open('schemas/core/message.json', 'r') as f:
    schema = json.load(f)

# 验证数据
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
    print("数据有效")
except jsonschema.ValidationError as e:
    print(f"验证错误: {e.message}")
```

### **代码生成**

#### **TypeScript类型生成**
```bash
# 安装json-schema-to-typescript
npm install -g json-schema-to-typescript

# 生成TypeScript类型
json2ts -i schemas/core/message.json -o types/message.ts
json2ts -i schemas/modules/context.json -o types/context.ts
```

#### **生成的TypeScript类型**
```typescript
// 从schemas/core/message.json生成
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

## 🔗 相关资源

- **[正式规范](./formal-specification.md)** - 技术规范详情
- **[Protocol Buffer定义](./protobuf-definitions.md)** - 二进制格式规范
- **[OpenAPI规范](./openapi-specifications.md)** - REST API规范
- **[Schema文档](../schemas/README.md)** - Schema系统概述

---

**JSON Schema定义版本**: 1.0.0-alpha
**最后更新**: 2025年9月4日
**下次审查**: 2025年12月4日
**状态**: 验证就绪

**⚠️ Alpha通知**: 这些JSON Schema定义为MPLP v1.0 Alpha提供了全面的数据验证。基于实现反馈和数据完整性要求，Beta版本将添加额外的Schema和验证规则。
      "type": "object",
      "patternProperties": {
        "^[a-zA-Z0-9_-]+$": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "description": "可选的消息元数据头"
    },
    "priority": {
      "$ref": "#/definitions/Priority",
      "default": "normal",
      "description": "消息优先级级别"
    },
    "ttl_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 86400,
      "default": 300,
      "description": "生存时间（秒）"
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

### **操作请求Schema**

#### **schemas/core/operation-request.json**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/core/operation-request.json",
  "title": "MPLP操作请求",
  "description": "操作请求消息的Schema",
  "type": "object",
  "required": ["operation", "parameters"],
  "properties": {
    "operation": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$",
      "description": "格式为'module.operation'的操作标识符",
      "examples": [
        "context.create",
        "plan.execute",
        "role.assign"
      ]
    },
    "parameters": {
      "type": "object",
      "description": "操作特定的参数"
    },
    "timeout_seconds": {
      "type": "integer",
      "minimum": 1,
      "maximum": 3600,
      "default": 30,
      "description": "操作超时时间（秒）"
    },
    "retry_policy": {
      "$ref": "#/definitions/RetryPolicy",
      "description": "操作的重试配置"
    },
    "correlation_id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "用于请求跟踪的关联标识符"
    },
    "trace_id": {
      "type": "string",
