/**
 * Core映射器测试
 * 
 * @description 测试Core模块的Schema-TypeScript双向映射
 * @version 1.0.0
 * @layer API层测试 - 映射器
 */

import { CoreMapper } from '../../../../../src/modules/core/api/mappers/core.mapper';
import { CoreEntity, CoreSchema } from '../../../../../src/modules/core/types';
import { createTestCoreEntity, createTestCoreSchema } from '../../helpers/test-factories';

describe('CoreMapper测试', () => {
  describe('toSchema方法测试', () => {
    it('应该正确将CoreEntity转换为CoreSchema', () => {
      const entity = createTestCoreEntity();
      const schema = CoreMapper.toSchema(entity);

      expect(schema.workflow_id).toBe(entity.workflowId);
      expect(schema.orchestrator_id).toBe(entity.orchestratorId);
      expect(schema.core_operation).toBe(entity.coreOperation);
      expect(schema.timestamp).toBe(entity.timestamp);
      expect(schema.protocol_version).toBe(entity.protocolVersion);
    });

    it('应该正确转换工作流配置', () => {
      const entity = createTestCoreEntity();
      const schema = CoreMapper.toSchema(entity);

      expect(schema.workflow_config).toBeDefined();
      expect(schema.workflow_config!.name).toBe(entity.workflowConfig.name);
      expect(schema.workflow_config!.execution_mode).toBe(entity.workflowConfig.executionMode);
      expect(schema.workflow_config!.parallel_execution).toBe(entity.workflowConfig.parallelExecution);
      expect(schema.workflow_config!.timeout_ms).toBe(entity.workflowConfig.timeoutMs);
    });

    it('应该正确转换执行上下文', () => {
      const entity = createTestCoreEntity();
      const schema = CoreMapper.toSchema(entity);

      expect(schema.execution_context).toBeDefined();
      expect(schema.execution_context!.user_id).toBe(entity.executionContext.userId);
      expect(schema.execution_context!.session_id).toBe(entity.executionContext.sessionId);
      expect(schema.execution_context!.request_id).toBe(entity.executionContext.requestId);
      expect(schema.execution_context!.priority).toBe(entity.executionContext.priority);
    });

    it('应该处理可选字段', () => {
      const entity = createTestCoreEntity();
      // 删除可选字段
      delete (entity as any).moduleCoordination;
      delete (entity as any).eventHandling;
      delete (entity as any).coreDetails;

      const schema = CoreMapper.toSchema(entity);

      expect(schema.workflow_id).toBe(entity.workflowId);
      expect(schema.module_coordination).toBeUndefined();
      expect(schema.event_handling).toBeUndefined();
      expect(schema.core_details).toBeUndefined();
    });

    it('应该处理空输入', () => {
      expect(() => CoreMapper.toSchema(null as any)).toThrow('Entity cannot be null or undefined');
      expect(() => CoreMapper.toSchema(undefined as any)).toThrow('Entity cannot be null or undefined');
    });
  });

  describe('fromSchema方法测试', () => {
    it('应该正确将CoreSchema转换为CoreEntity', () => {
      const schema = createTestCoreSchema();
      const entity = CoreMapper.fromSchema(schema);

      expect(entity.workflowId).toBe(schema.workflow_id);
      expect(entity.orchestratorId).toBe(schema.orchestrator_id);
      expect(entity.coreOperation).toBe(schema.core_operation);
      expect(entity.timestamp).toBe(schema.timestamp);
      expect(entity.protocolVersion).toBe(schema.protocol_version);
    });

    it('应该正确转换工作流配置', () => {
      const schema = createTestCoreSchema();
      const entity = CoreMapper.fromSchema(schema);

      expect(entity.workflowConfig).toBeDefined();
      expect(entity.workflowConfig.name).toBe(schema.workflow_config!.name);
      expect(entity.workflowConfig.executionMode).toBe(schema.workflow_config!.execution_mode);
      expect(entity.workflowConfig.parallelExecution).toBe(schema.workflow_config!.parallel_execution);
      expect(entity.workflowConfig.timeoutMs).toBe(schema.workflow_config!.timeout_ms);
    });

    it('应该正确转换执行上下文', () => {
      const schema = createTestCoreSchema();
      const entity = CoreMapper.fromSchema(schema);

      expect(entity.executionContext).toBeDefined();
      expect(entity.executionContext.userId).toBe(schema.execution_context!.user_id);
      expect(entity.executionContext.sessionId).toBe(schema.execution_context!.session_id);
      expect(entity.executionContext.requestId).toBe(schema.execution_context!.request_id);
      expect(entity.executionContext.priority).toBe(schema.execution_context!.priority);
    });

    it('应该处理可选字段', () => {
      const schema = createTestCoreSchema();
      // 删除可选字段
      delete (schema as any).module_coordination;
      delete (schema as any).event_handling;
      delete (schema as any).core_details;

      const entity = CoreMapper.fromSchema(schema);

      expect(entity.workflowId).toBe(schema.workflow_id);
      expect(entity.moduleCoordination).toBeUndefined();
      expect(entity.eventHandling).toBeUndefined();
      expect(entity.coreDetails).toBeUndefined();
    });

    it('应该处理空输入', () => {
      expect(() => CoreMapper.fromSchema(null as any)).toThrow('Schema cannot be null or undefined');
      expect(() => CoreMapper.fromSchema(undefined as any)).toThrow('Schema cannot be null or undefined');
    });
  });

  describe('validateSchema方法测试', () => {
    it('应该验证有效的Schema', () => {
      const schema = createTestCoreSchema();
      const result = CoreMapper.validateSchema(schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测缺失的必填字段', () => {
      const invalidSchema = {
        orchestrator_id: '87654321-4321-4321-8321-210987654321',
        core_operation: 'workflow_execution'
        // 缺少 workflow_id, timestamp, protocol_version
      };

      // 验证方法会抛出异常，所以我们需要捕获异常
      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow();
    });

    it('应该检测无效的数据类型', () => {
      const result = CoreMapper.validateSchema('invalid-data');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
    });

    it('应该处理null和undefined', () => {
      const nullResult = CoreMapper.validateSchema(null);
      const undefinedResult = CoreMapper.validateSchema(undefined);

      expect(nullResult.isValid).toBe(false);
      expect(undefinedResult.isValid).toBe(false);
      expect(nullResult.errors).toContain('Data must be an object');
      expect(undefinedResult.errors).toContain('Data must be an object');
    });
  });

  describe('批量映射方法测试', () => {
    it('应该正确批量转换实体数组为Schema数组', () => {
      const entity1 = createTestCoreEntity();
      const entity2 = createTestCoreEntity();
      const entities = [entity1, entity2];

      const schemas = CoreMapper.toSchemaArray(entities);

      expect(schemas).toHaveLength(2);
      expect(schemas[0].workflow_id).toBe(entities[0].workflowId);
      expect(schemas[1].workflow_id).toBe(entities[1].workflowId);
    });

    it('应该正确批量转换Schema数组为实体数组', () => {
      const schemas = [createTestCoreSchema(), createTestCoreSchema()];
      schemas[1].workflow_id = '22222222-2222-4222-8222-222222222222';

      const entities = CoreMapper.fromSchemaArray(schemas);

      expect(entities).toHaveLength(2);
      expect(entities[0].workflowId).toBe(schemas[0].workflow_id);
      expect(entities[1].workflowId).toBe(schemas[1].workflow_id);
    });

    it('应该处理空数组', () => {
      const emptySchemas = CoreMapper.toSchemaArray([]);
      const emptyEntities = CoreMapper.fromSchemaArray([]);

      expect(emptySchemas).toHaveLength(0);
      expect(emptyEntities).toHaveLength(0);
    });
  });

  describe('映射一致性测试', () => {
    it('应该保持双向映射的一致性', () => {
      const originalEntity = createTestCoreEntity();
      
      // Entity -> Schema -> Entity
      const schema = CoreMapper.toSchema(originalEntity);
      const convertedEntity = CoreMapper.fromSchema(schema);

      expect(convertedEntity.workflowId).toBe(originalEntity.workflowId);
      expect(convertedEntity.orchestratorId).toBe(originalEntity.orchestratorId);
      expect(convertedEntity.coreOperation).toBe(originalEntity.coreOperation);
      expect(convertedEntity.timestamp).toBe(originalEntity.timestamp);
      expect(convertedEntity.protocolVersion).toBe(originalEntity.protocolVersion);
    });

    it('应该保持Schema到Entity再到Schema的一致性', () => {
      const originalSchema = createTestCoreSchema();
      
      // Schema -> Entity -> Schema
      const entity = CoreMapper.fromSchema(originalSchema);
      const convertedSchema = CoreMapper.toSchema(entity);

      expect(convertedSchema.workflow_id).toBe(originalSchema.workflow_id);
      expect(convertedSchema.orchestrator_id).toBe(originalSchema.orchestrator_id);
      expect(convertedSchema.core_operation).toBe(originalSchema.core_operation);
      expect(convertedSchema.timestamp).toBe(originalSchema.timestamp);
      expect(convertedSchema.protocol_version).toBe(originalSchema.protocol_version);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理映射过程中的错误', () => {
      const invalidEntity = {
        workflowId: 'invalid-uuid',
        orchestratorId: null,
        coreOperation: undefined
      };

      expect(() => CoreMapper.toSchema(invalidEntity as any)).toThrow();
    });

    it('应该处理Schema验证错误', () => {
      const invalidSchema = {
        workflow_id: 123, // 应该是字符串
        orchestrator_id: null,
        core_operation: 'invalid_operation'
      };

      // 验证方法会抛出异常
      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow();
    });
  });
});
