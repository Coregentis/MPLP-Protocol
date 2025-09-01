/**
 * Collab Mapper Unit Tests
 * @description 基于源代码功能的Schema-TypeScript映射测试，验证双重命名约定
 * @version 1.0.0
 */

import { CollabMapper, CollabSchema, CollabEntityData } from '../../../../src/modules/collab/api/mappers/collab.mapper';
import { CollabTestFactory } from '../factories/collab-test.factory';

describe('CollabMapper单元测试', () => {
  describe('toSchema - TypeScript到Schema转换', () => {
    it('应该正确转换基本字段', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // 🎯 Act
      const result = CollabMapper.toSchema(entityData);

      // ✅ Assert - 验证基本协议字段
      expect(result.collaboration_id).toBe(schemaData.collaboration_id);
      expect(result.protocol_version).toBe(schemaData.protocol_version);
      expect(result.context_id).toBe(schemaData.context_id);
      expect(result.plan_id).toBe(schemaData.plan_id);
      expect(result.name).toBe(schemaData.name);
      expect(result.description).toBe(schemaData.description);
      expect(result.mode).toBe(schemaData.mode);
      expect(result.status).toBe(schemaData.status);
    });

    it('应该正确转换参与者数组', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // 🎯 Act
      const result = CollabMapper.toSchema(entityData);

      // ✅ Assert
      expect(result.participants).toBeDefined();
      expect(Array.isArray(result.participants)).toBe(true);
      expect(result.participants.length).toBe(schemaData.participants.length);
      
      // 验证参与者字段映射
      result.participants.forEach((participant, index) => {
        const originalParticipant = schemaData.participants[index];
        expect(participant.participant_id).toBe(originalParticipant.participant_id);
        expect(participant.agent_id).toBe(originalParticipant.agent_id);
        expect(participant.role_id).toBe(originalParticipant.role_id);
        expect(participant.status).toBe(originalParticipant.status);
        expect(participant.capabilities).toEqual(originalParticipant.capabilities);
      });
    });

    it('应该正确转换协调策略', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // 🎯 Act
      const result = CollabMapper.toSchema(entityData);

      // ✅ Assert
      expect(result.coordination_strategy).toBeDefined();
      expect(result.coordination_strategy.type).toBe(schemaData.coordination_strategy.type);
      expect(result.coordination_strategy.decision_making).toBe(schemaData.coordination_strategy.decision_making);
      expect(result.coordination_strategy.coordinator_id).toBe(schemaData.coordination_strategy.coordinator_id);
    });

    it('应该正确转换时间戳字段', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // 🎯 Act
      const result = CollabMapper.toSchema(entityData);

      // ✅ Assert
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
      expect(result.created_at).toBeDefined();
      expect(typeof result.created_at).toBe('string');
      
      // 验证时间戳格式
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(() => new Date(result.created_at)).not.toThrow();
    });

    it('应该正确转换横切关注点字段', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // 🎯 Act
      const result = CollabMapper.toSchema(entityData);

      // ✅ Assert - 验证横切关注点
      expect(result.audit_trail).toBeDefined();
      expect(result.monitoring_integration).toBeDefined();
      expect(result.performance_metrics).toBeDefined();
      expect(result.version_history).toBeDefined();
      expect(result.search_metadata).toBeDefined();
      expect(result.collab_operation).toBeDefined();
      expect(result.event_integration).toBeDefined();
    });
  });

  describe('fromSchema - Schema到TypeScript转换', () => {
    it('应该正确转换基本字段', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act
      const result = CollabMapper.fromSchema(schemaData);

      // ✅ Assert - 验证camelCase命名
      expect(result.collaborationId).toBe(schemaData.collaboration_id);
      expect(result.protocolVersion).toBe(schemaData.protocol_version);
      expect(result.contextId).toBe(schemaData.context_id);
      expect(result.planId).toBe(schemaData.plan_id);
      expect(result.name).toBe(schemaData.name);
      expect(result.description).toBe(schemaData.description);
      expect(result.mode).toBe(schemaData.mode);
      expect(result.status).toBe(schemaData.status);
    });

    it('应该正确转换时间戳为Date对象', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act
      const result = CollabMapper.fromSchema(schemaData);

      // ✅ Assert
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      
      // 验证时间戳值正确性
      expect(result.timestamp.toISOString()).toBe(schemaData.timestamp);
      expect(result.createdAt.toISOString()).toBe(schemaData.created_at);
    });

    it('应该正确转换参与者数组', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act
      const result = CollabMapper.fromSchema(schemaData);

      // ✅ Assert
      expect(result.participants).toBeDefined();
      expect(Array.isArray(result.participants)).toBe(true);
      expect(result.participants.length).toBe(schemaData.participants.length);
      
      // 验证参与者字段映射 (camelCase)
      result.participants.forEach((participant, index) => {
        const originalParticipant = schemaData.participants[index];
        expect(participant.participantId).toBe(originalParticipant.participant_id);
        expect(participant.agentId).toBe(originalParticipant.agent_id);
        expect(participant.roleId).toBe(originalParticipant.role_id);
        expect(participant.status).toBe(originalParticipant.status);
        expect(participant.capabilities).toEqual(originalParticipant.capabilities);
      });
    });

    it('应该正确转换协调策略', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act
      const result = CollabMapper.fromSchema(schemaData);

      // ✅ Assert - 验证camelCase命名
      expect(result.coordinationStrategy).toBeDefined();
      expect(result.coordinationStrategy.type).toBe(schemaData.coordination_strategy.type);
      expect(result.coordinationStrategy.decisionMaking).toBe(schemaData.coordination_strategy.decision_making);
      expect(result.coordinationStrategy.coordinatorId).toBe(schemaData.coordination_strategy.coordinator_id);
    });

    it('应该正确转换横切关注点字段', () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act
      const result = CollabMapper.fromSchema(schemaData);

      // ✅ Assert - 验证camelCase命名
      expect(result.auditTrail).toBeDefined();
      expect(result.monitoringIntegration).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.versionHistory).toBeDefined();
      expect(result.searchMetadata).toBeDefined();
      expect(result.collabOperation).toBeDefined();
      expect(result.eventIntegration).toBeDefined();
    });
  });

  describe('双向转换一致性', () => {
    it('应该保持toSchema和fromSchema的双向一致性', () => {
      // 🎯 Arrange
      const originalSchema = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act - 双向转换
      const entityData = CollabMapper.fromSchema(originalSchema);
      const convertedSchema = CollabMapper.toSchema(entityData);

      // ✅ Assert - 验证关键字段一致性
      expect(convertedSchema.collaboration_id).toBe(originalSchema.collaboration_id);
      expect(convertedSchema.name).toBe(originalSchema.name);
      expect(convertedSchema.mode).toBe(originalSchema.mode);
      expect(convertedSchema.participants.length).toBe(originalSchema.participants.length);
      expect(convertedSchema.coordination_strategy.type).toBe(originalSchema.coordination_strategy.type);
    });

    it('应该处理可选字段的双向转换', () => {
      // 🎯 Arrange - 创建包含可选字段的数据
      const schemaWithOptionals = CollabTestFactory.createCollabSchemaData({
        description: 'Test description',
        updated_at: new Date().toISOString(),
        updated_by: 'test-updater'
      });

      // 🎯 Act
      const entityData = CollabMapper.fromSchema(schemaWithOptionals);
      const convertedSchema = CollabMapper.toSchema(entityData);

      // ✅ Assert
      expect(convertedSchema.description).toBe(schemaWithOptionals.description);
      expect(convertedSchema.updated_at).toBe(schemaWithOptionals.updated_at);
      expect(convertedSchema.updated_by).toBe(schemaWithOptionals.updated_by);
    });
  });

  describe('validateSchema', () => {
    it('应该验证有效的Schema', () => {
      // 🎯 Arrange
      const validSchema = CollabTestFactory.createCollabSchemaData();

      // 🎯 Act
      const result = CollabMapper.validateSchema(validSchema);

      // ✅ Assert
      expect(result).toBe(true);
    });

    it('应该拒绝无效的Schema', () => {
      // 🎯 Arrange
      const invalidSchemas = [
        null,
        undefined,
        {},
        { collaboration_id: 'test' }, // 缺少必需字段
        'not an object'
      ];

      // 🎯 Act & Assert
      invalidSchemas.forEach(invalidSchema => {
        const result = CollabMapper.validateSchema(invalidSchema);
        expect(result).toBe(false);
      });
    });

    it('应该验证必需字段存在', () => {
      // 🎯 Arrange
      const baseSchema = CollabTestFactory.createCollabSchemaData();
      const requiredFields = [
        'collaboration_id',
        'protocol_version', 
        'timestamp',
        'context_id',
        'plan_id',
        'name',
        'mode'
      ];

      // 🎯 Act & Assert
      requiredFields.forEach(field => {
        const incompleteSchema = { ...baseSchema };
        delete incompleteSchema[field];
        
        const result = CollabMapper.validateSchema(incompleteSchema);
        expect(result).toBe(false);
      });
    });
  });

  describe('批量转换方法', () => {
    it('应该正确转换Schema数组到Entity数组', () => {
      // 🎯 Arrange
      const schemas = [
        CollabTestFactory.createCollabSchemaData(),
        CollabTestFactory.createCollabSchemaData(),
        CollabTestFactory.createCollabSchemaData()
      ];

      // 🎯 Act
      const result = CollabMapper.fromSchemaArray(schemas);

      // ✅ Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(schemas.length);
      
      result.forEach((entity, index) => {
        expect(entity.collaborationId).toBe(schemas[index].collaboration_id);
        expect(entity.name).toBe(schemas[index].name);
      });
    });

    it('应该正确转换Entity数组到Schema数组', () => {
      // 🎯 Arrange
      const schemas = [
        CollabTestFactory.createCollabSchemaData(),
        CollabTestFactory.createCollabSchemaData(),
        CollabTestFactory.createCollabSchemaData()
      ];
      const entities = CollabMapper.fromSchemaArray(schemas);

      // 🎯 Act
      const result = CollabMapper.toSchemaArray(entities);

      // ✅ Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(entities.length);
      
      result.forEach((schema, index) => {
        expect(schema.collaboration_id).toBe(entities[index].collaborationId);
        expect(schema.name).toBe(entities[index].name);
      });
    });

    it('应该处理空数组', () => {
      // 🎯 Act
      const fromEmptyArray = CollabMapper.fromSchemaArray([]);
      const toEmptyArray = CollabMapper.toSchemaArray([]);

      // ✅ Assert
      expect(fromEmptyArray).toEqual([]);
      expect(toEmptyArray).toEqual([]);
    });
  });
});
