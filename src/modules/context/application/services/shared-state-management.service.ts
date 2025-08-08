/**
 * 共享状态管理服务
 * 
 * 应用服务，负责Context的共享状态管理
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../public/shared/types';
import { Logger } from '../../../../public/utils/logger';
import { 
  SharedState, 
  Resource, 
  ResourceRequirement, 
  Dependency, 
  Goal, 
  ResourceStatus,
  DependencyStatus,
  GoalStatus,
  Priority
} from '../../domain/value-objects/shared-state';

/**
 * 共享状态管理服务
 */
export class SharedStateManagementService {
  private readonly logger = new Logger('SharedStateManagementService');

  /**
   * 创建新的共享状态
   */
  createSharedState(
    variables: Record<string, unknown> = {},
    allocatedResources: Record<string, Resource> = {},
    resourceRequirements: Record<string, ResourceRequirement> = {},
    dependencies: Dependency[] = [],
    goals: Goal[] = []
  ): SharedState {
    try {
      this.logger.info('Creating new shared state', {
        variableCount: Object.keys(variables).length,
        resourceCount: Object.keys(allocatedResources).length,
        dependencyCount: dependencies.length,
        goalCount: goals.length
      });

      return new SharedState(
        variables,
        allocatedResources,
        resourceRequirements,
        dependencies,
        goals
      );
    } catch (error) {
      this.logger.error('Failed to create shared state', { error });
      throw error;
    }
  }

  /**
   * 更新共享变量
   */
  updateVariables(
    currentState: SharedState,
    updates: Record<string, unknown>
  ): SharedState {
    try {
      this.logger.info('Updating shared variables', {
        updateCount: Object.keys(updates).length,
        keys: Object.keys(updates)
      });

      return currentState.updateVariables(updates);
    } catch (error) {
      this.logger.error('Failed to update variables', { error, updates });
      throw error;
    }
  }

  /**
   * 分配资源
   */
  allocateResource(
    currentState: SharedState,
    resourceKey: string,
    resource: Resource
  ): SharedState {
    try {
      // 验证资源分配的合理性
      this.validateResourceAllocation(currentState, resourceKey, resource);

      this.logger.info('Allocating resource', {
        resourceKey,
        resourceType: resource.type,
        amount: resource.amount,
        unit: resource.unit
      });

      return currentState.allocateResource(resourceKey, resource);
    } catch (error) {
      this.logger.error('Failed to allocate resource', { 
        error, 
        resourceKey, 
        resource 
      });
      throw error;
    }
  }

  /**
   * 设置资源需求
   */
  setResourceRequirement(
    currentState: SharedState,
    resourceKey: string,
    requirement: ResourceRequirement
  ): SharedState {
    try {
      this.logger.info('Setting resource requirement', {
        resourceKey,
        minimum: requirement.minimum,
        optimal: requirement.optimal,
        maximum: requirement.maximum,
        unit: requirement.unit
      });

      return currentState.setResourceRequirement(resourceKey, requirement);
    } catch (error) {
      this.logger.error('Failed to set resource requirement', { 
        error, 
        resourceKey, 
        requirement 
      });
      throw error;
    }
  }

  /**
   * 添加依赖
   */
  addDependency(
    currentState: SharedState,
    dependency: Dependency
  ): SharedState {
    try {
      this.logger.info('Adding dependency', {
        dependencyId: dependency.id,
        type: dependency.type,
        name: dependency.name,
        version: dependency.version
      });

      return currentState.addDependency(dependency);
    } catch (error) {
      this.logger.error('Failed to add dependency', { error, dependency });
      throw error;
    }
  }

  /**
   * 更新依赖状态
   */
  updateDependencyStatus(
    currentState: SharedState,
    dependencyId: UUID,
    status: DependencyStatus
  ): SharedState {
    try {
      const dependency = currentState.dependencies.find(d => d.id === dependencyId);
      if (!dependency) {
        throw new Error(`Dependency ${dependencyId} not found`);
      }

      const updatedDependency = { ...dependency, status };

      this.logger.info('Updating dependency status', {
        dependencyId,
        oldStatus: dependency.status,
        newStatus: status
      });

      return currentState.addDependency(updatedDependency);
    } catch (error) {
      this.logger.error('Failed to update dependency status', { 
        error, 
        dependencyId, 
        status 
      });
      throw error;
    }
  }

  /**
   * 添加目标
   */
  addGoal(
    currentState: SharedState,
    goal: Goal
  ): SharedState {
    try {
      this.logger.info('Adding goal', {
        goalId: goal.id,
        name: goal.name,
        priority: goal.priority,
        criteriaCount: goal.successCriteria.length
      });

      return currentState.addGoal(goal);
    } catch (error) {
      this.logger.error('Failed to add goal', { error, goal });
      throw error;
    }
  }

  /**
   * 更新目标状态
   */
  updateGoalStatus(
    currentState: SharedState,
    goalId: UUID,
    status: GoalStatus
  ): SharedState {
    try {
      const goal = currentState.goals.find(g => g.id === goalId);
      if (!goal) {
        throw new Error(`Goal ${goalId} not found`);
      }

      const updatedGoal = { ...goal, status };

      this.logger.info('Updating goal status', {
        goalId,
        goalName: goal.name,
        oldStatus: goal.status,
        newStatus: status
      });

      return currentState.addGoal(updatedGoal);
    } catch (error) {
      this.logger.error('Failed to update goal status', { 
        error, 
        goalId, 
        status 
      });
      throw error;
    }
  }

  /**
   * 检查资源可用性
   */
  checkResourceAvailability(
    currentState: SharedState,
    resourceKey: string
  ): boolean {
    const resource = currentState.allocatedResources[resourceKey];
    return resource?.status === ResourceStatus.AVAILABLE;
  }

  /**
   * 检查依赖是否已解决
   */
  checkDependencyResolved(
    currentState: SharedState,
    dependencyId: UUID
  ): boolean {
    const dependency = currentState.dependencies.find(d => d.id === dependencyId);
    return dependency?.status === DependencyStatus.RESOLVED;
  }

  /**
   * 检查目标是否已达成
   */
  checkGoalAchieved(
    currentState: SharedState,
    goalId: UUID
  ): boolean {
    const goal = currentState.goals.find(g => g.id === goalId);
    return goal?.status === GoalStatus.ACHIEVED;
  }

  /**
   * 获取高优先级目标
   */
  getHighPriorityGoals(currentState: SharedState): Goal[] {
    return currentState.goals.filter(
      goal => goal.priority === Priority.HIGH || goal.priority === Priority.CRITICAL
    );
  }

  /**
   * 获取未解决的依赖
   */
  getUnresolvedDependencies(currentState: SharedState): Dependency[] {
    return currentState.dependencies.filter(
      dep => dep.status === DependencyStatus.PENDING || dep.status === DependencyStatus.FAILED
    );
  }

  /**
   * 验证资源分配的合理性
   */
  private validateResourceAllocation(
    currentState: SharedState,
    resourceKey: string,
    resource: Resource
  ): void {
    // 检查资源需求
    const requirement = currentState.resourceRequirements[resourceKey];
    if (requirement) {
      if (resource.amount < requirement.minimum) {
        throw new Error(
          `Resource allocation ${resource.amount} is below minimum requirement ${requirement.minimum}`
        );
      }
      if (requirement.maximum && resource.amount > requirement.maximum) {
        throw new Error(
          `Resource allocation ${resource.amount} exceeds maximum limit ${requirement.maximum}`
        );
      }
      if (resource.unit !== requirement.unit) {
        throw new Error(
          `Resource unit ${resource.unit} does not match requirement unit ${requirement.unit}`
        );
      }
    }

    // 检查资源类型
    if (!resource.type || resource.type.trim() === '') {
      throw new Error('Resource type cannot be empty');
    }

    // 检查资源数量
    if (resource.amount < 0) {
      throw new Error('Resource amount cannot be negative');
    }
  }
}
