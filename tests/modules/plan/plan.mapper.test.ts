/**
 * Plan映射器单元测试
 *
 * @description 基于实际接口的PlanMapper测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的测试模式
 */

import { 
  PlanMapper, 
  PlanEntityData, 
  PlanSchema,
  PlanTaskData,
  PlanTaskSchema
} from '../../../src/modules/plan/api/mappers/plan.mapper';

describe('PlanMapper测试', () => {

  describe('toSchema功能测试', () => {
    it('应该正确将PlanEntityData转换为PlanSchema', () => {
      // 📋 Arrange
      const entityData: PlanEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        planId: 'plan-test-123',
        contextId: 'ctx-test-456',
        name: 'Test Plan',
        description: 'Test plan description',
        status: 'active',
        priority: 'high',
        tasks: [
          {
            taskId: 'task-1',
            name: 'Test Task',
            description: 'Test task description',
            type: 'atomic',
            status: 'pending',
            priority: 'medium'
          }
        ],
        dependencies: ['dep-1', 'dep-2'],
        milestones: [
          {
            id: 'milestone-1',
            name: 'Test Milestone',
            targetDate: new Date('2024-06-01T00:00:00.000Z'),
            status: 'upcoming'
          }
        ],
        timeline: {
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-12-31T00:00:00.000Z'),
          estimatedDuration: 365
        },
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T12:00:00.000Z'),
        createdBy: 'user-123',
        updatedBy: 'user-456',
        auditTrail: {
          enabled: true,
          retentionDays: 90
        },
        monitoringIntegration: {
          enabled: true,
          supportedProviders: ['prometheus', 'grafana']
        },
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 60
        },
        versionHistory: {
          enabled: true,
          maxVersions: 10
        },
        searchMetadata: {
          enabled: true,
          indexingStrategy: 'full_text'
        },
        cachingPolicy: {
          enabled: true,
          cacheStrategy: 'lru'
        },
        eventIntegration: {
          enabled: true
        }
      };

      // 🎬 Act
      const schema = PlanMapper.toSchema(entityData);

      // ✅ Assert - 验证snake_case字段名
      expect(schema.protocol_version).toBe('1.0.0');
      expect(schema.timestamp).toBe('2024-01-01T00:00:00.000Z');
      expect(schema.plan_id).toBe('plan-test-123');
      expect(schema.context_id).toBe('ctx-test-456');
      expect(schema.name).toBe('Test Plan');
      expect(schema.description).toBe('Test plan description');
      expect(schema.status).toBe('active');
      expect(schema.priority).toBe('high');
      expect(schema.created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(schema.updated_at).toBe('2024-01-01T12:00:00.000Z');
      expect(schema.created_by).toBe('user-123');
      expect(schema.updated_by).toBe('user-456');
      
      // 验证任务转换
      expect(schema.tasks).toHaveLength(1);
      expect(schema.tasks[0].task_id).toBe('task-1');
      expect(schema.tasks[0].name).toBe('Test Task');
      expect(schema.tasks[0].type).toBe('atomic');
      expect(schema.tasks[0].status).toBe('pending');
      
      // 验证里程碑转换
      expect(schema.milestones).toHaveLength(1);
      expect(schema.milestones[0].id).toBe('milestone-1');
      expect(schema.milestones[0].target_date).toBe('2024-06-01T00:00:00.000Z');
      
      // 验证时间线转换
      expect(schema.timeline?.start_date).toBe('2024-01-01T00:00:00.000Z');
      expect(schema.timeline?.end_date).toBe('2024-12-31T00:00:00.000Z');
      expect(schema.timeline?.estimated_duration).toBe(365);
      
      // 验证横切关注点转换
      expect(schema.audit_trail?.enabled).toBe(true);
      expect(schema.audit_trail?.retention_days).toBe(90);
      expect(schema.monitoring_integration?.enabled).toBe(true);
      expect(schema.performance_metrics?.enabled).toBe(true);
      expect(schema.version_history?.enabled).toBe(true);
      expect(schema.search_metadata?.enabled).toBe(true);
      expect(schema.caching_policy?.enabled).toBe(true);
      expect(schema.event_integration?.enabled).toBe(true);
    });

    it('应该正确处理可选字段', () => {
      // 📋 Arrange - 最小化数据
      const minimalData: PlanEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        planId: 'plan-minimal',
        contextId: 'ctx-minimal',
        name: 'Minimal Plan',
        status: 'draft',
        tasks: [],
        auditTrail: { enabled: false },
        monitoringIntegration: { enabled: false },
        performanceMetrics: { enabled: false },
        versionHistory: { enabled: false },
        searchMetadata: { enabled: false },
        cachingPolicy: { enabled: false },
        eventIntegration: { enabled: false }
      };

      // 🎬 Act
      const schema = PlanMapper.toSchema(minimalData);

      // ✅ Assert
      expect(schema.plan_id).toBe('plan-minimal');
      expect(schema.name).toBe('Minimal Plan');
      expect(schema.description).toBeUndefined();
      expect(schema.priority).toBeUndefined();
      expect(schema.tasks).toHaveLength(0);
      expect(schema.dependencies).toBeUndefined();
      expect(schema.milestones).toBeUndefined();
      expect(schema.timeline).toBeUndefined();
    });
  });

  describe('fromSchema功能测试', () => {
    it('应该正确将PlanSchema转换为PlanEntityData', () => {
      // 📋 Arrange
      const schema: PlanSchema = {
        protocol_version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        plan_id: 'plan-schema-test',
        context_id: 'ctx-schema-test',
        name: 'Schema Test Plan',
        description: 'Plan from schema conversion',
        status: 'approved',
        priority: 'critical',
        tasks: [
          {
            task_id: 'task-schema-1',
            name: 'Schema Task',
            description: 'Task from schema',
            type: 'composite',
            status: 'running',
            priority: 'high'
          }
        ],
        dependencies: ['dep-schema-1'],
        milestones: [
          {
            id: 'milestone-schema-1',
            name: 'Schema Milestone',
            target_date: '2024-07-01T00:00:00.000Z',
            status: 'upcoming'
          }
        ],
        timeline: {
          start_date: '2024-02-01T00:00:00.000Z',
          end_date: '2024-11-30T00:00:00.000Z',
          estimated_duration: 300
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T18:00:00.000Z',
        created_by: 'schema-user-123',
        updated_by: 'schema-user-456',
        audit_trail: {
          enabled: true,
          retention_days: 120
        },
        monitoring_integration: {
          enabled: true,
          supported_providers: ['datadog', 'newrelic']
        },
        performance_metrics: {
          enabled: true,
          collection_interval_seconds: 30
        },
        version_history: {
          enabled: true,
          max_versions: 20
        },
        search_metadata: {
          enabled: true,
          indexing_strategy: 'selective'
        },
        caching_policy: {
          enabled: true,
          cache_strategy: 'fifo'
        },
        event_integration: {
          enabled: true
        }
      };

      // 🎬 Act
      const entityData = PlanMapper.fromSchema(schema);

      // ✅ Assert - 验证camelCase字段名
      expect(entityData.protocolVersion).toBe('1.0.0');
      expect(entityData.timestamp).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(entityData.planId).toBe('plan-schema-test');
      expect(entityData.contextId).toBe('ctx-schema-test');
      expect(entityData.name).toBe('Schema Test Plan');
      expect(entityData.description).toBe('Plan from schema conversion');
      expect(entityData.status).toBe('approved');
      expect(entityData.priority).toBe('critical');
      expect(entityData.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(entityData.updatedAt).toEqual(new Date('2024-01-01T18:00:00.000Z'));
      expect(entityData.createdBy).toBe('schema-user-123');
      expect(entityData.updatedBy).toBe('schema-user-456');
      
      // 验证任务转换
      expect(entityData.tasks).toHaveLength(1);
      expect(entityData.tasks[0].taskId).toBe('task-schema-1');
      expect(entityData.tasks[0].name).toBe('Schema Task');
      expect(entityData.tasks[0].type).toBe('composite');
      expect(entityData.tasks[0].status).toBe('running');
      
      // 验证里程碑转换
      expect(entityData.milestones).toHaveLength(1);
      expect(entityData.milestones![0].id).toBe('milestone-schema-1');
      expect(entityData.milestones![0].targetDate).toEqual(new Date('2024-07-01T00:00:00.000Z'));
      
      // 验证时间线转换
      expect(entityData.timeline?.startDate).toEqual(new Date('2024-02-01T00:00:00.000Z'));
      expect(entityData.timeline?.endDate).toEqual(new Date('2024-11-30T00:00:00.000Z'));
      expect(entityData.timeline?.estimatedDuration).toBe(300);
      
      // 验证横切关注点转换
      expect(entityData.auditTrail.enabled).toBe(true);
      expect(entityData.auditTrail.retentionDays).toBe(120);
      expect(entityData.monitoringIntegration.enabled).toBe(true);
      expect(entityData.performanceMetrics.enabled).toBe(true);
      expect(entityData.versionHistory.enabled).toBe(true);
      expect(entityData.searchMetadata.enabled).toBe(true);
      expect(entityData.cachingPolicy.enabled).toBe(true);
      expect(entityData.eventIntegration.enabled).toBe(true);
    });

    it('应该正确处理空的可选字段', () => {
      // 📋 Arrange - 最小化Schema
      const minimalSchema: PlanSchema = {
        protocol_version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        plan_id: 'plan-minimal-schema',
        context_id: 'ctx-minimal-schema',
        name: 'Minimal Schema Plan',
        status: 'draft',
        tasks: [],
        audit_trail: { enabled: false },
        monitoring_integration: { enabled: false },
        performance_metrics: { enabled: false },
        version_history: { enabled: false },
        search_metadata: { enabled: false },
        caching_policy: { enabled: false },
        event_integration: { enabled: false }
      };

      // 🎬 Act
      const entityData = PlanMapper.fromSchema(minimalSchema);

      // ✅ Assert
      expect(entityData.planId).toBe('plan-minimal-schema');
      expect(entityData.name).toBe('Minimal Schema Plan');
      expect(entityData.description).toBeUndefined();
      expect(entityData.priority).toBeUndefined();
      expect(entityData.tasks).toHaveLength(0);
      expect(entityData.dependencies).toBeUndefined();
      expect(entityData.milestones).toBeUndefined();
      expect(entityData.timeline).toBeUndefined();
    });
  });

  describe('validateSchema功能测试', () => {
    it('应该验证有效的Schema', () => {
      // 📋 Arrange
      const validSchema: PlanSchema = {
        protocol_version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        plan_id: 'plan-valid',
        context_id: 'ctx-valid',
        name: 'Valid Plan',
        status: 'active',
        tasks: [],
        audit_trail: { enabled: true },
        monitoring_integration: { enabled: true },
        performance_metrics: { enabled: true },
        version_history: { enabled: true },
        search_metadata: { enabled: true },
        caching_policy: { enabled: true },
        event_integration: { enabled: true }
      };

      // 🎬 Act
      const isValid = PlanMapper.validateSchema(validSchema);

      // ✅ Assert
      expect(isValid).toBe(true);
    });

    it('应该拒绝无效的Schema', () => {
      // 📋 Arrange - 缺少必需字段
      const invalidSchema = {
        protocol_version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        // 缺少plan_id
        context_id: 'ctx-invalid',
        name: 'Invalid Plan',
        status: 'active'
      };

      // 🎬 Act
      const isValid = PlanMapper.validateSchema(invalidSchema);

      // ✅ Assert
      expect(isValid).toBe(false);
    });

    it('应该拒绝非对象类型', () => {
      // 📋 Arrange
      const nonObjectData = 'not an object';

      // 🎬 Act
      const isValid = PlanMapper.validateSchema(nonObjectData);

      // ✅ Assert
      expect(isValid).toBe(false);
    });

    it('应该拒绝null值', () => {
      // 🎬 Act
      const isValid = PlanMapper.validateSchema(null);

      // ✅ Assert
      expect(isValid).toBe(false);
    });
  });

  describe('批量转换功能测试', () => {
    it('应该正确批量转换为Schema', () => {
      // 📋 Arrange
      const entityDataArray: PlanEntityData[] = [
        {
          protocolVersion: '1.0.0',
          timestamp: new Date('2024-01-01T00:00:00.000Z'),
          planId: 'plan-batch-1',
          contextId: 'ctx-batch-1',
          name: 'Batch Plan 1',
          status: 'active',
          tasks: [],
          auditTrail: { enabled: true },
          monitoringIntegration: { enabled: true },
          performanceMetrics: { enabled: true },
          versionHistory: { enabled: true },
          searchMetadata: { enabled: true },
          cachingPolicy: { enabled: true },
          eventIntegration: { enabled: true }
        },
        {
          protocolVersion: '1.0.0',
          timestamp: new Date('2024-01-02T00:00:00.000Z'),
          planId: 'plan-batch-2',
          contextId: 'ctx-batch-2',
          name: 'Batch Plan 2',
          status: 'draft',
          tasks: [],
          auditTrail: { enabled: true },
          monitoringIntegration: { enabled: true },
          performanceMetrics: { enabled: true },
          versionHistory: { enabled: true },
          searchMetadata: { enabled: true },
          cachingPolicy: { enabled: true },
          eventIntegration: { enabled: true }
        }
      ];

      // 🎬 Act
      const schemaArray = PlanMapper.toSchemaArray(entityDataArray);

      // ✅ Assert
      expect(schemaArray).toHaveLength(2);
      expect(schemaArray[0].plan_id).toBe('plan-batch-1');
      expect(schemaArray[0].name).toBe('Batch Plan 1');
      expect(schemaArray[1].plan_id).toBe('plan-batch-2');
      expect(schemaArray[1].name).toBe('Batch Plan 2');
    });

    it('应该正确批量转换从Schema', () => {
      // 📋 Arrange
      const schemaArray: PlanSchema[] = [
        {
          protocol_version: '1.0.0',
          timestamp: '2024-01-01T00:00:00.000Z',
          plan_id: 'plan-from-batch-1',
          context_id: 'ctx-from-batch-1',
          name: 'From Batch Plan 1',
          status: 'active',
          tasks: [],
          audit_trail: { enabled: true },
          monitoring_integration: { enabled: true },
          performance_metrics: { enabled: true },
          version_history: { enabled: true },
          search_metadata: { enabled: true },
          caching_policy: { enabled: true },
          event_integration: { enabled: true }
        },
        {
          protocol_version: '1.0.0',
          timestamp: '2024-01-02T00:00:00.000Z',
          plan_id: 'plan-from-batch-2',
          context_id: 'ctx-from-batch-2',
          name: 'From Batch Plan 2',
          status: 'completed',
          tasks: [],
          audit_trail: { enabled: true },
          monitoring_integration: { enabled: true },
          performance_metrics: { enabled: true },
          version_history: { enabled: true },
          search_metadata: { enabled: true },
          caching_policy: { enabled: true },
          event_integration: { enabled: true }
        }
      ];

      // 🎬 Act
      const entityDataArray = PlanMapper.fromSchemaArray(schemaArray);

      // ✅ Assert
      expect(entityDataArray).toHaveLength(2);
      expect(entityDataArray[0].planId).toBe('plan-from-batch-1');
      expect(entityDataArray[0].name).toBe('From Batch Plan 1');
      expect(entityDataArray[1].planId).toBe('plan-from-batch-2');
      expect(entityDataArray[1].name).toBe('From Batch Plan 2');
    });

    it('应该处理空数组', () => {
      // 🎬 Act
      const emptySchemaArray = PlanMapper.toSchemaArray([]);
      const emptyEntityArray = PlanMapper.fromSchemaArray([]);

      // ✅ Assert
      expect(emptySchemaArray).toHaveLength(0);
      expect(emptyEntityArray).toHaveLength(0);
    });
  });
});
