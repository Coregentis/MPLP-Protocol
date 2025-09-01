# Core Module API Reference

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-09-01T16:44:00Z
最后更新: 2025-09-01T16:44:00Z
文档状态: 已完成
-->

![版本](https://img.shields.io/badge/v1.0.0-stable-green)
![更新时间](https://img.shields.io/badge/Updated-2025--09--01-brightgreen)
![API](https://img.shields.io/badge/API-REST-blue)
![格式](https://img.shields.io/badge/Format-JSON-orange)

## 🔌 **API概述**

Core模块提供完整的RESTful API接口，支持工作流编排、模块协调、资源管理和系统监控。所有API遵循RESTful设计原则，使用JSON格式进行数据交换。

### **基础信息**
- **Base URL**: `/api/v1/core`
- **Content-Type**: `application/json`
- **认证方式**: JWT Bearer Token
- **API版本**: v1.0.0

## 🚀 **核心API接口**

### **1. 工作流管理 API**

#### **执行工作流**
```http
POST /api/v1/core/workflows/execute
```

**请求体**:
```json
{
  "contextId": "workflow-context-001",
  "workflowConfig": {
    "name": "multi-module-workflow",
    "description": "Multi-module coordination workflow",
    "stages": ["context", "plan", "confirm", "trace"],
    "executionMode": "sequential",
    "parallelExecution": false,
    "timeoutMs": 300000,
    "priority": "medium"
  },
  "priority": "medium",
  "metadata": {
    "source": "api",
    "version": "1.0.0"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "workflowId": "wf-20250901-001",
    "executionId": "exec-20250901-001",
    "status": "running",
    "startTime": "2025-09-01T16:44:00.000Z",
    "estimatedDuration": 300000,
    "stageResults": {},
    "metadata": {
      "source": "api",
      "version": "1.0.0"
    }
  },
  "timestamp": "2025-09-01T16:44:00.000Z"
}
```

#### **获取工作流状态**
```http
GET /api/v1/core/workflows/{workflowId}/status
```

**响应**:
```json
{
  "success": true,
  "data": {
    "workflowId": "wf-20250901-001",
    "status": "completed",
    "progress": 100,
    "currentStage": "trace",
    "completedStages": ["context", "plan", "confirm", "trace"],
    "startTime": "2025-09-01T16:44:00.000Z",
    "endTime": "2025-09-01T16:49:00.000Z",
    "duration": 300000,
    "stageResults": {
      "context": { "status": "success", "duration": 50000 },
      "plan": { "status": "success", "duration": 120000 },
      "confirm": { "status": "success", "duration": 80000 },
      "trace": { "status": "success", "duration": 50000 }
    }
  }
}
```

### **2. 模块协调 API**

#### **协调模块操作**
```http
POST /api/v1/core/coordination/modules
```

**请求体**:
```json
{
  "modules": ["context", "plan", "confirm"],
  "operation": "sync_state",
  "parameters": {
    "syncMode": "full",
    "priority": "high",
    "timeout": 60000
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "coordinationId": "coord-20250901-001",
    "success": true,
    "results": {
      "context": { "status": "success", "syncedItems": 150 },
      "plan": { "status": "success", "syncedItems": 89 },
      "confirm": { "status": "success", "syncedItems": 45 }
    },
    "executionTime": 45000,
    "timestamp": "2025-09-01T16:44:00.000Z"
  }
}
```

#### **获取模块状态**
```http
GET /api/v1/core/coordination/modules/status
```

**响应**:
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "moduleId": "context",
        "status": "active",
        "health": "healthy",
        "lastSync": "2025-09-01T16:40:00.000Z",
        "activeInterfaces": 5
      },
      {
        "moduleId": "plan",
        "status": "active", 
        "health": "healthy",
        "lastSync": "2025-09-01T16:41:00.000Z",
        "activeInterfaces": 8
      }
    ]
  }
}
```

### **3. 预留接口管理 API**

#### **激活预留接口**
```http
POST /api/v1/core/interfaces/activate
```

**请求体**:
```json
{
  "moduleId": "context",
  "interfaceId": "create_context_interface",
  "parameters": {
    "contextType": "workflow",
    "priority": "high",
    "metadata": {
      "source": "core-orchestrator"
    }
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "activationId": "activation-20250901-001",
    "moduleId": "context",
    "interfaceId": "create_context_interface",
    "status": "activated",
    "activatedAt": "2025-09-01T16:44:00.000Z",
    "parameters": {
      "contextType": "workflow",
      "priority": "high"
    }
  }
}
```

#### **获取活跃接口列表**
```http
GET /api/v1/core/interfaces/active
```

**响应**:
```json
{
  "success": true,
  "data": {
    "activeInterfaces": [
      {
        "activationId": "activation-20250901-001",
        "moduleId": "context",
        "interfaceId": "create_context_interface",
        "status": "active",
        "activatedAt": "2025-09-01T16:44:00.000Z",
        "lastUsed": "2025-09-01T16:45:00.000Z"
      }
    ],
    "totalActive": 1
  }
}
```

### **4. 系统监控 API**

#### **获取系统状态**
```http
GET /api/v1/core/system/status
```

**响应**:
```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "modules": [
      {
        "moduleId": "context",
        "status": "healthy",
        "responseTime": 25,
        "errorRate": 0.001
      },
      {
        "moduleId": "plan", 
        "status": "healthy",
        "responseTime": 45,
        "errorRate": 0.002
      }
    ],
    "resources": {
      "cpu": 45,
      "memory": 60,
      "disk": 30,
      "network": 20
    },
    "performance": {
      "averageResponseTime": 35,
      "throughput": 1500,
      "errorRate": 0.001
    },
    "timestamp": "2025-09-01T16:44:00.000Z"
  }
}
```

#### **获取性能指标**
```http
GET /api/v1/core/system/metrics
```

**响应**:
```json
{
  "success": true,
  "data": {
    "performance": {
      "averageResponseTime": 35,
      "p95ResponseTime": 85,
      "p99ResponseTime": 150,
      "throughput": 1500,
      "errorRate": 0.001
    },
    "resources": {
      "cpuUsage": 45,
      "memoryUsage": 60,
      "diskUsage": 30,
      "networkUsage": 20
    },
    "workflows": {
      "activeWorkflows": 25,
      "completedWorkflows": 1250,
      "failedWorkflows": 5,
      "averageExecutionTime": 180000
    },
    "coordination": {
      "activeCoordinations": 8,
      "completedCoordinations": 450,
      "averageCoordinationTime": 2500
    }
  }
}
```

### **5. 资源管理 API**

#### **分配资源**
```http
POST /api/v1/core/resources/allocate
```

**请求体**:
```json
{
  "workflowId": "wf-20250901-001",
  "resources": {
    "cpuCores": 4,
    "memoryMb": 2048,
    "diskSpaceMb": 1024,
    "priority": "medium"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "allocationId": "alloc-20250901-001",
    "workflowId": "wf-20250901-001",
    "allocatedResources": {
      "cpuCores": 4,
      "memoryMb": 2048,
      "diskSpaceMb": 1024
    },
    "allocatedAt": "2025-09-01T16:44:00.000Z",
    "expiresAt": "2025-09-01T17:44:00.000Z"
  }
}
```

#### **获取资源使用统计**
```http
GET /api/v1/core/resources/statistics
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalAllocations": 150,
    "activeAllocations": 25,
    "averageAllocationDuration": 180000,
    "resourceUtilization": {
      "cpu": 45,
      "memory": 60,
      "disk": 30,
      "network": 20
    },
    "allocationHistory": [
      {
        "timestamp": "2025-09-01T16:00:00.000Z",
        "allocations": 20,
        "utilization": 40
      }
    ]
  }
}
```

## 🔧 **TypeScript SDK**

### **初始化客户端**
```typescript
import { CoreClient } from '@mplp/core-client';

const client = new CoreClient({
  baseUrl: 'https://api.mplp.com/v1/core',
  apiKey: 'your-api-key',
  timeout: 30000
});
```

### **工作流操作**
```typescript
// 执行工作流
const workflowResult = await client.workflows.execute({
  contextId: 'workflow-context-001',
  workflowConfig: {
    name: 'multi-module-workflow',
    stages: ['context', 'plan', 'confirm'],
    executionMode: 'sequential',
    timeoutMs: 300000,
    priority: 'medium'
  },
  priority: 'medium'
});

// 获取工作流状态
const status = await client.workflows.getStatus(workflowResult.workflowId);
```

### **模块协调**
```typescript
// 协调模块
const coordinationResult = await client.coordination.coordinateModules({
  modules: ['context', 'plan'],
  operation: 'sync_state',
  parameters: { syncMode: 'full' }
});

// 获取模块状态
const moduleStatus = await client.coordination.getModuleStatus();
```

### **系统监控**
```typescript
// 获取系统状态
const systemStatus = await client.system.getStatus();

// 获取性能指标
const metrics = await client.system.getMetrics();
```

## 🚨 **错误处理**

### **标准错误响应**
```json
{
  "success": false,
  "error": {
    "code": "WORKFLOW_EXECUTION_FAILED",
    "message": "Workflow execution failed due to timeout",
    "details": {
      "workflowId": "wf-20250901-001",
      "stage": "plan",
      "reason": "timeout",
      "timeout": 300000
    },
    "timestamp": "2025-09-01T16:44:00.000Z"
  }
}
```

### **常见错误码**
- `INVALID_REQUEST`: 请求参数无效
- `UNAUTHORIZED`: 认证失败
- `FORBIDDEN`: 权限不足
- `RESOURCE_NOT_FOUND`: 资源不存在
- `WORKFLOW_EXECUTION_FAILED`: 工作流执行失败
- `MODULE_COORDINATION_FAILED`: 模块协调失败
- `RESOURCE_ALLOCATION_FAILED`: 资源分配失败
- `SYSTEM_UNAVAILABLE`: 系统不可用
- `RATE_LIMIT_EXCEEDED`: 请求频率超限

## 📊 **API限制**

### **速率限制**
- **标准用户**: 1000 requests/hour
- **高级用户**: 10000 requests/hour
- **企业用户**: 100000 requests/hour

### **请求大小限制**
- **最大请求体**: 10MB
- **最大响应体**: 50MB
- **超时时间**: 30秒

### **并发限制**
- **并发工作流**: 100个
- **并发协调**: 50个
- **并发资源分配**: 200个

---

## 📚 **相关文档**

- [架构指南](./architecture-guide.md) - 详细架构文档
- [Schema参考](./schema-reference.md) - JSON Schema规范
- [测试指南](./testing-guide.md) - API测试指南
- [错误处理指南](./troubleshooting.md) - 错误处理和故障排除
