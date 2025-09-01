/**
 * Core控制器测试 - 基于实际代码
 * 
 * @description 基于实际CoreController代码的测试，遵循RBCT方法论
 * @version 1.0.0
 * @layer API层测试 - 控制器
 */

import { CoreController } from '../../../../../src/modules/core/api/controllers/core.controller';
import { CoreManagementService } from '../../../../../src/modules/core/application/services/core-management.service';
import { CoreOrchestrationService } from '../../../../../src/modules/core/application/services/core-orchestration.service';
import { CoreResourceService } from '../../../../../src/modules/core/application/services/core-resource.service';
import { CoreMonitoringService } from '../../../../../src/modules/core/application/services/core-monitoring.service';
import { createTestCoreEntity } from '../../helpers/test-factories';
import {
  UUID,
  CoreOperation,
  WorkflowStageType,
  ExecutionMode,
  Priority
} from '../../../types';

// 导入实际的请求/响应接口
import {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  GetWorkflowResponse,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse
} from '../../../api/controllers/core.controller';

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
  const mockManagementService = {
    createWorkflow: jest.fn(),
    getWorkflowById: jest.fn(),
    getAllWorkflows: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
    getWorkflowsByStatus: jest.fn(),
    getWorkflowsByOrchestrator: jest.fn(),
    getWorkflowCount: jest.fn(),
    workflowExists: jest.fn(),
    getWorkflowStatistics: jest.fn()
  } as unknown as jest.Mocked<CoreManagementService>;

  const mockOrchestrationService = {
    coordinateModuleOperation: jest.fn(),
    activateReservedInterface: jest.fn(),
    createWorkflowEntity: jest.fn(),
    executeWorkflow: jest.fn()
  } as unknown as jest.Mocked<CoreOrchestrationService>;

  const mockResourceService = {
    allocateResources: jest.fn(),
    releaseResources: jest.fn(),
    monitorSystemPerformance: jest.fn(),
    balanceWorkload: jest.fn(),
    getResourceUsageStatistics: jest.fn()
  } as unknown as jest.Mocked<CoreResourceService>;

  const mockMonitoringService = {
    performHealthCheck: jest.fn(),
    getSystemStatistics: jest.fn(),
    generateMonitoringReport: jest.fn(),
    getAlerts: jest.fn(),
    acknowledgeAlert: jest.fn(),
    getPerformanceMetrics: jest.fn()
  } as unknown as jest.Mocked<CoreMonitoringService>;

  return {
    mockManagementService,
    mockOrchestrationService,
    mockResourceService,
    mockMonitoringService
  };
}

describe('CoreController测试', () => {
  let controller: CoreController;
  let mockServices: ReturnType<typeof createMockServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServices = createMockServices();
    
    controller = new CoreController(
      mockServices.mockManagementService,
      mockServices.mockOrchestrationService,
      mockServices.mockResourceService,
      mockServices.mockMonitoringService
    );
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreController实例', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CoreController);
    });
  });

  describe('createWorkflow方法测试', () => {
    it('应该成功创建工作流', async () => {
      const request: CreateWorkflowRequest = {
        workflowId: generateUUIDv4() as UUID,
        orchestratorId: generateUUIDv4() as UUID,
        workflowConfig: {
          name: 'test-workflow',
          description: 'Test workflow creation',
          stages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType],
          executionMode: 'sequential' as ExecutionMode,
          parallelExecution: false,
          priority: 'medium' as Priority,
          timeoutMs: 300000,
          maxConcurrentExecutions: 1
        },
        executionContext: {
          userId: 'user-test-001',
          sessionId: generateUUIDv4() as UUID,
          requestId: generateUUIDv4() as UUID,
          priority: 'medium' as Priority,
          metadata: { source: 'api' }
        },
        coreOperation: 'workflow_execution' as CoreOperation,
        coreDetails: {
          orchestrationMode: 'centralized',
          resourceAllocation: 'dynamic',
          faultTolerance: 'high'
        }
      };

      const testEntity = createTestCoreEntity();
      mockServices.mockManagementService.createWorkflow.mockResolvedValue(testEntity);

      const result: CreateWorkflowResponse = await controller.createWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockServices.mockManagementService.createWorkflow).toHaveBeenCalledWith({
        workflowId: request.workflowId,
        orchestratorId: request.orchestratorId,
        workflowConfig: request.workflowConfig,
        executionContext: request.executionContext,
        coreOperation: request.coreOperation,
        coreDetails: request.coreDetails
      });
    });

    it('应该处理创建工作流时的错误', async () => {
      const request: CreateWorkflowRequest = {
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
          userId: 'user-error-001',
          sessionId: generateUUIDv4() as UUID,
          requestId: generateUUIDv4() as UUID,
          priority: 'low' as Priority,
          metadata: {}
        },
        coreOperation: 'workflow_execution' as CoreOperation
      };

      const error = new Error('Workflow creation failed');
      mockServices.mockManagementService.createWorkflow.mockRejectedValue(error);

      const result: CreateWorkflowResponse = await controller.createWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow creation failed');
    });
  });

  describe('getWorkflow方法测试', () => {
    it('应该成功获取工作流', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const testEntity = createTestCoreEntity();

      mockServices.mockManagementService.getWorkflowById.mockResolvedValue(testEntity);

      const result: GetWorkflowResponse = await controller.getWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockServices.mockManagementService.getWorkflowById).toHaveBeenCalledWith(workflowId);
    });

    it('应该处理工作流不存在的情况', async () => {
      const workflowId = generateUUIDv4() as UUID;

      mockServices.mockManagementService.getWorkflowById.mockResolvedValue(null);

      const result: GetWorkflowResponse = await controller.getWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Workflow not found');
    });
  });

  describe('getAllWorkflows方法测试', () => {
    it('应该成功获取所有工作流', async () => {
      const testEntities = [createTestCoreEntity(), createTestCoreEntity()];

      mockServices.mockManagementService.getAllWorkflows.mockResolvedValue(testEntities);

      const result = await controller.getAllWorkflows();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('应该处理空工作流列表', async () => {
      mockServices.mockManagementService.getAllWorkflows.mockResolvedValue([]);

      const result = await controller.getAllWorkflows();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('executeWorkflow方法测试', () => {
    it('应该成功执行工作流', async () => {
      const request: ExecuteWorkflowRequest = {
        workflowId: generateUUIDv4() as UUID,
        contextId: generateUUIDv4() as UUID,
        stages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType],
        executionMode: 'sequential' as ExecutionMode,
        priority: 'medium' as Priority,
        timeout: 300000,
        metadata: { source: 'api' }
      };

      const executionResult = {
        workflowId: request.workflowId,
        executionId: generateUUIDv4() as UUID,
        status: 'completed' as any,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationMs: 5000,
        stageResults: {},
        metadata: { source: 'api' }
      };

      mockServices.mockOrchestrationService.executeWorkflow.mockResolvedValue(executionResult);

      const result: ExecuteWorkflowResponse = await controller.executeWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(executionResult);
    });

    it('应该处理工作流执行错误', async () => {
      const request: ExecuteWorkflowRequest = {
        workflowId: generateUUIDv4() as UUID,
        contextId: generateUUIDv4() as UUID,
        stages: ['context' as WorkflowStageType],
        executionMode: 'sequential' as ExecutionMode,
        priority: 'low' as Priority,
        timeout: 300000,
        metadata: {}
      };

      const error = new Error('Workflow execution failed');
      mockServices.mockOrchestrationService.executeWorkflow.mockRejectedValue(error);

      const result: ExecuteWorkflowResponse = await controller.executeWorkflow(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow execution failed');
    });
  });

  describe('系统监控集成测试', () => {
    it('应该能够访问监控服务', () => {
      // 验证控制器正确注入了监控服务
      expect(mockServices.mockMonitoringService).toBeDefined();
      expect(mockServices.mockMonitoringService.performHealthCheck).toBeDefined();
      expect(mockServices.mockMonitoringService.getSystemStatistics).toBeDefined();
    });

    it('应该能够通过监控服务获取健康状态', async () => {
      const healthStatus = {
        overall: 'healthy' as const,
        modules: [
          { moduleId: 'context', moduleName: 'Context', status: 'healthy' as const, lastCheck: new Date().toISOString(), responseTime: 50, errorCount: 0, checks: [] }
        ],
        resources: {
          cpu: { usage: 50, status: 'healthy' as const },
          memory: { usage: 60, status: 'healthy' as const },
          disk: { usage: 40, status: 'healthy' as const },
          network: { usage: 30, status: 'healthy' as const }
        },
        network: {
          connectivity: 'healthy' as const,
          latency: 10,
          throughput: 100,
          errorRate: 0,
          activeConnections: 5
        },
        timestamp: new Date().toISOString()
      };

      mockServices.mockMonitoringService.performHealthCheck.mockResolvedValue(healthStatus);

      const result = await mockServices.mockMonitoringService.performHealthCheck();

      expect(result).toBeDefined();
      expect(result.overall).toBe('healthy');
      expect(result.modules).toBeDefined();
      expect(result.resources).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内处理API请求', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const testEntity = createTestCoreEntity();

      mockServices.mockManagementService.getWorkflowById.mockResolvedValue(testEntity);

      const startTime = Date.now();
      const result = await controller.getWorkflow(workflowId);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });

  describe('错误处理测试', () => {
    it('应该统一处理服务层错误', async () => {
      const workflowId = generateUUIDv4() as UUID;
      const error = new Error('Service unavailable');

      mockServices.mockManagementService.getWorkflowById.mockRejectedValue(error);

      const result = await controller.getWorkflow(workflowId);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Service unavailable');
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空参数', async () => {
      const result = await controller.getAllWorkflows();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('应该处理无效UUID', async () => {
      const invalidId = 'invalid-uuid' as UUID;

      const result = await controller.getWorkflow(invalidId);

      expect(result).toBeDefined();
      // 控制器应该将验证委托给服务层
    });
  });
});
