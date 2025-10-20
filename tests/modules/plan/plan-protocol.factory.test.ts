/**
 * Plan协议工厂单元测试
 *
 * @description 验证Plan协议工厂的创建、配置和管理功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的工厂测试模式
 */

import {
  PlanProtocolFactory,
  PlanProtocolFactoryConfig
} from '../../../src/modules/plan/infrastructure/factories/plan-protocol.factory';
import { IMLPPProtocol } from '../../../src/core/protocols/mplp-protocol-base';

// Mock dependencies
jest.mock('../../../src/modules/plan/infrastructure/protocols/plan.protocol');
jest.mock('../../../src/modules/plan/application/services/plan-management.service');
jest.mock('../../../src/core/protocols/cross-cutting-concerns/factory', () => ({
  CrossCuttingConcernsFactory: {
    getInstance: jest.fn(() => ({
      createManagers: jest.fn(() => ({
        security: { enabled: true },
        performance: { enabled: true },
        eventBus: { enabled: true },
        errorHandler: { enabled: true },
        coordination: { enabled: true },
        orchestration: { enabled: true },
        stateSync: { enabled: true },
        transaction: { enabled: true },
        protocolVersion: { enabled: true }
      }))
    }))
  }
}));

describe('PlanProtocolFactory单元测试', () => {
  let factory: PlanProtocolFactory;

  beforeEach(() => {
    // 重置工厂单例
    (PlanProtocolFactory as any).instance = undefined;
    factory = PlanProtocolFactory.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // 重置工厂状态
    factory.reset();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的工厂实例', () => {
      // 🎬 Act
      const factory1 = PlanProtocolFactory.getInstance();
      const factory2 = PlanProtocolFactory.getInstance();

      // ✅ Assert
      expect(factory1).toBe(factory2);
      expect(factory1).toBeInstanceOf(PlanProtocolFactory);
    });

    it('应该在重置后创建新实例', () => {
      // 📋 Arrange
      const originalFactory = PlanProtocolFactory.getInstance();
      
      // 🎬 Act
      originalFactory.reset();
      const newFactory = PlanProtocolFactory.getInstance();

      // ✅ Assert
      expect(newFactory).toBe(originalFactory); // 同一个单例实例
      expect(newFactory.isInitialized()).toBe(false); // 但协议已重置
    });
  });

  describe('协议创建测试', () => {
    it('应该使用默认配置创建协议', async () => {
      // 🎬 Act
      const protocol = await factory.createProtocol();

      // ✅ Assert
      expect(protocol).toBeDefined();
      expect(factory.isInitialized()).toBe(true);
      expect(factory.getCurrentProtocol()).toBe(protocol);
    });

    it('应该使用自定义配置创建协议', async () => {
      // 📋 Arrange
      const customConfig: PlanProtocolFactoryConfig = {
        enableLogging: true,
        enableMetrics: true,
        enableCaching: false,
        repositoryType: 'memory',
        crossCuttingConcerns: {
          security: { enabled: true },
          performance: { enabled: false },
          eventBus: { enabled: true },
          errorHandler: { enabled: true },
          coordination: { enabled: false },
          orchestration: { enabled: false },
          stateSync: { enabled: false },
          transaction: { enabled: false },
          protocolVersion: { enabled: true }
        }
      };

      // 🎬 Act
      const protocol = await factory.createProtocol(customConfig);

      // ✅ Assert
      expect(protocol).toBeDefined();
      expect(factory.isInitialized()).toBe(true);
    });

    it('应该返回相同的协议实例（单例）', async () => {
      // 🎬 Act
      const protocol1 = await factory.createProtocol();
      const protocol2 = await factory.createProtocol();

      // ✅ Assert
      expect(protocol1).toBe(protocol2);
      expect(factory.getCurrentProtocol()).toBe(protocol1);
    });

    it('应该处理协议创建错误', async () => {
      // 📋 Arrange
      // 重置工厂状态
      factory.reset();

      // Mock CrossCuttingConcernsFactory to throw error
      const mockFactory = require('../../../src/core/protocols/cross-cutting-concerns/factory');
      const originalGetInstance = mockFactory.CrossCuttingConcernsFactory.getInstance;
      mockFactory.CrossCuttingConcernsFactory.getInstance = jest.fn(() => {
        throw new Error('Failed to create cross-cutting concerns');
      });

      // 🎬 Act & Assert
      await expect(factory.createProtocol()).rejects.toThrow('Failed to create cross-cutting concerns');
      expect(factory.isInitialized()).toBe(false);

      // 恢复原始Mock
      mockFactory.CrossCuttingConcernsFactory.getInstance = originalGetInstance;
    });
  });

  describe('协议元数据测试', () => {
    it('应该返回正确的协议元数据', () => {
      // 🎬 Act
      const metadata = factory.getProtocolMetadata();

      // ✅ Assert
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe('plan');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toBe('MPLP Plan Protocol - Intelligent Task Planning and Coordination');
      expect(metadata.capabilities).toContain('plan_creation');
      expect(metadata.capabilities).toContain('plan_management');
      expect(metadata.capabilities).toContain('task_coordination');
      expect(metadata.capabilities).toContain('plan_execution');
      expect(metadata.capabilities).toContain('plan_optimization');
      expect(metadata.dependencies).toContain('context');
      expect(metadata.dependencies).toContain('confirm');
      expect(metadata.dependencies).toContain('trace');
      expect(metadata.supportedOperations).toContain('create');
      expect(metadata.supportedOperations).toContain('get');
      expect(metadata.supportedOperations).toContain('update');
      expect(metadata.supportedOperations).toContain('delete');
      expect(metadata.supportedOperations).toContain('execute');
      expect(metadata.supportedOperations).toContain('optimize');
      expect(metadata.supportedOperations).toContain('validate');
      expect(metadata.supportedOperations).toContain('healthCheck');
    });

    it('应该包含所有必需的能力', () => {
      // 🎬 Act
      const metadata = factory.getProtocolMetadata();

      // ✅ Assert
      const expectedCapabilities = [
        'plan_creation',
        'plan_management',
        'task_coordination',
        'plan_execution',
        'plan_optimization',
        'plan_validation',
        'resource_allocation',
        'risk_management',
        'milestone_tracking',
        'progress_monitoring'
      ];

      expectedCapabilities.forEach(capability => {
        expect(metadata.capabilities).toContain(capability);
      });
    });

    it('应该包含所有MPLP依赖模块', () => {
      // 🎬 Act
      const metadata = factory.getProtocolMetadata();

      // ✅ Assert
      const expectedDependencies = [
        'context',
        'confirm',
        'trace',
        'role',
        'extension'
      ];

      expectedDependencies.forEach(dependency => {
        expect(metadata.dependencies).toContain(dependency);
      });
    });
  });

  describe('健康状态测试', () => {
    it('应该在协议未初始化时返回不健康状态', async () => {
      // 🎬 Act
      const healthStatus = await factory.getHealthStatus();

      // ✅ Assert
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.timestamp).toBeDefined();
      expect(healthStatus.checks).toHaveLength(1);
      expect(healthStatus.checks[0].name).toBe('protocol_instance');
      expect(healthStatus.checks[0].status).toBe('fail');
      expect(healthStatus.checks[0].message).toBe('Protocol not initialized');
      expect(healthStatus.metadata).toBeDefined();
      expect(healthStatus.metadata.protocolName).toBe('plan');
      expect(healthStatus.metadata.version).toBe('1.0.0');
    });

    it('应该在协议初始化后返回健康状态', async () => {
      // 📋 Arrange
      const mockProtocol = {
        healthCheck: jest.fn().mockResolvedValue({
          status: 'healthy',
          timestamp: '2024-01-01T12:00:00.000Z',
          checks: [
            { name: 'service', status: 'pass', message: 'Service is running' }
          ],
          metadata: { protocolName: 'plan', version: '1.0.0' }
        })
      };

      // Mock the protocol creation
      const mockPlanProtocol = require('../../../src/modules/plan/infrastructure/protocols/plan.protocol');
      mockPlanProtocol.PlanProtocol.mockImplementation(() => mockProtocol);

      await factory.createProtocol();

      // 🎬 Act
      const healthStatus = await factory.getHealthStatus();

      // ✅ Assert
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe('healthy');
      expect(mockProtocol.healthCheck).toHaveBeenCalled();
    });
  });

  describe('工厂管理方法测试', () => {
    it('应该正确重置协议实例', async () => {
      // 📋 Arrange
      await factory.createProtocol();
      expect(factory.isInitialized()).toBe(true);

      // 🎬 Act
      factory.reset();

      // ✅ Assert
      expect(factory.isInitialized()).toBe(false);
      expect(factory.getCurrentProtocol()).toBeNull();
    });

    it('应该正确销毁协议实例', async () => {
      // 📋 Arrange
      await factory.createProtocol();
      expect(factory.isInitialized()).toBe(true);

      // 🎬 Act
      await factory.destroy();

      // ✅ Assert
      expect(factory.getCurrentProtocol()).toBeNull();
    });

    it('应该检查协议初始化状态', async () => {
      // 📋 Arrange
      expect(factory.isInitialized()).toBe(false);

      // 🎬 Act
      await factory.createProtocol();

      // ✅ Assert
      expect(factory.isInitialized()).toBe(true);
    });
  });

  describe('静态便捷方法测试', () => {
    it('应该通过静态方法创建协议', async () => {
      // 🎬 Act
      const protocol = await PlanProtocolFactory.create();

      // ✅ Assert
      expect(protocol).toBeDefined();
      expect(protocol).toBeInstanceOf(Object);
    });

    it('应该返回默认配置', () => {
      // 🎬 Act
      const defaultConfig = PlanProtocolFactory.getDefaultConfig();

      // ✅ Assert
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.enableLogging).toBe(true);
      expect(defaultConfig.enableMetrics).toBe(true);
      expect(defaultConfig.enableCaching).toBe(true);
      expect(defaultConfig.repositoryType).toBe('memory');
      expect(defaultConfig.crossCuttingConcerns?.security?.enabled).toBe(true);
      expect(defaultConfig.crossCuttingConcerns?.performance?.enabled).toBe(true);
    });

    it('应该返回开发环境配置', () => {
      // 🎬 Act
      const devConfig = PlanProtocolFactory.getDevelopmentConfig();

      // ✅ Assert
      expect(devConfig).toBeDefined();
      expect(devConfig.enableLogging).toBe(true);
      expect(devConfig.enableMetrics).toBe(false);
      expect(devConfig.enableCaching).toBe(false);
      expect(devConfig.repositoryType).toBe('memory');
      expect(devConfig.crossCuttingConcerns?.security?.enabled).toBe(false);
      expect(devConfig.crossCuttingConcerns?.performance?.enabled).toBe(false);
    });

    it('应该返回生产环境配置', () => {
      // 🎬 Act
      const prodConfig = PlanProtocolFactory.getProductionConfig();

      // ✅ Assert
      expect(prodConfig).toBeDefined();
      expect(prodConfig.enableLogging).toBe(true);
      expect(prodConfig.enableMetrics).toBe(true);
      expect(prodConfig.enableCaching).toBe(true);
      expect(prodConfig.repositoryType).toBe('database');
      expect(prodConfig.crossCuttingConcerns?.security?.enabled).toBe(true);
      expect(prodConfig.crossCuttingConcerns?.performance?.enabled).toBe(true);
    });
  });
});
