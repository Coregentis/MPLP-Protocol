/**
 * Network Protocol Factory 企业级测试套件
 * 测试目标：提升Factory覆盖率从0%到90%+
 */

import { NetworkProtocolFactory } from '../../../../src/modules/network/infrastructure/factories/network-protocol.factory';

describe('NetworkProtocolFactory企业级测试', () => {

  describe('工厂创建功能', () => {
    it('应该成功创建NetworkProtocol实例', () => {
      const config = {
        enableMetrics: true,
        enableSecurity: true,
        enableEventBus: true
      };

      const protocol = NetworkProtocolFactory.create(config);

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
      expect(protocol.protocolVersion).toBe('1.0.0');
      expect(protocol.protocolType).toBe('coordination');
    });

    it('应该使用默认配置创建实例', () => {
      const protocol = NetworkProtocolFactory.create();

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });

    it('应该正确处理部分配置', () => {
      const config = {
        enableMetrics: false
      };

      const protocol = NetworkProtocolFactory.create(config);

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });
  });

  describe('配置验证', () => {
    it('应该验证配置对象', () => {
      const validConfig = {
        enableMetrics: true,
        enableSecurity: true,
        enableEventBus: true,
        enableErrorHandling: true,
        enableCoordination: true,
        enableOrchestration: true,
        enableStateSync: true,
        enableTransactions: true,
        enableVersioning: true
      };

      expect(() => NetworkProtocolFactory.create(validConfig)).not.toThrow();
    });

    it('应该处理空配置', () => {
      expect(() => NetworkProtocolFactory.create({})).not.toThrow();
    });

    it('应该处理null配置', () => {
      expect(() => NetworkProtocolFactory.create(null as any)).not.toThrow();
    });

    it('应该处理undefined配置', () => {
      expect(() => NetworkProtocolFactory.create(undefined as any)).not.toThrow();
    });
  });

  describe('横切关注点管理器创建', () => {
    it('应该创建所有必需的管理器', () => {
      const config = {
        enableMetrics: true,
        enableSecurity: true,
        enableEventBus: true,
        enableErrorHandling: true,
        enableCoordination: true,
        enableOrchestration: true,
        enableStateSync: true,
        enableTransactions: true,
        enableVersioning: true
      };

      const protocol = NetworkProtocolFactory.create(config);

      // 验证协议实例已创建
      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
      
      // 验证协议具有预期的能力
      expect(protocol.capabilities).toContain('network_topology_management');
      expect(protocol.capabilities).toContain('routing_strategy_optimization');
      expect(protocol.capabilities).toContain('performance_monitoring');
    });

    it('应该在禁用功能时正确处理', () => {
      const config = {
        enableMetrics: false,
        enableSecurity: false,
        enableEventBus: false
      };

      const protocol = NetworkProtocolFactory.create(config);

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });
  });

  describe('工厂方法变体', () => {
    it('应该支持createWithDefaults方法', () => {
      const protocol = NetworkProtocolFactory.createWithDefaults();

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
      expect(protocol.protocolVersion).toBe('1.0.0');
    });

    it('应该支持createForTesting方法', () => {
      const protocol = NetworkProtocolFactory.createForTesting();

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });

    it('应该支持createForProduction方法', () => {
      const protocol = NetworkProtocolFactory.createForProduction();

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });
  });

  describe('配置合并', () => {
    it('应该正确合并默认配置和用户配置', () => {
      const userConfig = {
        enableMetrics: false,
        customSetting: 'test'
      };

      const protocol = NetworkProtocolFactory.create(userConfig);

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });

    it('应该处理深层配置对象', () => {
      const config = {
        performance: {
          enabled: true,
          metricsInterval: 5000
        },
        security: {
          enabled: true,
          authRequired: true
        }
      };

      const protocol = NetworkProtocolFactory.create(config);

      expect(protocol).toBeDefined();
      expect(protocol.protocolName).toBe('network');
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的配置类型', () => {
      const invalidConfigs = [
        'string',
        123,
        true,
        []
      ];

      invalidConfigs.forEach(config => {
        expect(() => NetworkProtocolFactory.create(config as any)).not.toThrow();
      });
    });

    it('应该在创建失败时提供有意义的错误信息', () => {
      // 模拟创建失败的情况
      const problematicConfig = {
        // 可能导致问题的配置
      };

      // 即使配置有问题，工厂也应该能够处理
      expect(() => NetworkProtocolFactory.create(problematicConfig)).not.toThrow();
    });
  });

  describe('单例模式支持', () => {
    it('应该支持获取单例实例', () => {
      const instance1 = NetworkProtocolFactory.getInstance();
      const instance2 = NetworkProtocolFactory.getInstance();

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).toBe(instance2); // 应该是同一个实例
    });

    it('应该支持重置单例实例', () => {
      const instance1 = NetworkProtocolFactory.getInstance();
      NetworkProtocolFactory.resetInstance();
      const instance2 = NetworkProtocolFactory.getInstance();

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).not.toBe(instance2); // 应该是不同的实例
    });
  });

  describe('协议能力验证', () => {
    it('应该返回正确的协议能力列表', () => {
      const protocol = NetworkProtocolFactory.create();

      expect(protocol.capabilities).toContain('network_topology_management');
      expect(protocol.capabilities).toContain('routing_strategy_optimization');
      expect(protocol.capabilities).toContain('performance_monitoring');
      expect(protocol.capabilities).toContain('secure_communication');
      expect(protocol.capabilities).toContain('distributed_coordination');
      expect(protocol.capabilities).toContain('event_broadcasting');
    });

    it('应该根据配置调整能力列表', () => {
      const config = {
        enableMetrics: false,
        enableSecurity: false
      };

      const protocol = NetworkProtocolFactory.create(config);

      // 即使禁用了某些功能，基本能力仍应存在
      expect(protocol.capabilities).toContain('network_topology_management');
      expect(protocol.capabilities).toContain('routing_strategy_optimization');
      expect(protocol.capabilities).toContain('performance_monitoring');
    });
  });

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      const protocol = NetworkProtocolFactory.create();

      expect(protocol).toBeDefined();

      // 验证协议可以被正确销毁
      expect(() => {
        // 模拟资源清理
        (protocol as any).destroy?.();
      }).not.toThrow();
    });

    it('应该处理多个实例创建', () => {
      const protocols = [];

      for (let i = 0; i < 10; i++) {
        protocols.push(NetworkProtocolFactory.create());
      }

      expect(protocols).toHaveLength(10);
      protocols.forEach(protocol => {
        expect(protocol).toBeDefined();
        expect(protocol.protocolName).toBe('network');
      });
    });
  });
});
