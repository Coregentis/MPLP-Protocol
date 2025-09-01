/**
 * ExtensionMapper测试
 * 基于实际源代码实现的测试 - 验证双重命名约定映射
 */

import { ExtensionMapper } from '../../../src/modules/extension/api/mappers/extension.mapper';
import { ExtensionEntityData, ExtensionSchema } from '../../../src/modules/extension/types';

describe('ExtensionMapper测试', () => {
  
  // 基于实际源代码的最小测试数据
  const minimalEntityData: ExtensionEntityData = {
    protocolVersion: '1.0.0',
    timestamp: '2024-01-01T00:00:00.000Z',
    extensionId: 'ext-test-001',
    contextId: 'ctx-test-001',
    name: 'test-extension',
    displayName: 'Test Extension',
    description: 'A test extension',
    version: '1.0.0',
    extensionType: 'plugin',
    status: 'active',
    compatibility: {
      mplpVersion: '1.0.0',
      requiredModules: ['context'],
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
      installDate: '2024-01-01T00:00:00.000Z',
      lastUpdate: '2024-01-01T00:00:00.000Z',
      activationCount: 1,
      errorCount: 0,
      performanceMetrics: {
        averageResponseTime: 50,
        throughput: 1000,
        errorRate: 0,
        memoryUsage: 50000000,
        cpuUsage: 25
      },
      healthCheck: {
        endpoint: '/health',
        interval: 30000,
        timeout: 5000,
        retries: 3
      }
    },
    security: {
      sandboxEnabled: true,
      resourceLimits: {
        maxMemory: 104857600,
        maxCpu: 50,
        maxFileSize: 10485760,
        maxNetworkConnections: 10,
        allowedDomains: [],
        blockedDomains: [],
        allowedHosts: [],
        allowedPorts: [80, 443],
        protocols: ['http', 'https']
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
      author: { name: 'Test Author' },
      license: { type: 'MIT' },
      keywords: [],
      category: 'testing',
      screenshots: []
    },
    auditTrail: {
      events: [],
      complianceSettings: {
        retentionPeriod: 90,
        encryptionEnabled: true,
        accessLogging: true,
        dataClassification: 'internal'
      }
    },
    performanceMetrics: {
      activationLatency: 100,
      memoryUsage: 50000000,
      cpuUsage: 25,
      networkRequests: 10,
      errorRate: 0,
      throughput: 1000,
      responseTime: 50,
      healthStatus: 'healthy',
      alerts: []
    },
    monitoringIntegration: {
      providers: [],
      endpoints: []
    },
    versionHistory: {
      versions: [
        {
          version: '1.0.0',
          releaseDate: '2024-01-01',
          changes: ['Initial release'],
          author: 'system',
          approved: true,
          rollbackSupported: true
        }
      ],
      autoVersioning: {
        enabled: false,
        strategy: 'semantic',
        prerelease: false,
        buildMetadata: false
      }
    },
    searchMetadata: {
      tags: ['test'],
      searchableFields: ['name', 'description'],
      indexedAt: '2024-01-01T00:00:00.000Z',
      facets: [
        {
          field: 'category',
          type: 'string',
          boost: 1.0
        }
      ]
    },
    eventIntegration: {
      publishedEvents: ['extension.activated'],
      subscribedEvents: ['context.updated'],
      eventHandlers: {
        'context.updated': 'handleContextUpdate'
      },
      eventBus: {
        provider: 'memory',
        connectionString: 'memory://localhost',
        options: {}
      },
      eventRouting: {
        rules: [
          {
            condition: 'event.type === "context.updated"',
            destination: 'extension.context.handler',
            priority: 1
          }
        ]
      }
    }
  };

  describe('toSchema - TypeScript到Schema转换', () => {
    it('应该正确将ExtensionEntityData转换为ExtensionSchema (双重命名约定)', () => {
      // 🎯 Act - 现在源代码已修复，应该能正常工作
      const schema = ExtensionMapper.toSchema(minimalEntityData);

      // ✅ Assert - 验证双重命名约定映射
      expect(schema.protocol_version).toBe(minimalEntityData.protocolVersion); // camelCase → snake_case
      expect(schema.timestamp).toBe(minimalEntityData.timestamp);
      expect(schema.extension_id).toBe(minimalEntityData.extensionId); // camelCase → snake_case
      expect(schema.context_id).toBe(minimalEntityData.contextId); // camelCase → snake_case
      expect(schema.name).toBe(minimalEntityData.name);
      expect(schema.display_name).toBe(minimalEntityData.displayName); // camelCase → snake_case
      expect(schema.description).toBe(minimalEntityData.description);
      expect(schema.version).toBe(minimalEntityData.version);
      expect(schema.extension_type).toBe(minimalEntityData.extensionType); // camelCase → snake_case
      expect(schema.status).toBe(minimalEntityData.status);

      // 验证复杂对象字段存在
      expect(schema.compatibility).toBeDefined();
      expect(schema.configuration).toBeDefined();
      expect(schema.extension_points).toBeDefined(); // camelCase → snake_case
      expect(schema.api_extensions).toBeDefined(); // camelCase → snake_case
      expect(schema.security).toBeDefined();
    });
  });

  describe('fromSchema - Schema到TypeScript转换', () => {
    it('应该正确将ExtensionSchema转换为ExtensionEntityData (双重命名约定)', () => {
      // 🎯 Arrange - 先创建Schema
      const schema = ExtensionMapper.toSchema(minimalEntityData);

      // 🎯 Act - 转换回EntityData
      const entity = ExtensionMapper.fromSchema(schema);

      // ✅ Assert - 验证双重命名约定反向映射
      expect(entity.protocolVersion).toBe(schema.protocol_version); // snake_case → camelCase
      expect(entity.timestamp).toBe(schema.timestamp);
      expect(entity.extensionId).toBe(schema.extension_id); // snake_case → camelCase
      expect(entity.contextId).toBe(schema.context_id); // snake_case → camelCase
      expect(entity.name).toBe(schema.name);
      expect(entity.displayName).toBe(schema.display_name); // snake_case → camelCase
      expect(entity.description).toBe(schema.description);
      expect(entity.version).toBe(schema.version);
      expect(entity.extensionType).toBe(schema.extension_type); // snake_case → camelCase
      expect(entity.status).toBe(schema.status);
    });
  });

  describe('validateSchema - Schema验证', () => {
    it('应该验证有效的Schema数据', () => {
      // 🎯 Arrange - 创建有效的Schema
      const validSchema = ExtensionMapper.toSchema(minimalEntityData);

      // 🎯 Act & Assert - 应该不抛出异常
      expect(() => ExtensionMapper.validateSchema(validSchema)).not.toThrow();
      const validated = ExtensionMapper.validateSchema(validSchema);
      expect(validated).toBeDefined();
      expect(validated.extension_id).toBe(minimalEntityData.extensionId);
    });

    it('应该拒绝缺少必需字段的Schema数据', () => {
      // 🎯 Arrange
      const invalidSchema = { name: 'test' }; // 缺少必需字段

      // 🎯 Act & Assert
      expect(() => ExtensionMapper.validateSchema(invalidSchema)).toThrow();
    });

    it('应该拒绝完全无效的Schema数据', () => {
      // 🎯 Arrange
      const invalidSchema = null;

      // 🎯 Act & Assert
      expect(() => ExtensionMapper.validateSchema(invalidSchema)).toThrow();
    });
  });

  describe('批量转换方法', () => {
    it('应该正确处理toSchemaArray', () => {
      // 🎯 Arrange
      const entities = [minimalEntityData];

      // 🎯 Act
      const schemas = ExtensionMapper.toSchemaArray(entities);

      // ✅ Assert
      expect(schemas).toHaveLength(1);
      expect(schemas[0].extension_id).toBe(minimalEntityData.extensionId);
    });

    it('应该正确处理fromSchemaArray', () => {
      // 🎯 Arrange
      const schemas = ExtensionMapper.toSchemaArray([minimalEntityData]);

      // 🎯 Act
      const entities = ExtensionMapper.fromSchemaArray(schemas);

      // ✅ Assert
      expect(entities).toHaveLength(1);
      expect(entities[0].extensionId).toBe(minimalEntityData.extensionId);
    });

    it('应该正确处理空数组', () => {
      // 🎯 Act
      const schemas = ExtensionMapper.toSchemaArray([]);
      const entities = ExtensionMapper.fromSchemaArray([]);

      // ✅ Assert
      expect(schemas).toHaveLength(0);
      expect(entities).toHaveLength(0);
    });
  });

  describe('双向映射一致性', () => {
    it('应该保持toSchema和fromSchema的双向一致性', () => {
      // 🎯 Act - 执行双向转换
      const schema = ExtensionMapper.toSchema(minimalEntityData);
      const backToEntity = ExtensionMapper.fromSchema(schema);

      // ✅ Assert - 验证关键字段的一致性
      expect(backToEntity.extensionId).toBe(minimalEntityData.extensionId);
      expect(backToEntity.name).toBe(minimalEntityData.name);
      expect(backToEntity.displayName).toBe(minimalEntityData.displayName);
      expect(backToEntity.version).toBe(minimalEntityData.version);
      expect(backToEntity.status).toBe(minimalEntityData.status);
      expect(backToEntity.extensionType).toBe(minimalEntityData.extensionType);
    });

    it('应该提供所有必需的映射方法', () => {
      // ✅ Assert - 验证所有核心方法存在
      expect(ExtensionMapper.toSchema).toBeDefined();
      expect(ExtensionMapper.fromSchema).toBeDefined();
      expect(ExtensionMapper.validateSchema).toBeDefined();
      expect(ExtensionMapper.toSchemaArray).toBeDefined();
      expect(ExtensionMapper.fromSchemaArray).toBeDefined();

      // 验证方法类型
      expect(typeof ExtensionMapper.toSchema).toBe('function');
      expect(typeof ExtensionMapper.fromSchema).toBe('function');
      expect(typeof ExtensionMapper.validateSchema).toBe('function');
      expect(typeof ExtensionMapper.toSchemaArray).toBe('function');
      expect(typeof ExtensionMapper.fromSchemaArray).toBe('function');
    });
  });
});
