/**
 * Trace测试数据工厂
 * 
 * @description 基于实际Schema的Trace测试数据生成工厂
 * @version 1.0.0
 * @layer 测试层 - 测试工厂
 * @schema src/schemas/core-modules/mplp-trace.json
 * @naming_convention Schema(snake_case) ↔ TypeScript(camelCase)
 */

import {
  TraceEntityData,
  TraceSchema,
  CreateTraceRequest,
  UpdateTraceRequest,
  TraceQueryFilter,
  TraceType,
  Severity,
  EventType,
  EventCategory,
  TraceOperation
} from '../../../../src/modules/trace/types';
import { UUID, Timestamp } from '../../../../src/shared/types';

/**
 * Trace测试数据工厂类
 */
export class TraceTestFactory {

  /**
   * 创建完整的TraceEntityData测试数据
   */
  static createTraceEntityData(overrides: Partial<TraceEntityData> = {}): TraceEntityData {
    const now = new Date().toISOString() as Timestamp;
    const traceId = `trace-test-${Date.now()}` as UUID;

    return {
      protocolVersion: '1.0.0',
      timestamp: now,
      traceId,
      contextId: 'ctx-test-001' as UUID,
      planId: 'plan-test-001' as UUID,
      taskId: 'task-test-001' as UUID,
      traceType: 'execution',
      severity: 'info',
      event: {
        type: 'start',
        name: 'Test Event',
        description: 'Test event description',
        category: 'system',
        source: {
          component: 'trace-test-factory',
          module: 'test-module',
          function: 'testFunction',
          lineNumber: 100
        },
        data: { testKey: 'testValue' }
      },
      contextSnapshot: {
        variables: { var1: 'value1', var2: 42 },
        environment: {
          os: 'linux',
          platform: 'node',
          runtimeVersion: '18.0.0',
          environmentVariables: { NODE_ENV: 'test' }
        },
        callStack: [
          {
            function: 'testFunction',
            file: 'test.ts',
            line: 100,
            arguments: { arg1: 'value1' }
          }
        ]
      },
      errorInformation: {
        errorCode: 'TEST_ERROR',
        errorMessage: 'Test error message',
        errorType: 'system',
        stackTrace: [
          {
            file: 'test.ts',
            function: 'testFunction',
            line: 100,
            column: 10
          }
        ],
        recoveryActions: [
          {
            action: 'retry',
            description: 'Retry the operation',
            parameters: { maxRetries: 3 }
          }
        ]
      },
      decisionLog: {
        decisionPoint: 'Test Decision Point',
        optionsConsidered: [
          {
            option: 'Option A',
            score: 0.8,
            rationale: 'Good option',
            riskFactors: ['risk1']
          }
        ],
        selectedOption: 'Option A',
        decisionCriteria: [
          {
            criterion: 'Performance',
            weight: 0.7,
            evaluation: 'Good'
          }
        ],
        confidenceLevel: 0.9
      },
      correlations: [
        {
          correlationId: 'corr-test-001' as UUID,
          type: 'causation',
          relatedTraceId: 'trace-related-001' as UUID,
          strength: 0.8,
          description: 'Test correlation'
        }
      ],
      auditTrail: {
        enabled: true,
        retentionDays: 90,
        auditEvents: [],
        complianceSettings: {
          gdprEnabled: false,
          hipaaEnabled: false,
          soxEnabled: false,
          traceAuditLevel: 'basic',
          traceDataLogging: true,
          customCompliance: []
        }
      },
      performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60,
        metrics: {
          traceProcessingLatencyMs: 10,
          spanCollectionRatePerSecond: 100,
          traceAnalysisAccuracyPercent: 95,
          distributedTracingCoveragePercent: 90,
          traceMonitoringEfficiencyScore: 8,
          activeTracesCount: 5,
          traceOperationsPerSecond: 50,
          traceStorageUsageMb: 1.5,
          averageTraceComplexityScore: 6
        },
        healthStatus: {
          status: 'healthy',
          lastCheck: now,
          checks: [
            {
              checkName: 'Database Connection',
              status: 'pass',
              message: 'Connection successful',
              durationMs: 5
            }
          ]
        },
        alerting: {
          enabled: true,
          thresholds: {
            maxTraceProcessingLatencyMs: 100,
            minSpanCollectionRatePerSecond: 10,
            minTraceAnalysisAccuracyPercent: 80,
            minDistributedTracingCoveragePercent: 70,
            minTraceMonitoringEfficiencyScore: 5
          },
          notificationChannels: ['email', 'slack']
        }
      },
      monitoringIntegration: {
        enabled: true,
        supportedProviders: ['prometheus', 'grafana'],
        integrationEndpoints: {
          metricsApi: 'http://localhost:9090/metrics',
          tracingApi: 'http://localhost:14268/api/traces',
          alertingApi: 'http://localhost:9093/api/v1/alerts',
          dashboardApi: 'http://localhost:3000/api/dashboards'
        },
        exportFormats: ['opentelemetry', 'jaeger'],
        samplingConfig: {
          samplingRate: 0.1,
          adaptiveSampling: true,
          maxTracesPerSecond: 1000
        }
      },
      versionHistory: {
        enabled: true,
        maxVersions: 50,
        versions: [
          {
            versionId: 'ver-test-001' as UUID,
            versionNumber: 1,
            createdAt: now,
            createdBy: 'test-user',
            changeSummary: 'Initial version',
            traceSnapshot: {},
            changeType: 'created'
          }
        ],
        autoVersioning: {
          enabled: true,
          versionOnUpdate: true,
          versionOnAnalysis: false
        }
      },
      searchMetadata: {
        enabled: true,
        indexingStrategy: 'keyword',
        searchableFields: ['trace_id', 'context_id', 'trace_type', 'severity'],
        searchIndexes: [
          {
            indexId: 'idx-test-001',
            indexName: 'trace_primary',
            fields: ['trace_id', 'context_id'],
            indexType: 'btree',
            createdAt: now,
            lastUpdated: now
          }
        ],
        autoIndexing: {
          enabled: true,
          indexNewTraces: true,
          reindexIntervalHours: 24
        }
      },
      traceOperation: 'start',
      traceDetails: {
        traceLevel: 'basic',
        samplingRate: 1.0,
        retentionDays: 30
      },
      eventIntegration: {
        enabled: true,
        eventBusConnection: {
          busType: 'kafka',
          connectionString: 'localhost:9092',
          topicPrefix: 'mplp-trace-test',
          consumerGroup: 'trace-test-consumer'
        },
        publishedEvents: ['trace_created', 'trace_updated'],
        subscribedEvents: ['context_updated', 'plan_executed'],
        eventRouting: {
          routingRules: [
            {
              ruleId: 'rule-test-001',
              condition: 'severity == "error"',
              targetTopic: 'error-traces',
              enabled: true
            }
          ]
        }
      },
      ...overrides
    };
  }

  /**
   * 创建最小化的TraceEntityData测试数据
   */
  static createMinimalTraceEntityData(overrides: Partial<TraceEntityData> = {}): TraceEntityData {
    const now = new Date().toISOString() as Timestamp;
    const traceId = `trace-minimal-${Date.now()}` as UUID;

    return {
      protocolVersion: '1.0.0',
      timestamp: now,
      traceId,
      contextId: 'ctx-minimal-001' as UUID,
      traceType: 'execution',
      severity: 'info',
      event: {
        type: 'start',
        name: 'Minimal Event',
        category: 'system',
        source: {
          component: 'minimal-test'
        }
      },
      auditTrail: {
        enabled: true,
        retentionDays: 30
      },
      performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60
      },
      monitoringIntegration: {
        enabled: false,
        supportedProviders: ['prometheus']
      },
      versionHistory: {
        enabled: true,
        maxVersions: 10
      },
      searchMetadata: {
        enabled: true,
        indexingStrategy: 'keyword'
      },
      traceOperation: 'start',
      eventIntegration: {
        enabled: false
      },
      ...overrides
    };
  }

  /**
   * 创建CreateTraceRequest测试数据
   */
  static createTraceRequest(overrides: Partial<CreateTraceRequest> = {}): CreateTraceRequest {
    return {
      contextId: 'ctx-test-001' as UUID,
      planId: 'plan-test-001' as UUID,
      taskId: 'task-test-001' as UUID,
      traceType: 'execution',
      severity: 'info',
      event: {
        type: 'start',
        name: 'Test Create Event',
        category: 'system',
        source: {
          component: 'test-creator'
        }
      },
      traceOperation: 'start',
      ...overrides
    };
  }

  /**
   * 创建UpdateTraceRequest测试数据
   */
  static createUpdateTraceRequest(traceId: UUID, overrides: Partial<UpdateTraceRequest> = {}): UpdateTraceRequest {
    return {
      traceId,
      severity: 'warn',
      event: {
        type: 'progress',
        name: 'Updated Event',
        category: 'user'
      },
      ...overrides
    };
  }

  /**
   * 创建TraceQueryFilter测试数据
   */
  static createTraceQueryFilter(overrides: Partial<TraceQueryFilter> = {}): TraceQueryFilter {
    return {
      traceType: 'execution',
      severity: 'info',
      contextId: 'ctx-test-001' as UUID,
      ...overrides
    };
  }

  /**
   * 创建TraceSchema测试数据
   */
  static createTraceSchema(overrides: Partial<TraceSchema> = {}): TraceSchema {
    const entityData = this.createTraceEntityData();
    // 这里应该使用TraceMapper.toSchema，但为了避免循环依赖，我们手动创建
    return {
      protocol_version: entityData.protocolVersion,
      timestamp: entityData.timestamp,
      trace_id: entityData.traceId,
      context_id: entityData.contextId,
      plan_id: entityData.planId,
      task_id: entityData.taskId,
      trace_type: entityData.traceType,
      severity: entityData.severity,
      event: {
        type: entityData.event.type,
        name: entityData.event.name,
        description: entityData.event.description,
        category: entityData.event.category,
        source: {
          component: entityData.event.source.component,
          module: entityData.event.source.module,
          function: entityData.event.source.function,
          line_number: entityData.event.source.lineNumber
        },
        data: entityData.event.data
      },
      audit_trail: entityData.auditTrail,
      performance_metrics: entityData.performanceMetrics,
      monitoring_integration: entityData.monitoringIntegration,
      version_history: entityData.versionHistory,
      search_metadata: entityData.searchMetadata,
      trace_operation: entityData.traceOperation,
      event_integration: entityData.eventIntegration,
      ...overrides
    } as TraceSchema;
  }

  /**
   * 创建测试用的UUID数组
   */
  static createTestUUIDs(count: number): UUID[] {
    return Array.from({ length: count }, (_, i) => `test-uuid-${i + 1}` as UUID);
  }

  /**
   * 创建测试用的TraceType数组
   */
  static getTestTraceTypes(): TraceType[] {
    return ['execution', 'monitoring', 'audit', 'performance', 'error', 'decision'];
  }

  /**
   * 创建测试用的Severity数组
   */
  static getTestSeverities(): Severity[] {
    return ['debug', 'info', 'warn', 'error', 'critical'];
  }

  /**
   * 创建测试用的EventType数组
   */
  static getTestEventTypes(): EventType[] {
    return ['start', 'progress', 'checkpoint', 'completion', 'failure', 'timeout', 'interrupt'];
  }

  /**
   * 创建测试用的EventCategory数组
   */
  static getTestEventCategories(): EventCategory[] {
    return ['system', 'user', 'external', 'automatic'];
  }

  /**
   * 创建测试用的TraceOperation数组
   */
  static getTestTraceOperations(): TraceOperation[] {
    return ['start', 'record', 'analyze', 'export', 'archive', 'update'];
  }

  /**
   * 创建事件对象 (用于DTO测试)
   */
  static createEventObject(overrides: Partial<EventObject> = {}): EventObject {
    return {
      type: 'start',
      name: 'Test Event',
      description: 'Test event description',
      category: 'system',
      source: {
        component: 'test-component',
        module: 'test-module',
        function: 'testFunction',
        lineNumber: 42
      },
      data: {
        testKey: 'testValue',
        timestamp: new Date().toISOString()
      },
      ...overrides
    };
  }
}
