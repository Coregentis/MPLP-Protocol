# Context模块API参考文档

## 📋 API概览

Context模块提供完整的RESTful API，支持上下文管理、共享状态管理和访问控制功能。所有API都遵循统一的响应格式和错误处理机制。

## 🔧 基础Context管理API

### 创建Context

**POST** `/api/contexts`

创建一个新的项目上下文。

```typescript
// 请求体
interface CreateContextRequest {
  name: string;
  description?: string;
  lifecycle_stage?: ContextLifecycleStage;
  metadata?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

// 响应
interface CreateContextResponse {
  success: boolean;
  data?: ContextResponse;
  errors?: ValidationError[];
}
```

**示例**：
```typescript
const response = await fetch('/api/contexts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "AI Agent Collaboration Project",
    description: "Multi-agent system for document processing",
    lifecycle_stage: "planning",
    metadata: {
      project_type: "ai_collaboration",
      priority: "high"
    }
  })
});
```

### 获取Context

**GET** `/api/contexts/{contextId}`

根据ID获取特定的Context信息。

```typescript
// 路径参数
contextId: UUID

// 响应
interface GetContextResponse {
  success: boolean;
  data?: ContextResponse;
  error?: string;
}
```

### 更新Context

**PUT** `/api/contexts/{contextId}`

更新现有Context的基本信息。

```typescript
// 请求体
interface UpdateContextRequest {
  name?: string;
  description?: string;
  lifecycle_stage?: ContextLifecycleStage;
  status?: EntityStatus;
  metadata?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}
```

### 删除Context

**DELETE** `/api/contexts/{contextId}`

删除指定的Context（软删除）。

### 查询Context

**GET** `/api/contexts`

根据条件查询Context列表，支持分页和排序。

```typescript
// 查询参数
interface ContextQueryParams {
  name?: string;
  status?: EntityStatus;
  lifecycle_stage?: ContextLifecycleStage;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

## 🔄 共享状态管理API

### 更新共享状态

**PUT** `/api/contexts/{contextId}/shared-state`

更新Context的完整共享状态。

```typescript
// 请求体
interface UpdateSharedStateRequest {
  variables?: Record<string, unknown>;
  resources?: {
    allocated?: Record<string, ResourceSchema>;
    requirements?: Record<string, ResourceRequirementSchema>;
  };
  dependencies?: DependencySchema[];
  goals?: GoalSchema[];
}

// 资源定义
interface ResourceSchema {
  type: string;
  amount: number;
  unit: string;
  status: 'available' | 'allocated' | 'exhausted';
}

// 依赖定义
interface DependencySchema {
  id: UUID;
  type: 'context' | 'plan' | 'external';
  name: string;
  version?: string;
  status: 'pending' | 'resolved' | 'failed';
}

// 目标定义
interface GoalSchema {
  id: UUID;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'defined' | 'active' | 'achieved' | 'abandoned';
  success_criteria: SuccessCriteriaSchema[];
}
```

**示例**：
```typescript
const sharedStateUpdate = {
  variables: {
    agent_count: 5,
    max_concurrency: 3,
    processing_mode: "parallel"
  },
  resources: {
    allocated: {
      memory: {
        type: "memory",
        amount: 8,
        unit: "GB",
        status: "allocated"
      },
      cpu: {
        type: "cpu",
        amount: 4,
        unit: "cores",
        status: "available"
      }
    },
    requirements: {
      memory: {
        minimum: 4,
        optimal: 8,
        maximum: 16,
        unit: "GB"
      }
    }
  },
  dependencies: [{
    id: "dep-001",
    type: "context",
    name: "Document Processing Context",
    status: "resolved"
  }],
  goals: [{
    id: "goal-001",
    name: "Process 1000 Documents",
    priority: "high",
    status: "active",
    success_criteria: [{
      metric: "documents_processed",
      operator: "gte",
      value: 1000
    }]
  }]
};

await fetch(`/api/contexts/${contextId}/shared-state`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sharedStateUpdate)
});
```

### 设置共享变量

**PUT** `/api/contexts/{contextId}/shared-variables/{key}`

设置单个共享变量的值。

```typescript
// 请求体
interface SetSharedVariableRequest {
  value: unknown;
}

// 路径参数
contextId: UUID
key: string
```

### 获取共享变量

**GET** `/api/contexts/{contextId}/shared-variables/{key}`

获取单个共享变量的值。

```typescript
// 响应
interface SharedVariableResponse {
  key: string;
  value: unknown;
  type: string;
}
```

### 分配资源

**POST** `/api/contexts/{contextId}/resources`

为Context分配新的资源。

```typescript
// 请求体
interface AllocateResourceRequest {
  resource_key: string;
  resource: ResourceSchema;
}
```

### 添加依赖

**POST** `/api/contexts/{contextId}/dependencies`

为Context添加新的依赖关系。

```typescript
// 请求体
interface AddDependencyRequest {
  dependency: DependencySchema;
}
```

### 更新依赖状态

**PUT** `/api/contexts/{contextId}/dependencies/{dependencyId}/status`

更新特定依赖的状态。

```typescript
// 请求体
interface UpdateDependencyStatusRequest {
  status: 'pending' | 'resolved' | 'failed';
}
```

### 添加目标

**POST** `/api/contexts/{contextId}/goals`

为Context添加新的目标。

```typescript
// 请求体
interface AddGoalRequest {
  goal: GoalSchema;
}
```

### 更新目标状态

**PUT** `/api/contexts/{contextId}/goals/{goalId}/status`

更新特定目标的状态。

```typescript
// 请求体
interface UpdateGoalStatusRequest {
  status: 'defined' | 'active' | 'achieved' | 'abandoned';
}
```

## 🔒 访问控制API

### 更新访问控制

**PUT** `/api/contexts/{contextId}/access-control`

更新Context的访问控制配置。

```typescript
// 请求体
interface UpdateAccessControlRequest {
  owner?: OwnerSchema;
  permissions?: PermissionSchema[];
  policies?: PolicySchema[];
}

// 所有者定义
interface OwnerSchema {
  user_id: string;
  role: string;
}

// 权限定义
interface PermissionSchema {
  principal: string;
  principal_type: 'user' | 'role' | 'group';
  resource: string;
  actions: ('read' | 'write' | 'execute' | 'delete' | 'admin')[];
  conditions?: Record<string, unknown>;
}

// 策略定义
interface PolicySchema {
  id: UUID;
  name: string;
  type: 'security' | 'compliance' | 'operational';
  rules: PolicyRuleSchema[];
  enforcement: 'strict' | 'advisory' | 'disabled';
}
```

### 检查权限

**POST** `/api/contexts/{contextId}/permissions/check`

检查指定主体是否有权限执行特定操作。

```typescript
// 请求体
interface CheckPermissionRequest {
  principal: string;
  resource: string;
  action: 'read' | 'write' | 'execute' | 'delete' | 'admin';
}

// 响应
interface PermissionCheckResponse {
  principal: string;
  resource: string;
  action: string;
  has_permission: boolean;
  permission_source: 'owner' | 'explicit' | 'policy' | 'none';
  checked_at: string;
}
```

### 添加权限

**POST** `/api/contexts/{contextId}/permissions`

为Context添加新的权限配置。

```typescript
// 请求体
interface AddPermissionRequest {
  permission: PermissionSchema;
}
```

### 移除权限

**DELETE** `/api/contexts/{contextId}/permissions`

移除特定的权限配置。

```typescript
// 请求体
interface RemovePermissionRequest {
  principal: string;
  resource: string;
}
```

### 添加策略

**POST** `/api/contexts/{contextId}/policies`

为Context添加新的访问策略。

```typescript
// 请求体
interface AddPolicyRequest {
  policy: PolicySchema;
}
```

### 移除策略

**DELETE** `/api/contexts/{contextId}/policies/{policyId}`

移除特定的访问策略。

## 📊 统一响应格式

所有API都遵循统一的响应格式：

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
  timestamp: string;
}

// 验证错误
interface ValidationError {
  field: string;
  message: string;
  code?: string;
}
```

## 🚨 错误处理

### HTTP状态码

- **200 OK**: 请求成功
- **201 Created**: 资源创建成功
- **400 Bad Request**: 请求参数错误
- **401 Unauthorized**: 未授权访问
- **403 Forbidden**: 权限不足
- **404 Not Found**: 资源不存在
- **409 Conflict**: 资源冲突
- **422 Unprocessable Entity**: 验证失败
- **500 Internal Server Error**: 服务器内部错误

### 常见错误示例

```typescript
// 验证错误
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Context name is required",
      "code": "REQUIRED_FIELD"
    }
  ],
  "timestamp": "2025-08-07T10:30:00Z"
}

// 权限错误
{
  "success": false,
  "error": "Permission denied",
  "timestamp": "2025-08-07T10:30:00Z"
}

// 资源不存在
{
  "success": false,
  "error": "Context not found",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

## 🚀 企业级功能API (v1.0 Enhanced)

### 性能监控API

#### 获取性能报告

**GET** `/api/contexts/{contextId}/performance/report`

获取指定Context的性能监控报告。

```typescript
// 响应
interface PerformanceReportResponse {
  success: boolean;
  data?: {
    metrics: PerformanceMetrics[];
    operationStats: OperationStats[];
    summary: {
      averageResponseTime: number;
      totalOperations: number;
      errorRate: number;
    };
  };
}
```

#### 获取性能告警

**GET** `/api/contexts/{contextId}/performance/alerts`

检查指定Context的性能告警。

```typescript
// 响应
interface PerformanceAlertsResponse {
  success: boolean;
  data?: {
    alerts: Array<{
      type: 'high_response_time' | 'high_error_rate';
      severity: 'warning' | 'critical';
      message: string;
      value: number;
    }>;
  };
}
```

### 依赖解析API

#### 解析依赖关系

**POST** `/api/contexts/{contextId}/dependencies/resolve`

解析Context的依赖关系并返回解析结果。

```typescript
// 请求体
interface ResolveDependenciesRequest {
  dependencies: Dependency[];
}

// 响应
interface ResolveDependenciesResponse {
  success: boolean;
  data?: {
    resolvedDependencies: UUID[];
    failedDependencies: UUID[];
    resolutionOrder: UUID[];
    circularDependencies: UUID[][];
    errors: string[];
  };
}
```

#### 检测依赖冲突

**POST** `/api/contexts/{contextId}/dependencies/conflicts`

检测依赖冲突并返回冲突信息。

```typescript
// 响应
interface DependencyConflictsResponse {
  success: boolean;
  data?: {
    conflicts: Array<{
      type: 'circular' | 'version' | 'resource';
      dependencies: UUID[];
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
}
```

### Context同步API

#### 同步Context状态

**POST** `/api/contexts/{sourceContextId}/sync`

将源Context的状态同步到目标Context。

```typescript
// 请求体
interface SyncContextsRequest {
  targetContextIds: UUID[];
  configuration: {
    mode: 'incremental' | 'full';
    conflictResolution: 'source' | 'target' | 'merge';
    timeout: number;
    syncFields: string[];
  };
}

// 响应
interface SyncContextsResponse {
  success: boolean;
  data?: {
    sourceContextId: UUID;
    targetContextIds: UUID[];
    syncedFields: string[];
    errors: string[];
    timestamp: Date;
    duration: number;
  };
}
```

#### 获取同步历史

**GET** `/api/contexts/{contextId}/sync/history`

获取指定Context的同步历史记录。

```typescript
// 响应
interface SyncHistoryResponse {
  success: boolean;
  data?: {
    history: Array<{
      sourceContextId: UUID;
      targetContextIds: UUID[];
      syncedFields: string[];
      success: boolean;
      timestamp: Date;
      duration: number;
    }>;
  };
}
```

#### 获取同步状态

**GET** `/api/contexts/sync/status`

获取系统级的同步状态统计。

```typescript
// 响应
interface SyncStatusResponse {
  success: boolean;
  data?: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageDuration: number;
  };
}
```

---

**文档版本**: v1.0.0 Enhanced
**最后更新**: 2025-08-08
**维护状态**: ✅ 活跃维护
