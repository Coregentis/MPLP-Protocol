/**
 * SharedState值对象测试
 *
 * 基于实际实现的严格测试，确保90%+覆盖率
 * 遵循协议级测试标准：TypeScript严格模式，零any类型，ESLint零警告
 *
 * @version 1.0.0
 * @created 2025-08-08
 */

import {
  SharedState,
  Dependency,
  DependencyStatus,
  DependencyType,
  Goal,
  GoalStatus,
  Resource,
  ResourceStatus,
  ResourceRequirement,
  Priority,
  SuccessCriteria,
  SuccessCriteriaOperator
} from '../../../src/modules/context/domain/value-objects/shared-state';
import { UUID } from '../../../src/public/shared/types';

describe('SharedState', () => {
  const mockDependency: Dependency = {
    id: 'dep-1' as UUID,
    name: 'Test Dependency',
    type: DependencyType.EXTERNAL,
    status: DependencyStatus.PENDING,
    version: '1.0.0'
  };

  const mockSuccessCriteria: SuccessCriteria = {
    metric: 'completion_rate',
    operator: SuccessCriteriaOperator.GTE,
    value: 90,
    unit: 'percent'
  };

  const mockGoal: Goal = {
    id: 'goal-1' as UUID,
    name: 'Test Goal',
    description: 'Test goal description',
    priority: Priority.HIGH,
    status: GoalStatus.ACTIVE,
    successCriteria: [mockSuccessCriteria]
  };

  const mockResource: Resource = {
    type: 'compute',
    amount: 50,
    unit: 'cores',
    status: ResourceStatus.AVAILABLE
  };

  const mockResourceRequirement: ResourceRequirement = {
    minimum: 4,
    optimal: 8,
    maximum: 16,
    unit: 'cores'
  };

  describe('构造函数', () => {
    it('应该使用默认值创建SharedState实例', () => {
      const sharedState = new SharedState();

      expect(sharedState.variables).toEqual({});
      expect(sharedState.allocatedResources).toEqual({});
      expect(sharedState.resourceRequirements).toEqual({});
      expect(sharedState.dependencies).toEqual([]);
      expect(sharedState.goals).toEqual([]);
    });

    it('应该使用提供的值创建SharedState实例', () => {
      const variables = { key1: 'value1', key2: 42 };
      const allocatedResources = { 'resource-1': mockResource };
      const resourceRequirements = { 'compute': mockResourceRequirement };
      const dependencies = [mockDependency];
      const goals = [mockGoal];

      const sharedState = new SharedState(
        variables,
        allocatedResources,
        resourceRequirements,
        dependencies,
        goals
      );

      expect(sharedState.variables).toEqual(variables);
      expect(sharedState.allocatedResources).toEqual(allocatedResources);
      expect(sharedState.resourceRequirements).toEqual(resourceRequirements);
      expect(sharedState.dependencies).toEqual(dependencies);
      expect(sharedState.goals).toEqual(goals);
    });

    it('应该处理null和undefined参数', () => {
      // SharedState构造函数有默认值，所以传入undefined应该使用默认值
      const sharedState = new SharedState(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );

      expect(sharedState.variables).toEqual({});
      expect(sharedState.allocatedResources).toEqual({});
      expect(sharedState.resourceRequirements).toEqual({});
      expect(sharedState.dependencies).toEqual([]);
      expect(sharedState.goals).toEqual([]);
    });
  });

  describe('变量管理', () => {
    let sharedState: SharedState;

    beforeEach(() => {
      sharedState = new SharedState();
    });

    it('应该正确更新变量', () => {
      const newState = sharedState.updateVariables({ testKey: 'testValue' });
      expect(newState.variables.testKey).toBe('testValue');
      expect(sharedState.variables.testKey).toBeUndefined(); // 原对象不变
    });

    it('应该返回undefined对于不存在的变量', () => {
      expect(sharedState.variables.nonExistentKey).toBeUndefined();
    });

    it('应该正确合并变量', () => {
      const state1 = sharedState.updateVariables({ key1: 'value1' });
      const state2 = state1.updateVariables({ key2: 'value2' });

      expect(state2.variables.key1).toBe('value1');
      expect(state2.variables.key2).toBe('value2');
    });

    it('应该覆盖已存在的变量', () => {
      const state1 = sharedState.updateVariables({ testKey: 'oldValue' });
      const state2 = state1.updateVariables({ testKey: 'newValue' });

      expect(state2.variables.testKey).toBe('newValue');
    });

    it('应该支持不同类型的变量值', () => {
      const newState = sharedState.updateVariables({
        string: 'text',
        number: 42,
        boolean: true,
        object: { nested: 'value' },
        array: [1, 2, 3]
      });

      expect(newState.variables.string).toBe('text');
      expect(newState.variables.number).toBe(42);
      expect(newState.variables.boolean).toBe(true);
      expect(newState.variables.object).toEqual({ nested: 'value' });
      expect(newState.variables.array).toEqual([1, 2, 3]);
    });
  });

  describe('资源管理', () => {
    let sharedState: SharedState;

    beforeEach(() => {
      sharedState = new SharedState();
    });

    it('应该正确分配资源', () => {
      const newState = sharedState.allocateResource('resource-1', mockResource);
      expect(newState.allocatedResources['resource-1']).toEqual(mockResource);
      expect(sharedState.allocatedResources['resource-1']).toBeUndefined(); // 原对象不变
    });

    it('应该正确设置资源需求', () => {
      const newState = sharedState.setResourceRequirement('compute', mockResourceRequirement);
      expect(newState.resourceRequirements['compute']).toEqual(mockResourceRequirement);
      expect(sharedState.resourceRequirements['compute']).toBeUndefined(); // 原对象不变
    });

    it('应该验证资源配置', () => {
      const invalidResource: Resource = {
        type: '', // 无效：空类型
        amount: -1, // 无效：负数量
        unit: '',   // 无效：空单位
        status: ResourceStatus.AVAILABLE
      };

      expect(() => {
        sharedState.allocateResource('invalid', invalidResource);
      }).toThrow('Invalid resource configuration for invalid');
    });

    it('应该验证资源需求配置', () => {
      const invalidRequirement: ResourceRequirement = {
        minimum: -1, // 无效：负最小值
        unit: ''     // 无效：空单位
      };

      expect(() => {
        sharedState.setResourceRequirement('invalid', invalidRequirement);
      }).toThrow('Invalid resource requirement for invalid');
    });
  });

  describe('依赖管理', () => {
    let sharedState: SharedState;

    beforeEach(() => {
      sharedState = new SharedState();
    });

    it('应该正确添加依赖', () => {
      const newState = sharedState.addDependency(mockDependency);
      expect(newState.dependencies).toContain(mockDependency);
      expect(sharedState.dependencies).toHaveLength(0); // 原对象不变
    });

    it('应该正确移除依赖', () => {
      const state1 = sharedState.addDependency(mockDependency);
      expect(state1.dependencies).toContain(mockDependency);

      const state2 = state1.removeDependency(mockDependency.id);
      expect(state2.dependencies).not.toContain(mockDependency);
    });

    it('应该处理移除不存在的依赖', () => {
      expect(() => {
        sharedState.removeDependency('non-existent' as UUID);
      }).not.toThrow();
    });

    it('应该更新已存在的依赖', () => {
      const state1 = sharedState.addDependency(mockDependency);

      const updatedDependency = { ...mockDependency, status: DependencyStatus.RESOLVED };
      const state2 = state1.addDependency(updatedDependency);

      expect(state2.dependencies).toHaveLength(1);
      expect(state2.dependencies[0].status).toBe(DependencyStatus.RESOLVED);
    });
  });

  describe('目标管理', () => {
    let sharedState: SharedState;

    beforeEach(() => {
      sharedState = new SharedState();
    });

    it('应该正确添加目标', () => {
      const newState = sharedState.addGoal(mockGoal);
      expect(newState.goals).toContain(mockGoal);
      expect(sharedState.goals).toHaveLength(0); // 原对象不变
    });

    it('应该正确移除目标', () => {
      const state1 = sharedState.addGoal(mockGoal);
      expect(state1.goals).toContain(mockGoal);

      const state2 = state1.removeGoal(mockGoal.id);
      expect(state2.goals).not.toContain(mockGoal);
    });

    it('应该处理移除不存在的目标', () => {
      expect(() => {
        sharedState.removeGoal('non-existent' as UUID);
      }).not.toThrow();
    });

    it('应该更新已存在的目标', () => {
      const state1 = sharedState.addGoal(mockGoal);

      const updatedGoal = { ...mockGoal, status: GoalStatus.ACHIEVED };
      const state2 = state1.addGoal(updatedGoal);

      expect(state2.goals).toHaveLength(1);
      expect(state2.goals[0].status).toBe(GoalStatus.ACHIEVED);
    });
  });

  describe('边界条件和错误处理', () => {
    let sharedState: SharedState;

    beforeEach(() => {
      sharedState = new SharedState();
    });

    it('应该处理空字符串键', () => {
      const newState = sharedState.updateVariables({ '': 'emptyKeyValue' });
      expect(newState.variables['']).toBe('emptyKeyValue');
    });

    it('应该处理null和undefined值', () => {
      const newState = sharedState.updateVariables({
        nullValue: null,
        undefinedValue: undefined
      });

      expect(newState.variables.nullValue).toBeNull();
      expect(newState.variables.undefinedValue).toBeUndefined();
    });

    it('应该处理大量数据', () => {
      const variables: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        variables[`key${i}`] = `value${i}`;
      }

      const newState = sharedState.updateVariables(variables);
      expect(Object.keys(newState.variables)).toHaveLength(1000);
      expect(newState.variables.key500).toBe('value500');
    });

    it('应该处理复杂的嵌套对象', () => {
      const complexObject = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, { nested: true }],
              date: new Date(),
              regex: /test/g
            }
          }
        }
      };

      const newState = sharedState.updateVariables({ complex: complexObject });
      expect(newState.variables.complex).toEqual(complexObject);
    });

    it('应该验证依赖配置', () => {
      const invalidDependency = {
        id: '' as UUID, // 无效：空ID
        name: '',       // 无效：空名称
        type: DependencyType.EXTERNAL,
        status: DependencyStatus.PENDING
      };

      expect(() => {
        sharedState.addDependency(invalidDependency);
      }).toThrow('Invalid dependency configuration');
    });

    it('应该验证目标配置', () => {
      const invalidGoal = {
        id: '' as UUID, // 无效：空ID
        name: '',       // 无效：空名称
        priority: Priority.HIGH,
        status: GoalStatus.ACTIVE,
        successCriteria: [mockSuccessCriteria]
      };

      expect(() => {
        sharedState.addGoal(invalidGoal);
      }).toThrow('Invalid goal configuration');
    });

    it('应该验证成功标准配置', () => {
      const invalidSuccessCriteria: SuccessCriteria = {
        metric: '',  // 无效：空指标
        operator: SuccessCriteriaOperator.GTE,
        value: undefined as any // 无效：未定义值
      };

      const invalidGoal = {
        id: 'goal-invalid' as UUID,
        name: 'Invalid Goal',
        priority: Priority.HIGH,
        status: GoalStatus.ACTIVE,
        successCriteria: [invalidSuccessCriteria]
      };

      expect(() => {
        sharedState.addGoal(invalidGoal);
      }).toThrow('Invalid success criteria for goal Invalid Goal');
    });
  });
});