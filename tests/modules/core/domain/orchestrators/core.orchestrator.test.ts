/**
 * CoreOrchestrator测试套件
 * 
 * @description 基于实际源代码实现的完整测试套件，发现和修复源代码问题
 * @version 1.0.0
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的测试模式
 */

import { CoreOrchestrator, WorkflowExecutionRequest, WorkflowResult, CoordinationResult } from '../../../../../src/modules/core/domain/orchestrators/core.orchestrator';
import { CoreOrchestrationService } from '../../../../../src/modules/core/application/services/core-orchestration.service';
import { CoreResourceService } from '../../../../../src/modules/core/application/services/core-resource.service';
import { CoreMonitoringService } from '../../../../../src/modules/core/application/services/core-monitoring.service';
import { WorkflowConfig, Priority, ExecutionModeType, PriorityType } from '../../../types';

// ===== 测试工厂和模拟对象 =====

/**
 * 创建模拟的L3管理器
 */
function createMockL3Managers() {
  return {
    securityManager: {
      validateWorkflowExecution: jest.fn().mockResolvedValue(undefined),
      validateModuleAccess: jest.fn().mockResolvedValue(true)
    },
    performanceMonitor: {
      startTimer: jest.fn().mockReturnValue({
        stop: jest.fn().mockReturnValue(1000),
        elapsed: jest.fn().mockReturnValue(500)
      }),
      recordMetric: jest.fn(),
      getMetrics: jest.fn().mockResolvedValue({ cpu: 50, memory: 60 })
    },
    eventBusManager: {
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn()
    },
    errorHandler: {
      handleError: jest.fn().mockResolvedValue(undefined),
      createErrorReport: jest.fn().mockReturnValue({
        errorId: 'error-123',
        message: 'Test error',
        context: {},
        timestamp: '2025-01-27T10:00:00.000Z'
      })
    },
    coordinationManager: {
      coordinateModules: jest.fn().mockResolvedValue({
        success: true,
        results: { coordinated: true },
        executionTime: 100
      }),
      validateCoordination: jest.fn().mockResolvedValue(true)
    },
    orchestrationManager: {
      createOrchestrationPlan: jest.fn().mockResolvedValue({
        planId: 'plan-123',
        stages: [],
        dependencies: {},
        estimatedDuration: 60000
      }),
      executeOrchestrationPlan: jest.fn().mockResolvedValue({
        planId: 'plan-123',
        status: 'completed',
        stageResults: {},
        totalDuration: 1000
      })
    },
    stateSyncManager: {
      syncState: jest.fn().mockResolvedValue(undefined),
      getState: jest.fn().mockResolvedValue({}),
      validateStateConsistency: jest.fn().mockResolvedValue(true)
    },
    transactionManager: {
      beginTransaction: jest.fn().mockResolvedValue({
        transactionId: 'tx-123',
        startTime: '2025-01-27T10:00:00.000Z',
        operations: []
      }),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined)
    },
    protocolVersionManager: {
      validateProtocolVersion: jest.fn().mockReturnValue(true),
      getCompatibleVersions: jest.fn().mockReturnValue(['1.0.0']),
      upgradeProtocol: jest.fn().mockResolvedValue(undefined)
    }
  };
}

/**
 * 创建模拟的核心服务
 */
function createMockCoreServices() {
  return {
    orchestrationService: {
      coordinateModuleOperation: jest.fn().mockResolvedValue({
        success: true,
        result: { coordinated: true }
      }),
      activateReservedInterface: jest.fn().mockResolvedValue({
        success: true,
        interfaceId: 'test-interface',
        activatedAt: '2025-01-27T10:00:00.000Z'
      })
    } as unknown as CoreOrchestrationService,
    resourceService: {
      allocateResources: jest.fn().mockResolvedValue({
        allocationId: 'alloc-123',
        resources: { cpuCores: 4, memoryMb: 2048 }
      }),
      releaseResources: jest.fn().mockResolvedValue(undefined),
      getResourceUsageStatistics: jest.fn().mockResolvedValue({
        totalAllocations: 10,
        activeAllocations: 3,
        averageAllocationDuration: 60000,
        resourceUtilization: {
          cpu: 45,
          memory: 60,
          disk: 30,
          network: 20
        }
      })
    } as unknown as CoreResourceService,
    monitoringService: {
      performHealthCheck: jest.fn().mockResolvedValue({
        overall: 'healthy',
        modules: [
          { moduleId: 'context', status: 'healthy' },
          { moduleId: 'plan', status: 'healthy' },
          { moduleId: 'role', status: 'healthy' }
        ],
        resources: { cpu: 50, memory: 60, disk: 30, network: 20 },
        network: { connectivity: 'good', latency: 10 },
        timestamp: '2025-01-27T10:00:00.000Z'
      })
    } as unknown as CoreMonitoringService
  };
}

/**
 * 创建测试用的WorkflowExecutionRequest
 */
function createTestWorkflowRequest(): WorkflowExecutionRequest {
  return {
    contextId: 'context-123',
    workflowConfig: {
      name: 'test-workflow',
      description: 'Test workflow for unit testing',
      stages: ['context', 'plan', 'confirm'],
      executionMode: 'sequential' as ExecutionModeType,
      parallelExecution: false,
      timeoutMs: 300000,
      priority: 'medium' as PriorityType
    } as WorkflowConfig,
    priority: 'medium' as Priority,
    metadata: { testMode: true }
  };
}

// ===== 测试套件 =====

describe('CoreOrchestrator测试', () => {
  let orchestrator: CoreOrchestrator;
  let mockL3Managers: ReturnType<typeof createMockL3Managers>;
  let mockCoreServices: ReturnType<typeof createMockCoreServices>;

  beforeEach(() => {
    // 重置所有模拟对象
    jest.clearAllMocks();
    
    // 创建模拟对象
    mockL3Managers = createMockL3Managers();
    mockCoreServices = createMockCoreServices();
    
    // 创建CoreOrchestrator实例
    orchestrator = new CoreOrchestrator(
      mockCoreServices.orchestrationService,
      mockCoreServices.resourceService,
      mockCoreServices.monitoringService,
      mockL3Managers.securityManager,
      mockL3Managers.performanceMonitor,
      mockL3Managers.eventBusManager,
      mockL3Managers.errorHandler,
      mockL3Managers.coordinationManager,
      mockL3Managers.orchestrationManager,
      mockL3Managers.stateSyncManager,
      mockL3Managers.transactionManager,
      mockL3Managers.protocolVersionManager
    );
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreOrchestrator实例', () => {
      expect(orchestrator).toBeInstanceOf(CoreOrchestrator);
    });

    it('应该正确注入所有依赖', () => {
      // 通过调用方法来验证依赖注入是否正确
      expect(() => orchestrator.coordinateModules(['test'], 'test', {})).not.toThrow();
    });
  });

  describe('executeWorkflow方法测试', () => {
    it('应该成功执行完整工作流', async () => {
      // 准备测试数据
      const request = createTestWorkflowRequest();
      
      // 执行测试
      const result: WorkflowResult = await orchestrator.executeWorkflow(request);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.workflowId).toBeDefined();
      expect(result.executionId).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.startTime).toBeDefined();
      
      // 验证调用序列
      expect(mockL3Managers.securityManager.validateWorkflowExecution).toHaveBeenCalledWith(
        request.contextId,
        request.workflowConfig
      );
      expect(mockL3Managers.performanceMonitor.startTimer).toHaveBeenCalledWith('workflow_execution');
      expect(mockL3Managers.transactionManager.beginTransaction).toHaveBeenCalled();
      expect(mockL3Managers.orchestrationManager.createOrchestrationPlan).toHaveBeenCalledWith(request.workflowConfig);
    });

    it('应该在安全验证失败时抛出错误', async () => {
      // 设置安全验证失败
      mockL3Managers.securityManager.validateWorkflowExecution.mockRejectedValue(
        new Error('Security validation failed')
      );
      
      const request = createTestWorkflowRequest();
      
      // 验证错误处理
      await expect(orchestrator.executeWorkflow(request)).rejects.toThrow('Security validation failed');
    });

    it('应该在事务失败时正确回滚', async () => {
      // 设置编排计划创建失败
      mockL3Managers.orchestrationManager.createOrchestrationPlan.mockRejectedValue(
        new Error('Plan creation failed')
      );
      
      const request = createTestWorkflowRequest();
      
      // 验证错误处理和回滚
      await expect(orchestrator.executeWorkflow(request)).rejects.toThrow('Plan creation failed');
      expect(mockL3Managers.transactionManager.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('coordinateModules方法测试', () => {
    it('应该成功协调多个模块', async () => {
      const modules = ['context', 'plan', 'confirm'];
      const operation = 'sync_state';
      const parameters = { testParam: 'value' };
      
      const result: CoordinationResult = await orchestrator.coordinateModules(modules, operation, parameters);
      
      // 验证结果
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      
      // 验证调用序列
      expect(mockL3Managers.securityManager.validateModuleAccess).toHaveBeenCalledTimes(modules.length);
      expect(mockL3Managers.coordinationManager.coordinateModules).toHaveBeenCalledWith(modules, operation);
      expect(mockL3Managers.eventBusManager.publish).toHaveBeenCalledWith('modules_coordinated', expect.any(Object));
    });

    it('应该在模块访问被拒绝时抛出错误', async () => {
      // 设置访问验证失败
      mockL3Managers.securityManager.validateModuleAccess.mockResolvedValue(false);
      
      const modules = ['context'];
      const operation = 'test_operation';
      
      // 验证错误处理
      await expect(orchestrator.coordinateModules(modules, operation, {})).rejects.toThrow('Access denied for module: context');
    });
  });

  describe('getSystemStatus方法测试', () => {
    it('应该返回系统状态信息', async () => {
      const status = await orchestrator.getSystemStatus();
      
      // 验证返回结构
      expect(status).toBeDefined();
      expect(status.overall).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy', 'critical']).toContain(status.overall);
      expect(status.modules).toBeDefined();
      expect(status.resources).toBeDefined();
      expect(status.performance).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该正确处理未知错误', async () => {
      // 设置未知错误
      mockL3Managers.orchestrationManager.createOrchestrationPlan.mockRejectedValue(
        new Error('Unknown error')
      );
      
      const request = createTestWorkflowRequest();
      
      // 验证错误处理
      await expect(orchestrator.executeWorkflow(request)).rejects.toThrow('Unknown error');
      expect(mockL3Managers.transactionManager.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
