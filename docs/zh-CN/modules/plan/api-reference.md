# Plan模块API参考

> **🌐 语言导航**: [English](../../../en/modules/plan/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Plan模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Plan-blue.svg)](./README.md)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](./openapi.yaml)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/plan/api-reference.md)

---

## 🎯 API概览

Plan模块提供全面的REST、GraphQL和WebSocket API，用于智能规划、任务编排和执行监控。所有API遵循MPLP协议标准，提供先进的AI驱动规划能力和实时执行跟踪。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/plans`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/plans`

### **身份验证**
所有API端点都需要使用JWT Bearer令牌进行身份验证：
```http
Authorization: Bearer <jwt-token>
```

### **内容类型**
- **请求**: `application/json`
- **响应**: `application/json`
- **WebSocket**: `application/json` 消息

---

## 🔧 REST API参考

### **计划管理端点**

#### **创建计划**
```http
POST /api/v1/plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "多智能体协调计划",
  "type": "collaborative",
  "context_id": "ctx-001",
  "objectives": [
    {
      "description": "协调多智能体任务执行",
      "priority": "high",
      "success_criteria": [
        "all_tasks_completed",
        "execution_time_under_threshold"
      ],
      "constraints": {
        "deadline": "2025-09-03T18:00:00Z",
        "max_resources": 10,
        "quality_threshold": 0.95
      }
    }
  ],
  "tasks": [
    {
      "name": "数据分析",
      "description": "分析输入数据并生成洞察",
      "type": "analysis",
      "estimated_duration": 1800000,
      "required_capabilities": ["data_analysis", "machine_learning"],
      "dependencies": [],
      "constraints": {
        "max_agents": 2,
        "memory_requirement": "4GB"
      }
    }
  ],
  "planning_strategy": {
    "algorithm": "hierarchical_task_network",
    "optimization_goals": ["minimize_time", "maximize_quality"],
    "constraint_handling": "soft_constraints"
  }
}
```

**响应 (201 Created):**
```json
{
  "plan_id": "plan-001",
  "name": "多智能体协调计划",
  "type": "collaborative",
  "status": "created",
  "context_id": "ctx-001",
  "version": "1.0.0",
  "objectives": [
    {
      "objective_id": "obj-001",
      "description": "协调多智能体任务执行",
      "priority": "high",
      "success_criteria": [
        "all_tasks_completed",
        "execution_time_under_threshold"
      ],
      "constraints": {
        "deadline": "2025-09-03T18:00:00Z",
        "max_resources": 10,
        "quality_threshold": 0.95
      },
      "estimated_completion": "2025-09-03T17:30:00Z"
    }
  ],
  "tasks": [
    {
      "task_id": "task-001",
      "name": "数据分析",
      "description": "分析输入数据并生成洞察",
      "type": "analysis",
      "status": "planned",
      "estimated_duration": 1800000,
      "required_capabilities": ["data_analysis", "machine_learning"],
      "dependencies": [],
      "constraints": {
        "max_agents": 2,
        "memory_requirement": "4GB"
      },
      "assigned_agents": [],
      "scheduled_start": "2025-09-03T15:00:00Z",
      "scheduled_end": "2025-09-03T15:30:00Z"
    }
  ],
  "planning_strategy": {
    "algorithm": "hierarchical_task_network",
    "optimization_goals": ["minimize_time", "maximize_quality"],
    "constraint_handling": "soft_constraints",
    "selected_reason": "最适合多层次任务分解"
  },
  "execution_plan": {
    "total_estimated_duration": 1800000,
    "critical_path": ["task-001"],
    "resource_allocation": {
      "cpu_cores": 8,
      "memory_gb": 16,
      "storage_gb": 100
    },
    "risk_assessment": {
      "overall_risk": "low",
      "risk_factors": [],
      "mitigation_strategies": []
    }
  },
  "created_at": "2025-09-03T14:00:00Z",
  "created_by": "user-001"
}
```

#### **获取计划详情**
```http
GET /api/v1/plans/{plan_id}
Authorization: Bearer <token>
```

**响应 (200 OK):**
```json
{
  "plan_id": "plan-001",
  "name": "多智能体协调计划",
  "type": "collaborative",
  "status": "executing",
  "context_id": "ctx-001",
  "version": "1.0.0",
  "progress": {
    "completion_percentage": 65.5,
    "completed_tasks": 2,
    "total_tasks": 3,
    "current_phase": "execution",
    "estimated_completion": "2025-09-03T17:30:00Z"
  },
  "performance_metrics": {
    "execution_efficiency": 0.92,
    "resource_utilization": 0.78,
    "quality_score": 0.96,
    "timeline_adherence": 0.88
  },
  "active_tasks": [
    {
      "task_id": "task-003",
      "name": "结果整合",
      "status": "executing",
      "assigned_agents": ["agent-001", "agent-002"],
      "progress_percentage": 45.0,
      "estimated_completion": "2025-09-03T16:45:00Z"
    }
  ],
  "recent_events": [
    {
      "event_id": "evt-001",
      "type": "task_completed",
      "task_id": "task-002",
      "timestamp": "2025-09-03T15:30:00Z",
      "details": "数据处理任务成功完成"
    }
  ]
}
```

#### **更新计划**
```http
PUT /api/v1/plans/{plan_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "更新的多智能体协调计划",
  "objectives": [
    {
      "objective_id": "obj-001",
      "description": "协调多智能体任务执行",
      "priority": "critical",
      "constraints": {
        "deadline": "2025-09-03T17:00:00Z",
        "max_resources": 15,
        "quality_threshold": 0.98
      }
    }
  ],
  "additional_tasks": [
    {
      "name": "质量验证",
      "description": "验证执行结果质量",
      "type": "validation",
      "estimated_duration": 600000,
      "required_capabilities": ["quality_assurance"],
      "dependencies": ["task-001", "task-002"]
    }
  ]
}
```

#### **执行计划**
```http
POST /api/v1/plans/{plan_id}/execute
Content-Type: application/json
Authorization: Bearer <token>

{
  "execution_mode": "immediate",
  "execution_options": {
    "parallel_execution": true,
    "max_concurrent_tasks": 5,
    "failure_handling": "retry_with_backoff",
    "monitoring_level": "detailed"
  },
  "resource_constraints": {
    "max_cpu_cores": 32,
    "max_memory_gb": 64,
    "max_execution_time_hours": 4
  }
}
```

**响应 (200 OK):**
```json
{
  "execution_id": "exec-001",
  "plan_id": "plan-001",
  "status": "started",
  "execution_mode": "immediate",
  "started_at": "2025-09-03T15:00:00Z",
  "estimated_completion": "2025-09-03T17:30:00Z",
  "execution_summary": {
    "total_tasks": 4,
    "parallel_tasks": 2,
    "sequential_tasks": 2,
    "allocated_resources": {
      "cpu_cores": 16,
      "memory_gb": 32,
      "storage_gb": 200
    }
  },
  "monitoring_endpoints": {
    "progress_url": "/api/v1/plans/plan-001/execution/exec-001/progress",
    "metrics_url": "/api/v1/plans/plan-001/execution/exec-001/metrics",
    "logs_url": "/api/v1/plans/plan-001/execution/exec-001/logs"
  }
}
```

### **任务管理端点**

#### **获取任务列表**
```http
GET /api/v1/plans/{plan_id}/tasks
Authorization: Bearer <token>
```

#### **更新任务状态**
```http
PATCH /api/v1/plans/{plan_id}/tasks/{task_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "completed",
  "completion_percentage": 100,
  "execution_results": {
    "output_data": "分析结果数据",
    "quality_metrics": {
      "accuracy": 0.96,
      "completeness": 0.98,
      "timeliness": 0.94
    },
    "resource_usage": {
      "cpu_time_seconds": 1200,
      "memory_peak_mb": 2048,
      "storage_used_mb": 512
    }
  },
  "completion_notes": "任务成功完成，结果质量符合预期"
}
```

### **协作规划端点**

#### **发起协作规划会话**
```http
POST /api/v1/plans/collaborative-sessions
Content-Type: application/json
Authorization: Bearer <token>

{
  "session_name": "产品开发协作规划",
  "participants": [
    {
      "agent_id": "agent-001",
      "role": "project_manager",
      "capabilities": ["planning", "coordination"]
    },
    {
      "agent_id": "agent-002", 
      "role": "technical_lead",
      "capabilities": ["technical_planning", "architecture"]
    }
  ],
  "planning_objective": {
    "description": "制定新产品开发计划",
    "constraints": {
      "timeline": "3个月",
      "budget": 100000,
      "team_size": 8
    },
    "success_criteria": [
      "按时交付",
      "质量达标",
      "预算控制"
    ]
  },
  "collaboration_settings": {
    "consensus_threshold": 0.8,
    "max_iterations": 10,
    "timeout_hours": 24
  }
}
```

---

## 🔗 相关文档

- [Plan模块概览](./README.md) - 模块概览和架构
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业就绪  

**⚠️ Alpha版本说明**: Plan模块API在Alpha版本中提供完整的智能规划功能。额外的高级API功能和优化将在Beta版本中添加。
