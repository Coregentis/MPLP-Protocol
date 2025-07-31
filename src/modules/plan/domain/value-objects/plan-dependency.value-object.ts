/**
 * PlanDependency值对象
 * 
 * 表示计划中任务之间的依赖关系
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID, DependencyType, DependencyCriticality, Duration } from '../../../../public/shared/types/plan-types';

/**
 * 计划依赖值对象
 */
export interface PlanDependency {
  id: UUID;
  source_task_id: UUID;
  target_task_id: UUID;
  dependency_type: DependencyType;
  lag?: Duration;
  criticality: DependencyCriticality;
  condition?: string;
}

/**
 * 创建PlanDependency值对象
 */
export function createPlanDependency(params: {
  id: UUID;
  source_task_id: UUID;
  target_task_id: UUID;
  dependency_type?: DependencyType;
  lag?: Duration;
  criticality?: DependencyCriticality;
  condition?: string;
}): PlanDependency {
  return {
    id: params.id,
    source_task_id: params.source_task_id,
    target_task_id: params.target_task_id,
    dependency_type: params.dependency_type || 'finish_to_start',
    lag: params.lag,
    criticality: params.criticality || 'important',
    condition: params.condition
  };
}

/**
 * 判断依赖是否是关键依赖
 * @param dependency 依赖
 * @returns 是否是关键依赖
 */
export function isCriticalDependency(dependency: PlanDependency): boolean {
  return dependency.criticality === 'critical';
}

/**
 * 判断依赖是否是可选依赖
 * @param dependency 依赖
 * @returns 是否是可选依赖
 */
export function isOptionalDependency(dependency: PlanDependency): boolean {
  return dependency.criticality === 'optional';
}

/**
 * 判断依赖是否有条件
 * @param dependency 依赖
 * @returns 是否有条件
 */
export function hasCondition(dependency: PlanDependency): boolean {
  return !!dependency.condition && dependency.condition.trim().length > 0;
}

/**
 * 判断依赖是否有滞后时间
 * @param dependency 依赖
 * @returns 是否有滞后时间
 */
export function hasLag(dependency: PlanDependency): boolean {
  return !!dependency.lag;
}

/**
 * 判断两个任务是否有依赖关系
 * @param dependencies 依赖列表
 * @param sourceTaskId 源任务ID
 * @param targetTaskId 目标任务ID
 * @returns 是否有依赖关系
 */
export function hasDependency(
  dependencies: PlanDependency[],
  sourceTaskId: UUID,
  targetTaskId: UUID
): boolean {
  return dependencies.some(dep => 
    dep.source_task_id === sourceTaskId && dep.target_task_id === targetTaskId
  );
}

/**
 * 获取任务的所有依赖任务
 * @param dependencies 依赖列表
 * @param taskId 任务ID
 * @returns 依赖任务ID列表
 */
export function getDependencyTaskIds(dependencies: PlanDependency[], taskId: UUID): UUID[] {
  return dependencies
    .filter(dep => dep.target_task_id === taskId)
    .map(dep => dep.source_task_id);
}

/**
 * 获取依赖于指定任务的所有任务
 * @param dependencies 依赖列表
 * @param taskId 任务ID
 * @returns 依赖于该任务的任务ID列表
 */
export function getDependentTaskIds(dependencies: PlanDependency[], taskId: UUID): UUID[] {
  return dependencies
    .filter(dep => dep.source_task_id === taskId)
    .map(dep => dep.target_task_id);
} 