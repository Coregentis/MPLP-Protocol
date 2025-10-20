/**
 * CoreOrchestrator协调功能集成测试
 * 基于RBCT方法论和实际代码实现
 * 测试目标：验证10个核心协调功能，确保90%协调功能覆盖率
 */

import { initializeCoreOrchestrator, CoreOrchestratorOptions } from '../../../src/modules/core/orchestrator';
import { CoreOrchestrator } from '../../../src/core/orchestrator/core.orchestrator';
import { ReservedInterfaceActivator } from '../../../src/modules/core/domain/activators/reserved-interface.activator';

describe('CoreOrchestrator协调功能集成测试', () => {
  let coreOrchestratorResult: any;
  let orchestrator: CoreOrchestrator;
  let interfaceActivator: ReservedInterfaceActivator;

  beforeAll(async () => {
    // 初始化CoreOrchestrator with full configuration
    const options: CoreOrchestratorOptions = {
      environment: 'testing',
      enableLogging: true,
      enableMetrics: true,
      enableCaching: true,
      maxConcurrentWorkflows: 10,
      workflowTimeout: 30000,
      enableReservedInterfaces: true,
      enableModuleCoordination: true
    };

    coreOrchestratorResult = await initializeCoreOrchestrator(options);
    orchestrator = coreOrchestratorResult.orchestrator;
    interfaceActivator = coreOrchestratorResult.interfaceActivator;
  });

  afterAll(async () => {
    if (coreOrchestratorResult?.shutdown) {
      await coreOrchestratorResult.shutdown();
    }
  });

  describe('1. 工作流编排功能测试', () => {
    it('应该成功创建和执行多模块工作流', async () => {
      // Arrange
      const workflowRequest = {
        contextId: 'test-context-001',
        workflowConfig: {
          name: 'Multi-Module Integration Workflow',
          stages: ['context', 'plan', 'role', 'confirm'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          priority: 'medium' as const
        },
        priority: 'medium' as const,
        metadata: {
          testMode: true,
          workflowId: 'test-workflow-001'
        }
      };

      // Act
      const workflowResult = await orchestrator.executeWorkflow(workflowRequest);

      // Assert
      expect(workflowResult).toBeDefined();
      expect(workflowResult.workflowId).toBeDefined();
      expect(workflowResult.status).toBeDefined();
      expect(workflowResult.executionId).toBeDefined();
    });

    it('应该正确处理工作流执行失败', async () => {
      // Arrange
      const invalidWorkflowRequest = {
        contextId: 'invalid-context',
        workflowConfig: {
          name: 'Invalid Workflow',
          stages: ['nonexistent-module'],
          executionMode: 'sequential' as const,
          parallelExecution: false,
          priority: 'medium' as const
        },
        priority: 'medium' as const,
        metadata: {
          testMode: true,
          workflowId: 'invalid-workflow'
        }
      };

      // Act & Assert
      await expect(orchestrator.executeWorkflow(invalidWorkflowRequest))
        .rejects.toThrow();
    });
  });

  describe('2. 模块协调功能测试', () => {
    it('应该成功协调多个模块的交互', async () => {
      // Arrange
      const modules = ['context', 'plan', 'role'];
      const operation = 'data_sync';
      const parameters = { contextId: 'ctx-001', userId: 'user-001' };

      // Act
      const coordinationResult = await orchestrator.coordinateModules(modules, operation, parameters);

      // Assert
      expect(coordinationResult.success).toBe(true);
      expect(coordinationResult.coordinatedModules).toContain('plan');
      expect(coordinationResult.coordinatedModules).toContain('role');
      expect(coordinationResult.executionTime).toBeLessThan(1000); // < 1秒
    });

    it('应该验证模块间协调权限', async () => {
      // Arrange
      const modules = ['invalid-module', 'context'];
      const operation = 'unauthorized_access';
      const parameters = {};

      // Act & Assert
      await expect(orchestrator.coordinateModules(modules, operation, parameters))
        .rejects.toThrow();
    });
  });

  describe('3. 预留接口激活功能测试', () => {
    it('应该成功激活所有支持模块的预留接口', async () => {
      // Arrange
      const supportedModules = [
        'context', 'plan', 'role', 'confirm', 'trace',
        'extension', 'dialog', 'collab', 'network'
      ];

      // Act
      const activationResults = [];
      for (const moduleId of supportedModules) {
        const result = await interfaceActivator.activateModuleInterfaces(moduleId);
        activationResults.push({ moduleId, result });
      }

      // Assert
      expect(activationResults).toHaveLength(9);
      activationResults.forEach(({ moduleId, result }) => {
        expect(result.success).toBe(true);
        expect(result.activatedInterfaces).toBeGreaterThan(0);
      });
    });

    it('应该正确处理预留接口激活失败', async () => {
      // Act & Assert
      await expect(interfaceActivator.activateModuleInterfaces('invalid-module'))
        .rejects.toThrow('Module not found');
    });
  });

  describe('4. 资源管理功能测试', () => {
    it('应该成功分配和管理系统资源', async () => {
      // Arrange
      const resourceRequest = {
        requestId: 'resource-001',
        moduleId: 'plan',
        resourceType: 'compute',
        requirements: { cpu: 2, memory: '4GB', timeout: 30000 }
      };

      // Act
      const allocation = await orchestrator.allocateResource(resourceRequest);

      // Assert
      expect(allocation.success).toBe(true);
      expect(allocation.resourceId).toBeDefined();
      expect(allocation.allocatedResources.cpu).toBe(2);
      expect(allocation.allocatedResources.memory).toBe('4GB');
    });

    it('应该正确处理资源不足情况', async () => {
      // Arrange
      const excessiveResourceRequest = {
        requestId: 'resource-excessive',
        moduleId: 'plan',
        resourceType: 'compute',
        requirements: { cpu: 1000, memory: '1TB' } // 过度请求
      };

      // Act & Assert
      await expect(orchestrator.allocateResource(excessiveResourceRequest))
        .rejects.toThrow('Insufficient resources');
    });
  });

  describe('5. 性能监控功能测试', () => {
    it('应该收集和报告系统性能指标', async () => {
      // Act
      const performanceMetrics = await orchestrator.getPerformanceMetrics();

      // Assert
      expect(performanceMetrics).toBeDefined();
      expect(performanceMetrics.systemHealth).toBeDefined();
      expect(performanceMetrics.modulePerformance).toBeDefined();
      expect(performanceMetrics.resourceUtilization).toBeDefined();
      expect(performanceMetrics.timestamp).toBeInstanceOf(Date);
    });

    it('应该检测性能异常并报警', async () => {
      // Arrange - 模拟高负载情况
      const highLoadScenario = {
        cpuUsage: 95,
        memoryUsage: 90,
        responseTime: 5000
      };

      // Act
      const alertResult = await orchestrator.checkPerformanceAlerts(highLoadScenario);

      // Assert
      expect(alertResult.hasAlerts).toBe(true);
      expect(alertResult.alerts).toContain('High CPU usage detected');
      expect(alertResult.alerts).toContain('High memory usage detected');
      expect(alertResult.alerts).toContain('Slow response time detected');
    });
  });

  describe('6. 事务管理功能测试', () => {
    it('应该成功管理跨模块事务', async () => {
      // Arrange
      const transactionConfig = {
        transactionId: 'tx-001',
        modules: ['context', 'plan', 'confirm'],
        operations: [
          { moduleId: 'context', operation: 'create', data: { contextId: 'ctx-tx-001' } },
          { moduleId: 'plan', operation: 'create', data: { planId: 'plan-tx-001' } },
          { moduleId: 'confirm', operation: 'create', data: { confirmId: 'confirm-tx-001' } }
        ]
      };

      // Act
      const transactionResult = await orchestrator.executeTransaction(transactionConfig);

      // Assert
      expect(transactionResult.success).toBe(true);
      expect(transactionResult.transactionId).toBe('tx-001');
      expect(transactionResult.completedOperations).toHaveLength(3);
    });

    it('应该正确处理事务回滚', async () => {
      // Arrange
      const failingTransactionConfig = {
        transactionId: 'tx-fail-001',
        modules: ['context', 'invalid-module'],
        operations: [
          { moduleId: 'context', operation: 'create', data: { contextId: 'ctx-fail-001' } },
          { moduleId: 'invalid-module', operation: 'create', data: {} } // 会失败
        ]
      };

      // Act
      const transactionResult = await orchestrator.executeTransaction(failingTransactionConfig);

      // Assert
      expect(transactionResult.success).toBe(false);
      expect(transactionResult.rolledBack).toBe(true);
      expect(transactionResult.error).toContain('Transaction failed');
    });
  });

  describe('7. 状态同步功能测试', () => {
    it('应该成功同步多模块状态', async () => {
      // Arrange
      const syncConfig = {
        syncId: 'sync-001',
        modules: ['context', 'plan', 'role'],
        syncType: 'full',
        data: { userId: 'user-sync-001', timestamp: new Date() }
      };

      // Act
      const syncResult = await orchestrator.synchronizeState(syncConfig);

      // Assert
      expect(syncResult.success).toBe(true);
      expect(syncResult.synchronizedModules).toHaveLength(3);
      expect(syncResult.syncTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('8. 事件总线协调功能测试', () => {
    it('应该成功协调模块间事件通信', async () => {
      // Arrange
      const eventConfig = {
        eventType: 'context_updated',
        sourceModule: 'context',
        targetModules: ['plan', 'role'],
        payload: { contextId: 'ctx-event-001', changes: ['metadata'] }
      };

      // Act
      const eventResult = await orchestrator.publishEvent(eventConfig);

      // Assert
      expect(eventResult.success).toBe(true);
      expect(eventResult.deliveredTo).toContain('plan');
      expect(eventResult.deliveredTo).toContain('role');
    });
  });

  describe('9. 安全验证功能测试', () => {
    it('应该验证工作流执行权限', async () => {
      // Arrange
      const secureWorkflowConfig = {
        workflowId: 'secure-workflow-001',
        requiredPermissions: ['workflow:execute', 'module:coordinate'],
        userContext: { userId: 'user-001', roles: ['admin'] }
      };

      // Act
      const validationResult = await orchestrator.validateWorkflowSecurity(secureWorkflowConfig);

      // Assert
      expect(validationResult.isAuthorized).toBe(true);
      expect(validationResult.grantedPermissions).toContain('workflow:execute');
      expect(validationResult.grantedPermissions).toContain('module:coordinate');
    });
  });

  describe('10. 错误处理功能测试', () => {
    it('应该正确处理和恢复系统错误', async () => {
      // Arrange
      const errorScenario = {
        errorType: 'module_failure',
        failedModule: 'plan',
        errorMessage: 'Service temporarily unavailable'
      };

      // Act
      const recoveryResult = await orchestrator.handleSystemError(errorScenario);

      // Assert
      expect(recoveryResult.handled).toBe(true);
      expect(recoveryResult.recoveryAction).toBe('module_restart');
      expect(recoveryResult.systemStable).toBe(true);
    });
  });

  describe('CoreOrchestrator健康检查', () => {
    it('应该报告系统健康状态', async () => {
      // Act
      const healthCheck = await coreOrchestratorResult.healthCheck();

      // Assert
      expect(healthCheck.status).toBe('healthy');
      expect(healthCheck.modules).toBeDefined();
      expect(healthCheck.uptime).toBeGreaterThan(0);
      expect(healthCheck.version).toBe('1.0.0');
    });

    it('应该提供详细的模块信息', () => {
      // Act
      const moduleInfo = coreOrchestratorResult.getModuleInfo();

      // Assert
      expect(moduleInfo.name).toBe('CoreOrchestrator');
      expect(moduleInfo.version).toBe('1.0.0');
      expect(moduleInfo.layer).toBe('L3');
      expect(moduleInfo.status).toBe('active');
      expect(moduleInfo.capabilities).toHaveLength(10);
      expect(moduleInfo.supportedModules).toHaveLength(9);
    });
  });
});
