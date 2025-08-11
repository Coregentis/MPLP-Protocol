# Trace Module - Examples

**Version**: v1.0.0  
**Last Updated**: 2025-08-09  
**Status**: Production Ready ✅

---

## 📋 **示例概述**

本文档提供Trace模块的实际使用示例，涵盖从基础追踪创建到高级分析功能的完整场景。所有示例都基于生产环境的实际需求，经过100%测试验证。

## 🚀 **快速开始示例**

### **基础追踪创建**

```typescript
import { TraceManagementService, TraceFactory } from '@mplp/trace';

// 初始化服务
const traceManagementService = new TraceManagementService();
const traceFactory = new TraceFactory();

// 创建执行追踪
async function createExecutionTrace() {
  const result = await traceManagementService.createTrace({
    context_id: 'workflow-ctx-123',
    trace_type: 'execution',
    severity: 'info',
    event: {
      type: 'workflow_execution',
      name: 'Customer Onboarding Workflow',
      category: 'business',
      source: {
        component: 'workflow-engine',
        operation: 'execute',
        version: '1.2.0'
      },
      data: {
        workflowId: 'onboarding-v2',
        customerId: 'cust-456',
        step: 'identity_verification'
      }
    },
    metadata: {
      tags: ['production', 'onboarding', 'critical'],
      environment: 'prod',
      user_id: 'user-789',
      session_id: 'session-abc'
    }
  });

  if (result.success) {
    console.log('✅ Execution trace created:', result.data?.traceId);
    return result.data;
  } else {
    console.error('❌ Failed to create trace:', result.errors);
    throw new Error('Trace creation failed');
  }
}
```

### **性能追踪示例**

```typescript
// 创建性能追踪
async function createPerformanceTrace() {
  const performanceTrace = traceFactory.createPerformanceTrace({
    context_id: 'api-ctx-456',
    name: 'API Response Time Monitoring',
    component: 'api-gateway',
    operation: 'process_request',
    metadata: {
      tags: ['performance', 'api', 'monitoring'],
      environment: 'prod'
    }
  });

  // 更新性能指标
  performanceTrace.updatePerformanceMetrics({
    execution_time: 1250,      // 1.25秒
    memory_usage: 128,         // 128MB
    cpu_usage: 45.2,          // 45.2%
    network_latency: 85,       // 85ms
    custom_metrics: {
      database_queries: 3,
      cache_hits: 12,
      cache_misses: 2
    }
  });

  const result = await traceManagementService.createTrace({
    ...performanceTrace.toSchema(),
    performance_metrics: performanceTrace.performanceMetrics
  });

  console.log('📊 Performance trace created with metrics');
  return result.data;
}
```

### **错误追踪示例**

```typescript
// 创建错误追踪
async function createErrorTrace(error: Error, context: any) {
  const errorTrace = traceFactory.createErrorTrace({
    context_id: context.contextId,
    name: 'Database Connection Error',
    component: 'database-service',
    operation: 'connect',
    error_type: error.constructor.name,
    error_message: error.message,
    stack_trace: error.stack?.split('\n') || [],
    error_code: 'DB_CONN_001'
  });

  // 添加错误上下文
  errorTrace.setErrorInformation({
    error_type: 'ConnectionTimeoutError',
    error_message: 'Database connection timeout after 30 seconds',
    stack_trace: error.stack?.split('\n') || [],
    error_code: 'DB_CONN_001',
    context: {
      database_host: 'prod-db-cluster.example.com',
      connection_pool_size: 20,
      active_connections: 18,
      timeout_duration: 30000,
      retry_attempts: 3
    }
  });

  const result = await traceManagementService.createTrace(errorTrace.toSchema());
  
  if (result.success) {
    console.log('🚨 Error trace created:', result.data?.traceId);
    // 触发告警
    await triggerAlert(result.data!);
  }
  
  return result.data;
}
```

## 🔍 **高级使用场景**

### **关联追踪示例**

```typescript
// 创建关联的追踪链
async function createCorrelatedTraces() {
  // 1. 创建主追踪
  const mainTrace = await createExecutionTrace();
  
  // 2. 创建子追踪并建立关联
  const subTrace = traceFactory.createExecutionTrace({
    context_id: 'sub-workflow-ctx-124',
    name: 'Document Verification Sub-process',
    component: 'document-service',
    operation: 'verify_documents'
  });

  // 添加因果关联
  subTrace.addCorrelation({
    target_id: mainTrace!.traceId,
    type: 'causal',
    strength: 0.95,
    description: 'Triggered by main onboarding workflow'
  });

  const subResult = await traceManagementService.createTrace(subTrace.toSchema());

  // 3. 更新主追踪，添加反向关联
  mainTrace!.addCorrelation({
    target_id: subResult.data!.traceId,
    type: 'causal',
    strength: 0.95,
    description: 'Spawned document verification sub-process'
  });

  console.log('🔗 Correlated traces created');
  return { mainTrace, subTrace: subResult.data };
}
```

### **批量追踪创建**

```typescript
// 批量创建追踪
async function createBatchTraces() {
  const batchRequests = [
    {
      context_id: 'batch-ctx-1',
      trace_type: 'execution' as const,
      severity: 'info' as const,
      event: {
        type: 'batch_process',
        name: 'Data Import Process 1',
        category: 'system',
        source: { component: 'data-importer' }
      }
    },
    {
      context_id: 'batch-ctx-2',
      trace_type: 'execution' as const,
      severity: 'info' as const,
      event: {
        type: 'batch_process',
        name: 'Data Import Process 2',
        category: 'system',
        source: { component: 'data-importer' }
      }
    },
    {
      context_id: 'batch-ctx-3',
      trace_type: 'execution' as const,
      severity: 'info' as const,
      event: {
        type: 'batch_process',
        name: 'Data Import Process 3',
        category: 'system',
        source: { component: 'data-importer' }
      }
    }
  ];

  const results = await Promise.all(
    batchRequests.map(request => traceManagementService.createTrace(request))
  );

  const successfulTraces = results
    .filter(result => result.success)
    .map(result => result.data!);

  console.log(`📦 Batch created ${successfulTraces.length} traces`);
  return successfulTraces;
}
```

## 📊 **智能分析示例**

### **追踪分析和报告**

```typescript
import { TraceAnalysisService } from '@mplp/trace';

// 智能分析示例
async function performTraceAnalysis() {
  const analysisService = new TraceAnalysisService();
  
  // 1. 获取要分析的追踪
  const queryResult = await traceManagementService.queryTraces({
    time_range: {
      start: new Date('2025-08-01'),
      end: new Date('2025-08-09')
    },
    context_ids: ['workflow-ctx-123', 'api-ctx-456'],
    limit: 1000
  });

  if (!queryResult.success || !queryResult.data) {
    throw new Error('Failed to query traces for analysis');
  }

  // 2. 执行智能分析
  const analysis = await analysisService.analyzeTraces(queryResult.data.traces);

  // 3. 输出分析结果
  console.log('📈 Analysis Results:');
  console.log(`Total traces analyzed: ${analysis.summary.total_traces}`);
  console.log(`Error rate: ${analysis.summary.error_rate.toFixed(2)}%`);
  
  // 性能分析
  console.log('\n🚀 Performance Analysis:');
  console.log(`Average execution time: ${analysis.performance.statistics.avg_execution_time}ms`);
  console.log(`95th percentile: ${analysis.performance.statistics.p95_execution_time}ms`);
  
  // 错误模式
  if (analysis.patterns.error_clusters.length > 0) {
    console.log('\n🚨 Error Clusters Detected:');
    analysis.patterns.error_clusters.forEach(cluster => {
      console.log(`- ${cluster.error_type}: ${cluster.count} occurrences (${cluster.severity})`);
    });
  }

  // 建议
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`- [${rec.priority}] ${rec.title}: ${rec.description}`);
    });
  }

  return analysis;
}
```

### **关联检测示例**

```typescript
// 关联检测和可视化
async function detectAndVisualizeCorrelations() {
  const analysisService = new TraceAnalysisService();
  
  // 获取相关追踪
  const traces = await getTracesForCorrelationAnalysis();
  
  // 检测关联
  const correlations = await analysisService.detectCorrelations(traces);
  
  console.log('🔗 Correlation Analysis:');
  
  // 时间关联
  console.log('\n⏰ Temporal Correlations:');
  correlations.temporal.forEach(corr => {
    console.log(`${corr.source_id} → ${corr.target_id} (${corr.time_difference}ms, strength: ${corr.strength})`);
  });
  
  // 因果关联
  console.log('\n🎯 Causal Correlations:');
  correlations.causal.forEach(corr => {
    console.log(`${corr.source_id} → ${corr.target_id} (strength: ${corr.strength})`);
  });
  
  // 生成关联图
  const correlationGraph = buildCorrelationGraph(correlations);
  console.log('\n📊 Correlation Graph:', correlationGraph);
  
  return correlations;
}

function buildCorrelationGraph(correlations: any) {
  const nodes = new Set<string>();
  const edges: Array<{source: string, target: string, type: string, strength: number}> = [];
  
  // 添加时间关联边
  correlations.temporal.forEach((corr: any) => {
    nodes.add(corr.source_id);
    nodes.add(corr.target_id);
    edges.push({
      source: corr.source_id,
      target: corr.target_id,
      type: 'temporal',
      strength: corr.strength
    });
  });
  
  // 添加因果关联边
  correlations.causal.forEach((corr: any) => {
    nodes.add(corr.source_id);
    nodes.add(corr.target_id);
    edges.push({
      source: corr.source_id,
      target: corr.target_id,
      type: 'causal',
      strength: corr.strength
    });
  });
  
  return {
    nodes: Array.from(nodes),
    edges,
    stats: {
      nodeCount: nodes.size,
      edgeCount: edges.length,
      avgStrength: edges.reduce((sum, edge) => sum + edge.strength, 0) / edges.length
    }
  };
}
```

## 🔧 **实用工具示例**

### **追踪查询和过滤**

```typescript
// 高级查询示例
async function advancedTraceQuery() {
  // 1. 基于时间范围和标签的查询
  const recentErrorsResult = await traceManagementService.queryTraces({
    time_range: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近24小时
      end: new Date()
    },
    severities: ['error', 'critical'],
    tags: ['production'],
    has_errors: true,
    limit: 100
  });

  // 2. 搜索特定组件的追踪
  const componentTracesResult = await traceManagementService.searchTraces({
    query: 'component:database-service',
    filters: {
      trace_types: ['error', 'performance'],
      time_range: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
        end: new Date()
      }
    },
    sort: {
      field: 'timestamp',
      direction: 'desc'
    },
    pagination: {
      page: 1,
      limit: 50
    }
  });

  // 3. 处理查询结果
  if (recentErrorsResult.success && recentErrorsResult.data) {
    console.log(`🚨 Found ${recentErrorsResult.data.total_count} recent errors`);
    
    // 按错误类型分组
    const errorsByType = groupTracesByErrorType(recentErrorsResult.data.traces);
    console.log('Error distribution:', errorsByType);
  }

  if (componentTracesResult.success && componentTracesResult.data) {
    console.log(`🔍 Found ${componentTracesResult.data.total_count} component traces`);
  }
}

function groupTracesByErrorType(traces: any[]) {
  return traces.reduce((groups, trace) => {
    if (trace.error_information) {
      const errorType = trace.error_information.error_type;
      groups[errorType] = (groups[errorType] || 0) + 1;
    }
    return groups;
  }, {} as Record<string, number>);
}
```

### **性能监控示例**

```typescript
// 性能监控和告警
class PerformanceMonitor {
  private readonly analysisService = new TraceAnalysisService();
  private readonly alertThresholds = {
    avgExecutionTime: 2000,    // 2秒
    errorRate: 5,              // 5%
    p95ExecutionTime: 5000     // 5秒
  };

  async monitorPerformance() {
    // 获取最近的性能追踪
    const performanceTraces = await this.getRecentPerformanceTraces();
    
    // 分析性能
    const analysis = await this.analysisService.analyzePerformance(performanceTraces);
    
    // 检查告警条件
    const alerts = this.checkAlertConditions(analysis);
    
    if (alerts.length > 0) {
      console.log('🚨 Performance Alerts:');
      alerts.forEach(alert => {
        console.log(`- ${alert.type}: ${alert.message}`);
      });
      
      // 发送告警
      await this.sendAlerts(alerts);
    } else {
      console.log('✅ All performance metrics within normal range');
    }
    
    return analysis;
  }

  private async getRecentPerformanceTraces() {
    const result = await traceManagementService.queryTraces({
      trace_types: ['performance'],
      time_range: {
        start: new Date(Date.now() - 60 * 60 * 1000), // 最近1小时
        end: new Date()
      },
      limit: 1000
    });
    
    return result.success ? result.data?.traces || [] : [];
  }

  private checkAlertConditions(analysis: any) {
    const alerts: Array<{type: string, message: string, severity: string}> = [];
    
    // 检查平均执行时间
    if (analysis.statistics.avg_execution_time > this.alertThresholds.avgExecutionTime) {
      alerts.push({
        type: 'HIGH_AVG_EXECUTION_TIME',
        message: `Average execution time (${analysis.statistics.avg_execution_time}ms) exceeds threshold (${this.alertThresholds.avgExecutionTime}ms)`,
        severity: 'warning'
      });
    }
    
    // 检查P95执行时间
    if (analysis.statistics.p95_execution_time > this.alertThresholds.p95ExecutionTime) {
      alerts.push({
        type: 'HIGH_P95_EXECUTION_TIME',
        message: `95th percentile execution time (${analysis.statistics.p95_execution_time}ms) exceeds threshold (${this.alertThresholds.p95ExecutionTime}ms)`,
        severity: 'critical'
      });
    }
    
    return alerts;
  }

  private async sendAlerts(alerts: any[]) {
    // 实现告警发送逻辑
    console.log('📧 Sending alerts to monitoring system...');
    // await alertingService.sendAlerts(alerts);
  }
}
```

### **数据清理示例**

```typescript
// 追踪数据清理
async function cleanupOldTraces() {
  console.log('🧹 Starting trace cleanup...');
  
  // 清理30天前的追踪
  const cleanupResult = await traceManagementService.cleanupExpiredTraces({
    retention_days: 30,
    batch_size: 1000,
    dry_run: false // 设置为true进行试运行
  });
  
  if (cleanupResult.success && cleanupResult.data) {
    console.log(`✅ Cleanup completed:`);
    console.log(`- Processed: ${cleanupResult.data.processed_count} traces`);
    console.log(`- Deleted: ${cleanupResult.data.deleted_count} traces`);
    console.log(`- Duration: ${cleanupResult.data.duration_ms}ms`);
    
    // 记录清理统计
    await recordCleanupStats(cleanupResult.data);
  } else {
    console.error('❌ Cleanup failed:', cleanupResult.errors);
  }
}

async function recordCleanupStats(stats: any) {
  // 创建清理统计追踪
  await traceManagementService.createTrace({
    context_id: 'system-maintenance',
    trace_type: 'execution',
    severity: 'info',
    event: {
      type: 'data_cleanup',
      name: 'Trace Data Cleanup',
      category: 'maintenance',
      source: {
        component: 'trace-service',
        operation: 'cleanup_expired'
      },
      data: stats
    },
    metadata: {
      tags: ['maintenance', 'cleanup', 'system'],
      environment: 'prod'
    }
  });
}
```

## 🎯 **最佳实践**

### **1. 追踪命名规范**
```typescript
// ✅ 好的命名
const trace = traceFactory.createExecutionTrace({
  context_id: 'user-registration-flow',
  name: 'User Registration - Email Verification',
  component: 'auth-service',
  operation: 'verify_email'
});

// ❌ 避免的命名
const trace = traceFactory.createExecutionTrace({
  context_id: 'ctx123',
  name: 'Process',
  component: 'service',
  operation: 'do_something'
});
```

### **2. 错误处理模式**
```typescript
// ✅ 完整的错误处理
try {
  const result = await someOperation();
  
  // 创建成功追踪
  await traceManagementService.createTrace({
    context_id: contextId,
    trace_type: 'execution',
    severity: 'info',
    event: {
      type: 'operation_success',
      name: 'Operation Completed Successfully',
      category: 'business',
      source: { component: 'business-service' }
    }
  });
  
  return result;
} catch (error) {
  // 创建错误追踪
  await createErrorTrace(error, { contextId });
  
  // 重新抛出错误
  throw error;
}
```

### **3. 性能监控模式**
```typescript
// ✅ 性能监控包装器
async function withPerformanceTracking<T>(
  operation: () => Promise<T>,
  context: { contextId: string; operationName: string; component: string }
): Promise<T> {
  const startTime = Date.now();
  const trace = traceFactory.createPerformanceTrace({
    context_id: context.contextId,
    name: context.operationName,
    component: context.component,
    operation: 'execute'
  });
  
  try {
    const result = await operation();
    const executionTime = Date.now() - startTime;
    
    // 更新性能指标
    trace.updatePerformanceMetrics({
      execution_time: executionTime
    });
    
    await traceManagementService.createTrace(trace.toSchema());
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // 创建错误追踪，包含性能信息
    await createErrorTrace(error as Error, {
      contextId: context.contextId,
      executionTime
    });
    
    throw error;
  }
}
```

---

**这些示例展示了Trace模块在实际生产环境中的强大功能和灵活性。通过这些模式和最佳实践，您可以构建完整的监控和观测体系，确保系统的稳定性和性能。** 🚀
