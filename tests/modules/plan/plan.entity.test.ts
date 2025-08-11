/**
 * Plan实体单元测试
 *
 * 基于Schema驱动测试原则，测试Plan实体的所有领域行为
 * 确保100%分支覆盖，发现并修复源代码问题
 *
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanConfiguration, createDefaultPlanConfiguration } from '../../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { UUID, PlanStatus, ExecutionStrategy, Priority } from '../../../src/public/shared/types/plan-types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Plan Entity', () => {
  let planData: any;

  beforeEach(() => {
    planData = TestDataFactory.Plan.createPlanData();
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Plan实例', async () => {
      // 基于实际Schema创建测试数据
      const planParams = {
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan',
        description: 'Test plan description',
        status: 'active' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['Goal 1', 'Goal 2'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential' as ExecutionStrategy,
        priority: 'medium' as Priority,
        estimated_duration: { value: 60, unit: 'minutes' },
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration(),
        metadata: { created_by: 'test' }
      };

      // 执行测试
      const plan = await TestHelpers.Performance.expectExecutionTime(
        () => new Plan(planParams),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果 - 基于实际getter方法
      expect(plan.plan_id).toBe(planParams.plan_id);
      expect(plan.context_id).toBe(planParams.context_id);
      expect(plan.name).toBe(planParams.name);
      expect(plan.description).toBe(planParams.description);
      expect(plan.status).toBe(planParams.status);
      expect(plan.version).toBe(planParams.version);
      expect(plan.goals).toEqual(planParams.goals);
      expect(plan.tasks).toEqual(planParams.tasks);
      expect(plan.dependencies).toEqual(planParams.dependencies);
      expect(plan.execution_strategy).toBe(planParams.execution_strategy);
      expect(plan.priority).toBe(planParams.priority);
      expect(plan.estimated_duration).toEqual(planParams.estimated_duration);
      expect(plan.progress.completed_tasks).toBe(planParams.progress.completed_tasks);
      expect(plan.progress.total_tasks).toBe(planParams.progress.total_tasks);
      expect(plan.progress.percentage).toBe(planParams.progress.percentage);
      expect(plan.configuration).toEqual(planParams.configuration);
      expect(plan.metadata).toEqual(planParams.metadata);
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '空字符串名称',
          input: { name: '', description: planData.description },
          expectedError: 'Plan name is required'
        },
        {
          name: '超长名称',
          input: { name: 'a'.repeat(10000), description: planData.description },
          expectedError: undefined
        },
        {
          name: '空描述',
          input: { name: planData.name, description: '' },
          expectedError: undefined
        }
      ];

      for (const test of boundaryTests) {
        if (test.expectedError) {
          // 测试应该抛出错误的情况
          expect(() => {
            new Plan({
              plan_id: planData.plan_id,
              context_id: planData.context_id,
              name: test.input.name,
              description: test.input.description,
              status: 'active' as PlanStatus,
              version: '1.0.0',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              goals: planData.goals,
              tasks: planData.tasks,
              dependencies: planData.dependencies,
              execution_strategy: planData.execution_strategy,
              priority: planData.priority,
              estimated_duration: planData.estimated_duration,
              progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
              configuration: planData.configuration,
              metadata: planData.metadata
            });
          }).toThrow(test.expectedError);
        } else {
          // 测试应该成功的情况
          const plan = new Plan({
            plan_id: planData.plan_id,
            context_id: planData.context_id,
            name: test.input.name,
            description: test.input.description,
            status: 'active' as PlanStatus,
            version: '1.0.0',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            goals: planData.goals,
            tasks: planData.tasks,
            dependencies: planData.dependencies,
            execution_strategy: planData.execution_strategy,
            priority: planData.priority,
            estimated_duration: planData.estimated_duration,
            progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
            configuration: planData.configuration,
            metadata: planData.metadata
          });

          expect(plan.name).toBe(test.input.name);
          expect(plan.description).toBe(test.input.description);
        }
      }
    });
  });

  describe('状态检查', () => {
    it('应该正确识别不同状态', () => {
      const statusTests = [
        { status: 'active' as PlanStatus, expected: 'active' as PlanStatus },
        { status: 'paused' as PlanStatus, expected: 'paused' as PlanStatus },
        { status: 'completed' as PlanStatus, expected: 'completed' as PlanStatus }
      ];

      statusTests.forEach(({ status, expected }) => {
        const plan = new Plan({
          plan_id: planData.plan_id,
          context_id: planData.context_id,
          name: planData.name,
          description: planData.description,
          status: status,
          version: '1.0.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          goals: planData.goals,
          tasks: planData.tasks,
          dependencies: planData.dependencies,
          execution_strategy: planData.execution_strategy,
          priority: planData.priority,
          estimated_duration: planData.estimated_duration,
          progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
          configuration: planData.configuration,
          metadata: planData.metadata
        });

        expect(plan.status).toBe(expected);
      });
    });
  });
});
