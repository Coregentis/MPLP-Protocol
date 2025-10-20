/**
 * Core DTO测试 - 基于实际代码
 * 
 * @description 基于实际CoreDto接口的测试，遵循RBCT方法论
 * @version 1.0.0
 * @layer API层测试 - DTO
 */

import {
  CoreDto,
  WorkflowConfigDto,
  ExecutionContextDto,
  ExecutionStatusDto,
  ModuleCoordinationDto,
  EventHandlingDto,
  AuditTrailDto,
  MonitoringIntegrationDto,
  PerformanceMetricsConfigDto,
  VersionHistoryDto,
  SearchMetadataDto,
  EventIntegrationDto,
  CoreDetailsDto,
  AuditEventDto,
  ComplianceSettingsDto,
  IntegrationEndpointsDto,
  SystemMetricsDto,
  PerformanceMetricsDto,
  HealthCheckDto,
  HealthStatusDto
} from '../../../api/dto/core.dto';

import {
  UUID,
  Version,
  Timestamp,
  WorkflowStageType,
  ExecutionModeType,
  PriorityType,
  WorkflowStatusType,
  StageStatus,
  EventType,
  ComplianceLevel,
  AuditEventType,
  MonitoringProvider,
  ExportFormat,
  ChangeType,
  IndexingStrategy,
  SearchableField,
  IndexType,
  HealthStatus,
  NotificationChannel,
  CheckStatus,
  BusType,
  PublishedEvent,
  SubscribedEvent,
  OrchestrationMode,
  ResourceAllocation,
  FaultTolerance,
  CoreOperation
} from '../../../types';

// 生成符合UUID v4格式的ID
const generateUUIDv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 创建测试用的DTO工厂函数
function createTestCoreDto(): CoreDto {
  return {
    protocolVersion: '1.0.0' as Version,
    timestamp: new Date().toISOString() as Timestamp,
    workflowId: generateUUIDv4() as UUID,
    orchestratorId: generateUUIDv4() as UUID,
    workflowConfig: {
      name: 'test-workflow',
      description: 'Test workflow DTO',
      stages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType],
      executionMode: 'sequential' as ExecutionModeType,
      parallelExecution: false,
      timeoutMs: 300000,
      priority: 'medium' as PriorityType,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2
      }
    } as WorkflowConfigDto,
    executionContext: {
      userId: 'user-test-001',
      sessionId: 'session-test-001',
      requestId: generateUUIDv4() as UUID,
      priority: 'medium' as PriorityType,
      metadata: { source: 'test' },
      variables: { testMode: true }
    } as ExecutionContextDto,
    executionStatus: {
      status: 'running' as WorkflowStatusType,
      currentStage: 'context' as WorkflowStageType,
      stageStatuses: {
        context: 'completed' as StageStatus,
        plan: 'pending' as StageStatus
      },
      progress: 50,
      startTime: new Date().toISOString() as Timestamp,
      estimatedEndTime: new Date(Date.now() + 300000).toISOString() as Timestamp,
      lastUpdated: new Date().toISOString() as Timestamp
    } as ExecutionStatusDto,
    auditTrail: {
      enabled: true,
      retentionDays: 90,
      auditEvents: [],
      complianceSettings: {
        level: 'standard' as ComplianceLevel,
        requirements: ['data_protection', 'audit_logging'],
        certifications: ['ISO27001']
      } as ComplianceSettingsDto
    } as AuditTrailDto,
    monitoringIntegration: {
      enabled: true,
      supportedProviders: ['prometheus' as MonitoringProvider, 'grafana' as MonitoringProvider],
      integrationEndpoints: {
        metricsApi: 'http://localhost:9090/metrics',
        systemHealthApi: 'http://localhost:3000/health'
      } as IntegrationEndpointsDto,
      systemMetrics: {
        trackWorkflowExecution: true,
        trackModuleCoordination: true,
        trackResourceUsage: true,
        trackSystemHealth: true
      } as SystemMetricsDto,
      exportFormats: ['prometheus' as ExportFormat, 'opentelemetry' as ExportFormat]
    } as MonitoringIntegrationDto,
    performanceMetrics: {
      enabled: true,
      collectionIntervalSeconds: 60,
      metrics: {
        coreOrchestrationLatencyMs: 150,
        workflowCoordinationEfficiencyScore: 0.92,
        systemReliabilityScore: 0.98
      },
      healthStatus: {
        status: 'healthy' as HealthStatus,
        lastCheck: new Date().toISOString() as Timestamp,
        checks: []
      }
    } as PerformanceMetricsConfigDto,
    versionHistory: {
      enabled: true,
      maxVersions: 50,
      versions: [{
        versionId: generateUUIDv4(),
        versionNumber: 1,
        createdAt: new Date().toISOString() as Timestamp,
        createdBy: 'system',
        changeSummary: 'Initial version',
        changeType: 'created' as ChangeType
      }]
    } as VersionHistoryDto,
    searchMetadata: {
      enabled: true,
      indexingStrategy: 'hybrid' as IndexingStrategy,
      searchableFields: ['workflowId' as SearchableField, 'orchestratorId' as SearchableField],
      searchIndexes: [{
        indexId: 'idx-workflow-001',
        indexName: 'workflowId_index',
        fields: ['workflowId'],
        indexType: 'btree' as IndexType,
        createdAt: new Date().toISOString() as Timestamp,
        lastUpdated: new Date().toISOString() as Timestamp
      }]
    } as SearchMetadataDto,
    coreOperation: 'workflow_execution' as CoreOperation,
    eventIntegration: {
      enabled: true,
      publishedEvents: ['workflow_created' as PublishedEvent, 'workflow_completed' as PublishedEvent],
      subscribedEvents: ['context_updated' as SubscribedEvent, 'plan_executed' as SubscribedEvent]
    } as EventIntegrationDto
  };
}

describe('Core DTO测试', () => {
  describe('CoreDto接口测试', () => {
    it('应该创建有效的CoreDto对象', () => {
      const coreDto = createTestCoreDto();

      expect(coreDto).toBeDefined();
      expect(coreDto.protocolVersion).toBe('1.0.0');
      expect(coreDto.workflowId).toBeDefined();
      expect(coreDto.orchestratorId).toBeDefined();
      expect(coreDto.workflowConfig).toBeDefined();
      expect(coreDto.executionContext).toBeDefined();
      expect(coreDto.executionStatus).toBeDefined();
      expect(coreDto.auditTrail).toBeDefined();
      expect(coreDto.monitoringIntegration).toBeDefined();
      expect(coreDto.performanceMetrics).toBeDefined();
      expect(coreDto.versionHistory).toBeDefined();
      expect(coreDto.searchMetadata).toBeDefined();
      expect(coreDto.coreOperation).toBeDefined();
      expect(coreDto.eventIntegration).toBeDefined();
    });

    it('应该包含所有必需字段', () => {
      const coreDto = createTestCoreDto();

      // 验证必需字段存在
      expect(coreDto.protocolVersion).toBeDefined();
      expect(coreDto.timestamp).toBeDefined();
      expect(coreDto.workflowId).toBeDefined();
      expect(coreDto.orchestratorId).toBeDefined();
      expect(coreDto.workflowConfig).toBeDefined();
      expect(coreDto.executionContext).toBeDefined();
      expect(coreDto.executionStatus).toBeDefined();
      expect(coreDto.auditTrail).toBeDefined();
      expect(coreDto.monitoringIntegration).toBeDefined();
      expect(coreDto.performanceMetrics).toBeDefined();
      expect(coreDto.versionHistory).toBeDefined();
      expect(coreDto.searchMetadata).toBeDefined();
      expect(coreDto.coreOperation).toBeDefined();
      expect(coreDto.eventIntegration).toBeDefined();
    });
  });

  describe('WorkflowConfigDto接口测试', () => {
    it('应该创建有效的WorkflowConfigDto对象', () => {
      const workflowConfig: WorkflowConfigDto = {
        name: 'test-workflow',
        description: 'Test workflow configuration',
        stages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType, 'confirm' as WorkflowStageType],
        executionMode: 'parallel' as ExecutionModeType,
        parallelExecution: true,
        timeoutMs: 600000,
        priority: 'high' as PriorityType,
        retryPolicy: {
          maxAttempts: 5,
          delayMs: 2000,
          backoffFactor: 1.5
        }
      };

      expect(workflowConfig).toBeDefined();
      expect(workflowConfig.name).toBe('test-workflow');
      expect(workflowConfig.stages).toHaveLength(3);
      expect(workflowConfig.executionMode).toBe('parallel');
      expect(workflowConfig.parallelExecution).toBe(true);
      expect(workflowConfig.priority).toBe('high');
      expect(workflowConfig.retryPolicy).toBeDefined();
      expect(workflowConfig.retryPolicy?.maxAttempts).toBe(5);
    });
  });

  describe('ExecutionContextDto接口测试', () => {
    it('应该创建有效的ExecutionContextDto对象', () => {
      const executionContext: ExecutionContextDto = {
        userId: 'user-123',
        sessionId: 'session-456',
        requestId: generateUUIDv4() as UUID,
        priority: 'critical' as PriorityType,
        metadata: { 
          source: 'api',
          version: '1.0.0',
          environment: 'production'
        },
        variables: { 
          debug: false,
          timeout: 300000,
          retries: 3
        }
      };

      expect(executionContext).toBeDefined();
      expect(executionContext.userId).toBe('user-123');
      expect(executionContext.sessionId).toBe('session-456');
      expect(executionContext.requestId).toBeDefined();
      expect(executionContext.priority).toBe('critical');
      expect(executionContext.metadata).toBeDefined();
      expect(executionContext.metadata?.source).toBe('api');
      expect(executionContext.variables).toBeDefined();
      expect(executionContext.variables?.debug).toBe(false);
    });
  });

  describe('ExecutionStatusDto接口测试', () => {
    it('应该创建有效的ExecutionStatusDto对象', () => {
      const executionStatus: ExecutionStatusDto = {
        status: 'completed' as WorkflowStatusType,
        currentStage: 'confirm' as WorkflowStageType,
        completedStages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType, 'confirm' as WorkflowStageType],
        stageResults: {
          context: { status: 'completed' as StageStatus, result: { success: true } },
          plan: { status: 'completed' as StageStatus, result: { success: true } },
          confirm: { status: 'completed' as StageStatus, result: { success: true } }
        },
        startTime: new Date('2025-01-01T10:00:00Z').toISOString() as Timestamp,
        endTime: new Date('2025-01-01T10:05:00Z').toISOString() as Timestamp,
        durationMs: 300000,
        retryCount: 0
      };

      expect(executionStatus).toBeDefined();
      expect(executionStatus.status).toBe('completed');
      expect(executionStatus.currentStage).toBe('confirm');
      expect(executionStatus.completedStages).toHaveLength(3);
      expect(executionStatus.stageResults).toBeDefined();
      expect(executionStatus.stageResults?.context?.status).toBe('completed');
      expect(executionStatus.startTime).toBeDefined();
      expect(executionStatus.endTime).toBeDefined();
    });
  });

  describe('AuditTrailDto接口测试', () => {
    it('应该创建有效的AuditTrailDto对象', () => {
      const auditEvent: AuditEventDto = {
        eventId: generateUUIDv4(),
        eventType: 'workflow_created' as AuditEventType,
        timestamp: new Date().toISOString() as Timestamp,
        userId: 'user-audit-001',
        userRole: 'admin',
        action: 'CREATE_WORKFLOW',
        resource: 'workflow',
        systemOperation: 'workflow_creation',
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        coreOperation: 'workflow_execution',
        coreStatus: 'created',
        moduleIds: ['context', 'plan'],
        coreDetails: { workflowName: 'test-workflow' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        sessionId: 'session-audit-001',
        correlationId: generateUUIDv4() as UUID
      };

      const auditTrail: AuditTrailDto = {
        enabled: true,
        retentionDays: 365,
        auditEvents: [auditEvent],
        complianceSettings: {
          gdprEnabled: true,
          hipaaEnabled: true,
          soxEnabled: true,
          coreAuditLevel: 'high' as ComplianceLevel,
          coreDataLogging: true,
          customCompliance: ['ISO27001', 'SOC2']
        }
      };

      expect(auditTrail).toBeDefined();
      expect(auditTrail.enabled).toBe(true);
      expect(auditTrail.retentionDays).toBe(365);
      expect(auditTrail.auditEvents).toHaveLength(1);
      expect(auditTrail.auditEvents?.[0].eventType).toBe('workflow_created');
      expect(auditTrail.complianceSettings).toBeDefined();
      expect(auditTrail.complianceSettings?.coreAuditLevel).toBe('high');
    });
  });

  describe('MonitoringIntegrationDto接口测试', () => {
    it('应该创建有效的MonitoringIntegrationDto对象', () => {
      const monitoringIntegration: MonitoringIntegrationDto = {
        enabled: true,
        supportedProviders: [
          'prometheus' as MonitoringProvider,
          'grafana' as MonitoringProvider,
          'datadog' as MonitoringProvider
        ],
        integrationEndpoints: {
          metricsApi: 'http://prometheus:9090/metrics',
          systemHealthApi: 'http://grafana:3000/api/health',
          workflowMetricsApi: 'http://datadog:8080/v1/metrics',
          resourceMetricsApi: 'http://monitoring:8081/resources'
        },
        systemMetrics: {
          trackWorkflowExecution: true,
          trackModuleCoordination: true,
          trackResourceUsage: true,
          trackSystemHealth: true
        },
        exportFormats: [
          'prometheus' as ExportFormat,
          'opentelemetry' as ExportFormat,
          'custom' as ExportFormat
        ]
      };

      expect(monitoringIntegration).toBeDefined();
      expect(monitoringIntegration.enabled).toBe(true);
      expect(monitoringIntegration.supportedProviders).toHaveLength(3);
      expect(monitoringIntegration.integrationEndpoints).toBeDefined();
      expect(monitoringIntegration.systemMetrics).toBeDefined();
      expect(monitoringIntegration.exportFormats).toHaveLength(3);
    });
  });

  describe('PerformanceMetricsDto接口测试', () => {
    it('应该创建有效的PerformanceMetricsDto对象', () => {
      const performanceMetrics: PerformanceMetricsDto = {
        coreOrchestrationLatencyMs: 150,
        workflowCoordinationEfficiencyScore: 0.92,
        systemReliabilityScore: 0.98,
        moduleIntegrationSuccessPercent: 99.5,
        coreManagementEfficiencyScore: 0.87,
        activeWorkflowsCount: 25,
        coreOperationsPerSecond: 1200,
        coreMemoryUsageMb: 512,
        averageWorkflowComplexityScore: 0.75
      };

      expect(performanceMetrics).toBeDefined();
      expect(performanceMetrics.coreOrchestrationLatencyMs).toBe(150);
      expect(performanceMetrics.workflowCoordinationEfficiencyScore).toBe(0.92);
      expect(performanceMetrics.systemReliabilityScore).toBe(0.98);
      expect(performanceMetrics.activeWorkflowsCount).toBe(25);
      expect(performanceMetrics.coreOperationsPerSecond).toBe(1200);
    });
  });

  describe('HealthCheckDto接口测试', () => {
    it('应该创建有效的HealthCheckDto对象', () => {
      const healthCheck: HealthCheckDto = {
        checkName: 'database_connectivity',
        status: 'pass' as CheckStatus,
        message: 'Database connection successful',
        durationMs: 45
      };

      expect(healthCheck).toBeDefined();
      expect(healthCheck.checkName).toBe('database_connectivity');
      expect(healthCheck.status).toBe('pass');
      expect(healthCheck.message).toBe('Database connection successful');
      expect(healthCheck.durationMs).toBe(45);
    });
  });

  describe('HealthStatusDto接口测试', () => {
    it('应该创建有效的HealthStatusDto对象', () => {
      const healthStatus: HealthStatusDto = {
        status: 'healthy' as HealthStatus,
        lastCheck: new Date().toISOString() as Timestamp,
        checks: [
          {
            checkName: 'api_response',
            status: 'pass' as CheckStatus,
            message: 'API responding normally',
            durationMs: 25
          },
          {
            checkName: 'memory_usage',
            status: 'warn' as CheckStatus,
            message: 'Memory usage at 85%',
            durationMs: 10
          }
        ]
      };

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.lastCheck).toBeDefined();
      expect(healthStatus.checks).toHaveLength(2);
      expect(healthStatus.checks?.[0].status).toBe('pass');
      expect(healthStatus.checks?.[1].status).toBe('warn');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理可选字段为undefined', () => {
      const minimalCoreDto: Partial<CoreDto> = {
        protocolVersion: '1.0.0' as Version,
        timestamp: new Date().toISOString() as Timestamp,
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        coreOperation: 'workflow_execution' as CoreOperation
      };

      expect(minimalCoreDto.protocolVersion).toBeDefined();
      expect(minimalCoreDto.workflowId).toBeDefined();
      expect(minimalCoreDto.moduleCoordination).toBeUndefined();
      expect(minimalCoreDto.eventHandling).toBeUndefined();
      expect(minimalCoreDto.coreDetails).toBeUndefined();
    });

    it('应该处理空数组和空对象', () => {
      const emptyArraysDto: Partial<CoreDto> = {
        versionHistory: {
          enabled: false,
          maxVersions: 0,
          versions: []
        },
        searchMetadata: {
          enabled: false,
          indexingStrategy: 'keyword' as IndexingStrategy,
          searchableFields: [],
          searchIndexes: []
        }
      };

      expect(emptyArraysDto.versionHistory?.versions).toEqual([]);
      expect(emptyArraysDto.searchMetadata?.searchableFields).toEqual([]);
      expect(emptyArraysDto.searchMetadata?.searchIndexes).toEqual([]);
    });
  });
});
