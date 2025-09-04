# Trace Module API Reference

**Multi-Agent Protocol Lifecycle Platform - Trace Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Trace-orange.svg)](./README.md)
[![Monitoring](https://img.shields.io/badge/monitoring-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/trace/api-reference.md)

---

## 🎯 API Overview

The Trace Module provides comprehensive REST, GraphQL, and WebSocket APIs for enterprise-grade execution monitoring, performance tracking, and observability. All APIs follow MPLP protocol standards and provide advanced monitoring and analytics features.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/trace`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/trace`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API Reference

### **Trace Management Endpoints**

#### **Start Execution Trace**
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

**Response (201 Created):**
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

#### **Update Execution Trace**
```http
PUT /api/v1/trace/executions/{trace_id}/spans/{span_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "running",
  "progress_percentage": 45,
  "current_operation": "approval_processing",
  "metrics": {
    "duration_ms": 2250,
    "cpu_usage_percent": 52.3,
    "memory_usage_mb": 384,
    "network_io_kb": 256,
    "disk_io_kb": 128
  },
  "performance_indicators": {
    "throughput_ops_per_sec": 180,
    "latency_p95_ms": 150,
    "latency_p99_ms": 280,
    "error_rate_percent": 0.05,
    "success_rate_percent": 99.95
  },
  "custom_metrics": {
    "workflow_steps_completed": 5,
    "approval_requests_processed": 12,
    "notifications_sent": 25,
    "cache_hit_rate_percent": 88.2
  },
  "events": [
    {
      "event_type": "milestone_reached",
      "event_name": "approval_chain_completed",
      "timestamp": "2025-09-03T10:02:15.000Z",
      "attributes": {
        "approvals_count": 3,
        "total_processing_time_ms": 2150
      }
    }
  ],
  "logs": [
    {
      "level": "info",
      "message": "Approval chain processing completed successfully",
      "timestamp": "2025-09-03T10:02:15.000Z",
      "attributes": {
        "component": "approval_processor",
        "operation": "process_approval_chain"
      }
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "trace_id": "trace-001",
  "span_id": "span-001",
  "status": "running",
  "progress_percentage": 45,
  "updated_at": "2025-09-03T10:02:30.000Z",
  "current_metrics": {
    "duration_ms": 2250,
    "cpu_usage_percent": 52.3,
    "memory_usage_mb": 384,
    "performance_score": 0.92
  },
  "anomaly_detection": {
    "anomalies_detected": 0,
    "performance_status": "normal",
    "recommendations": []
  },
  "alerts_triggered": [],
  "next_checkpoint_ms": 500
}
```

#### **Complete Execution Trace**
```http
POST /api/v1/trace/executions/{trace_id}/spans/{span_id}/complete
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "completed",
  "result": {
    "success": true,
    "result_type": "workflow_completed",
    "output": {
      "workflow_id": "wf-001",
      "execution_result": "approved",
      "final_state": "completed",
      "output_artifacts": [
        {
          "artifact_type": "approval_document",
          "artifact_id": "doc-001",
          "size_bytes": 2048
        }
      ]
    }
  },
  "final_metrics": {
    "total_duration_ms": 4500,
    "peak_cpu_usage_percent": 65.8,
    "peak_memory_usage_mb": 512,
    "total_network_io_kb": 1024,
    "total_disk_io_kb": 512
  },
  "performance_summary": {
    "avg_throughput_ops_per_sec": 165,
    "avg_latency_ms": 125,
    "total_operations": 742,
    "successful_operations": 741,
    "failed_operations": 1,
    "overall_success_rate": 99.87
  },
  "resource_utilization": {
    "cpu_efficiency": 0.85,
    "memory_efficiency": 0.78,
    "network_efficiency": 0.92,
    "storage_efficiency": 0.88
  }
}
```

**Response (200 OK):**
```json
{
  "trace_id": "trace-001",
  "span_id": "span-001",
  "status": "completed",
  "completion_time": "2025-09-03T10:04:30.000Z",
  "total_duration_ms": 4500,
  "execution_summary": {
    "result": "success",
    "performance_grade": "A",
    "efficiency_score": 0.86,
    "anomalies_detected": 0,
    "alerts_triggered": 0
  },
  "trace_analysis": {
    "bottlenecks_identified": [],
    "optimization_opportunities": [
      {
        "type": "caching_improvement",
        "description": "Increase cache hit rate for approval lookups",
        "potential_improvement": "15% latency reduction"
      }
    ],
    "performance_comparison": {
      "vs_baseline": "+12% faster",
      "vs_similar_executions": "+8% faster"
    }
  },
  "archival_info": {
    "archived": true,
    "archive_location": "s3://mplp-traces/2025/09/03/trace-001",
    "retention_period": "90_days",
    "compliance_tags": ["sox", "audit_trail"]
  }
}
```

### **Metrics and Analytics Endpoints**

#### **Get Performance Metrics**
```http
GET /api/v1/trace/metrics?trace_id=trace-001&time_range=1h&granularity=1m
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "trace_id": "trace-001",
  "time_range": {
    "start": "2025-09-03T09:00:00.000Z",
    "end": "2025-09-03T10:00:00.000Z",
    "granularity": "1m"
  },
  "metrics": [
    {
      "timestamp": "2025-09-03T10:00:00.000Z",
      "system_metrics": {
        "cpu_usage_percent": 45.2,
        "memory_usage_mb": 256,
        "network_io_kbps": 128,
        "disk_io_kbps": 64
      },
      "application_metrics": {
        "throughput_ops_per_sec": 150,
        "latency_p50_ms": 85,
        "latency_p95_ms": 200,
        "latency_p99_ms": 350,
        "error_rate_percent": 0.1
      },
      "custom_metrics": {
        "workflow_steps_per_minute": 12,
        "approval_processing_rate": 8,
        "notification_delivery_rate": 25,
        "cache_hit_rate_percent": 85.5
      }
    }
  ],
  "aggregated_metrics": {
    "avg_cpu_usage_percent": 47.8,
    "avg_memory_usage_mb": 278,
    "avg_latency_ms": 125,
    "total_operations": 9000,
    "total_errors": 9,
    "overall_success_rate": 99.9
  },
  "performance_trends": {
    "cpu_trend": "stable",
    "memory_trend": "increasing_slowly",
    "latency_trend": "improving",
    "throughput_trend": "stable"
  }
}
```

#### **Get Anomaly Detection Results**
```http
GET /api/v1/trace/anomalies?trace_id=trace-001&severity=medium,high
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "trace_id": "trace-001",
  "anomaly_detection_results": [
    {
      "anomaly_id": "anom-001",
      "detected_at": "2025-09-03T10:15:30.000Z",
      "anomaly_type": "performance_degradation",
      "severity": "medium",
      "confidence": 0.87,
      "affected_metrics": ["latency_p95", "throughput"],
      "description": "Latency increased by 35% compared to baseline",
      "root_cause_analysis": {
        "primary_cause": "database_connection_pool_exhaustion",
        "contributing_factors": [
          "increased_concurrent_requests",
          "slow_query_execution"
        ],
        "evidence": {
          "connection_pool_utilization": 0.95,
          "avg_query_time_ms": 450,
          "concurrent_requests": 85
        }
      },
      "impact_assessment": {
        "affected_operations": 156,
        "performance_degradation_percent": 35,
        "user_experience_impact": "moderate",
        "business_impact": "low"
      },
      "recommendations": [
        {
          "recommendation": "increase_connection_pool_size",
          "priority": "high",
          "estimated_effort": "low",
          "expected_improvement": "25% latency reduction"
        },
        {
          "recommendation": "optimize_slow_queries",
          "priority": "medium",
          "estimated_effort": "medium",
          "expected_improvement": "15% latency reduction"
        }
      ],
      "auto_remediation": {
        "available": true,
        "actions": [
          "scale_connection_pool",
          "enable_query_caching"
        ],
        "estimated_resolution_time": "5_minutes"
      }
    }
  ],
  "anomaly_summary": {
    "total_anomalies": 1,
    "by_severity": {
      "low": 0,
      "medium": 1,
      "high": 0,
      "critical": 0
    },
    "by_type": {
      "performance_degradation": 1,
      "resource_exhaustion": 0,
      "error_spike": 0,
      "unusual_pattern": 0
    },
    "resolution_status": {
      "resolved": 0,
      "in_progress": 1,
      "pending": 0
    }
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type ExecutionTrace {
  traceId: ID!
  spanId: ID!
  operationName: String!
  serviceName: String!
  status: TraceStatus!
  startTime: DateTime!
  endTime: DateTime
  duration: Int
  parentSpanId: ID
  context: TraceContext!
  tags: [TraceTag!]!
  metrics: PerformanceMetrics
  events: [TraceEvent!]!
  logs: [TraceLog!]!
  children: [ExecutionTrace!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PerformanceMetrics {
  timestamp: DateTime!
  systemMetrics: SystemMetrics!
  applicationMetrics: ApplicationMetrics!
  customMetrics: JSON
  performanceScore: Float!
  anomalyScore: Float
}

type SystemMetrics {
  cpuUsagePercent: Float!
  memoryUsageMb: Float!
  networkIoKbps: Float!
  diskIoKbps: Float!
  activeConnections: Int!
}

type ApplicationMetrics {
  throughputOpsPerSec: Float!
  latencyP50Ms: Float!
  latencyP95Ms: Float!
  latencyP99Ms: Float!
  errorRatePercent: Float!
  successRatePercent: Float!
}

type AnomalyDetection {
  anomalyId: ID!
  traceId: ID!
  detectedAt: DateTime!
  anomalyType: AnomalyType!
  severity: Severity!
  confidence: Float!
  affectedMetrics: [String!]!
  description: String!
  rootCauseAnalysis: RootCauseAnalysis
  recommendations: [Recommendation!]!
  status: AnomalyStatus!
}

enum TraceStatus {
  ACTIVE
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
  ARCHIVED
}

enum AnomalyType {
  PERFORMANCE_DEGRADATION
  RESOURCE_EXHAUSTION
  ERROR_SPIKE
  UNUSUAL_PATTERN
  SECURITY_ANOMALY
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### **Query Operations**

#### **Get Execution Trace Details**
```graphql
query GetExecutionTrace($traceId: ID!) {
  executionTrace(traceId: $traceId) {
    traceId
    spanId
    operationName
    serviceName
    status
    startTime
    endTime
    duration
    context {
      contextId
      userId
      sessionId
      correlationId
    }
    metrics {
      timestamp
      systemMetrics {
        cpuUsagePercent
        memoryUsageMb
        networkIoKbps
        diskIoKbps
      }
      applicationMetrics {
        throughputOpsPerSec
        latencyP95Ms
        errorRatePercent
        successRatePercent
      }
      performanceScore
      anomalyScore
    }
    events {
      eventType
      eventName
      timestamp
      attributes
    }
    children {
      spanId
      operationName
      status
      duration
    }
  }
}
```

#### **Get Performance Analytics**
```graphql
query GetPerformanceAnalytics(
  $traceId: ID
  $timeRange: TimeRange!
  $granularity: Granularity!
  $metrics: [MetricType!]!
) {
  performanceAnalytics(
    traceId: $traceId
    timeRange: $timeRange
    granularity: $granularity
    metrics: $metrics
  ) {
    timeRange {
      start
      end
      granularity
    }
    dataPoints {
      timestamp
      systemMetrics {
        cpuUsagePercent
        memoryUsageMb
      }
      applicationMetrics {
        throughputOpsPerSec
        latencyP95Ms
        errorRatePercent
      }
    }
    aggregatedMetrics {
      avgCpuUsage
      avgMemoryUsage
      avgLatency
      totalOperations
      overallSuccessRate
    }
    trends {
      cpuTrend
      memoryTrend
      latencyTrend
      throughputTrend
    }
  }
}
```

### **Mutation Operations**

#### **Start Execution Trace**
```graphql
mutation StartExecutionTrace($input: StartTraceInput!) {
  startExecutionTrace(input: $input) {
    trace {
      traceId
      spanId
      operationName
      status
      startTime
      context {
        contextId
        correlationId
      }
      monitoring {
        metricsCollectionEnabled
        anomalyDetectionEnabled
        alertThresholds {
          durationMs
          cpuUsagePercent
          memoryUsageMb
        }
      }
    }
  }
}
```

#### **Complete Execution Trace**
```graphql
mutation CompleteExecutionTrace($input: CompleteTraceInput!) {
  completeExecutionTrace(input: $input) {
    trace {
      traceId
      spanId
      status
      completionTime
      totalDuration
      executionSummary {
        result
        performanceGrade
        efficiencyScore
        anomaliesDetected
      }
      traceAnalysis {
        bottlenecksIdentified
        optimizationOpportunities {
          type
          description
          potentialImprovement
        }
        performanceComparison {
          vsBaseline
          vsSimilarExecutions
        }
      }
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Real-time Trace Updates**

```javascript
// Subscribe to trace updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'traces.trace-001.updates'
}));

// Receive trace status updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'trace_status_updated') {
    console.log('Trace status updated:', message.data);
  }
};
```

### **Real-time Performance Metrics**

```javascript
// Subscribe to performance metrics
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'metrics.trace-001.realtime'
}));

// Receive real-time metrics
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'metrics_updated') {
    console.log('New metrics:', message.data);
  }
};
```

### **Real-time Anomaly Alerts**

```javascript
// Subscribe to anomaly alerts
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-003',
  channel: 'anomalies.alerts'
}));

// Receive anomaly alerts
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'anomaly_detected') {
    console.log('Anomaly detected:', message.data);
  }
};
```

---

## 🔗 Related Documentation

- [Trace Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**API Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Enterprise Ready  

**⚠️ Alpha Notice**: The Trace Module API provides enterprise-grade monitoring and observability capabilities in Alpha release. Additional AI-powered analytics and advanced anomaly detection features will be added in Beta release while maintaining backward compatibility.
