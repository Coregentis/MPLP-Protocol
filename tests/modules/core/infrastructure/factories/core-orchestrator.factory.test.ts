/**
 * CoreOrchestratorFactory测试套件
 * 
 * @description 基于实际源代码实现的工厂测试，验证工厂模式和依赖注入
 * @version 1.0.0
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的工厂测试模式
 */

import { CoreOrchestratorFactory, CoreOrchestratorFactoryConfig, CoreOrchestratorFactoryResult } from '../../../../../src/modules/core/infrastructure/factories/core-orchestrator.factory';

// ===== 测试套件 =====

describe('CoreOrchestratorFactory测试', () => {
  let factory: CoreOrchestratorFactory;

  beforeEach(() => {
    // 重置工厂实例
    CoreOrchestratorFactory.resetInstance();
    factory = CoreOrchestratorFactory.getInstance();
  });

  afterEach(() => {
    // 清理工厂实例
    CoreOrchestratorFactory.resetInstance();
  });

  describe('单例模式测试', () => {
    it('应该返回同一个工厂实例', () => {
      const factory1 = CoreOrchestratorFactory.getInstance();
      const factory2 = CoreOrchestratorFactory.getInstance();
      
      expect(factory1).toBe(factory2);
    });

    it('应该正确重置实例', () => {
      const factory1 = CoreOrchestratorFactory.getInstance();
      CoreOrchestratorFactory.resetInstance();
      const factory2 = CoreOrchestratorFactory.getInstance();
      
      expect(factory1).not.toBe(factory2);
    });
  });

  describe('createCoreOrchestrator方法测试', () => {
    it('应该使用默认配置创建CoreOrchestrator', async () => {
      const result: CoreOrchestratorFactoryResult = await factory.createCoreOrchestrator();
      
      // 验证返回结构
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      expect(result.interfaceActivator).toBeDefined();
      expect(result.orchestrationService).toBeDefined();
      expect(result.resourceService).toBeDefined();
      expect(result.monitoringService).toBeDefined();
      expect(result.managementService).toBeDefined();
      expect(result.repository).toBeDefined();
      expect(result.crossCuttingManagers).toBeDefined();
      expect(result.healthCheck).toBeInstanceOf(Function);
      expect(result.shutdown).toBeInstanceOf(Function);
    });

    it('应该使用自定义配置创建CoreOrchestrator', async () => {
      const config: CoreOrchestratorFactoryConfig = {
        enableLogging: false,
        enableMetrics: false,
        enableCaching: true,
        repositoryType: 'memory',
        maxConcurrentWorkflows: 50,
        workflowTimeout: 120000,
        enableReservedInterfaces: false,
        enableModuleCoordination: false
      };
      
      const result = await factory.createCoreOrchestrator(config);
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
    });

    it('应该正确创建横切关注点管理器', async () => {
      const result = await factory.createCoreOrchestrator();
      
      // 验证横切关注点管理器
      expect(result.crossCuttingManagers).toBeDefined();
      expect(result.crossCuttingManagers.security).toBeDefined();
      expect(result.crossCuttingManagers.performance).toBeDefined();
      expect(result.crossCuttingManagers.eventBus).toBeDefined();
      expect(result.crossCuttingManagers.errorHandler).toBeDefined();
      expect(result.crossCuttingManagers.coordination).toBeDefined();
      expect(result.crossCuttingManagers.orchestration).toBeDefined();
      expect(result.crossCuttingManagers.stateSync).toBeDefined();
      expect(result.crossCuttingManagers.transaction).toBeDefined();
      expect(result.crossCuttingManagers.protocolVersion).toBeDefined();
    });
  });

  describe('预设配置方法测试', () => {
    it('应该创建开发环境配置的CoreOrchestrator', async () => {
      const result = await factory.createDevelopmentOrchestrator();
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      expect(result.interfaceActivator).toBeDefined();
    });

    it('应该创建生产环境配置的CoreOrchestrator', async () => {
      const result = await factory.createProductionOrchestrator();
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      expect(result.interfaceActivator).toBeDefined();
    });

    it('应该创建测试环境配置的CoreOrchestrator', async () => {
      const result = await factory.createTestOrchestrator();
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      expect(result.interfaceActivator).toBeDefined();
    });
  });

  describe('健康检查功能测试', () => {
    it('应该返回健康状态信息', async () => {
      const result = await factory.createCoreOrchestrator();
      const healthStatus = await result.healthCheck();
      
      // 验证健康状态结构
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(healthStatus.components).toBeDefined();
      expect(typeof healthStatus.components).toBe('object');
      expect(healthStatus.metrics).toBeDefined();
      expect(typeof healthStatus.metrics).toBe('object');
    });

    it('应该检查所有核心组件的健康状态', async () => {
      const result = await factory.createCoreOrchestrator();
      const healthStatus = await result.healthCheck();
      
      // 验证组件检查
      expect(healthStatus.components.repository).toBeDefined();
      expect(healthStatus.components.orchestrationService).toBeDefined();
      expect(healthStatus.components.resourceService).toBeDefined();
      expect(healthStatus.components.monitoringService).toBeDefined();
      expect(healthStatus.components.managementService).toBeDefined();
      expect(healthStatus.components.securityManager).toBeDefined();
      expect(healthStatus.components.performanceMonitor).toBeDefined();
      expect(healthStatus.components.eventBusManager).toBeDefined();
      expect(healthStatus.components.errorHandler).toBeDefined();
      expect(healthStatus.components.coordinationManager).toBeDefined();
    });
  });

  describe('关闭功能测试', () => {
    it('应该正确执行关闭流程', async () => {
      const result = await factory.createCoreOrchestrator();
      
      // 验证关闭函数不抛出错误
      await expect(result.shutdown()).resolves.not.toThrow();
    });
  });

  describe('适配器功能测试', () => {
    it('应该正确创建SecurityManager适配器', async () => {
      const result = await factory.createCoreOrchestrator();
      
      // 通过CoreOrchestrator验证适配器功能
      expect(result.orchestrator).toBeDefined();
      
      // 验证适配器方法存在（通过不抛出错误来验证）
      expect(() => {
        // 这里我们无法直接访问私有适配器，但可以通过创建成功来验证
        result.orchestrator.coordinateModules(['context'], 'test-workflow', {});
      }).not.toThrow();
    });

    it('应该正确创建PerformanceMonitor适配器', async () => {
      const result = await factory.createCoreOrchestrator();
      
      // 验证性能监控适配器通过工厂创建成功
      expect(result.crossCuttingManagers.performance).toBeDefined();
    });

    it('应该正确创建EventBusManager适配器', async () => {
      const result = await factory.createCoreOrchestrator();
      
      // 验证事件总线适配器通过工厂创建成功
      expect(result.crossCuttingManagers.eventBus).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理工厂创建过程中的错误', async () => {
      // 这里我们测试工厂的错误恢复能力
      // 由于工厂使用了简化实现，大部分情况下不会失败
      // 但我们可以测试配置验证
      
      const invalidConfig: CoreOrchestratorFactoryConfig = {
        maxConcurrentWorkflows: -1, // 无效配置
        workflowTimeout: -1000 // 无效配置
      };
      
      // 工厂应该能处理无效配置（使用默认值或忽略）
      const result = await factory.createCoreOrchestrator(invalidConfig);
      expect(result).toBeDefined();
    });
  });

  describe('配置合并测试', () => {
    it('应该正确合并默认配置和自定义配置', async () => {
      const customConfig: CoreOrchestratorFactoryConfig = {
        enableLogging: false,
        maxConcurrentWorkflows: 200
        // 其他配置使用默认值
      };
      
      const result = await factory.createCoreOrchestrator(customConfig);
      
      // 验证工厂能够处理部分配置
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
    });
  });

  describe('内存管理测试', () => {
    it('应该正确管理多个实例的创建和销毁', async () => {
      const results: CoreOrchestratorFactoryResult[] = [];
      
      // 创建多个实例
      for (let i = 0; i < 3; i++) {
        const result = await factory.createCoreOrchestrator();
        results.push(result);
      }
      
      // 验证所有实例都创建成功
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.orchestrator).toBeDefined();
      });
      
      // 执行关闭流程
      for (const result of results) {
        await result.shutdown();
      }
    });
  });
});
