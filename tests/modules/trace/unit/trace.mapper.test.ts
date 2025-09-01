/**
 * Trace映射器单元测试
 * 
 * @description 基于实际接口的TraceMapper测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { TraceMapper } from '../../../../src/modules/trace/api/mappers/trace.mapper';
import { TraceEntityData, TraceSchema } from '../../../../src/modules/trace/types';
import { TraceTestFactory } from '../factories/trace-test.factory';

describe('TraceMapper测试', () => {
  
  describe('toSchema功能测试', () => {
    it('应该正确将TypeScript实体转换为Schema格式', () => {
      // 📋 Arrange
      const entityData = TraceTestFactory.createTraceEntityData();

      // 🎬 Act
      const result = TraceMapper.toSchema(entityData);

      // ✅ Assert - 验证snake_case字段映射
      expect(result.protocol_version).toBe('1.0.0');
      expect(result.trace_id).toBe(entityData.traceId);
      expect(result.context_id).toBe(entityData.contextId);
      expect(result.plan_id).toBe(entityData.planId);
      expect(result.task_id).toBe(entityData.taskId);
      expect(result.trace_type).toBe(entityData.traceType);
      expect(result.severity).toBe(entityData.severity);
      
      // 验证事件对象映射
      expect(result.event).toBeDefined();
      expect(result.event.type).toBe(entityData.event.type);
      expect(result.event.name).toBe(entityData.event.name);
      expect(result.event.category).toBe(entityData.event.category);
      expect(result.event.source.component).toBe(entityData.event.source.component);
      expect(result.event.source.line_number).toBe(entityData.event.source.lineNumber);
      
      // 验证复杂对象映射
      expect(result.audit_trail).toBeDefined();
      expect(result.performance_metrics).toBeDefined();
      expect(result.monitoring_integration).toBeDefined();
      expect(result.version_history).toBeDefined();
      expect(result.search_metadata).toBeDefined();
      expect(result.trace_operation).toBe(entityData.traceOperation);
      expect(result.event_integration).toBeDefined();
    });

    it('应该正确处理最小化的实体数据', () => {
      // 📋 Arrange
      const minimalData = TraceTestFactory.createMinimalTraceEntityData();

      // 🎬 Act
      const result = TraceMapper.toSchema(minimalData);

      // ✅ Assert
      expect(result.protocol_version).toBe('1.0.0');
      expect(result.trace_id).toBe(minimalData.traceId);
      expect(result.context_id).toBe(minimalData.contextId);
      expect(result.trace_type).toBe(minimalData.traceType);
      expect(result.severity).toBe(minimalData.severity);
      expect(result.event).toBeDefined();
      expect(result.audit_trail).toBeDefined();
      expect(result.performance_metrics).toBeDefined();
    });

    it('应该正确处理可选字段', () => {
      // 📋 Arrange
      const entityWithOptionals = TraceTestFactory.createTraceEntityData({
        planId: undefined,
        taskId: undefined,
        contextSnapshot: undefined,
        errorInformation: undefined,
        decisionLog: undefined
      });

      // 🎬 Act
      const result = TraceMapper.toSchema(entityWithOptionals);

      // ✅ Assert
      expect(result.plan_id).toBeUndefined();
      expect(result.task_id).toBeUndefined();
      expect(result.context_snapshot).toBeUndefined();
      expect(result.error_information).toBeUndefined();
      expect(result.decision_log).toBeUndefined();
      
      // 必需字段应该存在
      expect(result.trace_id).toBeDefined();
      expect(result.context_id).toBeDefined();
      expect(result.trace_type).toBeDefined();
      expect(result.severity).toBeDefined();
    });
  });

  describe('fromSchema功能测试', () => {
    it('应该正确将Schema格式转换为TypeScript实体', () => {
      // 📋 Arrange
      const schemaData = TraceTestFactory.createTraceSchema();

      // 🎬 Act
      const result = TraceMapper.fromSchema(schemaData);

      // ✅ Assert - 验证camelCase字段映射
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.traceId).toBe(schemaData.trace_id);
      expect(result.contextId).toBe(schemaData.context_id);
      expect(result.planId).toBe(schemaData.plan_id);
      expect(result.taskId).toBe(schemaData.task_id);
      expect(result.traceType).toBe(schemaData.trace_type);
      expect(result.severity).toBe(schemaData.severity);
      
      // 验证事件对象映射
      expect(result.event).toBeDefined();
      expect(result.event.type).toBe(schemaData.event.type);
      expect(result.event.name).toBe(schemaData.event.name);
      expect(result.event.category).toBe(schemaData.event.category);
      expect(result.event.source.component).toBe(schemaData.event.source.component);
      expect(result.event.source.lineNumber).toBe(schemaData.event.source.line_number);
      
      // 验证复杂对象映射
      expect(result.auditTrail).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.monitoringIntegration).toBeDefined();
      expect(result.versionHistory).toBeDefined();
      expect(result.searchMetadata).toBeDefined();
      expect(result.traceOperation).toBe(schemaData.trace_operation);
      expect(result.eventIntegration).toBeDefined();
    });

    it('应该正确处理Schema中的可选字段', () => {
      // 📋 Arrange
      const schemaWithOptionals = TraceTestFactory.createTraceSchema({
        plan_id: undefined,
        task_id: undefined,
        context_snapshot: undefined,
        error_information: undefined,
        decision_log: undefined
      });

      // 🎬 Act
      const result = TraceMapper.fromSchema(schemaWithOptionals);

      // ✅ Assert
      expect(result.planId).toBeUndefined();
      expect(result.taskId).toBeUndefined();
      expect(result.contextSnapshot).toBeUndefined();
      expect(result.errorInformation).toBeUndefined();
      expect(result.decisionLog).toBeUndefined();
      
      // 必需字段应该存在
      expect(result.traceId).toBeDefined();
      expect(result.contextId).toBeDefined();
      expect(result.traceType).toBeDefined();
      expect(result.severity).toBeDefined();
    });
  });

  describe('validateSchema功能测试', () => {
    it('应该验证有效的Schema数据', () => {
      // 📋 Arrange
      const validSchema = TraceTestFactory.createTraceSchema();

      // 🎬 Act
      const result = TraceMapper.validateSchema(validSchema);

      // ✅ Assert
      expect(result).toBe(true);
    });

    it('应该拒绝无效的Schema数据', () => {
      // 📋 Arrange
      const invalidSchema = { invalid: 'data' };

      // 🎬 Act
      const result = TraceMapper.validateSchema(invalidSchema);

      // ✅ Assert
      expect(result).toBe(false);
    });

    it('应该拒绝null或undefined数据', () => {
      // 🎬 Act & Assert
      expect(TraceMapper.validateSchema(null)).toBe(false);
      expect(TraceMapper.validateSchema(undefined)).toBe(false);
    });

    it('应该拒绝缺少必需字段的Schema', () => {
      // 📋 Arrange
      const incompleteSchema = {
        protocol_version: '1.0.0',
        timestamp: new Date().toISOString()
        // 缺少其他必需字段
      };

      // 🎬 Act
      const result = TraceMapper.validateSchema(incompleteSchema);

      // ✅ Assert
      expect(result).toBe(false);
    });
  });

  describe('批量转换功能测试', () => {
    it('应该正确批量转换Entity数组为Schema数组', () => {
      // 📋 Arrange
      const entities = [
        TraceTestFactory.createTraceEntityData(),
        TraceTestFactory.createMinimalTraceEntityData()
      ];

      // 🎬 Act
      const result = TraceMapper.toSchemaArray(entities);

      // ✅ Assert
      expect(result).toHaveLength(2);
      expect(result[0].trace_id).toBe(entities[0].traceId);
      expect(result[1].trace_id).toBe(entities[1].traceId);
    });

    it('应该正确批量转换Schema数组为Entity数组', () => {
      // 📋 Arrange
      const schemas = [
        TraceTestFactory.createTraceSchema(),
        TraceTestFactory.createTraceSchema()
      ];

      // 🎬 Act
      const result = TraceMapper.fromSchemaArray(schemas);

      // ✅ Assert
      expect(result).toHaveLength(2);
      expect(result[0].traceId).toBe(schemas[0].trace_id);
      expect(result[1].traceId).toBe(schemas[1].trace_id);
    });

    it('应该处理空数组', () => {
      // 🎬 Act
      const toSchemaResult = TraceMapper.toSchemaArray([]);
      const fromSchemaResult = TraceMapper.fromSchemaArray([]);

      // ✅ Assert
      expect(toSchemaResult).toHaveLength(0);
      expect(fromSchemaResult).toHaveLength(0);
    });
  });

  describe('请求转换功能测试', () => {
    it('应该正确转换CreateTraceRequest为Schema格式', () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();

      // 🎬 Act
      const result = TraceMapper.createRequestToSchema(createRequest);

      // ✅ Assert
      expect(result.trace_type).toBe(createRequest.traceType);
      expect(result.severity).toBe(createRequest.severity);
      expect(result.event).toBeDefined();
      expect(result.trace_operation).toBe(createRequest.traceOperation);
    });

    it('应该正确转换UpdateTraceRequest为Schema格式', () => {
      // 📋 Arrange
      const updateRequest = TraceTestFactory.createUpdateTraceRequest('trace-test-001' as any);

      // 🎬 Act
      const result = TraceMapper.updateRequestToSchema(updateRequest);

      // ✅ Assert
      expect(result.severity).toBe(updateRequest.severity);
      expect(result.event).toBeDefined();
    });

    it('应该正确转换TraceQueryFilter为Schema查询格式', () => {
      // 📋 Arrange
      const queryFilter = TraceTestFactory.createTraceQueryFilter();

      // 🎬 Act
      const result = TraceMapper.queryFilterToSchema(queryFilter);

      // ✅ Assert
      expect(result.trace_type).toBe(queryFilter.traceType);
      expect(result.severity).toBe(queryFilter.severity);
      expect(result.context_id).toBe(queryFilter.contextId);
    });
  });

  describe('双重命名约定一致性测试', () => {
    it('应该保持toSchema和fromSchema的一致性', () => {
      // 📋 Arrange
      const originalEntity = TraceTestFactory.createTraceEntityData();

      // 🎬 Act - 双向转换
      const schema = TraceMapper.toSchema(originalEntity);
      const convertedEntity = TraceMapper.fromSchema(schema);

      // ✅ Assert - 验证关键字段的一致性
      expect(convertedEntity.traceId).toBe(originalEntity.traceId);
      expect(convertedEntity.contextId).toBe(originalEntity.contextId);
      expect(convertedEntity.traceType).toBe(originalEntity.traceType);
      expect(convertedEntity.severity).toBe(originalEntity.severity);
      expect(convertedEntity.traceOperation).toBe(originalEntity.traceOperation);
      
      // 验证事件对象的一致性
      expect(convertedEntity.event.type).toBe(originalEntity.event.type);
      expect(convertedEntity.event.name).toBe(originalEntity.event.name);
      expect(convertedEntity.event.category).toBe(originalEntity.event.category);
      expect(convertedEntity.event.source.component).toBe(originalEntity.event.source.component);
    });

    it('应该正确处理snake_case到camelCase的字段映射', () => {
      // 📋 Arrange
      const testMappings = [
        { snake: 'protocol_version', camel: 'protocolVersion' },
        { snake: 'trace_id', camel: 'traceId' },
        { snake: 'context_id', camel: 'contextId' },
        { snake: 'plan_id', camel: 'planId' },
        { snake: 'task_id', camel: 'taskId' },
        { snake: 'trace_type', camel: 'traceType' },
        { snake: 'trace_operation', camel: 'traceOperation' },
        { snake: 'audit_trail', camel: 'auditTrail' },
        { snake: 'performance_metrics', camel: 'performanceMetrics' },
        { snake: 'monitoring_integration', camel: 'monitoringIntegration' },
        { snake: 'version_history', camel: 'versionHistory' },
        { snake: 'search_metadata', camel: 'searchMetadata' },
        { snake: 'event_integration', camel: 'eventIntegration' }
      ];

      const entityData = TraceTestFactory.createTraceEntityData();
      const schema = TraceMapper.toSchema(entityData);
      const convertedEntity = TraceMapper.fromSchema(schema);

      // ✅ Assert - 验证所有字段映射
      testMappings.forEach(({ snake, camel }) => {
        if (schema[snake as keyof TraceSchema] !== undefined) {
          expect(convertedEntity[camel as keyof TraceEntityData]).toBeDefined();
        }
      });
    });
  });
});
