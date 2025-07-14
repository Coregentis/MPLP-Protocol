# MPLP 1.0 API详细文档

**版本**: 2.1.0  
**创建日期**: 2025-07-09  
**最后更新**: 2025-07-09T19:04:01+08:00  
**项目周期**: 2025-07-09 至 2025-10-01  
**文档状态**: 基于Multi-Agent Project Lifecycle Protocol (MPLP) v1.0更新  
**关联文档**: [产品需求文档](./09_产品需求文档.md) | [技术设计](./01_技术设计文档.md) | [MPLP协议开发专项路线图](./mplp_protocol_roadmap.md)  
**协议版本**: v1.0 (完全基于Roadmap v1.0规划)

---

## 📋 目录

1. [API概述](#api概述)
2. [核心模块API](#核心模块api)
3. [JSON Schema标准化](#json-schema标准化)
4. [基础验证机制](#基础验证机制)
5. [认证和授权](#认证和授权)
6. [REST API规范](#rest-api规范)
7. [GraphQL API规范](#graphql-api规范)
8. [WebSocket API规范](#websocket-api规范)
9. [数据模型](#数据模型)
10. [错误处理](#错误处理)
11. [API版本控制](#api版本控制)
12. [性能监控API](#性能监控api)
13. [平台集成API](#平台集成api)
14. [限流和配额](#限流和配额)
15. [API测试](#api测试)
16. [部署和监控](#部署和监控)

---

## 🎯 API设计统一标准

### 通用API规范（符合Roadmap技术标准）
- **Base URL**: `https://api.mplp.dev/v1.0`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- **ID格式**: UUID v4
- **分页**: offset/limit 或 cursor-based
- **版本控制**: URL路径版本 (/v1.0/)

### 统一响应格式
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-07-09T14:30:00Z",
    "request_id": "req-uuid",
    "version": "1.0.0"
  },
  "error": null
}
```

### 性能与安全标准（匹配Roadmap性能指标）
- **响应时间**: P95 < 100ms, P99 < 200ms（符合Roadmap性能基准）
- **协议解析**: < 10ms（匹配Roadmap解析性能要求）
- **Rate Limiting**: 1000 requests/min per API key
- **CORS**: 配置允许的域名白名单
- **HTTPS**: 强制TLS 1.3，禁用HTTP（符合Roadmap安全要求）
- **输入验证**: 所有请求参数JSON Schema验证
- **输出过滤**: 敏感字段自动过滤或脱敏

---

## 🌐 API概述

### MPLP 1.0 核心架构

MPLP 1.0基于6个核心模块构建统一的API体系：

```mermaid
graph TB
    subgraph "MPLP 1.0 核心模块"
        Context[Context 上下文模块]
        Plan[Plan 计划模块]
        Confirm[Confirm 确认模块]
        Trace[Trace 跟踪模块]
        Role[Role 角色模块]
        Extension[Extension 扩展模块]
    end
    
    subgraph "API层"
        REST[REST API]
        GraphQL[GraphQL API]
        WebSocket[WebSocket API]
    end
    
    subgraph "支撑服务"
        Schema[Schema验证器]
        Validator[基础验证器]
        Monitor[性能监控]
        Auth[认证授权]
    end
    
    subgraph "平台集成"
        TracePilot[TracePilot]
        Coregentis[Coregentis]
    end
    
    Context --> REST
    Plan --> REST
    Confirm --> REST
    Trace --> REST
    Role --> REST
    Extension --> REST
    
    REST --> Schema
    GraphQL --> Schema
    WebSocket --> Schema
    
    Schema --> Validator
    Validator --> Monitor
    Monitor --> Auth
    
    REST --> TracePilot
    REST --> Coregentis
end
```

### API设计原则

#### RESTful设计原则
```markdown
## 核心原则
1. **资源导向**: 每个URL代表一个资源
2. **HTTP动词**: 使用标准HTTP方法(GET, POST, PUT, DELETE)
3. **无状态**: 每个请求包含所有必要信息
4. **统一接口**: 一致的API设计模式
5. **分层系统**: 支持缓存、负载均衡等中间层
6. **模块化设计**: 基于6个核心模块的清晰架构

## URL设计规范
- 使用名词而非动词: `/api/v2/contexts` 而非 `/api/v2/getContexts`
- 使用复数形式: `/api/v2/plans` 而非 `/api/v2/plan`
- 使用连字符分隔: `/api/v2/execution-results` 而非 `/api/v2/executionResults`
- 版本控制: `/api/v1/` 前缀
- 模块化路由: `/api/v1/{module}/{resource}`
- 资源嵌套: `/api/v1/contexts/{id}/plans`
```

#### GraphQL设计原则
```markdown
## 核心优势
1. **单一端点**: 所有查询通过一个URL
2. **按需获取**: 客户端指定需要的字段
3. **强类型**: 完整的类型系统
4. **实时订阅**: 支持WebSocket订阅
5. **模块化Schema**: 基于6个核心模块的Schema设计
6. **内省**: 自描述的API

## Schema设计规范
- 使用描述性的类型名称
- 提供详细的字段描述
- 合理使用联合类型和接口
- 支持分页和过滤
- 实现数据加载器防止N+1问题
- 模块化Schema组织
```

---

## 🔧 核心模块API

### Context 上下文模块API

#### 创建上下文
```http
POST /api/v1/contexts
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "项目开发上下文",
  "description": "Web应用开发项目的上下文信息",
  "type": "development",
  "metadata": {
    "project_type": "web_application",
    "technology_stack": ["React", "Node.js", "MongoDB"],
    "team_size": 5,
    "deadline": "2025-12-31T23:59:59Z"
  },
  "constraints": {
    "budget": 100000,
    "timeline": "3 months",
    "resources": ["developer", "designer", "tester"]
  },
  "goals": [
    {
      "id": "goal-1",
      "description": "完成用户认证系统",
      "priority": "high",
      "success_criteria": "支持多种登录方式，安全性达标"
    }
  ]
}

# 响应示例
{
  "id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "name": "项目开发上下文",
  "description": "Web应用开发项目的上下文信息",
  "type": "development",
  "status": "active",
  "created_at": "2024-12-19T19:59:25Z",
  "updated_at": "2024-12-19T19:59:25Z",
  "version": "1.0.0",
  "metadata": {
    "project_type": "web_application",
    "technology_stack": ["React", "Node.js", "MongoDB"],
    "team_size": 5,
    "deadline": "2025-12-31T23:59:59Z"
  },
  "constraints": {
    "budget": 100000,
    "timeline": "3 months",
    "resources": ["developer", "designer", "tester"]
  },
  "goals": [
    {
      "id": "goal-1",
      "description": "完成用户认证系统",
      "priority": "high",
      "success_criteria": "支持多种登录方式，安全性达标"
    }
  ]
}
```

#### 获取上下文列表
```http
GET /api/v1/contexts?page=1&limit=20&type=development&status=active
Authorization: Bearer {token}

# 响应示例
{
  "data": [
    {
      "id": "ctx-123e4567-e89b-12d3-a456-426614174000",
      "name": "项目开发上下文",
      "type": "development",
      "status": "active",
      "created_at": "2024-12-19T19:59:25Z",
      "goals_count": 3,
      "plans_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

#### 更新上下文
```http
PUT /api/v2/contexts/{contextId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "更新的项目开发上下文",
  "description": "更新后的描述",
  "metadata": {
    "project_type": "web_application",
    "technology_stack": ["React", "Node.js", "MongoDB", "Redis"],
    "team_size": 6
  }
}
```

### Plan 计划模块API

#### 创建计划
```http
POST /api/v2/plans
Content-Type: application/json
Authorization: Bearer {token}

{
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "name": "用户认证系统开发计划",
  "description": "完整的用户认证系统开发计划",
  "type": "development",
  "priority": "high",
  "estimated_duration": "P2W",
  "steps": [
    {
      "id": "step-1",
      "name": "需求分析",
      "description": "分析用户认证需求",
      "type": "analysis",
      "estimated_duration": "P2D",
      "dependencies": [],
      "resources": ["analyst"],
      "deliverables": ["需求文档", "用例图"]
    },
    {
      "id": "step-2",
      "name": "技术设计",
      "description": "设计认证系统架构",
      "type": "design",
      "estimated_duration": "P3D",
      "dependencies": ["step-1"],
      "resources": ["architect"],
      "deliverables": ["技术设计文档", "API规范"]
    }
  ],
  "success_criteria": [
    "所有步骤按时完成",
    "交付物质量达标",
    "通过安全审计"
  ]
}

# 响应示例
{
  "id": "plan-456e7890-e89b-12d3-a456-426614174000",
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "name": "用户认证系统开发计划",
  "description": "完整的用户认证系统开发计划",
  "type": "development",
  "status": "draft",
  "priority": "high",
  "estimated_duration": "P2W",
  "created_at": "2024-12-19T19:59:25Z",
  "updated_at": "2024-12-19T19:59:25Z",
  "version": "1.0.0",
  "steps": [
    {
      "id": "step-1",
      "name": "需求分析",
      "description": "分析用户认证需求",
      "type": "analysis",
      "status": "pending",
      "estimated_duration": "P2D",
      "dependencies": [],
      "resources": ["analyst"],
      "deliverables": ["需求文档", "用例图"]
    },
    {
      "id": "step-2",
      "name": "技术设计",
      "description": "设计认证系统架构",
      "type": "design",
      "status": "pending",
      "estimated_duration": "P3D",
      "dependencies": ["step-1"],
      "resources": ["architect"],
      "deliverables": ["技术设计文档", "API规范"]
    }
  ],
  "success_criteria": [
    "所有步骤按时完成",
    "交付物质量达标",
    "通过安全审计"
  ]
}
```

#### 执行计划
```http
POST /api/v2/plans/{planId}/execute
Content-Type: application/json
Authorization: Bearer {token}

{
  "execution_mode": "sequential",
  "auto_proceed": false,
  "notification_settings": {
    "on_step_complete": true,
    "on_error": true,
    "on_completion": true
  }
}

# 响应示例
{
  "execution_id": "exec-789a0123-e89b-12d3-a456-426614174000",
  "plan_id": "plan-456e7890-e89b-12d3-a456-426614174000",
  "status": "running",
  "started_at": "2024-12-19T19:59:25Z",
  "current_step": "step-1",
  "progress": {
    "completed_steps": 0,
    "total_steps": 2,
    "percentage": 0
  }
}
```

#### 处理任务失败
```http
POST /api/v2/plans/{planId}/tasks/{taskId}/failure
Content-Type: application/json
Authorization: Bearer {token}

{
  "error_message": "数据库连接超时",
  "error_code": "DB_CONNECTION_TIMEOUT",
  "error_details": {
    "connection_url": "db://example.com:5432",
    "timeout_ms": 5000,
    "retry_count": 3
  },
  "stack_trace": "Error: 数据库连接超时\n    at Database.connect (/src/db/connector.js:42:15)\n    at TaskExecutor.executeTask (/src/executor.js:128:22)",
  "severity": "high",
  "diagnostic_data": {
    "system_metrics": {
      "cpu_usage": 65,
      "memory_usage_mb": 1024,
      "disk_space_available_mb": 10240
    },
    "environment_variables": {
      "NODE_ENV": "production",
      "DB_TIMEOUT": "5000"
    }
  }
}

# 响应示例
{
  "failure_id": "failure-def5678j-e89b-12d3-a456-426614174000",
  "task_id": "task-123",
  "plan_id": "plan-456",
  "status": "diagnosed",
  "timestamp": "2025-07-12T10:15:30Z",
  "diagnostics": {
    "failure_type": "connection_error",
    "root_cause": "database_timeout",
    "severity": "high",
    "impact": "task_blocked",
    "related_components": ["database", "network"],
    "recovery_options": [
      {
        "strategy": "retry",
        "confidence": 0.85,
        "description": "重试任务执行"
      },
      {
        "strategy": "skip",
        "confidence": 0.65,
        "description": "跳过此任务，继续执行后续任务"
      }
    ]
  },
  "adapter_metadata": {
    "sync_status": "synced",
    "sync_timestamp": "2025-07-12T10:15:32Z"
  }
}
```

#### 获取任务失败诊断
```http
GET /api/v2/plans/{planId}/tasks/{taskId}/diagnostics
Authorization: Bearer {token}

# 响应示例
{
  "failure_id": "failure-def5678j-e89b-12d3-a456-426614174000",
  "task_id": "task-123",
  "plan_id": "plan-456",
  "diagnostics": {
    "failure_type": "connection_error",
    "root_cause": "database_timeout",
    "severity": "high",
    "impact": "task_blocked",
    "failure_pattern": "intermittent",
    "frequency": "occasional",
    "first_occurrence": "2025-07-12T10:15:30Z",
    "related_components": ["database", "network"],
    "system_state": {
      "cpu_usage": 65,
      "memory_usage_mb": 1024,
      "disk_space_available_mb": 10240,
      "active_connections": 120
    },
    "ai_analysis": {
      "summary": "数据库连接超时可能是由于连接池配置不当或数据库服务器负载过高导致",
      "confidence": 0.87,
      "suggested_investigation": [
        "检查数据库连接池配置",
        "验证数据库服务器负载",
        "检查网络延迟"
      ]
    }
  },
  "recovery_suggestions": [
    {
      "suggestion": "增加数据库连接超时设置",
      "confidence_score": 0.92,
      "estimated_effort": "low",
      "implementation_steps": [
        "在配置文件中将DB_TIMEOUT参数从5000ms增加到10000ms",
        "重启应用服务"
      ]
    },
    {
      "suggestion": "实现数据库操作重试机制",
      "confidence_score": 0.85,
      "estimated_effort": "medium",
      "implementation_steps": [
        "在数据库连接层添加指数退避重试逻辑",
        "设置最大重试次数为5次"
      ]
    },
    {
      "suggestion": "优化数据库查询减少超时风险",
      "confidence_score": 0.78,
      "estimated_effort": "high",
      "implementation_steps": [
        "分析并优化耗时查询",
        "添加适当的索引"
      ]
    }
  ],
  "related_failures": [
    {
      "failure_id": "failure-abc1234",
      "timestamp": "2025-07-10T14:22:15Z",
      "similarity_score": 0.92,
      "resolution": "increased_timeout"
    }
  ]
}
```

#### 获取恢复建议
```http
GET /api/v2/plans/{planId}/tasks/{taskId}/recovery-suggestions
Authorization: Bearer {token}

# 响应示例
{
  "failure_id": "failure-def5678j-e89b-12d3-a456-426614174000",
  "task_id": "task-123",
  "plan_id": "plan-456",
  "suggestions": [
    {
      "suggestion_id": "sugg-1",
      "suggestion": "增加数据库连接超时设置",
      "confidence_score": 0.92,
      "estimated_effort": "low",
      "implementation_steps": [
        "在配置文件中将DB_TIMEOUT参数从5000ms增加到10000ms",
        "重启应用服务"
      ],
      "expected_outcome": "减少间歇性连接超时错误",
      "potential_side_effects": [
        "可能导致问题检测延迟增加"
      ]
    },
    {
      "suggestion_id": "sugg-2",
      "suggestion": "实现数据库操作重试机制",
      "confidence_score": 0.85,
      "estimated_effort": "medium",
      "implementation_steps": [
        "在数据库连接层添加指数退避重试逻辑",
        "设置最大重试次数为5次"
      ],
      "expected_outcome": "自动恢复短暂连接问题",
      "potential_side_effects": [
        "可能增加系统复杂性",
        "需要处理潜在的重复操作问题"
      ]
    },
    {
      "suggestion_id": "sugg-3",
      "suggestion": "优化数据库查询减少超时风险",
      "confidence_score": 0.78,
      "estimated_effort": "high",
      "implementation_steps": [
        "分析并优化耗时查询",
        "添加适当的索引"
      ],
      "expected_outcome": "从根本上减少超时风险",
      "potential_side_effects": [
        "需要较长的实施时间",
        "可能需要数据库架构变更"
      ]
    }
  ],
  "metadata": {
    "generated_at": "2025-07-12T10:20:15Z",
    "source": "enhanced_trace_adapter",
    "adapter_version": "2.0.0",
    "confidence_threshold": 0.75
  }
}
```

#### 应用恢复策略
```http
POST /api/v2/plans/{planId}/tasks/{taskId}/resolve
Content-Type: application/json
Authorization: Bearer {token}

{
  "strategy": "retry",
  "config": {
    "max_retries": 3,
    "delay_ms": 1000,
    "backoff_factor": 2
  },
  "notes": "应用增加超时设置后重试任务",
  "suggestion_id": "sugg-1"
}

# 响应示例
{
  "resolution_id": "res-ghi9012k-e89b-12d3-a456-426614174000",
  "failure_id": "failure-def5678j-e89b-12d3-a456-426614174000",
  "task_id": "task-123",
  "plan_id": "plan-456",
  "strategy": "retry",
  "status": "applied",
  "applied_at": "2025-07-12T10:25:45Z",
  "result": {
    "success": true,
    "new_task_status": "running",
    "execution_time_ms": 8,
    "details": {
      "retry_count": 1,
      "max_retries": 3
    }
  },
  "adapter_metadata": {
    "sync_status": "synced",
    "sync_timestamp": "2025-07-12T10:25:47Z"
  }
}
```

#### 批量解决失败任务
```http
POST /api/v2/plans/{planId}/resolve-tasks
Content-Type: application/json
Authorization: Bearer {token}

{
  "task_ids": ["task-123", "task-124", "task-125"],
  "strategy": "retry",
  "config": {
    "max_retries": 3,
    "delay_ms": 1000,
    "backoff_factor": 2
  },
  "notes": "批量重试数据库相关任务"
}

# 响应示例
{
  "batch_resolution_id": "batch-jkl3456m-e89b-12d3-a456-426614174000",
  "plan_id": "plan-456",
  "total_tasks": 3,
  "successful_resolutions": 2,
  "failed_resolutions": 1,
  "applied_at": "2025-07-12T10:30:15Z",
  "execution_time_ms": 25,
  "results": [
    {
      "task_id": "task-123",
      "success": true,
      "new_status": "running",
      "resolution_id": "res-ghi9012k-e89b-12d3-a456-426614174000"
    },
    {
      "task_id": "task-124",
      "success": true,
      "new_status": "running",
      "resolution_id": "res-mno3456p-e89b-12d3-a456-426614174000"
    },
    {
      "task_id": "task-125",
      "success": false,
      "error": "任务已超过最大重试次数",
      "error_code": "MAX_RETRY_EXCEEDED"
    }
  ],
  "adapter_metadata": {
    "sync_status": "synced",
    "sync_timestamp": "2025-07-12T10:30:17Z"
  }
}
```

#### 检测开发问题
```http
GET /api/v2/plans/{planId}/development-issues
Authorization: Bearer {token}

# 响应示例
{
  "plan_id": "plan-456",
  "issues": [
    {
      "id": "issue-1",
      "type": "performance",
      "severity": "medium",
      "title": "数据库连接池配置不当",
      "description": "当前连接池最大连接数配置过低，可能导致高并发场景下连接耗尽",
      "file_path": "src/config/database.js",
      "line_number": 42,
      "detected_at": "2025-07-12T10:35:20Z",
      "suggested_fix": "将MAX_CONNECTIONS参数从10增加到50",
      "confidence_score": 0.89,
      "related_failures": ["failure-def5678j-e89b-12d3-a456-426614174000"]
    },
    {
      "id": "issue-2",
      "type": "reliability",
      "severity": "high",
      "title": "缺少数据库操作错误处理",
      "description": "数据库操作缺少适当的错误处理和重试机制",
      "file_path": "src/services/data-service.js",
      "line_number": 78,
      "detected_at": "2025-07-12T10:35:20Z",
      "suggested_fix": "实现try-catch错误处理并添加重试逻辑",
      "confidence_score": 0.94,
      "related_failures": ["failure-def5678j-e89b-12d3-a456-426614174000"]
    },
    {
      "id": "issue-3",
      "type": "security",
      "severity": "critical",
      "title": "SQL注入漏洞",
      "description": "用户输入直接拼接到SQL查询中，存在SQL注入风险",
      "file_path": "src/repositories/user-repository.js",
      "line_number": 156,
      "detected_at": "2025-07-12T10:35:20Z",
      "suggested_fix": "使用参数化查询替代字符串拼接",
      "confidence_score": 0.98,
      "related_failures": []
    }
  ],
  "metadata": {
    "total_issues": 3,
    "by_severity": {
      "critical": 1,
      "high": 1,
      "medium": 1,
      "low": 0,
      "info": 0
    },
    "by_type": {
      "performance": 1,
      "reliability": 1,
      "security": 1
    },
    "generated_at": "2025-07-12T10:35:20Z",
    "source": "enhanced_trace_adapter",
    "adapter_version": "2.0.0",
    "confidence_threshold": 0.75
  }
}
```

#### 获取故障统计信息
```http
GET /api/v2/plans/{planId}/failure-analytics
Authorization: Bearer {token}

# 响应示例
{
  "plan_id": "plan-456",
  "analytics_period": {
    "start": "2025-07-01T00:00:00Z",
    "end": "2025-07-12T23:59:59Z"
  },
  "total_failures": 15,
  "by_status": {
    "diagnosed": 3,
    "resolved": 10,
    "unresolved": 2
  },
  "by_type": {
    "connection_error": 8,
    "timeout": 4,
    "validation_error": 2,
    "resource_exhaustion": 1
  },
  "by_severity": {
    "critical": 2,
    "high": 5,
    "medium": 6,
    "low": 2
  },
  "resolution_stats": {
    "retry_success_rate": 0.85,
    "avg_resolution_time_ms": 3250,
    "most_effective_strategy": "retry",
    "avg_retries_before_success": 1.8
  },
  "failure_trends": {
    "increasing_types": ["timeout"],
    "decreasing_types": ["validation_error"],
    "recurring_patterns": [
      {
        "pattern": "database_timeout_during_peak_hours",
        "confidence": 0.92,
        "occurrences": 6
      }
    ]
  },
  "metadata": {
    "generated_at": "2025-07-12T10:40:30Z",
    "source": "enhanced_trace_adapter",
    "adapter_version": "2.0.0"
  }
}
```

### Confirm 确认模块API

#### 创建确认请求
```http
POST /api/v2/confirmations
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "step_completion",
  "title": "需求分析步骤完成确认",
  "description": "请确认需求分析步骤是否已完成并满足质量要求",
  "context": {
    "plan_id": "plan-456e7890-e89b-12d3-a456-426614174000",
    "step_id": "step-1",
    "execution_id": "exec-789a0123-e89b-12d3-a456-426614174000"
  },
  "required_approvers": [
    {
      "role": "project_manager",
      "user_id": "user-pm-001"
    },
    {
      "role": "technical_lead",
      "user_id": "user-tl-001"
    }
  ],
  "approval_criteria": [
    "需求文档完整性检查",
    "用例图准确性验证",
    "利益相关者确认"
  ],
  "deadline": "2024-12-19T18:00:00Z",
  "auto_approve_after_deadline": false
}

# 响应示例
{
  "id": "conf-abc1234d-e89b-12d3-a456-426614174000",
  "type": "step_completion",
  "title": "需求分析步骤完成确认",
  "description": "请确认需求分析步骤是否已完成并满足质量要求",
  "status": "pending",
  "created_at": "2024-12-19T19:59:25Z",
  "deadline": "2024-12-19T18:00:00Z",
  "context": {
    "plan_id": "plan-456e7890-e89b-12d3-a456-426614174000",
    "step_id": "step-1",
    "execution_id": "exec-789a0123-e89b-12d3-a456-426614174000"
  },
  "required_approvers": [
    {
      "role": "project_manager",
      "user_id": "user-pm-001",
      "status": "pending"
    },
    {
      "role": "technical_lead",
      "user_id": "user-tl-001",
      "status": "pending"
    }
  ],
  "approval_criteria": [
    "需求文档完整性检查",
    "用例图准确性验证",
    "利益相关者确认"
  ]
}
```

#### 提交确认决定
```http
POST /api/v2/confirmations/{confirmationId}/approve
Content-Type: application/json
Authorization: Bearer {token}

{
  "decision": "approved",
  "comments": "需求分析文档质量良好，用例图清晰准确，建议进入下一步骤",
  "conditions": [
    "需要补充性能需求说明",
    "建议增加安全需求细节"
  ]
}

# 响应示例
{
  "id": "conf-abc1234d-e89b-12d3-a456-426614174000",
  "status": "partially_approved",
  "approvals": [
    {
      "approver_id": "user-pm-001",
      "decision": "approved",
      "comments": "需求分析文档质量良好，用例图清晰准确，建议进入下一步骤",
      "approved_at": "2024-12-19T19:59:25Z",
      "conditions": [
        "需要补充性能需求说明",
        "建议增加安全需求细节"
      ]
    }
  ],
  "pending_approvers": [
    {
      "role": "technical_lead",
      "user_id": "user-tl-001"
    }
  ]
}
```

### Trace 跟踪模块API

#### 创建跟踪记录
```http
POST /api/v2/traces
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "execution_trace",
  "source": {
    "type": "plan_execution",
    "id": "exec-789a0123-e89b-12d3-a456-426614174000"
  },
  "event": {
    "type": "step_started",
    "timestamp": "2024-12-19T19:59:25Z",
    "step_id": "step-1",
    "actor": {
      "type": "user",
      "id": "user-dev-001",
      "name": "张开发"
    }
  },
  "data": {
    "step_name": "需求分析",
    "estimated_duration": "P2D",
    "assigned_resources": ["user-analyst-001"],
    "environment": {
      "system_version": "2.0.0",
      "client_info": "MPLP-Client/2.0.0"
    }
  },
  "metadata": {
    "correlation_id": "corr-123456789",
    "session_id": "sess-987654321",
    "request_id": "req-abcdef123"
  }
}

# 响应示例
{
  "id": "trace-def5678e-e89b-12d3-a456-426614174000",
  "type": "execution_trace",
  "created_at": "2024-12-19T19:59:25Z",
  "source": {
    "type": "plan_execution",
    "id": "exec-789a0123-e89b-12d3-a456-426614174000"
  },
  "event": {
    "type": "step_started",
    "timestamp": "2024-12-19T19:59:25Z",
    "step_id": "step-1",
    "actor": {
      "type": "user",
      "id": "user-dev-001",
      "name": "张开发"
    }
  },
  "data": {
    "step_name": "需求分析",
    "estimated_duration": "P2D",
    "assigned_resources": ["user-analyst-001"],
    "environment": {
      "system_version": "2.0.0",
      "client_info": "MPLP-Client/2.0.0"
    }
  },
  "metadata": {
    "correlation_id": "corr-123456789",
    "session_id": "sess-987654321",
    "request_id": "req-abcdef123"
  }
}
```

#### 查询跟踪记录
```http
GET /api/v2/traces?source_id=exec-789a0123-e89b-12d3-a456-426614174000&event_type=step_started&from=2024-12-19T00:00:00Z&to=2024-12-19T00:00:00Z&page=1&limit=50
Authorization: Bearer {token}

# 响应示例
{
  "data": [
    {
      "id": "trace-def5678e-e89b-12d3-a456-426614174000",
      "type": "execution_trace",
      "created_at": "2024-12-19T19:59:25Z",
      "event": {
        "type": "step_started",
        "timestamp": "2024-12-19T19:59:25Z",
        "step_id": "step-1"
      },
      "summary": "步骤'需求分析'开始执行"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "total_pages": 1
  },
  "aggregations": {
    "event_types": {
      "step_started": 1,
      "step_completed": 0,
      "step_failed": 0
    },
    "time_range": {
      "from": "2024-12-19T00:00:00Z",
    "to": "2024-12-19T00:00:00Z"
    }
  }
}
```

### Role 角色模块API

#### 创建角色
```http
POST /api/v2/roles
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "项目经理",
  "code": "project_manager",
  "description": "负责项目整体规划、进度管理和团队协调",
  "type": "functional",
  "permissions": [
    {
      "resource": "contexts",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "resource": "plans",
      "actions": ["create", "read", "update", "delete", "execute"]
    },
    {
      "resource": "confirmations",
      "actions": ["create", "read", "approve", "reject"]
    },
    {
      "resource": "traces",
      "actions": ["read"]
    }
  ],
  "responsibilities": [
    "制定项目计划",
    "监控项目进度",
    "协调团队资源",
    "风险管理",
    "质量控制"
  ],
  "required_skills": [
    "项目管理",
    "团队领导",
    "沟通协调",
    "风险评估"
  ],
  "hierarchy": {
    "level": 3,
    "reports_to": ["senior_manager"],
    "manages": ["developer", "tester", "analyst"]
  }
}

# 响应示例
{
  "id": "role-ghi9012f-e89b-12d3-a456-426614174000",
  "name": "项目经理",
  "code": "project_manager",
  "description": "负责项目整体规划、进度管理和团队协调",
  "type": "functional",
  "status": "active",
  "created_at": "2024-12-19T19:59:25Z",
  "updated_at": "2024-12-19T19:59:25Z",
  "version": "1.0.0",
  "permissions": [
    {
      "resource": "contexts",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "resource": "plans",
      "actions": ["create", "read", "update", "delete", "execute"]
    },
    {
      "resource": "confirmations",
      "actions": ["create", "read", "approve", "reject"]
    },
    {
      "resource": "traces",
      "actions": ["read"]
    }
  ],
  "responsibilities": [
    "制定项目计划",
    "监控项目进度",
    "协调团队资源",
    "风险管理",
    "质量控制"
  ],
  "required_skills": [
    "项目管理",
    "团队领导",
    "沟通协调",
    "风险评估"
  ],
  "hierarchy": {
    "level": 3,
    "reports_to": ["senior_manager"],
    "manages": ["developer", "tester", "analyst"]
  }
}
```

#### 分配角色
```http
POST /api/v2/roles/{roleId}/assignments
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": "user-pm-001",
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "assignment_type": "temporary",
  "start_date": "2024-12-19T00:00:00Z",
  "end_date": "2025-03-19T23:59:59Z",
  "delegation_settings": {
    "can_delegate": true,
    "delegation_scope": ["confirmations", "plan_approvals"]
  }
}

# 响应示例
{
  "id": "assign-jkl3456g-e89b-12d3-a456-426614174000",
  "role_id": "role-ghi9012f-e89b-12d3-a456-426614174000",
  "user_id": "user-pm-001",
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "assignment_type": "temporary",
  "status": "active",
  "start_date": "2024-12-19T00:00:00Z",
  "end_date": "2025-03-19T23:59:59Z",
  "assigned_at": "2024-12-19T19:59:25Z",
  "delegation_settings": {
    "can_delegate": true,
    "delegation_scope": ["confirmations", "plan_approvals"]
  }
}
```

### Extension 扩展模块API

#### 注册扩展
```http
POST /api/v2/extensions
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Slack通知扩展",
  "code": "slack_notification",
  "description": "将MPLP事件通知发送到Slack频道",
  "type": "notification",
  "version": "1.0.0",
  "provider": {
    "name": "Slack Integration Team",
    "contact": "slack-team@company.com"
  },
  "capabilities": [
    {
      "name": "send_notification",
      "description": "发送通知到指定Slack频道",
      "input_schema": {
        "type": "object",
        "properties": {
          "channel": {"type": "string"},
          "message": {"type": "string"},
          "priority": {"type": "string", "enum": ["low", "medium", "high"]}
        },
        "required": ["channel", "message"]
      }
    }
  ],
  "hooks": [
    {
      "event": "plan.execution.started",
      "capability": "send_notification",
      "config": {
        "channel": "#project-updates",
        "template": "计划 {{plan.name}} 开始执行"
      }
    },
    {
      "event": "confirmation.required",
      "capability": "send_notification",
      "config": {
        "channel": "#approvals",
        "template": "需要确认: {{confirmation.title}}"
      }
    }
  ],
  "configuration": {
    "webhook_url": "https://hooks.slack.com/services/...",
    "default_channel": "#mplp-notifications",
    "retry_attempts": 3,
    "timeout": 5000
  }
}

# 响应示例
{
  "id": "ext-mno7890h-e89b-12d3-a456-426614174000",
  "name": "Slack通知扩展",
  "code": "slack_notification",
  "description": "将MPLP事件通知发送到Slack频道",
  "type": "notification",
  "version": "1.0.0",
  "status": "registered",
  "created_at": "2024-12-19T19:59:25Z",
  "updated_at": "2024-12-19T19:59:25Z",
  "provider": {
    "name": "Slack Integration Team",
    "contact": "slack-team@company.com"
  },
  "capabilities": [
    {
      "name": "send_notification",
      "description": "发送通知到指定Slack频道",
      "input_schema": {
        "type": "object",
        "properties": {
          "channel": {"type": "string"},
          "message": {"type": "string"},
          "priority": {"type": "string", "enum": ["low", "medium", "high"]}
        },
        "required": ["channel", "message"]
      }
    }
  ],
  "hooks": [
    {
      "event": "plan.execution.started",
      "capability": "send_notification",
      "config": {
        "channel": "#project-updates",
        "template": "计划 {{plan.name}} 开始执行"
      }
    },
    {
      "event": "confirmation.required",
      "capability": "send_notification",
      "config": {
        "channel": "#approvals",
        "template": "需要确认: {{confirmation.title}}"
      }
    }
  ],
  "configuration": {
    "webhook_url": "[REDACTED]",
    "default_channel": "#mplp-notifications",
    "retry_attempts": 3,
    "timeout": 5000
  }
}
```

#### 激活扩展
```http
POST /api/v2/extensions/{extensionId}/activate
Content-Type: application/json
Authorization: Bearer {token}

{
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "configuration_overrides": {
    "default_channel": "#project-dev-team"
  }
}

# 响应示例
{
  "id": "ext-mno7890h-e89b-12d3-a456-426614174000",
  "status": "active",
  "activated_at": "2024-12-19T19:59:25Z",
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "effective_configuration": {
    "webhook_url": "[REDACTED]",
    "default_channel": "#project-dev-team",
    "retry_attempts": 3,
    "timeout": 5000
  }
}
```

---

## 📋 JSON Schema标准化

### Schema管理API

#### 获取Schema定义
```http
GET /api/v2/schemas/{module}/{schemaType}
Authorization: Bearer {token}

# 示例: 获取Context模块的Schema
GET /api/v2/schemas/context/context

# 响应示例
{
  "module": "context",
  "schemaType": "context",
  "version": "2.0.0",
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://mplp.org/schemas/v2/context/context.json",
    "title": "MPLP Context Schema",
    "description": "MPLP 2.0 上下文数据结构定义",
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid",
        "description": "上下文唯一标识符"
      },
      "name": {
        "type": "string",
        "minLength": 1,
        "maxLength": 255,
        "description": "上下文名称"
      },
      "description": {
        "type": "string",
        "maxLength": 2000,
        "description": "上下文描述"
      },
      "type": {
        "type": "string",
        "enum": ["development", "testing", "production", "research"],
        "description": "上下文类型"
      },
      "status": {
        "type": "string",
        "enum": ["active", "inactive", "archived"],
        "description": "上下文状态"
      },
      "metadata": {
        "type": "object",
        "description": "上下文元数据",
        "additionalProperties": true
      },
      "constraints": {
        "type": "object",
        "description": "约束条件",
        "properties": {
          "budget": {"type": "number", "minimum": 0},
          "timeline": {"type": "string"},
          "resources": {
            "type": "array",
            "items": {"type": "string"}
          }
        }
      },
      "goals": {
        "type": "array",
        "description": "目标列表",
        "items": {
          "type": "object",
          "properties": {
            "id": {"type": "string"},
            "description": {"type": "string"},
            "priority": {
              "type": "string",
              "enum": ["low", "medium", "high", "critical"]
            },
            "success_criteria": {"type": "string"}
          },
          "required": ["id", "description", "priority"]
        }
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "description": "创建时间"
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "description": "更新时间"
      },
      "version": {
        "type": "string",
        "pattern": "^\\d+\\.\\d+\\.\\d+$",
        "description": "版本号"
      }
    },
    "required": ["id", "name", "type", "status", "created_at", "updated_at", "version"],
    "additionalProperties": false
  }
}
```

#### 验证数据格式
```http
POST /api/v2/schemas/{module}/{schemaType}/validate
Content-Type: application/json
Authorization: Bearer {token}

{
  "data": {
    "id": "ctx-123e4567-e89b-12d3-a456-426614174000",
    "name": "测试上下文",
    "type": "development",
    "status": "active",
    "created_at": "2024-12-19T19:59:25Z",
  "updated_at": "2024-12-19T19:59:25Z",
    "version": "1.0.0"
  }
}

# 响应示例
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "validation_details": {
    "schema_version": "2.0.0",
    "validated_at": "2024-12-19T19:59:25Z",
    "validation_time_ms": 15
  }
}
```

#### 获取所有可用Schema
```http
GET /api/v2/schemas
Authorization: Bearer {token}

# 响应示例
{
  "schemas": [
    {
      "module": "context",
      "types": [
        {
          "type": "context",
          "version": "2.0.0",
          "description": "上下文数据结构"
        }
      ]
    },
    {
      "module": "plan",
      "types": [
        {
          "type": "plan",
          "version": "2.0.0",
          "description": "计划数据结构"
        },
        {
          "type": "step",
          "version": "2.0.0",
          "description": "步骤数据结构"
        }
      ]
    },
    {
      "module": "confirm",
      "types": [
        {
          "type": "confirmation",
          "version": "2.0.0",
          "description": "确认请求数据结构"
        }
      ]
    },
    {
      "module": "trace",
      "types": [
        {
          "type": "trace",
          "version": "2.0.0",
          "description": "跟踪记录数据结构"
        }
      ]
    },
    {
      "module": "role",
      "types": [
        {
          "type": "role",
          "version": "2.0.0",
          "description": "角色定义数据结构"
        },
        {
          "type": "assignment",
          "version": "2.0.0",
          "description": "角色分配数据结构"
        }
      ]
    },
    {
      "module": "extension",
      "types": [
        {
          "type": "extension",
          "version": "2.0.0",
          "description": "扩展定义数据结构"
        }
      ]
    }
  ]
}
```

---

## ✅ 基础验证机制

### 数据完整性验证API

#### 执行完整性检查
```http
POST /api/v2/validation/integrity
Content-Type: application/json
Authorization: Bearer {token}

{
  "target": {
    "type": "plan",
    "id": "plan-456e7890-e89b-12d3-a456-426614174000"
  },
  "checks": [
    "schema_validation",
    "reference_integrity",
    "business_rules",
    "data_consistency"
  ],
  "options": {
    "deep_validation": true,
    "include_warnings": true
  }
}

# 响应示例
{
  "validation_id": "val-pqr4567i-e89b-12d3-a456-426614174000",
  "target": {
    "type": "plan",
    "id": "plan-456e7890-e89b-12d3-a456-426614174000"
  },
  "status": "completed",
  "overall_result": "passed_with_warnings",
  "executed_at": "2024-12-19T19:59:25Z",
  "execution_time_ms": 245,
  "checks": [
    {
      "type": "schema_validation",
      "status": "passed",
      "message": "数据结构符合Schema定义",
      "details": {
        "schema_version": "2.0.0",
        "validated_fields": 15
      }
    },
    {
      "type": "reference_integrity",
      "status": "passed",
      "message": "所有引用关系完整",
      "details": {
        "checked_references": [
          "context_id",
          "step_dependencies"
        ]
      }
    },
    {
      "type": "business_rules",
      "status": "passed_with_warnings",
      "message": "业务规则验证通过，但有警告",
      "warnings": [
        "步骤估时可能过于乐观",
        "资源分配存在潜在冲突"
      ],
      "details": {
        "rules_checked": 8,
        "rules_passed": 8,
        "warnings_count": 2
      }
    },
    {
      "type": "data_consistency",
      "status": "passed",
      "message": "数据一致性检查通过",
      "details": {
        "consistency_checks": [
          "step_order_consistency",
          "resource_availability",
          "timeline_feasibility"
        ]
      }
    }
  ],
  "summary": {
    "total_checks": 4,
    "passed": 3,
    "passed_with_warnings": 1,
    "failed": 0,
    "warnings_count": 2,
    "errors_count": 0
  }
}
```

### 业务规则验证API

#### 执行业务规则检查
```http
POST /api/v2/validation/business-rules
Content-Type: application/json
Authorization: Bearer {token}

{
  "context": {
    "module": "plan",
    "operation": "execute",
    "data": {
      "plan_id": "plan-456e7890-e89b-12d3-a456-426614174000",
      "execution_mode": "sequential"
    }
  },
  "rules": [
    "plan_execution_prerequisites",
    "resource_availability",
    "permission_check",
    "dependency_validation"
  ]
}

# 响应示例
{
  "validation_id": "val-stu8901j-e89b-12d3-a456-426614174000",
  "status": "completed",
  "overall_result": "passed",
  "executed_at": "2024-12-19T19:59:25Z",
  "rules_results": [
    {
      "rule": "plan_execution_prerequisites",
      "status": "passed",
      "message": "计划执行前置条件满足",
      "details": {
        "checked_conditions": [
          "plan_approved",
          "context_active",
          "no_blocking_issues"
        ]
      }
    },
    {
      "rule": "resource_availability",
      "status": "passed",
      "message": "所需资源可用",
      "details": {
        "required_resources": ["analyst", "architect"],
        "available_resources": ["user-analyst-001", "user-architect-001"]
      }
    },
    {
      "rule": "permission_check",
      "status": "passed",
      "message": "用户具有执行权限",
      "details": {
        "user_id": "user-pm-001",
        "required_permissions": ["plan.execute"],
        "granted_permissions": ["plan.execute", "plan.read", "plan.update"]
      }
    },
    {
      "rule": "dependency_validation",
      "status": "passed",
      "message": "步骤依赖关系有效",
      "details": {
        "dependency_graph": "valid",
        "circular_dependencies": false,
        "unresolved_dependencies": []
      }
    }
  ]
}
```

### 性能验证API

#### 执行性能基准测试
```http
POST /api/v2/validation/performance
Content-Type: application/json
Authorization: Bearer {token}

{
  "test_type": "api_performance",
  "target": {
    "endpoint": "/api/v2/plans",
    "method": "POST"
  },
  "parameters": {
    "concurrent_users": 100,
    "duration_seconds": 60,
    "ramp_up_seconds": 10
  },
  "thresholds": {
    "avg_response_time_ms": 200,
    "p95_response_time_ms": 500,
    "error_rate_percent": 1,
    "throughput_rps": 50
  }
}

# 响应示例
{
  "test_id": "perf-vwx2345k-e89b-12d3-a456-426614174000",
  "status": "completed",
  "started_at": "2024-12-19T19:59:25Z",
  "completed_at": "2024-12-19T20:00:35Z",
  "duration_seconds": 70,
  "results": {
    "total_requests": 3500,
    "successful_requests": 3485,
    "failed_requests": 15,
    "error_rate_percent": 0.43,
    "avg_response_time_ms": 185,
    "p50_response_time_ms": 165,
    "p95_response_time_ms": 320,
    "p99_response_time_ms": 450,
    "max_response_time_ms": 580,
    "throughput_rps": 58.3,
    "data_transferred_mb": 12.5
  },
  "threshold_results": [
    {
      "metric": "avg_response_time_ms",
      "threshold": 200,
      "actual": 185,
      "status": "passed"
    },
    {
      "metric": "p95_response_time_ms",
      "threshold": 500,
      "actual": 320,
      "status": "passed"
    },
    {
      "metric": "error_rate_percent",
      "threshold": 1,
      "actual": 0.43,
      "status": "passed"
    },
    {
      "metric": "throughput_rps",
      "threshold": 50,
      "actual": 58.3,
      "status": "passed"
    }
  ],
  "overall_result": "passed"
}
```

---

## 🔐 认证和授权

### 认证API

#### JWT Token认证
```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "username": "project_manager",
  "password": "secure_password",
  "client_info": {
    "client_id": "mplp-web-client",
    "client_version": "2.0.0",
    "platform": "web"
  }
}

# 响应示例
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_expires_in": 86400,
  "user": {
    "id": "user-pm-001",
    "username": "project_manager",
    "email": "pm@company.com",
    "roles": ["project_manager"],
    "permissions": [
      "contexts.create",
      "contexts.read",
      "contexts.update",
      "plans.create",
      "plans.execute",
      "confirmations.approve"
    ]
  }
}
```

#### 刷新Token
```http
POST /api/v2/auth/refresh
Content-Type: application/json
Authorization: Bearer {refresh_token}

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 响应示例
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 授权API

#### 检查权限
```http
POST /api/v2/auth/check-permission
Content-Type: application/json
Authorization: Bearer {token}

{
  "resource": "plans",
  "action": "execute",
  "context": {
    "plan_id": "plan-456e7890-e89b-12d3-a456-426614174000",
    "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000"
  }
}

# 响应示例
{
  "allowed": true,
  "reason": "User has project_manager role with plan.execute permission",
  "conditions": [],
  "expires_at": "2024-12-19T23:59:59Z"
}
```

---

## 🌐 REST API规范

### HTTP状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功获取资源 |
| 201 | Created | 成功创建资源 |
| 202 | Accepted | 请求已接受，异步处理中 |
| 204 | No Content | 成功删除资源 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或认证失败 |
| 403 | Forbidden | 已认证但无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 数据验证失败 |
| 429 | Too Many Requests | 请求频率超限 |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | 服务不可用 |

### 请求头规范

```http
# 必需头
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json

# 可选头
X-Request-ID: req-123456789
X-Client-Version: 2.0.0
X-Correlation-ID: corr-987654321
User-Agent: MPLP-Client/2.0.0
```

### 响应格式规范

#### 成功响应
```json
{
  "data": {
    // 实际数据
  },
  "meta": {
    "request_id": "req-123456789",
    "timestamp": "2024-12-19T19:59:25Z",
    "version": "2.0.0"
  }
}
```

#### 分页响应
```json
{
  "data": [
    // 数据项
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "request_id": "