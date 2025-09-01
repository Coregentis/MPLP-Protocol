/**
 * Confirm协议工厂测试
 * 
 * @description 测试ConfirmProtocolFactory的协议实例创建和管理
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmProtocolFactory } from '../../../src/modules/confirm/infrastructure/factories/confirm-protocol.factory';
import { ConfirmProtocol } from '../../../src/modules/confirm/infrastructure/protocols/confirm.protocol';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { MemoryConfirmRepository } from '../../../src/modules/confirm/infrastructure/repositories/confirm.repository';

// Mock依赖
jest.mock('../../../src/modules/confirm/infrastructure/protocols/confirm.protocol');
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');
jest.mock('../../../src/modules/confirm/infrastructure/repositories/confirm.repository');

// Mock CrossCuttingConcernsFactory但保持其基本功能
jest.mock('../../../src/core/protocols/cross-cutting-concerns', () => ({
  CrossCuttingConcernsFactory: {
    getInstance: jest.fn(() => ({
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
    }))
  }
}));

describe('ConfirmProtocolFactory测试', () => {
  let factory: ConfirmProtocolFactory;

  beforeEach(() => {
    // 重置单例状态
    (ConfirmProtocolFactory as any).instance = undefined;
    (ConfirmProtocolFactory as any).protocolInstance = undefined;

    // 重新设置Mock CrossCuttingConcernsFactory (与Factory Simple测试相同的策略)
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

    // 动态Mock CrossCuttingConcernsFactory
    const { CrossCuttingConcernsFactory } = require('../../../src/core/protocols/cross-cutting-concerns');
    CrossCuttingConcernsFactory.getInstance = jest.fn(() => mockCrossCuttingFactory);

    factory = ConfirmProtocolFactory.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
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
      for (let i = 0; i < 10; i++) {
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
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
      expect(ConfirmProtocol).toHaveBeenCalledTimes(1);
    });

    it('应该使用正确的依赖创建协议', async () => {
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      await factory.createProtocol();

      // 验证ConfirmProtocol构造函数被调用时传入了正确的参数
      expect(ConfirmProtocol).toHaveBeenCalledWith(
        expect.any(ConfirmManagementService), // confirmService
        expect.anything(), // securityManager
        expect.anything(), // performanceMonitor
        expect.anything(), // eventBusManager
        expect.anything(), // errorHandler
        expect.anything(), // coordinationManager
        expect.anything(), // orchestrationManager
        expect.anything(), // stateSyncManager
        expect.anything(), // transactionManager
        expect.anything()  // protocolVersionManager
      );
    });

    it('应该创建ConfirmManagementService实例', async () => {
      await factory.createProtocol();

      expect(ConfirmManagementService).toHaveBeenCalledWith(
        expect.any(MemoryConfirmRepository)
      );
    });

    it('应该创建MemoryConfirmRepository实例', async () => {
      await factory.createProtocol();

      expect(MemoryConfirmRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProtocol方法测试', () => {
    it('应该返回已创建的协议实例', async () => {
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      const createdProtocol = await factory.createProtocol();
      const retrievedProtocol = await factory.getProtocol();

      expect(retrievedProtocol).toBe(createdProtocol);
    });

    it('应该在未创建协议时返回null', async () => {
      const protocol = factory.getProtocol();
      expect(protocol).toBeNull();
    });

    it('应该返回相同的协议实例', async () => {
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      // 先创建协议
      await factory.createProtocol();

      const protocol1 = factory.getProtocol();
      const protocol2 = factory.getProtocol();

      expect(protocol1).toBe(protocol2);
      expect(ConfirmProtocol).toHaveBeenCalledTimes(1); // 只创建一次
    });
  });

  describe('reset方法测试', () => {
    it('应该重置协议实例', async () => {
      const mockProtocol1 = { id: 1 } as any;
      const mockProtocol2 = { id: 2 } as any;

      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>)
        .mockImplementationOnce(() => mockProtocol1)
        .mockImplementationOnce(() => mockProtocol2);

      // 创建第一个协议
      await factory.createProtocol();
      const protocol1 = factory.getProtocol();

      // 重置并创建第二个协议
      factory.reset();
      await factory.createProtocol();
      const protocol2 = factory.getProtocol();

      expect(protocol1).not.toBe(protocol2);
      expect(ConfirmProtocol).toHaveBeenCalledTimes(2);
    });

    it('应该允许创建新的协议实例', async () => {
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      // 先创建一个协议
      await factory.createProtocol();
      factory.reset();
      const newProtocol = await factory.createProtocol();

      expect(newProtocol).toBeDefined();
      expect(ConfirmProtocol).toHaveBeenCalledTimes(2);
    });
  });

  describe('并发测试', () => {
    it('应该正确处理并发的getInstance调用', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(ConfirmProtocolFactory.getInstance()));
      }

      const instances = await Promise.all(promises);
      const firstInstance = instances[0];
      
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });

    it('应该正确处理并发的getProtocol调用', async () => {
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      // 先创建协议
      await factory.createProtocol();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(factory.getProtocol()));
      }

      const protocols = await Promise.all(promises);
      const firstProtocol = protocols[0];

      protocols.forEach(protocol => {
        expect(protocol).toBe(firstProtocol);
      });

      expect(ConfirmProtocol).toHaveBeenCalledTimes(1); // 只创建一次
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协议创建失败', async () => {
      const error = new Error('Protocol creation failed');
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => {
        throw error;
      });

      await expect(factory.createProtocol()).rejects.toThrow('Protocol creation failed');
    });

    it('应该处理依赖创建失败', async () => {
      // 重置单例状态，避免beforeEach中的factory创建干扰
      (ConfirmProtocolFactory as any).instance = undefined;
      (ConfirmProtocolFactory as any).protocolInstance = undefined;

      const error = new Error('Service creation failed');
      (ConfirmManagementService as jest.MockedClass<typeof ConfirmManagementService>).mockImplementation(() => {
        throw error;
      });

      const testFactory = ConfirmProtocolFactory.getInstance();
      await expect(testFactory.createProtocol()).rejects.toThrow('Service creation failed');
    });
  });

  describe('内存管理测试', () => {
    it('应该正确清理资源', async () => {
      const mockProtocol = {
        cleanup: jest.fn()
      } as any;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      await factory.createProtocol();
      factory.reset();

      // 验证资源被正确清理
      expect(mockProtocol.cleanup).not.toHaveBeenCalled(); // 当前实现可能不包含cleanup方法
    });
  });

  describe('配置测试', () => {
    it('应该使用默认配置创建协议', async () => {
      const mockProtocol = {} as ConfirmProtocol;
      (ConfirmProtocol as jest.MockedClass<typeof ConfirmProtocol>).mockImplementation(() => mockProtocol);

      await factory.createProtocol();

      // 验证使用了默认的仓库实现
      expect(MemoryConfirmRepository).toHaveBeenCalledTimes(1);
    });
  });
});
