# MPLP v1.0 Trace API 文档

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **API概览**

Trace API提供了完整的执行追踪和监控功能，支持实时事件记录、性能监控、错误追踪和审计日志管理。

## 🔗 **基础信息**

- **Base URL**: `/api/v1/traces`
- **认证方式**: Bearer Token
- **内容类型**: `application/json`
- **API版本**: v1.0.0

## 📋 **核心API端点**

### **1. 创建追踪**
```http
POST /api/v1/traces
Content-Type: application/json
Authorization: Bearer {token}

{
  "trace_type": "execution",
  "plan_id": "plan_123456",
  "context_id": "ctx_789012",
  "title": "项目执行追踪",
  "description": "追踪Q1项目的执行进度",
  "severity": "info",
  "tags": ["project", "q1", "execution"],
  "metadata": {
    "department": "engineering",
    "project_manager": "user_001"
  }
}
```

**响应示例**:
```json
{
  "status": 201,
  "data": {
    "trace_id": "trace_345678",
    "trace_type": "execution",
    "plan_id": "plan_123456",
    "context_id": "ctx_789012",
    "title": "项目执行追踪",
    "severity": "info",
    "status": "active",
    "created_at": "2025-08-06T00:35:06Z",
    "updated_at": "2025-08-06T00:35:06Z",
    "event_count": 0,
    "tags": ["project", "q1", "execution"]
  },
  "message": "追踪创建成功"
}
```

### **2. 记录事件**
```http
POST /api/v1/traces/{traceId}/events
Content-Type: application/json
Authorization: Bearer {token}

{
  "event_type": "progress",
  "category": "system",
  "title": "任务进度更新",
  "description": "完成了需求分析阶段",
  "severity": "info",
  "data": {
    "task_id": "task_001",
    "progress_percentage": 25,
    "completed_items": ["需求收集", "需求分析", "需求文档"]
  },
  "metrics": {
    "duration_ms": 3600000,
    "cpu_usage": 15.5,
    "memory_usage": 256
  }
}
```

**响应示例**:
```json
{
  "status": 201,
  "data": {
    "event_id": "evt_901234",
    "trace_id": "trace_345678",
    "event_type": "progress",
    "category": "system",
    "title": "任务进度更新",
    "severity": "info",
    "timestamp": "2025-08-06T01:35:06Z",
    "sequence_number": 1,
    "data": {
      "task_id": "task_001",
      "progress_percentage": 25,
      "completed_items": ["需求收集", "需求分析", "需求文档"]
    },
    "metrics": {
      "duration_ms": 3600000,
      "cpu_usage": 15.5,
      "memory_usage": 256
    }
  },
  "message": "事件记录成功"
}
```

### **3. 获取追踪详情**
```http
GET /api/v1/traces/{traceId}
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "trace_id": "trace_345678",
    "trace_type": "execution",
    "plan_id": "plan_123456",
    "context_id": "ctx_789012",
    "title": "项目执行追踪",
    "description": "追踪Q1项目的执行进度",
    "severity": "info",
    "status": "active",
    "created_at": "2025-08-06T00:35:06Z",
    "updated_at": "2025-08-06T02:15:30Z",
    "event_count": 5,
    "tags": ["project", "q1", "execution"],
    "summary": {
      "total_events": 5,
      "error_count": 0,
      "warning_count": 1,
      "last_event_time": "2025-08-06T02:15:30Z",
      "duration_ms": 6024000
    },
    "metadata": {
      "department": "engineering",
      "project_manager": "user_001"
    }
  }
}
```

### **4. 获取事件列表**
```http
GET /api/v1/traces/{traceId}/events?limit=10&offset=0&severity=info
Authorization: Bearer {token}
```

**查询参数**:
- `limit`: 返回数量限制 (默认10)
- `offset`: 偏移量 (默认0)
- `severity`: 过滤严重程度 (debug, info, warn, error, critical)
- `event_type`: 事件类型 (start, progress, checkpoint, completion, failure)
- `category`: 事件类别 (system, user, external, automatic)
- `from_time`: 开始时间
- `to_time`: 结束时间

### **5. 记录错误**
```http
POST /api/v1/traces/{traceId}/errors
Content-Type: application/json
Authorization: Bearer {token}

{
  "error_type": "business",
  "error_code": "VALIDATION_FAILED",
  "error_message": "用户输入验证失败",
  "severity": "error",
  "context": {
    "user_id": "user_123",
    "input_data": {"field": "invalid_value"},
    "validation_rules": ["required", "min_length"]
  },
  "stack_trace": "Error: Validation failed\n  at validate()",
  "recovery_actions": ["重新输入", "联系管理员"]
}
```

### **6. 更新追踪状态**
```http
PUT /api/v1/traces/{traceId}/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "completed",
  "completion_reason": "项目成功完成",
  "final_metrics": {
    "total_duration_ms": 86400000,
    "success_rate": 95.5,
    "error_count": 2
  }
}
```

### **7. 获取性能指标**
```http
GET /api/v1/traces/{traceId}/metrics?metric_type=performance&time_range=1h
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "trace_id": "trace_345678",
    "metric_type": "performance",
    "time_range": "1h",
    "metrics": {
      "avg_response_time": 150.5,
      "max_response_time": 500,
      "min_response_time": 50,
      "throughput": 25.3,
      "error_rate": 0.02,
      "cpu_usage": {
        "avg": 15.5,
        "max": 45.2,
        "min": 5.1
      },
      "memory_usage": {
        "avg": 256,
        "max": 512,
        "min": 128
      }
    },
    "data_points": 60,
    "generated_at": "2025-08-06T03:35:06Z"
  }
}
```

### **8. 列出追踪**
```http
GET /api/v1/traces?status=active&trace_type=execution&limit=20&offset=0
Authorization: Bearer {token}
```

## 📊 **数据模型**

### **追踪类型 (TraceType)**
- `execution`: 执行追踪
- `audit`: 审计追踪
- `performance`: 性能追踪
- `error`: 错误追踪
- `decision`: 决策追踪

### **事件类型 (EventType)**
- `start`: 开始事件
- `progress`: 进度事件
- `checkpoint`: 检查点事件
- `completion`: 完成事件
- `failure`: 失败事件
- `timeout`: 超时事件
- `interrupt`: 中断事件

### **严重程度 (TraceSeverity)**
- `debug`: 调试级别
- `info`: 信息级别
- `warn`: 警告级别
- `error`: 错误级别
- `critical`: 关键级别

### **错误类型 (ErrorType)**
- `system`: 系统错误
- `business`: 业务错误
- `validation`: 验证错误
- `network`: 网络错误
- `timeout`: 超时错误
- `security`: 安全错误

## 🔧 **TypeScript SDK 使用示例**

```typescript
import { TraceProtocol } from 'mplp/trace';

// 创建追踪
const trace = await TraceProtocol.create({
  trace_type: 'execution',
  plan_id: 'plan_123456',
  title: '项目执行追踪',
  severity: 'info'
});

// 记录事件
await TraceProtocol.recordEvent(trace.trace_id, {
  event_type: 'progress',
  title: '任务进度更新',
  data: { progress: 50 }
});

// 获取指标
const metrics = await TraceProtocol.getMetrics(trace.trace_id, {
  metric_type: 'performance',
  time_range: '1h'
});
```

## 🚦 **状态码**

- `200 OK`: 请求成功
- `201 Created`: 追踪/事件创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 认证失败
- `403 Forbidden`: 权限不足
- `404 Not Found`: 追踪不存在
- `422 Unprocessable Entity`: 数据验证失败
- `500 Internal Server Error`: 服务器内部错误

## 📈 **性能和限制**

- **请求频率**: 1000 requests/minute
- **事件记录**: 最大10000个事件/追踪
- **数据保留**: 默认30天
- **实时更新**: WebSocket支持
- **批量操作**: 最大100个事件/批次

---

**相关文档**:
- [Trace Protocol概览](../03-protocols/protocol-overview.md#trace-protocol)
- [API总览](./api-overview.md)
- [性能监控指南](../05-testing/performance-enhancement-guide.md)
