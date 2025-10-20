/**
 * Context映射器单元测试
 * 
 * @description 基于实际接口的ContextMapper测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { ContextMapper } from '../../../../src/modules/context/api/mappers/context.mapper';
import { ContextEntityData, ContextSchema } from '../../../../src/modules/context/types';
import { UUID, Timestamp } from '../../../../src/shared/types/index';

describe('ContextMapper测试', () => {
  
  describe('toSchema功能测试', () => {
    it('应该正确将TypeScript实体转换为Schema格式', () => {
      // 📋 Arrange
      const entityData: ContextEntityData = {
        protocolVersion: '1.0.0',
        timestamp: '2025-01-01T00:00:00Z' as Timestamp,
        contextId: 'ctx-test-001' as UUID,
        name: 'Test Context',
        description: 'Test context description',
        status: 'active',
        lifecycleStage: 'planning',
        sharedState: {
          variables: { key1: 'value1', key2: 42 },
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        accessControl: {
          owner: { userId: 'user-001' as UUID, role: 'admin' },
          permissions: []
        },
        configuration: {
          timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
          persistence: { enabled: true, storageBackend: 'memory' }
        },
        auditTrail: {
          enabled: true,
          retentionDays: 90,
          auditEvents: [],
          complianceSettings: { retentionPeriod: '7y', encryptionRequired: true }
        },
        monitoringIntegration: { enabled: true },
        performanceMetrics: { responseTime: 100 },
        versionHistory: { currentVersion: '1.0.0' },
        searchMetadata: { indexed: true },
        cachingPolicy: { enabled: false },
        syncConfiguration: { autoSync: true },
        errorHandling: { retryCount: 3 },
        integrationEndpoints: { webhookUrl: 'https://example.com' },
        eventIntegration: { enabled: true }
      };

      // 🎬 Act
      const result = ContextMapper.toSchema(entityData);

      // ✅ Assert - 验证snake_case字段映射
      expect(result.protocol_version).toBe('1.0.0');
      expect(result.context_id).toBe('ctx-test-001');
      expect(result.lifecycle_stage).toBe('planning');
      expect(result.shared_state).toBeDefined();
      expect(result.access_control).toBeDefined();
      expect(result.audit_trail).toBeDefined();
      expect(result.monitoring_integration).toBeDefined();
      expect(result.performance_metrics).toBeDefined();
      expect(result.version_history).toBeDefined();
      expect(result.search_metadata).toBeDefined();
      expect(result.caching_policy).toBeDefined();
      expect(result.sync_configuration).toBeDefined();
      expect(result.error_handling).toBeDefined();
      expect(result.integration_endpoints).toBeDefined();
      expect(result.event_integration).toBeDefined();
    });

    it('应该正确处理最小化的实体数据', () => {
      // 📋 Arrange
      const minimalData: ContextEntityData = {
        protocolVersion: '1.0.0',
        timestamp: '2025-01-01T00:00:00Z' as Timestamp,
        contextId: 'ctx-minimal-001' as UUID,
        name: 'Minimal Context',
        status: 'active',
        lifecycleStage: 'planning',
        sharedState: {
          variables: {},
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        accessControl: {
          owner: { userId: 'user-001' as UUID, role: 'user' },
          permissions: []
        },
        configuration: {
          timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
          persistence: { enabled: true, storageBackend: 'memory' }
        },
        auditTrail: {
          enabled: false,
          retentionDays: 30,
          auditEvents: [],
          complianceSettings: { retentionPeriod: '1y', encryptionRequired: false }
        },
        monitoringIntegration: {},
        performanceMetrics: {},
        versionHistory: {},
        searchMetadata: {},
        cachingPolicy: {},
        syncConfiguration: {},
        errorHandling: {},
        integrationEndpoints: {},
        eventIntegration: {}
      };

      // 🎬 Act
      const result = ContextMapper.toSchema(minimalData);

      // ✅ Assert
      expect(result.context_id).toBe('ctx-minimal-001');
      expect(result.name).toBe('Minimal Context');
      expect(result.description).toBeUndefined();
    });
  });

  describe('fromSchema功能测试', () => {
    it('应该正确将Schema格式转换为TypeScript实体', () => {
      // 📋 Arrange
      const schemaData: ContextSchema = {
        protocol_version: '1.0.0',
        timestamp: '2025-01-01T00:00:00Z',
        context_id: 'ctx-schema-001',
        name: 'Schema Test Context',
        description: 'Schema test description',
        status: 'active',
        lifecycle_stage: 'executing',
        shared_state: {
          variables: { testKey: 'testValue' },
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        access_control: {
          owner: { user_id: 'user-schema-001', role: 'admin' },
          permissions: []
        },
        configuration: {
          timeout_settings: { default_timeout: 60000, max_timeout: 600000 },
          persistence: { enabled: true, storage_backend: 'database' }
        },
        audit_trail: {
          enabled: true,
          retention_days: 180,
          audit_events: [],
          compliance_settings: { retention_period: '10y', encryption_required: true }
        },
        monitoring_integration: { enabled: true },
        performance_metrics: { avg_response_time: 150 },
        version_history: { current_version: '2.0.0' },
        search_metadata: { last_indexed: '2025-01-01T00:00:00Z' },
        caching_policy: { cache_ttl: 3600 },
        sync_configuration: { sync_interval: 300 },
        error_handling: { max_retries: 5 },
        integration_endpoints: { api_endpoint: 'https://api.example.com' },
        event_integration: { event_bus_enabled: true }
      };

      // 🎬 Act
      const result = ContextMapper.fromSchema(schemaData);

      // ✅ Assert - 验证camelCase字段映射
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.contextId).toBe('ctx-schema-001');
      expect(result.lifecycleStage).toBe('executing');
      expect(result.sharedState).toBeDefined();
      expect(result.accessControl).toBeDefined();
      expect(result.accessControl.owner.userId).toBe('user-schema-001');
      expect(result.configuration).toBeDefined();
      expect(result.auditTrail).toBeDefined();
      expect(result.monitoringIntegration).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.versionHistory).toBeDefined();
      expect(result.searchMetadata).toBeDefined();
      expect(result.cachingPolicy).toBeDefined();
      expect(result.syncConfiguration).toBeDefined();
      expect(result.errorHandling).toBeDefined();
      expect(result.integrationEndpoints).toBeDefined();
      expect(result.eventIntegration).toBeDefined();
    });
  });

  describe('validateSchema功能测试', () => {
    it('应该验证有效的Schema数据', () => {
      // 📋 Arrange - 创建一个最小但完整的有效Schema
      const validSchema = {
        protocol_version: '1.0.0',
        timestamp: '2025-01-01T00:00:00.000Z',
        context_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Valid Context',
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: {
          variables: {},
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        access_control: {
          owner: { user_id: '550e8400-e29b-41d4-a716-446655440001', role: 'user' },
          permissions: []
        },
        configuration: {
          timeout_settings: { default_timeout: 30000, max_timeout: 300000 },
          persistence: { enabled: true, storage_backend: 'memory' }
        },
        audit_trail: {
          enabled: false,
          retention_days: 30,
          audit_events: [],
          compliance_settings: { retention_period: '1y', encryption_required: false }
        },
        monitoring_integration: {},
        performance_metrics: {},
        version_history: {},
        search_metadata: {},
        caching_policy: {},
        sync_configuration: {},
        error_handling: {},
        integration_endpoints: {},
        event_integration: {}
      };

      // 🎬 Act
      const isValid = ContextMapper.validateSchema(validSchema);

      // ✅ Assert
      expect(isValid).toBe(true);
    });

    it('应该拒绝无效的Schema数据', () => {
      // 📋 Arrange
      const invalidSchemas = [
        null,
        undefined,
        'not an object',
        {},
        { protocol_version: 'invalid-version' },
        { context_id: 'invalid-uuid-format' },
        { status: 'invalid-status' },
        { lifecycle_stage: 'invalid-stage' }
      ];

      // 🎬 Act & Assert
      invalidSchemas.forEach(invalidSchema => {
        const isValid = ContextMapper.validateSchema(invalidSchema);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('批量转换功能测试', () => {
    it('应该正确批量转换TypeScript数组为Schema数组', () => {
      // 📋 Arrange
      const entities: ContextEntityData[] = [
        {
          protocolVersion: '1.0.0',
          timestamp: '2025-01-01T00:00:00Z' as Timestamp,
          contextId: 'ctx-batch-001' as UUID,
          name: 'Batch Context 1',
          status: 'active',
          lifecycleStage: 'planning',
          sharedState: { variables: {}, resources: { allocated: {}, requirements: {} }, dependencies: [], goals: [] },
          accessControl: { owner: { userId: 'user-001' as UUID, role: 'user' }, permissions: [] },
          configuration: { timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 }, persistence: { enabled: true, storageBackend: 'memory' } },
          auditTrail: { enabled: false, retentionDays: 30, auditEvents: [], complianceSettings: { retentionPeriod: '1y', encryptionRequired: false } },
          monitoringIntegration: {}, performanceMetrics: {}, versionHistory: {}, searchMetadata: {},
          cachingPolicy: {}, syncConfiguration: {}, errorHandling: {}, integrationEndpoints: {}, eventIntegration: {}
        },
        {
          protocolVersion: '1.0.0',
          timestamp: '2025-01-01T00:00:00Z' as Timestamp,
          contextId: 'ctx-batch-002' as UUID,
          name: 'Batch Context 2',
          status: 'active',
          lifecycleStage: 'planning',
          sharedState: { variables: {}, resources: { allocated: {}, requirements: {} }, dependencies: [], goals: [] },
          accessControl: { owner: { userId: 'user-002' as UUID, role: 'user' }, permissions: [] },
          configuration: { timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 }, persistence: { enabled: true, storageBackend: 'memory' } },
          auditTrail: { enabled: false, retentionDays: 30, auditEvents: [], complianceSettings: { retentionPeriod: '1y', encryptionRequired: false } },
          monitoringIntegration: {}, performanceMetrics: {}, versionHistory: {}, searchMetadata: {},
          cachingPolicy: {}, syncConfiguration: {}, errorHandling: {}, integrationEndpoints: {}, eventIntegration: {}
        }
      ];

      // 🎬 Act
      const result = ContextMapper.toSchemaArray(entities);

      // ✅ Assert
      expect(result).toHaveLength(2);
      expect(result[0].context_id).toBe('ctx-batch-001');
      expect(result[1].context_id).toBe('ctx-batch-002');
    });

    it('应该正确批量转换Schema数组为TypeScript数组', () => {
      // 📋 Arrange
      const schemas: ContextSchema[] = [
        {
          protocol_version: '1.0.0', timestamp: '2025-01-01T00:00:00Z', context_id: 'ctx-schema-batch-001',
          name: 'Schema Batch 1', status: 'active', lifecycle_stage: 'planning',
          shared_state: { variables: {}, resources: { allocated: {}, requirements: {} }, dependencies: [], goals: [] },
          access_control: { owner: { user_id: 'user-001', role: 'user' }, permissions: [] },
          configuration: { timeout_settings: { default_timeout: 30000, max_timeout: 300000 }, persistence: { enabled: true, storage_backend: 'memory' } },
          audit_trail: { enabled: false, retention_days: 30, audit_events: [], compliance_settings: { retention_period: '1y', encryption_required: false } },
          monitoring_integration: {}, performance_metrics: {}, version_history: {}, search_metadata: {},
          caching_policy: {}, sync_configuration: {}, error_handling: {}, integration_endpoints: {}, event_integration: {}
        }
      ];

      // 🎬 Act
      const result = ContextMapper.fromSchemaArray(schemas);

      // ✅ Assert
      expect(result).toHaveLength(1);
      expect(result[0].contextId).toBe('ctx-schema-batch-001');
      expect(result[0].name).toBe('Schema Batch 1');
    });
  });

  describe('双向转换一致性测试', () => {
    it('应该保持双向转换的数据一致性', () => {
      // 📋 Arrange
      const originalEntity: ContextEntityData = {
        protocolVersion: '1.0.0',
        timestamp: '2025-01-01T00:00:00Z' as Timestamp,
        contextId: 'ctx-consistency-001' as UUID,
        name: 'Consistency Test Context',
        description: 'Test for consistency',
        status: 'active',
        lifecycleStage: 'executing',
        sharedState: {
          variables: { testKey: 'testValue', numKey: 123 },
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        accessControl: {
          owner: { userId: 'user-consistency-001' as UUID, role: 'admin' },
          permissions: []
        },
        configuration: {
          timeoutSettings: { defaultTimeout: 45000, maxTimeout: 450000 },
          persistence: { enabled: true, storageBackend: 'database' }
        },
        auditTrail: {
          enabled: true,
          retentionDays: 120,
          auditEvents: [],
          complianceSettings: { retentionPeriod: '5y', encryptionRequired: true }
        },
        monitoringIntegration: { enabled: true },
        performanceMetrics: { responseTime: 200 },
        versionHistory: { currentVersion: '1.5.0' },
        searchMetadata: { indexed: true },
        cachingPolicy: { enabled: true },
        syncConfiguration: { autoSync: false },
        errorHandling: { retryCount: 2 },
        integrationEndpoints: { webhookUrl: 'https://test.example.com' },
        eventIntegration: { enabled: false }
      };

      // 🎬 Act - 双向转换
      const schema = ContextMapper.toSchema(originalEntity);
      const convertedEntity = ContextMapper.fromSchema(schema);

      // ✅ Assert - 验证关键字段的一致性
      expect(convertedEntity.protocolVersion).toBe(originalEntity.protocolVersion);
      expect(convertedEntity.contextId).toBe(originalEntity.contextId);
      expect(convertedEntity.name).toBe(originalEntity.name);
      expect(convertedEntity.description).toBe(originalEntity.description);
      expect(convertedEntity.status).toBe(originalEntity.status);
      expect(convertedEntity.lifecycleStage).toBe(originalEntity.lifecycleStage);
      expect(convertedEntity.accessControl.owner.userId).toBe(originalEntity.accessControl.owner.userId);
      expect(convertedEntity.accessControl.owner.role).toBe(originalEntity.accessControl.owner.role);
    });
  });
});
