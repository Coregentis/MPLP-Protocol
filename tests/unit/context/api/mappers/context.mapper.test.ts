/**
 * Context Mapper测试 - TDD重构
 * 
 * 测试完整的Schema-TypeScript映射功能
 * 基于mplp-context.json的14个功能域
 */

import { ContextMapper, ContextSchema, ContextEntityData } from '../../../../../src/modules/context/api/mappers/context.mapper';

describe('ContextMapper测试', () => {
  describe('基础字段映射测试', () => {
    it('应该正确映射基础字段 toSchema', () => {
      const entityData: ContextEntityData = {
        contextId: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        description: '测试描述',
        status: 'active',
        lifecycleStage: 'planning',
        protocolVersion: '1.0.0',
        timestamp: new Date('2025-08-14T10:00:00Z'),

        // 必需的复杂对象 - 最小化实现
        sharedState: {
          variables: {},
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        accessControl: {
          owner: { userId: 'user-123', role: 'owner' },
          permissions: []
        },
        configuration: {
          timeoutSettings: { defaultTimeout: 300, maxTimeout: 3600 },
          persistence: { enabled: true, storageBackend: 'database' }
        },
        auditTrail: {
          enabled: true,
          retentionDays: 30,
          auditEvents: []
        },
        monitoringIntegration: {
          enabled: true,
          supportedProviders: ['prometheus'],
          exportFormats: ['prometheus']
        },
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 60
        },
        versionHistory: {
          enabled: true,
          maxVersions: 50,
          versions: []
        },
        searchMetadata: {
          enabled: true,
          indexingStrategy: 'full_text',
          searchableFields: ['context_name'],
          searchIndexes: []
        },
        cachingPolicy: {
          enabled: true,
          cacheStrategy: 'lru',
          cacheLevels: []
        },
        syncConfiguration: {
          enabled: true,
          syncStrategy: 'real_time',
          syncTargets: []
        },
        errorHandling: {
          enabled: true,
          errorPolicies: []
        },
        integrationEndpoints: {
          enabled: true,
          webhooks: [],
          apiEndpoints: []
        },
        eventIntegration: {
          enabled: true,
          publishedEvents: ['context_created'],
          subscribedEvents: ['plan_executed']
        }
      };

      const schema = ContextMapper.toSchema(entityData);

      expect(schema.context_id).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(schema.name).toBe('测试上下文');
      expect(schema.description).toBe('测试描述');
      expect(schema.status).toBe('active');
      expect(schema.lifecycle_stage).toBe('planning');
      expect(schema.protocol_version).toBe('1.0.0');
      expect(schema.timestamp).toBe('2025-08-14T10:00:00.000Z');
    });

    it('应该正确映射基础字段 fromSchema', () => {
      const schema: ContextSchema = {
        context_id: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        description: '测试描述',
        status: 'active',
        lifecycle_stage: 'planning',
        protocol_version: '1.0.0',
        timestamp: '2025-08-14T10:00:00.000Z',

        // 必需的复杂对象 - 最小化实现
        shared_state: {
          variables: {},
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        access_control: {
          owner: { user_id: 'user-123', role: 'owner' },
          permissions: []
        },
        configuration: {
          timeout_settings: { default_timeout: 300, max_timeout: 3600 },
          persistence: { enabled: true, storage_backend: 'database' }
        },
        audit_trail: {
          enabled: true,
          retention_days: 30,
          audit_events: []
        },
        monitoring_integration: {
          enabled: true,
          supported_providers: ['prometheus'],
          export_formats: ['prometheus']
        },
        performance_metrics: {
          enabled: true,
          collection_interval_seconds: 60
        },
        version_history: {
          enabled: true,
          max_versions: 50,
          versions: []
        },
        search_metadata: {
          enabled: true,
          indexing_strategy: 'full_text',
          searchable_fields: ['context_name'],
          search_indexes: []
        },
        caching_policy: {
          enabled: true,
          cache_strategy: 'lru',
          cache_levels: []
        },
        sync_configuration: {
          enabled: true,
          sync_strategy: 'real_time',
          sync_targets: []
        },
        error_handling: {
          enabled: true,
          error_policies: []
        },
        integration_endpoints: {
          enabled: true,
          webhooks: [],
          api_endpoints: []
        },
        event_integration: {
          enabled: true,
          published_events: ['context_created'],
          subscribed_events: ['plan_executed']
        }
      };

      const entityData = ContextMapper.fromSchema(schema);

      expect(entityData.contextId).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(entityData.name).toBe('测试上下文');
      expect(entityData.description).toBe('测试描述');
      expect(entityData.status).toBe('active');
      expect(entityData.lifecycleStage).toBe('planning');
      expect(entityData.protocolVersion).toBe('1.0.0');
      expect(entityData.timestamp).toEqual(new Date('2025-08-14T10:00:00.000Z'));
    });
  });

  describe('共享状态映射测试', () => {
    it.skip('应该正确映射shared_state字段', () => {
      const entityData: ContextEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date('2025-08-14T10:00:00.000Z'),
        contextId: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        status: 'active',
        lifecycleStage: 'planning',
        sharedState: {
          variables: {
            environment: 'development',
            region: 'cn-north-1'
          },
          resources: {
            allocated: {
              memory: {
                type: 'ram',
                amount: 1024,
                unit: 'mb',
                status: 'available'
              }
            },
            requirements: {
              storage: {
                minimum: 5,
                optimal: 10,
                maximum: 20,
                unit: 'gb'
              }
            }
          },
          dependencies: [
            {
              id: '456e7890-e89b-42d3-a456-426614174001',
              type: 'context',
              name: '依赖上下文',
              status: 'resolved'
            }
          ],
          goals: [
            {
              id: '789e0123-e89b-42d3-a456-426614174002',
              name: '测试目标',
              description: '测试目标描述',
              priority: 'high',
              status: 'active',
              successCriteria: [
                {
                  metric: 'completion_rate',
                  operator: 'gte',
                  value: 95,
                  unit: 'percent'
                }
              ]
            }
          ]
        },

        // 添加所有必需的功能域
        accessControl: {
          owner: { userId: 'user-123', role: 'owner' },
          permissions: []
        },
        configuration: {
          timeoutSettings: { defaultTimeout: 300, maxTimeout: 3600 },
          persistence: { enabled: true, storageBackend: 'database' }
        },
        auditTrail: {
          enabled: true,
          retentionDays: 30,
          auditEvents: []
        },
        monitoringIntegration: {
          enabled: true,
          supportedProviders: ['prometheus'],
          exportFormats: ['prometheus']
        },
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 60
        },
        versionHistory: {
          enabled: true,
          maxVersions: 50,
          versions: []
        },
        searchMetadata: {
          enabled: true,
          indexingStrategy: 'full_text',
          searchableFields: ['context_name'],
          searchIndexes: []
        },
        cachingPolicy: {
          enabled: true,
          cacheStrategy: 'lru',
          cacheLevels: []
        },
        syncConfiguration: {
          enabled: true,
          syncStrategy: 'real_time',
          syncTargets: []
        },
        errorHandling: {
          enabled: true,
          errorPolicies: []
        },
        integrationEndpoints: {
          enabled: true,
          webhooks: [],
          apiEndpoints: []
        },
        eventIntegration: {
          enabled: true,
          publishedEvents: ['context_created'],
          subscribedEvents: ['plan_executed']
        }
      };

      const schema = ContextMapper.toSchema(entityData);

      expect(schema.shared_state).toBeDefined();
      expect(schema.shared_state.variables.environment).toBe('development');
      expect(schema.shared_state.resources.allocated.memory.type).toBe('ram');
      expect(schema.shared_state.dependencies[0].type).toBe('context');
      expect(schema.shared_state.goals[0].priority).toBe('high');
    });
  });

  describe('访问控制映射测试', () => {
    it.skip('应该正确映射access_control字段', () => {
      const entityData: ContextEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date('2025-08-14T10:00:00.000Z'),
        contextId: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        status: 'active',
        lifecycleStage: 'planning',

        // 最小化的共享状态
        sharedState: {
          variables: {},
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        },
        accessControl: {
          owner: {
            userId: 'user-123',
            role: 'owner'
          },
          permissions: [
            {
              principal: 'user-456',
              principalType: 'user',
              resource: 'context',
              actions: ['read', 'write'],
              conditions: {}
            }
          ],
          policies: [
            {
              id: 'policy-123',
              name: '安全策略',
              type: 'security',
              rules: [],
              enforcement: 'strict'
            }
          ]
        }
      };

      const schema = ContextMapper.toSchema(entityData as any);

      expect(schema.access_control).toBeDefined();
      expect(schema.access_control.owner.user_id).toBe('user-123');
      expect(schema.access_control.permissions[0].principal_type).toBe('user');
      expect(schema.access_control.policies?.[0]?.enforcement).toBe('strict');
    });
  });

  describe('配置管理映射测试', () => {
    it.skip('应该正确映射configuration字段', () => {
      const entityData: Partial<ContextEntityData> = {
        contextId: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        configuration: {
          timeoutSettings: {
            defaultTimeout: 300,
            maxTimeout: 3600,
            cleanupTimeout: 600
          },
          notificationSettings: {
            enabled: true,
            channels: ['email', 'webhook'],
            events: ['completed', 'failed']
          },
          persistence: {
            enabled: true,
            storageBackend: 'database',
            retentionPolicy: {
              duration: 'P30D',
              maxVersions: 5
            }
          }
        }
      };

      const schema = ContextMapper.toSchema(entityData as any);

      expect(schema.configuration).toBeDefined();
      expect(schema.configuration.timeout_settings.default_timeout).toBe(300);
      expect(schema.configuration.notification_settings?.enabled).toBe(true);
      expect(schema.configuration.persistence.storage_backend).toBe('database');
    });
  });

  describe('Schema验证测试', () => {
    it('应该验证有效的Schema', () => {
      const validSchema: ContextSchema = {
        protocol_version: '1.0.0',
        timestamp: '2025-08-14T10:00:00.000Z',
        context_id: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: {
          variables: {},
          resources: {
            allocated: {},
            requirements: {}
          },
          dependencies: [],
          goals: []
        },
        access_control: {
          owner: {
            user_id: 'user-123',
            role: 'owner'
          },
          permissions: []
        },
        configuration: {
          timeout_settings: {
            default_timeout: 300,
            max_timeout: 3600
          },
          notification_settings: {
            enabled: true
          },
          persistence: {
            enabled: true,
            storage_backend: 'database'
          }
        },
        audit_trail: {
          enabled: true,
          retention_days: 30,
          audit_events: [],
          compliance_settings: {}
        },
        monitoring_integration: {
          enabled: true,
          supported_providers: ['prometheus'],
          integration_endpoints: {},
          context_metrics: {},
          export_formats: ['prometheus']
        },
        performance_metrics: {
          enabled: true,
          collection_interval_seconds: 60,
          metrics: {},
          health_status: {},
          alerting: {}
        },
        version_history: {
          enabled: true,
          max_versions: 50,
          versions: [],
          auto_versioning: {}
        },
        search_metadata: {
          enabled: true,
          indexing_strategy: 'full_text',
          searchable_fields: ['context_name'],
          search_indexes: [],
          context_indexing: {},
          auto_indexing: {}
        },
        caching_policy: {
          enabled: true,
          cache_strategy: 'lru',
          cache_levels: [],
          cache_warming: {}
        },
        sync_configuration: {
          enabled: true,
          sync_strategy: 'real_time',
          sync_targets: [],
          replication: {}
        },
        error_handling: {
          enabled: true,
          error_policies: [],
          circuit_breaker: {},
          recovery_strategy: {}
        },
        integration_endpoints: {
          enabled: true,
          webhooks: [],
          api_endpoints: []
        },
        event_integration: {
          enabled: true,
          event_bus_connection: {},
          published_events: ['context_created'],
          subscribed_events: ['plan_executed'],
          event_routing: {}
        }
      };

      const isValid = ContextMapper.validateSchema(validSchema);
      expect(isValid).toBe(true);
    });

    it('应该拒绝无效的Schema', () => {
      const invalidSchema = {
        // 缺少必需字段
        name: '测试上下文'
      };

      const isValid = ContextMapper.validateSchema(invalidSchema);
      expect(isValid).toBe(false);
    });
  });

  describe('批量转换测试', () => {
    it.skip('应该正确执行批量toSchema转换', () => {
      const entities = [
        { contextId: '1', name: '上下文1' },
        { contextId: '2', name: '上下文2' }
      ];

      const schemas = ContextMapper.toSchemaArray(entities as any);

      expect(schemas).toHaveLength(2);
      expect(schemas[0].context_id).toBe('1');
      expect(schemas[1].context_id).toBe('2');
    });

    it.skip('应该正确执行批量fromSchema转换', () => {
      const schemas = [
        { context_id: '1', name: '上下文1' },
        { context_id: '2', name: '上下文2' }
      ];

      const entities = ContextMapper.fromSchemaArray(schemas as any);

      expect(entities).toHaveLength(2);
      expect(entities[0].contextId).toBe('1');
      expect(entities[1].contextId).toBe('2');
    });
  });
});
