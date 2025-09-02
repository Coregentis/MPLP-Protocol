# MPLP v1.0 Extension API 文档

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **API概览**

Extension API提供了完整的扩展管理功能，支持插件注册、生命周期管理、钩子系统和自定义协议扩展。

## 🔗 **基础信息**

- **Base URL**: `/api/v1/extensions`
- **认证方式**: Bearer Token
- **内容类型**: `application/json`
- **API版本**: v1.0.0

## 📋 **核心API端点**

### **1. 注册扩展**
```http
POST /api/v1/extensions
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "custom_workflow",
  "display_name": "自定义工作流扩展",
  "version": "1.0.0",
  "description": "提供自定义工作流功能的扩展",
  "extension_type": "protocol",
  "category": "workflow",
  "author": "MPLP Team",
  "homepage": "https://example.com/extensions/custom-workflow",
  "manifest": {
    "entry_point": "index.js",
    "dependencies": ["mplp-core@^1.0.0"],
    "permissions": ["workflow:create", "workflow:execute"],
    "hooks": ["plan:before_create", "trace:after_event"],
    "api_endpoints": [
      {
        "path": "/custom-workflows",
        "methods": ["GET", "POST"]
      }
    ]
  },
  "configuration": {
    "max_workflows": 100,
    "timeout_seconds": 300,
    "enable_notifications": true
  },
  "metadata": {
    "tags": ["workflow", "automation"],
    "license": "MIT",
    "repository": "https://github.com/example/custom-workflow"
  }
}
```

**响应示例**:
```json
{
  "status": 201,
  "data": {
    "extension_id": "ext_123456",
    "name": "custom_workflow",
    "display_name": "自定义工作流扩展",
    "version": "1.0.0",
    "extension_type": "protocol",
    "category": "workflow",
    "status": "registered",
    "created_at": "2025-08-06T00:35:06Z",
    "updated_at": "2025-08-06T00:35:06Z",
    "manifest": {
      "entry_point": "index.js",
      "permissions": ["workflow:create", "workflow:execute"],
      "hooks": ["plan:before_create", "trace:after_event"]
    },
    "installation_url": "/api/v1/extensions/ext_123456/install"
  },
  "message": "扩展注册成功"
}
```

### **2. 安装扩展**
```http
POST /api/v1/extensions/{extensionId}/install
Content-Type: application/json
Authorization: Bearer {token}

{
  "context_id": "ctx_789012",
  "configuration": {
    "max_workflows": 50,
    "timeout_seconds": 180,
    "enable_notifications": false
  },
  "permissions": ["workflow:create", "workflow:execute"],
  "auto_start": true
}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "installation_id": "inst_345678",
    "extension_id": "ext_123456",
    "context_id": "ctx_789012",
    "status": "installed",
    "installed_at": "2025-08-06T00:45:06Z",
    "configuration": {
      "max_workflows": 50,
      "timeout_seconds": 180,
      "enable_notifications": false
    },
    "health_check_url": "/api/v1/extensions/ext_123456/health"
  },
  "message": "扩展安装成功"
}
```

### **3. 调用扩展方法**
```http
POST /api/v1/extensions/{extensionId}/invoke
Content-Type: application/json
Authorization: Bearer {token}

{
  "method": "createWorkflow",
  "parameters": {
    "name": "数据处理流程",
    "steps": [
      {
        "name": "数据收集",
        "type": "input",
        "config": {"source": "database"}
      },
      {
        "name": "数据处理",
        "type": "transform",
        "config": {"rules": ["validate", "normalize"]}
      },
      {
        "name": "结果输出",
        "type": "output",
        "config": {"destination": "api"}
      }
    ]
  },
  "context": {
    "user_id": "user_123456",
    "session_id": "sess_789012"
  }
}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "invocation_id": "inv_901234",
    "extension_id": "ext_123456",
    "method": "createWorkflow",
    "result": {
      "workflow_id": "wf_567890",
      "name": "数据处理流程",
      "status": "created",
      "steps_count": 3
    },
    "execution_time_ms": 150,
    "invoked_at": "2025-08-06T01:00:06Z"
  },
  "message": "扩展方法调用成功"
}
```

### **4. 获取扩展详情**
```http
GET /api/v1/extensions/{extensionId}
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "extension_id": "ext_123456",
    "name": "custom_workflow",
    "display_name": "自定义工作流扩展",
    "version": "1.0.0",
    "description": "提供自定义工作流功能的扩展",
    "extension_type": "protocol",
    "category": "workflow",
    "status": "active",
    "author": "MPLP Team",
    "created_at": "2025-08-06T00:35:06Z",
    "updated_at": "2025-08-06T00:45:06Z",
    "manifest": {
      "entry_point": "index.js",
      "dependencies": ["mplp-core@^1.0.0"],
      "permissions": ["workflow:create", "workflow:execute"],
      "hooks": ["plan:before_create", "trace:after_event"],
      "api_endpoints": [
        {
          "path": "/custom-workflows",
          "methods": ["GET", "POST"]
        }
      ]
    },
    "installations": [
      {
        "installation_id": "inst_345678",
        "context_id": "ctx_789012",
        "status": "active",
        "installed_at": "2025-08-06T00:45:06Z"
      }
    ],
    "statistics": {
      "total_installations": 1,
      "total_invocations": 25,
      "avg_response_time_ms": 145,
      "success_rate": 98.5
    }
  }
}
```

### **5. 列出扩展**
```http
GET /api/v1/extensions?category=workflow&status=active&limit=20&offset=0
Authorization: Bearer {token}
```

**查询参数**:
- `category`: 扩展类别 (workflow, integration, ui, analytics, etc.)
- `extension_type`: 扩展类型 (protocol, plugin, widget, service)
- `status`: 扩展状态 (registered, active, inactive, deprecated)
- `author`: 作者筛选
- `search`: 搜索关键词
- `limit`: 返回数量限制 (默认10)
- `offset`: 偏移量 (默认0)

### **6. 更新扩展**
```http
PUT /api/v1/extensions/{extensionId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "display_name": "高级自定义工作流扩展",
  "version": "1.1.0",
  "description": "提供高级自定义工作流功能，支持条件分支和并行执行",
  "configuration": {
    "max_workflows": 200,
    "timeout_seconds": 600,
    "enable_notifications": true,
    "enable_parallel_execution": true
  },
  "manifest": {
    "permissions": ["workflow:create", "workflow:execute", "workflow:admin"],
    "hooks": ["plan:before_create", "plan:after_create", "trace:after_event"]
  }
}
```

### **7. 卸载扩展**
```http
DELETE /api/v1/extensions/{extensionId}/installations/{installationId}
Authorization: Bearer {token}

{
  "reason": "不再需要此功能",
  "cleanup_data": true,
  "force_uninstall": false
}
```

### **8. 获取扩展健康状态**
```http
GET /api/v1/extensions/{extensionId}/health
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "extension_id": "ext_123456",
    "health_status": "healthy",
    "last_check": "2025-08-06T01:30:06Z",
    "uptime_seconds": 3600,
    "metrics": {
      "cpu_usage": 5.2,
      "memory_usage_mb": 128,
      "active_connections": 3,
      "requests_per_minute": 15
    },
    "dependencies": [
      {
        "name": "mplp-core",
        "version": "1.0.0",
        "status": "available"
      }
    ],
    "issues": []
  }
}
```

## 📊 **数据模型**

### **扩展类型 (ExtensionType)**
- `protocol`: 协议扩展
- `plugin`: 插件扩展
- `widget`: 界面组件
- `service`: 服务扩展
- `integration`: 集成扩展

### **扩展状态 (ExtensionStatus)**
- `registered`: 已注册
- `active`: 活跃
- `inactive`: 非活跃
- `deprecated`: 已废弃
- `error`: 错误状态

### **安装状态 (InstallationStatus)**
- `installing`: 安装中
- `installed`: 已安装
- `active`: 活跃
- `inactive`: 非活跃
- `error`: 错误
- `uninstalling`: 卸载中

### **扩展类别 (Category)**
- `workflow`: 工作流
- `integration`: 集成
- `ui`: 用户界面
- `analytics`: 分析
- `security`: 安全
- `automation`: 自动化

## 🔧 **TypeScript SDK 使用示例**

```typescript
import { ExtensionProtocol } from 'mplp/extension';

// 注册扩展
const extension = await ExtensionProtocol.register({
  name: 'custom_workflow',
  version: '1.0.0',
  extension_type: 'protocol',
  manifest: {
    entry_point: 'index.js',
    permissions: ['workflow:create']
  }
});

// 安装扩展
await ExtensionProtocol.install(extension.extension_id, {
  context_id: 'ctx_123456',
  auto_start: true
});

// 调用扩展方法
const result = await ExtensionProtocol.invoke(extension.extension_id, {
  method: 'createWorkflow',
  parameters: { name: '测试流程' }
});
```

## 🚦 **状态码**

- `200 OK`: 请求成功
- `201 Created`: 扩展注册成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 认证失败
- `403 Forbidden`: 权限不足
- `404 Not Found`: 扩展不存在
- `409 Conflict`: 扩展冲突
- `422 Unprocessable Entity`: 数据验证失败
- `500 Internal Server Error`: 服务器内部错误

## 📈 **性能和限制**

- **请求频率**: 200 requests/minute
- **扩展数量**: 最大100个扩展/上下文
- **方法调用**: 最大1000次/小时
- **配置大小**: 最大1MB
- **依赖深度**: 最大5层依赖

---

**相关文档**:
- [Extension Protocol概览](../03-protocols/protocol-overview.md#extension-protocol)
- [API总览](./api-overview.md)
- [扩展开发指南](../04-development/extension-development.md)
