/**
 * MPLP模块场景验证测试
 * 
 * 验证Context、Plan、Confirm、Trace四个模块的实际使用场景
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { ContextMapper } from '../src/modules/context/api/mappers/context.mapper';
import { PlanMapper } from '../src/modules/plan/api/mappers/plan.mapper';
import { ConfirmMapper } from '../src/modules/confirm/api/mappers/confirm.mapper';
import { TraceMapper } from '../src/modules/trace/api/mappers/trace.mapper';

describe('MPLP模块场景验证', () => {
  
  describe('端到端工作流场景', () => {
    it('应该支持完整的MPLP工作流', () => {
      // 1. 创建Context
      const contextData = {
        contextId: 'workflow-ctx-001',
        name: 'AI Agent Workflow',
        description: 'Complete AI agent workflow demonstration',
        lifecycleStage: 'active',
        status: 'running',
        createdAt: new Date('2025-08-09T10:00:00Z'),
        updatedAt: new Date('2025-08-09T10:00:00Z'),
        sessionIds: ['session-001'],
        sharedStateIds: ['state-001'],
        configuration: { 
          maxAgents: 5,
          timeout: 30000
        },
        metadata: { 
          workflow: 'demo',
          version: '1.0.0'
        }
      };

      const contextSchema = ContextMapper.toSchema(contextData as any);
      expect(contextSchema.context_id).toBe('workflow-ctx-001');
      expect(contextSchema.lifecycle_stage).toBe('active');

      // 2. 创建Plan
      const planData = {
        planId: 'plan-001',
        contextId: 'workflow-ctx-001',
        name: 'Demo Plan',
        description: 'Demonstration plan for workflow',
        goals: ['Complete task A', 'Complete task B'],
        executionStrategy: 'sequential',
        priority: 'high',
        status: 'active',
        createdAt: new Date('2025-08-09T10:01:00Z'),
        updatedAt: new Date('2025-08-09T10:01:00Z'),
        createdBy: 'system'
      };

      const planSchema = PlanMapper.toSchema(planData as any);
      expect(planSchema.plan_id).toBe('plan-001');
      expect(planSchema.context_id).toBe('workflow-ctx-001');
      expect(planSchema.execution_strategy).toBe('sequential');

      // 3. 创建Confirm
      const confirmData = {
        confirmId: 'confirm-001',
        contextId: 'workflow-ctx-001',
        planId: 'plan-001',
        protocolVersion: '1.0.0',
        confirmationType: 'approval',
        status: 'pending',
        priority: 'high',
        createdAt: new Date('2025-08-09T10:02:00Z'),
        updatedAt: new Date('2025-08-09T10:02:00Z'),
        subject: {
          title: 'Plan Approval Required',
          description: 'Please approve the execution plan'
        },
        requester: {
          id: 'agent-001',
          name: 'Planning Agent',
          role: 'planner'
        },
        approvalWorkflow: {
          steps: []
        }
      };

      const confirmSchema = ConfirmMapper.toSchema(confirmData as any);
      expect(confirmSchema.confirm_id).toBe('confirm-001');
      expect(confirmSchema.context_id).toBe('workflow-ctx-001');
      expect(confirmSchema.plan_id).toBe('plan-001');

      // 4. 创建Trace
      const traceData = {
        traceId: 'trace-001',
        contextId: 'workflow-ctx-001',
        protocolVersion: '1.0.0',
        traceType: 'info',
        severity: 'low',
        timestamp: '2025-08-09T10:03:00Z',
        event: {
          type: 'workflow_start',
          name: 'Workflow Started',
          description: 'AI agent workflow has been initiated',
          category: 'system',
          source: {
            component: 'orchestrator',
            module: 'workflow-manager',
            function: 'startWorkflow',
            line_number: 42
          },
          data: {
            workflowId: 'workflow-001',
            agentCount: 3
          }
        }
      };

      const traceSchema = TraceMapper.toSchema(traceData as any);
      expect(traceSchema.trace_id).toBe('trace-001');
      expect(traceSchema.context_id).toBe('workflow-ctx-001');
      expect(traceSchema.trace_type).toBe('info');

      // 验证所有Schema都有效
      expect(ContextMapper.validateSchema(contextSchema)).toBe(true);
      expect(PlanMapper.validateSchema(planSchema)).toBe(true);
      expect(ConfirmMapper.validateSchema(confirmSchema)).toBe(true);
      expect(TraceMapper.validateSchema(traceSchema)).toBe(true);
    });

    it('应该支持批量数据处理', () => {
      // 创建多个Context
      const contexts = [
        { contextId: 'ctx-1', name: 'Context 1', lifecycleStage: 'active', status: 'running', createdAt: new Date(), updatedAt: new Date() },
        { contextId: 'ctx-2', name: 'Context 2', lifecycleStage: 'active', status: 'running', createdAt: new Date(), updatedAt: new Date() },
        { contextId: 'ctx-3', name: 'Context 3', lifecycleStage: 'inactive', status: 'stopped', createdAt: new Date(), updatedAt: new Date() }
      ];

      const contextSchemas = ContextMapper.toSchemaArray(contexts as any);
      expect(contextSchemas).toHaveLength(3);
      expect(contextSchemas[0].context_id).toBe('ctx-1');
      expect(contextSchemas[1].context_id).toBe('ctx-2');
      expect(contextSchemas[2].context_id).toBe('ctx-3');

      // 创建多个Plan
      const plans = [
        { planId: 'plan-1', contextId: 'ctx-1', name: 'Plan 1', goals: ['goal1'], executionStrategy: 'sequential', priority: 'high', status: 'active', createdAt: new Date(), updatedAt: new Date(), createdBy: 'user1' },
        { planId: 'plan-2', contextId: 'ctx-2', name: 'Plan 2', goals: ['goal2'], executionStrategy: 'parallel', priority: 'medium', status: 'active', createdAt: new Date(), updatedAt: new Date(), createdBy: 'user2' }
      ];

      const planSchemas = PlanMapper.toSchemaArray(plans as any);
      expect(planSchemas).toHaveLength(2);
      expect(planSchemas[0].plan_id).toBe('plan-1');
      expect(planSchemas[1].plan_id).toBe('plan-2');

      // 验证批量转换的一致性
      const backToContexts = ContextMapper.fromSchemaArray(contextSchemas);
      expect(backToContexts).toHaveLength(3);
      expect(backToContexts[0].contextId).toBe('ctx-1');
      expect(backToContexts[1].contextId).toBe('ctx-2');
      expect(backToContexts[2].contextId).toBe('ctx-3');
    });
  });

  describe('错误处理场景', () => {
    it('应该正确处理无效数据', () => {
      // 测试无效Schema验证
      expect(ContextMapper.validateSchema(null)).toBe(false);
      expect(ContextMapper.validateSchema(undefined)).toBe(false);
      expect(ContextMapper.validateSchema({})).toBe(false);
      expect(ContextMapper.validateSchema('invalid')).toBe(false);

      expect(PlanMapper.validateSchema(null)).toBe(false);
      expect(PlanMapper.validateSchema({})).toBe(false);

      expect(ConfirmMapper.validateSchema(null)).toBe(false);
      expect(ConfirmMapper.validateSchema({})).toBe(false);

      expect(TraceMapper.validateSchema(null)).toBe(false);
      expect(TraceMapper.validateSchema({})).toBe(false);
    });

    it('应该处理空数组', () => {
      expect(ContextMapper.toSchemaArray([])).toEqual([]);
      expect(ContextMapper.fromSchemaArray([])).toEqual([]);

      expect(PlanMapper.toSchemaArray([])).toEqual([]);
      expect(PlanMapper.fromSchemaArray([])).toEqual([]);

      expect(ConfirmMapper.toSchemaArray([])).toEqual([]);
      expect(ConfirmMapper.fromSchemaArray([])).toEqual([]);

      expect(TraceMapper.toSchemaArray([])).toEqual([]);
      expect(TraceMapper.fromSchemaArray([])).toEqual([]);
    });
  });

  describe('性能验证场景', () => {
    it('应该高效处理大量数据', () => {
      const startTime = Date.now();

      // 创建1000个Context对象
      const contexts = Array.from({ length: 1000 }, (_, i) => ({
        contextId: `ctx-${i}`,
        name: `Context ${i}`,
        lifecycleStage: 'active',
        status: 'running',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // 批量转换
      const schemas = ContextMapper.toSchemaArray(contexts as any);
      const backToEntities = ContextMapper.fromSchemaArray(schemas);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证结果正确性
      expect(schemas).toHaveLength(1000);
      expect(backToEntities).toHaveLength(1000);
      expect(schemas[0].context_id).toBe('ctx-0');
      expect(backToEntities[0].contextId).toBe('ctx-0');

      // 性能要求：1000个对象的双向转换应在100ms内完成
      expect(duration).toBeLessThan(100);
    });
  });

  describe('数据一致性验证', () => {
    it('应该保证双向转换的数据一致性', () => {
      const originalData = {
        contextId: 'consistency-test',
        name: 'Consistency Test Context',
        description: 'Testing data consistency',
        lifecycleStage: 'active',
        status: 'running',
        createdAt: new Date('2025-08-09T10:00:00Z'),
        updatedAt: new Date('2025-08-09T11:00:00Z'),
        sessionIds: ['session-1', 'session-2'],
        sharedStateIds: ['state-1'],
        configuration: { 
          key1: 'value1',
          key2: 42,
          key3: true
        },
        metadata: { 
          test: true,
          number: 123,
          nested: { deep: 'value' }
        }
      };

      // 双向转换
      const schema = ContextMapper.toSchema(originalData as any);
      const restored = ContextMapper.fromSchema(schema);

      // 验证关键字段一致性
      expect(restored.contextId).toBe(originalData.contextId);
      expect(restored.name).toBe(originalData.name);
      expect(restored.description).toBe(originalData.description);
      expect(restored.lifecycleStage).toBe(originalData.lifecycleStage);
      expect(restored.status).toBe(originalData.status);
      expect(restored.createdAt).toEqual(originalData.createdAt);
      expect(restored.updatedAt).toEqual(originalData.updatedAt);
      expect(restored.sessionIds).toEqual(originalData.sessionIds);
      expect(restored.sharedStateIds).toEqual(originalData.sharedStateIds);
      expect(restored.configuration).toEqual(originalData.configuration);
      expect(restored.metadata).toEqual(originalData.metadata);
    });
  });
});
