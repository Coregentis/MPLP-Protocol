# Trace模块协议规范

> **🌐 语言导航**: [English](../../../en/modules/trace/protocol-specification.md) | [中文](protocol-specification.md)



**多智能体协议生命周期平台 - Trace模块协议规范 v1.0.0-alpha**

[![协议](https://img.shields.io/badge/protocol-MPLP%20v1.0-blue.svg)](./README.md)
[![规范](https://img.shields.io/badge/specification-Enterprise%20Grade-green.svg)](./api-reference.md)
[![监控](https://img.shields.io/badge/monitoring-OpenTelemetry%20Compatible-orange.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/trace/protocol-specification.md)

---

## 🎯 协议概览

本规范定义了Trace模块的完整协议标准，包括分布式追踪消息格式、性能监控协议、异常检测通信和告警系统协议。所有协议遵循MPLP标准并与OpenTelemetry兼容。

### **协议特性**
- **OpenTelemetry兼容**: 完全兼容OpenTelemetry追踪和指标协议
- **高性能**: 优化的二进制和JSON消息格式
- **可扩展**: 支持自定义属性和扩展字段
- **安全**: 内置认证和加密支持
- **可靠**: 消息确认和重试机制

### **支持的传输协议**
- **HTTP/HTTPS**: RESTful API和OTLP over HTTP
- **gRPC**: 高性能二进制协议
- **WebSocket**: 实时双向通信
- **Message Queue**: 异步消息传递

---

## 📋 核心消息格式

### **1. 执行追踪消息**

#### **开始执行追踪请求**
```json
{
  "message_type": "start_execution_trace",
  "version": "1.0.0-alpha",
  "timestamp": "2025-09-03T10:00:00.000Z",
  "trace_id": "trace-001",
  "span_id": "span-001",
  "operation_name": "workflow_execution",
  "service_name": "plan_module",
  "span_kind": "server",
  "parent_span_id": null,
  "trace_state": "sampling=1.0;flags=detailed_metrics,performance_analysis",
  "baggage": "workflow_id=wf-001,priority=high",
  
  "context": {
    "context_id": "ctx-001",
    "user_id": "user-001",
    "session_id": "sess-001",
    "correlation_id": "corr-001",
    "tenant_id": "tenant-001",
    "organization_id": "org-001"
  },
  
  "attributes": {
    "workflow.id": "wf-001",
    "workflow.type": "approval_workflow",
    "workflow.priority": "high",
    "workflow.complexity": "medium",
    "environment": "production",
    "service.version": "1.0.0-alpha",
    "service.instance.id": "instance-001"
  },
  
  "resource": {
    "service.name": "mplp-plan-module",
    "service.namespace": "mplp",
    "service.version": "1.0.0-alpha",
    "deployment.environment": "production",
    "host.name": "mplp-node-001",
    "container.id": "container-001",
    "k8s.pod.name": "mplp-plan-pod-001",
    "k8s.namespace.name": "mplp-production"
  },
  
  "sampling": {
    "sampling_rate": 1.0,
    "sampling_decision": "sampled",
    "sampling_reason": "high_priority_workflow"
  },
  
  "monitoring_config": {
    "metrics_collection_enabled": true,
    "anomaly_detection_enabled": true,
    "performance_analysis_enabled": true,
    "alert_thresholds": {
      "duration_ms": 5000,
      "cpu_usage_percent": 80,
      "memory_usage_mb": 1024,
      "error_rate_percent": 5
    }
  },
  
  "expected_performance": {
    "estimated_duration_ms": 3000,
    "expected_cpu_usage_percent": 50,
    "expected_memory_usage_mb": 512,
    "expected_throughput_ops_per_sec": 100
  }
}
```

#### **执行追踪更新消息**
```json
{
  "message_type": "update_execution_trace",
  "version": "1.0.0-alpha",
  "timestamp": "2025-09-03T10:01:30.000Z",
  "trace_id": "trace-001",
  "span_id": "span-001",
  
  "status": {
    "code": "in_progress",
    "message": "数据处理阶段",
    "progress_percentage": 45
  },
  
  "current_operation": {
    "operation_name": "data_processing",
    "operation_type": "compute_intensive",
    "start_time": "2025-09-03T10:01:00.000Z",
    "estimated_completion": "2025-09-03T10:02:30.000Z"
  },
  
  "performance_metrics": {
    "cpu_usage_percent": 65,
    "memory_usage_mb": 2048,
    "network_io_mbps": 12.5,
    "disk_io_mbps": 8.2,
    "active_threads": 8,
    "queue_depth": 25,
    "cache_hit_rate": 0.85
  },
  
  "events": [
    {
      "event_type": "milestone_reached",
      "event_name": "数据预处理完成",
      "timestamp": "2025-09-03T10:01:30.000Z",
      "severity": "info",
      "attributes": {
        "processed_records": 10000,
        "processing_time_ms": 90000,
        "data_quality_score": 0.95,
        "validation_errors": 0
      }
    }
  ],
  
  "custom_metrics": {
    "business_metrics": {
      "workflows_processed": 15,
      "approval_rate": 0.92,
      "average_approval_time_ms": 2500
    },
    "technical_metrics": {
      "database_connections": 5,
      "cache_size_mb": 128,
      "gc_collections": 3,
      "heap_usage_mb": 1800
    }
  },
  
  "links": [
    {
      "trace_id": "related-trace-001",
      "span_id": "related-span-001",
      "relationship": "child_workflow",
      "attributes": {
        "relationship.type": "subprocess",
        "relationship.description": "数据验证子流程"
      }
    }
  ]
}
```

#### **执行追踪完成消息**
```json
{
  "message_type": "finish_execution_trace",
  "version": "1.0.0-alpha",
  "timestamp": "2025-09-03T10:03:00.000Z",
  "trace_id": "trace-001",
  "span_id": "span-001",
  
  "final_status": {
    "code": "ok",
    "message": "工作流执行成功完成",
    "success": true
  },
  
  "execution_result": {
    "output_data": {
      "processed_records": 25000,
      "generated_insights": 150,
      "quality_score": 0.96,
      "approval_decisions": 23,
      "rejected_items": 2
    },
    "performance_summary": {
      "total_duration_ms": 180000,
      "cpu_efficiency": 0.82,
      "memory_efficiency": 0.78,
      "throughput_records_per_second": 138.9,
      "resource_utilization_score": 0.85
    }
  },
  
  "final_metrics": {
    "peak_cpu_usage_percent": 78,
    "peak_memory_usage_mb": 3200,
    "total_network_io_mb": 450,
    "total_disk_io_mb": 280,
    "total_database_queries": 1250,
    "cache_efficiency": 0.88
  },
  
  "errors": [],
  "warnings": [
    {
      "warning_type": "performance",
      "warning_code": "MEMORY_USAGE_HIGH",
      "message": "内存使用接近阈值",
      "timestamp": "2025-09-03T10:02:45.000Z",
      "severity": "medium",
      "attributes": {
        "memory_usage_mb": 3200,
        "memory_threshold_mb": 3500,
        "usage_percentage": 91.4
      }
    }
  ],
  
  "performance_analysis": {
    "overall_grade": "B+",
    "efficiency_score": 0.80,
    "performance_percentile": 75,
    "compared_to_baseline": "+12%",
    "bottlenecks_identified": [
      {
        "bottleneck_type": "memory_allocation",
        "impact": "medium",
        "recommendation": "考虑增加内存分配以提高处理速度"
      }
    ],
    "optimization_opportunities": [
      "优化数据访问模式以减少I/O开销",
      "实施更高效的缓存策略",
      "考虑并行处理以提高吞吐量"
    ]
  },
  
  "trace_summary": {
    "total_spans": 15,
    "total_events": 8,
    "total_links": 3,
    "error_count": 0,
    "warning_count": 1,
    "sampling_rate": 1.0
  }
}
```

### **2. 性能指标消息**

#### **实时指标数据**
```json
{
  "message_type": "performance_metrics",
  "version": "1.0.0-alpha",
  "timestamp": "2025-09-03T10:01:45.000Z",
  "trace_id": "trace-001",
  "span_id": "span-001",
  "metric_source": "real_time_collector",
  
  "system_metrics": {
    "cpu": {
      "usage_percent": 68,
      "cores_allocated": 2,
      "cores_used": 1.36,
      "efficiency": 0.68,
      "load_average": [1.2, 1.1, 0.9],
      "context_switches_per_sec": 1500
    },
    "memory": {
      "usage_mb": 2560,
      "allocated_mb": 4096,
      "usage_percent": 62.5,
      "peak_usage_mb": 2800,
      "gc_collections": 3,
      "gc_time_ms": 45
    },
    "network": {
      "inbound_mbps": 8.5,
      "outbound_mbps": 4.2,
      "total_transferred_mb": 125,
      "latency_ms": 12,
      "packet_loss_rate": 0.001,
      "connection_count": 15
    },
    "storage": {
      "read_mbps": 25.3,
      "write_mbps": 12.7,
      "iops": 850,
      "queue_depth": 3,
      "utilization_percent": 45
    }
  },
  
  "application_metrics": {
    "request_metrics": {
      "requests_per_second": 125,
      "response_time_p50_ms": 150,
      "response_time_p95_ms": 450,
      "response_time_p99_ms": 800,
      "error_rate_percent": 0.5
    },
    "business_metrics": {
      "active_workflows": 25,
      "completed_workflows": 150,
      "approval_rate": 0.92,
      "processing_efficiency": 0.88
    },
    "resource_metrics": {
      "database_connections": 8,
      "cache_hit_rate": 0.85,
      "queue_size": 12,
      "thread_pool_utilization": 0.65
    }
  },
  
  "custom_metrics": {
    "domain_specific": {
      "workflow_complexity_score": 7.5,
      "data_quality_index": 0.94,
      "user_satisfaction_score": 4.2,
      "compliance_score": 0.98
    }
  },
  
  "metadata": {
    "collection_method": "push",
    "collection_interval_ms": 1000,
    "aggregation_window_ms": 60000,
    "data_retention_hours": 168
  }
}
```

### **3. 异常检测消息**

#### **异常检测结果**
```json
{
  "message_type": "anomaly_detection_result",
  "version": "1.0.0-alpha",
  "timestamp": "2025-09-03T10:02:30.000Z",
  "trace_id": "trace-001",
  "detection_id": "anomaly-001",
  
  "anomaly_info": {
    "anomaly_type": "performance_degradation",
    "severity": "medium",
    "confidence": 0.87,
    "detection_method": "isolation_forest",
    "detection_time": "2025-09-03T10:02:15.000Z"
  },
  
  "affected_metric": {
    "metric_name": "memory_usage",
    "metric_type": "gauge",
    "current_value": 3200,
    "expected_value": 2000,
    "deviation_percent": 60,
    "threshold_exceeded": true
  },
  
  "context": {
    "service_name": "plan_module",
    "operation_name": "workflow_execution",
    "environment": "production",
    "time_window": "5m",
    "related_metrics": ["cpu_usage", "response_time"]
  },
  
  "impact_assessment": {
    "performance_impact": "medium",
    "estimated_delay_ms": 15000,
    "affected_operations": ["data_processing", "result_generation"],
    "user_impact": "moderate",
    "business_impact": "low"
  },
  
  "root_cause_analysis": {
    "probable_causes": [
      {
        "cause": "memory_leak",
        "probability": 0.65,
        "evidence": ["increasing_memory_trend", "gc_frequency_increase"]
      },
      {
        "cause": "inefficient_algorithm",
        "probability": 0.25,
        "evidence": ["cpu_memory_correlation", "processing_time_increase"]
      }
    ],
    "contributing_factors": [
      "increased_data_volume",
      "concurrent_operations"
    ]
  },
  
  "recommendations": [
    {
      "action": "investigate_memory_usage",
      "priority": "high",
      "description": "检查内存泄漏和优化内存分配",
      "estimated_effort": "2 hours"
    },
    {
      "action": "optimize_data_structures",
      "priority": "medium",
      "description": "优化数据结构以减少内存占用",
      "estimated_effort": "4 hours"
    },
    {
      "action": "increase_memory_allocation",
      "priority": "low",
      "description": "考虑增加内存分配作为临时解决方案",
      "estimated_effort": "30 minutes"
    }
  ],
  
  "historical_context": {
    "similar_anomalies": 3,
    "last_occurrence": "2025-09-01T14:30:00.000Z",
    "resolution_history": [
      {
        "resolution": "memory_optimization",
        "effectiveness": 0.85,
        "duration_hours": 6
      }
    ]
  }
}
```

---

## 🔗 相关文档

- [Trace模块概览](./README.md) - 模块概览和架构
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
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Trace模块协议规范在Alpha版本中提供企业级监控协议标准。额外的高级协议功能和扩展将在Beta版本中添加。
