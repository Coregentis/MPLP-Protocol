/**
 * Extension实体单元测试
 *
 * @description 基于实际接口的ExtensionEntity测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL的测试模式
 */

import { ExtensionEntity } from '../../../src/modules/extension/domain/entities/extension.entity';
import { ExtensionEntityData, ExtensionStatus, ExtensionType } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';

describe('ExtensionEntity测试', () => {

  describe('构造函数和基本属性测试', () => {
    it('应该正确创建Extension实体并设置所有属性', () => {
      // 📋 Arrange - 基于实际ExtensionEntity构造函数
      const extensionData: ExtensionEntityData = {
        extensionId: 'ext-test-001' as UUID,
        contextId: 'ctx-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'Test extension for unit testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        compatibility: {
          mplpVersion: '1.0.0',
          requiredModules: ['context', 'plan'],
          dependencies: [
            {
              name: 'test-dependency',
              version: '1.0.0',
              optional: false,
              reason: 'Required for testing'
            }
          ],
          conflicts: []
        },
        configuration: {
          schema: { type: 'object', properties: {} },
          currentConfig: { enabled: true },
          defaultConfig: { enabled: false },
          validationRules: []
        },
        extensionPoints: [
          {
            id: 'test-hook',
            name: 'Test Hook',
            type: 'hook',
            description: 'Test extension point',
            parameters: [
              {
                name: 'data',
                type: 'object',
                required: true,
                description: 'Test data parameter'
              }
            ],
            returnType: 'boolean',
            async: false,
            executionOrder: 1
          }
        ],
        apiExtensions: [
          {
            endpoint: '/api/test',
            method: 'GET',
            handler: 'testHandler',
            middleware: [],
            authentication: {
              required: false,
              schemes: [],
              permissions: []
            },
            rateLimit: {
              enabled: false,
              requestsPerMinute: 100,
              burstSize: 10,
              keyGenerator: 'ip'
            },
            validation: {
              strictMode: false
            },
            documentation: {
              summary: 'Test API endpoint',
              tags: ['test'],
              examples: []
            }
          }
        ],
        eventSubscriptions: [
          {
            eventPattern: 'test.*',
            handler: 'testEventHandler',
            filterConditions: [],
            deliveryGuarantee: 'at_least_once',
            deadLetterQueue: {
              enabled: false,
              maxRetries: 3,
              retentionPeriod: 86400
            },
            retryPolicy: {
              maxAttempts: 3,
              backoffStrategy: 'exponential',
              initialDelay: 1000,
              maxDelay: 30000,
              retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR']
            },
            batchProcessing: {
              enabled: false,
              batchSize: 10,
              flushInterval: 5000
            }
          }
        ],
        lifecycle: {
          installDate: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          activationCount: 1,
          errorCount: 0,
          performanceMetrics: {
            averageResponseTime: 50,
            throughput: 100,
            errorRate: 0,
            memoryUsage: 1024,
            cpuUsage: 5,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: true,
            interval: 30000,
            timeout: 5000,
            healthyThreshold: 2,
            unhealthyThreshold: 3
          }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: []
          },
          codeSigning: {
            required: false,
            trustedSigners: []
          },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 100 }
          }
        },
        metadata: {
          author: {
            name: 'Test Author'
          },
          license: {
            type: 'MIT'
          },
          keywords: ['test', 'extension'],
          category: 'testing',
          screenshots: []
        },
        auditTrail: {
          events: [],
          complianceSettings: {
            retentionPeriod: 365,
            encryptionRequired: false,
            auditLevel: 'standard'
          }
        },
        performanceMetrics: {
          activationLatency: 100,
          executionTime: 50,
          memoryFootprint: 1024,
          cpuUtilization: 5,
          networkLatency: 10,
          errorRate: 0,
          throughput: 100,
          availability: 99.9,
          efficiencyScore: 95,
          healthStatus: 'healthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: ['prometheus'],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: true,
            channels: ['email'],
            thresholds: {
              errorRate: 5,
              responseTime: 1000,
              availability: 95
            }
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'semantic',
            triggers: ['api_change', 'breaking_change']
          }
        },
        searchMetadata: {
          indexedFields: ['name', 'description', 'keywords'],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'internal',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            defaultRoute: 'default'
          },
          eventTransformation: {
            enabled: false,
            rules: []
          }
        }
      };

      // 🎬 Act - 创建Extension实体
      const extension = new ExtensionEntity(extensionData);

      // ✅ Assert - 验证所有属性正确设置
      expect(extension.extensionId).toBe(extensionData.extensionId);
      expect(extension.contextId).toBe(extensionData.contextId);
      expect(extension.name).toBe(extensionData.name);
      expect(extension.displayName).toBe(extensionData.displayName);
      expect(extension.description).toBe(extensionData.description);
      expect(extension.version).toBe(extensionData.version);
      expect(extension.extensionType).toBe(extensionData.extensionType);
      expect(extension.status).toBe(extensionData.status);
      expect(extension.protocolVersion).toBe(extensionData.protocolVersion);
      expect(extension.compatibility).toEqual(extensionData.compatibility);
      expect(extension.configuration).toEqual(extensionData.configuration);
      expect(extension.extensionPoints).toEqual(extensionData.extensionPoints);
      expect(extension.apiExtensions).toEqual(extensionData.apiExtensions);
      expect(extension.eventSubscriptions).toEqual(extensionData.eventSubscriptions);
      expect(extension.lifecycle).toEqual(extensionData.lifecycle);
      expect(extension.security).toEqual(extensionData.security);
      expect(extension.metadata).toEqual(extensionData.metadata);
    });

    it('应该正确处理最小化的Extension数据', () => {
      // 📋 Arrange - 最小化的Extension数据
      const minimalData: ExtensionEntityData = {
        extensionId: 'ext-minimal-001' as UUID,
        contextId: 'ctx-minimal-001' as UUID,
        name: 'minimal-extension',
        displayName: 'Minimal Extension',
        version: '1.0.0',
        extensionType: 'adapter' as ExtensionType,
        status: 'inactive' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        compatibility: {
          mplpVersion: '1.0.0',
          requiredModules: [],
          dependencies: [],
          conflicts: []
        },
        configuration: {
          schema: {},
          currentConfig: {},
          defaultConfig: {},
          validationRules: []
        },
        extensionPoints: [],
        apiExtensions: [],
        eventSubscriptions: [],
        lifecycle: {
          installDate: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          activationCount: 0,
          errorCount: 0,
          performanceMetrics: {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: false,
            interval: 30000,
            timeout: 5000,
            healthyThreshold: 2,
            unhealthyThreshold: 3
          }
        },
        security: {
          sandboxEnabled: false,
          resourceLimits: {
            maxMemory: 0,
            maxCpu: 0,
            maxFileSize: 0,
            maxNetworkConnections: 0,
            allowedDomains: [],
            blockedDomains: []
          },
          codeSigning: {
            required: false,
            trustedSigners: []
          },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 0 }
          }
        },
        metadata: {
          author: { name: '' },
          license: { type: '' },
          keywords: [],
          category: '',
          screenshots: []
        },
        auditTrail: {
          events: [],
          complianceSettings: {
            retentionPeriod: 0,
            encryptionRequired: false,
            auditLevel: 'none'
          }
        },
        performanceMetrics: {
          activationLatency: 0,
          executionTime: 0,
          memoryFootprint: 0,
          cpuUtilization: 0,
          networkLatency: 0,
          errorRate: 0,
          throughput: 0,
          availability: 0,
          efficiencyScore: 0,
          healthStatus: 'unhealthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: [],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: false,
            channels: [],
            thresholds: {
              errorRate: 0,
              responseTime: 0,
              availability: 0
            }
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'manual',
            triggers: []
          }
        },
        searchMetadata: {
          indexedFields: [],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'none',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            defaultRoute: ''
          },
          eventTransformation: {
            enabled: false,
            rules: []
          }
        }
      };

      // 🎬 Act - 创建最小化Extension实体
      const extension = new ExtensionEntity(minimalData);

      // ✅ Assert - 验证基本属性正确设置
      expect(extension.extensionId).toBe(minimalData.extensionId);
      expect(extension.name).toBe(minimalData.name);
      expect(extension.extensionType).toBe('adapter');
      expect(extension.status).toBe('inactive');
      expect(extension.extensionPoints).toHaveLength(0);
      expect(extension.apiExtensions).toHaveLength(0);
      expect(extension.eventSubscriptions).toHaveLength(0);
    });
  });

  describe('状态管理测试', () => {
    let extension: ExtensionEntity;

    beforeEach(() => {
      const extensionData: ExtensionEntityData = {
        extensionId: 'ext-status-001' as UUID,
        contextId: 'ctx-status-001' as UUID,
        name: 'status-test-extension',
        displayName: 'Status Test Extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'inactive' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        // ... 其他必需属性的最小化版本
        compatibility: { mplpVersion: '1.0.0', requiredModules: [], dependencies: [], conflicts: [] },
        configuration: { schema: {}, currentConfig: {}, defaultConfig: {}, validationRules: [] },
        extensionPoints: [],
        apiExtensions: [],
        eventSubscriptions: [],
        lifecycle: {
          installDate: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          activationCount: 0,
          errorCount: 0,
          performanceMetrics: {
            averageResponseTime: 0, throughput: 0, errorRate: 0, memoryUsage: 0, cpuUsage: 0, lastMeasurement: new Date().toISOString()
          },
          healthCheck: { enabled: false, interval: 30000, timeout: 5000, healthyThreshold: 2, unhealthyThreshold: 3 }
        },
        security: {
          sandboxEnabled: false,
          resourceLimits: { maxMemory: 0, maxCpu: 0, maxFileSize: 0, maxNetworkConnections: 0, allowedDomains: [], blockedDomains: [] },
          codeSigning: { required: false, trustedSigners: [] },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 0 }
          }
        },
        metadata: { author: { name: '' }, license: { type: '' }, keywords: [], category: '', screenshots: [] },
        auditTrail: { events: [], complianceSettings: { retentionPeriod: 0, encryptionRequired: false, auditLevel: 'none' } },
        performanceMetrics: {
          activationLatency: 0, executionTime: 0, memoryFootprint: 0, cpuUtilization: 0, networkLatency: 0,
          errorRate: 0, throughput: 0, availability: 0, efficiencyScore: 0, healthStatus: 'unhealthy', alerts: []
        },
        monitoringIntegration: {
          providers: [], endpoints: [], dashboards: [],
          alerting: { enabled: false, channels: [], thresholds: { errorRate: 0, responseTime: 0, availability: 0 } }
        },
        versionHistory: { versions: [], autoVersioning: { enabled: false, strategy: 'manual', triggers: [] } },
        searchMetadata: { indexedFields: [], searchStrategies: [], facets: [] },
        eventIntegration: {
          eventBus: { provider: 'none', connectionString: '', topics: [] },
          eventRouting: { rules: [], defaultRoute: '' },
          eventTransformation: { enabled: false, rules: [] }
        }
      };

      extension = new ExtensionEntity(extensionData);
    });

    it('应该能够激活扩展', () => {
      // 📋 Arrange - 扩展初始状态为INACTIVE
      expect(extension.status).toBe('inactive');

      // 🎬 Act - 激活扩展
      extension.activate();

      // ✅ Assert - 验证状态变为ACTIVE
      expect(extension.status).toBe('active');
    });

    it('应该能够停用扩展', () => {
      // 📋 Arrange - 先激活扩展
      extension.activate();
      expect(extension.status).toBe('active');

      // 🎬 Act - 停用扩展
      extension.deactivate();

      // ✅ Assert - 验证状态变为INACTIVE
      expect(extension.status).toBe('inactive');
    });

    it('应该能够标记扩展为错误状态', () => {
      // 📋 Arrange - 扩展初始状态
      const initialStatus = extension.status;

      // 🎬 Act - 标记为错误状态
      extension.markAsError();

      // ✅ Assert - 验证状态变为ERROR
      expect(extension.status).toBe('error');
      expect(extension.status).not.toBe(initialStatus);
    });
  });

  describe('验证方法测试', () => {
    it('应该验证扩展配置的有效性', () => {
      // 📋 Arrange - 创建有效配置的扩展
      const validExtensionData: ExtensionEntityData = {
        extensionId: 'ext-valid-001' as UUID,
        contextId: 'ctx-valid-001' as UUID,
        name: 'valid-extension',
        displayName: 'Valid Extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        // ... 其他必需属性
        compatibility: { mplpVersion: '1.0.0', requiredModules: [], dependencies: [], conflicts: [] },
        configuration: { schema: {}, currentConfig: {}, defaultConfig: {}, validationRules: [] },
        extensionPoints: [],
        apiExtensions: [],
        eventSubscriptions: [],
        lifecycle: {
          installDate: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          activationCount: 0,
          errorCount: 0,
          performanceMetrics: {
            averageResponseTime: 0, throughput: 0, errorRate: 0, memoryUsage: 0, cpuUsage: 0, lastMeasurement: new Date().toISOString()
          },
          healthCheck: { enabled: false, interval: 30000, timeout: 5000, healthyThreshold: 2, unhealthyThreshold: 3 }
        },
        security: {
          sandboxEnabled: false,
          resourceLimits: { maxMemory: 0, maxCpu: 0, maxFileSize: 0, maxNetworkConnections: 0, allowedDomains: [], blockedDomains: [] },
          codeSigning: { required: false, trustedSigners: [] },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 0 }
          }
        },
        metadata: { author: { name: '' }, license: { type: '' }, keywords: [], category: '', screenshots: [] },
        auditTrail: { events: [], complianceSettings: { retentionPeriod: 0, encryptionRequired: false, auditLevel: 'none' } },
        performanceMetrics: {
          activationLatency: 0, executionTime: 0, memoryFootprint: 0, cpuUtilization: 0, networkLatency: 0,
          errorRate: 0, throughput: 0, availability: 0, efficiencyScore: 0, healthStatus: 'healthy', alerts: []
        },
        monitoringIntegration: {
          providers: [], endpoints: [], dashboards: [],
          alerting: { enabled: false, channels: [], thresholds: { errorRate: 0, responseTime: 0, availability: 0 } }
        },
        versionHistory: { versions: [], autoVersioning: { enabled: false, strategy: 'manual', triggers: [] } },
        searchMetadata: { indexedFields: [], searchStrategies: [], facets: [] },
        eventIntegration: {
          eventBus: { provider: 'none', connectionString: '', topics: [] },
          eventRouting: { rules: [], defaultRoute: '' },
          eventTransformation: { enabled: false, rules: [] }
        }
      };

      const extension = new ExtensionEntity(validExtensionData);

      // 🎬 Act - 验证扩展
      const isValid = extension.validate();

      // ✅ Assert - 验证结果为true
      expect(isValid).toBe(true);
    });
  });

  describe('性能指标测试', () => {
    it('应该正确更新性能指标', () => {
      // 📋 Arrange - 创建扩展实体
      const extensionData: ExtensionEntityData = {
        extensionId: 'ext-perf-001' as UUID,
        contextId: 'ctx-perf-001' as UUID,
        name: 'performance-extension',
        displayName: 'Performance Extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        // ... 其他必需属性的最小化版本
        compatibility: { mplpVersion: '1.0.0', requiredModules: [], dependencies: [], conflicts: [] },
        configuration: { schema: {}, currentConfig: {}, defaultConfig: {}, validationRules: [] },
        extensionPoints: [],
        apiExtensions: [],
        eventSubscriptions: [],
        lifecycle: {
          installDate: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          activationCount: 0,
          errorCount: 0,
          performanceMetrics: {
            averageResponseTime: 100, throughput: 50, errorRate: 0, memoryUsage: 1024, cpuUsage: 10, lastMeasurement: new Date().toISOString()
          },
          healthCheck: { enabled: true, interval: 30000, timeout: 5000, healthyThreshold: 2, unhealthyThreshold: 3 }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: { maxMemory: 1024, maxCpu: 50, maxFileSize: 1024, maxNetworkConnections: 10, allowedDomains: [], blockedDomains: [] },
          codeSigning: { required: false, trustedSigners: [] },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 100 }
          }
        },
        metadata: { author: { name: 'Test' }, license: { type: 'MIT' }, keywords: ['test'], category: 'test', screenshots: [] },
        auditTrail: { events: [], complianceSettings: { retentionPeriod: 365, encryptionRequired: false, auditLevel: 'standard' } },
        performanceMetrics: {
          activationLatency: 100, executionTime: 50, memoryFootprint: 1024, cpuUtilization: 10, networkLatency: 20,
          errorRate: 0, throughput: 50, availability: 99.9, efficiencyScore: 95, healthStatus: 'healthy', alerts: []
        },
        monitoringIntegration: {
          providers: ['prometheus'], endpoints: [], dashboards: [],
          alerting: { enabled: true, channels: ['email'], thresholds: { errorRate: 5, responseTime: 1000, availability: 95 } }
        },
        versionHistory: { versions: [], autoVersioning: { enabled: false, strategy: 'semantic', triggers: [] } },
        searchMetadata: { indexedFields: ['name'], searchStrategies: [], facets: [] },
        eventIntegration: {
          eventBus: { provider: 'internal', connectionString: '', topics: [] },
          eventRouting: { rules: [], defaultRoute: 'default' },
          eventTransformation: { enabled: false, rules: [] }
        }
      };

      const extension = new ExtensionEntity(extensionData);

      // 🎬 Act - 更新性能指标
      const newMetrics = {
        averageResponseTime: 80,
        throughput: 75,
        errorRate: 0.1,
        memoryUsage: 1200,
        cpuUsage: 15,
        lastMeasurement: new Date().toISOString()
      };
      extension.updatePerformanceMetrics(newMetrics);

      // ✅ Assert - 验证性能指标已更新
      expect(extension.lifecycle.performanceMetrics.averageResponseTime).toBe(80);
      expect(extension.lifecycle.performanceMetrics.throughput).toBe(75);
      expect(extension.lifecycle.performanceMetrics.errorRate).toBe(0.1);
      expect(extension.lifecycle.performanceMetrics.memoryUsage).toBe(1200);
      expect(extension.lifecycle.performanceMetrics.cpuUsage).toBe(15);
    });
  });
});
