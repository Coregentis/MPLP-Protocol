/**
 * Core管理服务测试
 * 基于RBCT方法论的完整测试覆盖
 */

import { CoreManagementService } from '../../../../../src/modules/core/application/services/core-management.service';
import { CoreEntity } from '../../../../../src/modules/core/domain/entities/core.entity';
import { ICoreRepository } from '../../../../../src/modules/core/domain/repositories/core-repository.interface';
import {
  UUID,
  WorkflowConfig,
  ExecutionContext,
  ExecutionStatus,
  CoreOperation,
  CoreDetails,
  WorkflowStatusType,
  WorkflowStageType,
  AuditEventType,
  AuditTrail,
  MonitoringIntegration,
  PerformanceMetricsConfig,
  VersionHistory,
  SearchMetadata,
  EventIntegration
} from '../../../../../src/modules/core/types';

describe('CoreManagementService', () => {
  let service: CoreManagementService;
  let mockRepository: jest.Mocked<ICoreRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByWorkflowId: jest.fn(),
      findByOrchestratorId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByStage: jest.fn(),
      findByDateRange: jest.fn(),
      getExecutionHistory: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      searchByMetadata: jest.fn()
    } as jest.Mocked<ICoreRepository>;

    service = new CoreManagementService(mockRepository);
  });

  describe('createWorkflow', () => {
    const mockWorkflowData = {
      workflowId: '550e8400-e29b-41d4-a716-446655440000' as UUID,
      orchestratorId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' as UUID,
      workflowConfig: {
        name: 'Test Workflow',
        description: 'Test workflow description',
        version: '1.0.0',
        stages: [],
        timeout: 30000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential' as const,
          initialDelay: 1000
        }
      } as WorkflowConfig,
      executionContext: {
        environment: 'test',
        userId: 'user-789' as UUID,
        sessionId: 'session-abc' as UUID,
        metadata: {},
        permissions: [],
        resources: {}
      } as ExecutionContext,
      coreOperation: {
        operationType: 'workflow_execution',
        operationId: 'op-123' as UUID,
        priority: 'normal' as const,
        metadata: {}
      } as CoreOperation
    };

    it('应该成功创建工作流', async () => {
      // Arrange - 创建一个mock实体用于repository返回
      const mockEntity = new CoreEntity({
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        workflowId: mockWorkflowData.workflowId,
        orchestratorId: mockWorkflowData.orchestratorId,
        workflowConfig: mockWorkflowData.workflowConfig,
        executionContext: mockWorkflowData.executionContext,
        executionStatus: {} as ExecutionStatus,
        auditTrail: {} as AuditTrail,
        monitoringIntegration: {} as MonitoringIntegration,
        performanceMetrics: {} as PerformanceMetricsConfig,
        versionHistory: {} as VersionHistory,
        searchMetadata: {} as SearchMetadata,
        eventIntegration: {} as EventIntegration,
        coreOperation: mockWorkflowData.coreOperation
      });

      mockRepository.save.mockResolvedValue(mockEntity);

      // Act
      const result = await service.createWorkflow(mockWorkflowData);

      // Assert - 验证结果包含必要的字段，而不是精确匹配
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(mockWorkflowData.workflowId);
      expect(result.orchestratorId).toBe(mockWorkflowData.orchestratorId);
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.auditTrail).toBeDefined();
      expect(result.executionStatus).toBeDefined();
      expect(result.monitoringIntegration).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(CoreEntity));
    });

    it('应该处理创建工作流时的错误', async () => {
      // Arrange
      const error = new Error('Repository error');
      mockRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createWorkflow(mockWorkflowData)).rejects.toThrow('Repository error');
    });

    it('应该使用提供的coreDetails创建工作流', async () => {
      // Arrange
      const dataWithDetails = {
        ...mockWorkflowData,
        coreDetails: {
          description: 'Detailed description',
          tags: ['test', 'workflow'],
          category: 'automation',
          owner: 'user-789' as UUID
        } as CoreDetails
      };

      const mockEntity = new CoreEntity({
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        workflowId: dataWithDetails.workflowId,
        orchestratorId: dataWithDetails.orchestratorId,
        workflowConfig: dataWithDetails.workflowConfig,
        executionContext: dataWithDetails.executionContext,
        executionStatus: {} as ExecutionStatus,
        auditTrail: {} as AuditTrail,
        monitoringIntegration: {} as MonitoringIntegration,
        performanceMetrics: {} as PerformanceMetricsConfig,
        versionHistory: {} as VersionHistory,
        searchMetadata: {} as SearchMetadata,
        eventIntegration: {} as EventIntegration,
        coreOperation: dataWithDetails.coreOperation,
        coreDetails: dataWithDetails.coreDetails
      });

      mockRepository.save.mockResolvedValue(mockEntity);

      // Act
      const result = await service.createWorkflow(dataWithDetails);

      // Assert - 验证结果包含必要的字段和coreDetails
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(dataWithDetails.workflowId);
      expect(result.coreDetails).toEqual(dataWithDetails.coreDetails);
      expect(result.auditTrail).toBeDefined();
      expect(result.executionStatus).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(CoreEntity));
    });
  });

  describe('executeWorkflow', () => {
    const workflowId = '550e8400-e29b-41d4-a716-446655440000' as UUID;
    const mockEntity = new CoreEntity({
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      workflowId: workflowId,
      orchestratorId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' as UUID,
      workflowConfig: {} as WorkflowConfig,
      executionContext: {} as ExecutionContext,

      executionStatus: {} as ExecutionStatus,
      auditTrail: {} as AuditTrail,
      monitoringIntegration: {} as MonitoringIntegration,
      performanceMetrics: {} as PerformanceMetricsConfig,
      versionHistory: {} as VersionHistory,
      searchMetadata: {} as SearchMetadata,
      coreOperation: {} as CoreOperation,
      eventIntegration: {} as EventIntegration
    });

    it('应该成功执行工作流', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      // Act
      const result = await service.executeWorkflow(workflowId);

      // Assert
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(workflowId);
      expect(mockRepository.findById).toHaveBeenCalledWith(workflowId);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('应该处理工作流不存在的情况', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.executeWorkflow(workflowId)).rejects.toThrow('Workflow not found');
    });
  });

  describe('getWorkflowStatus', () => {
    const workflowId = '550e8400-e29b-41d4-a716-446655440000' as UUID;

    it('应该返回工作流状态', async () => {
      // Arrange
      const mockEntity = new CoreEntity({
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        workflowId: workflowId,
        orchestratorId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' as UUID,
        workflowConfig: {} as WorkflowConfig,
        executionContext: {} as ExecutionContext,
        executionStatus: {
          status: 'running' as WorkflowStatusType,
          currentStage: 'execution' as WorkflowStageType,
          completedStages: [],
          stageResults: {},
          retryCount: 0
        } as ExecutionStatus,
        auditTrail: {} as AuditTrail,
        monitoringIntegration: {} as MonitoringIntegration,
        performanceMetrics: {} as PerformanceMetricsConfig,
        versionHistory: {} as VersionHistory,
        searchMetadata: {} as SearchMetadata,
        eventIntegration: {} as EventIntegration,
        coreOperation: {} as CoreOperation
      });

      mockRepository.findById.mockResolvedValue(mockEntity);

      // Act
      const result = await service.getWorkflowStatus(workflowId);

      // Assert
      expect(result).toEqual({
        workflowId,
        status: 'running',
        currentStage: 'execution',
        progress: 0,
        startTime: undefined,
        endTime: undefined
      });
    });

    it('应该处理工作流不存在的情况', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getWorkflowStatus(workflowId)).rejects.toThrow('Workflow not found');
    });
  });

  describe('pauseWorkflow', () => {
    const workflowId = '550e8400-e29b-41d4-a716-446655440000' as UUID;

    it('应该成功暂停工作流', async () => {
      // Arrange
      const mockEntity = new CoreEntity({
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        workflowId: workflowId,
        orchestratorId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' as UUID,
        workflowConfig: {} as WorkflowConfig,
        executionContext: {} as ExecutionContext,
        executionStatus: {} as ExecutionStatus,
        auditTrail: {} as AuditTrail,
        monitoringIntegration: {} as MonitoringIntegration,
        performanceMetrics: {} as PerformanceMetricsConfig,
        versionHistory: {} as VersionHistory,
        searchMetadata: {} as SearchMetadata,
        eventIntegration: {} as EventIntegration,
        coreOperation: {} as CoreOperation
      });

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      // Act
      const result = await service.pauseWorkflow(workflowId);

      // Assert
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(workflowId);
      expect(mockRepository.findById).toHaveBeenCalledWith(workflowId);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('resumeWorkflow', () => {
    const workflowId = '550e8400-e29b-41d4-a716-446655440000' as UUID;

    it('应该成功恢复工作流', async () => {
      // Arrange
      const mockEntity = new CoreEntity({
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        workflowId: workflowId,
        orchestratorId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' as UUID,
        workflowConfig: {} as WorkflowConfig,
        executionContext: {} as ExecutionContext,
        executionStatus: {} as ExecutionStatus,
        auditTrail: {} as AuditTrail,
        monitoringIntegration: {} as MonitoringIntegration,
        performanceMetrics: {} as PerformanceMetricsConfig,
        versionHistory: {} as VersionHistory,
        searchMetadata: {} as SearchMetadata,
        eventIntegration: {} as EventIntegration,
        coreOperation: {} as CoreOperation
      });

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      // Act
      const result = await service.resumeWorkflow(workflowId);

      // Assert
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(workflowId);
      expect(mockRepository.findById).toHaveBeenCalledWith(workflowId);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('cancelWorkflow', () => {
    const workflowId = '550e8400-e29b-41d4-a716-446655440000' as UUID;

    it('应该成功取消工作流', async () => {
      // Arrange
      const mockEntity = new CoreEntity({
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        workflowId: workflowId,
        orchestratorId: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' as UUID,
        workflowConfig: {} as WorkflowConfig,
        executionContext: {} as ExecutionContext,
        executionStatus: {} as ExecutionStatus,
        auditTrail: {} as AuditTrail,
        monitoringIntegration: {} as MonitoringIntegration,
        performanceMetrics: {} as PerformanceMetricsConfig,
        versionHistory: {} as VersionHistory,
        searchMetadata: {} as SearchMetadata,
        eventIntegration: {} as EventIntegration,
        coreOperation: {} as CoreOperation
      });

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      // Act
      const result = await service.cancelWorkflow(workflowId);

      // Assert
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(workflowId);
      expect(mockRepository.findById).toHaveBeenCalledWith(workflowId);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
