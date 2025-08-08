# Context模块共享状态管理详解

## 📋 概述

共享状态管理是Context模块的核心高级功能，为多智能体系统提供统一的状态共享、资源管理、依赖跟踪和目标管理能力。通过SharedState值对象和专门的管理服务，实现了安全、高效的多Agent协作。

## 🏗️ 架构设计

### SharedState值对象

```typescript
export class SharedState {
  constructor(
    public readonly variables: Record<string, unknown>,
    public readonly allocatedResources: Record<string, Resource>,
    public readonly resourceRequirements: Record<string, ResourceRequirement>,
    public readonly dependencies: Dependency[],
    public readonly goals: Goal[]
  ) {}
  
  // 不可变操作方法
  updateVariables(variables: Record<string, unknown>): SharedState;
  allocateResource(key: string, resource: Resource): SharedState;
  addDependency(dependency: Dependency): SharedState;
  addGoal(goal: Goal): SharedState;
}
```

**设计特点**：
- **不可变性**: 所有操作返回新的SharedState实例
- **类型安全**: 严格的TypeScript类型定义
- **业务封装**: 丰富的业务方法和验证逻辑
- **Schema兼容**: 完全符合mplp-context.json定义

## 🔄 核心功能详解

### 1. 共享变量管理

共享变量提供Agent间的数据共享机制，支持任意类型的数据存储。

```typescript
// 设置共享变量
await contextService.setSharedVariable(contextId, "agentCount", 5);
await contextService.setSharedVariable(contextId, "processingMode", "parallel");
await contextService.setSharedVariable(contextId, "config", {
  maxRetries: 3,
  timeout: 30000
});

// 获取共享变量
const agentCount = await contextService.getSharedVariable(contextId, "agentCount");
const config = await contextService.getSharedVariable(contextId, "config");

// 批量更新变量
const updates = {
  agentCount: 10,
  maxConcurrency: 5,
  lastUpdated: new Date().toISOString()
};
const sharedState = sharedStateService.updateVariables(currentState, updates);
```

**使用场景**：
- Agent配置参数共享
- 运行时状态同步
- 协作数据交换
- 系统配置管理

### 2. 资源管理

资源管理提供系统资源的分配、监控和需求管理功能。

#### 资源分配

```typescript
// 定义资源
const memoryResource: Resource = {
  type: "memory",
  amount: 8,
  unit: "GB",
  status: ResourceStatus.ALLOCATED
};

const cpuResource: Resource = {
  type: "cpu",
  amount: 4,
  unit: "cores",
  status: ResourceStatus.AVAILABLE
};

// 分配资源
const updatedState = sharedStateService.allocateResource(
  currentState, 
  "memory", 
  memoryResource
);
```

#### 资源需求管理

```typescript
// 设置资源需求
const memoryRequirement: ResourceRequirement = {
  minimum: 4,
  optimal: 8,
  maximum: 16,
  unit: "GB"
};

const updatedState = sharedStateService.setResourceRequirement(
  currentState,
  "memory",
  memoryRequirement
);

// 验证资源分配
try {
  sharedStateService.allocateResource(currentState, "memory", {
    type: "memory",
    amount: 32, // 超过最大限制
    unit: "GB",
    status: ResourceStatus.ALLOCATED
  });
} catch (error) {
  // 错误: Resource allocation 32 exceeds maximum limit 16
}
```

#### 资源状态监控

```typescript
// 检查资源可用性
const isMemoryAvailable = sharedStateService.checkResourceAvailability(
  currentState, 
  "memory"
);

// 获取资源分配状态
const memoryAllocation = context.getResourceAllocation("memory");
console.log(`Memory: ${memoryAllocation.amount}${memoryAllocation.unit} - ${memoryAllocation.status}`);
```

### 3. 依赖管理

依赖管理跟踪Context间的依赖关系，确保执行顺序和条件满足。

#### 添加依赖

```typescript
// 定义依赖
const contextDependency: Dependency = {
  id: "parent-context-001",
  type: DependencyType.CONTEXT,
  name: "Document Processing Context",
  version: "1.0.0",
  status: DependencyStatus.PENDING
};

const planDependency: Dependency = {
  id: "preprocessing-plan",
  type: DependencyType.PLAN,
  name: "Data Preprocessing Plan",
  status: DependencyStatus.RESOLVED
};

// 添加依赖
const updatedState = sharedStateService.addDependency(currentState, contextDependency);
```

#### 依赖状态管理

```typescript
// 更新依赖状态
const resolvedState = sharedStateService.updateDependencyStatus(
  currentState,
  "parent-context-001",
  DependencyStatus.RESOLVED
);

// 检查依赖状态
const isResolved = sharedStateService.checkDependencyResolved(
  currentState,
  "parent-context-001"
);

// 获取未解决的依赖
const unresolvedDeps = sharedStateService.getUnresolvedDependencies(currentState);
console.log(`Unresolved dependencies: ${unresolvedDeps.length}`);
```

### 4. 目标管理

目标管理提供任务目标的设定、跟踪和验证功能。

#### 设定目标

```typescript
// 定义目标
const processingGoal: Goal = {
  id: "process-documents",
  name: "Process 1000 Documents",
  description: "Complete processing of document batch",
  priority: Priority.HIGH,
  status: GoalStatus.DEFINED,
  successCriteria: [
    {
      metric: "documents_processed",
      operator: SuccessCriteriaOperator.GTE,
      value: 1000,
      unit: "documents"
    },
    {
      metric: "error_rate",
      operator: SuccessCriteriaOperator.LTE,
      value: 0.01,
      unit: "percentage"
    }
  ]
};

// 添加目标
const updatedState = sharedStateService.addGoal(currentState, processingGoal);
```

#### 目标状态跟踪

```typescript
// 激活目标
const activeState = sharedStateService.updateGoalStatus(
  currentState,
  "process-documents",
  GoalStatus.ACTIVE
);

// 检查目标达成
const isAchieved = sharedStateService.checkGoalAchieved(
  currentState,
  "process-documents"
);

// 获取高优先级目标
const highPriorityGoals = sharedStateService.getHighPriorityGoals(currentState);
console.log(`High priority goals: ${highPriorityGoals.length}`);
```

## 🔄 完整使用示例

### 多Agent协作场景

```typescript
// 1. 初始化共享状态
const initialState = sharedStateService.createSharedState(
  // 共享变量
  {
    projectPhase: "preprocessing",
    agentCount: 3,
    batchSize: 100
  },
  // 分配的资源
  {
    memory: {
      type: "memory",
      amount: 16,
      unit: "GB",
      status: ResourceStatus.ALLOCATED
    },
    cpu: {
      type: "cpu",
      amount: 8,
      unit: "cores",
      status: ResourceStatus.AVAILABLE
    }
  },
  // 资源需求
  {
    memory: {
      minimum: 8,
      optimal: 16,
      maximum: 32,
      unit: "GB"
    },
    storage: {
      minimum: 100,
      optimal: 500,
      maximum: 1000,
      unit: "GB"
    }
  },
  // 依赖关系
  [
    {
      id: "data-source",
      type: DependencyType.EXTERNAL,
      name: "Document Database",
      status: DependencyStatus.RESOLVED
    }
  ],
  // 目标设定
  [
    {
      id: "main-goal",
      name: "Complete Document Processing",
      priority: Priority.CRITICAL,
      status: GoalStatus.ACTIVE,
      successCriteria: [
        {
          metric: "completion_rate",
          operator: SuccessCriteriaOperator.EQ,
          value: 1.0
        }
      ]
    }
  ]
);

// 2. 更新Context的共享状态
await contextService.updateSharedState(contextId, initialState);

// 3. Agent协作过程中的状态更新
// Agent A 更新处理进度
await contextService.setSharedVariable(contextId, "processedCount", 250);

// Agent B 请求额外资源
const additionalMemory: Resource = {
  type: "memory",
  amount: 8,
  unit: "GB",
  status: ResourceStatus.ALLOCATED
};

const currentContext = await contextService.getContext(contextId);
const updatedState = sharedStateService.allocateResource(
  currentContext.sharedState!,
  "additional_memory",
  additionalMemory
);
await contextService.updateSharedState(contextId, updatedState);

// 4. 检查目标完成情况
const isGoalAchieved = await contextService.checkGoalAchieved(contextId, "main-goal");
if (isGoalAchieved) {
  await contextService.updateGoalStatus(contextId, "main-goal", GoalStatus.ACHIEVED);
}
```

## 🔒 安全和验证

### 资源验证

```typescript
// 自动验证资源分配合理性
try {
  const invalidResource: Resource = {
    type: "memory",
    amount: -5, // 负数无效
    unit: "GB",
    status: ResourceStatus.ALLOCATED
  };
  
  sharedStateService.allocateResource(currentState, "memory", invalidResource);
} catch (error) {
  // 错误: Resource amount cannot be negative
}
```

### 依赖验证

```typescript
// 验证依赖配置完整性
const invalidDependency: Dependency = {
  id: "", // 空ID无效
  type: DependencyType.CONTEXT,
  name: "Invalid Dependency",
  status: DependencyStatus.PENDING
};

try {
  sharedStateService.addDependency(currentState, invalidDependency);
} catch (error) {
  // 错误: Invalid dependency configuration
}
```

## 📊 性能优化

### 状态缓存

```typescript
// 缓存频繁访问的共享状态
class SharedStateCache {
  private cache = new Map<string, SharedState>();
  
  get(contextId: string): SharedState | undefined {
    return this.cache.get(contextId);
  }
  
  set(contextId: string, state: SharedState): void {
    this.cache.set(contextId, state);
  }
  
  invalidate(contextId: string): void {
    this.cache.delete(contextId);
  }
}
```

### 批量操作

```typescript
// 批量更新多个变量
const batchUpdates = {
  processedCount: 500,
  errorCount: 2,
  lastProcessedAt: new Date().toISOString(),
  currentPhase: "validation"
};

const updatedState = sharedStateService.updateVariables(currentState, batchUpdates);
```

## 🎯 最佳实践

### 1. 状态设计
- 保持状态结构简单明确
- 使用有意义的变量名
- 避免存储大量数据在共享变量中
- 定期清理不需要的状态

### 2. 资源管理
- 合理设置资源需求范围
- 及时释放不需要的资源
- 监控资源使用情况
- 实施资源配额管理

### 3. 依赖管理
- 明确定义依赖关系
- 及时更新依赖状态
- 避免循环依赖
- 实施依赖超时机制

### 4. 目标管理
- 设定可衡量的成功标准
- 定期检查目标进度
- 及时调整目标优先级
- 记录目标达成历史

---

**文档版本**: v1.0.0  
**最后更新**: 2025-08-07  
**维护状态**: ✅ 活跃维护
