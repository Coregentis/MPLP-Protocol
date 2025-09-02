# Core Module Schema Reference

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-09-01T16:45:00Z
最后更新: 2025-09-01T16:45:00Z
文档状态: 已完成
-->

![版本](https://img.shields.io/badge/v1.0.0-stable-green)
![更新时间](https://img.shields.io/badge/Updated-2025--09--01-brightgreen)
![Schema](https://img.shields.io/badge/Schema-JSON_Schema_Draft_07-blue)
![命名约定](https://img.shields.io/badge/Naming-snake__case-orange)

## 📋 **Schema概述**

Core模块使用JSON Schema Draft-07标准定义数据结构，遵循MPLP项目的**双重命名约定**：
- **Schema层**: 使用`snake_case`命名
- **TypeScript层**: 使用`camelCase`命名
- **映射机制**: 通过CoreMapper实现双向转换

### **Schema文件位置**
- **主Schema**: `src/schemas/mplp-core.json`
- **验证器**: `src/modules/core/infrastructure/mappers/core.mapper.ts`
- **类型定义**: `src/modules/core/types.ts`

## 🏗️ **核心Schema定义**

### **1. CoreEntity Schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.com/schemas/core-entity.json",
  "title": "Core Entity",
  "description": "MPLP Core模块核心实体定义",
  "type": "object",
  "properties": {
    "core_id": {
      "type": "string",
      "pattern": "^core-[a-zA-Z0-9-]+$",
      "description": "核心实体唯一标识符"
    },
    "orchestrator_id": {
      "type": "string",
      "pattern": "^orchestrator-[a-zA-Z0-9-]+$",
      "description": "编排器标识符"
    },
    "workflow_config": {
      "$ref": "#/definitions/WorkflowConfig"
    },
    "execution_context": {
      "$ref": "#/definitions/ExecutionContext"
    },
    "core_operation": {
      "type": "string",
      "enum": ["execute_workflow", "coordinate_modules", "allocate_resources", "monitor_system"],
      "description": "核心操作类型"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "创建时间"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "更新时间"
    },
    "protocol_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "协议版本号"
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "description": "扩展元数据"
    }
  },
  "required": [
    "core_id",
    "orchestrator_id",
    "core_operation",
    "created_at",
    "protocol_version"
  ],
  "additionalProperties": false
}
```

### **2. WorkflowConfig Schema**

```json
{
  "WorkflowConfig": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100,
        "description": "工作流名称"
      },
      "description": {
        "type": "string",
        "maxLength": 500,
        "description": "工作流描述"
      },
      "stages": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["context", "plan", "role", "confirm", "trace", "extension", "dialog", "collab", "network"]
        },
        "minItems": 1,
        "uniqueItems": true,
        "description": "工作流阶段列表"
      },
      "execution_mode": {
        "type": "string",
        "enum": ["sequential", "parallel", "hybrid"],
        "description": "执行模式"
      },
      "parallel_execution": {
        "type": "boolean",
        "description": "是否支持并行执行"
      },
      "timeout_ms": {
        "type": "integer",
        "minimum": 1000,
        "maximum": 3600000,
        "description": "超时时间(毫秒)"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "medium", "high", "critical"],
        "description": "优先级"
      },
      "retry_config": {
        "$ref": "#/definitions/RetryConfig"
      }
    },
    "required": ["name", "stages", "execution_mode", "timeout_ms", "priority"],
    "additionalProperties": false
  }
}
```

### **3. ExecutionContext Schema**

```json
{
  "ExecutionContext": {
    "type": "object",
    "properties": {
      "context_id": {
        "type": "string",
        "pattern": "^context-[a-zA-Z0-9-]+$",
        "description": "执行上下文标识符"
      },
      "user_id": {
        "type": "string",
        "description": "用户标识符"
      },
      "session_id": {
        "type": "string",
        "description": "会话标识符"
      },
      "environment": {
        "type": "string",
        "enum": ["development", "testing", "staging", "production"],
        "description": "执行环境"
      },
      "resource_limits": {
        "$ref": "#/definitions/ResourceLimits"
      },
      "security_context": {
        "$ref": "#/definitions/SecurityContext"
      },
      "execution_metadata": {
        "type": "object",
        "additionalProperties": true,
        "description": "执行元数据"
      }
    },
    "required": ["context_id", "environment"],
    "additionalProperties": false
  }
}
```

### **4. CoordinationRequest Schema**

```json
{
  "CoordinationRequest": {
    "type": "object",
    "properties": {
      "coordination_id": {
        "type": "string",
        "pattern": "^coord-[a-zA-Z0-9-]+$",
        "description": "协调请求标识符"
      },
      "source_module": {
        "type": "string",
        "enum": ["core", "context", "plan", "role", "confirm", "trace", "extension", "dialog", "collab", "network"],
        "description": "源模块"
      },
      "target_modules": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["context", "plan", "role", "confirm", "trace", "extension", "dialog", "collab", "network"]
        },
        "minItems": 1,
        "uniqueItems": true,
        "description": "目标模块列表"
      },
      "operation": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50,
        "description": "协调操作"
      },
      "parameters": {
        "type": "object",
        "additionalProperties": true,
        "description": "操作参数"
      },
      "coordination_mode": {
        "type": "string",
        "enum": ["sync", "async", "batch"],
        "description": "协调模式"
      },
      "timeout_ms": {
        "type": "integer",
        "minimum": 1000,
        "maximum": 300000,
        "description": "协调超时时间"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "medium", "high", "critical"],
        "description": "协调优先级"
      }
    },
    "required": ["coordination_id", "source_module", "target_modules", "operation", "coordination_mode"],
    "additionalProperties": false
  }
}
```

### **5. ResourceAllocation Schema**

```json
{
  "ResourceAllocation": {
    "type": "object",
    "properties": {
      "allocation_id": {
        "type": "string",
        "pattern": "^alloc-[a-zA-Z0-9-]+$",
        "description": "资源分配标识符"
      },
      "workflow_id": {
        "type": "string",
        "pattern": "^wf-[a-zA-Z0-9-]+$",
        "description": "工作流标识符"
      },
      "resource_type": {
        "type": "string",
        "enum": ["cpu", "memory", "disk", "network", "composite"],
        "description": "资源类型"
      },
      "allocated_resources": {
        "$ref": "#/definitions/AllocatedResources"
      },
      "allocation_status": {
        "type": "string",
        "enum": ["pending", "allocated", "active", "released", "failed"],
        "description": "分配状态"
      },
      "allocated_at": {
        "type": "string",
        "format": "date-time",
        "description": "分配时间"
      },
      "expires_at": {
        "type": "string",
        "format": "date-time",
        "description": "过期时间"
      },
      "usage_statistics": {
        "$ref": "#/definitions/UsageStatistics"
      }
    },
    "required": ["allocation_id", "workflow_id", "resource_type", "allocated_resources", "allocation_status", "allocated_at"],
    "additionalProperties": false
  }
}
```

## 🔄 **支持定义 (Definitions)**

### **RetryConfig**
```json
{
  "RetryConfig": {
    "type": "object",
    "properties": {
      "max_retries": {
        "type": "integer",
        "minimum": 0,
        "maximum": 10,
        "description": "最大重试次数"
      },
      "retry_delay_ms": {
        "type": "integer",
        "minimum": 100,
        "maximum": 60000,
        "description": "重试延迟时间"
      },
      "backoff_strategy": {
        "type": "string",
        "enum": ["fixed", "exponential", "linear"],
        "description": "退避策略"
      }
    },
    "required": ["max_retries", "retry_delay_ms", "backoff_strategy"],
    "additionalProperties": false
  }
}
```

### **ResourceLimits**
```json
{
  "ResourceLimits": {
    "type": "object",
    "properties": {
      "max_cpu_cores": {
        "type": "integer",
        "minimum": 1,
        "maximum": 64,
        "description": "最大CPU核心数"
      },
      "max_memory_mb": {
        "type": "integer",
        "minimum": 128,
        "maximum": 65536,
        "description": "最大内存(MB)"
      },
      "max_disk_space_mb": {
        "type": "integer",
        "minimum": 100,
        "maximum": 1048576,
        "description": "最大磁盘空间(MB)"
      },
      "max_execution_time_ms": {
        "type": "integer",
        "minimum": 1000,
        "maximum": 3600000,
        "description": "最大执行时间(毫秒)"
      }
    },
    "additionalProperties": false
  }
}
```

### **SecurityContext**
```json
{
  "SecurityContext": {
    "type": "object",
    "properties": {
      "user_roles": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "用户角色列表"
      },
      "permissions": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "权限列表"
      },
      "security_level": {
        "type": "string",
        "enum": ["public", "internal", "confidential", "restricted"],
        "description": "安全级别"
      },
      "access_token": {
        "type": "string",
        "description": "访问令牌"
      }
    },
    "required": ["security_level"],
    "additionalProperties": false
  }
}
```

### **AllocatedResources**
```json
{
  "AllocatedResources": {
    "type": "object",
    "properties": {
      "cpu_cores": {
        "type": "number",
        "minimum": 0.1,
        "maximum": 64,
        "description": "分配的CPU核心数"
      },
      "memory_mb": {
        "type": "integer",
        "minimum": 128,
        "maximum": 65536,
        "description": "分配的内存(MB)"
      },
      "disk_space_mb": {
        "type": "integer",
        "minimum": 100,
        "maximum": 1048576,
        "description": "分配的磁盘空间(MB)"
      },
      "network_bandwidth_mbps": {
        "type": "number",
        "minimum": 1,
        "maximum": 10000,
        "description": "分配的网络带宽(Mbps)"
      }
    },
    "additionalProperties": false
  }
}
```

## 🔄 **双重命名约定映射**

### **Schema → TypeScript 映射表**

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|-------------------------|---------------------------|------|------|
| `core_id` | `coreId` | string | 核心实体ID |
| `orchestrator_id` | `orchestratorId` | string | 编排器ID |
| `workflow_config` | `workflowConfig` | WorkflowConfig | 工作流配置 |
| `execution_context` | `executionContext` | ExecutionContext | 执行上下文 |
| `core_operation` | `coreOperation` | string | 核心操作 |
| `created_at` | `createdAt` | Date | 创建时间 |
| `updated_at` | `updatedAt` | Date | 更新时间 |
| `protocol_version` | `protocolVersion` | string | 协议版本 |
| `coordination_id` | `coordinationId` | string | 协调ID |
| `source_module` | `sourceModule` | string | 源模块 |
| `target_modules` | `targetModules` | string[] | 目标模块 |
| `coordination_mode` | `coordinationMode` | string | 协调模式 |
| `timeout_ms` | `timeoutMs` | number | 超时时间 |
| `allocation_id` | `allocationId` | string | 分配ID |
| `workflow_id` | `workflowId` | string | 工作流ID |
| `resource_type` | `resourceType` | string | 资源类型 |
| `allocated_resources` | `allocatedResources` | AllocatedResources | 已分配资源 |
| `allocation_status` | `allocationStatus` | string | 分配状态 |
| `allocated_at` | `allocatedAt` | Date | 分配时间 |
| `expires_at` | `expiresAt` | Date | 过期时间 |

### **映射函数示例**

```typescript
// Schema → TypeScript
export function fromSchema(schema: CoreEntitySchema): CoreEntity {
  return {
    coreId: schema.core_id,
    orchestratorId: schema.orchestrator_id,
    workflowConfig: schema.workflow_config,
    executionContext: schema.execution_context,
    coreOperation: schema.core_operation,
    createdAt: new Date(schema.created_at),
    updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined,
    protocolVersion: schema.protocol_version,
    metadata: schema.metadata
  };
}

// TypeScript → Schema
export function toSchema(entity: CoreEntity): CoreEntitySchema {
  return {
    core_id: entity.coreId,
    orchestrator_id: entity.orchestratorId,
    workflow_config: entity.workflowConfig,
    execution_context: entity.executionContext,
    core_operation: entity.coreOperation,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt?.toISOString(),
    protocol_version: entity.protocolVersion,
    metadata: entity.metadata
  };
}
```

## ✅ **Schema验证**

### **验证规则**
- **必填字段**: 所有required字段必须存在
- **数据类型**: 严格类型检查
- **格式验证**: 日期、UUID、枚举值格式
- **范围检查**: 数值范围和字符串长度
- **唯一性**: 数组元素唯一性

### **验证示例**
```typescript
import { validateSchema } from './core.mapper';

const isValid = validateSchema(coreEntityData);
if (!isValid) {
  console.error('Schema validation failed:', validateSchema.errors);
}
```

---

## 📚 **相关文档**

- [字段映射参考](./field-mapping.md) - 详细的字段映射文档
- [API参考](./api-reference.md) - API接口文档
- [架构指南](./architecture-guide.md) - 架构设计文档
- [测试指南](./testing-guide.md) - Schema测试指南
