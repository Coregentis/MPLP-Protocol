/**
 * Core管理服务单元测试
 * 测试CoreManagementService的核心业务逻辑
 * 遵循MPLP测试标准和Mock最佳实践
 */

import { CoreManagementService } from '../../../../../src/modules/core/application/services/core-management.service';
import { CoreEntity } from '../../../../../src/modules/core/domain/entities/core.entity';
import { CoreRepositoryInterface } from '../../../../../src/modules/core/domain/repositories/core-repository.interface';
import {
  UUID,
  WorkflowConfig,
  ExecutionContext,
  ExecutionStatus,
  AuditTrail,
  MonitoringIntegration,
  PerformanceMetricsConfig,
  VersionHistory,
  SearchMetadata,
  EventIntegration,
  CoreDetails,
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

// ===== Mock仓储接口 =====
const mockCoreRepository: jest.Mocked<CoreRepositoryInterface> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByWorkflowId: jest.fn(),
  findByOrchestratorId: jest.fn(),
  findByStatus: jest.fn(),
  findByStage: jest.fn(),
  findByOperation: jest.fn(),
  findByDateRange: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  exists: jest.fn()
};

describe('CoreManagementService测试', () => {
  let coreManagementService: CoreManagementService;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    jest.resetAllMocks();

    // 创建服务实例
    coreManagementService = new CoreManagementService(mockCoreRepository);
  });

  // ===== 测试数据工厂 =====
  
  const createWorkflowData = () => ({
    workflowId: '550e8400-e29b-41d4-a716-446655440000',
    orchestratorId: '550e8400-e29b-41d4-a716-446655440001',
    workflowConfig: {
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
      parallelExecution: false,
      timeoutMs: 300000,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2
      },
      priority: Priority.MEDIUM,
      executionMode: ExecutionMode.SEQUENTIAL
    } as WorkflowConfig,
    executionContext: {
      contextId: 'context-test-001',
      userId: 'user-test-001',
      sessionId: 'session-test-001',
      environment: 'test',
      metadata: {
        source: 'unit-test',
        version: '1.0.0'
      }
    } as ExecutionContext,
    coreOperation: 'workflow_execution' as CoreOperation,
    coreDetails: {
      description: 'Test workflow',
      tags: ['test', 'unit'],
      priority: Priority.MEDIUM,
      estimatedDurationMs: 300000,
      resourceRequirements: {
        cpuCores: 2,
        memoryMb: 1024,
        diskSpaceMb: 512,
        networkBandwidthMbps: 10,
        priority: 'medium',
        estimatedDurationMs: 300000
      }
    } as CoreDetails
  });

  const createMockCoreEntity = (): CoreEntity => {
    const data = createWorkflowData();
    return new CoreEntity({
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      workflowId: '550e8400-e29b-41d4-a716-446655440000',
      orchestratorId: data.orchestratorId,
      workflowConfig: data.workflowConfig,
      executionContext: data.executionContext,
      executionStatus: {
        currentStage: WorkflowStage.CONTEXT,
        status: WorkflowStatus.PENDING,
        progress: 0,
        startTime: new Date().toISOString(),
        stageStatuses: [],
        errors: [],
        warnings: []
      } as ExecutionStatus,
      auditTrail: {
        enabled: true,
        retentionDays: 365,
        auditEvents: [],
        complianceSettings: {
          complianceLevel: 'standard' as ComplianceLevel
        }
      } as AuditTrail,
      monitoringIntegration: {
        providers: ['internal' as MonitoringProvider],
        metricsEnabled: true,
        alertsEnabled: true,
        exportFormats: ['json' as ExportFormat],
        customDashboards: []
      } as MonitoringIntegration,
      performanceMetrics: {
        trackingEnabled: true,
        metricsToTrack: ['response_time', 'throughput'],
        aggregationIntervalMs: 60000,
        retentionPeriodDays: 30
      } as PerformanceMetricsConfig,
      versionHistory: {
        currentVersion: '1.0.0',
        changes: [{
          version: '1.0.0',
          changeType: 'created' as ChangeType,
          timestamp: new Date().toISOString(),
          description: 'Initial version',
          author: 'system'
        }]
      } as VersionHistory,
      searchMetadata: {
        enabled: true,
        indexingStrategy: 'full_text' as IndexingStrategy,
        searchableFields: ['workflow_id' as SearchableField, 'execution_status' as SearchableField],
        searchIndexes: [{
          indexId: 'idx-001',
          indexName: 'workflow_index',
          fields: ['workflow_id', 'execution_status'],
          indexType: 'btree' as IndexType,
          createdAt: new Date().toISOString()
        }]
      } as SearchMetadata,
      coreOperation: data.coreOperation,
      coreDetails: data.coreDetails,
      eventIntegration: {
        enabled: true,
        eventBusConnection: {
          busType: 'kafka' as BusType,
          connectionString: 'localhost:9092',
          topicPrefix: 'mplp',
          consumerGroup: 'core-group'
        },
        publishedEvents: ['workflow_executed' as PublishedEvent, 'system_started' as PublishedEvent],
        subscribedEvents: ['context_updated' as SubscribedEvent, 'plan_executed' as SubscribedEvent],
        eventRouting: {
          routingRules: [{
            ruleId: 'default-routing',
            condition: 'event.type === "workflow_started"',
            targetTopic: 'core.workflow.events',
            enabled: true
          }]
        }
      } as EventIntegration
    });
  };

  // ===== 工作流创建测试 =====

  describe('createWorkflow', () => {
    it('应该成功创建新工作流', async () => {
      const workflowData = createWorkflowData();
      mockCoreRepository.save.mockResolvedValue(undefined);

      const result = await coreManagementService.createWorkflow(workflowData);

      expect(result).toBeInstanceOf(CoreEntity);
      expect(result.orchestratorId).toBe(workflowData.orchestratorId);
      expect(result.workflowConfig).toEqual(workflowData.workflowConfig);
      expect(result.executionContext).toEqual(workflowData.executionContext);
      expect(result.coreOperation).toBe(workflowData.coreOperation);
      expect(result.coreDetails).toEqual(workflowData.coreDetails);
      
      // 验证初始状态
      expect(result.executionStatus.status).toBe(WorkflowStatus.CREATED);
      expect(result.executionStatus.currentStage).toBe(workflowData.workflowConfig.stages[0]);
      expect(result.executionStatus.completedStages).toEqual([]);
      
      // 验证仓储调用
      expect(mockCoreRepository.save).toHaveBeenCalledWith(result);
    });

    it('应该生成唯一的工作流ID', async () => {
      const workflowData1 = createWorkflowData();
      const workflowData2 = { ...createWorkflowData(), workflowId: '550e8400-e29b-41d4-a716-446655440002' };
      mockCoreRepository.save.mockResolvedValue(undefined);

      const result1 = await coreManagementService.createWorkflow(workflowData1);
      const result2 = await coreManagementService.createWorkflow(workflowData2);

      expect(result1.workflowId).not.toBe(result2.workflowId);
      expect(result1.workflowId).toBe(workflowData1.workflowId);
      expect(result2.workflowId).toBe(workflowData2.workflowId);
    });

    it('应该正确初始化审计跟踪', async () => {
      const workflowData = createWorkflowData();
      mockCoreRepository.save.mockResolvedValue(undefined);

      const result = await coreManagementService.createWorkflow(workflowData);

      expect(result.auditTrail.auditEvents).toHaveLength(1);
      expect(result.auditTrail.auditEvents[0].eventType).toBe('workflow_started');
      expect(result.auditTrail.auditEvents[0].userId).toBe(workflowData.executionContext.userId);
      expect(result.auditTrail.complianceSettings?.coreAuditLevel).toBe('basic');
    });

    it('应该处理仓储保存错误', async () => {
      const workflowData = createWorkflowData();
      const saveError = new Error('Database connection failed');
      mockCoreRepository.save.mockRejectedValue(saveError);

      await expect(coreManagementService.createWorkflow(workflowData)).rejects.toThrow(saveError);
    });
  });

  // ===== 工作流查询测试 =====

  describe('getWorkflowById', () => {
    it('应该成功获取存在的工作流', async () => {
      const workflowId = 'workflow-test-001';
      const mockEntity = createMockCoreEntity();
      mockCoreRepository.findById.mockResolvedValue(mockEntity);

      const result = await coreManagementService.getWorkflowById(workflowId);

      expect(result).toBe(mockEntity);
      expect(mockCoreRepository.findById).toHaveBeenCalledWith(workflowId);
    });

    it('应该返回null当工作流不存在时', async () => {
      const workflowId = 'non-existent-workflow';
      mockCoreRepository.findById.mockResolvedValue(null);

      const result = await coreManagementService.getWorkflowById(workflowId);

      expect(result).toBeNull();
      expect(mockCoreRepository.findById).toHaveBeenCalledWith(workflowId);
    });

    it('应该处理仓储查询错误', async () => {
      const workflowId = 'workflow-test-001';
      const queryError = new Error('Database query failed');
      mockCoreRepository.findById.mockRejectedValue(queryError);

      await expect(coreManagementService.getWorkflowById(workflowId)).rejects.toThrow(queryError);
    });
  });

  // ===== 工作流状态更新测试 =====

  describe('updateWorkflowStatus', () => {
    it('应该成功更新工作流状态', async () => {
      const workflowId = 'workflow-test-001';
      const newStatus = WorkflowStatus.RUNNING;

      const mockEntity = createMockCoreEntity();
      mockCoreRepository.findById.mockResolvedValue(mockEntity);
      mockCoreRepository.update.mockResolvedValue(undefined);

      const result = await coreManagementService.updateWorkflowStatus(
        workflowId,
        newStatus
      );

      expect(result).toBe(mockEntity);
      expect(result.executionStatus.status).toBe(newStatus);
      // 验证审计事件添加
      expect(result.auditTrail.auditEvents).toHaveLength(1);
      expect(result.auditTrail.auditEvents[0].eventType).toBe('workflow_failed');

      expect(mockCoreRepository.save).toHaveBeenCalledWith(mockEntity);
    });

    it('应该抛出错误当工作流不存在时', async () => {
      const workflowId = 'non-existent-workflow';
      mockCoreRepository.findById.mockResolvedValue(null);

      await expect(
        coreManagementService.updateWorkflowStatus(
          workflowId,
          WorkflowStatus.RUNNING
        )
      ).rejects.toThrow(`Workflow not found: ${workflowId}`);
    });
  });

  // ===== 工作流删除测试 =====

  describe('deleteWorkflow', () => {
    it('应该成功删除存在的工作流', async () => {
      const workflowId = 'workflow-test-001';
      const mockEntity = createMockCoreEntity();
      mockCoreRepository.findById.mockResolvedValue(mockEntity);
      mockCoreRepository.delete.mockResolvedValue(true);

      const result = await coreManagementService.deleteWorkflow(workflowId);

      expect(result).toBe(true);
      expect(mockCoreRepository.delete).toHaveBeenCalledWith(workflowId);
    });

    it('应该返回false当工作流不存在时', async () => {
      const workflowId = 'non-existent-workflow';
      mockCoreRepository.findById.mockResolvedValue(null);

      const result = await coreManagementService.deleteWorkflow(workflowId);

      expect(result).toBe(false);
      expect(mockCoreRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ===== 工作流列表查询测试 =====

  describe('getAllWorkflows', () => {
    it('应该成功获取工作流列表', async () => {
      const mockEntities = [createMockCoreEntity(), createMockCoreEntity()];
      mockCoreRepository.findAll.mockResolvedValue(mockEntities);

      const result = await coreManagementService.getAllWorkflows();

      expect(result).toBe(mockEntities);
      expect(result).toHaveLength(2);
      expect(mockCoreRepository.findAll).toHaveBeenCalled();
    });

    it('应该返回空数组当没有工作流时', async () => {
      mockCoreRepository.findAll.mockResolvedValue([]);

      const result = await coreManagementService.getAllWorkflows();

      expect(result).toEqual([]);
      expect(mockCoreRepository.findAll).toHaveBeenCalled();
    });
  });
});
