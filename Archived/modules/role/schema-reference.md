# Role模块 Schema参考

## 📋 概述

Role模块使用JSON Schema Draft-07标准定义数据结构，支持严格的类型验证和双重命名约定。作为统一安全框架的核心，确保跨模块数据一致性和安全性。

**Schema特性**: 双重命名约定 (Schema: snake_case ↔ TypeScript: camelCase)，完整的映射函数支持

## 🏗️ 核心Schema定义

### RoleSchema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "mplp-role.json",
  "title": "MPLP Role Schema",
  "type": "object",
  "required": [
    "role_id",
    "name",
    "role_type",
    "context_id",
    "status",
    "protocol_version",
    "timestamp"
  ],
  "properties": {
    "role_id": {
      "type": "string",
      "format": "uuid",
      "description": "唯一角色标识符"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "角色名称"
    },
    "role_type": {
      "type": "string",
      "enum": ["functional", "organizational", "project", "system", "temporary"],
      "description": "角色类型"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "角色描述"
    },
    "display_name": {
      "type": "string",
      "maxLength": 200,
      "description": "显示名称"
    },
    "context_id": {
      "type": "string",
      "format": "uuid",
      "description": "上下文标识符"
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "suspended", "archived"],
      "description": "角色状态"
    },
    "permissions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Permission"
      },
      "description": "权限列表"
    },
    "scope": {
      "$ref": "#/definitions/RoleScope",
      "description": "角色作用域"
    },
    "attributes": {
      "$ref": "#/definitions/RoleAttributes",
      "description": "角色属性"
    },
    "inheritance": {
      "$ref": "#/definitions/RoleInheritance",
      "description": "角色继承"
    },
    "delegation": {
      "$ref": "#/definitions/RoleDelegation",
      "description": "角色委托"
    },
    "audit_trail": {
      "$ref": "#/definitions/AuditTrail",
      "description": "审计跟踪"
    },
    "performance_metrics": {
      "$ref": "#/definitions/PerformanceMetrics",
      "description": "性能指标"
    },
    "protocol_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "协议版本"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "时间戳"
    }
  },
  "definitions": {
    "Permission": {
      "type": "object",
      "required": ["permission_id", "resource_type", "resource_id", "actions"],
      "properties": {
        "permission_id": {
          "type": "string",
          "format": "uuid"
        },
        "resource_type": {
          "type": "string",
          "enum": ["context", "plan", "task", "agent", "role", "system"]
        },
        "resource_id": {
          "type": "string"
        },
        "actions": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["create", "read", "update", "delete", "execute", "manage"]
          },
          "minItems": 1,
          "uniqueItems": true
        },
        "grant_type": {
          "type": "string",
          "enum": ["direct", "inherited", "delegated"],
          "default": "direct"
        },
        "constraints": {
          "$ref": "#/definitions/PermissionConstraints"
        }
      }
    },
    "PermissionConstraints": {
      "type": "object",
      "properties": {
        "time_based": {
          "type": "object",
          "properties": {
            "start_time": {
              "type": "string",
              "format": "date-time"
            },
            "end_time": {
              "type": "string",
              "format": "date-time"
            },
            "timezone": {
              "type": "string"
            }
          }
        },
        "condition_based": {
          "type": "object",
          "properties": {
            "conditions": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "RoleScope": {
      "type": "object",
      "required": ["level"],
      "properties": {
        "level": {
          "type": "string",
          "enum": ["global", "organization", "project", "team", "individual"]
        },
        "context_ids": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uuid"
          }
        },
        "resource_constraints": {
          "type": "object",
          "properties": {
            "allowed_resource_types": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "max_contexts": {
              "type": "integer",
              "minimum": 1
            },
            "max_plans": {
              "type": "integer",
              "minimum": 1
            }
          }
        }
      }
    },
    "RoleAttributes": {
      "type": "object",
      "properties": {
        "department": {
          "type": "string",
          "maxLength": 100
        },
        "security_clearance": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "secret", "top_secret"]
        },
        "certification_requirements": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "certification": {
                "type": "string"
              },
              "issuer": {
                "type": "string"
              },
              "level": {
                "type": "string",
                "enum": ["basic", "intermediate", "advanced", "expert"]
              }
            }
          }
        }
      }
    },
    "RoleInheritance": {
      "type": "object",
      "properties": {
        "parent_roles": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uuid"
          }
        },
        "child_roles": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uuid"
          }
        },
        "inheritance_type": {
          "type": "string",
          "enum": ["full", "partial", "conditional"]
        }
      }
    },
    "RoleDelegation": {
      "type": "object",
      "properties": {
        "delegated_to": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "user_id": {
                "type": "string",
                "format": "uuid"
              },
              "delegation_type": {
                "type": "string",
                "enum": ["temporary", "permanent", "conditional"]
              },
              "start_time": {
                "type": "string",
                "format": "date-time"
              },
              "end_time": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        },
        "delegated_from": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "role_id": {
                "type": "string",
                "format": "uuid"
              },
              "permissions": {
                "type": "array",
                "items": {
                  "type": "string",
                  "format": "uuid"
                }
              }
            }
          }
        }
      }
    },
    "AuditTrail": {
      "type": "object",
      "required": ["enabled"],
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "retention_days": {
          "type": "integer",
          "minimum": 1,
          "maximum": 2555,
          "default": 365
        },
        "audit_events": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "event_id": {
                "type": "string",
                "format": "uuid"
              },
              "event_type": {
                "type": "string",
                "enum": ["created", "updated", "deleted", "activated", "deactivated", "permission_added", "permission_removed"]
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              },
              "user_id": {
                "type": "string",
                "format": "uuid"
              },
              "details": {
                "type": "object"
              }
            }
          }
        }
      }
    },
    "PerformanceMetrics": {
      "type": "object",
      "required": ["enabled"],
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "collection_interval_seconds": {
          "type": "integer",
          "minimum": 1,
          "maximum": 3600,
          "default": 60
        },
        "metrics": {
          "type": "object",
          "properties": {
            "permission_checks_count": {
              "type": "integer",
              "minimum": 0
            },
            "average_response_time_ms": {
              "type": "number",
              "minimum": 0
            },
            "cache_hit_rate": {
              "type": "number",
              "minimum": 0,
              "maximum": 1
            },
            "error_rate": {
              "type": "number",
              "minimum": 0,
              "maximum": 1
            }
          }
        }
      }
    }
  }
}
```

## 🔄 Schema版本管理

### 版本历史
- **v1.0.0**: 初始版本，基础RBAC功能
- **v1.1.0**: 添加角色继承和委托
- **v1.2.0**: 增强审计和性能监控
- **v2.0.0**: 重大架构升级（计划中）

### 向后兼容性
- 支持多版本Schema并存
- 自动版本迁移机制
- 渐进式升级策略

## 📊 数据验证规则

### 必填字段验证
```typescript
const requiredFields = [
  'role_id',
  'name', 
  'role_type',
  'context_id',
  'status',
  'protocol_version',
  'timestamp'
];
```

### 格式验证规则
```typescript
const validationRules = {
  role_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  name: /^[a-zA-Z0-9_-]+$/,
  protocol_version: /^\d+\.\d+\.\d+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
```

### 业务规则验证
```typescript
const businessRules = {
  // 角色名称唯一性
  uniqueRoleName: true,
  
  // 权限一致性检查
  permissionConsistency: true,
  
  // 继承循环检测
  inheritanceCycleDetection: true,
  
  // 委托权限验证
  delegationPermissionValidation: true
};
```

## 🔍 Schema使用示例

### 创建角色Schema
```json
{
  "role_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "project-manager",
  "role_type": "functional",
  "description": "Project management role with full project access",
  "display_name": "Project Manager",
  "context_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "active",
  "permissions": [
    {
      "permission_id": "550e8400-e29b-41d4-a716-446655440002",
      "resource_type": "project",
      "resource_id": "project-001",
      "actions": ["create", "read", "update", "delete"],
      "grant_type": "direct"
    }
  ],
  "scope": {
    "level": "project",
    "context_ids": ["550e8400-e29b-41d4-a716-446655440001"],
    "resource_constraints": {
      "allowed_resource_types": ["project", "task"],
      "max_contexts": 5,
      "max_plans": 10
    }
  },
  "attributes": {
    "department": "Engineering",
    "security_clearance": "internal",
    "certification_requirements": [
      {
        "certification": "PMP",
        "issuer": "PMI",
        "level": "advanced"
      }
    ]
  },
  "audit_trail": {
    "enabled": true,
    "retention_days": 365
  },
  "performance_metrics": {
    "enabled": true,
    "collection_interval_seconds": 60
  },
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-26T10:00:00Z"
}
```

### 权限Schema示例
```json
{
  "permission_id": "550e8400-e29b-41d4-a716-446655440003",
  "resource_type": "task",
  "resource_id": "task-001",
  "actions": ["read", "update"],
  "grant_type": "inherited",
  "constraints": {
    "time_based": {
      "start_time": "2025-08-26T09:00:00Z",
      "end_time": "2025-12-31T18:00:00Z",
      "timezone": "UTC"
    },
    "condition_based": {
      "conditions": ["user.department == 'Engineering'"]
    }
  }
}
```

## 🔧 Schema扩展

### 自定义字段
```json
{
  "custom_fields": {
    "cost_center": {
      "type": "string",
      "maxLength": 50
    },
    "approval_required": {
      "type": "boolean",
      "default": false
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### 插件Schema
```json
{
  "plugins": {
    "type": "object",
    "patternProperties": {
      "^[a-zA-Z][a-zA-Z0-9_]*$": {
        "type": "object",
        "properties": {
          "enabled": {
            "type": "boolean"
          },
          "config": {
            "type": "object"
          }
        }
      }
    }
  }
}
```

## 📈 性能优化

### Schema缓存
- 编译后的Schema缓存
- 验证结果缓存
- 热点Schema预加载

### 验证优化
- 快速失败验证
- 增量验证
- 并行验证

## 🔒 安全考虑

### 敏感数据处理
- 密码字段加密
- PII数据脱敏
- 审计日志保护

### 输入验证
- SQL注入防护
- XSS攻击防护
- 数据长度限制

---

**版本**: 1.0.0  
**最后更新**: 2025-08-26  
**维护者**: MPLP开发团队
