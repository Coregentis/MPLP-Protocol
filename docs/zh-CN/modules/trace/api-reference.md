# Trace模块API参考

> **🌐 语言导航**: [English](../../../en/modules/trace/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Trace模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Trace-orange.svg)](./README.md)
[![监控](https://img.shields.io/badge/monitoring-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/trace/api-reference.md)

---

## 🎯 API概览

Trace模块提供全面的REST、GraphQL和WebSocket API，用于企业级执行监控、性能跟踪和可观测性。所有API遵循MPLP协议标准，提供高级监控和分析功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/trace`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/trace`

### **认证**
所有API端点需要使用JWT Bearer令牌进行认证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **追踪管理端点**

#### **开始执行追踪**
```http
POST /api/v1/trace/executions
Content-Type: application/json
Authorization: Bearer <token>

{
  "trace_id": "trace-001",
  "operation_name": "workflow_execution",
  "service_name": "plan_module",
  "context": {
    "context_id": "ctx-001",
    "user_id": "user-001",
    "session_id": "sess-001",
    "correlation_id": "corr-001"
  },
  "tags": {
    "workflow_id": "wf-001",
    "workflow_type": "approval_workflow",
    "priority": "high",
    "environment": "production"
  },
  "metadata": {
    "agent_version": "1.0.0-alpha",
    "execution_mode": "distributed",
    "resource_requirements": {
      "cpu": "2 cores",
      "memory": "4GB",
      "storage": "10GB"
    }
  },
  "parent_span_id": null,
  "sampling_rate": 1.0,
  "trace_flags": ["detailed_metrics", "performance_analysis"]
}
```

**响应 (201 Created):**
```json
{
  "trace_id": "trace-001",
  "span_id": "span-001",
  "operation_name": "workflow_execution",
  "service_name": "plan_module",
  "status": "active",
  "start_time": "2025-09-03T10:00:00.000Z",
  "context": {
    "context_id": "ctx-001",
    "user_id": "user-001",
    "session_id": "sess-001",
    "correlation_id": "corr-001"
  },
  "trace_context": {
    "trace_state": "sampling=1.0;flags=detailed_metrics,performance_analysis",
    "baggage": "workflow_id=wf-001,priority=high"
  },
  "monitoring": {
    "metrics_collection_enabled": true,
    "anomaly_detection_enabled": true,
    "alert_thresholds": {
      "duration_ms": 5000,
      "cpu_usage_percent": 80,
      "memory_usage_mb": 1024,
      "error_rate_percent": 5
    }
  },
  "estimated_duration_ms": 3000,
  "resource_allocation": {
    "cpu_cores": 2,
    "memory_mb": 4096,
    "storage_mb": 10240
  }
}
```

#### **更新执行追踪**
```http
PUT /api/v1/trace/executions/{trace_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "in_progress",
  "progress_percentage": 45,
  "current_operation": "data_processing",
  "metrics": {
    "cpu_usage_percent": 65,
    "memory_usage_mb": 2048,
    "network_io_mbps": 12.5,
    "disk_io_mbps": 8.2
  },
  "events": [
    {
      "event_type": "milestone_reached",
      "event_name": "数据预处理完成",
      "timestamp": "2025-09-03T10:01:30.000Z",
      "metadata": {
        "processed_records": 10000,
        "processing_time_ms": 90000
      }
    }
  ],
  "custom_attributes": {
    "batch_size": 1000,
    "processing_algorithm": "advanced_ml",
    "data_quality_score": 0.95
  }
}
```

**响应 (200 OK):**
```json
{
  "trace_id": "trace-001",
  "span_id": "span-001",
  "status": "in_progress",
  "progress_percentage": 45,
  "current_operation": "data_processing",
  "updated_at": "2025-09-03T10:01:30.000Z",
  "duration_ms": 90000,
  "estimated_remaining_ms": 110000,
  "performance_score": 0.88,
  "anomaly_detected": false
}
```

#### **完成执行追踪**
```http
POST /api/v1/trace/executions/{trace_id}/finish
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "completed",
  "result": {
    "success": true,
    "output_data": {
      "processed_records": 25000,
      "generated_insights": 150,
      "quality_score": 0.96
    },
    "performance_summary": {
      "total_duration_ms": 180000,
      "cpu_efficiency": 0.82,
      "memory_efficiency": 0.78,
      "throughput_records_per_second": 138.9
    }
  },
  "final_metrics": {
    "peak_cpu_usage_percent": 78,
    "peak_memory_usage_mb": 3200,
    "total_network_io_mb": 450,
    "total_disk_io_mb": 280
  },
  "errors": [],
  "warnings": [
    {
      "warning_type": "performance",
      "message": "内存使用接近阈值",
      "timestamp": "2025-09-03T10:02:45.000Z"
    }
  ]
}
```

**响应 (200 OK):**
```json
{
  "trace_id": "trace-001",
  "span_id": "span-001",
  "status": "completed",
  "start_time": "2025-09-03T10:00:00.000Z",
  "end_time": "2025-09-03T10:03:00.000Z",
  "total_duration_ms": 180000,
  "result": {
    "success": true,
    "performance_grade": "B+",
    "efficiency_score": 0.80
  },
  "analytics": {
    "performance_percentile": 75,
    "compared_to_baseline": "+12%",
    "optimization_opportunities": [
      "考虑增加内存分配以提高处理速度",
      "优化数据访问模式以减少I/O开销"
    ]
  },
  "trace_summary": {
    "total_spans": 15,
    "total_events": 8,
    "error_count": 0,
    "warning_count": 1
  }
}
```

### **性能监控端点**

#### **获取实时性能指标**
```http
GET /api/v1/trace/metrics/realtime?trace_id={trace_id}&metrics=cpu,memory,network
Authorization: Bearer <token>
```

**响应 (200 OK):**
```json
{
  "trace_id": "trace-001",
  "timestamp": "2025-09-03T10:01:45.000Z",
  "metrics": {
    "cpu": {
      "usage_percent": 68,
      "cores_allocated": 2,
      "cores_used": 1.36,
      "efficiency": 0.68
    },
    "memory": {
      "usage_mb": 2560,
      "allocated_mb": 4096,
      "usage_percent": 62.5,
      "peak_usage_mb": 2800
    },
    "network": {
      "inbound_mbps": 8.5,
      "outbound_mbps": 4.2,
      "total_transferred_mb": 125,
      "latency_ms": 12
    }
  },
  "performance_indicators": {
    "overall_health": "good",
    "bottlenecks": [],
    "efficiency_score": 0.75,
    "predicted_completion_time": "2025-09-03T10:03:15.000Z"
  }
}
```

#### **获取历史性能数据**
```http
GET /api/v1/trace/metrics/history?trace_id={trace_id}&start_time=2025-09-03T10:00:00Z&end_time=2025-09-03T10:03:00Z&interval=30s
Authorization: Bearer <token>
```

**响应 (200 OK):**
```json
{
  "trace_id": "trace-001",
  "time_range": {
    "start_time": "2025-09-03T10:00:00.000Z",
    "end_time": "2025-09-03T10:03:00.000Z",
    "interval_seconds": 30
  },
  "data_points": [
    {
      "timestamp": "2025-09-03T10:00:00.000Z",
      "cpu_usage_percent": 45,
      "memory_usage_mb": 1800,
      "network_io_mbps": 5.2,
      "disk_io_mbps": 3.1
    },
    {
      "timestamp": "2025-09-03T10:00:30.000Z",
      "cpu_usage_percent": 62,
      "memory_usage_mb": 2200,
      "network_io_mbps": 8.7,
      "disk_io_mbps": 6.4
    },
    {
      "timestamp": "2025-09-03T10:01:00.000Z",
      "cpu_usage_percent": 68,
      "memory_usage_mb": 2560,
      "network_io_mbps": 8.5,
      "disk_io_mbps": 7.2
    }
  ],
  "summary": {
    "avg_cpu_usage_percent": 58.3,
    "peak_cpu_usage_percent": 78,
    "avg_memory_usage_mb": 2186.7,
    "peak_memory_usage_mb": 3200,
    "total_network_io_mb": 450,
    "total_disk_io_mb": 280
  }
}
```

### **异常检测端点**

#### **获取异常检测结果**
```http
GET /api/v1/trace/anomalies?trace_id={trace_id}
Authorization: Bearer <token>
```

**响应 (200 OK):**
```json
{
  "trace_id": "trace-001",
  "anomaly_detection": {
    "enabled": true,
    "last_analysis": "2025-09-03T10:02:30.000Z",
    "analysis_interval_seconds": 30
  },
  "detected_anomalies": [
    {
      "anomaly_id": "anom-001",
      "type": "performance_degradation",
      "severity": "medium",
      "detected_at": "2025-09-03T10:02:15.000Z",
      "metric": "memory_usage",
      "description": "内存使用量异常增长",
      "details": {
        "expected_value": 2000,
        "actual_value": 3200,
        "deviation_percent": 60,
        "confidence": 0.87
      },
      "impact": {
        "performance_impact": "medium",
        "estimated_delay_ms": 15000,
        "affected_operations": ["data_processing", "result_generation"]
      },
      "recommendations": [
        "检查内存泄漏",
        "优化数据结构",
        "考虑增加内存分配"
      ]
    }
  ],
  "performance_baseline": {
    "cpu_usage_percent": 55,
    "memory_usage_mb": 2000,
    "network_io_mbps": 6.5,
    "response_time_ms": 150
  },
  "anomaly_score": 0.23,
  "overall_health": "good_with_warnings"
}
```

---

## 🔗 相关文档

- [Trace模块概览](./README.md) - 模块概览和架构
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
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Trace模块API在Alpha版本中提供企业级监控和追踪功能。额外的高级API功能和分析特性将在Beta版本中添加。
