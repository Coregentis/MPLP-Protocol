# Plan模块协议规范

> **🌐 语言导航**: [English](../../../en/modules/plan/protocol-specification.md) | [中文](protocol-specification.md)



**MPLP L2协调层 - Plan模块协议定义**

[![协议](https://img.shields.io/badge/protocol-Plan%20v1.0-green.svg)](./README.md)
[![Schema](https://img.shields.io/badge/schema-JSON%20Schema%20Draft--07-blue.svg)](../../architecture/schema-system.md)
[![状态](https://img.shields.io/badge/status-Stable-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/plan/protocol-specification.md)

---

## 🎯 协议概览

Plan模块协议定义了MPLP中AI驱动规划和任务调度的标准化通信接口。该协议支持智能计划生成、协作规划、任务协调和跨多智能体系统的执行监控。

### **协议特性**
- **版本**: 1.0.0-alpha
- **Schema标准**: JSON Schema Draft-07
- **序列化**: JSON，大型计划可选二进制扩展
- **传输**: HTTP/HTTPS, WebSocket, gRPC
- **身份验证**: 基于JWT，具有规划特定权限
- **命名约定**: 协议使用snake_case，TypeScript使用camelCase

---

## 📋 消息类型

### **1. 计划管理消息**

#### **创建计划请求**
```json
{
  "message_type": "create_plan_request",
  "message_id": "msg-plan-001",
  "timestamp": "2025-09-03T10:00:00Z",
  "sender": {
    "module_id": "planning-client-001",
    "module_type": "external_client"
  },
  "request": {
    "plan_definition": {
      "name": "多智能体文档处理",
      "context_id": "ctx-001",
      "objectives": [
        {
          "objective_id": "obj-001",
          "description": "在2小时内处理1000个文档",
          "priority": "high",
          "success_criteria": [
            "completion_rate >= 95%",
            "processing_time <= 7200000",
            "error_rate <= 2%"
          ]
        }
      ],
      "constraints": [
        {
          "constraint_id": "const-001",
          "type": "resource",
          "description": "最多10个智能体",
          "parameters": {
            "max_agents": 10,
            "agent_types": ["parser", "analyzer", "validator"]
          }
        },
        {
          "constraint_id": "const-002",
          "type": "temporal",
          "description": "2小时内完成",
          "parameters": {
            "deadline": "2025-09-03T12:00:00Z",
            "max_duration": 7200000
          }
        }
      ],
      "planning_preferences": {
        "algorithm": "hierarchical_task_network",
        "optimization_criteria": ["time", "resource_efficiency", "quality"],
        "risk_tolerance": "moderate",
        "collaboration_mode": "consensus_based"
      }
    },
    "planning_context": {
      "available_agents": [
        {
          "agent_id": "agent-parser-001",
          "capabilities": ["pdf_parsing", "text_extraction"],
          "capacity": 50,
          "cost_per_hour": 10.0
        },
        {
          "agent_id": "agent-analyzer-001",
          "capabilities": ["content_analysis", "classification"],
          "capacity": 30,
          "cost_per_hour": 15.0
        }
      ],
      "available_resources": {
        "compute": {
          "cpu_cores": 32,
          "memory_gb": 128,
          "storage_gb": 1000
        },
        "network": {
          "bandwidth_mbps": 1000,
          "latency_ms": 5
        }
      },
      "environmental_factors": {
        "current_load": 0.3,
        "peak_hours": false,
        "maintenance_window": false
      }
    }
  }
}
```

#### **创建计划响应**
```json
{
  "message_type": "create_plan_response",
  "message_id": "msg-plan-response-001",
  "timestamp": "2025-09-03T10:00:15Z",
  "correlation_id": "msg-plan-001",
  "sender": {
    "module_id": "plan-module",
    "module_type": "mplp_module"
  },
  "response": {
    "status": "success",
    "plan": {
      "plan_id": "plan-001",
      "name": "多智能体文档处理",
      "context_id": "ctx-001",
      "version": "1.0.0",
      "status": "created",
      "objectives": [
        {
          "objective_id": "obj-001",
          "description": "在2小时内处理1000个文档",
          "priority": "high",
          "success_criteria": [
            "completion_rate >= 95%",
            "processing_time <= 7200000",
            "error_rate <= 2%"
          ],
          "estimated_completion": "2025-09-03T11:45:00Z"
        }
      ],
      "tasks": [
        {
          "task_id": "task-001",
          "name": "文档解析",
          "description": "解析PDF文档并提取文本",
          "type": "parsing",
          "status": "planned",
          "estimated_duration": 3600000,
          "required_capabilities": ["pdf_parsing", "text_extraction"],
          "dependencies": [],
          "constraints": {
            "max_agents": 5,
            "memory_requirement": "8GB"
          },
          "assigned_agents": [],
          "scheduled_start": "2025-09-03T10:00:00Z",
          "scheduled_end": "2025-09-03T11:00:00Z"
        },
        {
          "task_id": "task-002",
          "name": "内容分析",
          "description": "分析文档内容并进行分类",
          "type": "analysis",
          "status": "planned",
          "estimated_duration": 3600000,
          "required_capabilities": ["content_analysis", "classification"],
          "dependencies": ["task-001"],
          "constraints": {
            "max_agents": 3,
            "memory_requirement": "16GB"
          },
          "assigned_agents": [],
          "scheduled_start": "2025-09-03T11:00:00Z",
          "scheduled_end": "2025-09-03T12:00:00Z"
        }
      ],
      "planning_strategy": {
        "algorithm": "hierarchical_task_network",
        "optimization_goals": ["minimize_time", "maximize_quality"],
        "constraint_handling": "soft_constraints",
        "selected_reason": "最适合多层次任务分解和资源优化"
      },
      "execution_plan": {
        "total_estimated_duration": 7200000,
        "critical_path": ["task-001", "task-002"],
        "resource_allocation": {
          "cpu_cores": 16,
          "memory_gb": 32,
          "storage_gb": 200
        },
        "risk_assessment": {
          "overall_risk": "low",
          "risk_factors": [
            {
              "factor": "resource_contention",
              "probability": 0.1,
              "impact": "medium"
            }
          ],
          "mitigation_strategies": [
            "动态资源重分配",
            "任务优先级调整"
          ]
        }
      },
      "performance_predictions": {
        "expected_completion_time": "2025-09-03T11:45:00Z",
        "confidence_level": 0.92,
        "resource_utilization": {
          "cpu": 0.75,
          "memory": 0.6,
          "network": 0.4
        },
        "quality_metrics": {
          "expected_accuracy": 0.96,
          "expected_completeness": 0.98
        }
      },
      "created_at": "2025-09-03T10:00:15Z",
      "created_by": "planning-client-001"
    }
  }
}
```

### **2. 任务调度消息**

#### **任务调度请求**
```json
{
  "message_type": "schedule_task_request",
  "message_id": "msg-schedule-001",
  "timestamp": "2025-09-03T10:05:00Z",
  "sender": {
    "module_id": "task-coordinator-001",
    "module_type": "external_client"
  },
  "request": {
    "task_scheduling": {
      "task_id": "task-001",
      "plan_id": "plan-001",
      "scheduling_preferences": {
        "priority": "high",
        "preferred_start_time": "2025-09-03T10:00:00Z",
        "max_delay_tolerance": 300000,
        "resource_preferences": {
          "agent_selection": "optimal_performance",
          "resource_allocation": "balanced"
        }
      },
      "constraints": {
        "deadline": "2025-09-03T11:00:00Z",
        "max_agents": 5,
        "required_capabilities": ["pdf_parsing", "text_extraction"],
        "resource_limits": {
          "max_cpu_cores": 8,
          "max_memory_gb": 16,
          "max_storage_gb": 100
        }
      },
      "execution_context": {
        "input_data": {
          "document_count": 500,
          "document_types": ["pdf", "docx", "txt"],
          "average_size_mb": 2.5
        },
        "output_requirements": {
          "format": "structured_json",
          "quality_level": "high",
          "validation_required": true
        }
      }
    }
  }
}
```

#### **任务调度响应**
```json
{
  "message_type": "schedule_task_response",
  "message_id": "msg-schedule-response-001",
  "timestamp": "2025-09-03T10:05:02Z",
  "correlation_id": "msg-schedule-001",
  "sender": {
    "module_id": "plan-module",
    "module_type": "mplp_module"
  },
  "response": {
    "status": "success",
    "scheduled_task": {
      "task_id": "task-001",
      "plan_id": "plan-001",
      "scheduling_result": {
        "scheduled_start": "2025-09-03T10:00:00Z",
        "scheduled_end": "2025-09-03T11:00:00Z",
        "actual_priority": 95,
        "scheduling_confidence": 0.94
      },
      "resource_allocation": {
        "assigned_agents": [
          {
            "agent_id": "agent-parser-001",
            "role": "primary_parser",
            "allocated_capacity": 100,
            "estimated_workload": 0.8
          },
          {
            "agent_id": "agent-parser-002",
            "role": "secondary_parser",
            "allocated_capacity": 80,
            "estimated_workload": 0.6
          }
        ],
        "allocated_resources": {
          "cpu_cores": 6,
          "memory_gb": 12,
          "storage_gb": 80,
          "network_bandwidth_mbps": 100
        }
      },
      "execution_plan": {
        "execution_strategy": "parallel_processing",
        "batch_size": 50,
        "checkpoint_intervals": 600000,
        "failure_handling": "retry_with_backoff",
        "monitoring_level": "detailed"
      },
      "performance_estimates": {
        "estimated_throughput": 8.33,
        "estimated_completion_time": "2025-09-03T10:58:00Z",
        "resource_efficiency": 0.87,
        "quality_prediction": 0.96
      }
    }
  }
}
```

---

## 🔗 相关文档

- [Plan模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [测试指南](./testing-guide.md) - 测试策略

---

**协议版本**: 1.0.0-alpha
**最后更新**: 2025年9月3日
**下次审查**: 2025年12月3日
**状态**: 稳定版本

**⚠️ Alpha版本说明**: Plan模块协议规范在Alpha版本中提供稳定的协议定义。额外的高级协议功能和扩展将在Beta版本中添加。