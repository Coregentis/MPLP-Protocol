# MPLP v1.0 API 文档

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **API概览**

MPLP v1.0 提供了完整的RESTful API和TypeScript SDK，支持多种集成方式。所有API都遵循OpenAPI 3.0规范，提供标准化的接口定义。

### **API模块完成度**
- ✅ **Context API** - 上下文管理 (100%完成)
- ✅ **Plan API** - 计划管理 (100%完成)
- ✅ **Confirm API** - 确认审批 (100%完成)
- ✅ **Trace API** - 执行追踪 (100%完成)
- ✅ **Role API** - 角色权限 (100%完成)
- ✅ **Extension API** - 扩展管理 (100%完成)
- ✅ **Core API** - 核心功能 (100%完成)

**总计**: 7个核心模块，100%API文档覆盖率

## 🏗️ **API架构**

### **API层次结构**
```
┌─────────────────────────────────────────┐
│              Client Layer               │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   REST API  │  │ TypeScript  │      │
│  │             │  │     SDK     │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│             Gateway Layer               │
│  ┌─────────────┐  ┌─────────────┐      │
│  │    Auth     │  │    Rate     │      │
│  │ Middleware  │  │  Limiting   │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            Protocol Layer               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Context  │ │  Plan   │ │ Confirm │   │
│  │   API   │ │   API   │ │   API   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Trace   │ │  Role   │ │Extension│   │
│  │   API   │ │   API   │ │   API   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

## 🔗 **基础信息**

### **Base URL**
```
Production:  https://api.mplp.dev/v1
Staging:     https://staging-api.mplp.dev/v1
Development: http://localhost:3000/api/v1
```

### **认证方式**
```http
# API Key认证
Authorization: Bearer mplp_api_key_your_key_here

# JWT Token认证
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **请求格式**
```http
Content-Type: application/json
Accept: application/json
X-MPLP-Version: 1.0.0
X-Request-ID: uuid-v4-request-id
```

## 📋 **核心API端点**

MPLP v1.0提供了7个核心模块的完整API，每个模块都有独立的API文档和完整的功能支持。

### **1. Context API - 上下文管理**
```http
# 创建上下文
POST /api/v1/contexts
{
  "project_id": "string",
  "agent_id": "string",
  "environment": "development",
  "metadata": {}
}

# 获取上下文详情
GET /api/v1/contexts/{contextId}

# 更新上下文
PUT /api/v1/contexts/{contextId}
{
  "metadata": {},
  "status": "active"
}

# 列出上下文
GET /api/v1/contexts?project_id=string&status=active&limit=10
```
📖 **详细文档**: [Context API](./context-api.md)

### **2. Plan API - 计划管理**
```http
# 创建计划
POST /api/v1/plans
{
  "context_id": "string",
  "title": "项目计划",
  "objectives": ["目标1", "目标2"],
  "timeline": {
    "start_date": "2025-08-06T00:00:00Z",
    "estimated_duration": "PT2H"
  },
  "resources": ["resource1", "resource2"]
}

# 获取计划详情
GET /api/v1/plans/{planId}

# 验证计划
POST /api/v1/plans/{planId}/validate

# 优化计划
POST /api/v1/plans/{planId}/optimize
```
📖 **详细文档**: [Plan API](./plan-api.md)

### **3. Confirm API - 确认审批**
```http
# 创建确认
POST /api/v1/confirms
{
  "confirmation_type": "plan_approval",
  "title": "项目计划审批",
  "plan_id": "string",
  "required_approvers": ["user1", "user2"],
  "deadline": "2025-08-15T23:59:59Z"
}

# 提交审批
POST /api/v1/confirms/{confirmId}/approve
{
  "decision": "approved",
  "comment": "计划合理，同意执行"
}

# 获取确认状态
GET /api/v1/confirms/{confirmId}
```
📖 **详细文档**: [Confirm API](./confirm-api.md)

### **4. Trace API - 执行追踪**
```http
# 创建追踪
POST /api/v1/traces
{
  "trace_type": "execution",
  "plan_id": "string",
  "title": "项目执行追踪",
  "severity": "info"
}

# 记录事件
POST /api/v1/traces/{traceId}/events
{
  "event_type": "progress",
  "title": "任务进度更新",
  "data": {"progress": 50}
}

# 获取性能指标
GET /api/v1/traces/{traceId}/metrics?metric_type=performance
```
📖 **详细文档**: [Trace API](./trace-api.md)

### **5. Role API - 角色权限**
```http
# 创建角色
POST /api/v1/roles
{
  "name": "project_manager",
  "display_name": "项目经理",
  "role_type": "functional",
  "permissions": [
    {
      "resource": "projects",
      "actions": ["create", "read", "update", "delete"],
      "grant_type": "allow"
    }
  ]
}

# 分配角色
POST /api/v1/roles/{roleId}/assignments
{
  "user_id": "string",
  "assignment_type": "direct"
}

# 检查权限
POST /api/v1/roles/permissions/check
{
  "user_id": "string",
  "resource": "projects",
  "action": "create"
}
```
📖 **详细文档**: [Role API](./role-api.md)

### **6. Extension API - 扩展管理**
```http
# 注册扩展
POST /api/v1/extensions
{
  "name": "custom_workflow",
  "version": "1.0.0",
  "extension_type": "protocol",
  "manifest": {
    "entry_point": "index.js",
    "permissions": ["workflow:create"]
  }
}

# 安装扩展
POST /api/v1/extensions/{extensionId}/install
{
  "context_id": "string",
  "auto_start": true
}

# 调用扩展方法
POST /api/v1/extensions/{extensionId}/invoke
{
  "method": "createWorkflow",
  "parameters": {}
}
```
📖 **详细文档**: [Extension API](./extension-api.md)

### **7. Core API - 核心功能**
```http
# 获取系统状态
GET /api/v1/core/status

# 获取系统信息
GET /api/v1/core/info

# 健康检查
GET /api/v1/core/health

# 获取指标
GET /api/v1/core/metrics
```
📖 **详细文档**: [Core API](./core-api.md)

## 📊 **响应格式**

### **成功响应**
```json
{
  "success": true,
  "data": {
    "id": "ctx_1234567890",
    "projectId": "project-001",
    "agentId": "agent-001",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### **错误响应**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "projectId",
        "message": "Project ID is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### **分页响应**
```json
{
  "success": true,
  "data": [
    {
      "id": "ctx_1234567890",
      "projectId": "project-001"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "requestId": "req_1234567890",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 🔧 **TypeScript SDK**

### **安装和初始化**
```typescript
import { MPLPClient } from 'mplp';

const client = new MPLPClient({
  baseUrl: 'https://api.mplp.dev/v1',
  apiKey: 'your-api-key',
  timeout: 30000
});
```

### **使用示例**
```typescript
// 创建上下文
const context = await client.contexts.create({
  projectId: 'my-project',
  agentId: 'agent-001',
  metadata: {
    description: 'Test context'
  }
});

// 创建计划
const plan = await client.plans.create({
  contextId: context.id,
  objectives: ['Analyze requirements', 'Design solution'],
  timeline: {
    startDate: new Date(),
    estimatedDuration: 'PT2H'
  }
});

// 确认计划
const confirmation = await client.confirmations.create({
  planId: plan.id,
  proposalType: 'approval'
});

await client.confirmations.approve(confirmation.id, {
  approver: 'agent-coordinator',
  reasoning: 'Plan looks good'
});

// 开始执行
const execution = await client.traces.startExecution({
  planId: plan.id,
  confirmationId: confirmation.id,
  executionMode: 'parallel'
});
```

## 🚦 **状态码**

### **HTTP状态码**
- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 认证失败
- `403 Forbidden` - 权限不足
- `404 Not Found` - 资源不存在
- `409 Conflict` - 资源冲突
- `422 Unprocessable Entity` - 数据验证失败
- `429 Too Many Requests` - 请求频率限制
- `500 Internal Server Error` - 服务器内部错误

### **业务错误码**
- `VALIDATION_ERROR` - 数据验证错误
- `AUTHENTICATION_ERROR` - 认证错误
- `AUTHORIZATION_ERROR` - 授权错误
- `RESOURCE_NOT_FOUND` - 资源不存在
- `RESOURCE_CONFLICT` - 资源冲突
- `RATE_LIMIT_EXCEEDED` - 频率限制
- `PROTOCOL_ERROR` - 协议错误
- `EXECUTION_ERROR` - 执行错误

## 📈 **性能和限制**

### **请求限制**
- **频率限制**: 1000 requests/hour (可配置)
- **并发限制**: 10 concurrent requests
- **请求大小**: 最大 1MB
- **响应大小**: 最大 10MB

### **超时设置**
- **连接超时**: 5秒
- **请求超时**: 30秒
- **长轮询**: 最大 60秒

### **缓存策略**
- **GET请求**: 缓存 5分钟
- **列表请求**: 缓存 1分钟
- **状态查询**: 缓存 30秒

---

## 📚 **完整API文档导航**

### **核心协议API**
- [📋 Context API](./context-api.md) - 上下文管理和环境配置
- [📝 Plan API](./plan-api.md) - 计划制定和任务管理
- [✅ Confirm API](./confirm-api.md) - 确认审批和决策流程
- [📊 Trace API](./trace-api.md) - 执行追踪和性能监控
- [👥 Role API](./role-api.md) - 角色权限和访问控制
- [🔧 Extension API](./extension-api.md) - 扩展管理和插件系统
- [⚙️ Core API](./core-api.md) - 核心系统功能

### **相关文档**
- [协议概览](../03-protocols/protocol-overview.md) - 六大核心协议介绍
- [开发指南](../04-development/development-guide.md) - API集成开发指南
- [认证指南](../04-development/authentication.md) - API认证和安全
