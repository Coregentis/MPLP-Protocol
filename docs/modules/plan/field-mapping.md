# Plan模块字段映射表

## 📋 概述

Plan模块支持snake_case和camelCase两种字段命名格式，确保与不同系统和API的兼容性。本文档详细说明了所有字段的映射关系。

## 🔄 核心映射原则

1. **双向兼容**：同时支持snake_case和camelCase输入
2. **自动转换**：内部统一使用camelCase，对外支持双格式
3. **向后兼容**：保持与现有API的兼容性
4. **类型安全**：所有映射都有完整的TypeScript类型支持

## 📊 Plan实体字段映射

### 基础字段

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `plan_id` | `planId` | `UUID` | 计划唯一标识符 |
| `context_id` | `contextId` | `UUID` | 上下文标识符 |
| `name` | `name` | `string` | 计划名称 |
| `description` | `description` | `string` | 计划描述 |
| `status` | `status` | `PlanStatus` | 计划状态 |
| `version` | `version` | `string` | 版本号 |
| `created_at` | `createdAt` | `Timestamp` | 创建时间 |
| `updated_at` | `updatedAt` | `Timestamp` | 更新时间 |

### 业务字段

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `goals` | `goals` | `string[]` | 计划目标 |
| `tasks` | `tasks` | `PlanTask[]` | 任务列表 |
| `dependencies` | `dependencies` | `PlanDependency[]` | 依赖关系 |
| `execution_strategy` | `executionStrategy` | `ExecutionStrategy` | 执行策略 |
| `priority` | `priority` | `Priority` | 优先级 |
| `estimated_duration` | `estimatedDuration` | `Duration` | 预估时长 |
| `actual_duration` | `actualDuration` | `Duration` | 实际时长 |
| `completion_percentage` | `completionPercentage` | `number` | 完成百分比 |

### 配置字段

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `configuration` | `configuration` | `PlanConfiguration` | 计划配置 |
| `metadata` | `metadata` | `Record<string, unknown>` | 元数据 |
| `tags` | `tags` | `string[]` | 标签 |
| `owner_id` | `ownerId` | `UUID` | 所有者ID |
| `team_id` | `teamId` | `UUID` | 团队ID |

### 风险评估字段

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `risk_assessment` | `riskAssessment` | `RiskAssessment` | 风险评估 |
| `risk_level` | `riskLevel` | `RiskLevel` | 风险等级 |
| `mitigation_strategies` | `mitigationStrategies` | `string[]` | 缓解策略 |

## 📋 Task实体字段映射

### 基础字段

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `task_id` | `taskId` | `UUID` | 任务唯一标识符 |
| `plan_id` | `planId` | `UUID` | 所属计划ID |
| `name` | `name` | `string` | 任务名称 |
| `description` | `description` | `string` | 任务描述 |
| `status` | `status` | `TaskStatus` | 任务状态 |
| `priority` | `priority` | `number` | 优先级 |
| `created_at` | `createdAt` | `Timestamp` | 创建时间 |
| `updated_at` | `updatedAt` | `Timestamp` | 更新时间 |

### 执行字段

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `estimated_duration` | `estimatedDuration` | `number` | 预估时长(毫秒) |
| `actual_duration` | `actualDuration` | `number` | 实际时长(毫秒) |
| `start_time` | `startTime` | `Timestamp` | 开始时间 |
| `end_time` | `endTime` | `Timestamp` | 结束时间 |
| `assigned_to` | `assignedTo` | `UUID` | 分配给 |
| `dependencies` | `dependencies` | `UUID[]` | 依赖任务 |

## 🔗 Dependency实体字段映射

| snake_case | camelCase | 类型 | 描述 |
|------------|-----------|------|------|
| `dependency_id` | `dependencyId` | `UUID` | 依赖关系ID |
| `source_task_id` | `sourceTaskId` | `UUID` | 源任务ID |
| `target_task_id` | `targetTaskId` | `UUID` | 目标任务ID |
| `dependency_type` | `dependencyType` | `DependencyType` | 依赖类型 |
| `lag_time` | `lagTime` | `number` | 滞后时间 |
| `created_at` | `createdAt` | `Timestamp` | 创建时间 |

## 🎯 API接口字段映射

### CreatePlanRequest

```typescript
// 支持的输入格式
interface CreatePlanRequest {
  // snake_case格式
  context_id?: UUID;
  execution_strategy?: ExecutionStrategy;
  estimated_duration?: Duration;
  
  // camelCase格式
  contextId?: UUID;
  executionStrategy?: ExecutionStrategy;
  estimatedDuration?: Duration;
  
  // 通用字段
  name: string;
  description?: string;
  goals?: string[];
  priority?: Priority;
}
```

### PlanningCoordinationRequest

```typescript
interface PlanningCoordinationRequest {
  contextId: UUID;  // 内部使用camelCase
  planning_strategy: PlanningStrategy;  // 保持snake_case（协议标准）
  parameters: {
    decomposition_rules?: string[];
    priority_weights?: Record<string, number>;
    resource_constraints?: {
      time_limit?: number;
      resource_limit?: number;
    };
  };
}
```

### PlanningResult

```typescript
interface PlanningResult {
  planId: UUID;      // 主要字段（camelCase）
  plan_id?: UUID;    // 兼容字段（snake_case）
  task_breakdown: {
    tasks: Array<{
      taskId: UUID;
      name: string;
      dependencies: UUID[];
      priority: number;
      estimated_duration?: number;
    }>;
    execution_order: UUID[];
  };
  resource_allocation: Record<string, unknown>;
  timestamp: Timestamp;
}
```

## 🔧 映射实现机制

### 1. 参数标准化

```typescript
// PlanManagementService中的实现
private normalizeCreatePlanParams(params: CreatePlanParams): NormalizedCreatePlanParams {
  return {
    planId: params.planId || params.plan_id,
    contextId: params.contextId || params.context_id,
    name: params.name,
    description: params.description,
    goals: params.goals,
    executionStrategy: params.executionStrategy || params.execution_strategy,
    priority: params.priority,
    estimatedDuration: params.estimatedDuration || params.estimated_duration,
    configuration: params.configuration,
    metadata: params.metadata
  };
}
```

### 2. 响应格式化

```typescript
// 支持双格式输出
private formatPlanResponse(plan: Plan, format: 'snake_case' | 'camelCase' = 'camelCase'): PlanResponse {
  if (format === 'snake_case') {
    return {
      plan_id: plan.planId,
      context_id: plan.contextId,
      execution_strategy: plan.executionStrategy,
      estimated_duration: plan.estimatedDuration,
      // ... 其他字段
    };
  }
  
  return {
    planId: plan.planId,
    contextId: plan.contextId,
    executionStrategy: plan.executionStrategy,
    estimatedDuration: plan.estimatedDuration,
    // ... 其他字段
  };
}
```

### 3. 类型定义

```typescript
// 联合类型支持双格式
type CreatePlanParams = {
  contextId?: UUID;
  context_id?: UUID;
  executionStrategy?: ExecutionStrategy;
  execution_strategy?: ExecutionStrategy;
  estimatedDuration?: Duration;
  estimated_duration?: Duration;
  name: string;
  description?: string;
  goals?: string[];
  priority?: Priority;
  configuration?: PlanConfiguration;
  metadata?: Record<string, unknown>;
};
```

## 📝 使用示例

### 创建计划 - snake_case格式

```typescript
const result = await planService.createPlan({
  context_id: 'ctx-123',
  name: '项目计划',
  description: '项目描述',
  execution_strategy: 'sequential',
  estimated_duration: { value: 3600000, unit: 'milliseconds' }
});
```

### 创建计划 - camelCase格式

```typescript
const result = await planService.createPlan({
  contextId: 'ctx-123',
  name: '项目计划',
  description: '项目描述',
  executionStrategy: 'sequential',
  estimatedDuration: { value: 3600000, unit: 'milliseconds' }
});
```

### 规划协调 - 混合格式

```typescript
const planningResult = await planAdapter.execute({
  contextId: 'ctx-123',  // camelCase
  planning_strategy: 'sequential',  // snake_case (协议标准)
  parameters: {
    decomposition_rules: ['任务1', '任务2'],
    resource_constraints: {
      time_limit: 3600000,
      resource_limit: 100
    }
  }
});
```

## ⚠️ 注意事项

1. **优先级**：当同时提供snake_case和camelCase字段时，camelCase优先
2. **验证**：所有字段映射都经过严格的类型验证
3. **性能**：映射转换对性能影响微乎其微
4. **兼容性**：新版本将继续支持现有的字段格式
5. **文档同步**：字段映射变更时需同步更新文档

---

**版本**: v1.0.0  
**最后更新**: 2025-08-07  
**状态**: 生产就绪 ✅
