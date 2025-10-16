# Trace模块测试指南

> **🌐 语言导航**: [English](../../../en/modules/trace/testing-guide.md) | [中文](testing-guide.md)



**多智能体协议生命周期平台 - Trace模块测试指南 v1.0.0-alpha**

[![测试](https://img.shields.io/badge/testing-Enterprise%20Grade-green.svg)](./README.md)
[![覆盖率](https://img.shields.io/badge/coverage-89.7%25-green.svg)](./implementation-guide.md)
[![质量](https://img.shields.io/badge/quality-Production%20Ready-blue.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/trace/testing-guide.md)

---

## 🎯 测试概览

本指南提供Trace模块的全面测试策略，包括分布式追踪测试、性能监控验证、异常检测测试和企业级可观测性系统的质量保证。涵盖单元测试、集成测试、性能测试和端到端测试。

### **测试范围**
- **分布式追踪**: OpenTelemetry兼容性和追踪完整性
- **性能监控**: 指标收集准确性和实时性能
- **异常检测**: AI模型准确性和检测效率
- **告警系统**: 告警触发和通知可靠性
- **可扩展性**: 高负载和大规模部署测试

### **测试目标**
- **功能正确性**: 100%核心功能验证
- **性能基准**: 满足企业级性能要求
- **可靠性**: 99.9%系统可用性
- **可扩展性**: 支持高并发和大数据量

---

## 🧪 单元测试

### **1. 分布式追踪服务测试**

#### **追踪生命周期测试**
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
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            recordAnomalies: jest.fn()
          }
        },
        {
          provide: MetricsCollector,
          useValue: {
            recordMetrics: jest.fn(),
            getMetrics: jest.fn()
          }
        },
        {
          provide: AnomalyDetector,
          useValue: {
            startMonitoring: jest.fn(),
            detectAnomalies: jest.fn()
          }
        },
        {
          provide: AlertManager,
          useValue: {
            sendAlert: jest.fn()
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

  describe('startExecution', () => {
    it('应该成功创建执行追踪', async () => {
      // Arrange
      const request = {
        operationName: 'test_workflow',
        serviceName: 'test_service',
        context: {
          contextId: 'ctx-001',
          userId: 'user-001',
          sessionId: 'sess-001',
          correlationId: 'corr-001'
        },
        tags: {
          priority: 'high',
          environment: 'test'
        },
        metadata: {
          version: '1.0.0-alpha'
        }
      };

      const expectedTrace = {
        traceId: 'trace-001',
        spanId: 'span-001',
        operationName: request.operationName,
        serviceName: request.serviceName,
        status: 'active',
        startTime: expect.any(Date),
        context: request.context,
        tags: request.tags,
        metadata: request.metadata
      };

      traceRepository.create.mockResolvedValue(expectedTrace);
      anomalyDetector.startMonitoring.mockResolvedValue(undefined);

      // Act
      const result = await service.startExecution(request);

      // Assert
      expect(result).toEqual(expectedTrace);
      expect(traceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          operationName: request.operationName,
          serviceName: request.serviceName,
          status: 'active',
          context: request.context,
          tags: request.tags,
          metadata: request.metadata
        })
      );
      expect(anomalyDetector.startMonitoring).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: expectedTrace.traceId,
          serviceName: request.serviceName,
          operationName: request.operationName
        })
      );
    });

    it('应该处理无效的请求参数', async () => {
      // Arrange
      const invalidRequest = {
        operationName: '', // 无效的操作名称
        serviceName: 'test_service',
        context: null // 无效的上下文
      };

      // Act & Assert
      await expect(service.startExecution(invalidRequest)).rejects.toThrow(
        'Invalid execution request parameters'
      );
      expect(traceRepository.create).not.toHaveBeenCalled();
    });

    it('应该设置性能监控和异常检测', async () => {
      // Arrange
      const request = {
        operationName: 'performance_test',
        serviceName: 'test_service',
        context: {
          contextId: 'ctx-001',
          userId: 'user-001'
        },
        samplingRate: 1.0,
        traceFlags: ['detailed_metrics', 'performance_analysis']
      };

      const mockTrace = {
        traceId: 'trace-001',
        spanId: 'span-001',
        operationName: request.operationName,
        serviceName: request.serviceName
      };

      traceRepository.create.mockResolvedValue(mockTrace);

      // Act
      await service.startExecution(request);

      // Assert
      expect(anomalyDetector.startMonitoring).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: mockTrace.traceId,
          serviceName: request.serviceName,
          operationName: request.operationName,
          monitoringInterval: 30000,
          thresholds: expect.objectContaining({
            cpuUsage: expect.any(Number),
            memoryUsage: expect.any(Number),
            responseTime: expect.any(Number),
            errorRate: expect.any(Number)
          })
        })
      );
    });
  });

  describe('updateExecution', () => {
    it('应该成功更新执行追踪', async () => {
      // Arrange
      const traceId = 'trace-001';
      const update = {
        status: 'in_progress',
        progressPercentage: 50,
        currentOperation: 'data_processing',
        metrics: {
          cpuUsagePercent: 65,
          memoryUsageMb: 2048,
          networkIoMbps: 12.5
        },
        events: [
          {
            eventType: 'milestone_reached',
            eventName: '数据处理完成',
            timestamp: new Date(),
            metadata: {
              processedRecords: 10000
            }
          }
        ]
      };

      traceRepository.update.mockResolvedValue(undefined);
      metricsCollector.recordMetrics.mockResolvedValue(undefined);
      anomalyDetector.detectAnomalies.mockResolvedValue([]);

      // Act
      await service.updateExecution(traceId, update);

      // Assert
      expect(traceRepository.update).toHaveBeenCalledWith(traceId, 
        expect.objectContaining({
          status: update.status,
          progressPercentage: update.progressPercentage,
          currentOperation: update.currentOperation,
          metrics: update.metrics,
          events: update.events,
          updatedAt: expect.any(Date)
        })
      );
      expect(metricsCollector.recordMetrics).toHaveBeenCalledWith(traceId, update.metrics);
      expect(anomalyDetector.detectAnomalies).toHaveBeenCalledWith(traceId, update.metrics);
    });

    it('应该检测和处理异常', async () => {
      // Arrange
      const traceId = 'trace-001';
      const update = {
        metrics: {
          cpuUsagePercent: 95, // 异常高的CPU使用率
          memoryUsageMb: 8192  // 异常高的内存使用
        }
      };

      const detectedAnomalies = [
        {
          anomalyId: 'anom-001',
          type: 'cpu_spike',
          severity: 'high',
          detectedAt: new Date(),
          metric: 'cpu_usage',
          description: 'CPU使用率异常升高',
          confidence: 0.92
        }
      ];

      traceRepository.update.mockResolvedValue(undefined);
      metricsCollector.recordMetrics.mockResolvedValue(undefined);
      anomalyDetector.detectAnomalies.mockResolvedValue(detectedAnomalies);
      traceRepository.recordAnomalies.mockResolvedValue(undefined);
      alertManager.sendAlert.mockResolvedValue(undefined);

      // Act
      await service.updateExecution(traceId, update);

      // Assert
      expect(traceRepository.recordAnomalies).toHaveBeenCalledWith(traceId, detectedAnomalies);
      expect(alertManager.sendAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'anomaly_detected',
          severity: 'high',
          traceId: traceId,
          anomaly: detectedAnomalies[0],
          timestamp: expect.any(Date)
        })
      );
    });
  });

  describe('finishExecution', () => {
    it('应该成功完成执行追踪', async () => {
      // Arrange
      const traceId = 'trace-001';
      const result = {
        success: true,
        durationMs: 180000,
        performanceScore: 0.85,
        outputData: {
          processedRecords: 25000,
          generatedInsights: 150
        },
        finalMetrics: {
          peakCpuUsagePercent: 78,
          peakMemoryUsageMb: 3200
        }
      };

      const mockTrace = {
        traceId: traceId,
        operationName: 'test_workflow',
        serviceName: 'test_service',
        startTime: new Date(Date.now() - 180000),
        endTime: new Date()
      };

      const mockMetrics = [
        { timestamp: new Date(), cpuUsagePercent: 65 },
        { timestamp: new Date(), memoryUsageMb: 2048 }
      ];

      traceRepository.update.mockResolvedValue(undefined);
      traceRepository.findById.mockResolvedValue(mockTrace);
      metricsCollector.getMetrics.mockResolvedValue(mockMetrics);

      // Act
      await service.finishExecution(traceId, result);

      // Assert
      expect(traceRepository.update).toHaveBeenCalledWith(traceId,
        expect.objectContaining({
          status: 'completed',
          endTime: expect.any(Date),
          result: result,
          finalMetrics: result.finalMetrics
        })
      );
    });

    it('应该处理执行失败的情况', async () => {
      // Arrange
      const traceId = 'trace-001';
      const result = {
        success: false,
        errorMessage: '数据处理失败',
        errors: [
          {
            errorType: 'validation_error',
            errorMessage: '数据格式不正确',
            timestamp: new Date()
          }
        ]
      };

      traceRepository.update.mockResolvedValue(undefined);

      // Act
      await service.finishExecution(traceId, result);

      // Assert
      expect(traceRepository.update).toHaveBeenCalledWith(traceId,
        expect.objectContaining({
          status: 'failed',
          endTime: expect.any(Date),
          result: result,
          errors: result.errors
        })
      );
    });
  });
});
```

### **2. 性能监控测试**

#### **实时指标收集器测试**
```typescript
import { RealTimeMetricsCollector } from '../collectors/real-time-metrics.collector';
import { MetricsRepository } from '../repositories/metrics.repository';
import { AlertManager } from '../managers/alert.manager';

describe('RealTimeMetricsCollector', () => {
  let collector: RealTimeMetricsCollector;
  let metricsRepository: jest.Mocked<MetricsRepository>;
  let alertManager: jest.Mocked<AlertManager>;

  beforeEach(async () => {
    metricsRepository = {
      batchInsert: jest.fn(),
      saveAggregatedMetrics: jest.fn()
    } as any;

    alertManager = {
      sendAlert: jest.fn()
    } as any;

    collector = new RealTimeMetricsCollector(metricsRepository, alertManager);
  });

  describe('recordMetric', () => {
    it('应该成功记录性能指标', async () => {
      // Arrange
      const traceId = 'trace-001';
      const metric = {
        metricType: 'cpu_usage',
        cpuUsagePercent: 65,
        memoryUsageMb: 2048,
        networkIoMbps: 12.5,
        customMetrics: {
          activeConnections: 15,
          queueDepth: 25
        }
      };

      // Act
      await collector.recordMetric(traceId, metric);

      // Assert
      expect(metric.timestamp).toBeDefined();
      expect(metric.traceId).toBe(traceId);
    });

    it('应该检测阈值超限并发送告警', async () => {
      // Arrange
      const traceId = 'trace-001';
      const highCpuMetric = {
        metricType: 'cpu_usage',
        cpuUsagePercent: 95 // 超过阈值
      };

      // Mock阈值配置
      jest.spyOn(collector as any, 'getThresholds').mockResolvedValue({
        cpuWarning: 80,
        cpuCritical: 90,
        memoryWarning: 85,
        memoryCritical: 95
      });

      // Act
      await collector.recordMetric(traceId, highCpuMetric);

      // Assert
      expect(alertManager.sendAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'threshold_exceeded',
          severity: 'critical',
          metric: 'cpu_usage',
          value: 95,
          threshold: 90,
          traceId: traceId
        })
      );
    });

    it('应该批量处理指标数据', async () => {
      // Arrange
      const traceId = 'trace-001';
      const metrics = Array.from({ length: 100 }, (_, i) => ({
        metricType: 'test_metric',
        value: i,
        timestamp: new Date()
      }));

      // Act
      for (const metric of metrics) {
        await collector.recordMetric(traceId, metric);
      }

      // 触发批量处理
      await (collector as any).collectAndProcessMetrics();

      // Assert
      expect(metricsRepository.batchInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            traceId: traceId,
            metricType: 'test_metric'
          })
        ])
      );
    });
  });

  describe('性能统计', () => {
    it('应该提供准确的性能统计信息', () => {
      // Act
      const stats = collector.getPerformanceStats();

      // Assert
      expect(stats).toEqual(
        expect.objectContaining({
          activeSpans: expect.any(Number),
          poolUtilization: expect.any(Number),
          memoryUsage: expect.any(Number)
        })
      );
    });
  });
});
```

---

## 🔗 相关文档

- [Trace模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范

---

**测试版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Trace模块测试指南在Alpha版本中提供企业级测试策略和验证方法。额外的高级测试功能和自动化测试工具将在Beta版本中添加。
