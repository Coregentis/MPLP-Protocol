# MPLP Performance Protocol Schema

## 📋 **概述**

Performance协议Schema定义了MPLP系统中统一性能监控和指标管理的标准数据结构，实现全面的系统性能监控、SLA管理和智能优化建议。经过企业级功能增强，现已包含完整的性能监控、性能分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-performance.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 88.9%
**功能完整性**: ✅ 100% (基础功能 + 性能监控 + 企业级功能)
**企业级特性**: ✅ 性能监控、性能分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **性能监控**: 实时监控系统各模块的性能指标
- **SLA管理**: 服务级别协议的监控和管理
- **告警机制**: 智能的性能告警和通知系统
- **优化建议**: 基于数据分析的性能优化建议

### **性能监控功能**
- **性能监控**: 实时监控系统性能指标、瓶颈识别、优化建议
- **性能分析**: 详细的性能分析和趋势预测
- **性能状态监控**: 监控性能监控系统本身的状态和效果
- **性能审计**: 监控性能管理过程的合规性和可靠性
- **SLA监控**: 监控服务级别协议的满足情况

### **企业级功能**
- **性能管理审计**: 完整的性能管理和监控记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **版本控制**: 性能配置的版本历史、变更追踪和快照管理
- **搜索索引**: 性能数据的全文搜索、语义搜索和自动索引
- **事件集成**: 性能事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和性能事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction, Protocol-Version, Error-Handling
服务层      │ Security ← [Performance]
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `performance_id` | string | ✅ | UUID v4格式的性能记录标识符 |
| `metric_type` | string | ✅ | 指标类型枚举值 |
| `module_name` | string | ✅ | 模块名称 |
| `metrics` | array | ✅ | 性能指标列表 |
| `sla_status` | string | ✅ | SLA状态枚举值 |

### **指标类型枚举**
```json
{
  "metric_type": {
    "enum": [
      "counter",    // 计数器指标
      "gauge",      // 仪表盘指标
      "histogram",  // 直方图指标
      "summary",    // 摘要指标
      "timer"       // 计时器指标
    ]
  }
}
```

### **告警级别枚举**
```json
{
  "alert_level": {
    "enum": [
      "info",       // 信息级别
      "warning",    // 警告级别
      "error",      // 错误级别
      "critical",   // 关键级别
      "emergency"   // 紧急级别
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "performance_id": "550e8400-e29b-41d4-a716-446655440000",
  "metric_type": "timer",
  "module_name": "context",
  "operation_name": "createContext",
  "created_at": "2025-08-13T10:30:00.000Z",
  "metrics": [
    {
      "metric_id": "550e8400-e29b-41d4-a716-446655440001",
      "metric_name": "response_time",
      "metric_type": "timer",
      "metric_value": 125.5,
      "metric_unit": "ms",
      "dimensions": {
        "environment": "production",
        "region": "us-west-2",
        "instance_id": "instance-001",
        "version": "1.2.1",
        "operation": "createContext",
        "endpoint": "/api/v1/contexts"
      },
      "timestamp": "2025-08-13T10:30:00.000Z",
      "tags": {
        "team": "platform",
        "service": "context_service",
        "criticality": "high"
      },
      "sla_threshold": {
        "warning_threshold": 100,
        "critical_threshold": 200,
        "target_value": 50,
        "comparison_operator": "<="
      }
    },
    {
      "metric_id": "550e8400-e29b-41d4-a716-446655440002",
      "metric_name": "memory_usage",
      "metric_type": "gauge",
      "metric_value": 75.2,
      "metric_unit": "percent",
      "dimensions": {
        "environment": "production",
        "region": "us-west-2",
        "instance_id": "instance-001",
        "version": "1.2.1"
      },
      "timestamp": "2025-08-13T10:30:00.000Z",
      "sla_threshold": {
        "warning_threshold": 80,
        "critical_threshold": 90,
        "target_value": 70,
        "comparison_operator": "<="
      }
    }
  ],
  "sla_status": "met",
  "performance_summary": {
    "total_requests": 1250,
    "successful_requests": 1235,
    "failed_requests": 15,
    "success_rate": 98.8,
    "average_response_time": 125.5,
    "p95_response_time": 180.2,
    "p99_response_time": 245.8,
    "throughput_per_second": 42.3,
    "error_rate": 1.2
  },
  "resource_utilization": {
    "cpu_usage_percent": 45.2,
    "memory_usage_percent": 75.2,
    "disk_usage_percent": 35.8,
    "network_io_mbps": 12.5,
    "active_connections": 150,
    "thread_pool_utilization": 60.3
  },
  "alerts": [
    {
      "alert_id": "550e8400-e29b-41d4-a716-446655440003",
      "alert_level": "warning",
      "alert_message": "Memory usage approaching threshold",
      "metric_name": "memory_usage",
      "current_value": 75.2,
      "threshold_value": 80,
      "triggered_at": "2025-08-13T10:30:00.000Z",
      "resolved_at": null,
      "notification_sent": true,
      "escalation_required": false
    }
  ],
  "optimization_recommendations": [
    {
      "recommendation_id": "550e8400-e29b-41d4-a716-446655440004",
      "category": "memory_optimization",
      "priority": "medium",
      "description": "Consider implementing memory pooling for frequent object allocations",
      "estimated_impact": {
        "performance_improvement": "15-20%",
        "resource_savings": "10-15% memory reduction"
      },
      "implementation_effort": "medium",
      "suggested_actions": [
        "Implement object pooling for Context objects",
        "Optimize garbage collection settings",
        "Review memory leak patterns"
      ]
    }
  ],
  "benchmarks": {
    "baseline_metrics": {
      "response_time_baseline": 100.0,
      "throughput_baseline": 40.0,
      "error_rate_baseline": 0.5
    },
    "performance_trend": {
      "trend_direction": "improving",
      "trend_percentage": 5.2,
      "trend_period_days": 7
    },
    "comparison_data": {
      "previous_period": {
        "average_response_time": 132.1,
        "success_rate": 98.2,
        "throughput_per_second": 39.8
      },
      "improvement_percentage": {
        "response_time": 5.0,
        "success_rate": 0.6,
        "throughput": 6.3
      }
    }
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface PerformanceData {
  protocolVersion: string;
  timestamp: string;
  performanceId: string;
  metricType: MetricType;
  moduleName: ModuleType;
  operationName: string;
  createdAt: string;
  metrics: Array<{
    metricId: string;
    metricName: string;
    metricType: MetricType;
    metricValue: number;
    metricUnit: MetricUnit;
    dimensions: {
      environment: 'development' | 'testing' | 'staging' | 'production';
      region: string;
      instanceId: string;
      version: string;
      operation?: string;
      endpoint?: string;
    };
    timestamp: string;
    tags: Record<string, string>;
    slaThreshold: {
      warningThreshold: number;
      criticalThreshold: number;
      targetValue: number;
      comparisonOperator: '<' | '<=' | '>' | '>=' | '==' | '!=';
    };
  }>;
  slaStatus: SlaStatus;
  performanceSummary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughputPerSecond: number;
    errorRate: number;
  };
  resourceUtilization: {
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
    networkIoMbps: number;
    activeConnections: number;
    threadPoolUtilization: number;
  };
  alerts: Array<{
    alertId: string;
    alertLevel: AlertLevel;
    alertMessage: string;
    metricName: string;
    currentValue: number;
    thresholdValue: number;
    triggeredAt: string;
    resolvedAt?: string;
    notificationSent: boolean;
    escalationRequired: boolean;
  }>;
  optimizationRecommendations: Array<{
    recommendationId: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    estimatedImpact: {
      performanceImprovement: string;
      resourceSavings: string;
    };
    implementationEffort: 'low' | 'medium' | 'high';
    suggestedActions: string[];
  }>;
  benchmarks: {
    baselineMetrics: {
      responseTimeBaseline: number;
      throughputBaseline: number;
      errorRateBaseline: number;
    };
    performanceTrend: {
      trendDirection: 'improving' | 'stable' | 'degrading';
      trendPercentage: number;
      trendPeriodDays: number;
    };
    comparisonData: {
      previousPeriod: {
        averageResponseTime: number;
        successRate: number;
        throughputPerSecond: number;
      };
      improvementPercentage: {
        responseTime: number;
        successRate: number;
        throughput: number;
      };
    };
  };
}

type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary' | 'timer';
type MetricUnit = 'ms' | 'seconds' | 'minutes' | 'hours' | 'bytes' | 'kb' | 'mb' | 'gb' | 'count' | 'percent' | 'rate' | 'tps' | 'qps';
type SlaStatus = 'met' | 'at_risk' | 'violated' | 'unknown';
type AlertLevel = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
type ModuleType = 'core' | 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network';
```

### **Mapper实现**
```typescript
export class PerformanceMapper {
  static toSchema(entity: PerformanceData): PerformanceSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      performance_id: entity.performanceId,
      metric_type: entity.metricType,
      module_name: entity.moduleName,
      operation_name: entity.operationName,
      created_at: entity.createdAt,
      metrics: entity.metrics.map(metric => ({
        metric_id: metric.metricId,
        metric_name: metric.metricName,
        metric_type: metric.metricType,
        metric_value: metric.metricValue,
        metric_unit: metric.metricUnit,
        dimensions: {
          environment: metric.dimensions.environment,
          region: metric.dimensions.region,
          instance_id: metric.dimensions.instanceId,
          version: metric.dimensions.version,
          operation: metric.dimensions.operation,
          endpoint: metric.dimensions.endpoint
        },
        timestamp: metric.timestamp,
        tags: metric.tags,
        sla_threshold: {
          warning_threshold: metric.slaThreshold.warningThreshold,
          critical_threshold: metric.slaThreshold.criticalThreshold,
          target_value: metric.slaThreshold.targetValue,
          comparison_operator: metric.slaThreshold.comparisonOperator
        }
      })),
      sla_status: entity.slaStatus,
      performance_summary: {
        total_requests: entity.performanceSummary.totalRequests,
        successful_requests: entity.performanceSummary.successfulRequests,
        failed_requests: entity.performanceSummary.failedRequests,
        success_rate: entity.performanceSummary.successRate,
        average_response_time: entity.performanceSummary.averageResponseTime,
        p95_response_time: entity.performanceSummary.p95ResponseTime,
        p99_response_time: entity.performanceSummary.p99ResponseTime,
        throughput_per_second: entity.performanceSummary.throughputPerSecond,
        error_rate: entity.performanceSummary.errorRate
      },
      resource_utilization: {
        cpu_usage_percent: entity.resourceUtilization.cpuUsagePercent,
        memory_usage_percent: entity.resourceUtilization.memoryUsagePercent,
        disk_usage_percent: entity.resourceUtilization.diskUsagePercent,
        network_io_mbps: entity.resourceUtilization.networkIoMbps,
        active_connections: entity.resourceUtilization.activeConnections,
        thread_pool_utilization: entity.resourceUtilization.threadPoolUtilization
      },
      alerts: entity.alerts.map(alert => ({
        alert_id: alert.alertId,
        alert_level: alert.alertLevel,
        alert_message: alert.alertMessage,
        metric_name: alert.metricName,
        current_value: alert.currentValue,
        threshold_value: alert.thresholdValue,
        triggered_at: alert.triggeredAt,
        resolved_at: alert.resolvedAt,
        notification_sent: alert.notificationSent,
        escalation_required: alert.escalationRequired
      })),
      optimization_recommendations: entity.optimizationRecommendations.map(rec => ({
        recommendation_id: rec.recommendationId,
        category: rec.category,
        priority: rec.priority,
        description: rec.description,
        estimated_impact: {
          performance_improvement: rec.estimatedImpact.performanceImprovement,
          resource_savings: rec.estimatedImpact.resourceSavings
        },
        implementation_effort: rec.implementationEffort,
        suggested_actions: rec.suggestedActions
      })),
      benchmarks: {
        baseline_metrics: {
          response_time_baseline: entity.benchmarks.baselineMetrics.responseTimeBaseline,
          throughput_baseline: entity.benchmarks.baselineMetrics.throughputBaseline,
          error_rate_baseline: entity.benchmarks.baselineMetrics.errorRateBaseline
        },
        performance_trend: {
          trend_direction: entity.benchmarks.performanceTrend.trendDirection,
          trend_percentage: entity.benchmarks.performanceTrend.trendPercentage,
          trend_period_days: entity.benchmarks.performanceTrend.trendPeriodDays
        },
        comparison_data: {
          previous_period: {
            average_response_time: entity.benchmarks.comparisonData.previousPeriod.averageResponseTime,
            success_rate: entity.benchmarks.comparisonData.previousPeriod.successRate,
            throughput_per_second: entity.benchmarks.comparisonData.previousPeriod.throughputPerSecond
          },
          improvement_percentage: {
            response_time: entity.benchmarks.comparisonData.improvementPercentage.responseTime,
            success_rate: entity.benchmarks.comparisonData.improvementPercentage.successRate,
            throughput: entity.benchmarks.comparisonData.improvementPercentage.throughput
          }
        }
      }
    };
  }

  static fromSchema(schema: PerformanceSchema): PerformanceData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      performanceId: schema.performance_id,
      metricType: schema.metric_type,
      moduleName: schema.module_name,
      operationName: schema.operation_name,
      createdAt: schema.created_at,
      metrics: schema.metrics.map(metric => ({
        metricId: metric.metric_id,
        metricName: metric.metric_name,
        metricType: metric.metric_type,
        metricValue: metric.metric_value,
        metricUnit: metric.metric_unit,
        dimensions: {
          environment: metric.dimensions.environment,
          region: metric.dimensions.region,
          instanceId: metric.dimensions.instance_id,
          version: metric.dimensions.version,
          operation: metric.dimensions.operation,
          endpoint: metric.dimensions.endpoint
        },
        timestamp: metric.timestamp,
        tags: metric.tags,
        slaThreshold: {
          warningThreshold: metric.sla_threshold.warning_threshold,
          criticalThreshold: metric.sla_threshold.critical_threshold,
          targetValue: metric.sla_threshold.target_value,
          comparisonOperator: metric.sla_threshold.comparison_operator
        }
      })),
      slaStatus: schema.sla_status,
      performanceSummary: {
        totalRequests: schema.performance_summary.total_requests,
        successfulRequests: schema.performance_summary.successful_requests,
        failedRequests: schema.performance_summary.failed_requests,
        successRate: schema.performance_summary.success_rate,
        averageResponseTime: schema.performance_summary.average_response_time,
        p95ResponseTime: schema.performance_summary.p95_response_time,
        p99ResponseTime: schema.performance_summary.p99_response_time,
        throughputPerSecond: schema.performance_summary.throughput_per_second,
        errorRate: schema.performance_summary.error_rate
      },
      resourceUtilization: {
        cpuUsagePercent: schema.resource_utilization.cpu_usage_percent,
        memoryUsagePercent: schema.resource_utilization.memory_usage_percent,
        diskUsagePercent: schema.resource_utilization.disk_usage_percent,
        networkIoMbps: schema.resource_utilization.network_io_mbps,
        activeConnections: schema.resource_utilization.active_connections,
        threadPoolUtilization: schema.resource_utilization.thread_pool_utilization
      },
      alerts: schema.alerts.map(alert => ({
        alertId: alert.alert_id,
        alertLevel: alert.alert_level,
        alertMessage: alert.alert_message,
        metricName: alert.metric_name,
        currentValue: alert.current_value,
        thresholdValue: alert.threshold_value,
        triggeredAt: alert.triggered_at,
        resolvedAt: alert.resolved_at,
        notificationSent: alert.notification_sent,
        escalationRequired: alert.escalation_required
      })),
      optimizationRecommendations: schema.optimization_recommendations.map(rec => ({
        recommendationId: rec.recommendation_id,
        category: rec.category,
        priority: rec.priority,
        description: rec.description,
        estimatedImpact: {
          performanceImprovement: rec.estimated_impact.performance_improvement,
          resourceSavings: rec.estimated_impact.resource_savings
        },
        implementationEffort: rec.implementation_effort,
        suggestedActions: rec.suggested_actions
      })),
      benchmarks: {
        baselineMetrics: {
          responseTimeBaseline: schema.benchmarks.baseline_metrics.response_time_baseline,
          throughputBaseline: schema.benchmarks.baseline_metrics.throughput_baseline,
          errorRateBaseline: schema.benchmarks.baseline_metrics.error_rate_baseline
        },
        performanceTrend: {
          trendDirection: schema.benchmarks.performance_trend.trend_direction,
          trendPercentage: schema.benchmarks.performance_trend.trend_percentage,
          trendPeriodDays: schema.benchmarks.performance_trend.trend_period_days
        },
        comparisonData: {
          previousPeriod: {
            averageResponseTime: schema.benchmarks.comparison_data.previous_period.average_response_time,
            successRate: schema.benchmarks.comparison_data.previous_period.success_rate,
            throughputPerSecond: schema.benchmarks.comparison_data.previous_period.throughput_per_second
          },
          improvementPercentage: {
            responseTime: schema.benchmarks.comparison_data.improvement_percentage.response_time,
            successRate: schema.benchmarks.comparison_data.improvement_percentage.success_rate,
            throughput: schema.benchmarks.comparison_data.improvement_percentage.throughput
          }
        }
      }
    };
  }

  static validateSchema(data: unknown): data is PerformanceSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.performance_id === 'string' &&
      typeof obj.metric_type === 'string' &&
      Array.isArray(obj.metrics) &&
      // 验证不存在camelCase字段
      !('performanceId' in obj) &&
      !('protocolVersion' in obj) &&
      !('metricType' in obj)
    );
  }
}
```

---

**维护团队**: MPLP Performance团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
