# Trace Module Testing Guide

> **🌐 Language Navigation**: [English](testing-guide.md) | [中文](../../../zh-CN/modules/trace/testing-guide.md)



**Multi-Agent Protocol Lifecycle Platform - Trace Module Testing Guide v1.0.0-alpha**

[![Testing](https://img.shields.io/badge/testing-Enterprise%20Validated-green.svg)](./README.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![Monitoring](https://img.shields.io/badge/monitoring-Tested-blue.svg)](./performance-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/trace/testing-guide.md)

---

## 🎯 Testing Overview

This comprehensive testing guide provides strategies, patterns, and examples for testing the Trace Module's distributed tracing system, performance monitoring features, anomaly detection capabilities, and alerting mechanisms. It covers testing methodologies for mission-critical observability systems.

### **Testing Scope**
- **Distributed Tracing Testing**: OpenTelemetry integration and trace collection
- **Performance Monitoring Testing**: Metrics collection and analysis validation
- **Anomaly Detection Testing**: AI-powered anomaly detection validation
- **Alerting System Testing**: Alert rules and notification delivery testing
- **Integration Testing**: Cross-module monitoring integration testing
- **Load Testing**: High-volume trace and metrics processing validation

---

## 🧪 Distributed Tracing Testing Strategy

### **Tracing Service Unit Tests**

#### **DistributedTracingService Tests**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DistributedTracingService } from '../services/distributed-tracing.service';
import { TraceRepository } from '../repositories/trace.repository';
import { MetricsCollector } from '../collectors/metrics.collector';
import { AnomalyDetector } from '../detectors/anomaly.detector';
import { AlertManager } from '../managers/alert.manager';
import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';

describe('DistributedTracingService', () => {
  let service: DistributedTracingService;
  let traceRepository: jest.Mocked<TraceRepository>;
  let metricsCollector: jest.Mocked<MetricsCollector>;
  let anomalyDetector: jest.Mocked<AnomalyDetector>;
  let alertManager: jest.Mocked<AlertManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributedTracingService,
        {
          provide: TraceRepository,
          useValue: {
            createExecutionTrace: jest.fn(),
            findExecutionTrace: jest.fn(),
            updateExecutionTrace: jest.fn(),
            completeExecutionTrace: jest.fn(),
            addAnomalies: jest.fn()
          }
        },
        {
          provide: MetricsCollector,
          useValue: {
            collectMetrics: jest.fn()
          }
        },
        {
          provide: AnomalyDetector,
          useValue: {
            configureDetection: jest.fn(),
            detectAnomalies: jest.fn()
          }
        },
        {
          provide: AlertManager,
          useValue: {
            configureAlerts: jest.fn(),
            triggerAnomalyAlert: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<DistributedTracingService>(DistributedTracingService);
    traceRepository = module.get(TraceRepository);
    metricsCollector = module.get(MetricsCollector);
    anomalyDetector = module.get(AnomalyDetector);
    alertManager = module.get(AlertManager);
  });

  describe('startExecutionTrace', () => {
    it('should start execution trace with valid request', async () => {
      // Arrange
      const request: StartTraceRequest = {
        operationName: 'workflow_execution',
        serviceName: 'plan_module',
        context: {
          contextId: 'ctx-001',
          userId: 'user-001',
          sessionId: 'sess-001',
          correlationId: 'corr-001'
        },
        tags: {
          workflowId: 'wf-001',
          workflowType: 'approval_workflow',
          priority: 'high',
          environment: 'test'
        },
        metadata: {
          agentVersion: '1.0.0-alpha',
          executionMode: 'distributed'
        },
        samplingRate: 1.0,
        traceFlags: ['detailed_metrics', 'performance_analysis']
      };

      const expectedTrace = {
        traceId: 'trace-001',
        spanId: 'span-001',
        operationName: 'workflow_execution',
        serviceName: 'plan_module',
        status: TraceStatus.Active,
        startTime: expect.any(Date),
        context: request.context,
        tags: request.tags,
        metadata: request.metadata
      };

      traceRepository.createExecutionTrace.mockResolvedValue(expectedTrace);
      metricsCollector.collectMetrics.mockResolvedValue({
        timestamp: new Date(),
        systemMetrics: {
          cpuUsagePercent: 45.2,
          memoryUsageMb: 256,
          networkIoKbps: 128,
          diskIoKbps: 64
        },
        applicationMetrics: {
          throughputOpsPerSec: 150,
          latencyP95Ms: 200,
          errorRatePercent: 0.1
        }
      });

      // Act
      const result = await service.startExecutionTrace(request);

      // Assert
      expect(traceRepository.createExecutionTrace).toHaveBeenCalledWith(
        expect.objectContaining({
          operationName: 'workflow_execution',
          serviceName: 'plan_module',
          status: TraceStatus.Active,
          context: request.context,
          tags: request.tags,
          metadata: request.metadata,
          samplingRate: 1.0,
          traceFlags: ['detailed_metrics', 'performance_analysis']
        })
      );
      expect(anomalyDetector.configureDetection).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: result.traceId,
          spanId: result.spanId,
          operationName: 'workflow_execution',
          serviceName: 'plan_module'
        })
      );
      expect(alertManager.configureAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: result.traceId,
          spanId: result.spanId
        })
      );
      expect(result).toEqual(expectedTrace);
    });

    it('should handle trace creation failure', async () => {
      // Arrange
      const request: StartTraceRequest = {
        operationName: 'invalid_operation',
        serviceName: 'invalid_service',
        context: {
          contextId: 'ctx-001',
          userId: 'user-001',
          sessionId: 'sess-001',
          correlationId: 'corr-001'
        },
        tags: {},
        metadata: {}
      };

      traceRepository.createExecutionTrace.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(service.startExecutionTrace(request))
        .rejects
        .toThrow('Database connection failed');
      
      expect(traceRepository.createExecutionTrace).toHaveBeenCalled();
      expect(anomalyDetector.configureDetection).not.toHaveBeenCalled();
      expect(alertManager.configureAlerts).not.toHaveBeenCalled();
    });

    it('should set up metrics collection with correct interval', async () => {
      // Arrange
      const request: StartTraceRequest = {
        operationName: 'test_operation',
        serviceName: 'test_service',
        context: {
          contextId: 'ctx-001',
          userId: 'user-001',
          sessionId: 'sess-001',
          correlationId: 'corr-001'
        },
        tags: {},
        metadata: {}
      };

      const mockTrace = {
        traceId: 'trace-001',
        spanId: 'span-001',
        operationName: 'test_operation',
        serviceName: 'test_service',
        status: TraceStatus.Active
      };

      traceRepository.createExecutionTrace.mockResolvedValue(mockTrace);

      // Mock timer functions
      jest.useFakeTimers();
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      // Act
      await service.startExecutionTrace(request);

      // Assert
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        5000  // 5 seconds interval
      );

      // Fast-forward time to trigger metrics collection
      jest.advanceTimersByTime(5000);

      expect(metricsCollector.collectMetrics).toHaveBeenCalledWith({
        traceId: 'trace-001',
        spanId: 'span-001',
        serviceName: 'test_service',
        operationName: 'test_operation'
      });

      jest.useRealTimers();
    });
  });

  describe('updateExecutionTrace', () => {
    it('should update execution trace with metrics and events', async () => {
      // Arrange
      const traceId = 'trace-001';
      const spanId = 'span-001';
      const update: UpdateTraceRequest = {
        status: TraceStatus.Running,
        progressPercentage: 45,
        currentOperation: 'approval_processing',
        metrics: {
          durationMs: 2250,
          cpuUsagePercent: 52.3,
          memoryUsageMb: 384,
          networkIoKb: 256,
          diskIoKb: 128
        },
        performanceIndicators: {
          throughputOpsPerSec: 180,
          latencyP95Ms: 150,
          latencyP99Ms: 280,
          errorRatePercent: 0.05,
          successRatePercent: 99.95
        },
        events: [
          {
            eventType: 'milestone_reached',
            eventName: 'approval_chain_completed',
            timestamp: new Date('2025-09-03T10:02:15.000Z'),
            attributes: {
              approvalsCount: 3,
              totalProcessingTimeMs: 2150
            }
          }
        ]
      };

      const existingTrace = {
        traceId: traceId,
        spanId: spanId,
        status: TraceStatus.Active,
        events: [],
        logs: []
      };

      const updatedTrace = {
        ...existingTrace,
        status: TraceStatus.Running,
        progressPercentage: 45,
        currentOperation: 'approval_processing',
        metrics: update.metrics,
        performanceIndicators: update.performanceIndicators,
        events: update.events,
        updatedAt: expect.any(Date)
      };

      traceRepository.findExecutionTrace.mockResolvedValue(existingTrace);
      traceRepository.updateExecutionTrace.mockResolvedValue(updatedTrace);
      
      // Mock span reference
      const mockSpan = {
        setAttributes: jest.fn(),
        addEvent: jest.fn()
      };
      service.getSpanReference = jest.fn().mockReturnValue(mockSpan);

      anomalyDetector.detectAnomalies.mockResolvedValue({
        anomaliesDetected: [],
        overallAnomalyScore: 0.2
      });

      // Act
      const result = await service.updateExecutionTrace(traceId, spanId, update);

      // Assert
      expect(traceRepository.findExecutionTrace).toHaveBeenCalledWith(traceId, spanId);
      expect(mockSpan.setAttributes).toHaveBeenCalledWith({
        'mplp.metrics.duration_ms': 2250,
        'mplp.metrics.cpu_usage_percent': 52.3,
        'mplp.metrics.memory_usage_mb': 384,
        'mplp.metrics.throughput_ops_per_sec': 180,
        'mplp.metrics.latency_p95_ms': 150,
        'mplp.metrics.error_rate_percent': 0.05
      });
      expect(mockSpan.addEvent).toHaveBeenCalledWith('approval_chain_completed', {
        'event.type': 'milestone_reached',
        'event.timestamp': '2025-09-03T10:02:15.000Z',
        approvalsCount: 3,
        totalProcessingTimeMs: 2150
      });
      expect(traceRepository.updateExecutionTrace).toHaveBeenCalledWith(
        traceId,
        spanId,
        expect.objectContaining({
          status: TraceStatus.Running,
          progressPercentage: 45,
          currentOperation: 'approval_processing',
          metrics: update.metrics,
          performanceIndicators: update.performanceIndicators,
          events: update.events
        })
      );
      expect(anomalyDetector.detectAnomalies).toHaveBeenCalledWith({
        traceId: traceId,
        spanId: spanId,
        metrics: update.metrics,
        historicalContext: {
          operationName: existingTrace.operationName,
          serviceName: existingTrace.serviceName,
          timeWindow: '24h'
        }
      });
      expect(result).toEqual(updatedTrace);
    });

    it('should handle non-existent trace update', async () => {
      // Arrange
      const traceId = 'non-existent-trace';
      const spanId = 'non-existent-span';
      const update: UpdateTraceRequest = {
        status: TraceStatus.Running,
        metrics: {
          durationMs: 1000,
          cpuUsagePercent: 50,
          memoryUsageMb: 256
        }
      };

      traceRepository.findExecutionTrace.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateExecutionTrace(traceId, spanId, update))
        .rejects
        .toThrow(NotFoundError);
      
      expect(traceRepository.findExecutionTrace).toHaveBeenCalledWith(traceId, spanId);
      expect(traceRepository.updateExecutionTrace).not.toHaveBeenCalled();
    });

    it('should trigger anomaly alerts for high severity anomalies', async () => {
      // Arrange
      const traceId = 'trace-001';
      const spanId = 'span-001';
      const update: UpdateTraceRequest = {
        metrics: {
          durationMs: 5000,  // High duration
          cpuUsagePercent: 95,  // High CPU usage
          memoryUsageMb: 1024
        }
      };

      const existingTrace = {
        traceId: traceId,
        spanId: spanId,
        status: TraceStatus.Active,
        operationName: 'test_operation',
        serviceName: 'test_service'
      };

      const highSeverityAnomaly = {
        anomalyId: 'anom-001',
        anomalyType: 'performance_degradation',
        severity: 'high',
        confidence: 0.95,
        description: 'Significant performance degradation detected'
      };

      traceRepository.findExecutionTrace.mockResolvedValue(existingTrace);
      traceRepository.updateExecutionTrace.mockResolvedValue({
        ...existingTrace,
        metrics: update.metrics
      });
      
      service.getSpanReference = jest.fn().mockReturnValue({
        setAttributes: jest.fn(),
        addEvent: jest.fn()
      });

      anomalyDetector.detectAnomalies.mockResolvedValue({
        anomaliesDetected: [highSeverityAnomaly],
        overallAnomalyScore: 0.95
      });

      // Act
      await service.updateExecutionTrace(traceId, spanId, update);

      // Assert
      expect(traceRepository.addAnomalies).toHaveBeenCalledWith(
        traceId,
        spanId,
        [highSeverityAnomaly]
      );
      expect(alertManager.triggerAnomalyAlert).toHaveBeenCalledWith({
        traceId: traceId,
        spanId: spanId,
        anomaly: highSeverityAnomaly,
        trace: expect.any(Object)
      });
    });
  });

  describe('completeExecutionTrace', () => {
    it('should complete execution trace successfully', async () => {
      // Arrange
      const traceId = 'trace-001';
      const spanId = 'span-001';
      const completion: CompleteTraceRequest = {
        status: TraceStatus.Completed,
        result: {
          success: true,
          resultType: 'workflow_completed',
          output: {
            workflowId: 'wf-001',
            executionResult: 'approved',
            finalState: 'completed'
          }
        },
        finalMetrics: {
          totalDurationMs: 4500,
          peakCpuUsagePercent: 65.8,
          peakMemoryUsageMb: 512,
          totalNetworkIoKb: 1024,
          totalDiskIoKb: 512
        },
        performanceSummary: {
          avgThroughputOpsPerSec: 165,
          avgLatencyMs: 125,
          totalOperations: 742,
          successfulOperations: 741,
          failedOperations: 1,
          overallSuccessRate: 99.87
        },
        resourceUtilization: {
          cpuEfficiency: 0.85,
          memoryEfficiency: 0.78,
          networkEfficiency: 0.92,
          storageEfficiency: 0.88
        }
      };

      const existingTrace = {
        traceId: traceId,
        spanId: spanId,
        status: TraceStatus.Running,
        operationName: 'workflow_execution',
        serviceName: 'plan_module'
      };

      const completedTrace = {
        ...existingTrace,
        status: TraceStatus.Completed,
        endTime: expect.any(Date),
        result: completion.result,
        finalMetrics: completion.finalMetrics,
        performanceSummary: completion.performanceSummary,
        resourceUtilization: completion.resourceUtilization,
        completedAt: expect.any(Date)
      };

      const traceAnalysis = {
        performanceGrade: 'A',
        efficiencyScore: 0.86,
        bottlenecksIdentified: [],
        optimizationOpportunities: [
          {
            type: 'caching_improvement',
            description: 'Increase cache hit rate for approval lookups',
            potentialImprovement: '15% latency reduction'
          }
        ],
        performanceComparison: {
          vsBaseline: '+12% faster',
          vsSimilarExecutions: '+8% faster'
        },
        anomaliesDetected: 0,
        alertsTriggered: 0
      };

      traceRepository.findExecutionTrace.mockResolvedValue(existingTrace);
      traceRepository.completeExecutionTrace.mockResolvedValue(completedTrace);
      traceRepository.updateExecutionTrace.mockResolvedValue({
        ...completedTrace,
        traceAnalysis: traceAnalysis
      });

      const mockSpan = {
        setStatus: jest.fn(),
        setAttributes: jest.fn(),
        end: jest.fn()
      };
      service.getSpanReference = jest.fn().mockReturnValue(mockSpan);
      service.generateTraceAnalysis = jest.fn().mockResolvedValue(traceAnalysis);
      service.shouldArchiveTrace = jest.fn().mockReturnValue(true);
      service.archiveTrace = jest.fn().mockResolvedValue(undefined);
      service.sendCompletionNotifications = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await service.completeExecutionTrace(traceId, spanId, completion);

      // Assert
      expect(traceRepository.findExecutionTrace).toHaveBeenCalledWith(traceId, spanId);
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.OK,
        message: 'workflow_completed'
      });
      expect(mockSpan.setAttributes).toHaveBeenCalledWith({
        'mplp.result.success': true,
        'mplp.result.type': 'workflow_completed',
        'mplp.metrics.total_duration_ms': 4500,
        'mplp.metrics.peak_cpu_usage_percent': 65.8,
        'mplp.metrics.peak_memory_usage_mb': 512,
        'mplp.performance.overall_success_rate': 99.87,
        'mplp.performance.avg_throughput': 165,
        'mplp.efficiency.cpu': 0.85,
        'mplp.efficiency.memory': 0.78
      });
      expect(mockSpan.end).toHaveBeenCalled();
      expect(traceRepository.completeExecutionTrace).toHaveBeenCalledWith(
        traceId,
        spanId,
        expect.objectContaining({
          status: TraceStatus.Completed,
          endTime: expect.any(Date),
          result: completion.result,
          finalMetrics: completion.finalMetrics,
          performanceSummary: completion.performanceSummary,
          resourceUtilization: completion.resourceUtilization
        })
      );
      expect(service.generateTraceAnalysis).toHaveBeenCalledWith(completedTrace);
      expect(service.archiveTrace).toHaveBeenCalledWith(expect.any(Object));
      expect(service.sendCompletionNotifications).toHaveBeenCalledWith(expect.any(Object));
      expect(result.traceAnalysis).toEqual(traceAnalysis);
    });

    it('should handle completion with failure result', async () => {
      // Arrange
      const traceId = 'trace-002';
      const spanId = 'span-002';
      const completion: CompleteTraceRequest = {
        status: TraceStatus.Failed,
        result: {
          success: false,
          resultType: 'workflow_failed',
          error: {
            errorType: 'validation_error',
            errorMessage: 'Invalid approval request format',
            errorCode: 'INVALID_FORMAT'
          }
        },
        finalMetrics: {
          totalDurationMs: 1500,
          peakCpuUsagePercent: 30.2,
          peakMemoryUsageMb: 128
        }
      };

      const existingTrace = {
        traceId: traceId,
        spanId: spanId,
        status: TraceStatus.Running
      };

      traceRepository.findExecutionTrace.mockResolvedValue(existingTrace);
      traceRepository.completeExecutionTrace.mockResolvedValue({
        ...existingTrace,
        status: TraceStatus.Failed,
        result: completion.result
      });

      const mockSpan = {
        setStatus: jest.fn(),
        setAttributes: jest.fn(),
        end: jest.fn()
      };
      service.getSpanReference = jest.fn().mockReturnValue(mockSpan);

      // Act
      await service.completeExecutionTrace(traceId, spanId, completion);

      // Assert
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
        message: 'workflow_failed'
      });
      expect(traceRepository.completeExecutionTrace).toHaveBeenCalledWith(
        traceId,
        spanId,
        expect.objectContaining({
          status: TraceStatus.Failed,
          result: completion.result
        })
      );
    });
  });
});
```

---

## 🔗 Related Documentation

- [Trace Module Overview](./README.md) - Module overview and architecture
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**Testing Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Coverage**: 100% comprehensive  

**⚠️ Alpha Notice**: This testing guide provides comprehensive enterprise monitoring testing strategies in Alpha release. Additional AI anomaly detection testing patterns and advanced observability testing will be added based on community feedback in Beta release.
