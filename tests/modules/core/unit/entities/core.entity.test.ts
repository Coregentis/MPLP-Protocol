/**
 * Core实体单元测试
 * 测试CoreEntity的核心业务逻辑和验证机制
 * 遵循MPLP测试标准和零技术债务原则
 */

import { CoreEntity } from '../../../../../src/modules/core/domain/entities/core.entity';
import {
  UUID,
  Timestamp,
  Version,
  WorkflowConfig,
  ExecutionContext,
  ExecutionStatus,
  AuditTrail,
  MonitoringIntegration,
  PerformanceMetricsConfig,
  VersionHistory,
  SearchMetadata,
  EventIntegration,
  CoreOperation,
  WorkflowStage,
  WorkflowStatus,
  ExecutionMode,
  Priority,
  StageStatus,
  AuditEventType,
  ComplianceLevel,
  MonitoringProvider,
  ExportFormat,
  ChangeType,
  IndexingStrategy,
  SearchableField,
  IndexType,
  BusType,
  PublishedEvent,
  SubscribedEvent
} from '../../../../../src/modules/core/types';

describe('CoreEntity测试', () => {
  // ===== 测试数据工厂 =====
  
  const createValidCoreData = (): {
    protocolVersion: Version;
    timestamp: Timestamp;
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    executionStatus: ExecutionStatus;
    auditTrail: AuditTrail;
    monitoringIntegration: MonitoringIntegration;
    performanceMetrics: PerformanceMetricsConfig;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    coreOperation: CoreOperation;
    eventIntegration: EventIntegration;
  } => ({
    protocolVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    workflowId: '550e8400-e29b-41d4-a716-446655440001',
    orchestratorId: '550e8400-e29b-41d4-a716-446655440002',
    workflowConfig: {
      stages: ['context', 'plan'],
      parallelExecution: false,
      timeoutMs: 300000,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2
      },
      priority: 'medium',
      executionMode: 'sequential'
    },
    executionContext: {
      contextId: '550e8400-e29b-41d4-a716-446655440003',
      userId: '550e8400-e29b-41d4-a716-446655440004',
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      environment: 'test',
      metadata: {
        source: 'unit-test',
        version: '1.0.0'
      }
    },
    executionStatus: {
      currentStage: 'context',
      status: 'running',
      progress: 0.5,
      startTime: new Date().toISOString(),
      stageStatuses: [{
        stage: 'context',
        status: 'completed',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 1000,
        result: { success: true }
      }],
      errors: [],
      warnings: []
    },
    auditTrail: {
      events: [{
        eventId: '550e8400-e29b-41d4-a716-446655440006',
        eventType: 'workflow_started',
        timestamp: new Date().toISOString(),
        userId: '550e8400-e29b-41d4-a716-446655440004',
        details: { workflowId: '550e8400-e29b-41d4-a716-446655440001' },
        complianceLevel: 'standard'
      }],
      complianceLevel: 'standard',
      retentionPeriodDays: 365
    },
    monitoringIntegration: {
      providers: ['internal'],
      metricsEnabled: true,
      alertsEnabled: true,
      exportFormats: ['json'],
      customDashboards: []
    },
    performanceMetrics: {
      trackingEnabled: true,
      metricsToTrack: ['response_time', 'throughput'],
      aggregationIntervalMs: 60000,
      retentionPeriodDays: 30
    },
    versionHistory: {
      currentVersion: '1.0.0',
      changes: [{
        version: '1.0.0',
        changeType: 'created',
        timestamp: new Date().toISOString(),
        description: 'Initial version',
        author: 'system'
      }]
    },
    searchMetadata: {
      indexingStrategy: 'full_text',
      searchableFields: ['workflow_id', 'status'],
      indexTypes: ['btree'],
      lastIndexed: new Date().toISOString()
    },
    coreOperation: 'workflow_execution',
    eventIntegration: {
      busType: 'internal',
      publishedEvents: ['workflow_started'],
      subscribedEvents: ['module_completed'],
      eventFilters: []
    }
  });

  // ===== 构造函数测试 =====

  describe('构造函数', () => {
    it('应该成功创建有效的Core实体', () => {
      const validData = createValidCoreData();
      
      const coreEntity = new CoreEntity(validData);
      
      expect(coreEntity.protocolVersion).toBe(validData.protocolVersion);
      expect(coreEntity.workflowId).toBe(validData.workflowId);
      expect(coreEntity.orchestratorId).toBe(validData.orchestratorId);
      expect(coreEntity.workflowConfig).toEqual(validData.workflowConfig);
      expect(coreEntity.executionContext).toEqual(validData.executionContext);
      expect(coreEntity.executionStatus).toEqual(validData.executionStatus);
      expect(coreEntity.auditTrail).toEqual(validData.auditTrail);
      expect(coreEntity.monitoringIntegration).toEqual(validData.monitoringIntegration);
      expect(coreEntity.performanceMetrics).toEqual(validData.performanceMetrics);
      expect(coreEntity.versionHistory).toEqual(validData.versionHistory);
      expect(coreEntity.searchMetadata).toEqual(validData.searchMetadata);
      expect(coreEntity.coreOperation).toBe(validData.coreOperation);
      expect(coreEntity.eventIntegration).toEqual(validData.eventIntegration);
    });

    it('应该正确处理可选字段', () => {
      const validData = createValidCoreData();
      
      const coreEntity = new CoreEntity(validData);
      
      expect(coreEntity.moduleCoordination).toBeUndefined();
      expect(coreEntity.eventHandling).toBeUndefined();
      expect(coreEntity.coreDetails).toBeUndefined();
    });
  });

  // ===== 字段验证测试 =====

  describe('字段验证', () => {
    it('应该验证必需字段的存在', () => {
      const invalidData = createValidCoreData();
      // @ts-expect-error - 故意删除必需字段进行测试
      delete invalidData.protocolVersion;
      
      expect(() => new CoreEntity(invalidData)).toThrow();
    });

    it('应该验证workflowId格式', () => {
      const invalidData = createValidCoreData();
      invalidData.workflowId = '';
      
      expect(() => new CoreEntity(invalidData)).toThrow();
    });

    it('应该验证orchestratorId格式', () => {
      const invalidData = createValidCoreData();
      invalidData.orchestratorId = '';
      
      expect(() => new CoreEntity(invalidData)).toThrow();
    });
  });

  // ===== 业务逻辑测试 =====

  describe('业务逻辑', () => {
    it('应该正确初始化所有必需属性', () => {
      const validData = createValidCoreData();
      
      const coreEntity = new CoreEntity(validData);
      
      // 验证只读属性
      expect(coreEntity.protocolVersion).toBe('1.0.0');
      expect(coreEntity.timestamp).toBe(validData.timestamp);
      expect(coreEntity.workflowId).toBe(validData.workflowId);
      expect(coreEntity.orchestratorId).toBe(validData.orchestratorId);
      
      // 验证可变属性
      expect(coreEntity.workflowConfig).toEqual(validData.workflowConfig);
      expect(coreEntity.executionContext).toEqual(validData.executionContext);
      expect(coreEntity.executionStatus).toEqual(validData.executionStatus);
    });

    it('应该支持工作流配置更新', () => {
      const validData = createValidCoreData();
      const coreEntity = new CoreEntity(validData);
      
      const newConfig: WorkflowConfig = {
        ...validData.workflowConfig,
        priority: 'high',
        timeoutMs: 600000
      };
      
      coreEntity.workflowConfig = newConfig;
      
      expect(coreEntity.workflowConfig.priority).toBe('high');
      expect(coreEntity.workflowConfig.timeoutMs).toBe(600000);
    });

    it('应该支持执行状态更新', () => {
      const validData = createValidCoreData();
      const coreEntity = new CoreEntity(validData);
      
      const newStatus: ExecutionStatus = {
        ...validData.executionStatus,
        currentStage: 'plan',
        status: 'completed',
        progress: 1.0
      };
      
      coreEntity.executionStatus = newStatus;
      
      expect(coreEntity.executionStatus.currentStage).toBe('plan');
      expect(coreEntity.executionStatus.status).toBe('completed');
      expect(coreEntity.executionStatus.progress).toBe(1.0);
    });
  });

  // ===== 边界条件测试 =====

  describe('边界条件', () => {
    it('应该处理最小有效配置', () => {
      const minimalData = createValidCoreData();
      
      const coreEntity = new CoreEntity(minimalData);
      
      expect(coreEntity).toBeDefined();
      expect(coreEntity.moduleCoordination).toBeUndefined();
      expect(coreEntity.eventHandling).toBeUndefined();
      expect(coreEntity.coreDetails).toBeUndefined();
    });

    it('应该处理空数组和空对象', () => {
      const validData = createValidCoreData();
      validData.executionStatus.stageStatuses = [];
      validData.executionStatus.errors = [];
      validData.executionStatus.warnings = [];
      validData.auditTrail.events = [];
      
      const coreEntity = new CoreEntity(validData);
      
      expect(coreEntity.executionStatus.stageStatuses).toEqual([]);
      expect(coreEntity.executionStatus.errors).toEqual([]);
      expect(coreEntity.executionStatus.warnings).toEqual([]);
      expect(coreEntity.auditTrail.events).toEqual([]);
    });
  });
});
