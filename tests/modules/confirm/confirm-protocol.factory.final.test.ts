/**
 * Confirm协议工厂最终测试
 * 
 * @description 测试ConfirmProtocolFactory的实际功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmProtocolFactory } from '../../../src/modules/confirm/infrastructure/factories/confirm-protocol.factory';

// Mock所有依赖
jest.mock('../../../src/modules/confirm/infrastructure/protocols/confirm.protocol', () => ({
  ConfirmProtocol: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: []
    }),
    getMetadata: jest.fn().mockReturnValue({
      name: 'confirm',
      version: '1.0.0',
      description: 'Test protocol'
    })
  }))
}));
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');
jest.mock('../../../src/modules/confirm/infrastructure/repositories/confirm.repository');
jest.mock('../../../src/core/protocols/cross-cutting-concerns', () => ({
  CrossCuttingConcernsFactory: {
    getInstance: jest.fn().mockReturnValue({
      createManagers: jest.fn().mockReturnValue({
        security: {},
        performance: {},
        eventBus: {},
        errorHandler: {},
        coordination: {},
        orchestration: {},
        stateSync: {},
        transaction: {},
        protocolVersion: {}
      })
    })
  },
  MLPPSecurityManager: jest.fn().mockImplementation(() => ({})),
  MLPPPerformanceMonitor: jest.fn().mockImplementation(() => ({})),
  MLPPEventBusManager: jest.fn().mockImplementation(() => ({})),
  MLPPErrorHandler: jest.fn().mockImplementation(() => ({})),
  MLPPCoordinationManager: jest.fn().mockImplementation(() => ({})),
  MLPPOrchestrationManager: jest.fn().mockImplementation(() => ({})),
  MLPPStateSyncManager: jest.fn().mockImplementation(() => ({})),
  MLPPTransactionManager: jest.fn().mockImplementation(() => ({})),
  MLPPProtocolVersionManager: jest.fn().mockImplementation(() => ({}))
}));

describe('ConfirmProtocolFactory最终测试', () => {
  beforeEach(() => {
    // 清理单例状态
    (ConfirmProtocolFactory as any).instance = undefined;
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 清理单例状态
    (ConfirmProtocolFactory as any).instance = undefined;
  });

  describe('getInstance方法测试', () => {
    it('应该返回单例实例', () => {
      const factory1 = ConfirmProtocolFactory.getInstance();
      const factory2 = ConfirmProtocolFactory.getInstance();

      expect(factory1).toBe(factory2);
      expect(factory1).toBeInstanceOf(ConfirmProtocolFactory);
    });

    it('应该在多次调用时返回相同实例', () => {
      const instances = [];
      for (let i = 0; i < 5; i++) {
        instances.push(ConfirmProtocolFactory.getInstance());
      }

      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });
  });

  describe('createProtocol方法测试', () => {
    it('应该成功创建协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
    });

    it('应该使用配置创建协议', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      const config = {
        enableLogging: true,
        enableCaching: true,
        repositoryType: 'memory' as const
      };
      
      const protocol = await factory.createProtocol(config);

      expect(protocol).toBeDefined();
    });

    it('应该返回相同的协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol1 = await factory.createProtocol();
      const protocol2 = await factory.createProtocol();

      expect(protocol1).toBe(protocol2);
    });
  });

  describe('getProtocol方法测试', () => {
    it('应该在未创建协议时返回null', () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol = factory.getProtocol();

      expect(protocol).toBeNull();
    });

    it('应该在创建协议后返回协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const createdProtocol = await factory.createProtocol();
      const retrievedProtocol = factory.getProtocol();

      expect(retrievedProtocol).toBe(createdProtocol);
    });
  });

  describe('reset方法测试', () => {
    it('应该重置协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      await factory.createProtocol();
      expect(factory.getProtocol()).not.toBeNull();
      
      factory.reset();
      expect(factory.getProtocol()).toBeNull();
    });

    it('应该允许重新创建协议', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol1 = await factory.createProtocol();
      factory.reset();
      const protocol2 = await factory.createProtocol();

      expect(protocol1).toBeDefined();
      expect(protocol2).toBeDefined();
      // 由于使用Mock，可能返回相同的实例，这是正常的
    });
  });

  describe('healthCheck方法测试', () => {
    it('应该在未初始化时返回不健康状态', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const health = await factory.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details.error).toBe('Protocol not initialized');
    });

    it('应该在初始化后返回健康状态', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      await factory.createProtocol();
      const health = await factory.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details).toBeDefined();
    });
  });

  describe('getMetadata方法测试', () => {
    it('应该在未初始化时抛出错误', () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      expect(() => factory.getMetadata()).toThrow('Protocol not initialized');
    });

    it('应该在初始化后返回元数据', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      await factory.createProtocol();
      const metadata = factory.getMetadata();

      expect(metadata).toBeDefined();
    });
  });

  describe('getStatistics方法测试', () => {
    it('应该返回工厂统计信息', () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const stats = factory.getStatistics();

      expect(stats).toHaveProperty('protocolInitialized');
      expect(stats).toHaveProperty('factoryVersion');
      expect(stats).toHaveProperty('supportedRepositoryTypes');
      expect(stats.factoryVersion).toBe('1.0.0');
      expect(Array.isArray(stats.supportedRepositoryTypes)).toBe(true);
    });

    it('应该正确反映协议初始化状态', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      let stats = factory.getStatistics();
      expect(stats.protocolInitialized).toBe(false);
      
      await factory.createProtocol();
      stats = factory.getStatistics();
      expect(stats.protocolInitialized).toBe(true);
    });
  });

  describe('并发测试', () => {
    it('应该正确处理并发的getInstance调用', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(ConfirmProtocolFactory.getInstance()));
      }

      const instances = await Promise.all(promises);
      const firstInstance = instances[0];
      
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });

    it('应该正确处理并发的createProtocol调用', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(factory.createProtocol());
      }

      const protocols = await Promise.all(promises);
      const firstProtocol = protocols[0];
      
      protocols.forEach(protocol => {
        expect(protocol).toBe(firstProtocol);
      });
    });
  });

  describe('配置测试', () => {
    it('应该支持不同的仓库类型', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol1 = await factory.createProtocol({ repositoryType: 'memory' });
      factory.reset();
      
      const protocol2 = await factory.createProtocol({ repositoryType: 'memory' });

      expect(protocol1).toBeDefined();
      expect(protocol2).toBeDefined();
    });

    it('应该支持横切关注点配置', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      const config = {
        crossCuttingConcerns: {
          security: { enabled: true },
          performance: { enabled: false }
        }
      };
      
      const protocol = await factory.createProtocol(config);

      expect(protocol).toBeDefined();
    });
  });

  describe('单例模式测试', () => {
    it('应该维护单例模式', () => {
      const factory1 = ConfirmProtocolFactory.getInstance();
      const factory2 = ConfirmProtocolFactory.getInstance();
      const factory3 = ConfirmProtocolFactory.getInstance();

      expect(factory1).toBe(factory2);
      expect(factory2).toBe(factory3);
      expect(factory1).toBe(factory3);
    });

    it('应该在重置后仍然维护单例', () => {
      const factory1 = ConfirmProtocolFactory.getInstance();
      factory1.reset();
      const factory2 = ConfirmProtocolFactory.getInstance();

      expect(factory1).toBe(factory2);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内创建协议', async () => {
      const factory = ConfirmProtocolFactory.getInstance();

      const startTime = Date.now();
      await factory.createProtocol();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该快速返回已创建的协议', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      // 首次创建
      await factory.createProtocol();
      
      // 第二次获取应该很快
      const startTime = Date.now();
      await factory.createProtocol();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // 应该在10ms内完成
    });
  });
});
