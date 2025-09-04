# Trace Module Integration Examples

**Multi-Agent Protocol Lifecycle Platform - Trace Module Integration Examples v1.0.0-alpha**

[![Integration](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![Examples](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![Monitoring](https://img.shields.io/badge/monitoring-Best%20Practices-orange.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/trace/integration-examples.md)

---

## 🎯 Integration Overview

This document provides comprehensive integration examples for the Trace Module, demonstrating real-world enterprise monitoring scenarios, cross-module observability integration patterns, and best practices for building comprehensive monitoring systems with MPLP Trace Module.

### **Integration Scenarios**
- **Enterprise Observability Platform**: Complete monitoring system with distributed tracing
- **Multi-Tenant Monitoring System**: Scalable multi-organization observability
- **Cross-Module Integration**: Integration with Context, Plan, and Confirm modules
- **Real-Time Analytics Platform**: High-performance metrics processing and alerting
- **AI-Powered Monitoring**: Machine learning-enhanced anomaly detection
- **Compliance Monitoring**: Regulatory compliance and audit trail management

---

## 🚀 Basic Integration Examples

### **1. Enterprise Observability Platform**

#### **Express.js with Comprehensive Monitoring**
```typescript
import express from 'express';
import { TraceModule } from '@mplp/trace';
import { DistributedTracingService } from '@mplp/trace/services';
import { MonitoringMiddleware } from '@mplp/trace/middleware';
import { trace, context, SpanKind } from '@opentelemetry/api';

// Initialize Express application
const app = express();
app.use(express.json());

// Initialize Trace Module with enterprise features
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
      samplingRate: 0.1, // 10% sampling in production
      exporters: {
        otlp: {
          endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
          headers: {
            authorization: `Bearer ${process.env.OTEL_AUTH_TOKEN}`
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
      exportInterval: 5000,
      exporters: {
        prometheus: {
          enabled: true,
          endpoint: '/metrics',
          port: 9090
        }
      }
    }
  },
  performanceMonitoring: {
    metricsCollection: {
      enabled: true,
      collectionInterval: 5000,
      systemMetrics: true,
      applicationMetrics: true,
      customMetrics: true
    },
    anomalyDetection: {
      enabled: true,
      aiDetection: {
        enabled: true,
        modelType: 'isolation_forest',
        confidenceThreshold: 0.8
      }
    }
  },
  alerting: {
    enabled: true,
    channels: {
      email: {
        enabled: true,
        smtpHost: process.env.SMTP_HOST,
        fromAddress: 'alerts@company.com'
      },
      slack: {
        enabled: true,
        webhookUrl: process.env.SLACK_WEBHOOK_URL
      },
      pagerduty: {
        enabled: true,
        integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY
      }
    }
  },
  storage: {
    traces: {
      backend: 'elasticsearch',
      connection: {
        hosts: [process.env.ELASTICSEARCH_HOST],
        ssl: true
      }
    },
    metrics: {
      backend: 'prometheus',
      connection: {
        url: process.env.PROMETHEUS_URL
      }
    }
  }
});

const tracingService = traceModule.getDistributedTracingService();
const monitoringMiddleware = new MonitoringMiddleware(traceModule);

// Apply monitoring middleware globally
app.use(monitoringMiddleware.traceRequests());
app.use(monitoringMiddleware.collectMetrics());
app.use(monitoringMiddleware.detectAnomalies());

// Enterprise workflow execution with comprehensive monitoring
app.post('/workflows/:workflowId/execute', async (req, res) => {
  const tracer = trace.getTracer('workflow-service');
  const span = tracer.startSpan('workflow_execution', {
    kind: SpanKind.SERVER,
    attributes: {
      'workflow.id': req.params.workflowId,
      'workflow.type': req.body.workflowType,
      'user.id': req.user?.id,
      'request.size': JSON.stringify(req.body).length
    }
  });

  try {
    // Start execution trace
    const executionTrace = await tracingService.startExecutionTrace({
      operationName: 'workflow_execution',
      serviceName: 'workflow-service',
      context: {
        contextId: req.body.contextId,
        userId: req.user?.id,
        sessionId: req.sessionID,
        correlationId: req.headers['x-correlation-id']
      },
      tags: {
        workflowId: req.params.workflowId,
        workflowType: req.body.workflowType,
        priority: req.body.priority || 'normal',
        environment: process.env.NODE_ENV
      },
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        requestSize: JSON.stringify(req.body).length
      }
    });

    // Execute workflow with monitoring
    const workflowResult = await executeWorkflowWithMonitoring({
      workflowId: req.params.workflowId,
      workflowType: req.body.workflowType,
      parameters: req.body.parameters,
      traceId: executionTrace.traceId,
      spanId: executionTrace.spanId
    });

    // Update trace with execution progress
    await tracingService.updateExecutionTrace(
      executionTrace.traceId,
      executionTrace.spanId,
      {
        status: 'running',
        progressPercentage: 50,
        currentOperation: 'step_execution',
        metrics: {
          durationMs: Date.now() - executionTrace.startTime,
          cpuUsagePercent: await getCpuUsage(),
          memoryUsageMb: await getMemoryUsage(),
          networkIoKb: await getNetworkIO(),
          diskIoKb: await getDiskIO()
        },
        performanceIndicators: {
          throughputOpsPerSec: workflowResult.throughput,
          latencyP95Ms: workflowResult.latencyP95,
          errorRatePercent: workflowResult.errorRate,
          successRatePercent: workflowResult.successRate
        },
        customMetrics: {
          workflowStepsCompleted: workflowResult.stepsCompleted,
          approvalRequestsProcessed: workflowResult.approvalsProcessed,
          notificationsSent: workflowResult.notificationsSent
        },
        events: [
          {
            eventType: 'workflow_milestone',
            eventName: 'workflow_steps_completed',
            timestamp: new Date(),
            attributes: {
              stepsCompleted: workflowResult.stepsCompleted,
              totalSteps: workflowResult.totalSteps
            }
          }
        ]
      }
    );

    // Complete execution trace
    await tracingService.completeExecutionTrace(
      executionTrace.traceId,
      executionTrace.spanId,
      {
        status: workflowResult.success ? 'completed' : 'failed',
        result: {
          success: workflowResult.success,
          resultType: workflowResult.success ? 'workflow_completed' : 'workflow_failed',
          output: workflowResult.output,
          error: workflowResult.error
        },
        finalMetrics: {
          totalDurationMs: Date.now() - executionTrace.startTime,
          peakCpuUsagePercent: workflowResult.peakCpuUsage,
          peakMemoryUsageMb: workflowResult.peakMemoryUsage,
          totalNetworkIoKb: workflowResult.totalNetworkIO,
          totalDiskIoKb: workflowResult.totalDiskIO
        },
        performanceSummary: {
          avgThroughputOpsPerSec: workflowResult.avgThroughput,
          avgLatencyMs: workflowResult.avgLatency,
          totalOperations: workflowResult.totalOperations,
          successfulOperations: workflowResult.successfulOperations,
          failedOperations: workflowResult.failedOperations,
          overallSuccessRate: workflowResult.overallSuccessRate
        },
        resourceUtilization: {
          cpuEfficiency: workflowResult.cpuEfficiency,
          memoryEfficiency: workflowResult.memoryEfficiency,
          networkEfficiency: workflowResult.networkEfficiency,
          storageEfficiency: workflowResult.storageEfficiency
        }
      }
    );

    // Set span attributes and status
    span.setAttributes({
      'workflow.result': workflowResult.success ? 'success' : 'failure',
      'workflow.duration_ms': Date.now() - executionTrace.startTime,
      'workflow.steps_completed': workflowResult.stepsCompleted,
      'workflow.operations_count': workflowResult.totalOperations,
      'workflow.success_rate': workflowResult.overallSuccessRate
    });

    span.setStatus({
      code: workflowResult.success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
      message: workflowResult.success ? 'Workflow completed successfully' : workflowResult.error?.message
    });

    res.json({
      execution_id: executionTrace.traceId,
      workflow_id: req.params.workflowId,
      status: workflowResult.success ? 'completed' : 'failed',
      result: workflowResult.output,
      performance: {
        duration_ms: Date.now() - executionTrace.startTime,
        steps_completed: workflowResult.stepsCompleted,
        success_rate: workflowResult.overallSuccessRate,
        avg_latency_ms: workflowResult.avgLatency
      },
      trace_info: {
        trace_id: executionTrace.traceId,
        span_id: executionTrace.spanId,
        trace_url: `${process.env.JAEGER_UI_URL}/trace/${executionTrace.traceId}`
      }
    });

  } catch (error) {
    // Record error in trace
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });

    // Update trace with error
    await tracingService.completeExecutionTrace(
      executionTrace.traceId,
      executionTrace.spanId,
      {
        status: 'failed',
        result: {
          success: false,
          resultType: 'workflow_error',
          error: {
            errorType: error.constructor.name,
            errorMessage: error.message,
            errorStack: error.stack
          }
        }
      }
    );

    res.status(500).json({
      error: 'Workflow execution failed',
      message: error.message,
      trace_id: executionTrace?.traceId
    });

  } finally {
    span.end();
  }
});

// Real-time monitoring dashboard endpoint
app.get('/monitoring/dashboard', async (req, res) => {
  try {
    const dashboardData = await generateMonitoringDashboard({
      timeRange: req.query.timeRange || '1h',
      services: req.query.services?.split(',') || ['all'],
      metrics: req.query.metrics?.split(',') || ['latency', 'throughput', 'errors']
    });

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate dashboard data' });
  }
});

// Performance analytics endpoint
app.get('/monitoring/analytics', async (req, res) => {
  try {
    const analytics = await generatePerformanceAnalytics({
      timeRange: req.query.timeRange || '24h',
      granularity: req.query.granularity || '5m',
      services: req.query.services?.split(','),
      operations: req.query.operations?.split(',')
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Anomaly detection results endpoint
app.get('/monitoring/anomalies', async (req, res) => {
  try {
    const anomalies = await getAnomalyDetectionResults({
      timeRange: req.query.timeRange || '24h',
      severity: req.query.severity?.split(',') || ['medium', 'high', 'critical'],
      services: req.query.services?.split(','),
      resolved: req.query.resolved === 'true'
    });

    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get anomaly results' });
  }
});

// Helper function to execute workflow with monitoring
async function executeWorkflowWithMonitoring(params: WorkflowExecutionParams): Promise<WorkflowResult> {
  const tracer = trace.getTracer('workflow-executor');
  
  return tracer.startActiveSpan('execute_workflow_steps', async (span) => {
    try {
      span.setAttributes({
        'workflow.id': params.workflowId,
        'workflow.type': params.workflowType,
        'trace.id': params.traceId
      });

      // Simulate workflow execution with monitoring
      const steps = await getWorkflowSteps(params.workflowId);
      let stepsCompleted = 0;
      let totalOperations = 0;
      let successfulOperations = 0;
      let failedOperations = 0;
      const latencies: number[] = [];

      for (const step of steps) {
        const stepSpan = tracer.startSpan(`execute_step_${step.id}`, {
          parent: span,
          attributes: {
            'step.id': step.id,
            'step.name': step.name,
            'step.type': step.type
          }
        });

        try {
          const stepStartTime = Date.now();
          const stepResult = await executeWorkflowStep(step, params.parameters);
          const stepDuration = Date.now() - stepStartTime;

          latencies.push(stepDuration);
          totalOperations++;
          
          if (stepResult.success) {
            successfulOperations++;
            stepsCompleted++;
          } else {
            failedOperations++;
          }

          stepSpan.setAttributes({
            'step.result': stepResult.success ? 'success' : 'failure',
            'step.duration_ms': stepDuration,
            'step.operations_count': stepResult.operationsCount || 1
          });

          stepSpan.setStatus({
            code: stepResult.success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
            message: stepResult.message
          });

        } catch (error) {
          failedOperations++;
          stepSpan.recordException(error);
          stepSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message
          });
          throw error;
        } finally {
          stepSpan.end();
        }
      }

      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const latencyP95 = percentile(latencies, 0.95);
      const successRate = (successfulOperations / totalOperations) * 100;

      return {
        success: failedOperations === 0,
        stepsCompleted,
        totalSteps: steps.length,
        totalOperations,
        successfulOperations,
        failedOperations,
        avgLatency,
        latencyP95,
        throughput: totalOperations / (Date.now() - params.startTime) * 1000,
        errorRate: (failedOperations / totalOperations) * 100,
        successRate,
        overallSuccessRate: successRate,
        output: {
          workflowId: params.workflowId,
          executionResult: failedOperations === 0 ? 'completed' : 'partial_failure',
          stepsCompleted,
          totalSteps: steps.length
        }
      };

    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });

      return {
        success: false,
        error: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          errorStack: error.stack
        },
        stepsCompleted: 0,
        totalSteps: 0,
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 1,
        overallSuccessRate: 0
      };
    } finally {
      span.end();
    }
  });
}

// WebSocket for real-time monitoring updates
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Client connected for real-time monitoring');

  socket.on('subscribe_metrics', (data) => {
    const { services, metrics } = data;
    
    // Subscribe to real-time metrics updates
    traceModule.subscribeToMetrics({
      services: services || ['all'],
      metrics: metrics || ['latency', 'throughput', 'errors'],
      callback: (metricsUpdate) => {
        socket.emit('metrics_update', metricsUpdate);
      }
    });
  });

  socket.on('subscribe_anomalies', (data) => {
    const { severity } = data;
    
    // Subscribe to anomaly alerts
    traceModule.subscribeToAnomalies({
      severity: severity || ['medium', 'high', 'critical'],
      callback: (anomalyAlert) => {
        socket.emit('anomaly_detected', anomalyAlert);
      }
    });
  });

  socket.on('subscribe_traces', (data) => {
    const { traceIds } = data;
    
    // Subscribe to specific trace updates
    traceModule.subscribeToTraces({
      traceIds: traceIds,
      callback: (traceUpdate) => {
        socket.emit('trace_update', traceUpdate);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from monitoring');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Enterprise Observability Platform running on port ${PORT}`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
  console.log(`Monitoring dashboard: http://localhost:${PORT}/monitoring/dashboard`);
});
```

---

## 🔗 Cross-Module Integration Examples

### **1. Trace + Context + Plan + Confirm Integration**

#### **Comprehensive Multi-Module Monitoring**
```typescript
import { TraceService } from '@mplp/trace';
import { ContextService } from '@mplp/context';
import { PlanService } from '@mplp/plan';
import { ConfirmService } from '@mplp/confirm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ComprehensiveMonitoringService {
  constructor(
    private readonly traceService: TraceService,
    private readonly contextService: ContextService,
    private readonly planService: PlanService,
    private readonly confirmService: ConfirmService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.setupCrossModuleMonitoring();
  }

  async createMonitoredWorkflowExecution(request: MonitoredWorkflowRequest): Promise<MonitoredWorkflowExecution> {
    // 1. Create monitored context with tracing enabled
    const monitoredContext = await this.contextService.createContext({
      name: `Monitored Workflow: ${request.workflowName}`,
      type: 'monitored_workflow_execution',
      configuration: {
        maxParticipants: request.maxParticipants || 50,
        monitoringEnabled: true,
        tracingEnabled: true,
        metricsCollection: 'comprehensive',
        anomalyDetection: true,
        alerting: {
          enabled: true,
          thresholds: {
            latencyP95Ms: 2000,
            errorRatePercent: 5,
            cpuUsagePercent: 80
          }
        }
      },
      metadata: {
        tags: ['workflow', 'monitored', 'enterprise'],
        category: 'workflow-execution',
        priority: request.priority || 'high',
        monitoringMetadata: {
          tracingLevel: 'detailed',
          metricsGranularity: 'high',
          alertingSensitivity: 'medium'
        }
      },
      createdBy: request.requestedBy
    });

    // 2. Start comprehensive execution trace
    const executionTrace = await this.traceService.startExecutionTrace({
      operationName: 'monitored_workflow_execution',
      serviceName: 'workflow-orchestrator',
      context: {
        contextId: monitoredContext.contextId,
        userId: request.requestedBy,
        sessionId: request.sessionId,
        correlationId: request.correlationId
      },
      tags: {
        workflowName: request.workflowName,
        workflowType: request.workflowType,
        priority: request.priority,
        environment: process.env.NODE_ENV,
        monitoringLevel: 'comprehensive'
      },
      metadata: {
        workflowVersion: request.workflowVersion,
        expectedDuration: request.expectedDurationMs,
        resourceRequirements: request.resourceRequirements,
        complianceRequirements: request.complianceRequirements
      },
      traceFlags: [
        'detailed_metrics',
        'performance_analysis',
        'anomaly_detection',
        'compliance_monitoring'
      ]
    });

    // 3. Create monitored execution plan with tracing integration
    const monitoredPlan = await this.planService.generatePlan({
      name: `${request.workflowName} - Monitored Execution Plan`,
      contextId: monitoredContext.contextId,
      objectives: [
        {
          objective: 'Execute Workflow with Comprehensive Monitoring',
          description: 'Execute workflow while collecting detailed performance metrics and monitoring for anomalies',
          priority: 'critical',
          monitoringEnabled: true,
          traceId: executionTrace.traceId,
          performanceTargets: {
            maxLatencyMs: request.performanceTargets?.maxLatencyMs || 5000,
            minThroughput: request.performanceTargets?.minThroughput || 100,
            maxErrorRate: request.performanceTargets?.maxErrorRate || 0.01
          }
        },
        ...request.workflowObjectives.map(obj => ({
          ...obj,
          monitoringEnabled: true,
          traceId: executionTrace.traceId,
          performanceTracking: {
            enabled: true,
            metricsCollection: 'detailed',
            anomalyDetection: true
          }
        }))
      ],
      planningStrategy: {
        algorithm: 'monitored_execution_planning',
        optimizationGoals: [
          'minimize_execution_time',
          'maximize_monitoring_coverage',
          'ensure_performance_targets',
          'maintain_compliance_standards'
        ],
        monitoringConstraints: {
          tracingOverhead: 'minimal',
          metricsGranularity: 'high',
          alertingLatency: 'low',
          complianceMonitoring: true
        }
      },
      executionPreferences: {
        monitoringMode: 'comprehensive',
        tracingLevel: 'detailed',
        alertingEnabled: true,
        performanceOptimization: true
      }
    });

    // 4. Set up monitored approval workflows with tracing
    const monitoredApprovals = await this.setupMonitoredApprovals({
      contextId: monitoredContext.contextId,
      planId: monitoredPlan.planId,
      traceId: executionTrace.traceId,
      workflowType: request.workflowType,
      approvalRequirements: request.approvalRequirements,
      monitoringConfiguration: {
        approvalLatencyTracking: true,
        decisionQualityMetrics: true,
        escalationMonitoring: true,
        complianceTracking: true
      }
    });

    // 5. Configure comprehensive monitoring and alerting
    const monitoringSetup = await this.setupComprehensiveMonitoring({
      contextId: monitoredContext.contextId,
      planId: monitoredPlan.planId,
      traceId: executionTrace.traceId,
      approvalIds: monitoredApprovals.map(a => a.approvalId),
      monitoringRules: {
        performanceMonitoring: {
          enabled: true,
          metricsCollection: 'comprehensive',
          anomalyDetection: 'ai_powered',
          alerting: 'intelligent'
        },
        complianceMonitoring: {
          enabled: true,
          frameworks: request.complianceRequirements || ['sox', 'gdpr'],
          auditTrail: 'complete',
          violationDetection: 'real_time'
        },
        securityMonitoring: {
          enabled: true,
          threatDetection: 'advanced',
          accessMonitoring: 'comprehensive',
          dataProtection: 'strict'
        }
      }
    });

    const monitoredExecution: MonitoredWorkflowExecution = {
      executionId: this.generateExecutionId(),
      workflowName: request.workflowName,
      workflowType: request.workflowType,
      contextId: monitoredContext.contextId,
      planId: monitoredPlan.planId,
      traceId: executionTrace.traceId,
      approvalIds: monitoredApprovals.map(a => a.approvalId),
      monitoringConfiguration: {
        tracingEnabled: true,
        metricsCollection: 'comprehensive',
        anomalyDetection: 'ai_powered',
        alertingEnabled: true,
        complianceMonitoring: true,
        performanceOptimization: true
      },
      performanceTargets: request.performanceTargets,
      executionStatus: 'initialized',
      monitoringStatus: {
        tracingActive: true,
        metricsCollectionActive: true,
        anomalyDetectionActive: true,
        alertingActive: true,
        complianceMonitoringActive: true
      },
      realTimeMetrics: {
        currentLatencyMs: 0,
        currentThroughput: 0,
        currentErrorRate: 0,
        currentCpuUsage: 0,
        currentMemoryUsage: 0
      },
      createdAt: new Date(),
      requestedBy: request.requestedBy
    };

    // 6. Emit monitored workflow creation event
    await this.eventEmitter.emitAsync('monitored.workflow.execution.created', {
      executionId: monitoredExecution.executionId,
      workflowName: request.workflowName,
      contextId: monitoredContext.contextId,
      planId: monitoredPlan.planId,
      traceId: executionTrace.traceId,
      monitoringLevel: 'comprehensive',
      performanceTargets: request.performanceTargets,
      createdBy: request.requestedBy,
      timestamp: new Date().toISOString()
    });

    return monitoredExecution;
  }

  private setupCrossModuleMonitoring(): void {
    // Monitor context lifecycle events
    this.eventEmitter.on('context.lifecycle.event', async (event) => {
      await this.handleContextLifecycleEvent(event);
    });

    // Monitor plan execution events
    this.eventEmitter.on('plan.execution.event', async (event) => {
      await this.handlePlanExecutionEvent(event);
    });

    // Monitor approval workflow events
    this.eventEmitter.on('confirm.workflow.event', async (event) => {
      await this.handleApprovalWorkflowEvent(event);
    });

    // Monitor trace events
    this.eventEmitter.on('trace.event', async (event) => {
      await this.handleTraceEvent(event);
    });
  }

  private async handleContextLifecycleEvent(event: ContextLifecycleEvent): Promise<void> {
    // Update trace with context lifecycle information
    if (event.traceId) {
      await this.traceService.updateExecutionTrace(event.traceId, event.spanId, {
        events: [
          {
            eventType: 'context_lifecycle',
            eventName: event.eventName,
            timestamp: new Date(event.timestamp),
            attributes: {
              contextId: event.contextId,
              lifecycleStage: event.lifecycleStage,
              participantCount: event.participantCount,
              configurationChanges: event.configurationChanges
            }
          }
        ]
      });
    }

    // Trigger alerts for critical context events
    if (event.severity === 'critical') {
      await this.triggerContextAlert(event);
    }
  }

  private async handlePlanExecutionEvent(event: PlanExecutionEvent): Promise<void> {
    // Update trace with plan execution metrics
    if (event.traceId) {
      await this.traceService.updateExecutionTrace(event.traceId, event.spanId, {
        customMetrics: {
          planExecutionProgress: event.progressPercentage,
          objectivesCompleted: event.objectivesCompleted,
          totalObjectives: event.totalObjectives,
          planEfficiencyScore: event.efficiencyScore
        },
        events: [
          {
            eventType: 'plan_execution',
            eventName: event.eventName,
            timestamp: new Date(event.timestamp),
            attributes: {
              planId: event.planId,
              objectiveId: event.objectiveId,
              executionStage: event.executionStage,
              performanceMetrics: event.performanceMetrics
            }
          }
        ]
      });
    }

    // Analyze plan execution performance
    await this.analyzePlanExecutionPerformance(event);
  }

  private async handleApprovalWorkflowEvent(event: ApprovalWorkflowEvent): Promise<void> {
    // Update trace with approval workflow metrics
    if (event.traceId) {
      await this.traceService.updateExecutionTrace(event.traceId, event.spanId, {
        customMetrics: {
          approvalWorkflowProgress: event.progressPercentage,
          approvalsCompleted: event.approvalsCompleted,
          totalApprovals: event.totalApprovals,
          averageApprovalTime: event.averageApprovalTimeMs
        },
        events: [
          {
            eventType: 'approval_workflow',
            eventName: event.eventName,
            timestamp: new Date(event.timestamp),
            attributes: {
              approvalId: event.approvalId,
              workflowStage: event.workflowStage,
              approverInfo: event.approverInfo,
              decisionMetrics: event.decisionMetrics
            }
          }
        ]
      });
    }

    // Monitor approval workflow performance
    await this.monitorApprovalWorkflowPerformance(event);
  }
}
```

---

## 🔗 Related Documentation

- [Trace Module Overview](./README.md) - Module overview and architecture
- [API Reference](./api-reference.md) - Complete API documentation
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization

---

**Integration Examples Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Examples**: Enterprise Ready  

**⚠️ Alpha Notice**: These integration examples showcase enterprise-grade monitoring capabilities in Alpha release. Additional AI-powered analytics examples and advanced cross-module integration patterns will be added based on community feedback and real-world usage in Beta release.
