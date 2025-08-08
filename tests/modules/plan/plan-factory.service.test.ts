/**
 * PlanFactoryService单元测试
 * 基于实际实现的Schema驱动测试，确保100%分支覆盖
 * 测试目的：发现并修复源代码问题，确保生产环境稳定运行
 */

import { PlanFactoryService } from '../../../src/modules/plan/domain/services/plan-factory.service';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { createDefaultPlanConfiguration } from '../../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { UUID, PlanStatus, ExecutionStrategy, Priority, TaskStatus } from '../../../src/public/shared/types/plan-types';
import { v4 as uuidv4 } from 'uuid';

describe('PlanFactoryService', () => {
  let planFactoryService: PlanFactoryService;

  beforeEach(() => {
    planFactoryService = new PlanFactoryService();
  });

  describe('createPlan - 基于实际API', () => {
    it('应该成功创建Plan实例 - 最小参数', () => {
      const contextId = uuidv4();
      const planParams = {
        contextId,
        name: 'Test Plan',
        description: 'Test plan description'
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan).toBeInstanceOf(Plan);
      expect(plan.planId).toBeDefined();
      expect(plan.contextId).toBe(contextId);
      expect(plan.name).toBe('Test Plan');
      expect(plan.description).toBe('Test plan description');
    });

    it('应该生成UUID当planId未提供时', () => {
      const planParams = {
        contextId: uuidv4(),
        name: 'Test Plan Without ID',
        description: 'Test plan description'
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.planId).toBeDefined();
      expect(plan.planId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('应该设置正确的默认值', () => {
      const planParams = {
        contextId: uuidv4(),
        name: 'Minimal Plan',
        description: 'Minimal description'
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.planId).toBeDefined();
      expect(plan.contextId).toBeDefined();
      expect(plan.name).toBe('Minimal Plan');
      expect(plan.description).toBe('Minimal description');
      expect(plan.createdAt).toBeDefined();
      expect(plan.updatedAt).toBeDefined();
    });

    it('应该处理完整参数', () => {
      const planId = uuidv4();
      const contextId = uuidv4();
      
      const planParams = {
        planId,
        contextId,
        name: 'Complete Test Plan',
        description: 'Complete test plan description',
        goals: ['Goal 1', 'Goal 2'],
        tasks: [],
        dependencies: [],
        configuration: createDefaultPlanConfiguration(),
        metadata: { created_by: 'test' }
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.planId).toBe(planId);
      expect(plan.contextId).toBe(contextId);
      expect(plan.name).toBe('Complete Test Plan');
      expect(plan.goals).toEqual(['Goal 1', 'Goal 2']);
      expect(plan.metadata).toEqual({ created_by: 'test' });
    });

    it('应该处理大量目标', () => {
      const manyGoals = Array.from({ length: 50 }, (_, i) => `Goal ${i + 1}`);
      const planParams = {
        contextId: uuidv4(),
        name: 'Many Goals Plan',
        description: 'Plan with many goals',
        goals: manyGoals
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.goals).toEqual(manyGoals);
      expect(plan.goals.length).toBe(50);
    });

    it('应该处理复杂的元数据', () => {
      const complexMetadata = {
        created_by: 'test_user',
        department: 'engineering',
        tags: ['urgent', 'high-priority'],
        custom_fields: {
          budget: 10000,
          deadline: '2025-12-31'
        }
      };

      const planParams = {
        contextId: uuidv4(),
        name: 'Complex Metadata Plan',
        description: 'Plan with complex metadata',
        metadata: complexMetadata
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.metadata).toEqual(complexMetadata);
    });

    it('应该处理空数组参数', () => {
      const planParams = {
        contextId: uuidv4(),
        name: 'Empty Arrays Plan',
        description: 'Plan with empty arrays',
        goals: [],
        tasks: [],
        dependencies: []
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.goals).toEqual([]);
      expect(plan.tasks).toEqual([]);
      expect(plan.dependencies).toEqual([]);
    });

    it('应该处理undefined值', () => {
      const planParams = {
        contextId: uuidv4(),
        name: 'Undefined Test Plan',
        description: undefined,
        goals: undefined,
        metadata: undefined
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.name).toBe('Undefined Test Plan');
      expect(plan.description).toBeUndefined();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理非常长的计划名称', () => {
      const longName = 'A'.repeat(500);
      const planParams = {
        contextId: uuidv4(),
        name: longName,
        description: 'Long name test'
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.name).toBe(longName);
    });

    it('应该处理特殊字符', () => {
      const specialChars = '特殊字符测试 !@#$%^&*()_+-=[]{}|;:,.<>?';
      const planParams = {
        contextId: uuidv4(),
        name: specialChars,
        description: specialChars
      };

      const plan = planFactoryService.createPlan(planParams);

      expect(plan.name).toBe(specialChars);
      expect(plan.description).toBe(specialChars);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内创建计划', () => {
      const planParams = {
        contextId: uuidv4(),
        name: 'Performance Test Plan',
        description: 'Performance test'
      };

      const startTime = performance.now();
      const plan = planFactoryService.createPlan(planParams);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
      expect(plan).toBeInstanceOf(Plan);
    });

    it('应该高效处理批量创建', () => {
      const batchSize = 50;
      const plans: Plan[] = [];

      const startTime = performance.now();
      
      for (let i = 0; i < batchSize; i++) {
        const planParams = {
          contextId: uuidv4(),
          name: `Batch Plan ${i + 1}`,
          description: `Batch plan ${i + 1}`
        };
        plans.push(planFactoryService.createPlan(planParams));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(plans.length).toBe(batchSize);
      expect(totalTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });

  describe('类型安全测试', () => {
    it('应该保持严格的TypeScript类型检查', () => {
      const planParams = {
        contextId: uuidv4(),
        name: 'Type Safety Test',
        description: 'Type safety test'
      };

      const plan = planFactoryService.createPlan(planParams);

      // TypeScript编译时会检查这些类型
      expect(typeof plan.planId).toBe('string');
      expect(typeof plan.contextId).toBe('string');
      expect(typeof plan.name).toBe('string');
    });
  });
});
