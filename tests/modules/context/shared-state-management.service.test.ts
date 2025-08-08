/**
 * 共享状态管理服务单元测试
 * 
 * 测试SharedStateManagementService的核心功能
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { SharedStateManagementService } from '../../../src/modules/context/application/services/shared-state-management.service';
import {
  SharedState,
  Resource,
  ResourceRequirement,
  Dependency,
  Goal,
  ResourceStatus,
  DependencyStatus,
  DependencyType,
  GoalStatus,
  Priority,
  SuccessCriteriaOperator
} from '../../../src/modules/context/domain/value-objects/shared-state';

describe('SharedStateManagementService', () => {
  let service: SharedStateManagementService;

  beforeEach(() => {
    service = new SharedStateManagementService();
  });

  describe('createSharedState', () => {
    it('should create a new shared state with default values', () => {
      const sharedState = service.createSharedState();

      expect(sharedState).toBeInstanceOf(SharedState);
      expect(sharedState.variables).toEqual({});
      expect(sharedState.allocatedResources).toEqual({});
      expect(sharedState.resourceRequirements).toEqual({});
      expect(sharedState.dependencies).toEqual([]);
      expect(sharedState.goals).toEqual([]);
    });

    it('should create a new shared state with provided values', () => {
      const variables = { key1: 'value1', key2: 42 };
      const resources = {
        cpu: {
          type: 'cpu',
          amount: 4,
          unit: 'cores',
          status: ResourceStatus.AVAILABLE
        }
      };

      const sharedState = service.createSharedState(variables, resources);

      expect(sharedState.variables).toEqual(variables);
      expect(sharedState.allocatedResources).toEqual(resources);
    });
  });

  describe('updateVariables', () => {
    it('should update shared variables', () => {
      const initialState = service.createSharedState({ key1: 'value1' });
      const updates = { key2: 'value2', key3: 123 };

      const updatedState = service.updateVariables(initialState, updates);

      expect(updatedState.variables).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 123
      });
    });

    it('should overwrite existing variables', () => {
      const initialState = service.createSharedState({ key1: 'oldValue' });
      const updates = { key1: 'newValue' };

      const updatedState = service.updateVariables(initialState, updates);

      expect(updatedState.variables.key1).toBe('newValue');
    });
  });

  describe('allocateResource', () => {
    it('should allocate a new resource', () => {
      const initialState = service.createSharedState();
      const resource: Resource = {
        type: 'memory',
        amount: 8,
        unit: 'GB',
        status: ResourceStatus.ALLOCATED
      };

      const updatedState = service.allocateResource(initialState, 'memory', resource);

      expect(updatedState.allocatedResources.memory).toEqual(resource);
    });

    it('should validate resource allocation against requirements', () => {
      const requirements = {
        memory: {
          minimum: 4,
          optimal: 8,
          maximum: 16,
          unit: 'GB'
        }
      };
      const initialState = service.createSharedState({}, {}, requirements);
      
      const validResource: Resource = {
        type: 'memory',
        amount: 8,
        unit: 'GB',
        status: ResourceStatus.ALLOCATED
      };

      expect(() => {
        service.allocateResource(initialState, 'memory', validResource);
      }).not.toThrow();
    });

    it('should throw error when allocation is below minimum requirement', () => {
      const requirements = {
        memory: {
          minimum: 4,
          unit: 'GB'
        }
      };
      const initialState = service.createSharedState({}, {}, requirements);
      
      const invalidResource: Resource = {
        type: 'memory',
        amount: 2,
        unit: 'GB',
        status: ResourceStatus.ALLOCATED
      };

      expect(() => {
        service.allocateResource(initialState, 'memory', invalidResource);
      }).toThrow('Resource allocation 2 is below minimum requirement 4');
    });

    it('should throw error when allocation exceeds maximum limit', () => {
      const requirements = {
        memory: {
          minimum: 4,
          maximum: 16,
          unit: 'GB'
        }
      };
      const initialState = service.createSharedState({}, {}, requirements);
      
      const invalidResource: Resource = {
        type: 'memory',
        amount: 32,
        unit: 'GB',
        status: ResourceStatus.ALLOCATED
      };

      expect(() => {
        service.allocateResource(initialState, 'memory', invalidResource);
      }).toThrow('Resource allocation 32 exceeds maximum limit 16');
    });
  });

  describe('setResourceRequirement', () => {
    it('should set a new resource requirement', () => {
      const initialState = service.createSharedState();
      const requirement: ResourceRequirement = {
        minimum: 2,
        optimal: 4,
        maximum: 8,
        unit: 'cores'
      };

      const updatedState = service.setResourceRequirement(initialState, 'cpu', requirement);

      expect(updatedState.resourceRequirements.cpu).toEqual(requirement);
    });
  });

  describe('addDependency', () => {
    it('should add a new dependency', () => {
      const initialState = service.createSharedState();
      const dependency: Dependency = {
        id: 'dep-1',
        type: DependencyType.CONTEXT,
        name: 'Test Dependency',
        version: '1.0.0',
        status: DependencyStatus.PENDING
      };

      const updatedState = service.addDependency(initialState, dependency);

      expect(updatedState.dependencies).toContain(dependency);
    });

    it('should update existing dependency', () => {
      const dependency: Dependency = {
        id: 'dep-1',
        type: DependencyType.CONTEXT,
        name: 'Test Dependency',
        status: DependencyStatus.PENDING
      };
      const initialState = service.createSharedState({}, {}, {}, [dependency]);

      const updatedDependency: Dependency = {
        ...dependency,
        status: DependencyStatus.RESOLVED
      };

      const updatedState = service.addDependency(initialState, updatedDependency);

      expect(updatedState.dependencies.find(d => d.id === 'dep-1')?.status)
        .toBe(DependencyStatus.RESOLVED);
    });
  });

  describe('updateDependencyStatus', () => {
    it('should update dependency status', () => {
      const dependency: Dependency = {
        id: 'dep-1',
        type: DependencyType.CONTEXT,
        name: 'Test Dependency',
        status: DependencyStatus.PENDING
      };
      const initialState = service.createSharedState({}, {}, {}, [dependency]);

      const updatedState = service.updateDependencyStatus(
        initialState, 
        'dep-1', 
        DependencyStatus.RESOLVED
      );

      expect(updatedState.dependencies.find(d => d.id === 'dep-1')?.status)
        .toBe(DependencyStatus.RESOLVED);
    });

    it('should throw error when dependency not found', () => {
      const initialState = service.createSharedState();

      expect(() => {
        service.updateDependencyStatus(initialState, 'non-existent', DependencyStatus.RESOLVED);
      }).toThrow('Dependency non-existent not found');
    });
  });

  describe('addGoal', () => {
    it('should add a new goal', () => {
      const initialState = service.createSharedState();
      const goal: Goal = {
        id: 'goal-1',
        name: 'Test Goal',
        description: 'A test goal',
        priority: Priority.HIGH,
        status: GoalStatus.DEFINED,
        successCriteria: [{
          metric: 'completion',
          operator: SuccessCriteriaOperator.EQ,
          value: true
        }]
      };

      const updatedState = service.addGoal(initialState, goal);

      expect(updatedState.goals).toContain(goal);
    });
  });

  describe('updateGoalStatus', () => {
    it('should update goal status', () => {
      const goal: Goal = {
        id: 'goal-1',
        name: 'Test Goal',
        priority: Priority.MEDIUM,
        status: GoalStatus.DEFINED,
        successCriteria: []
      };
      const initialState = service.createSharedState({}, {}, {}, [], [goal]);

      const updatedState = service.updateGoalStatus(
        initialState, 
        'goal-1', 
        GoalStatus.ACHIEVED
      );

      expect(updatedState.goals.find(g => g.id === 'goal-1')?.status)
        .toBe(GoalStatus.ACHIEVED);
    });
  });

  describe('utility methods', () => {
    it('should check resource availability', () => {
      const resources = {
        memory: {
          type: 'memory',
          amount: 8,
          unit: 'GB',
          status: ResourceStatus.AVAILABLE
        }
      };
      const state = service.createSharedState({}, resources);

      const isAvailable = service.checkResourceAvailability(state, 'memory');

      expect(isAvailable).toBe(true);
    });

    it('should check dependency resolution', () => {
      const dependency: Dependency = {
        id: 'dep-1',
        type: DependencyType.CONTEXT,
        name: 'Test Dependency',
        status: DependencyStatus.RESOLVED
      };
      const state = service.createSharedState({}, {}, {}, [dependency]);

      const isResolved = service.checkDependencyResolved(state, 'dep-1');

      expect(isResolved).toBe(true);
    });

    it('should check goal achievement', () => {
      const goal: Goal = {
        id: 'goal-1',
        name: 'Test Goal',
        priority: Priority.MEDIUM,
        status: GoalStatus.ACHIEVED,
        successCriteria: []
      };
      const state = service.createSharedState({}, {}, {}, [], [goal]);

      const isAchieved = service.checkGoalAchieved(state, 'goal-1');

      expect(isAchieved).toBe(true);
    });

    it('should get high priority goals', () => {
      const goals: Goal[] = [
        {
          id: 'goal-1',
          name: 'Low Priority Goal',
          priority: Priority.LOW,
          status: GoalStatus.DEFINED,
          successCriteria: []
        },
        {
          id: 'goal-2',
          name: 'High Priority Goal',
          priority: Priority.HIGH,
          status: GoalStatus.ACTIVE,
          successCriteria: []
        },
        {
          id: 'goal-3',
          name: 'Critical Goal',
          priority: Priority.CRITICAL,
          status: GoalStatus.DEFINED,
          successCriteria: []
        }
      ];
      const state = service.createSharedState({}, {}, {}, [], goals);

      const highPriorityGoals = service.getHighPriorityGoals(state);

      expect(highPriorityGoals).toHaveLength(2);
      expect(highPriorityGoals.map(g => g.id)).toEqual(['goal-2', 'goal-3']);
    });

    it('should get unresolved dependencies', () => {
      const dependencies: Dependency[] = [
        {
          id: 'dep-1',
          type: DependencyType.CONTEXT,
          name: 'Resolved Dependency',
          status: DependencyStatus.RESOLVED
        },
        {
          id: 'dep-2',
          type: DependencyType.PLAN,
          name: 'Pending Dependency',
          status: DependencyStatus.PENDING
        },
        {
          id: 'dep-3',
          type: DependencyType.EXTERNAL,
          name: 'Failed Dependency',
          status: DependencyStatus.FAILED
        }
      ];
      const state = service.createSharedState({}, {}, {}, dependencies);

      const unresolvedDeps = service.getUnresolvedDependencies(state);

      expect(unresolvedDeps).toHaveLength(2);
      expect(unresolvedDeps.map(d => d.id)).toEqual(['dep-2', 'dep-3']);
    });
  });
});
