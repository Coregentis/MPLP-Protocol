/**
 * 共享状态值对象
 * 
 * 领域值对象，表示Context的共享状态数据
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../public/shared/types';

/**
 * 资源状态枚举
 */
export enum ResourceStatus {
  AVAILABLE = 'available',
  ALLOCATED = 'allocated',
  EXHAUSTED = 'exhausted'
}

/**
 * 依赖状态枚举
 */
export enum DependencyStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  FAILED = 'failed'
}

/**
 * 依赖类型枚举
 */
export enum DependencyType {
  CONTEXT = 'context',
  PLAN = 'plan',
  EXTERNAL = 'external'
}

/**
 * 目标状态枚举
 */
export enum GoalStatus {
  DEFINED = 'defined',
  ACTIVE = 'active',
  ACHIEVED = 'achieved',
  ABANDONED = 'abandoned'
}

/**
 * 优先级枚举
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 成功标准操作符
 */
export enum SuccessCriteriaOperator {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte'
}

/**
 * 资源接口
 */
export interface Resource {
  type: string;
  amount: number;
  unit: string;
  status: ResourceStatus;
}

/**
 * 资源需求接口
 */
export interface ResourceRequirement {
  minimum: number;
  optimal?: number;
  maximum?: number;
  unit: string;
}

/**
 * 依赖接口
 */
export interface Dependency {
  id: UUID;
  type: DependencyType;
  name: string;
  version?: string;
  status: DependencyStatus;
}

/**
 * 成功标准接口
 */
export interface SuccessCriteria {
  metric: string;
  operator: SuccessCriteriaOperator;
  value: string | number | boolean;
  unit?: string;
}

/**
 * 目标接口
 */
export interface Goal {
  id: UUID;
  name: string;
  description?: string;
  priority: Priority;
  status: GoalStatus;
  successCriteria: SuccessCriteria[];
}

/**
 * 共享状态值对象
 */
export class SharedState {
  constructor(
    public readonly variables: Record<string, unknown> = {},
    public readonly allocatedResources: Record<string, Resource> = {},
    public readonly resourceRequirements: Record<string, ResourceRequirement> = {},
    public readonly dependencies: Dependency[] = [],
    public readonly goals: Goal[] = []
  ) {
    this.validateState();
  }

  /**
   * 验证共享状态的有效性
   */
  private validateState(): void {
    // 验证资源分配
    for (const [key, resource] of Object.entries(this.allocatedResources)) {
      if (!resource.type || !resource.unit || resource.amount < 0) {
        throw new Error(`Invalid resource configuration for ${key}`);
      }
    }

    // 验证资源需求
    for (const [key, requirement] of Object.entries(this.resourceRequirements)) {
      if (requirement.minimum < 0 || !requirement.unit) {
        throw new Error(`Invalid resource requirement for ${key}`);
      }
      if (requirement.optimal && requirement.optimal < requirement.minimum) {
        throw new Error(`Optimal resource must be >= minimum for ${key}`);
      }
      if (requirement.maximum && requirement.maximum < requirement.minimum) {
        throw new Error(`Maximum resource must be >= minimum for ${key}`);
      }
    }

    // 验证依赖
    for (const dependency of this.dependencies) {
      if (!dependency.id || !dependency.name || !dependency.type) {
        throw new Error('Invalid dependency configuration');
      }
    }

    // 验证目标
    for (const goal of this.goals) {
      if (!goal.id || !goal.name) {
        throw new Error('Invalid goal configuration');
      }
      for (const criteria of goal.successCriteria) {
        if (!criteria.metric || !criteria.operator || criteria.value === undefined) {
          throw new Error(`Invalid success criteria for goal ${goal.name}`);
        }
      }
    }
  }

  /**
   * 更新变量
   */
  updateVariables(variables: Record<string, unknown>): SharedState {
    return new SharedState(
      { ...this.variables, ...variables },
      this.allocatedResources,
      this.resourceRequirements,
      this.dependencies,
      this.goals
    );
  }

  /**
   * 分配资源
   */
  allocateResource(key: string, resource: Resource): SharedState {
    return new SharedState(
      this.variables,
      { ...this.allocatedResources, [key]: resource },
      this.resourceRequirements,
      this.dependencies,
      this.goals
    );
  }

  /**
   * 设置资源需求
   */
  setResourceRequirement(key: string, requirement: ResourceRequirement): SharedState {
    return new SharedState(
      this.variables,
      this.allocatedResources,
      { ...this.resourceRequirements, [key]: requirement },
      this.dependencies,
      this.goals
    );
  }

  /**
   * 添加依赖
   */
  addDependency(dependency: Dependency): SharedState {
    const existingIndex = this.dependencies.findIndex(d => d.id === dependency.id);
    const newDependencies = [...this.dependencies];
    
    if (existingIndex >= 0) {
      newDependencies[existingIndex] = dependency;
    } else {
      newDependencies.push(dependency);
    }

    return new SharedState(
      this.variables,
      this.allocatedResources,
      this.resourceRequirements,
      newDependencies,
      this.goals
    );
  }

  /**
   * 添加目标
   */
  addGoal(goal: Goal): SharedState {
    const existingIndex = this.goals.findIndex(g => g.id === goal.id);
    const newGoals = [...this.goals];
    
    if (existingIndex >= 0) {
      newGoals[existingIndex] = goal;
    } else {
      newGoals.push(goal);
    }

    return new SharedState(
      this.variables,
      this.allocatedResources,
      this.resourceRequirements,
      this.dependencies,
      newGoals
    );
  }

  /**
   * 移除依赖
   */
  removeDependency(dependencyId: UUID): SharedState {
    return new SharedState(
      this.variables,
      this.allocatedResources,
      this.resourceRequirements,
      this.dependencies.filter(d => d.id !== dependencyId),
      this.goals
    );
  }

  /**
   * 移除目标
   */
  removeGoal(goalId: UUID): SharedState {
    return new SharedState(
      this.variables,
      this.allocatedResources,
      this.resourceRequirements,
      this.dependencies,
      this.goals.filter(g => g.id !== goalId)
    );
  }

  /**
   * 转换为Schema格式（snake_case）
   */
  toSchemaFormat(): Record<string, unknown> {
    return {
      variables: this.variables,
      resources: {
        allocated: this.allocatedResources,
        requirements: this.resourceRequirements
      },
      dependencies: this.dependencies.map(dep => ({
        id: dep.id,
        type: dep.type,
        name: dep.name,
        version: dep.version,
        status: dep.status
      })),
      goals: this.goals.map(goal => ({
        id: goal.id,
        name: goal.name,
        description: goal.description,
        priority: goal.priority,
        status: goal.status,
        success_criteria: goal.successCriteria.map(criteria => ({
          metric: criteria.metric,
          operator: criteria.operator,
          value: criteria.value,
          unit: criteria.unit
        }))
      }))
    };
  }

  /**
   * 从Schema格式创建（snake_case）
   */
  static fromSchemaFormat(data: Record<string, unknown>): SharedState {
    const variables = (data.variables as Record<string, unknown>) || {};
    
    const resources = data.resources as Record<string, unknown> || {};
    const allocatedResources = (resources.allocated as Record<string, Resource>) || {};
    const resourceRequirements = (resources.requirements as Record<string, ResourceRequirement>) || {};

    const dependencies = (data.dependencies as Record<string, unknown>[] || []).map(dep => ({
      id: dep.id as string,
      type: dep.type as DependencyType,
      name: dep.name as string,
      version: dep.version as string,
      status: dep.status as DependencyStatus
    }));
    
    const goals = (data.goals as Record<string, unknown>[] || []).map(goal => ({
      id: goal.id as string,
      name: goal.name as string,
      description: goal.description as string,
      priority: goal.priority as Priority,
      status: goal.status as GoalStatus,
      successCriteria: (goal.success_criteria as Record<string, unknown>[] || []).map((criteria: Record<string, unknown>) => ({
        metric: criteria.metric as string,
        operator: criteria.operator as SuccessCriteriaOperator,
        value: criteria.value as string | number | boolean,
        unit: criteria.unit as string
      }))
    }));

    return new SharedState(
      variables,
      allocatedResources,
      resourceRequirements,
      dependencies,
      goals
    );
  }
}
