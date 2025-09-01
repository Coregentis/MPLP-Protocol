/**
 * Extension类型定义单元测试
 *
 * @description 基于实际Extension类型定义的完整测试套件
 * @version 1.0.0
 * @layer 测试层 - 类型定义测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL的类型测试模式
 */

import {
  ExtensionEntityData,
  ExtensionSchema,
  ExtensionType,
  ExtensionStatus,
  ExtensionCompatibility,
  ExtensionCompatibilitySchema,
  ExtensionConfiguration,
  ExtensionConfigurationSchema,
  ExtensionPoint,
  ExtensionPointSchema,
  ApiExtension,
  ApiExtensionSchema,
  EventSubscription,
  EventSubscriptionSchema,
  ExtensionLifecycle,
  ExtensionLifecycleSchema,
  ExtensionSecurity,
  ExtensionSecuritySchema,
  ExtensionMetadata,
  ExtensionMetadataSchema,
  CreateExtensionRequest,
  UpdateExtensionRequest,
  AuditTrail,
  AuditTrailSchema,
  ExtensionPerformanceMetrics,
  ExtensionPerformanceMetricsSchema,
  MonitoringIntegration,
  MonitoringIntegrationSchema,
  VersionHistory,
  VersionHistorySchema,
  SearchMetadata,
  SearchMetadataSchema,
  EventIntegration,
  EventIntegrationSchema
} from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';
import { createMockExtensionEntityData, generateTestUUID } from './test-data-factory';

describe('Extension类型定义测试', () => {

  describe('ExtensionType枚举测试', () => {
    it('应该包含所有预期的扩展类型', () => {
      // ✅ Assert - 验证扩展类型枚举值
      const expectedTypes: ExtensionType[] = [
        'plugin',
        'adapter',
        'connector',
        'middleware',
        'hook',
        'transformer'
      ];

      expectedTypes.forEach(type => {
        // 验证类型值是字符串
        expect(typeof type).toBe('string');
        
        // 验证类型值在预期范围内
        expect(['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer']).toContain(type);
      });
    });

    it('应该支持类型安全的扩展类型赋值', () => {
      // 📋 Arrange & Act - 类型安全赋值
      const pluginType: ExtensionType = 'plugin';
      const adapterType: ExtensionType = 'adapter';
      const connectorType: ExtensionType = 'connector';
      const middlewareType: ExtensionType = 'middleware';
      const hookType: ExtensionType = 'hook';
      const transformerType: ExtensionType = 'transformer';

      // ✅ Assert - 验证类型赋值
      expect(pluginType).toBe('plugin');
      expect(adapterType).toBe('adapter');
      expect(connectorType).toBe('connector');
      expect(middlewareType).toBe('middleware');
      expect(hookType).toBe('hook');
      expect(transformerType).toBe('transformer');
    });
  });

  describe('ExtensionStatus枚举测试', () => {
    it('应该包含所有预期的扩展状态', () => {
      // ✅ Assert - 验证扩展状态枚举值
      const expectedStatuses: ExtensionStatus[] = [
        'installed',
        'active',
        'inactive',
        'disabled',
        'error',
        'updating',
        'uninstalling'
      ];

      expectedStatuses.forEach(status => {
        // 验证状态值是字符串
        expect(typeof status).toBe('string');
        
        // 验证状态值在预期范围内
        expect(['installed', 'active', 'inactive', 'disabled', 'error', 'updating', 'uninstalling']).toContain(status);
      });
    });

    it('应该支持状态转换逻辑验证', () => {
      // 📋 Arrange - 状态转换测试
      const validTransitions: Record<ExtensionStatus, ExtensionStatus[]> = {
        'installed': ['active', 'inactive', 'disabled', 'uninstalling'],
        'active': ['inactive', 'disabled', 'updating', 'error', 'uninstalling'],
        'inactive': ['active', 'disabled', 'uninstalling'],
        'disabled': ['active', 'inactive', 'uninstalling'],
        'error': ['active', 'inactive', 'disabled', 'uninstalling'],
        'updating': ['active', 'inactive', 'error'],
        'uninstalling': ['installed'] // 如果回滚
      };

      // ✅ Assert - 验证状态转换定义
      Object.keys(validTransitions).forEach(fromStatus => {
        const transitions = validTransitions[fromStatus as ExtensionStatus];
        expect(Array.isArray(transitions)).toBe(true);
        expect(transitions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ExtensionEntityData接口测试', () => {
    it('应该正确定义ExtensionEntityData的必需字段', () => {
      // 📋 Arrange - 创建ExtensionEntityData实例
      const extensionData: ExtensionEntityData = createMockExtensionEntityData({
        extensionId: generateTestUUID('ext'),
        contextId: generateTestUUID('ctx'),
        name: 'type-test-extension',
        displayName: 'Type Test Extension',
        description: 'Extension for type definition testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString()
      });

      // ✅ Assert - 验证必需字段类型和值
      expect(typeof extensionData.extensionId).toBe('string');
      expect(typeof extensionData.contextId).toBe('string');
      expect(typeof extensionData.name).toBe('string');
      expect(typeof extensionData.displayName).toBe('string');
      expect(typeof extensionData.description).toBe('string');
      expect(typeof extensionData.version).toBe('string');
      expect(typeof extensionData.extensionType).toBe('string');
      expect(typeof extensionData.status).toBe('string');
      expect(typeof extensionData.protocolVersion).toBe('string');
      expect(typeof extensionData.timestamp).toBe('string');

      // 验证字段值
      expect(extensionData.name).toBe('type-test-extension');
      expect(extensionData.displayName).toBe('Type Test Extension');
      expect(extensionData.extensionType).toBe('plugin');
      expect(extensionData.status).toBe('active');
      expect(extensionData.protocolVersion).toBe('1.0.0');
    });

    it('应该正确定义ExtensionEntityData的复杂对象字段', () => {
      // 📋 Arrange - 创建包含复杂对象的ExtensionEntityData
      const extensionData: ExtensionEntityData = createMockExtensionEntityData();

      // ✅ Assert - 验证复杂对象字段类型
      expect(typeof extensionData.compatibility).toBe('object');
      expect(typeof extensionData.configuration).toBe('object');
      expect(Array.isArray(extensionData.extensionPoints)).toBe(true);
      expect(Array.isArray(extensionData.apiExtensions)).toBe(true);
      expect(Array.isArray(extensionData.eventSubscriptions)).toBe(true);
      expect(typeof extensionData.lifecycle).toBe('object');
      expect(typeof extensionData.security).toBe('object');
      expect(typeof extensionData.metadata).toBe('object');
      expect(typeof extensionData.auditTrail).toBe('object');
      expect(typeof extensionData.performanceMetrics).toBe('object');
      expect(typeof extensionData.monitoringIntegration).toBe('object');
      expect(typeof extensionData.versionHistory).toBe('object');
      expect(typeof extensionData.searchMetadata).toBe('object');
      expect(typeof extensionData.eventIntegration).toBe('object');

      // 验证嵌套对象结构
      expect(extensionData.compatibility.mplpVersion).toBeDefined();
      expect(Array.isArray(extensionData.compatibility.requiredModules)).toBe(true);
      expect(Array.isArray(extensionData.compatibility.dependencies)).toBe(true);
      expect(Array.isArray(extensionData.compatibility.conflicts)).toBe(true);
    });
  });

  describe('ExtensionSchema接口测试 (双重命名约定)', () => {
    it('应该正确定义ExtensionSchema的snake_case字段', () => {
      // 📋 Arrange - 创建ExtensionSchema实例
      const extensionSchema: ExtensionSchema = {
        protocol_version: '1.0.0', // snake_case
        timestamp: new Date().toISOString(),
        extension_id: generateTestUUID('ext'), // snake_case
        context_id: generateTestUUID('ctx'), // snake_case
        name: 'schema-test-extension',
        display_name: 'Schema Test Extension', // snake_case
        description: 'Extension for schema type testing',
        version: '1.0.0',
        extension_type: 'adapter', // snake_case
        status: 'active',
        compatibility: {
          mplp_version: '1.0.0', // snake_case
          required_modules: ['context'], // snake_case
          dependencies: [],
          conflicts: []
        },
        configuration: {
          schema: { type: 'object' },
          current_config: { enabled: true }, // snake_case
          default_config: { enabled: false }, // snake_case
          validation_rules: [] // snake_case
        },
        extension_points: [], // snake_case
        api_extensions: [], // snake_case
        event_subscriptions: [], // snake_case
        lifecycle: {
          installation: {
            pre_install_hooks: [], // snake_case
            post_install_hooks: [], // snake_case
            rollback_hooks: [] // snake_case
          },
          activation: {
            pre_activation_hooks: [], // snake_case
            post_activation_hooks: [] // snake_case
          },
          deactivation: {
            pre_deactivation_hooks: [], // snake_case
            post_deactivation_hooks: [] // snake_case
          },
          uninstallation: {
            pre_uninstall_hooks: [], // snake_case
            post_uninstall_hooks: [] // snake_case
          }
        },
        security: {
          sandbox_enabled: true, // snake_case
          resource_limits: { // snake_case
            max_memory: 100 * 1024 * 1024, // snake_case
            max_cpu: 50, // snake_case
            max_file_size: 10 * 1024 * 1024, // snake_case
            max_network_connections: 10, // snake_case
            allowed_domains: [], // snake_case
            blocked_domains: [], // snake_case
            allowed_hosts: [], // snake_case
            allowed_ports: [80, 443], // snake_case
            protocols: ['http', 'https']
          },
          code_signing: { // snake_case
            required: false,
            trusted_signers: [] // snake_case
          },
          permissions: {
            file_system: { read: [], write: [], execute: [] }, // snake_case
            network: { allowed_hosts: [], allowed_ports: [], protocols: [] }, // snake_case
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rate_limit: 100 } // snake_case
          }
        },
        metadata: {
          author: { name: 'Schema Test' },
          license: { type: 'MIT' },
          keywords: ['test'],
          category: 'testing',
          screenshots: []
        },
        audit_trail: { // snake_case
          events: [],
          compliance_settings: { // snake_case
            retention_period: 365, // snake_case
            encryption_required: false, // snake_case
            audit_level: 'standard' // snake_case
          }
        },
        performance_metrics: { // snake_case
          activation_latency: 100, // snake_case
          execution_time: 50, // snake_case
          memory_footprint: 1024, // snake_case
          cpu_utilization: 5, // snake_case
          network_latency: 10, // snake_case
          error_rate: 0, // snake_case
          throughput: 100,
          availability: 99.9,
          efficiency_score: 95, // snake_case
          health_status: 'healthy', // snake_case
          alerts: []
        },
        monitoring_integration: { // snake_case
          providers: ['prometheus'],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: true,
            channels: ['email'],
            thresholds: {
              error_rate: 5, // snake_case
              response_time: 1000, // snake_case
              availability: 95
            }
          }
        },
        version_history: { // snake_case
          versions: [],
          auto_versioning: { // snake_case
            enabled: false,
            strategy: 'semantic',
            triggers: ['api_change'] // snake_case
          }
        },
        search_metadata: { // snake_case
          tags: ['test'],
          searchable_fields: ['name', 'description'], // snake_case
          boost_factors: { name: 2.0, description: 1.0 }, // snake_case
          facets: []
        },
        event_integration: { // snake_case
          publishers: [],
          subscribers: [],
          event_routing: { // snake_case
            rules: [],
            default_handler: 'log' // snake_case
          }
        }
      };

      // ✅ Assert - 验证snake_case字段命名
      expect(extensionSchema.protocol_version).toBe('1.0.0');
      expect(extensionSchema.extension_id).toBeDefined();
      expect(extensionSchema.context_id).toBeDefined();
      expect(extensionSchema.display_name).toBe('Schema Test Extension');
      expect(extensionSchema.extension_type).toBe('adapter');
      expect(extensionSchema.extension_points).toBeDefined();
      expect(extensionSchema.api_extensions).toBeDefined();
      expect(extensionSchema.event_subscriptions).toBeDefined();

      // 验证嵌套对象的snake_case命名
      expect(extensionSchema.compatibility.mplp_version).toBe('1.0.0');
      expect(extensionSchema.compatibility.required_modules).toEqual(['context']);
      expect(extensionSchema.configuration.current_config).toEqual({ enabled: true });
      expect(extensionSchema.configuration.default_config).toEqual({ enabled: false });
      expect(extensionSchema.configuration.validation_rules).toEqual([]);
      expect(extensionSchema.security.sandbox_enabled).toBe(true);
      expect(extensionSchema.security.resource_limits.max_memory).toBe(100 * 1024 * 1024);
      expect(extensionSchema.audit_trail.compliance_settings.retention_period).toBe(365);
      expect(extensionSchema.performance_metrics.activation_latency).toBe(100);
    });
  });

  describe('CreateExtensionRequest和UpdateExtensionRequest接口测试', () => {
    it('应该正确定义CreateExtensionRequest接口', () => {
      // 📋 Arrange - 创建CreateExtensionRequest实例
      const createRequest: CreateExtensionRequest = {
        contextId: generateTestUUID('ctx'),
        name: 'create-request-test',
        displayName: 'Create Request Test',
        description: 'Test extension for create request',
        version: '1.0.0',
        extensionType: 'hook' as ExtensionType,
        compatibility: {
          mplpVersion: '1.0.0',
          requiredModules: ['context'],
          dependencies: [],
          conflicts: []
        },
        configuration: {
          schema: { type: 'object' },
          currentConfig: { enabled: true },
          defaultConfig: { enabled: false },
          validationRules: []
        },
        extensionPoints: [],
        apiExtensions: [],
        eventSubscriptions: [],
        lifecycle: {
          installation: {
            preInstallHooks: [],
            postInstallHooks: [],
            rollbackHooks: []
          },
          activation: {
            preActivationHooks: [],
            postActivationHooks: []
          },
          deactivation: {
            preDeactivationHooks: [],
            postDeactivationHooks: []
          },
          uninstallation: {
            preUninstallHooks: [],
            postUninstallHooks: []
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
          author: { name: 'Create Request Test' },
          license: { type: 'MIT' },
          keywords: ['test'],
          category: 'testing',
          screenshots: []
        }
      };

      // ✅ Assert - 验证CreateExtensionRequest字段
      expect(createRequest.contextId).toBeDefined();
      expect(createRequest.name).toBe('create-request-test');
      expect(createRequest.displayName).toBe('Create Request Test');
      expect(createRequest.extensionType).toBe('hook');
      expect(createRequest.compatibility).toBeDefined();
      expect(createRequest.configuration).toBeDefined();
      expect(createRequest.lifecycle).toBeDefined();
      expect(createRequest.security).toBeDefined();
      expect(createRequest.metadata).toBeDefined();
    });

    it('应该正确定义UpdateExtensionRequest接口', () => {
      // 📋 Arrange - 创建UpdateExtensionRequest实例
      const updateRequest: UpdateExtensionRequest = {
        displayName: 'Updated Extension Name',
        description: 'Updated extension description',
        status: 'disabled' as ExtensionStatus,
        configuration: {
          currentConfig: { enabled: false, debug: true }
        }
      };

      // ✅ Assert - 验证UpdateExtensionRequest字段
      expect(updateRequest.displayName).toBe('Updated Extension Name');
      expect(updateRequest.description).toBe('Updated extension description');
      expect(updateRequest.status).toBe('disabled');
      expect(updateRequest.configuration).toBeDefined();
      expect(updateRequest.configuration?.currentConfig).toEqual({ enabled: false, debug: true });
    });
  });
});
