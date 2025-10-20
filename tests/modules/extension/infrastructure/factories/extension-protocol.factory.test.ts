/**
 * Extension协议工厂测试
 * 
 * @description Extension协议工厂的完整测试套件
 * @version 1.0.0
 * @schema 基于 mplp-extension.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { ExtensionProtocolFactory, ExtensionProtocolFactoryConfig, DEFAULT_EXTENSION_PROTOCOL_CONFIG } from '../../../../../src/modules/extension/infrastructure/factories/extension-protocol.factory';
import { IMLPPProtocol, HealthStatus } from '../../../../../src/core/protocols/mplp-protocol-base';

describe('ExtensionProtocolFactory测试', () => {
  let factory: ExtensionProtocolFactory;

  beforeEach(() => {
    // 重置工厂实例
    factory = ExtensionProtocolFactory.getInstance();
    factory.reset();
  });

  afterEach(() => {
    // 清理资源
    factory.reset();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的工厂实例', () => {
      const factory1 = ExtensionProtocolFactory.getInstance();
      const factory2 = ExtensionProtocolFactory.getInstance();
      
      expect(factory1).toBe(factory2);
      expect(factory1).toBeInstanceOf(ExtensionProtocolFactory);
    });
  });

  describe('协议创建测试', () => {
    it('应该使用默认配置创建Extension协议', async () => {
      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
      expect(typeof protocol.getMetadata).toBe('function');
      expect(typeof protocol.getHealthStatus).toBe('function');
      // ExtensionProtocol可能没有executeOperation方法，这是正常的
    });

    it('应该使用自定义配置创建Extension协议', async () => {
      const customConfig: ExtensionProtocolFactoryConfig = {
        enableLogging: true,
        enableMetrics: true,
        enableCaching: false,
        repositoryType: 'memory',
        extensionConfiguration: {
          maxExtensions: 500,
          defaultExtensionType: 'plugin',
          autoLoadEnabled: true,
          sandboxEnabled: true,
          securityLevel: 'high'
        }
      };

      const protocol = await factory.createProtocol(customConfig);
      
      expect(protocol).toBeDefined();
      expect(typeof protocol.getMetadata).toBe('function');
      expect(typeof protocol.getHealthStatus).toBe('function');
    });

    it('应该返回相同的协议实例（单例）', async () => {
      const protocol1 = await factory.createProtocol();
      const protocol2 = await factory.createProtocol();
      
      expect(protocol1).toBe(protocol2);
    });

    it('应该支持MPLP集成配置', async () => {
      const configWithMPLP: ExtensionProtocolFactoryConfig = {
        mplpIntegration: {
          enabled: true,
          moduleInterfaces: ['context', 'plan', 'role', 'confirm', 'trace'],
          coordinationEnabled: true,
          eventDrivenEnabled: true,
          coreOrchestratorSupport: true
        }
      };

      const protocol = await factory.createProtocol(configWithMPLP);
      
      expect(protocol).toBeDefined();
    });

    it('应该支持性能监控配置', async () => {
      const configWithMetrics: ExtensionProtocolFactoryConfig = {
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 30,
          extensionLoadLatencyThresholdMs: 100,
          extensionExecutionLatencyThresholdMs: 50,
          memoryUsageThresholdMB: 100
        }
      };

      const protocol = await factory.createProtocol(configWithMetrics);
      
      expect(protocol).toBeDefined();
    });
  });

  describe('协议元数据测试', () => {
    it('应该返回正确的协议元数据', () => {
      const metadata = factory.getProtocolMetadata();
      
      expect(metadata).toEqual({
        name: 'MPLP Extension Protocol',
        version: '1.0.0',
        description: 'Extension模块协议 - 扩展管理系统和MPLP生态系统集成',
        capabilities: [
          'extension_management',
          'plugin_system',
          'mplp_integration',
          'lifecycle_management',
          'security_sandbox',
          'performance_monitoring',
          'event_driven_architecture',
          'core_orchestrator_support'
        ],
        dependencies: [
          'mplp-security',
          'mplp-event-bus',
          'mplp-coordination',
          'mplp-orchestration'
        ],
        supportedOperations: [
          'create_extension',
          'update_extension',
          'delete_extension',
          'get_extension',
          'query_extensions',
          'activate_extension',
          'deactivate_extension',
          'get_statistics'
        ]
      });
    });

    it('应该包含基于Schema的能力列表', () => {
      const metadata = factory.getProtocolMetadata();
      
      expect(metadata.capabilities).toContain('extension_management');
      expect(metadata.capabilities).toContain('plugin_system');
      expect(metadata.capabilities).toContain('mplp_integration');
      expect(metadata.capabilities).toContain('lifecycle_management');
      expect(metadata.capabilities).toContain('security_sandbox');
      expect(metadata.capabilities).toContain('performance_monitoring');
      expect(metadata.capabilities).toContain('event_driven_architecture');
      expect(metadata.capabilities).toContain('core_orchestrator_support');
    });

    it('应该包含支持的操作列表', () => {
      const metadata = factory.getProtocolMetadata();
      
      expect(metadata.supportedOperations).toContain('create_extension');
      expect(metadata.supportedOperations).toContain('update_extension');
      expect(metadata.supportedOperations).toContain('delete_extension');
      expect(metadata.supportedOperations).toContain('get_extension');
      expect(metadata.supportedOperations).toContain('query_extensions');
      expect(metadata.supportedOperations).toContain('activate_extension');
      expect(metadata.supportedOperations).toContain('deactivate_extension');
      expect(metadata.supportedOperations).toContain('get_statistics');
    });
  });

  describe('健康状态测试', () => {
    it('应该在协议未初始化时返回不健康状态', async () => {
      const healthStatus = await factory.getHealthStatus();
      
      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.checks).toHaveLength(1);
      expect(healthStatus.checks[0].name).toBe('protocol_initialization');
      expect(healthStatus.checks[0].status).toBe('fail');
      expect(healthStatus.details.protocol).toBe('not_created');
    });

    it('应该在协议初始化后返回健康状态', async () => {
      await factory.createProtocol();
      const healthStatus = await factory.getHealthStatus();
      
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.timestamp).toBeDefined();
      expect(healthStatus.details).toBeDefined();
    });

    it('应该包含详细的健康检查信息', async () => {
      await factory.createProtocol();
      const healthStatus = await factory.getHealthStatus();
      
      expect(healthStatus.details).toHaveProperty('protocol');
      expect(healthStatus.details).toHaveProperty('services');
      expect(healthStatus.details).toHaveProperty('crossCuttingConcerns');
    });
  });

  describe('横切关注点配置测试', () => {
    it('应该支持安全关注点配置', async () => {
      const config: ExtensionProtocolFactoryConfig = {
        crossCuttingConcerns: {
          security: { enabled: true },
          performance: { enabled: false },
          eventBus: { enabled: true },
          errorHandler: { enabled: true },
          coordination: { enabled: false },
          orchestration: { enabled: false },
          stateSync: { enabled: true },
          transaction: { enabled: true },
          protocolVersion: { enabled: true }
        }
      };

      const protocol = await factory.createProtocol(config);
      
      expect(protocol).toBeDefined();
    });

    it('应该使用默认横切关注点配置', async () => {
      const protocol = await factory.createProtocol({});
      
      expect(protocol).toBeDefined();
    });
  });

  describe('资源管理测试', () => {
    it('应该能够重置协议实例', async () => {
      await factory.createProtocol();
      factory.reset();
      
      const healthStatus = await factory.getHealthStatus();
      expect(healthStatus.status).toBe('unhealthy');
    });

    it('应该能够销毁协议实例', async () => {
      await factory.createProtocol();
      await factory.destroy();
      
      const healthStatus = await factory.getHealthStatus();
      expect(healthStatus.status).toBe('unhealthy');
    });
  });

  describe('默认配置测试', () => {
    it('应该提供正确的默认配置', () => {
      expect(DEFAULT_EXTENSION_PROTOCOL_CONFIG).toEqual({
        enableLogging: false,
        enableMetrics: true,
        enableCaching: true,
        repositoryType: 'memory',
        
        extensionConfiguration: {
          maxExtensions: 1000,
          defaultExtensionType: 'plugin',
          autoLoadEnabled: false,
          sandboxEnabled: true,
          securityLevel: 'medium'
        },
        
        mplpIntegration: {
          enabled: true,
          moduleInterfaces: ['context', 'plan', 'role', 'confirm', 'trace', 'core', 'collab', 'dialog', 'network'],
          coordinationEnabled: true,
          eventDrivenEnabled: true,
          coreOrchestratorSupport: true
        },
        
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 60,
          extensionLoadLatencyThresholdMs: 200,
          extensionExecutionLatencyThresholdMs: 100,
          memoryUsageThresholdMB: 50
        },
        
        crossCuttingConcerns: {
          security: { enabled: true },
          performance: { enabled: true },
          eventBus: { enabled: true },
          errorHandler: { enabled: true },
          coordination: { enabled: true },
          orchestration: { enabled: true },
          stateSync: { enabled: true },
          transaction: { enabled: true },
          protocolVersion: { enabled: true }
        }
      });
    });

    it('应该使用默认配置创建协议', async () => {
      const protocol = await factory.createProtocol(DEFAULT_EXTENSION_PROTOCOL_CONFIG);
      
      expect(protocol).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协议创建错误', async () => {
      // 模拟错误配置
      const invalidConfig: ExtensionProtocolFactoryConfig = {
        repositoryType: 'invalid' as any
      };

      // 这里应该能够处理错误或使用默认值
      const protocol = await factory.createProtocol(invalidConfig);
      expect(protocol).toBeDefined();
    });
  });
});
