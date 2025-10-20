/**
 * Core服务协调器测试 - 基于实际代码
 * 
 * @description 基于实际CoreServicesCoordinator代码的测试，遵循RBCT方法论
 * @version 1.0.0
 * @layer 应用层测试 - 协调器
 */

import { CoreServicesCoordinator, CoordinatedWorkflowCreationParams, CoordinatedExecutionResult } from '../../../../../src/modules/core/application/coordinators/core-services-coordinator';
import { CoreManagementService } from '../../../../../src/modules/core/application/services/core-management.service';
import { CoreMonitoringService } from '../../../../../src/modules/core/application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../../../../src/modules/core/application/services/core-orchestration.service';
import { CoreResourceService } from '../../../application/services/core-resource.service';
import { ICoreRepository } from '../../../domain/repositories/core-repository.interface';
import { createTestCoreEntity } from '../../helpers/test-factories';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation } from '../../../types';

// 生成符合UUID v4格式的ID
const generateUUIDv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 创建模拟服务
function createMockServices() {
  const mockRepository: jest.Mocked<ICoreRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByOrchestratorId: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    findByCriteria: jest.fn(),
    findWithPagination: jest.fn(),
    saveBatch: jest.fn(),
    deleteBatch: jest.fn()
  };

  const mockManagementService = {
    createWorkflow: jest.fn(),
    getWorkflowStatistics: jest.fn()
  } as unknown as jest.Mocked<CoreManagementService>;

  const mockMonitoringService = {
    performHealthCheck: jest.fn(),
    generateMonitoringReport: jest.fn()
  } as unknown as jest.Mocked<CoreMonitoringService>;

  const mockOrchestrationService = {
    coordinateModuleOperation: jest.fn()
  } as unknown as jest.Mocked<CoreOrchestrationService>;

  const mockResourceService = {
    allocateResources: jest.fn(),
    getResourceUtilization: jest.fn()
  } as unknown as jest.Mocked<CoreResourceService>;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
  };

  return {
    mockRepository,
    mockManagementService,
    mockMonitoringService,
    mockOrchestrationService,
    mockResourceService,
    mockLogger
  };
}

describe('CoreServicesCoordinator测试', () => {
  let coordinator: CoreServicesCoordinator;
  let mockServices: ReturnType<typeof createMockServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServices = createMockServices();
    
    coordinator = new CoreServicesCoordinator(
      mockServices.mockManagementService,
      mockServices.mockMonitoringService,
      mockServices.mockOrchestrationService,
      mockServices.mockResourceService,
      mockServices.mockRepository,
      mockServices.mockLogger
    );
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreServicesCoordinator实例', () => {
      expect(coordinator).toBeDefined();
      expect(coordinator).toBeInstanceOf(CoreServicesCoordinator);
    });
  });

  describe('createWorkflowWithFullCoordination方法测试', () => {
    it('应该成功协调创建工作流', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-coordinated-workflow',
          description: 'Test coordinated workflow creation',
          stages: ['context', 'plan'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'medium' as const,
          retryPolicy: {
            maxAttempts: 3,
            delayMs: 1000,
            backoffFactor: 2
          }
        } as WorkflowConfig,
        executionContext: {
          userId: 'user-test-001',
          sessionId: 'session-test-001',
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as const,
          metadata: { coordinated: true },
          variables: { testMode: true }
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation,
        enableMonitoring: true,
        enableResourceTracking: true
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);
      mockServices.mockMonitoringService.performHealthCheck.mockResolvedValue({
        overall: 'healthy',
        modules: [
          { moduleId: 'context', moduleName: 'Context', status: 'healthy', lastCheck: new Date().toISOString(), responseTime: 50, errorCount: 0, checks: [] },
          { moduleId: 'plan', moduleName: 'Plan', status: 'healthy', lastCheck: new Date().toISOString(), responseTime: 45, errorCount: 0, checks: [] }
        ],
        resources: {
          cpu: { usage: 50, status: 'healthy' },
          memory: { usage: 60, status: 'healthy' },
          disk: { usage: 40, status: 'healthy' },
          network: { usage: 30, status: 'healthy' }
        },
        network: {
          connectivity: 'healthy',
          latency: 10,
          throughput: 100,
          errorRate: 0,
          activeConnections: 5
        },
        timestamp: new Date().toISOString()
      });
      mockServices.mockResourceService.allocateResources.mockResolvedValue({
        allocationId: generateUUIDv4() as UUID,
        executionId: 'exec-001',
        allocatedResources: { cpuCores: 2, memoryMb: 1024, diskSpaceMb: 2048, networkBandwidthMbps: 100 },
        allocationTime: new Date().toISOString(),
        status: 'allocated'
      });
      mockServices.mockOrchestrationService.coordinateModuleOperation.mockResolvedValue({
        success: true,
        result: { message: 'Coordination successful' },
        executionTime: 100
      });

      const result = await coordinator.createWorkflowWithFullCoordination(params);

      expect(result).toBeDefined();
      expect(result.workflow).toBe(testEntity);
      expect(result.monitoringEnabled).toBe(true);
      expect(result.resourcesAllocated).toBe(true);
      expect(result.orchestrationActive).toBe(true);
      expect(result.healthStatus).toBe('healthy');

      expect(mockServices.mockManagementService.createWorkflow).toHaveBeenCalledWith({
        workflowId: params.workflowId,
        orchestratorId: params.orchestratorId,
        workflowConfig: params.workflowConfig,
        executionContext: params.executionContext,
        coreOperation: params.coreOperation,
        coreDetails: params.coreDetails
      });
      expect(mockServices.mockLogger.info).toHaveBeenCalledWith(
        'Starting coordinated workflow creation',
        { workflowId: params.workflowId, operation: params.coreOperation }
      );
    });

    it('应该处理监控服务失败的情况', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-workflow-monitoring-fail',
          description: 'Test workflow with monitoring failure',
          stages: ['context'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'low' as const,
          retryPolicy: { maxAttempts: 1, delayMs: 500, backoffFactor: 1 }
        } as WorkflowConfig,
        executionContext: {
          userId: 'user-test-002',
          sessionId: 'session-test-002',
          requestId: generateUUIDv4() as UUID,
          priority: 'low' as const,
          metadata: {},
          variables: {}
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation,
        enableMonitoring: true
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);
      mockServices.mockMonitoringService.performHealthCheck.mockRejectedValue(new Error('Monitoring service unavailable'));
      mockServices.mockOrchestrationService.coordinateModuleOperation.mockResolvedValue({
        success: true,
        result: { message: 'Coordination successful' },
        executionTime: 100
      });

      const result = await coordinator.createWorkflowWithFullCoordination(params);

      expect(result).toBeDefined();
      expect(result.workflow).toBe(testEntity);
      expect(result.monitoringEnabled).toBe(false);
      expect(result.healthStatus).toBe('critical'); // 因为监控失败导致系统状态为critical
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Failed to start monitoring',
        expect.objectContaining({ workflowId: params.workflowId })
      );
    });

    it('应该处理资源分配失败的情况', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-workflow-resource-fail',
          description: 'Test workflow with resource allocation failure',
          stages: ['context'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'high' as const,
          retryPolicy: { maxAttempts: 2, delayMs: 1000, backoffFactor: 1.5 }
        } as WorkflowConfig,
        executionContext: {
          userId: 'user-test-003',
          sessionId: 'session-test-003',
          requestId: generateUUIDv4() as UUID,
          priority: 'high' as const,
          metadata: {},
          variables: {}
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation,
        enableResourceTracking: true
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);
      mockServices.mockResourceService.allocateResources.mockRejectedValue(new Error('Insufficient resources'));
      mockServices.mockOrchestrationService.coordinateModuleOperation.mockResolvedValue({
        success: true,
        result: { message: 'Coordination successful' },
        executionTime: 100
      });

      const result = await coordinator.createWorkflowWithFullCoordination(params);

      expect(result).toBeDefined();
      expect(result.workflow).toBe(testEntity);
      expect(result.resourcesAllocated).toBe(false);
      expect(result.healthStatus).toBe('warning'); // 因为资源分配失败
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Failed to allocate resources',
        expect.objectContaining({ workflowId: params.workflowId })
      );
    });

    it('应该处理编排服务失败的情况', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-workflow-orchestration-fail',
          description: 'Test workflow with orchestration failure',
          stages: ['context'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'medium' as const,
          retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffFactor: 2 }
        } as WorkflowConfig,
        executionContext: {
          userId: 'user-test-004',
          sessionId: 'session-test-004',
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as const,
          metadata: {},
          variables: {}
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);
      mockServices.mockOrchestrationService.coordinateModuleOperation.mockRejectedValue(new Error('Orchestration service unavailable'));

      const result = await coordinator.createWorkflowWithFullCoordination(params);

      expect(result).toBeDefined();
      expect(result.workflow).toBe(testEntity);
      expect(result.orchestrationActive).toBe(false);
      expect(result.healthStatus).toBe('critical'); // 因为所有服务都失败
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Failed to activate orchestration',
        expect.objectContaining({ workflowId: params.workflowId })
      );
    });

    it('应该处理工作流创建失败', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-workflow-creation-fail',
          description: 'Test workflow creation failure',
          stages: ['context'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'medium' as const,
          retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffFactor: 2 }
        } as WorkflowConfig,
        executionContext: {
          userId: 'user-test-005',
          sessionId: 'session-test-005',
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as const,
          metadata: {},
          variables: {}
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const error = new Error('Workflow creation failed');
      mockServices.mockManagementService.createWorkflow.mockRejectedValue(error);

      await expect(coordinator.createWorkflowWithFullCoordination(params)).rejects.toThrow('Workflow creation failed');
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Coordinated workflow creation failed',
        expect.objectContaining({ workflowId: params.workflowId })
      );
    });
  });

  describe('executeWorkflowWithCoordination方法测试', () => {
    it('应该成功协调执行工作流', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const testEntity = createTestCoreEntity();

      mockServices.mockManagementService.getWorkflowStatistics.mockResolvedValue({
        totalWorkflows: 10,
        activeWorkflows: 5,
        completedWorkflows: 3,
        failedWorkflows: 2,
        averageDuration: 1500
      });
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);
      mockServices.mockOrchestrationService.coordinateModuleOperation.mockResolvedValue({
        success: true,
        result: { message: 'Execution coordination successful' },
        executionTime: 150
      });

      const result = await coordinator.executeWorkflowWithCoordination(workflowId);

      expect(result).toBeDefined();
      expect(result.workflow).toBe(testEntity);
      expect(result.monitoringEnabled).toBe(true);
      expect(result.resourcesAllocated).toBe(true);
      expect(result.orchestrationActive).toBe(true);
      expect(result.healthStatus).toBe('healthy');

      expect(mockServices.mockManagementService.getWorkflowStatistics).toHaveBeenCalled();
      expect(mockServices.mockOrchestrationService.coordinateModuleOperation).toHaveBeenCalledWith({
        sourceModule: 'core',
        targetModule: 'workflow',
        operation: 'execute',
        payload: { workflowId },
        timestamp: expect.any(String)
      });
    });

    it('应该处理执行协调失败', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const error = new Error('Execution coordination failed');

      mockServices.mockManagementService.getWorkflowStatistics.mockRejectedValue(error);

      await expect(coordinator.executeWorkflowWithCoordination(workflowId)).rejects.toThrow('Execution coordination failed');
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Coordinated workflow execution failed',
        expect.objectContaining({ workflowId })
      );
    });
  });

  describe('stopWorkflowWithCoordination方法测试', () => {
    it('应该成功协调停止工作流', async () => {
      const workflowId = generateUUIDv4() as UUID;

      mockServices.mockOrchestrationService.coordinateModuleOperation.mockResolvedValue({
        success: true,
        result: { message: 'Stop coordination successful' },
        executionTime: 50
      });

      const result = await coordinator.stopWorkflowWithCoordination(workflowId);

      expect(result).toBe(true);
      expect(mockServices.mockOrchestrationService.coordinateModuleOperation).toHaveBeenCalledWith({
        sourceModule: 'core',
        targetModule: 'workflow',
        operation: 'stop',
        payload: { workflowId },
        timestamp: expect.any(String)
      });
      expect(mockServices.mockLogger.info).toHaveBeenCalledWith(
        'Coordinated workflow stop completed',
        { workflowId }
      );
    });

    it('应该处理停止协调失败', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const error = new Error('Stop coordination failed');

      mockServices.mockOrchestrationService.coordinateModuleOperation.mockRejectedValue(error);

      const result = await coordinator.stopWorkflowWithCoordination(workflowId);

      expect(result).toBe(false);
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Coordinated workflow stop failed',
        expect.objectContaining({ workflowId })
      );
    });
  });

  describe('getCoordinationOverview方法测试', () => {
    it('应该成功获取协调状态概览', async () => {
      mockServices.mockManagementService.getWorkflowStatistics.mockResolvedValue({
        totalWorkflows: 20,
        activeWorkflows: 8,
        completedWorkflows: 10,
        failedWorkflows: 2,
        averageDuration: 2000
      });

      const result = await coordinator.getCoordinationOverview();

      expect(result).toBeDefined();
      expect(result.totalWorkflows).toBe(20);
      expect(result.activeWorkflows).toBe(8);
      expect(result.monitoredWorkflows).toBe(1);
      expect(result.resourceUtilization).toBe(50);
      expect(result.systemHealth).toBe('healthy');
    });

    it('应该处理获取概览失败', async () => {
      const error = new Error('Failed to get statistics');
      mockServices.mockManagementService.getWorkflowStatistics.mockRejectedValue(error);

      await expect(coordinator.getCoordinationOverview()).rejects.toThrow('Failed to get statistics');
      expect(mockServices.mockLogger.error).toHaveBeenCalledWith(
        'Failed to get coordination overview',
        expect.objectContaining({ error })
      );
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成协调创建', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'perf-test-workflow',
          description: 'Performance test workflow',
          stages: ['context'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'medium' as const,
          retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffFactor: 2 }
        } as WorkflowConfig,
        executionContext: {
          userId: 'perf-user',
          sessionId: 'perf-session',
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as const,
          metadata: {},
          variables: {}
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);
      mockServices.mockOrchestrationService.coordinateModuleOperation.mockResolvedValue({
        success: true,
        result: { message: 'Performance test successful' },
        executionTime: 50
      });

      const startTime = Date.now();
      const result = await coordinator.createWorkflowWithFullCoordination(params);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(300); // 应该在300ms内完成
    });
  });

  describe('错误处理测试', () => {
    it('应该处理服务依赖错误', async () => {
      const params: CoordinatedWorkflowCreationParams = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'error-test-workflow',
          description: 'Error handling test workflow',
          stages: ['context'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'medium' as const,
          retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffFactor: 2 }
        } as WorkflowConfig,
        executionContext: {
          userId: 'error-user',
          sessionId: 'error-session',
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as const,
          metadata: {},
          variables: {}
        } as ExecutionContext,
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const error = new Error('Service dependency failed');
      mockServices.mockManagementService.createWorkflow.mockRejectedValue(error);

      await expect(coordinator.createWorkflowWithFullCoordination(params)).rejects.toThrow('Service dependency failed');
    });
  });
});
