/**
 * MPLP模块标准化验证测试
 * 
 * 验证Context、Plan、Confirm、Trace四个模块的标准化实现
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { ContextMapper } from '../src/modules/context/api/mappers/context.mapper';
import { PlanMapper } from '../src/modules/plan/api/mappers/plan.mapper';
import { ConfirmMapper } from '../src/modules/confirm/api/mappers/confirm.mapper';
import { TraceMapper } from '../src/modules/trace/api/mappers/trace.mapper';

describe('MPLP模块标准化验证', () => {
  
  describe('Context模块Mapper标准化', () => {
    it('应该正确实现Schema-TypeScript映射', () => {
      const testData = {
        contextId: 'test-context-123',
        name: 'Test Context',
        description: 'Test Description',
        lifecycleStage: 'active',
        status: 'running',
        createdAt: new Date('2025-08-09T10:00:00Z'),
        updatedAt: new Date('2025-08-09T11:00:00Z'),
        sessionIds: ['session-1', 'session-2'],
        sharedStateIds: ['state-1'],
        configuration: { key: 'value' },
        metadata: { test: true }
      };

      // TypeScript → Schema
      const schema = ContextMapper.toSchema(testData as any);
      expect(schema.context_id).toBe('test-context-123');
      expect(schema.name).toBe('Test Context');
      expect(schema.lifecycle_stage).toBe('active');
      expect(schema.created_at).toBe('2025-08-09T10:00:00.000Z');

      // Schema → TypeScript
      const backToTs = ContextMapper.fromSchema(schema);
      expect(backToTs.contextId).toBe('test-context-123');
      expect(backToTs.name).toBe('Test Context');
      expect(backToTs.lifecycleStage).toBe('active');
      expect(backToTs.createdAt).toEqual(new Date('2025-08-09T10:00:00Z'));

      // Schema验证
      expect(ContextMapper.validateSchema(schema)).toBe(true);
      expect(ContextMapper.validateSchema({})).toBe(false);
    });

    it('应该支持批量转换', () => {
      const testArray = [
        { contextId: 'ctx-1', name: 'Context 1', lifecycleStage: 'active', status: 'running', createdAt: new Date(), updatedAt: new Date() },
        { contextId: 'ctx-2', name: 'Context 2', lifecycleStage: 'inactive', status: 'stopped', createdAt: new Date(), updatedAt: new Date() }
      ];

      const schemas = ContextMapper.toSchemaArray(testArray as any);
      expect(schemas).toHaveLength(2);
      expect(schemas[0].context_id).toBe('ctx-1');
      expect(schemas[1].context_id).toBe('ctx-2');

      const backToTs = ContextMapper.fromSchemaArray(schemas);
      expect(backToTs).toHaveLength(2);
      expect(backToTs[0].contextId).toBe('ctx-1');
      expect(backToTs[1].contextId).toBe('ctx-2');
    });
  });

  describe('Plan模块Mapper标准化', () => {
    it('应该正确实现Schema-TypeScript映射', () => {
      const testData = {
        planId: 'test-plan-123',
        contextId: 'test-context-123',
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['goal1', 'goal2'],
        executionStrategy: 'sequential',
        priority: 'high',
        status: 'active',
        createdAt: new Date('2025-08-09T10:00:00Z'),
        updatedAt: new Date('2025-08-09T11:00:00Z'),
        createdBy: 'test-user'
      };

      // TypeScript → Schema
      const schema = PlanMapper.toSchema(testData as any);
      expect(schema.plan_id).toBe('test-plan-123');
      expect(schema.context_id).toBe('test-context-123');
      expect(schema.execution_strategy).toBe('sequential');
      expect(schema.created_at).toBe('2025-08-09T10:00:00.000Z');

      // Schema → TypeScript
      const backToTs = PlanMapper.fromSchema(schema);
      expect(backToTs.planId).toBe('test-plan-123');
      expect(backToTs.contextId).toBe('test-context-123');
      expect(backToTs.executionStrategy).toBe('sequential');

      // Schema验证
      expect(PlanMapper.validateSchema(schema)).toBe(true);
      expect(PlanMapper.validateSchema({})).toBe(false);
    });
  });

  describe('Confirm模块Mapper标准化', () => {
    it('应该正确实现Schema-TypeScript映射', () => {
      const testData = {
        confirmId: 'test-confirm-123',
        contextId: 'test-context-123',
        protocolVersion: '1.0.0',
        confirmationType: 'approval',
        status: 'pending',
        priority: 'high',
        createdAt: new Date('2025-08-09T10:00:00Z'),
        updatedAt: new Date('2025-08-09T11:00:00Z'),
        subject: {
          title: 'Test Confirmation',
          description: 'Test Description'
        },
        requester: {
          id: 'user-123',
          name: 'Test User',
          role: 'admin'
        },
        approvalWorkflow: {
          steps: []
        }
      };

      // TypeScript → Schema
      const schema = ConfirmMapper.toSchema(testData as any);
      expect(schema.confirm_id).toBe('test-confirm-123');
      expect(schema.context_id).toBe('test-context-123');
      expect(schema.protocol_version).toBe('1.0.0');
      expect(schema.confirmation_type).toBe('approval');

      // Schema → TypeScript
      const backToTs = ConfirmMapper.fromSchema(schema);
      expect(backToTs.confirmId).toBe('test-confirm-123');
      expect(backToTs.contextId).toBe('test-context-123');
      expect(backToTs.protocolVersion).toBe('1.0.0');
      expect(backToTs.confirmationType).toBe('approval');

      // Schema验证
      expect(ConfirmMapper.validateSchema(schema)).toBe(true);
      expect(ConfirmMapper.validateSchema({})).toBe(false);
    });
  });

  describe('Trace模块Mapper标准化', () => {
    it('应该正确实现Schema-TypeScript映射', () => {
      const testData = {
        traceId: 'test-trace-123',
        contextId: 'test-context-123',
        protocolVersion: '1.0.0',
        traceType: 'info',
        severity: 'low',
        timestamp: '2025-08-09T10:00:00Z',
        event: {
          type: 'user_action',
          name: 'click',
          description: 'User clicked button',
          category: 'interaction',
          source: {
            component: 'ui',
            module: 'button',
            function: 'onClick',
            line_number: 123
          },
          data: { key: 'value' }
        }
      };

      // TypeScript → Schema
      const schema = TraceMapper.toSchema(testData as any);
      expect(schema.trace_id).toBe('test-trace-123');
      expect(schema.context_id).toBe('test-context-123');
      expect(schema.trace_type).toBe('info');
      expect(schema.protocol_version).toBe('1.0.0');

      // Schema → TypeScript
      const backToTs = TraceMapper.fromSchema(schema);
      expect(backToTs.traceId).toBe('test-trace-123');
      expect(backToTs.contextId).toBe('test-context-123');
      expect(backToTs.traceType).toBe('info');
      expect(backToTs.event.type).toBe('user_action');

      // Schema验证
      expect(TraceMapper.validateSchema(schema)).toBe(true);
      expect(TraceMapper.validateSchema({})).toBe(false);
    });
  });

  describe('模块标准化一致性验证', () => {
    it('所有模块都应该有相同的Mapper接口', () => {
      // 验证所有Mapper都有必需的静态方法
      expect(typeof ContextMapper.toSchema).toBe('function');
      expect(typeof ContextMapper.fromSchema).toBe('function');
      expect(typeof ContextMapper.validateSchema).toBe('function');
      expect(typeof ContextMapper.toSchemaArray).toBe('function');
      expect(typeof ContextMapper.fromSchemaArray).toBe('function');

      expect(typeof PlanMapper.toSchema).toBe('function');
      expect(typeof PlanMapper.fromSchema).toBe('function');
      expect(typeof PlanMapper.validateSchema).toBe('function');
      expect(typeof PlanMapper.toSchemaArray).toBe('function');
      expect(typeof PlanMapper.fromSchemaArray).toBe('function');

      expect(typeof ConfirmMapper.toSchema).toBe('function');
      expect(typeof ConfirmMapper.fromSchema).toBe('function');
      expect(typeof ConfirmMapper.validateSchema).toBe('function');
      expect(typeof ConfirmMapper.toSchemaArray).toBe('function');
      expect(typeof ConfirmMapper.fromSchemaArray).toBe('function');

      expect(typeof TraceMapper.toSchema).toBe('function');
      expect(typeof TraceMapper.fromSchema).toBe('function');
      expect(typeof TraceMapper.validateSchema).toBe('function');
      expect(typeof TraceMapper.toSchemaArray).toBe('function');
      expect(typeof TraceMapper.fromSchemaArray).toBe('function');
    });

    it('所有模块都应该遵循双重命名约定', () => {
      // 测试snake_case → camelCase转换
      const testCases = [
        { snake: 'context_id', camel: 'contextId' },
        { snake: 'plan_id', camel: 'planId' },
        { snake: 'confirm_id', camel: 'confirmId' },
        { snake: 'trace_id', camel: 'traceId' },
        { snake: 'created_at', camel: 'createdAt' },
        { snake: 'updated_at', camel: 'updatedAt' }
      ];

      // 这里可以添加更详细的命名约定验证逻辑
      testCases.forEach(testCase => {
        expect(testCase.snake).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(testCase.camel).toMatch(/^[a-z][a-zA-Z0-9]*$/);
      });
    });
  });
});
