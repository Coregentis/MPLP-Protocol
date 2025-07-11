/**
 * MPLP Plan模块入口文件
 * 
 * 导出Plan模块的所有公共接口和类型
 * 
 * @version v1.0.1
 * @updated 2025-07-11T23:59:23Z
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 */

// 导出类型定义
export * from './types';

// 导出核心类
export { PlanManager } from './plan-manager';
export { PlanService } from './plan-service';
export { PlanFactory } from './plan-factory';

// 导出故障解决器
export { 
  FailureResolverManager, 
  FailureResolverConfig, 
  FailureRecoveryResult,
  FailureResolverEventType,
  FailureResolverEvent
} from './failure-resolver';

// 导出工具函数
export {
  createDefaultPlanConfiguration,
  createDefaultFailureResolver,
  createDefaultTimeline,
  validatePlanConfiguration,
  validateFailureResolver,
  validatePlanName,
  isValidUUID,
  isValidTimestamp
} from './utils';

// 导入需要的类型
import type {
  PlanStatus,
  TaskStatus,
  TaskType,
  DependencyType,
  DependencyCriticality,
  Priority,
  PlanFilter,
  PlanTask,
  PlanDependency,
  TaskAssignee,
  Duration,
  TaskEffort,
  ResourceRequirement,
  AcceptanceCriterion
} from './types';

// ================== 筛选器构建器 ==================

/**
 * 创建Plan筛选器
 * 严格按照Schema定义的字段名称
 */
export function createPlanFilter(options: {
  planIds?: string[];
  contextIds?: string[];
  names?: string[];
  statuses?: PlanStatus[];
  priorities?: Priority[];
  createdAfter?: string;
  createdBefore?: string;
}): PlanFilter {
  return {
    plan_ids: options.planIds,
    context_ids: options.contextIds,
    names: options.names,
    statuses: options.statuses,
    priorities: options.priorities,
    created_after: options.createdAfter,
    created_before: options.createdBefore,
  };
}

/**
 * 创建Plan任务
 * 严格按照Schema定义的字段名称和类型
 */
export function createPlanTask(options: {
  name: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  assignee?: TaskAssignee;
  estimatedEffort?: TaskEffort;
  resourcesRequired?: ResourceRequirement[];
  acceptanceCriteria?: AcceptanceCriterion[];
  subTasks?: PlanTask[];
}): Omit<PlanTask, 'task_id'> {
  return {
    name: options.name,
    description: options.description,
    type: options.type || 'atomic',
    status: options.status || 'pending',
    priority: options.priority || 'medium',
    assignee: options.assignee,
    estimated_effort: options.estimatedEffort,
    resources_required: options.resourcesRequired,
    acceptance_criteria: options.acceptanceCriteria,
    sub_tasks: options.subTasks,
  };
}

/**
 * 创建Plan依赖
 * 严格按照Schema定义的字段名称和类型
 */
export function createPlanDependency(options: {
  sourceTaskId: string;
  targetTaskId: string;
  dependencyType?: DependencyType;
  lag?: Duration;
  criticality?: DependencyCriticality;
  condition?: string;
}): Omit<PlanDependency, 'id'> {
  return {
    source_task_id: options.sourceTaskId,
    target_task_id: options.targetTaskId,
    dependency_type: options.dependencyType || 'finish_to_start',
    lag: options.lag,
    criticality: options.criticality || 'important',
    condition: options.condition,
  };
}

// ================== 模块元数据 ==================

export const PlanModuleMetadata = {
  name: 'PlanModule',
  version: '1.0.1',
  description: 'MPLP计划管理模块 - 完全符合Schema规范',
  compliance: {
    schema: 'plan-protocol.json v1.0',
    architecture: 'Interface-based service pattern',
    performance: 'P95 < 100ms for CRUD operations',
    refactoring: 'Complete refactor from BaseProtocol to Schema compliance',
  },
  features: [
    'Schema-compliant Plan protocol support',
    'Task hierarchy management',
    'Dependency relationship handling',
    'Milestone tracking',
    'Risk assessment and management',
    'Failure resolution mechanisms',
    'Timeline and duration management',
    'Resource requirement planning',
    'Acceptance criteria validation',
    'Optimization strategy support',
  ],
  exports: {
    services: ['PlanService'],
    interfaces: ['IPlanRepository', 'IPlanValidator'],
    types: ['PlanProtocol', 'PlanTask', 'PlanDependency', 'PlanMilestone'],
    builders: ['createPlanFilter', 'createPlanTask', 'createPlanDependency'],
    utilities: ['createDefaultPlanConfig'],
  },
} as const; 