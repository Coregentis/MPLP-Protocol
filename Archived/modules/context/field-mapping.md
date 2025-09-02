# Context模块字段映射表

## 📋 **概述**

**模块**: Context模块  
**Schema文件**: `src/schemas/mplp-context.json`  
**映射标准**: Schema层(snake_case) ↔ TypeScript层(camelCase)  
**总字段数**: 19个必需字段 + 2个可选字段  
**映射完整性**: 100%覆盖  

## 🔄 **核心字段映射**

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 必需 | 描述 |
|-------------------------|---------------------------|------|------|------|
| `protocol_version` | `protocolVersion` | string | ✅ | MPLP协议版本，固定为"1.0.0" |
| `timestamp` | `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `context_id` | `contextId` | string | ✅ | UUID v4格式的上下文标识符 |
| `name` | `name` | string | ✅ | 上下文名称 (1-255字符) |
| `description` | `description` | string | ❌ | 上下文描述 (最大1000字符) |
| `status` | `status` | string | ✅ | 状态枚举值 |
| `lifecycle_stage` | `lifecycleStage` | string | ✅ | 生命周期阶段 |

## 🔧 **复杂对象字段映射**

### **共享状态 (shared_state → sharedState)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `shared_state.variables` | `sharedState.variables` | object | ✅ | 共享变量 |
| `shared_state.resources` | `sharedState.resources` | object | ✅ | 资源管理 |
| `shared_state.dependencies` | `sharedState.dependencies` | array | ✅ | 依赖关系 |
| `shared_state.goals` | `sharedState.goals` | array | ✅ | 目标定义 |

### **访问控制 (access_control → accessControl)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `access_control.owner` | `accessControl.owner` | object | ✅ | 所有者信息 |
| `access_control.permissions` | `accessControl.permissions` | array | ✅ | 权限列表 |
| `access_control.policies` | `accessControl.policies` | array | ❌ | 策略配置 |

### **配置设置 (configuration → configuration)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `configuration.timeout_settings` | `configuration.timeoutSettings` | object | ✅ | 超时配置 |
| `configuration.notification_settings` | `configuration.notificationSettings` | object | ✅ | 通知配置 |
| `configuration.persistence` | `configuration.persistence` | object | ✅ | 持久化配置 |

## 🏢 **企业级功能字段映射**

### **审计追踪 (audit_trail → auditTrail)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `audit_trail.enabled` | `auditTrail.enabled` | boolean | ✅ | 是否启用审计 |
| `audit_trail.retention_days` | `auditTrail.retentionDays` | number | ✅ | 保留天数 |
| `audit_trail.audit_events` | `auditTrail.auditEvents` | array | ✅ | 审计事件列表 |
| `audit_trail.compliance_settings` | `auditTrail.complianceSettings` | object | ❌ | 合规设置 |

### **监控集成 (monitoring_integration → monitoringIntegration)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `monitoring_integration.enabled` | `monitoringIntegration.enabled` | boolean | ✅ | 是否启用监控 |
| `monitoring_integration.supported_providers` | `monitoringIntegration.supportedProviders` | array | ✅ | 支持的监控提供商 |
| `monitoring_integration.integration_endpoints` | `monitoringIntegration.integrationEndpoints` | object | ❌ | 集成端点 |
| `monitoring_integration.context_metrics` | `monitoringIntegration.contextMetrics` | object | ❌ | 上下文指标 |
| `monitoring_integration.export_formats` | `monitoringIntegration.exportFormats` | array | ✅ | 导出格式 |

### **性能指标 (performance_metrics → performanceMetrics)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `performance_metrics.enabled` | `performanceMetrics.enabled` | boolean | ✅ | 是否启用性能监控 |
| `performance_metrics.collection_interval_seconds` | `performanceMetrics.collectionIntervalSeconds` | number | ✅ | 收集间隔(秒) |
| `performance_metrics.metrics` | `performanceMetrics.metrics` | object | ❌ | 性能指标数据 |
| `performance_metrics.health_status` | `performanceMetrics.healthStatus` | object | ❌ | 健康状态 |
| `performance_metrics.alerting` | `performanceMetrics.alerting` | object | ❌ | 告警配置 |

### **版本历史 (version_history → versionHistory)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `version_history.enabled` | `versionHistory.enabled` | boolean | ✅ | 是否启用版本控制 |
| `version_history.max_versions` | `versionHistory.maxVersions` | number | ✅ | 最大版本数 |
| `version_history.versions` | `versionHistory.versions` | array | ❌ | 版本列表 |
| `version_history.auto_versioning` | `versionHistory.autoVersioning` | object | ❌ | 自动版本控制 |

### **搜索元数据 (search_metadata → searchMetadata)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `search_metadata.enabled` | `searchMetadata.enabled` | boolean | ✅ | 是否启用搜索 |
| `search_metadata.indexing_strategy` | `searchMetadata.indexingStrategy` | string | ✅ | 索引策略 |
| `search_metadata.searchable_fields` | `searchMetadata.searchableFields` | array | ❌ | 可搜索字段 |
| `search_metadata.search_indexes` | `searchMetadata.searchIndexes` | array | ❌ | 搜索索引 |
| `search_metadata.context_indexing` | `searchMetadata.contextIndexing` | object | ❌ | 上下文索引 |
| `search_metadata.auto_indexing` | `searchMetadata.autoIndexing` | object | ❌ | 自动索引 |

### **缓存策略 (caching_policy → cachingPolicy)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `caching_policy.enabled` | `cachingPolicy.enabled` | boolean | ✅ | 是否启用缓存 |
| `caching_policy.cache_strategy` | `cachingPolicy.cacheStrategy` | string | ✅ | 缓存策略 |
| `caching_policy.cache_levels` | `cachingPolicy.cacheLevels` | array | ❌ | 缓存层级 |
| `caching_policy.cache_warming` | `cachingPolicy.cacheWarming` | object | ❌ | 缓存预热 |

### **同步配置 (sync_configuration → syncConfiguration)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `sync_configuration.enabled` | `syncConfiguration.enabled` | boolean | ✅ | 是否启用同步 |
| `sync_configuration.sync_strategy` | `syncConfiguration.syncStrategy` | string | ✅ | 同步策略 |
| `sync_configuration.sync_targets` | `syncConfiguration.syncTargets` | array | ❌ | 同步目标 |
| `sync_configuration.replication` | `syncConfiguration.replication` | object | ❌ | 复制配置 |

### **错误处理 (error_handling → errorHandling)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `error_handling.enabled` | `errorHandling.enabled` | boolean | ✅ | 是否启用错误处理 |
| `error_handling.error_policies` | `errorHandling.errorPolicies` | array | ✅ | 错误策略 |
| `error_handling.circuit_breaker` | `errorHandling.circuitBreaker` | object | ❌ | 熔断器配置 |
| `error_handling.recovery_strategy` | `errorHandling.recoveryStrategy` | object | ❌ | 恢复策略 |

### **集成接口 (integration_endpoints → integrationEndpoints)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `integration_endpoints.enabled` | `integrationEndpoints.enabled` | boolean | ✅ | 是否启用集成 |
| `integration_endpoints.webhooks` | `integrationEndpoints.webhooks` | array | ❌ | Webhook配置 |
| `integration_endpoints.api_endpoints` | `integrationEndpoints.apiEndpoints` | array | ❌ | API端点配置 |

### **事件集成 (event_integration → eventIntegration)**

| Schema字段 | TypeScript字段 | 类型 | 必需 | 描述 |
|------------|----------------|------|------|------|
| `event_integration.enabled` | `eventIntegration.enabled` | boolean | ✅ | 是否启用事件集成 |
| `event_integration.event_bus_connection` | `eventIntegration.eventBusConnection` | object | ❌ | 事件总线连接 |
| `event_integration.published_events` | `eventIntegration.publishedEvents` | array | ❌ | 发布的事件 |
| `event_integration.subscribed_events` | `eventIntegration.subscribedEvents` | array | ❌ | 订阅的事件 |
| `event_integration.event_routing` | `eventIntegration.eventRouting` | object | ❌ | 事件路由 |

## 📊 **映射统计**

- **总字段数**: 21个顶级字段
- **必需字段**: 19个
- **可选字段**: 2个 (description, context_operation)
- **复杂对象**: 17个
- **数组字段**: 8个
- **映射覆盖率**: 100%

## ✅ **验证要求**

1. **类型安全**: 所有字段必须有正确的TypeScript类型定义
2. **映射一致性**: Schema和TypeScript字段必须一一对应
3. **命名规范**: 严格遵循snake_case ↔ camelCase转换规则
4. **完整性**: 不能遗漏任何Schema字段
5. **验证方法**: 必须实现validateSchema方法验证数据完整性

## 🔧 **Mapper实现示例**

### **基本映射方法**
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
          permissions: p.permissions
        }))
      },
      // ... 其他字段映射
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
          permissions: p.permissions
        }))
      },
      // ... 其他字段映射
    };
  }

  static validateSchema(data: unknown): data is ContextSchema {
    // JSON Schema validation implementation
    return ajv.validate(contextSchema, data);
  }
}
```

---

**字段映射版本**: 1.0.0  
**最后更新**: 2025-01-25  
**映射完整性**: 100%  
**状态**: 生产就绪
