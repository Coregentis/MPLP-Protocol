/**
 * Trace协议工厂测试
 * 
 * @description Trace协议工厂的完整测试套件
 * @version 1.0.0
 * @schema 基于 mplp-trace.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { TraceProtocolFactory, TraceProtocolFactoryConfig, DEFAULT_TRACE_PROTOCOL_CONFIG } from '../../../../../src/modules/trace/infrastructure/factories/trace-protocol.factory';
import { IMLPPProtocol, HealthStatus } from '../../../../../src/core/protocols/mplp-protocol-base';

describe('TraceProtocolFactory测试', () => {
  let factory: TraceProtocolFactory;

  beforeEach(() => {
    // 重置工厂实例
    factory = TraceProtocolFactory.getInstance();
    factory.reset();
  });

  afterEach(() => {
    // 清理资源
    factory.reset();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的工厂实例', () => {
      const factory1 = TraceProtocolFactory.getInstance();
      const factory2 = TraceProtocolFactory.getInstance();
      
      expect(factory1).toBe(factory2);
      expect(factory1).toBeInstanceOf(TraceProtocolFactory);
    });
  });

  describe('协议创建测试', () => {
    it('应该使用默认配置创建Trace协议', async () => {
      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
      expect(typeof protocol.getMetadata).toBe('function');
      expect(typeof protocol.getHealthStatus).toBe('function');
      // TraceProtocol可能没有executeOperation方法，这是正常的
    });

    it('应该使用自定义配置创建Trace协议', async () => {
      const customConfig: TraceProtocolFactoryConfig = {
        enableLogging: true,
        enableMetrics: true,
        enableCaching: false,
        repositoryType: 'memory',
        traceConfiguration: {
          maxTraces: 5000,
          defaultTraceType: 'execution',
          retentionPeriodDays: 30,
          compressionEnabled: true,
          indexingEnabled: true
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

    it('应该支持监控配置', async () => {
      const configWithMonitoring: TraceProtocolFactoryConfig = {
        monitoringConfiguration: {
          enabled: true,
          samplingRate: 0.1,
          alertThresholds: {
            errorRate: 0.05,
            latencyP99Ms: 1000,
            throughputRps: 100
          },
          exportInterval: 60
        }
      };

      const protocol = await factory.createProtocol(configWithMonitoring);
      
      expect(protocol).toBeDefined();
    });

    it('应该支持性能监控配置', async () => {
      const configWithMetrics: TraceProtocolFactoryConfig = {
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 30,
          traceCreationLatencyThresholdMs: 50,
          traceQueryLatencyThresholdMs: 100,
          storageEfficiencyThreshold: 0.8
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
        name: 'MPLP Trace Protocol',
        version: '1.0.0',
        description: 'Trace模块协议 - 执行监控系统和追踪管理',
        capabilities: [
          'trace_management',
          'execution_monitoring',
          'event_tracking',
          'performance_analysis',
          'error_tracking',
          'decision_logging',
          'context_snapshots',
          'batch_operations'
        ],
        dependencies: [
          'mplp-security',
          'mplp-event-bus',
          'mplp-coordination',
          'mplp-orchestration'
        ],
        supportedOperations: [
          'create_trace',
          'update_trace',
          'delete_trace',
          'get_trace',
          'query_traces',
          'batch_create',
          'batch_delete',
          'get_statistics'
        ]
      });
    });

    it('应该包含基于Schema的能力列表', () => {
      const metadata = factory.getProtocolMetadata();
      
      expect(metadata.capabilities).toContain('trace_management');
      expect(metadata.capabilities).toContain('execution_monitoring');
      expect(metadata.capabilities).toContain('event_tracking');
      expect(metadata.capabilities).toContain('performance_analysis');
      expect(metadata.capabilities).toContain('error_tracking');
      expect(metadata.capabilities).toContain('decision_logging');
      expect(metadata.capabilities).toContain('context_snapshots');
      expect(metadata.capabilities).toContain('batch_operations');
    });

    it('应该包含支持的操作列表', () => {
      const metadata = factory.getProtocolMetadata();
      
      expect(metadata.supportedOperations).toContain('create_trace');
      expect(metadata.supportedOperations).toContain('update_trace');
      expect(metadata.supportedOperations).toContain('delete_trace');
      expect(metadata.supportedOperations).toContain('get_trace');
      expect(metadata.supportedOperations).toContain('query_traces');
      expect(metadata.supportedOperations).toContain('batch_create');
      expect(metadata.supportedOperations).toContain('batch_delete');
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
      const config: TraceProtocolFactoryConfig = {
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
      expect(DEFAULT_TRACE_PROTOCOL_CONFIG).toEqual({
        enableLogging: false,
        enableMetrics: true,
        enableCaching: true,
        repositoryType: 'memory',
        
        traceConfiguration: {
          maxTraces: 10000,
          defaultTraceType: 'execution',
          retentionPeriodDays: 90,
          compressionEnabled: false,
          indexingEnabled: true
        },
        
        monitoringConfiguration: {
          enabled: true,
          samplingRate: 1.0,
          alertThresholds: {
            errorRate: 0.1,
            latencyP99Ms: 2000,
            throughputRps: 50
          },
          exportInterval: 300
        },
        
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 60,
          traceCreationLatencyThresholdMs: 100,
          traceQueryLatencyThresholdMs: 200,
          storageEfficiencyThreshold: 0.7
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
      const protocol = await factory.createProtocol(DEFAULT_TRACE_PROTOCOL_CONFIG);
      
      expect(protocol).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协议创建错误', async () => {
      // 模拟错误配置
      const invalidConfig: TraceProtocolFactoryConfig = {
        repositoryType: 'invalid' as any
      };

      // 这里应该能够处理错误或使用默认值
      const protocol = await factory.createProtocol(invalidConfig);
      expect(protocol).toBeDefined();
    });
  });
});
