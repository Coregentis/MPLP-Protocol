# Trace模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/trace/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Trace模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![监控](https://img.shields.io/badge/monitoring-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/trace/integration-examples.md)

---

## 🎯 集成概览

本文档提供Trace模块的全面集成示例，展示真实世界的企业监控场景、跨模块可观测性集成模式，以及使用MPLP Trace模块构建综合监控系统的最佳实践。

### **集成场景**
- **企业可观测性平台**: 具有分布式追踪的完整监控系统
- **多租户监控系统**: 可扩展的多组织可观测性
- **跨模块集成**: 与Context、Plan和Confirm模块的集成
- **实时分析平台**: 高性能指标处理和告警
- **AI驱动监控**: 机器学习增强的异常检测
- **合规监控**: 监管合规和审计跟踪管理

---

## 🚀 基础集成示例

### **1. 企业可观测性平台**

#### **Express.js与综合监控**
```typescript
import express from 'express';
import { TraceModule } from '@mplp/trace';
import { DistributedTracingService } from '@mplp/trace/services';
import { MonitoringMiddleware } from '@mplp/trace/middleware';
import { trace, context, SpanKind } from '@opentelemetry/api';

// 初始化Express应用
const app = express();
app.use(express.json());

// 使用企业功能初始化Trace模块
const traceModule = new TraceModule({
  opentelemetry: {
    service: {
      name: 'mplp-enterprise-api',
      version: '1.0.0-alpha',
      namespace: 'mplp',
      environment: process.env.NODE_ENV || 'production'
    },
    tracing: {
      enabled: true,
      samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      exporters: {
        otlp: {
          enabled: true,
          endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
          headers: {
            'Authorization': `Bearer ${process.env.OTEL_AUTH_TOKEN}`
          }
        },
        jaeger: {
          enabled: true,
          endpoint: process.env.JAEGER_ENDPOINT
        }
      }
    },
    metrics: {
      enabled: true,
      exporters: {
        prometheus: {
          enabled: true,
          endpoint: '/metrics',
          port: 9090
        },
        otlp: {
          enabled: true,
          endpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
        }
      }
    }
  },
  anomalyDetection: {
    enabled: true,
    aiModel: {
      modelType: 'isolation_forest',
      confidenceThreshold: 0.8
    }
  },
  alerting: {
    enabled: true,
    notifications: {
      slack: {
        enabled: true,
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: '#monitoring'
      },
      email: {
        enabled: true,
        smtpServer: process.env.SMTP_SERVER,
        fromAddress: 'monitoring@mplp.dev'
      }
    }
  }
});

// 初始化分布式追踪服务
const tracingService = new DistributedTracingService(traceModule);

// 配置监控中间件
const monitoringMiddleware = new MonitoringMiddleware({
  tracingService,
  enableDetailedMetrics: true,
  enableAnomalyDetection: true,
  enablePerformanceAnalysis: true
});

// 应用监控中间件
app.use(monitoringMiddleware.traceRequests());
app.use(monitoringMiddleware.collectMetrics());
app.use(monitoringMiddleware.detectAnomalies());

// 企业级工作流执行端点
app.post('/api/v1/workflows/execute', async (req, res) => {
  const tracer = trace.getTracer('workflow-service');
  
  // 开始工作流追踪
  const span = tracer.startSpan('workflow_execution', {
    kind: SpanKind.SERVER,
    attributes: {
      'workflow.id': req.body.workflowId,
      'workflow.type': req.body.workflowType,
      'user.id': req.user.userId,
      'priority': req.body.priority || 'normal'
    }
  });

  try {
    // 在span上下文中执行工作流
    await context.with(trace.setSpan(context.active(), span), async () => {
      
      // 阶段1: 工作流验证
      const validationSpan = tracer.startSpan('workflow_validation', {
        parent: span,
        attributes: {
          'validation.type': 'schema_and_permissions'
        }
      });

      try {
        await validateWorkflow(req.body);
        validationSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        validationSpan.recordException(error);
        validationSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        validationSpan.end();
      }

      // 阶段2: 资源分配
      const resourceSpan = tracer.startSpan('resource_allocation', {
        parent: span,
        attributes: {
          'resource.type': 'compute_and_storage'
        }
      });

      let allocatedResources;
      try {
        allocatedResources = await allocateResources(req.body.resourceRequirements);
        resourceSpan.setAttributes({
          'resource.cpu_cores': allocatedResources.cpuCores,
          'resource.memory_mb': allocatedResources.memoryMb,
          'resource.storage_mb': allocatedResources.storageMb
        });
        resourceSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        resourceSpan.recordException(error);
        resourceSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        resourceSpan.end();
      }

      // 阶段3: 工作流执行
      const executionSpan = tracer.startSpan('workflow_execution_core', {
        parent: span,
        attributes: {
          'execution.mode': 'distributed',
          'execution.parallel_tasks': req.body.parallelTasks || 1
        }
      });

      let executionResult;
      try {
        // 记录执行开始指标
        await tracingService.recordMetric(span.spanContext().traceId, {
          metricType: 'execution_start',
          timestamp: new Date(),
          cpuUsagePercent: await getCpuUsage(),
          memoryUsageMb: await getMemoryUsage(),
          customMetrics: {
            'workflow.complexity': calculateWorkflowComplexity(req.body),
            'workflow.estimated_duration_ms': estimateExecutionTime(req.body)
          }
        });

        // 执行工作流
        executionResult = await executeWorkflow(req.body, allocatedResources);

        // 记录执行完成指标
        await tracingService.recordMetric(span.spanContext().traceId, {
          metricType: 'execution_complete',
          timestamp: new Date(),
          cpuUsagePercent: await getCpuUsage(),
          memoryUsageMb: await getMemoryUsage(),
          customMetrics: {
            'workflow.actual_duration_ms': executionResult.durationMs,
            'workflow.success_rate': executionResult.successRate,
            'workflow.processed_items': executionResult.processedItems
          }
        });

        executionSpan.setAttributes({
          'execution.success': true,
          'execution.duration_ms': executionResult.durationMs,
          'execution.processed_items': executionResult.processedItems
        });
        executionSpan.setStatus({ code: SpanStatusCode.OK });

      } catch (error) {
        executionSpan.recordException(error);
        executionSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        executionSpan.end();
      }

      // 阶段4: 结果处理和清理
      const cleanupSpan = tracer.startSpan('result_processing_and_cleanup', {
        parent: span
      });

      try {
        await processResults(executionResult);
        await releaseResources(allocatedResources);
        cleanupSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        cleanupSpan.recordException(error);
        cleanupSpan.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        // 清理错误不应该影响主要执行结果
        console.error('Cleanup error:', error);
      } finally {
        cleanupSpan.end();
      }

      return executionResult;
    });

    // 设置成功状态
    span.setAttributes({
      'workflow.status': 'completed',
      'workflow.success': true
    });
    span.setStatus({ code: SpanStatusCode.OK });

    res.status(200).json({
      success: true,
      workflowId: req.body.workflowId,
      executionId: span.spanContext().traceId,
      result: executionResult,
      tracing: {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId
      }
    });

  } catch (error) {
    // 记录错误
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });

    // 发送错误告警
    await tracingService.sendAlert({
      type: 'workflow_execution_failed',
      severity: 'critical',
      workflowId: req.body.workflowId,
      traceId: span.spanContext().traceId,
      error: error.message,
      timestamp: new Date()
    });

    res.status(500).json({
      success: false,
      error: error.message,
      tracing: {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId
      }
    });

  } finally {
    span.end();
  }
});

// 性能监控端点
app.get('/api/v1/monitoring/performance', async (req, res) => {
  try {
    const { traceId, timeRange } = req.query;
    
    // 获取性能数据
    const performanceData = await tracingService.getPerformanceData({
      traceId: traceId as string,
      timeRange: timeRange as string || '1h',
      includeAnomalies: true,
      includeRecommendations: true
    });

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 异常检测端点
app.get('/api/v1/monitoring/anomalies', async (req, res) => {
  try {
    const { severity, timeRange } = req.query;
    
    // 获取异常数据
    const anomalies = await tracingService.getAnomalies({
      severity: severity as string,
      timeRange: timeRange as string || '24h',
      includeResolved: false
    });

    res.json({
      success: true,
      anomalies: anomalies
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 健康检查端点
app.get('/health', async (req, res) => {
  const healthSpan = trace.getTracer('health-check').startSpan('health_check');
  
  try {
    const healthStatus = await tracingService.getHealthStatus();
    
    healthSpan.setAttributes({
      'health.status': healthStatus.overall,
      'health.components': Object.keys(healthStatus.components).length
    });

    res.json({
      status: healthStatus.overall,
      timestamp: new Date().toISOString(),
      components: healthStatus.components,
      tracing: {
        traceId: healthSpan.spanContext().traceId
      }
    });

  } catch (error) {
    healthSpan.recordException(error);
    healthSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });

  } finally {
    healthSpan.end();
  }
});

// 启动企业可观测性平台
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Enterprise Observability Platform running on port ${PORT}`);
  console.log('Features enabled:');
  console.log('- Distributed tracing with OpenTelemetry');
  console.log('- Real-time performance monitoring');
  console.log('- AI-powered anomaly detection');
  console.log('- Intelligent alerting system');
  console.log('- Multi-channel notifications');
  console.log('- Performance analytics and optimization');
});
```

### **2. 与Context模块的监控集成**

#### **上下文感知性能监控**
```typescript
import { TraceModule } from '@mplp/trace';
import { ContextModule } from '@mplp/context';
import { MonitoringContextIntegration } from '@mplp/trace/integrations';

// 监控上下文集成服务
const monitoringContextIntegration = new MonitoringContextIntegration({
  traceModule,
  contextModule,
  integration: {
    contextAwareMonitoring: true,
    performanceByContext: true,
    contextBasedAlerting: true,
    contextMetricsCorrelation: true
  }
});

// 上下文感知性能监控
async function monitorContextPerformance(
  contextId: string,
  operationName: string,
  operationFunction: () => Promise<any>
) {
  try {
    // 获取上下文信息
    const contextInfo = await monitoringContextIntegration.getContextInfo(contextId);
    
    // 开始上下文感知追踪
    const trace = await monitoringContextIntegration.startContextTrace({
      contextId,
      operationName,
      contextType: contextInfo.contextType,
      priority: contextInfo.priority,
      expectedPerformance: contextInfo.performanceBaseline,
      monitoringLevel: contextInfo.monitoringLevel
    });

    // 设置上下文特定的监控
    await monitoringContextIntegration.setupContextMonitoring({
      traceId: trace.traceId,
      contextId,
      monitoringRules: contextInfo.monitoringRules,
      alertThresholds: contextInfo.alertThresholds,
      performanceTargets: contextInfo.performanceTargets
    });

    // 执行操作并监控
    const startTime = Date.now();
    const result = await operationFunction();
    const duration = Date.now() - startTime;

    // 记录上下文性能指标
    await monitoringContextIntegration.recordContextMetrics({
      traceId: trace.traceId,
      contextId,
      metrics: {
        duration,
        success: true,
        contextSpecificMetrics: {
          dataProcessed: result.dataProcessed || 0,
          operationsCompleted: result.operationsCompleted || 0,
          resourcesUsed: result.resourcesUsed || {}
        }
      }
    });

    // 分析上下文性能
    const performanceAnalysis = await monitoringContextIntegration.analyzeContextPerformance({
      traceId: trace.traceId,
      contextId,
      compareWithBaseline: true,
      generateRecommendations: true
    });

    // 完成追踪
    await monitoringContextIntegration.finishContextTrace(trace.traceId, {
      success: true,
      result,
      performanceAnalysis
    });

    return {
      result,
      traceId: trace.traceId,
      performanceAnalysis
    };

  } catch (error) {
    // 记录错误和性能影响
    await monitoringContextIntegration.recordContextError({
      contextId,
      error,
      performanceImpact: {
        operationFailed: true,
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    });

    throw error;
  }
}
```

---

## 🔗 相关文档

- [Trace模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Trace模块集成示例在Alpha版本中提供企业级监控集成模式。额外的高级集成模式和监控功能将在Beta版本中添加。
