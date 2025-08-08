# Context模块字段映射表

## 📋 映射概览

Context模块严格遵循MPLP双重命名约定：
- **Schema层**: 使用snake_case命名（符合JSON Schema标准）
- **TypeScript层**: 使用camelCase命名（符合JavaScript/TypeScript约定）

本文档提供完整的字段映射关系，确保Schema和TypeScript代码的一致性。

## 🏗️ 核心Context字段映射

### 基础字段映射

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `context_id` | `contextId` | UUID | Context唯一标识符 |
| `session_id` | `sessionId` | UUID | 会话标识符 |
| `agent_id` | `agentId` | UUID | Agent标识符 |
| `user_id` | `userId` | string | 用户标识符 |
| `created_at` | `createdAt` | Date | 创建时间 |
| `updated_at` | `updatedAt` | Date | 更新时间 |
| `lifecycle_stage` | `lifecycleStage` | ContextLifecycleStage | 生命周期阶段 |
| `execution_status` | `executionStatus` | string | 执行状态 |
| `protocol_version` | `protocolVersion` | string | 协议版本 |

### 配置和元数据字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `timeout_settings` | `timeoutSettings` | object | 超时配置 |
| `notification_settings` | `notificationSettings` | object | 通知配置 |
| `performance_metrics` | `performanceMetrics` | object | 性能指标 |
| `error_information` | `errorInformation` | object | 错误信息 |
| `validation_rules` | `validationRules` | object | 验证规则 |

## 🔄 共享状态字段映射

### 共享状态核心字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `shared_state` | `sharedState` | SharedState | 共享状态对象 |
| `variables` | `variables` | Record<string, unknown> | 共享变量 |
| `allocated_resources` | `allocatedResources` | Record<string, Resource> | 已分配资源 |
| `resource_requirements` | `resourceRequirements` | Record<string, ResourceRequirement> | 资源需求 |
| `dependencies` | `dependencies` | Dependency[] | 依赖列表 |
| `goals` | `goals` | Goal[] | 目标列表 |

### 资源相关字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `resource_type` | `resourceType` | string | 资源类型 |
| `resource_amount` | `resourceAmount` | number | 资源数量 |
| `resource_unit` | `resourceUnit` | string | 资源单位 |
| `resource_status` | `resourceStatus` | ResourceStatus | 资源状态 |
| `minimum_requirement` | `minimumRequirement` | number | 最小需求 |
| `optimal_requirement` | `optimalRequirement` | number | 最优需求 |
| `maximum_requirement` | `maximumRequirement` | number | 最大需求 |

### 依赖相关字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `dependency_id` | `dependencyId` | UUID | 依赖标识符 |
| `dependency_type` | `dependencyType` | DependencyType | 依赖类型 |
| `dependency_name` | `dependencyName` | string | 依赖名称 |
| `dependency_version` | `dependencyVersion` | string | 依赖版本 |
| `dependency_status` | `dependencyStatus` | DependencyStatus | 依赖状态 |
| `resolved_at` | `resolvedAt` | Date | 解决时间 |

### 目标相关字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `goal_id` | `goalId` | UUID | 目标标识符 |
| `goal_name` | `goalName` | string | 目标名称 |
| `goal_description` | `goalDescription` | string | 目标描述 |
| `goal_priority` | `goalPriority` | Priority | 目标优先级 |
| `goal_status` | `goalStatus` | GoalStatus | 目标状态 |
| `success_criteria` | `successCriteria` | SuccessCriteria[] | 成功标准 |
| `achieved_at` | `achievedAt` | Date | 达成时间 |
| `progress_percentage` | `progressPercentage` | number | 进度百分比 |

## 🔒 访问控制字段映射

### 访问控制核心字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `access_control` | `accessControl` | AccessControl | 访问控制对象 |
| `owner` | `owner` | Owner | 所有者信息 |
| `permissions` | `permissions` | Permission[] | 权限列表 |
| `policies` | `policies` | Policy[] | 策略列表 |

### 所有者和权限字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `user_id` | `userId` | string | 用户标识符 |
| `user_role` | `userRole` | string | 用户角色 |
| `principal` | `principal` | string | 主体标识 |
| `principal_type` | `principalType` | PrincipalType | 主体类型 |
| `resource` | `resource` | string | 资源标识 |
| `actions` | `actions` | Action[] | 操作列表 |
| `conditions` | `conditions` | Record<string, unknown> | 条件配置 |

### 策略相关字段

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 描述 |
|------------------------|---------------------------|------|------|
| `policy_id` | `policyId` | UUID | 策略标识符 |
| `policy_name` | `policyName` | string | 策略名称 |
| `policy_type` | `policyType` | PolicyType | 策略类型 |
| `policy_rules` | `policyRules` | PolicyRule[] | 策略规则 |
| `enforcement_mode` | `enforcementMode` | PolicyEnforcement | 执行模式 |
| `rule_condition` | `ruleCondition` | string | 规则条件 |
| `rule_action` | `ruleAction` | string | 规则操作 |
| `rule_effect` | `ruleEffect` | 'allow' \| 'deny' | 规则效果 |

## 🔄 映射转换示例

### Schema到TypeScript转换

```typescript
// Schema格式 (snake_case)
const schemaData = {
  context_id: "ctx-123",
  created_at: "2025-08-07T10:30:00Z",
  lifecycle_stage: "executing",
  shared_state: {
    variables: {
      agent_count: 5
    },
    resources: {
      allocated: {
        memory: {
          type: "memory",
          amount: 8,
          unit: "GB",
          status: "allocated"
        }
      }
    }
  },
  access_control: {
    owner: {
      user_id: "user-123",
      role: "admin"
    },
    permissions: [{
      principal: "user-456",
      principal_type: "user",
      resource: "context-data",
      actions: ["read", "write"]
    }]
  }
};

// TypeScript格式 (camelCase)
const typescriptData: Context = {
  contextId: "ctx-123",
  createdAt: new Date("2025-08-07T10:30:00Z"),
  lifecycleStage: "executing",
  sharedState: new SharedState(
    { agentCount: 5 },
    {
      memory: {
        type: "memory",
        amount: 8,
        unit: "GB",
        status: ResourceStatus.ALLOCATED
      }
    }
  ),
  accessControl: new AccessControl(
    { userId: "user-123", role: "admin" },
    [{
      principal: "user-456",
      principalType: PrincipalType.USER,
      resource: "context-data",
      actions: [Action.read, Action.write]
    }]
  )
};
```

### 自动映射函数

```typescript
/**
 * Schema格式转TypeScript格式
 */
export function mapSchemaToTypeScript(schemaData: ContextSchema): Context {
  return new Context(
    schemaData.context_id,
    schemaData.name,
    schemaData.description,
    schemaData.lifecycle_stage,
    schemaData.status,
    new Date(schemaData.created_at),
    new Date(schemaData.updated_at),
    schemaData.session_ids || [],
    schemaData.shared_state_ids || [],
    schemaData.configuration || {},
    schemaData.metadata || {},
    schemaData.shared_state ? SharedState.fromSchemaFormat(schemaData.shared_state) : undefined,
    schemaData.access_control ? AccessControl.fromSchemaFormat(schemaData.access_control) : undefined
  );
}

/**
 * TypeScript格式转Schema格式
 */
export function mapTypeScriptToSchema(context: Context): ContextSchema {
  return {
    context_id: context.contextId,
    name: context.name,
    description: context.description,
    lifecycle_stage: context.lifecycleStage,
    status: context.status,
    created_at: context.createdAt.toISOString(),
    updated_at: context.updatedAt.toISOString(),
    session_ids: context.sessionIds,
    shared_state_ids: context.sharedStateIds,
    configuration: context.configuration,
    metadata: context.metadata,
    shared_state: context.sharedState?.toSchemaFormat(),
    access_control: context.accessControl?.toSchemaFormat()
  };
}
```

## 🎯 验证和一致性检查

### 字段映射验证

```typescript
/**
 * 验证字段映射一致性
 */
export function validateFieldMapping(schema: ContextSchema, typescript: Context): boolean {
  const mappingChecks = [
    schema.context_id === typescript.contextId,
    schema.created_at === typescript.createdAt.toISOString(),
    schema.lifecycle_stage === typescript.lifecycleStage,
    // ... 更多字段检查
  ];
  
  return mappingChecks.every(check => check === true);
}
```

### 常见映射错误

| 错误类型 | Schema字段 | 错误的TypeScript | 正确的TypeScript |
|---------|-----------|-----------------|-----------------|
| 命名约定 | `context_id` | `context_id` | `contextId` |
| 时间格式 | `created_at` | `"2025-08-07T10:30:00Z"` | `new Date("2025-08-07T10:30:00Z")` |
| 枚举值 | `lifecycle_stage` | `"planning"` | `ContextLifecycleStage.PLANNING` |
| 嵌套对象 | `shared_state` | `object` | `SharedState` |

## 📚 最佳实践

### 1. 映射一致性
- 始终使用自动映射函数，避免手动转换
- 定期运行映射验证测试
- 保持Schema和TypeScript定义同步更新

### 2. 类型安全
- 使用严格的TypeScript类型定义
- 避免使用any类型
- 利用编译时类型检查

### 3. 文档维护
- 新增字段时同步更新映射表
- 保持映射示例的准确性
- 定期审查映射关系的正确性

---

**文档版本**: v1.0.0  
**最后更新**: 2025-08-07  
**维护状态**: ✅ 活跃维护
