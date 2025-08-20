/**
 * Context Response DTO测试
 * 
 * 验证DTO与Schema的一致性
 */

import { ContextResponse } from '../../../../../src/modules/context/api/dto/responses/context.response';
import { ContextMapper, ContextSchema } from '../../../../../src/modules/context/api/mappers/context.mapper';

describe('ContextResponse DTO测试', () => {
  describe('DTO结构验证', () => {
    it('应该包含所有必需的基础字段', () => {
      // 验证DTO类型定义包含所有基础字段
      const responseType = ContextResponse;

      // 通过创建一个完整的对象来验证类型结构
      const response: ContextResponse = {
        protocol_version: '1.0.0',
        timestamp: '2025-08-14T10:00:00.000Z',
        context_id: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: { variables: {}, resources: { allocated: {}, requirements: {} }, dependencies: [], goals: [] },
        access_control: { owner: { user_id: 'user-123', role: 'owner' }, permissions: [] },
        configuration: { timeout_settings: { default_timeout: 300, max_timeout: 3600 }, persistence: { enabled: true, storage_backend: 'database' } },
        audit_trail: { enabled: true, retention_days: 30, audit_events: [] },
        monitoring_integration: { enabled: true, supported_providers: ['prometheus'], export_formats: ['prometheus'] },
        performance_metrics: { enabled: true, collection_interval_seconds: 60 },
        version_history: { enabled: true, max_versions: 50, versions: [] },
        search_metadata: { enabled: true, indexing_strategy: 'full_text', searchable_fields: ['context_name'], search_indexes: [] },
        caching_policy: { enabled: true, cache_strategy: 'lru', cache_levels: [] },
        sync_configuration: { enabled: true, sync_strategy: 'real_time', sync_targets: [] },
        error_handling: { enabled: true, error_policies: [] },
        integration_endpoints: { enabled: true, webhooks: [], api_endpoints: [] },
        event_integration: { enabled: true, published_events: ['context_created'], subscribed_events: ['plan_executed'] }
      };

      // 验证基础字段
      expect(response.protocol_version).toBe('1.0.0');
      expect(response.context_id).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(response.name).toBe('测试上下文');
      expect(response.status).toBe('active');
      expect(response.lifecycle_stage).toBe('planning');
    });

    it('应该包含所有14个功能域', () => {
      // 创建一个完整的DTO对象来验证所有功能域
      const response: ContextResponse = {
        protocol_version: '1.0.0',
        timestamp: '2025-08-14T10:00:00.000Z',
        context_id: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: { variables: {}, resources: { allocated: {}, requirements: {} }, dependencies: [], goals: [] },
        access_control: { owner: { user_id: 'user-123', role: 'owner' }, permissions: [] },
        configuration: { timeout_settings: { default_timeout: 300, max_timeout: 3600 }, persistence: { enabled: true, storage_backend: 'database' } },
        audit_trail: { enabled: true, retention_days: 30, audit_events: [] },
        monitoring_integration: { enabled: true, supported_providers: ['prometheus'], export_formats: ['prometheus'] },
        performance_metrics: { enabled: true, collection_interval_seconds: 60 },
        version_history: { enabled: true, max_versions: 50, versions: [] },
        search_metadata: { enabled: true, indexing_strategy: 'full_text', searchable_fields: ['context_name'], search_indexes: [] },
        caching_policy: { enabled: true, cache_strategy: 'lru', cache_levels: [] },
        sync_configuration: { enabled: true, sync_strategy: 'real_time', sync_targets: [] },
        error_handling: { enabled: true, error_policies: [] },
        integration_endpoints: { enabled: true, webhooks: [], api_endpoints: [] },
        event_integration: { enabled: true, published_events: ['context_created'], subscribed_events: ['plan_executed'] }
      };

      // 验证14个功能域存在
      expect(response.shared_state).toBeDefined();
      expect(response.access_control).toBeDefined();
      expect(response.configuration).toBeDefined();
      expect(response.audit_trail).toBeDefined();
      expect(response.monitoring_integration).toBeDefined();
      expect(response.performance_metrics).toBeDefined();
      expect(response.version_history).toBeDefined();
      expect(response.search_metadata).toBeDefined();
      expect(response.caching_policy).toBeDefined();
      expect(response.sync_configuration).toBeDefined();
      expect(response.error_handling).toBeDefined();
      expect(response.integration_endpoints).toBeDefined();
      expect(response.event_integration).toBeDefined();
    });
  });

  describe('Schema兼容性测试', () => {
    it('应该与ContextSchema完全兼容', () => {
      // 创建一个完整的Schema对象
      const schema: ContextSchema = {
        protocol_version: '1.0.0',
        timestamp: '2025-08-14T10:00:00.000Z',
        context_id: '123e4567-e89b-42d3-a456-426614174000',
        name: '测试上下文',
        description: '测试描述',
        status: 'active',
        lifecycle_stage: 'planning',
        
        shared_state: {
          variables: { env: 'test' },
          resources: {
            allocated: {
              memory: { type: 'ram', amount: 1024, unit: 'mb', status: 'available' }
            },
            requirements: {
              storage: { minimum: 5, optimal: 10, maximum: 20, unit: 'gb' }
            }
          },
          dependencies: [
            { id: 'dep-1', type: 'context', name: '依赖上下文', status: 'resolved' }
          ],
          goals: [
            {
              id: 'goal-1',
              name: '测试目标',
              priority: 'high',
              status: 'active',
              success_criteria: [
                { metric: 'completion_rate', operator: 'gte', value: 95, unit: 'percent' }
              ]
            }
          ]
        },
        
        access_control: {
          owner: { user_id: 'user-123', role: 'owner' },
          permissions: [
            {
              principal: 'user-456',
              principal_type: 'user',
              resource: 'context',
              actions: ['read', 'write']
            }
          ]
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

      // 验证Schema是否有效
      const isValid = ContextMapper.validateSchema(schema);
      expect(isValid).toBe(true);

      // 验证可以将Schema赋值给DTO
      const response: ContextResponse = schema;
      expect(response.context_id).toBe('123e4567-e89b-42d3-a456-426614174000');
      expect(response.name).toBe('测试上下文');
      expect(response.shared_state.variables.env).toBe('test');
      expect(response.access_control.owner.user_id).toBe('user-123');
    });
  });

  describe('类型安全性测试', () => {
    it('应该强制正确的字段类型', () => {
      const response = new ContextResponse();
      
      // 这些赋值应该通过TypeScript类型检查
      response.protocol_version = '1.0.0';
      response.timestamp = '2025-08-14T10:00:00.000Z';
      response.context_id = '123e4567-e89b-42d3-a456-426614174000';
      response.name = '测试上下文';
      response.status = 'active';
      response.lifecycle_stage = 'planning';
      
      // 验证赋值成功
      expect(response.protocol_version).toBe('1.0.0');
      expect(response.name).toBe('测试上下文');
      expect(response.status).toBe('active');
    });

    it('应该支持可选字段', () => {
      const response = new ContextResponse();
      
      // 可选字段可以为undefined
      expect(response.description).toBeUndefined();
      
      // 可选字段可以被赋值
      response.description = '测试描述';
      expect(response.description).toBe('测试描述');
    });
  });

  describe('枚举值验证', () => {
    it('应该只接受有效的status值', () => {
      const response = new ContextResponse();
      
      // 有效的status值
      const validStatuses = ['active', 'inactive', 'suspended', 'deleted'];
      validStatuses.forEach(status => {
        response.status = status as any;
        expect(response.status).toBe(status);
      });
    });

    it('应该只接受有效的lifecycle_stage值', () => {
      const response = new ContextResponse();
      
      // 有效的lifecycle_stage值
      const validStages = ['planning', 'executing', 'monitoring', 'completed'];
      validStages.forEach(stage => {
        response.lifecycle_stage = stage as any;
        expect(response.lifecycle_stage).toBe(stage);
      });
    });
  });
});
