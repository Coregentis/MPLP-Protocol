/**
 * Plan API Mapper测试
 * 
 * 测试src/modules/plan/api/mappers/plan.mapper.ts
 * 验证Schema-TypeScript双重命名约定映射的正确性
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { PlanMapper, PlanSchema, PlanEntityData } from '../../../src/modules/plan/api/mappers/plan.mapper';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, Priority, ExecutionStrategy } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('Plan API Mapper', () => {
  describe('Schema Validation', () => {
    it('should validate correct schema data', () => {
      const validSchema: PlanSchema = {
        plan_id: uuidv4(),
        context_id: uuidv4(),
        name: 'Test Plan',
        description: 'Test description',
        goals: ['Goal 1', 'Goal 2'],
        execution_strategy: 'sequential',
        priority: 'medium',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'test-user'
      };

      const isValid = PlanMapper.validateSchema(validSchema);
      expect(isValid).toBe(true);
    });

    it('should reject invalid schema data', () => {
      const invalidSchema = {
        plan_id: uuidv4(),
        // missing required fields
        name: 'Test Plan'
      };

      const isValid = PlanMapper.validateSchema(invalidSchema);
      expect(isValid).toBe(false);
    });

    it('should reject non-object data', () => {
      expect(PlanMapper.validateSchema(null)).toBe(false);
      expect(PlanMapper.validateSchema(undefined)).toBe(false);
      expect(PlanMapper.validateSchema('string')).toBe(false);
      expect(PlanMapper.validateSchema(123)).toBe(false);
    });
  });

  describe('Schema to TypeScript Conversion', () => {
    it('should convert schema to TypeScript data correctly', () => {
      const schema: PlanSchema = {
        plan_id: 'plan-123',
        context_id: 'context-456',
        name: 'Test Plan',
        description: 'Test description',
        goals: ['Goal 1', 'Goal 2'],
        execution_strategy: 'sequential',
        priority: 'medium',
        status: 'draft',
        created_at: '2025-08-17T10:00:00Z',
        updated_at: '2025-08-17T11:00:00Z',
        created_by: 'test-user',
        tasks: [{
          task_id: 'task-1',
          name: 'Task 1',
          description: 'Task description',
          dependencies: ['task-0'],
          estimated_effort: {
            value: 3600,
            unit: 'seconds'
          },
          priority: 'high',
          status: 'pending',
          assigned_agents: ['agent-1'],
          created_by: 'test-user'
        }],
        estimated_duration: {
          value: 7200,
          unit: 'seconds'
        }
      };

      const result = PlanMapper.fromSchema(schema);

      expect(result.planId).toBe('plan-123');
      expect(result.contextId).toBe('context-456');
      expect(result.name).toBe('Test Plan');
      expect(result.description).toBe('Test description');
      expect(result.goals).toEqual(['Goal 1', 'Goal 2']);
      expect(result.executionStrategy).toBe('sequential');
      expect(result.priority).toBe('medium');
      expect(result.status).toBe('draft');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdBy).toBe('test-user');
      
      // 验证tasks转换
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks![0].taskId).toBe('task-1');
      expect(result.tasks![0].name).toBe('Task 1');
      expect(result.tasks![0].dependencies).toEqual(['task-0']);
      expect(result.tasks![0].estimatedDuration).toBe(3600);
      
      // 验证estimated_duration转换
      expect(result.estimatedDuration).toEqual({
        value: 7200,
        unit: 'seconds'
      });
    });

    it('should handle optional fields correctly', () => {
      const minimalSchema: PlanSchema = {
        plan_id: 'plan-123',
        context_id: 'context-456',
        name: 'Minimal Plan',
        goals: ['Goal 1'],
        execution_strategy: 'sequential',
        priority: 'medium',
        status: 'draft',
        created_at: '2025-08-17T10:00:00Z',
        updated_at: '2025-08-17T11:00:00Z',
        created_by: 'test-user'
      };

      const result = PlanMapper.fromSchema(minimalSchema);

      expect(result.planId).toBe('plan-123');
      expect(result.name).toBe('Minimal Plan');
      expect(result.description).toBeUndefined();
      expect(result.tasks).toBeUndefined();
      expect(result.estimatedDuration).toBeUndefined();
    });
  });

  describe('TypeScript to Schema Conversion', () => {
    it('should convert Plan entity to schema correctly', () => {
      // 创建测试Plan实体
      const plan = new Plan({
        planId: 'plan-123',
        contextId: 'context-456',
        name: 'Test Plan',
        description: 'Test description',
        goals: ['Goal 1', 'Goal 2'],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        status: PlanStatus.DRAFT,
        createdBy: 'test-user',
        tasks: [{
          taskId: 'task-1',
          name: 'Task 1',
          description: 'Task description',
          dependencies: ['task-0'],
          estimatedDuration: {
            value: 3600,
            unit: 'seconds'
          },
          priority: Priority.HIGH,
          status: PlanStatus.PENDING,
          assignedAgents: ['agent-1'],
          createdBy: 'test-user'
        }],
        estimatedDuration: {
          value: 7200,
          unit: 'seconds'
        }
      });

      const result = PlanMapper.toSchema(plan);

      expect(result.plan_id).toBe('plan-123');
      expect(result.context_id).toBe('context-456');
      expect(result.name).toBe('Test Plan');
      expect(result.description).toBe('Test description');
      expect(result.goals).toEqual(['Goal 1', 'Goal 2']);
      expect(result.execution_strategy).toBe('sequential');
      expect(result.priority).toBe('medium');
      expect(result.status).toBe('draft');
      expect(result.created_by).toBe('test-user');
      
      // 验证tasks转换
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks![0].task_id).toBe('task-1');
      expect(result.tasks![0].name).toBe('Task 1');
      expect(result.tasks![0].dependencies).toEqual(['task-0']);
      expect(result.tasks![0].estimated_effort).toEqual({
        value: 3600,
        unit: 'seconds'
      });
      
      // 验证estimated_duration转换
      expect(result.estimated_duration).toEqual({
        value: 7200,
        unit: 'seconds'
      });
    });
  });

  describe('Batch Conversion', () => {
    it('should convert array of entities to schema array', () => {
      const plans = [
        new Plan({
          planId: 'plan-1',
          contextId: 'context-1',
          name: 'Plan 1',
          goals: ['Goal 1'],
          executionStrategy: ExecutionStrategy.SEQUENTIAL,
          priority: Priority.MEDIUM,
          status: PlanStatus.DRAFT,
          createdBy: 'user-1'
        }),
        new Plan({
          planId: 'plan-2',
          contextId: 'context-2',
          name: 'Plan 2',
          goals: ['Goal 2'],
          executionStrategy: ExecutionStrategy.PARALLEL,
          priority: Priority.HIGH,
          status: PlanStatus.ACTIVE,
          createdBy: 'user-2'
        })
      ];

      const result = PlanMapper.toSchemaArray(plans);

      expect(result).toHaveLength(2);
      expect(result[0].plan_id).toBe('plan-1');
      expect(result[0].name).toBe('Plan 1');
      expect(result[1].plan_id).toBe('plan-2');
      expect(result[1].name).toBe('Plan 2');
    });

    it('should convert array of schemas to TypeScript data array', () => {
      const schemas: PlanSchema[] = [
        {
          plan_id: 'plan-1',
          context_id: 'context-1',
          name: 'Plan 1',
          goals: ['Goal 1'],
          execution_strategy: 'sequential',
          priority: 'medium',
          status: 'draft',
          created_at: '2025-08-17T10:00:00Z',
          updated_at: '2025-08-17T11:00:00Z',
          created_by: 'user-1'
        },
        {
          plan_id: 'plan-2',
          context_id: 'context-2',
          name: 'Plan 2',
          goals: ['Goal 2'],
          execution_strategy: 'parallel',
          priority: 'high',
          status: 'active',
          created_at: '2025-08-17T10:00:00Z',
          updated_at: '2025-08-17T11:00:00Z',
          created_by: 'user-2'
        }
      ];

      const result = PlanMapper.fromSchemaArray(schemas);

      expect(result).toHaveLength(2);
      expect(result[0].planId).toBe('plan-1');
      expect(result[0].name).toBe('Plan 1');
      expect(result[1].planId).toBe('plan-2');
      expect(result[1].name).toBe('Plan 2');
    });
  });

  describe('Dual Naming Convention Compliance', () => {
    it('should maintain 100% mapping consistency', () => {
      const originalData: PlanEntityData = {
        planId: 'plan-123',
        contextId: 'context-456',
        name: 'Consistency Test',
        goals: ['Goal 1'],
        executionStrategy: 'sequential',
        priority: 'medium',
        status: 'draft',
        createdAt: new Date('2025-08-17T10:00:00Z'),
        updatedAt: new Date('2025-08-17T11:00:00Z'),
        createdBy: 'test-user'
      };

      // 创建Plan实体
      const plan = new Plan(originalData);
      
      // 转换为Schema
      const schema = PlanMapper.toSchema(plan);
      
      // 再转换回TypeScript数据
      const convertedData = PlanMapper.fromSchema(schema);

      // 验证关键字段的一致性
      expect(convertedData.planId).toBe(originalData.planId);
      expect(convertedData.contextId).toBe(originalData.contextId);
      expect(convertedData.name).toBe(originalData.name);
      expect(convertedData.executionStrategy).toBe(originalData.executionStrategy);
      expect(convertedData.priority).toBe(originalData.priority);
      expect(convertedData.status).toBe(originalData.status);
      expect(convertedData.createdBy).toBe(originalData.createdBy);
    });
  });
});
