/**
 * MPLP 全局Schema合规性验证测试
 * 
 * @version v1.0.0
 * @created 2025-07-12T22:10:00+08:00
 * @compliance .cursor/rules/schema-driven.mdc - Schema驱动开发规则
 * @description 测试所有模块实现是否完全符合对应的JSON Schema定义
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// 导入所有Schema
import contextSchema from '../schemas/context-protocol.json';
import planSchema from '../schemas/plan-protocol.json';
import confirmSchema from '../schemas/confirm-protocol.json';
import traceSchema from '../schemas/trace-protocol.json';

describe('MPLP全局Schema合规性验证', () => {
  // 创建Ajv实例用于验证
  const ajv = new Ajv({ strict: true, allErrors: true });
  addFormats(ajv);
  
  // 编译所有Schema验证器
  const validateContext = ajv.compile(contextSchema);
  const validatePlan = ajv.compile(planSchema);
  const validateConfirm = ajv.compile(confirmSchema);
  const validateTrace = ajv.compile(traceSchema);

  describe('Schema版本一致性验证', () => {
    test('所有Schema应使用相同的协议版本', () => {
      const contextVersion = contextSchema.properties.protocol_version.const;
      const planVersion = planSchema.properties.protocol_version.const;
      const confirmVersion = confirmSchema.properties.protocol_version.const;
      const traceVersion = traceSchema.properties.protocol_version.const;
      
      expect(contextVersion).toBe('1.0.1');
      expect(planVersion).toBe('1.0.1');
      expect(confirmVersion).toBe('1.0.1');
      expect(traceVersion).toBe('1.0.1');
    });
    
    test('所有Schema应使用相同的UUID格式', () => {
      const uuidPattern = /^\^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\$$/;
      
      expect(contextSchema.$defs.uuid.pattern).toMatch(uuidPattern);
      expect(planSchema.$defs.uuid.pattern).toMatch(uuidPattern);
      expect(confirmSchema.$defs.uuid.pattern).toMatch(uuidPattern);
      expect(traceSchema.$defs.uuid.pattern).toMatch(uuidPattern);
    });
    
    test('所有Schema应使用相同的优先级枚举', () => {
      const priorityEnumContext = contextSchema.$defs.priority.enum;
      const priorityEnumPlan = planSchema.$defs.priority.enum;
      const priorityEnumConfirm = confirmSchema.$defs.priority.enum;
      const priorityEnumTrace = traceSchema.$defs.priority.enum;
      
      expect(priorityEnumContext).toEqual(['critical', 'high', 'medium', 'low']);
      expect(priorityEnumPlan).toEqual(['critical', 'high', 'medium', 'low']);
      expect(priorityEnumConfirm).toEqual(['critical', 'high', 'medium', 'low']);
      expect(priorityEnumTrace).toEqual(['critical', 'high', 'medium', 'low']);
    });
  });
  
  describe('Context模块Schema结构验证', () => {
    test('Context Schema应包含必要字段', () => {
      expect(contextSchema.required).toContain('protocol_version');
      expect(contextSchema.required).toContain('context_id');
      expect(contextSchema.required).toContain('name');
      expect(contextSchema.required).toContain('status');
      expect(contextSchema.required).toContain('lifecycle_stage');
      expect(contextSchema.required).toContain('shared_state');
      expect(contextSchema.required).toContain('access_control');
      expect(contextSchema.required).toContain('configuration');
    });
    
    test('Context状态应为有效枚举值', () => {
      const statusEnum = contextSchema.properties.status.enum;
      expect(statusEnum).toContain('active');
      expect(statusEnum).toContain('suspended');
      expect(statusEnum).toContain('completed');
      expect(statusEnum).toContain('terminated');
    });
    
    test('Context生命周期阶段应为有效枚举值', () => {
      const lifecycleEnum = contextSchema.properties.lifecycle_stage.enum;
      expect(lifecycleEnum).toContain('planning');
      expect(lifecycleEnum).toContain('executing');
      expect(lifecycleEnum).toContain('monitoring');
      expect(lifecycleEnum).toContain('completed');
    });
  });

  describe('Plan模块Schema结构验证', () => {
    test('Plan Schema应包含必要字段', () => {
      expect(planSchema.required).toContain('protocol_version');
      expect(planSchema.required).toContain('plan_id');
      expect(planSchema.required).toContain('context_id');
      expect(planSchema.required).toContain('name');
      expect(planSchema.required).toContain('status');
      expect(planSchema.required).toContain('priority');
      expect(planSchema.required).toContain('timestamp');
    });
    
    test('Plan状态应为有效枚举值', () => {
      // 从Schema中定义的TaskStatus枚举验证
      const validStatuses = ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'];
      
      validStatuses.forEach(status => {
        expect(planSchema.properties.status.enum).toContain(status);
      });
    });
    
    test('FailureResolver配置应符合Schema定义', () => {
      const failureResolverDef = planSchema.$defs.failure_resolver;
      expect(failureResolverDef).toBeDefined();
      
      // 验证FailureResolver配置字段
      expect(failureResolverDef.properties.enabled.type).toBe('boolean');
      expect(failureResolverDef.properties.strategies.type).toBe('array');
      expect(failureResolverDef.properties.retry_config).toBeDefined();
      expect(failureResolverDef.properties.rollback_config).toBeDefined();
    });
  });
  
  describe('Confirm模块Schema结构验证', () => {
    test('Confirm Schema应包含必要字段', () => {
      expect(confirmSchema.required).toContain('protocol_version');
      expect(confirmSchema.required).toContain('confirm_id');
      expect(confirmSchema.required).toContain('context_id');
      expect(confirmSchema.required).toContain('confirmation_type');
      expect(confirmSchema.required).toContain('status');
      expect(confirmSchema.required).toContain('timestamp');
    });
    
    test('Confirm类型应为有效枚举值', () => {
      const confirmationTypeEnum = confirmSchema.properties.confirmation_type.enum;
      expect(confirmationTypeEnum).toContain('plan_approval');
      expect(confirmationTypeEnum).toContain('task_approval');
      expect(confirmationTypeEnum).toContain('milestone_confirmation');
      expect(confirmationTypeEnum).toContain('risk_acceptance');
    });
    
    test('Confirm状态应为有效枚举值', () => {
      const statusEnum = confirmSchema.properties.status.enum;
      expect(statusEnum).toContain('pending');
      expect(statusEnum).toContain('in_review');
      expect(statusEnum).toContain('approved');
      expect(statusEnum).toContain('rejected');
      expect(statusEnum).toContain('cancelled');
      expect(statusEnum).toContain('expired');
    });
  });
  
  describe('Trace模块Schema结构验证', () => {
    test('Trace Schema应包含必要字段', () => {
      expect(traceSchema.required).toContain('protocol_version');
      expect(traceSchema.required).toContain('timestamp');
      expect(traceSchema.required).toContain('trace_id');
      expect(traceSchema.required).toContain('context_id');
      expect(traceSchema.required).toContain('trace_type');
      expect(traceSchema.required).toContain('severity');
      expect(traceSchema.required).toContain('event');
    });
    
    test('Trace类型应为有效枚举值', () => {
      const traceTypeEnum = traceSchema.properties.trace_type.enum;
      expect(traceTypeEnum).toContain('execution');
      expect(traceTypeEnum).toContain('monitoring');
      expect(traceTypeEnum).toContain('audit');
      expect(traceTypeEnum).toContain('performance');
      expect(traceTypeEnum).toContain('error');
      expect(traceTypeEnum).toContain('decision');
    });
    
    test('Trace严重程度应为有效枚举值', () => {
      const severityEnum = traceSchema.properties.severity.enum;
      expect(severityEnum).toContain('debug');
      expect(severityEnum).toContain('info');
      expect(severityEnum).toContain('warn');
      expect(severityEnum).toContain('error');
      expect(severityEnum).toContain('critical');
    });
    
    test('Trace事件应包含必要字段', () => {
      const eventProps = traceSchema.properties.event;
      expect(eventProps.required).toContain('type');
      expect(eventProps.required).toContain('name');
      expect(eventProps.required).toContain('category');
      expect(eventProps.required).toContain('source');
      
      const eventTypeEnum = eventProps.properties.type.enum;
      expect(eventTypeEnum).toContain('start');
      expect(eventTypeEnum).toContain('progress');
      expect(eventTypeEnum).toContain('completion');
      expect(eventTypeEnum).toContain('failure');
    });
  });
  
  describe('Schema字段类型一致性验证', () => {
    test('所有模块中的UUID字段应使用相同类型定义', () => {
      const contextUUIDRef = contextSchema.properties.context_id.$ref;
      const planUUIDRef = planSchema.properties.plan_id.$ref;
      const confirmUUIDRef = confirmSchema.properties.confirm_id.$ref;
      const traceUUIDRef = traceSchema.properties.trace_id.$ref;
      
      expect(contextUUIDRef).toBe('#/$defs/uuid');
      expect(planUUIDRef).toBe('#/$defs/uuid');
      expect(confirmUUIDRef).toBe('#/$defs/uuid');
      expect(traceUUIDRef).toBe('#/$defs/uuid');
    });
    
    test('所有模块中的时间戳字段应使用相同类型定义', () => {
      const contextTimestampRef = contextSchema.properties.timestamp.$ref;
      const planTimestampRef = planSchema.properties.timestamp.$ref;
      const confirmTimestampRef = confirmSchema.properties.timestamp.$ref;
      const traceTimestampRef = traceSchema.properties.timestamp.$ref;
      
      expect(contextTimestampRef).toBe('#/$defs/timestamp');
      expect(planTimestampRef).toBe('#/$defs/timestamp');
      expect(confirmTimestampRef).toBe('#/$defs/timestamp');
      expect(traceTimestampRef).toBe('#/$defs/timestamp');
    });
    
    test('所有模块中的版本字段应使用相同类型定义', () => {
      const contextVersionRef = contextSchema.properties.protocol_version.$ref;
      const planVersionRef = planSchema.properties.protocol_version.$ref;
      const confirmVersionRef = confirmSchema.properties.protocol_version.$ref;
      const traceVersionRef = traceSchema.properties.protocol_version.$ref;
      
      expect(contextVersionRef).toBe('#/$defs/version');
      expect(planVersionRef).toBe('#/$defs/version');
      expect(confirmVersionRef).toBe('#/$defs/version');
      expect(traceVersionRef).toBe('#/$defs/version');
    });
  });
}); 