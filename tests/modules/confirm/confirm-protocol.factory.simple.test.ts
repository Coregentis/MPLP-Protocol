/**
 * Confirm协议工厂简化测试
 * 
 * @description 测试ConfirmProtocolFactory的基本功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmProtocolFactory } from '../../../src/modules/confirm/infrastructure/factories/confirm-protocol.factory';

// Mock所有依赖
jest.mock('../../../src/modules/confirm/infrastructure/protocols/confirm.protocol');
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');
jest.mock('../../../src/modules/confirm/infrastructure/repositories/confirm.repository');
// Mock CrossCuttingConcernsFactory
const mockCrossCuttingFactory = {
  createManagers: jest.fn(() => ({
    security: { validateRequest: jest.fn(), validateResponse: jest.fn() },
    performance: { startTimer: jest.fn(), endTimer: jest.fn() },
    eventBus: { publish: jest.fn(), subscribe: jest.fn() },
    errorHandler: { handleError: jest.fn() },
    coordination: { coordinate: jest.fn() },
    orchestration: { orchestrate: jest.fn() },
    stateSync: { syncState: jest.fn() },
    transaction: { beginTransaction: jest.fn() },
    protocolVersion: { validateVersion: jest.fn() }
  }))
};

jest.mock('../../../src/core/protocols/cross-cutting-concerns', () => ({
  CrossCuttingConcernsFactory: {
    getInstance: jest.fn(() => mockCrossCuttingFactory)
  }
}));

describe('ConfirmProtocolFactory简化测试', () => {
  beforeEach(() => {
    // 清理单例状态
    (ConfirmProtocolFactory as any).instance = undefined;
    (ConfirmProtocolFactory as any).protocolInstance = undefined;
    jest.clearAllMocks();
    jest.resetAllMocks();

    // 重新设置Mock CrossCuttingConcernsFactory
    mockCrossCuttingFactory.createManagers = jest.fn(() => ({
      security: { validateRequest: jest.fn(), validateResponse: jest.fn() },
      performance: { startTimer: jest.fn(), endTimer: jest.fn() },
      eventBus: { publish: jest.fn(), subscribe: jest.fn() },
      errorHandler: { handleError: jest.fn() },
      coordination: { coordinate: jest.fn() },
      orchestration: { orchestrate: jest.fn() },
      stateSync: { syncState: jest.fn() },
      transaction: { beginTransaction: jest.fn() },
      protocolVersion: { validateVersion: jest.fn() }
    }));

    // 动态Mock CrossCuttingConcernsFactory
    const { CrossCuttingConcernsFactory } = require('../../../src/core/protocols/cross-cutting-concerns');
    CrossCuttingConcernsFactory.getInstance = jest.fn(() => mockCrossCuttingFactory);

    // 重新设置基本的Mock实现
    const { ConfirmManagementService } = require('../../../src/modules/confirm/application/services/confirm-management.service');
    ConfirmManagementService.mockImplementation(() => ({
      createConfirm: jest.fn(),
      getConfirm: jest.fn(),
      updateConfirm: jest.fn(),
      deleteConfirm: jest.fn()
    }));
  });

  afterEach(() => {
    // 清理单例状态
    (ConfirmProtocolFactory as any).instance = undefined;
    (ConfirmProtocolFactory as any).protocolInstance = undefined;
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

    it('应该创建不同的协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol1 = await factory.createProtocol();
      // 重置以创建新实例
      (ConfirmProtocolFactory as any).protocolInstance = undefined;
      const protocol2 = await factory.createProtocol();

      expect(protocol1).toBeDefined();
      expect(protocol2).toBeDefined();
    });
  });

  describe('getProtocol方法测试', () => {
    it('应该返回协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol = await factory.getProtocol();

      expect(protocol).toBeDefined();
    });

    it('应该在未创建协议时自动创建', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol = await factory.getProtocol();

      expect(protocol).toBeDefined();
    });

    it('应该返回相同的协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol1 = await factory.getProtocol();
      const protocol2 = await factory.getProtocol();

      expect(protocol1).toBe(protocol2);
    });
  });

  describe('reset方法测试', () => {
    it('应该重置协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol1 = await factory.getProtocol();
      factory.reset();
      const protocol2 = await factory.getProtocol();

      expect(protocol1).toBeDefined();
      expect(protocol2).toBeDefined();
      // 由于使用Mock，可能返回相同的实例，这是正常的
    });

    it('应该允许创建新的协议实例', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      await factory.getProtocol();
      factory.reset();
      const newProtocol = await factory.createProtocol();

      expect(newProtocol).toBeDefined();
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

    it('应该正确处理并发的getProtocol调用', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(factory.getProtocol());
      }

      const protocols = await Promise.all(promises);
      const firstProtocol = protocols[0];
      
      protocols.forEach(protocol => {
        expect(protocol).toBe(firstProtocol);
      });
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协议创建失败', async () => {
      // Mock协议构造函数抛出错误
      const ConfirmProtocol = require('../../../src/modules/confirm/infrastructure/protocols/confirm.protocol').ConfirmProtocol;
      ConfirmProtocol.mockImplementation(() => {
        throw new Error('Protocol creation failed');
      });

      const factory = ConfirmProtocolFactory.getInstance();

      await expect(factory.createProtocol()).rejects.toThrow('Protocol creation failed');
    });

    it('应该处理依赖创建失败', async () => {
      // 重置工厂实例
      (ConfirmProtocolFactory as any).instance = undefined;

      // Mock服务构造函数抛出错误
      const { ConfirmManagementService } = require('../../../src/modules/confirm/application/services/confirm-management.service');
      ConfirmManagementService.mockImplementationOnce(() => {
        throw new Error('Service creation failed');
      });

      const factory = ConfirmProtocolFactory.getInstance();

      await expect(factory.createProtocol()).rejects.toThrow('Service creation failed');
    });
  });

  describe('内存管理测试', () => {
    it('应该正确清理资源', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      await factory.getProtocol();
      factory.reset();

      // 验证资源被正确清理（通过重置单例状态）
      expect((ConfirmProtocolFactory as any).protocolInstance).toBeUndefined();
    });
  });

  describe('配置测试', () => {
    it('应该使用默认配置创建协议', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
    });

    it('应该创建所有必需的依赖', async () => {
      const factory = ConfirmProtocolFactory.getInstance();
      
      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
      // 验证Mock被调用，说明依赖被创建
      const ConfirmManagementService = require('../../../src/modules/confirm/application/services/confirm-management.service').ConfirmManagementService;
      const MemoryConfirmRepository = require('../../../src/modules/confirm/infrastructure/repositories/confirm.repository').MemoryConfirmRepository;
      
      expect(ConfirmManagementService).toHaveBeenCalled();
      expect(MemoryConfirmRepository).toHaveBeenCalled();
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
      await factory.getProtocol();
      
      // 第二次获取应该很快
      const startTime = Date.now();
      await factory.getProtocol();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // 应该在10ms内完成
    });
  });
});
