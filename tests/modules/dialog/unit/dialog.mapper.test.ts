/**
 * Dialog映射器单元测试
 * 
 * @description Dialog映射器的完整单元测试套件
 * @version 1.0.0
 * @schema 基于 mplp-dialog.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { DialogMapper } from '../../../../src/modules/dialog/api/mappers/dialog.mapper';
import { DialogTestFactory } from '../dialog-test.factory';
import { DialogEntity } from '../../../../src/modules/dialog/domain/entities/dialog.entity';

describe('DialogMapper单元测试', () => {
  describe('Schema到Entity映射', () => {
    it('应该正确将Schema转换为Entity', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      expect(entity).toBeDefined();
      expect(entity.dialogId).toBe(schemaData.dialog_id);
      expect(entity.name).toBe(schemaData.name);
      expect(entity.description).toBe(schemaData.description);
      expect(entity.participants).toEqual(schemaData.participants);
      expect(entity.protocolVersion).toBe(schemaData.protocol_version);
      expect(entity.dialogOperation).toBe(schemaData.dialog_operation);
    });

    it('应该正确映射基础能力', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      expect(entity.capabilities.basic.enabled).toBe(schemaData.capabilities.basic.enabled);
      expect(entity.capabilities.basic.messageHistory).toBe(schemaData.capabilities.basic.message_history);
      expect(entity.capabilities.basic.participantManagement).toBe(schemaData.capabilities.basic.participant_management);
    });

    it('应该正确映射智能控制能力', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      if (schemaData.capabilities.intelligent_control && entity.capabilities.intelligentControl) {
        expect(entity.capabilities.intelligentControl.enabled).toBe(schemaData.capabilities.intelligent_control.enabled);
        expect(entity.capabilities.intelligentControl.adaptiveRounds).toBe(schemaData.capabilities.intelligent_control.adaptive_rounds);
        expect(entity.capabilities.intelligentControl.dynamicStrategy).toBe(schemaData.capabilities.intelligent_control.dynamic_strategy);
        expect(entity.capabilities.intelligentControl.completenessEvaluation).toBe(schemaData.capabilities.intelligent_control.completeness_evaluation);
      }
    });

    it('应该正确映射批判性思维能力', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      if (schemaData.capabilities.critical_thinking && entity.capabilities.criticalThinking) {
        expect(entity.capabilities.criticalThinking.enabled).toBe(schemaData.capabilities.critical_thinking.enabled);
        expect(entity.capabilities.criticalThinking.analysisDepth).toBe(schemaData.capabilities.critical_thinking.analysis_depth);
        expect(entity.capabilities.criticalThinking.questionGeneration).toBe(schemaData.capabilities.critical_thinking.question_generation);
        expect(entity.capabilities.criticalThinking.logicValidation).toBe(schemaData.capabilities.critical_thinking.logic_validation);
      }
    });

    it('应该正确映射知识搜索能力', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      if (schemaData.capabilities.knowledge_search && entity.capabilities.knowledgeSearch) {
        expect(entity.capabilities.knowledgeSearch.enabled).toBe(schemaData.capabilities.knowledge_search.enabled);
        expect(entity.capabilities.knowledgeSearch.realTimeSearch).toBe(schemaData.capabilities.knowledge_search.real_time_search);
        expect(entity.capabilities.knowledgeSearch.knowledgeValidation).toBe(schemaData.capabilities.knowledge_search.knowledge_validation);
        expect(entity.capabilities.knowledgeSearch.sourceVerification).toBe(schemaData.capabilities.knowledge_search.source_verification);
      }
    });

    it('应该正确映射多模态能力', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      if (schemaData.capabilities.multimodal && entity.capabilities.multimodal) {
        expect(entity.capabilities.multimodal.enabled).toBe(schemaData.capabilities.multimodal.enabled);
        expect(entity.capabilities.multimodal.supportedModalities).toEqual(schemaData.capabilities.multimodal.supported_modalities);
        expect(entity.capabilities.multimodal.crossModalTranslation).toBe(schemaData.capabilities.multimodal.cross_modal_translation);
      }
    });

    it('应该正确映射对话策略', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      if (schemaData.strategy && entity.strategy) {
        expect(entity.strategy.type).toBe(schemaData.strategy.type);
        
        if (schemaData.strategy.rounds && entity.strategy.rounds) {
          expect(entity.strategy.rounds.min).toBe(schemaData.strategy.rounds.min);
          expect(entity.strategy.rounds.max).toBe(schemaData.strategy.rounds.max);
          expect(entity.strategy.rounds.target).toBe(schemaData.strategy.rounds.target);
        }

        if (schemaData.strategy.exit_criteria && entity.strategy.exitCriteria) {
          expect(entity.strategy.exitCriteria.completenessThreshold).toBe(schemaData.strategy.exit_criteria.completeness_threshold);
          expect(entity.strategy.exitCriteria.userSatisfactionThreshold).toBe(schemaData.strategy.exit_criteria.user_satisfaction_threshold);
          expect(entity.strategy.exitCriteria.timeLimit).toBe(schemaData.strategy.exit_criteria.time_limit);
        }
      }
    });

    it('应该正确映射对话上下文', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      if (schemaData.context && entity.context) {
        expect(entity.context.sessionId).toBe(schemaData.context.session_id);
        expect(entity.context.contextId).toBe(schemaData.context.context_id);
        expect(entity.context.knowledgeBase).toBe(schemaData.context.knowledge_base);
        expect(entity.context.previousDialogs).toEqual(schemaData.context.previous_dialogs);
      }
    });

    it('应该正确映射时间戳', () => {
      const schemaData = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(schemaData);

      expect(typeof entity.timestamp).toBe('string');
      expect(entity.timestamp).toBe(schemaData.timestamp);
    });
  });

  describe('Entity到Schema映射', () => {
    it('应该正确将Entity转换为Schema', () => {
      const entityData = DialogTestFactory.createDialogEntityData();
      const entity = new DialogEntity(
        entityData.dialogId,
        entityData.name,
        entityData.participants,
        entityData.capabilities,
        entityData.auditTrail,
        entityData.monitoringIntegration,
        entityData.performanceMetrics,
        entityData.versionHistory,
        entityData.searchMetadata,
        entityData.dialogOperation,
        entityData.eventIntegration,
        entityData.protocolVersion,
        entityData.timestamp,
        entityData.description,
        entityData.strategy,
        entityData.context,
        entityData.configuration,
        entityData.metadata,
        entityData.dialogDetails
      );

      const schema = DialogMapper.toSchema(entity);

      expect(schema).toBeDefined();
      expect(schema.dialog_id).toBe(entity.dialogId);
      expect(schema.name).toBe(entity.name);
      expect(schema.description).toBe(entity.description);
      expect(schema.participants).toEqual(entity.participants);
      expect(schema.protocol_version).toBe(entity.protocolVersion);
      expect(schema.dialog_operation).toBe(entity.dialogOperation);
    });

    it('应该正确映射基础能力到Schema', () => {
      const entityData = DialogTestFactory.createDialogEntityData();
      const entity = new DialogEntity(
        entityData.dialogId,
        entityData.name,
        entityData.participants,
        entityData.capabilities,
        entityData.auditTrail,
        entityData.monitoringIntegration,
        entityData.performanceMetrics,
        entityData.versionHistory,
        entityData.searchMetadata,
        entityData.dialogOperation,
        entityData.eventIntegration,
        entityData.protocolVersion,
        entityData.timestamp,
        entityData.description,
        entityData.strategy,
        entityData.context,
        entityData.configuration,
        entityData.metadata,
        entityData.dialogDetails
      );

      const schema = DialogMapper.toSchema(entity);

      expect(schema.capabilities.basic.enabled).toBe(entity.capabilities.basic.enabled);
      expect(schema.capabilities.basic.message_history).toBe(entity.capabilities.basic.messageHistory);
      expect(schema.capabilities.basic.participant_management).toBe(entity.capabilities.basic.participantManagement);
    });

    it('应该正确映射时间戳到Schema', () => {
      const entityData = DialogTestFactory.createDialogEntityData();
      const entity = new DialogEntity(
        entityData.dialogId,
        entityData.name,
        entityData.participants,
        entityData.capabilities,
        entityData.auditTrail,
        entityData.monitoringIntegration,
        entityData.performanceMetrics,
        entityData.versionHistory,
        entityData.searchMetadata,
        entityData.dialogOperation,
        entityData.eventIntegration,
        entityData.protocolVersion,
        entityData.timestamp,
        entityData.description,
        entityData.strategy,
        entityData.context,
        entityData.configuration,
        entityData.metadata,
        entityData.dialogDetails
      );

      const schema = DialogMapper.toSchema(entity);

      expect(schema.timestamp).toBe(entity.timestamp);
    });
  });

  describe('双向映射一致性', () => {
    it('应该保持Schema->Entity->Schema的一致性', () => {
      const originalSchema = DialogTestFactory.createDialogSchemaData();
      const entity = DialogMapper.fromSchema(originalSchema);
      const convertedSchema = DialogMapper.toSchema(entity);

      // 验证关键字段的一致性
      expect(convertedSchema.dialog_id).toBe(originalSchema.dialog_id);
      expect(convertedSchema.name).toBe(originalSchema.name);
      expect(convertedSchema.description).toBe(originalSchema.description);
      expect(convertedSchema.participants).toEqual(originalSchema.participants);
      expect(convertedSchema.protocol_version).toBe(originalSchema.protocol_version);
      expect(convertedSchema.dialog_operation).toBe(originalSchema.dialog_operation);
    });

    it('应该保持Entity->Schema->Entity的一致性', () => {
      const entityData = DialogTestFactory.createDialogEntityData();
      const originalEntity = new DialogEntity(
        entityData.dialogId,
        entityData.name,
        entityData.participants,
        entityData.capabilities,
        entityData.auditTrail,
        entityData.monitoringIntegration,
        entityData.performanceMetrics,
        entityData.versionHistory,
        entityData.searchMetadata,
        entityData.dialogOperation,
        entityData.eventIntegration,
        entityData.protocolVersion,
        entityData.timestamp,
        entityData.description,
        entityData.strategy,
        entityData.context,
        entityData.configuration,
        entityData.metadata,
        entityData.dialogDetails
      );

      const schema = DialogMapper.toSchema(originalEntity);
      const convertedEntity = DialogMapper.fromSchema(schema);

      // 验证关键字段的一致性
      expect(convertedEntity.dialogId).toBe(originalEntity.dialogId);
      expect(convertedEntity.name).toBe(originalEntity.name);
      expect(convertedEntity.description).toBe(originalEntity.description);
      expect(convertedEntity.participants).toEqual(originalEntity.participants);
      expect(convertedEntity.protocolVersion).toBe(originalEntity.protocolVersion);
      expect(convertedEntity.dialogOperation).toBe(originalEntity.dialogOperation);
    });
  });

  describe('Schema验证', () => {
    it('应该验证有效的Schema', () => {
      const validSchema = DialogTestFactory.createDialogSchemaData();
      const validation = DialogMapper.validateSchema(validSchema);

      if (!validation.isValid) {
        console.log('Validation errors:', validation.errors);
      }

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该检测缺少必需字段的Schema', () => {
      const invalidSchema = DialogTestFactory.createDialogSchemaData();
      delete (invalidSchema as any).dialog_id;

      const validation = DialogMapper.validateSchema(invalidSchema);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('dialog_id is required');
    });

    it('应该检测无效的名称长度', () => {
      const invalidSchema = DialogTestFactory.createDialogSchemaData();
      invalidSchema.name = 'A'.repeat(256);

      const validation = DialogMapper.validateSchema(invalidSchema);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('name must be 255 characters or less');
    });

    it('应该检测空的参与者列表', () => {
      const invalidSchema = DialogTestFactory.createDialogSchemaData();
      invalidSchema.participants = [];

      const validation = DialogMapper.validateSchema(invalidSchema);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('at least one participant is required');
    });

    it('应该检测禁用的基础能力', () => {
      const invalidSchema = DialogTestFactory.createDialogSchemaData();
      invalidSchema.capabilities.basic.enabled = false;

      const validation = DialogMapper.validateSchema(invalidSchema);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('basic capabilities must be enabled');
    });
  });

  describe('批量映射', () => {
    it('应该正确批量转换Schema数组到Entity数组', () => {
      const schemas = [
        DialogTestFactory.createDialogSchemaData(),
        DialogTestFactory.createDialogSchemaData(),
        DialogTestFactory.createDialogSchemaData()
      ];

      const entities = DialogMapper.fromSchemaArray(schemas);

      expect(entities).toHaveLength(3);
      entities.forEach((entity, index) => {
        expect(entity.dialogId).toBe(schemas[index].dialog_id);
        expect(entity.name).toBe(schemas[index].name);
      });
    });

    it('应该正确批量转换Entity数组到Schema数组', () => {
      const entityDataArray = [
        DialogTestFactory.createDialogEntityData(),
        DialogTestFactory.createDialogEntityData(),
        DialogTestFactory.createDialogEntityData()
      ];

      const entities = entityDataArray.map(data => new DialogEntity(
        data.dialogId,
        data.name,
        data.participants,
        data.capabilities,
        data.auditTrail,
        data.monitoringIntegration,
        data.performanceMetrics,
        data.versionHistory,
        data.searchMetadata,
        data.dialogOperation,
        data.eventIntegration,
        data.protocolVersion,
        data.timestamp,
        data.description,
        data.strategy,
        data.context,
        data.configuration,
        data.metadata,
        data.dialogDetails
      ));

      const schemas = DialogMapper.toSchemaArray(entities);

      expect(schemas).toHaveLength(3);
      schemas.forEach((schema, index) => {
        expect(schema.dialog_id).toBe(entities[index].dialogId);
        expect(schema.name).toBe(entities[index].name);
      });
    });
  });
});
