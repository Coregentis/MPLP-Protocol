/**
 * Core协议测试 - 基于实际代码
 * 
 * @description 基于实际CoreProtocol代码的测试，遵循RBCT方法论
 * @version 1.0.0
 * @layer 基础设施层测试 - 协议
 */

import { CoreProtocol, CoreWorkflowCreationRequest } from '../../../../../src/modules/core/infrastructure/protocols/core.protocol';
import { ICoreRepository } from '../../../../../src/modules/core/domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../../../../src/modules/core/application/services/core-management.service';
import { CoreMonitoringService } from '../../../../../src/modules/core/application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../../application/services/core-resource.service';
import { createTestCoreEntity } from '../../helpers/test-factories';
import {
  UUID,
  WorkflowConfig,
  ExecutionContext,
  CoreOperation,
  WorkflowStageType,
  ExecutionMode,
  Priority
} from '../../../types';

// 导入横切关注点管理器
import {
  MLPPSecurityManager,
  MLPPPerformanceMonitor,
  MLPPEventBusManager,
  MLPPErrorHandler,
  MLPPCoordinationManager,
  MLPPOrchestrationManager,
  MLPPStateSyncManager,
  MLPPTransactionManager,
  MLPPProtocolVersionManager
} from '../../../../../core/protocols/cross-cutting-concerns';

// 生成符合UUID v4格式的ID
const generateUUIDv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 创建模拟服务和管理器
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
    getWorkflowById: jest.fn(),
    getAllWorkflows: jest.fn(),
    getWorkflowStatistics: jest.fn()
  } as unknown as jest.Mocked<CoreManagementService>;

  const mockMonitoringService = {
    performHealthCheck: jest.fn(),
    getSystemStatistics: jest.fn()
  } as unknown as jest.Mocked<CoreMonitoringService>;

  const mockOrchestrationService = {
    coordinateModuleOperation: jest.fn(),
    activateReservedInterface: jest.fn()
  } as unknown as jest.Mocked<CoreOrchestrationService>;

  const mockResourceService = {
    allocateResources: jest.fn(),
    releaseResources: jest.fn()
  } as unknown as jest.Mocked<CoreResourceService>;

  // 创建模拟的横切关注点管理器
  const mockSecurityManager = {} as MLPPSecurityManager;
  const mockPerformanceMonitor = {} as MLPPPerformanceMonitor;
  const mockEventBusManager = {} as MLPPEventBusManager;
  const mockErrorHandler = {} as MLPPErrorHandler;
  const mockCoordinationManager = {
    coordinateOperation: jest.fn()
  } as unknown as jest.Mocked<MLPPCoordinationManager>;
  const mockOrchestrationManager = {} as MLPPOrchestrationManager;
  const mockStateSyncManager = {} as MLPPStateSyncManager;
  const mockTransactionManager = {} as MLPPTransactionManager;
  const mockProtocolVersionManager = {} as MLPPProtocolVersionManager;

  return {
    mockRepository,
    mockManagementService,
    mockMonitoringService,
    mockOrchestrationService,
    mockResourceService,
    mockSecurityManager,
    mockPerformanceMonitor,
    mockEventBusManager,
    mockErrorHandler,
    mockCoordinationManager,
    mockOrchestrationManager,
    mockStateSyncManager,
    mockTransactionManager,
    mockProtocolVersionManager
  };
}

describe('CoreProtocol测试', () => {
  let protocol: CoreProtocol;
  let mockServices: ReturnType<typeof createMockServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServices = createMockServices();

    protocol = new CoreProtocol(
      mockServices.mockManagementService,
      mockServices.mockMonitoringService,
      mockServices.mockOrchestrationService,
      mockServices.mockResourceService,
      mockServices.mockRepository,
      mockServices.mockSecurityManager,
      mockServices.mockPerformanceMonitor,
      mockServices.mockEventBusManager,
      mockServices.mockErrorHandler,
      mockServices.mockCoordinationManager,
      mockServices.mockOrchestrationManager,
      mockServices.mockStateSyncManager,
      mockServices.mockTransactionManager,
      mockServices.mockProtocolVersionManager
    );
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreProtocol实例', () => {
      expect(protocol).toBeDefined();
      expect(protocol).toBeInstanceOf(CoreProtocol);
    });
  });

  describe('createWorkflow方法测试', () => {
    it('应该成功创建工作流', async () => {
      const request: CoreWorkflowCreationRequest = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-protocol-workflow',
          description: 'Test workflow for protocol',
          stages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType],
          executionMode: 'sequential' as ExecutionMode,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'medium' as Priority,
          maxConcurrentExecutions: 1
        },
        executionContext: {
          userId: 'protocol-user-001',
          sessionId: generateUUIDv4() as UUID,
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as Priority,
          metadata: { source: 'protocol' }
        },
        coreOperation: 'workflow_execution' as CoreOperation,
        metadata: { protocolTest: true }
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);

      const result = await protocol.createWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
      expect(mockServices.mockManagementService.createWorkflow).toHaveBeenCalled();
    });

    it('应该处理工作流创建错误', async () => {
      const request: CoreWorkflowCreationRequest = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'error-workflow',
          description: 'Error test workflow',
          stages: ['context' as WorkflowStageType],
          executionMode: 'sequential' as ExecutionMode,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'low' as Priority,
          maxConcurrentExecutions: 1
        },
        executionContext: {
          userId: 'error-user',
          sessionId: generateUUIDv4() as UUID,
          requestId: generateUUIDv4() as UUID,
          priority: 'low' as Priority,
          metadata: {}
        },
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const error = new Error('Protocol creation failed');
      mockServices.mockManagementService.createWorkflow.mockRejectedValue(error);

      const result = await protocol.createWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Protocol creation failed');
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });
  });

  describe('executeWorkflow方法测试', () => {
    it('应该成功执行工作流', async () => {
      const workflowId = generateUUIDv4() as UUID;

      mockServices.mockCoordinationManager.coordinateOperation.mockResolvedValue({
        requestId: 'test-request-001',
        status: 'success',
        result: { message: 'Coordination successful' },
        timestamp: new Date().toISOString()
      });

      const result = await protocol.executeWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
      expect(mockServices.mockCoordinationManager.coordinateOperation).toHaveBeenCalledWith(
        'core',
        'orchestrator',
        'execute_workflow',
        { workflowId }
      );
    });

    it('应该处理工作流执行错误', async () => {
      const workflowId = generateUUIDv4() as UUID;

      const error = new Error('Protocol execution failed');
      mockServices.mockCoordinationManager.coordinateOperation.mockRejectedValue(error);

      const result = await protocol.executeWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Protocol execution failed');
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });

  });

  describe('getProtocolHealth方法测试', () => {
    it('应该返回健康状态', async () => {
      mockServices.mockRepository.count.mockResolvedValue(10);

      const result = await protocol.getProtocolHealth();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data?.status);
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });

    it('应该包含组件健康状态', async () => {
      mockServices.mockRepository.count.mockResolvedValue(5);

      const result = await protocol.getProtocolHealth();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.components).toBeDefined();
      expect(result.data?.metrics).toBeDefined();
      expect(result.data?.metrics.totalComponents).toBeGreaterThan(0);
      expect(result.data?.metrics.healthyComponents).toBeDefined();
    });

    it('应该处理健康检查错误', async () => {
      // 模拟仓储错误
      mockServices.mockRepository.count.mockRejectedValue(new Error('Repository error'));

      const result = await protocol.getProtocolHealth();

      expect(result).toBeDefined();
      expect(result.success).toBe(true); // 健康检查本身成功，但组件状态会反映错误
      expect(result.data?.components.repository).toBe(false); // 仓储组件不健康
      expect(result.data?.status).toBe('degraded'); // 整体状态降级
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });
  });

  describe('getWorkflowStatus方法测试', () => {
    it('应该返回工作流状态', async () => {
      const workflowId = generateUUIDv4() as UUID;

      mockServices.mockManagementService.getWorkflowStatistics.mockResolvedValue({
        totalWorkflows: 10,
        activeWorkflows: 3,
        completedWorkflows: 7,
        failedWorkflows: 0,
        averageDuration: 5000
      });

      const result = await protocol.getWorkflowStatus(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('running');
      expect(result.data?.progress).toBe(50);
      expect(result.data?.lastUpdated).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });

    it('应该处理状态查询错误', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const error = new Error('Status query failed');

      mockServices.mockManagementService.getWorkflowStatistics.mockRejectedValue(error);

      const result = await protocol.getWorkflowStatus(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Status query failed');
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内执行工作流', async () => {
      const workflowId = generateUUIDv4() as UUID;

      mockServices.mockCoordinationManager.coordinateOperation.mockResolvedValue({
        requestId: 'test-request-002',
        status: 'success',
        result: { message: 'Coordination successful' },
        timestamp: new Date().toISOString()
      });

      const startTime = Date.now();
      const result = await protocol.executeWorkflow(workflowId);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // 应该在500ms内完成
    });

    it('应该在合理时间内完成健康检查', async () => {
      mockServices.mockRepository.count.mockResolvedValue(5);

      const startTime = Date.now();
      const result = await protocol.getProtocolHealth();
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协调操作错误', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const error = new Error('Coordination failed');

      mockServices.mockCoordinationManager.coordinateOperation.mockRejectedValue(error);

      const result = await protocol.executeWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Coordination failed');
      expect(result.timestamp).toBeDefined();
      expect(result.operationId).toBeDefined();
    });

    it('应该处理工作流创建服务错误', async () => {
      const request: CoreWorkflowCreationRequest = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'error-test',
          description: 'Error handling test',
          stages: ['context' as WorkflowStageType],
          executionMode: 'sequential' as ExecutionMode,
          parallelExecution: false,
          timeoutMs: 300000,
          priority: 'low' as Priority,
          maxConcurrentExecutions: 1
        },
        executionContext: {
          userId: 'error-user',
          sessionId: generateUUIDv4() as UUID,
          requestId: generateUUIDv4() as UUID,
          priority: 'low' as Priority,
          metadata: {}
        },
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const error = new Error('Service unavailable');
      mockServices.mockManagementService.createWorkflow.mockRejectedValue(error);

      const result = await protocol.createWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Service unavailable');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理最小工作流创建请求', async () => {
      const minimalRequest: CoreWorkflowCreationRequest = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'minimal',
          description: 'Minimal workflow',
          stages: [],
          executionMode: 'sequential' as ExecutionMode,
          parallelExecution: false,
          timeoutMs: 1000,
          priority: 'low' as Priority,
          maxConcurrentExecutions: 1
        },
        executionContext: {
          userId: 'minimal-user',
          sessionId: generateUUIDv4() as UUID,
          requestId: generateUUIDv4() as UUID,
          priority: 'low' as Priority,
          metadata: {}
        },
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);

      const result = await protocol.createWorkflow(minimalRequest);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('应该处理空元数据的工作流执行', async () => {
      const workflowId = generateUUIDv4() as UUID;

      mockServices.mockCoordinationManager.coordinateOperation.mockResolvedValue({
        requestId: 'test-request-003',
        status: 'success',
        result: { message: 'Coordination successful' },
        timestamp: new Date().toISOString()
      });

      const result = await protocol.executeWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('应该处理仓储健康检查失败', async () => {
      mockServices.mockRepository.count.mockRejectedValue(new Error('Repository unavailable'));

      const result = await protocol.getProtocolHealth();

      expect(result).toBeDefined();
      expect(result.success).toBe(true); // 健康检查本身成功
      expect(result.data?.components.repository).toBe(false); // 仓储组件不健康
      expect(result.data?.status).toBe('degraded'); // 整体状态降级
    });
  });
});
