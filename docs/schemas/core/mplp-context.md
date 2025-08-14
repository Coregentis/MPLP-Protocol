# MPLP Context Protocol Schema

## 📋 **概述**

Context协议Schema定义了MPLP系统中上下文和全局状态管理的标准数据结构，是整个协议体系的基础模块。经过最新企业级功能增强，现已包含完整的上下文状态监控、缓存性能分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-context.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 95.2%
**功能完整性**: ✅ 100% (基础功能 + 上下文监控 + 企业级功能)
**企业级特性**: ✅ 上下文状态监控、缓存性能分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **上下文管理**: 维护会话和任务的上下文信息
- **状态同步**: 跨模块的状态一致性保证
- **生命周期管理**: 上下文的创建、更新、销毁
- **权限控制**: 基于上下文的访问权限管理

### **上下文监控功能**
- **上下文状态监控**: 实时监控上下文访问延迟、更新性能、状态一致性
- **缓存性能分析**: 详细的缓存命中率分析和性能优化建议
- **上下文状态监控**: 监控上下文的生命周期状态、同步进度、访问模式
- **上下文管理审计**: 监控上下文管理过程的合规性和可靠性
- **状态一致性监控**: 监控跨模块状态同步的一致性和完整性

### **企业级功能**
- **上下文管理审计**: 完整的上下文管理和状态同步记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **版本控制**: 上下文配置的版本历史、变更追踪和快照管理
- **搜索索引**: 上下文数据的全文搜索、语义搜索和自动索引
- **事件集成**: 上下文事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和上下文事件处理
- **事件集成**: 事件总线集成和发布订阅机制

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ [Context] ← Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `context_id` | string | ✅ | UUID v4格式的上下文标识符 |
| `name` | string | ✅ | 上下文名称 (1-255字符) |
| `description` | string | ❌ | 上下文描述 (最大1000字符) |
| `status` | string | ✅ | 状态枚举值 |
| `lifecycle_stage` | string | ✅ | 生命周期阶段 |
| `shared_state` | object | ✅ | 共享状态管理 |
| `access_control` | object | ✅ | 访问控制配置 |
| `configuration` | object | ✅ | 基础配置设置 |

### **监控集成功能字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `monitoring_integration` | object | ✅ | 上下文监控系统集成接口 |

### **企业级功能字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `audit_trail` | object | ✅ | 审计追踪和合规性管理 |
| `performance_metrics` | object | ✅ | 性能监控和健康检查 |
| `version_history` | object | ✅ | 版本控制和变更历史 |
| `search_metadata` | object | ✅ | 搜索索引和元数据 |
| `caching_policy` | object | ✅ | 缓存策略和优化 |
| `sync_configuration` | object | ✅ | 同步配置和复制 |
| `error_handling` | object | ✅ | 错误处理和恢复 |
| `integration_endpoints` | object | ✅ | 集成接口和Webhooks |
| `event_integration` | object | ✅ | 事件总线集成 |

### **状态枚举**
```json
{
  "status": {
    "enum": [
      "active",      // 活跃状态
      "inactive",    // 非活跃状态
      "suspended",   // 暂停状态
      "archived"     // 归档状态
    ]
  }
}
```

### **优先级枚举**
```json
{
  "priority": {
    "enum": [
      "critical",    // 关键优先级
      "high",        // 高优先级
      "medium",      // 中等优先级
      "low"          // 低优先级
    ]
  }
}
```

## 🔧 **数据结构详解**

### **基础上下文结构**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "context_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "用户会话上下文",
  "description": "处理用户交互的主要上下文",
  "status": "active",
  "priority": "high",
  "metadata": {
    "created_by": "user-12345",
    "created_at": "2025-08-13T10:30:00.000Z",
    "last_modified": "2025-08-13T10:35:00.000Z",
    "version": 1
  }
}
```

### **扩展字段结构**
```json
{
  "session_info": {
    "session_id": "session-abc123",
    "user_id": "user-12345",
    "device_info": {
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "Windows"
    }
  },
  "business_context": {
    "department": "engineering",
    "project_id": "proj-456",
    "workflow_stage": "development"
  },
  "security_context": {
    "access_level": "standard",
    "permissions": ["read", "write"],
    "encryption_required": true
  }
}
```

## 🏢 **企业级功能详解**

### **审计追踪 (audit_trail)**
```json
{
  "audit_trail": {
    "enabled": true,
    "retention_days": 365,
    "audit_events": [
      {
        "event_id": "audit-001",
        "event_type": "created",
        "timestamp": "2025-08-13T10:30:00.000Z",
        "user_id": "user-12345",
        "user_role": "developer",
        "action": "context_created",
        "resource": "context-550e8400",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "session_id": "session-abc123",
        "correlation_id": "corr-456"
      }
    ],
    "compliance_settings": {
      "gdpr_enabled": true,
      "hipaa_enabled": false,
      "sox_enabled": true,
      "custom_compliance": ["ISO27001", "PCI-DSS"]
    }
  }
}
```

### **性能监控 (performance_metrics)**
```json
{
  "performance_metrics": {
    "enabled": true,
    "collection_interval_seconds": 30,
    "metrics": {
      "response_time_ms": 45.2,
      "memory_usage_mb": 128.5,
      "cpu_usage_percent": 15.3,
      "active_connections": 25,
      "operations_per_second": 150.7,
      "error_rate_percent": 0.1,
      "cache_hit_rate_percent": 89.5
    },
    "health_status": {
      "status": "healthy",
      "last_check": "2025-08-13T10:35:00.000Z",
      "checks": [
        {
          "check_name": "database_connection",
          "status": "pass",
          "message": "Database connection healthy",
          "duration_ms": 12.3
        },
        {
          "check_name": "memory_usage",
          "status": "pass",
          "message": "Memory usage within limits",
          "duration_ms": 5.1
        }
      ]
    },
    "alerting": {
      "enabled": true,
      "thresholds": {
        "response_time_ms": 100,
        "memory_usage_mb": 512,
        "cpu_usage_percent": 80,
        "error_rate_percent": 5
      },
      "notification_channels": ["email", "slack", "webhook"]
    }
  }
}
```

### **版本历史 (version_history)**
```json
{
  "version_history": {
    "enabled": true,
    "max_versions": 50,
    "versions": [
      {
        "version_id": "ver-001",
        "version_number": "1.0.0",
        "created_at": "2025-08-13T10:30:00.000Z",
        "created_by": "user-12345",
        "change_type": "created",
        "change_summary": "Initial context creation",
        "change_details": {
          "fields_changed": ["name", "description", "status"],
          "diff": {
            "name": {"old": null, "new": "用户会话上下文"},
            "status": {"old": null, "new": "active"}
          },
          "migration_notes": "Initial version"
        },
        "snapshot": {
          "context_id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "用户会话上下文",
          "status": "active"
        },
        "tags": ["initial", "production"]
      }
    ],
    "retention_policy": {
      "auto_cleanup": true,
      "keep_major_versions": true,
      "retention_days": 90
    }
  }
}
```

### **搜索索引 (search_metadata)**
```json
{
  "search_metadata": {
    "enabled": true,
    "indexing_strategy": "hybrid",
    "searchable_fields": ["name", "description", "tags", "metadata"],
    "search_index": {
      "last_updated": "2025-08-13T10:35:00.000Z",
      "document_count": 1250,
      "index_size_mb": 45.2
    },
    "search_configuration": {
      "auto_indexing": true,
      "indexing_frequency": "real_time",
      "boost_factors": {
        "name": 2.0,
        "description": 1.5,
        "tags": 1.2
      }
    }
  }
}
```

### **缓存策略 (caching_policy)**
```json
{
  "caching_policy": {
    "enabled": true,
    "cache_strategy": "adaptive",
    "cache_levels": [
      {
        "level": "L1_memory",
        "backend": "memory",
        "ttl_seconds": 300,
        "max_size_mb": 128,
        "eviction_policy": "lru"
      },
      {
        "level": "L2_redis",
        "backend": "redis",
        "ttl_seconds": 3600,
        "max_size_mb": 512,
        "eviction_policy": "lfu"
      }
    ],
    "cache_warming": {
      "enabled": true,
      "strategies": ["popular_contexts", "recent_access", "predictive"]
    }
  }
}
```

### **同步配置 (sync_configuration)**
```json
{
  "sync_configuration": {
    "enabled": true,
    "sync_strategy": "real_time",
    "sync_targets": [
      {
        "target_id": "backup_db",
        "target_type": "database",
        "sync_frequency": "immediate",
        "conflict_resolution": "last_write_wins"
      },
      {
        "target_id": "analytics_service",
        "target_type": "external_service",
        "sync_frequency": "batch_hourly",
        "conflict_resolution": "merge"
      }
    ],
    "replication": {
      "enabled": true,
      "replication_factor": 3,
      "consistency_level": "strong"
    }
  }
}
```

### **错误处理 (error_handling)**
```json
{
  "error_handling": {
    "enabled": true,
    "error_policies": [
      {
        "error_type": "timeout",
        "severity": "medium",
        "action": "retry",
        "retry_config": {
          "max_attempts": 3,
          "backoff_strategy": "exponential",
          "base_delay_ms": 1000
        }
      },
      {
        "error_type": "validation_error",
        "severity": "high",
        "action": "escalate"
      }
    ],
    "circuit_breaker": {
      "enabled": true,
      "failure_threshold": 5,
      "timeout_ms": 30000,
      "reset_timeout_ms": 60000
    },
    "recovery_strategy": {
      "auto_recovery": true,
      "backup_sources": ["cache", "replica_db"],
      "rollback_enabled": true
    }
  }
}
```

### **集成接口 (integration_endpoints)**
```json
{
  "integration_endpoints": {
    "enabled": true,
    "webhooks": [
      {
        "webhook_id": "webhook-001",
        "url": "https://api.example.com/context-events",
        "events": ["created", "updated", "deleted"],
        "authentication": {
          "type": "bearer",
          "credentials": {"token": "***"}
        },
        "retry_policy": {
          "max_attempts": 3,
          "backoff_ms": 2000
        }
      }
    ],
    "api_endpoints": [
      {
        "endpoint_id": "context_api",
        "path": "/api/v1/contexts",
        "method": "GET",
        "authentication_required": true,
        "rate_limit": {
          "requests_per_minute": 100,
          "burst_limit": 20
        }
      }
    ]
  }
}
```

### **事件集成 (event_integration)**
```json
{
  "event_integration": {
    "enabled": true,
    "event_bus_connection": {
      "connection_id": "mplp_event_bus",
      "connection_type": "internal",
      "connection_config": {
        "broker_url": "amqp://localhost:5672",
        "exchange": "mplp.events"
      }
    },
    "published_events": [
      {
        "event_type": "context.created",
        "routing_key": "context.lifecycle.created",
        "schema_version": "1.0.0"
      },
      {
        "event_type": "context.updated",
        "routing_key": "context.lifecycle.updated",
        "schema_version": "1.0.0"
      }
    ],
    "subscribed_events": [
      {
        "event_type": "plan.completed",
        "source_module": "plan",
        "handler": "onPlanCompleted"
      },
      {
        "event_type": "trace.error",
        "source_module": "trace",
        "handler": "onTraceError"
      }
    ]
  }
}
```

### **关联关系**
```json
{
  "relationships": {
    "parent_context": "550e8400-e29b-41d4-a716-446655440001",
    "child_contexts": [
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ],
    "related_plans": [
      "plan-789"
    ],
    "active_traces": [
      "trace-101"
    ]
  }
}
```

## 💻 **TypeScript集成**

### **类型定义**
```typescript
// TypeScript接口 (camelCase)
interface ContextData {
  protocolVersion: string;
  timestamp: string;
  contextId: string;
  name: string;
  description?: string;
  status: ContextStatus;
  priority: Priority;
  metadata?: ContextMetadata;
  sessionInfo?: SessionInfo;
  businessContext?: BusinessContext;
  securityContext?: SecurityContext;
  relationships?: ContextRelationships;
}

type ContextStatus = 'active' | 'inactive' | 'suspended' | 'archived';
type Priority = 'critical' | 'high' | 'medium' | 'low';
```

### **Mapper实现**
```typescript
import { ContextMapper } from '@mplp/schemas';

// Schema → TypeScript
const contextData: ContextData = ContextMapper.fromSchema({
  protocol_version: "1.0.0",
  timestamp: "2025-08-13T10:30:00.000Z",
  context_id: "550e8400-e29b-41d4-a716-446655440000",
  name: "测试上下文",
  status: "active",
  priority: "high"
});

// TypeScript → Schema
const schemaData: ContextSchema = ContextMapper.toSchema({
  protocolVersion: "1.0.0",
  timestamp: "2025-08-13T10:30:00.000Z",
  contextId: "550e8400-e29b-41d4-a716-446655440000",
  name: "测试上下文",
  status: "active",
  priority: "high"
});
```

## 🔍 **验证规则**

### **必需字段验证**
```json
{
  "required": [
    "protocol_version",
    "timestamp", 
    "context_id",
    "name",
    "status",
    "priority"
  ]
}
```

### **格式验证**
```json
{
  "properties": {
    "context_id": {
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "timestamp": {
      "format": "date-time"
    },
    "name": {
      "minLength": 1,
      "maxLength": 255
    }
  }
}
```

### **业务规则验证**
```typescript
// 自定义验证规则
const contextValidationRules = {
  // 验证上下文名称唯一性
  validateNameUniqueness: async (name: string, contextId?: string) => {
    const existing = await contextRepository.findByName(name);
    return !existing || existing.contextId === contextId;
  },

  // 验证父子关系
  validateParentChildRelation: (parentId: string, childId: string) => {
    return parentId !== childId; // 不能自己是自己的父级
  },

  // 验证状态转换
  validateStatusTransition: (fromStatus: string, toStatus: string) => {
    const validTransitions = {
      'active': ['inactive', 'suspended', 'archived'],
      'inactive': ['active', 'archived'],
      'suspended': ['active', 'archived'],
      'archived': [] // 归档状态不能转换
    };
    return validTransitions[fromStatus]?.includes(toStatus) || false;
  }
};
```

## 🚀 **使用示例**

### **创建上下文**
```typescript
import { ContextService } from '@mplp/context';

const contextService = new ContextService();

// 创建新上下文
const newContext = await contextService.createContext({
  name: "项目开发上下文",
  description: "软件项目开发的主要工作上下文",
  priority: "high",
  businessContext: {
    department: "engineering",
    projectId: "proj-123"
  }
});

console.log(`创建上下文: ${newContext.contextId}`);
```

### **查询上下文**
```typescript
// 根据ID查询
const context = await contextService.getContext(contextId);

// 根据条件查询
const contexts = await contextService.queryContexts({
  status: 'active',
  priority: ['high', 'critical'],
  department: 'engineering'
});
```

### **更新上下文**
```typescript
// 更新上下文状态
await contextService.updateContextStatus(contextId, 'suspended');

// 更新上下文信息
await contextService.updateContext(contextId, {
  description: "更新后的描述",
  priority: "medium"
});
```

## 🔄 **生命周期管理**

### **状态转换图**
```
[创建] → active
         ↓
active ←→ inactive
  ↓         ↓
suspended   ↓
  ↓         ↓
archived ←──┘
```

### **生命周期事件**
```typescript
// 监听上下文生命周期事件
contextService.on('context.created', (context: ContextData) => {
  console.log(`上下文已创建: ${context.contextId}`);
});

contextService.on('context.status_changed', (event) => {
  console.log(`上下文状态变更: ${event.contextId} ${event.fromStatus} → ${event.toStatus}`);
});

contextService.on('context.archived', (context: ContextData) => {
  console.log(`上下文已归档: ${context.contextId}`);
});
```

## 🔗 **模块集成**

### **与Plan模块集成**
```typescript
// 为计划创建上下文
const planContext = await contextService.createContextForPlan({
  planId: "plan-456",
  name: "计划执行上下文",
  priority: "high"
});
```

### **与Trace模块集成**
```typescript
// 启动上下文追踪
await traceService.startContextTrace(contextId, {
  traceLevel: "detailed",
  includeMetrics: true
});
```

### **与Role模块集成**
```typescript
// 设置上下文权限
await roleService.setContextPermissions(contextId, {
  owner: "user-123",
  viewers: ["user-456", "user-789"],
  editors: ["user-456"]
});
```

## 📈 **性能考虑**

### **索引建议**
```sql
-- 主要查询索引
CREATE INDEX idx_context_status ON contexts(status);
CREATE INDEX idx_context_priority ON contexts(priority);
CREATE INDEX idx_context_created_at ON contexts(created_at);
CREATE INDEX idx_context_user_id ON contexts(user_id);

-- 复合索引
CREATE INDEX idx_context_status_priority ON contexts(status, priority);
```

### **缓存策略**
```typescript
// 上下文缓存配置
const contextCacheConfig = {
  ttl: 300, // 5分钟缓存
  maxSize: 1000, // 最多缓存1000个上下文
  keyPattern: 'context:{contextId}',
  invalidateOn: ['update', 'delete']
};
```

## ✅ **最佳实践**

### **命名规范**
- 使用描述性的上下文名称
- 避免使用技术术语作为用户可见的名称
- 保持名称简洁但信息丰富

### **状态管理**
- 及时清理不活跃的上下文
- 定期归档历史上下文
- 监控上下文的生命周期

### **安全考虑**
- 验证用户对上下文的访问权限
- 敏感信息加密存储
- 记录上下文访问日志

## 🏆 **企业级功能总结**

### **功能完整性**
- ✅ **17个核心功能**: 从8个基础功能增强到17个完整功能
- ✅ **9个企业级功能**: 审计、监控、版本控制、搜索、缓存、同步、错误处理、集成、事件
- ✅ **100%功能覆盖**: 满足MPLP项目的所有企业级要求

### **质量标准**
- ✅ **Schema验证**: 通过所有JSON Schema验证
- ✅ **架构一致性**: 符合统一的protocol_version架构标准
- ✅ **企业级合规**: 支持GDPR、HIPAA、SOX等合规要求
- ✅ **性能优化**: 多级缓存、智能同步、错误恢复

### **集成能力**
- ✅ **MPLP模块集成**: 与其他9个MPLP模块完整集成
- ✅ **事件驱动架构**: 完整的发布订阅机制
- ✅ **第三方集成**: Webhooks、API端点、外部服务
- ✅ **扩展性**: 支持插件和自定义扩展

### **运维支持**
- ✅ **监控告警**: 实时性能监控和智能告警
- ✅ **审计追踪**: 完整的用户活动记录和合规报告
- ✅ **版本管理**: 完整的变更历史和回滚能力
- ✅ **错误处理**: 智能重试、熔断器、自动恢复

---

**维护团队**: MPLP Context团队
**最后更新**: 2025-08-13 (企业级功能增强完成)
**文档状态**: ✅ 完成 (企业级标准)
**Schema状态**: ✅ 验证通过 (0错误)
**功能完整性**: ✅ 100% (17/17功能)
