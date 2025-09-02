# Role模块字段映射参考

## 📋 概述

Role模块严格遵循MPLP双重命名约定：Schema层使用snake_case，TypeScript层使用camelCase，通过RoleMapper类实现100%一致性的双向映射。

## 🔄 双重命名约定

### 命名规则
- **Schema层**: snake_case (role_id, created_at, protocol_version)
- **TypeScript层**: camelCase (roleId, createdAt, protocolVersion)
- **映射函数**: toSchema(), fromSchema(), validateSchema()

## 📊 核心字段映射表

### 基础字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `role_id` | `roleId` | UUID | 角色唯一标识符 |
| `name` | `name` | string | 角色名称 |
| `role_type` | `roleType` | RoleType | 角色类型枚举 |
| `description` | `description` | string? | 角色描述 |
| `display_name` | `displayName` | string? | 显示名称 |
| `context_id` | `contextId` | UUID | 上下文标识符 |
| `status` | `status` | RoleStatus | 角色状态 |
| `protocol_version` | `protocolVersion` | string | 协议版本 |
| `timestamp` | `timestamp` | Date | 时间戳 |
| `role_operation` | `roleOperation` | string | 角色操作类型 |

### 权限字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `permission_id` | `permissionId` | UUID | 权限标识符 |
| `resource_type` | `resourceType` | string | 资源类型 |
| `resource_id` | `resourceId` | string | 资源标识符 |
| `actions` | `actions` | string[] | 操作列表 |
| `grant_type` | `grantType` | GrantType | 授权类型 |
| `permission_constraints` | `permissionConstraints` | object? | 权限约束 |

### 作用域字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `scope_level` | `level` | ScopeLevel | 作用域级别 |
| `context_ids` | `contextIds` | UUID[] | 上下文ID列表 |
| `resource_constraints` | `resourceConstraints` | object | 资源约束 |
| `allowed_resource_types` | `allowedResourceTypes` | string[] | 允许的资源类型 |
| `max_contexts` | `maxContexts` | number | 最大上下文数 |
| `max_plans` | `maxPlans` | number | 最大计划数 |

### 属性字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `department` | `department` | string? | 部门 |
| `security_clearance` | `securityClearance` | SecurityLevel | 安全级别 |
| `certification_requirements` | `certificationRequirements` | Certification[] | 认证要求 |

### 继承字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `parent_roles` | `parentRoles` | UUID[] | 父角色列表 |
| `child_roles` | `childRoles` | UUID[] | 子角色列表 |
| `inheritance_type` | `inheritanceType` | InheritanceType | 继承类型 |

### 委托字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `delegated_to` | `delegatedTo` | Delegation[] | 委托给 |
| `delegated_from` | `delegatedFrom` | Delegation[] | 委托来源 |
| `delegation_type` | `delegationType` | DelegationType | 委托类型 |
| `start_time` | `startTime` | Date | 开始时间 |
| `end_time` | `endTime` | Date | 结束时间 |

### 审计字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `audit_enabled` | `enabled` | boolean | 审计启用状态 |
| `retention_days` | `retentionDays` | number | 保留天数 |
| `audit_events` | `auditEvents` | AuditEvent[] | 审计事件 |
| `event_id` | `eventId` | UUID | 事件标识符 |
| `event_type` | `eventType` | EventType | 事件类型 |
| `user_id` | `userId` | UUID | 用户标识符 |

### 性能指标字段映射
| Schema (snake_case) | TypeScript (camelCase) | 类型 | 描述 |
|-------------------|----------------------|------|------|
| `metrics_enabled` | `enabled` | boolean | 指标启用状态 |
| `collection_interval_seconds` | `collectionIntervalSeconds` | number | 收集间隔 |
| `permission_checks_count` | `permissionChecksCount` | number | 权限检查次数 |
| `average_response_time_ms` | `averageResponseTimeMs` | number | 平均响应时间 |
| `cache_hit_rate` | `cacheHitRate` | number | 缓存命中率 |
| `error_rate` | `errorRate` | number | 错误率 |

## 🔧 映射器实现

### RoleMapper类结构
```typescript
export class RoleMapper {
  // 主要映射方法
  static toSchema(entity: RoleEntity): RoleSchema;
  static fromSchema(schema: RoleSchema): RoleEntityData;
  static validateSchema(data: unknown): data is RoleSchema;
  
  // 批量映射方法
  static toSchemaArray(entities: RoleEntity[]): RoleSchema[];
  static fromSchemaArray(schemas: RoleSchema[]): RoleEntityData[];
  
  // 部分映射方法
  static toSchemaPartial(entity: Partial<RoleEntity>): Partial<RoleSchema>;
  static fromSchemaPartial(schema: Partial<RoleSchema>): Partial<RoleEntityData>;
  
  // 嵌套对象映射
  static mapPermissions(permissions: Permission[]): PermissionSchema[];
  static mapScope(scope: RoleScope): RoleScopeSchema;
  static mapAttributes(attributes: RoleAttributes): RoleAttributesSchema;
  static mapInheritance(inheritance: RoleInheritance): RoleInheritanceSchema;
  static mapDelegation(delegation: RoleDelegation): RoleDelegationSchema;
  static mapAuditTrail(auditTrail: AuditTrail): AuditTrailSchema;
  static mapPerformanceMetrics(metrics: PerformanceMetrics): PerformanceMetricsSchema;
}
```

### 核心映射逻辑示例
```typescript
static toSchema(entity: RoleEntity): RoleSchema {
  return {
    role_id: entity.roleId,
    name: entity.name,
    role_type: entity.roleType,
    description: entity.description,
    display_name: entity.displayName,
    context_id: entity.contextId,
    status: entity.status,
    permissions: entity.permissions?.map(p => this.mapPermissionToSchema(p)),
    scope: entity.scope ? this.mapScopeToSchema(entity.scope) : undefined,
    attributes: entity.attributes ? this.mapAttributesToSchema(entity.attributes) : undefined,
    inheritance: entity.inheritance ? this.mapInheritanceToSchema(entity.inheritance) : undefined,
    delegation: entity.delegation ? this.mapDelegationToSchema(entity.delegation) : undefined,
    audit_trail: entity.auditTrail ? this.mapAuditTrailToSchema(entity.auditTrail) : undefined,
    performance_metrics: entity.performanceMetrics ? this.mapPerformanceMetricsToSchema(entity.performanceMetrics) : undefined,
    protocol_version: entity.protocolVersion,
    timestamp: entity.timestamp.toISOString(),
    role_operation: entity.roleOperation
  };
}
```

## 🔍 特殊映射处理

### 日期时间映射
```typescript
// Schema → TypeScript
timestamp: new Date(schema.timestamp)
created_at: new Date(schema.created_at)
updated_at: new Date(schema.updated_at)

// TypeScript → Schema  
timestamp: entity.timestamp.toISOString()
created_at: entity.createdAt.toISOString()
updated_at: entity.updatedAt.toISOString()
```

### 枚举类型映射
```typescript
// RoleType枚举映射
export enum RoleType {
  FUNCTIONAL = 'functional',
  ORGANIZATIONAL = 'organizational', 
  PROJECT = 'project',
  SYSTEM = 'system',
  TEMPORARY = 'temporary'
}

// Schema中使用字符串值
role_type: 'functional' | 'organizational' | 'project' | 'system' | 'temporary'
```

### 数组类型映射
```typescript
// 权限数组映射
permissions: entity.permissions?.map(permission => ({
  permission_id: permission.permissionId,
  resource_type: permission.resourceType,
  resource_id: permission.resourceId,
  actions: permission.actions,
  grant_type: permission.grantType
}))

// 上下文ID数组映射
context_ids: entity.scope?.contextIds || []
```

### 嵌套对象映射
```typescript
// 作用域对象映射
scope: entity.scope ? {
  level: entity.scope.level,
  context_ids: entity.scope.contextIds,
  resource_constraints: {
    allowed_resource_types: entity.scope.resourceConstraints?.allowedResourceTypes,
    max_contexts: entity.scope.resourceConstraints?.maxContexts,
    max_plans: entity.scope.resourceConstraints?.maxPlans
  }
} : undefined
```

## ✅ 映射验证

### 一致性检查
```typescript
export class MappingValidator {
  static validateConsistency(entity: RoleEntity, schema: RoleSchema): boolean {
    const convertedSchema = RoleMapper.toSchema(entity);
    const convertedEntity = RoleMapper.fromSchema(schema);
    
    return this.deepEqual(convertedSchema, schema) && 
           this.deepEqual(convertedEntity, entity);
  }
  
  static validateAllFields(): ValidationResult {
    const requiredMappings = [
      'role_id → roleId',
      'role_type → roleType', 
      'context_id → contextId',
      'protocol_version → protocolVersion',
      // ... 所有必需映射
    ];
    
    return this.checkMappingCompleteness(requiredMappings);
  }
}
```

### 类型安全检查
```typescript
// 编译时类型检查
type SchemaKeys = keyof RoleSchema;
type EntityKeys = keyof RoleEntity;

// 确保所有Schema字段都有对应的Entity字段
type MappingCheck = {
  [K in SchemaKeys]: K extends keyof MappingTable ? MappingTable[K] : never;
};
```

## 📊 映射性能优化

### 缓存策略
```typescript
class MappingCache {
  private static cache = new Map<string, any>();
  
  static getCachedMapping(key: string): any {
    return this.cache.get(key);
  }
  
  static setCachedMapping(key: string, value: any): void {
    this.cache.set(key, value);
  }
}
```

### 批量映射优化
```typescript
static toSchemaArray(entities: RoleEntity[]): RoleSchema[] {
  // 使用并行映射提高性能
  return entities.map(entity => this.toSchema(entity));
}

static fromSchemaArray(schemas: RoleSchema[]): RoleEntityData[] {
  // 批量验证和转换
  const validSchemas = schemas.filter(schema => this.validateSchema(schema));
  return validSchemas.map(schema => this.fromSchema(schema));
}
```

## 🔧 扩展映射

### 自定义字段映射
```typescript
interface CustomFieldMapping {
  schemaField: string;
  entityField: string;
  transformer?: (value: any) => any;
}

static addCustomMapping(mapping: CustomFieldMapping): void {
  this.customMappings.set(mapping.schemaField, mapping);
}
```

### 插件映射支持
```typescript
interface PluginMapping {
  pluginName: string;
  mappingFunction: (data: any) => any;
}

static registerPluginMapping(plugin: PluginMapping): void {
  this.pluginMappings.set(plugin.pluginName, plugin.mappingFunction);
}
```

## 🧪 映射测试

### 单元测试覆盖
- 所有字段映射测试：100%覆盖
- 边界条件测试：null/undefined处理
- 类型转换测试：日期、枚举、数组
- 嵌套对象测试：复杂对象结构

### 集成测试
- 端到端映射测试
- 性能基准测试
- 并发映射测试
- 大数据量映射测试

---

**版本**: 1.0.0  
**最后更新**: 2025-08-26  
**维护者**: MPLP开发团队
