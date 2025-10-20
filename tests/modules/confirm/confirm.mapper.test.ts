/**
 * Confirm映射器测试
 * 
 * @description 测试Schema-TypeScript双向映射的正确性和一致性
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmMapper } from '../../../src/modules/confirm/api/mappers/confirm.mapper';
import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import {
  ConfirmSchema,
  ConfirmEntityData
} from '../../../src/modules/confirm/api/mappers/confirm.mapper';
import { UUID } from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData, createMockConfirmSchemaData } from './test-data-factory';

describe('ConfirmMapper测试', () => {
  let mockEntityData: ConfirmEntityData;
  let mockSchemaData: ConfirmSchema;

  beforeEach(() => {
    mockEntityData = createMockConfirmEntityData();
    mockSchemaData = createMockConfirmSchemaData();
  });



  describe('toSchema方法测试', () => {
    it('应该正确将EntityData转换为Schema格式', () => {
      const result = ConfirmMapper.toSchema(mockEntityData);

      expect(result.confirm_id).toBe(mockEntityData.confirmId);
      expect(result.context_id).toBe(mockEntityData.contextId);
      expect(result.confirmation_type).toBe(mockEntityData.confirmationType);
      expect(result.status).toBe(mockEntityData.status);
      expect(result.priority).toBe(mockEntityData.priority);
    });

    it('应该正确转换日期字段', () => {
      const result = ConfirmMapper.toSchema(mockEntityData);

      expect(result.timestamp).toBe('2025-08-26T10:00:00.000Z');
      // requester中没有requested_at字段（基于实际Schema）
    });

    it('应该正确转换嵌套对象的命名约定', () => {
      const result = ConfirmMapper.toSchema(mockEntityData);
      
      expect(result.requester.user_id).toBe(mockEntityData.requester.userId);
      expect(result.requester.request_reason).toBe(mockEntityData.requester.requestReason);
      expect(result.subject.impact_assessment).toBeDefined();
      expect(result.risk_assessment.overall_risk_level).toBe(mockEntityData.riskAssessment.overallRiskLevel);
    });

    it('应该正确处理数组字段', () => {
      const result = ConfirmMapper.toSchema(mockEntityData);

      // 基于实际Schema，audit_trail是对象，不是数组
      expect(result.audit_trail).toBeDefined();
      expect(typeof result.audit_trail).toBe('object');
      expect(result.audit_trail.enabled).toBe(true);
    });
  });

  describe('fromSchema方法测试', () => {
    it('应该正确将Schema格式转换为EntityData', () => {
      const result = ConfirmMapper.fromSchema(mockSchemaData);
      
      expect(result.confirmId).toBe(mockSchemaData.confirm_id);
      expect(result.contextId).toBe(mockSchemaData.context_id);
      expect(result.confirmationType).toBe(mockSchemaData.confirmation_type);
      expect(result.status).toBe(mockSchemaData.status);
      expect(result.priority).toBe(mockSchemaData.priority);
    });

    it('应该正确转换日期字符串为Date对象', () => {
      const result = ConfirmMapper.fromSchema(mockSchemaData);

      // 基于实际Schema，只有timestamp字段
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.toISOString()).toBe('2025-08-26T10:00:00.000Z');
    });

    it('应该正确转换嵌套对象的命名约定', () => {
      const result = ConfirmMapper.fromSchema(mockSchemaData);
      
      expect(result.requester.userId).toBe(mockSchemaData.requester.user_id);
      expect(result.requester.requestReason).toBe(mockSchemaData.requester.request_reason);
      expect(result.riskAssessment.overallRiskLevel).toBe(mockSchemaData.risk_assessment.overall_risk_level);
    });
  });

  describe('双向转换一致性测试', () => {
    it('EntityData -> Schema -> EntityData 应该保持一致', () => {
      const schema = ConfirmMapper.toSchema(mockEntityData);
      const backToEntity = ConfirmMapper.fromSchema(schema);
      
      expect(backToEntity.confirmId).toBe(mockEntityData.confirmId);
      expect(backToEntity.contextId).toBe(mockEntityData.contextId);
      expect(backToEntity.confirmationType).toBe(mockEntityData.confirmationType);
      expect(backToEntity.timestamp.getTime()).toBe(mockEntityData.timestamp.getTime());
    });

    it('Schema -> EntityData -> Schema 应该保持一致', () => {
      const entity = ConfirmMapper.fromSchema(mockSchemaData);
      const backToSchema = ConfirmMapper.toSchema(entity);
      
      expect(backToSchema.confirm_id).toBe(mockSchemaData.confirm_id);
      expect(backToSchema.context_id).toBe(mockSchemaData.context_id);
      expect(backToSchema.confirmation_type).toBe(mockSchemaData.confirmation_type);
      expect(backToSchema.created_at).toBe(mockSchemaData.created_at);
    });
  });

  describe('validateSchema方法测试', () => {
    it('应该验证有效的Schema数据', () => {
      const isValid = ConfirmMapper.validateSchema(mockSchemaData);
      expect(isValid).toBe(true);
    });

    it('应该拒绝无效的Schema数据', () => {
      const invalidSchema = {
        ...mockSchemaData,
        confirm_id: undefined
      };
      const isValid = ConfirmMapper.validateSchema(invalidSchema);
      expect(isValid).toBe(false);
    });

    it('应该拒绝错误类型的数据', () => {
      const isValid = ConfirmMapper.validateSchema('invalid-data');
      expect(isValid).toBe(false);
    });
  });

  describe('批量转换方法测试', () => {
    it('应该正确转换EntityData数组为Schema数组', () => {
      const entityArray = [mockEntityData, mockEntityData];
      const schemaArray = ConfirmMapper.toSchemaArray(entityArray);
      
      expect(Array.isArray(schemaArray)).toBe(true);
      expect(schemaArray).toHaveLength(2);
      expect(schemaArray[0].confirm_id).toBe(mockEntityData.confirmId);
    });

    it('应该正确转换Schema数组为EntityData数组', () => {
      const schemaArray = [mockSchemaData, mockSchemaData];
      const entityArray = ConfirmMapper.fromSchemaArray(schemaArray);
      
      expect(Array.isArray(entityArray)).toBe(true);
      expect(entityArray).toHaveLength(2);
      expect(entityArray[0].confirmId).toBe(mockSchemaData.confirm_id);
    });

    it('应该处理空数组', () => {
      const emptySchemaArray = ConfirmMapper.toSchemaArray([]);
      const emptyEntityArray = ConfirmMapper.fromSchemaArray([]);
      
      expect(emptySchemaArray).toEqual([]);
      expect(emptyEntityArray).toEqual([]);
    });
  });
});
