/**
 * PlanDependency值对象
 * 
 * 表示计划中任务之间的依赖关系
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID } from '../../../../public/shared/types';
import { PlanDependency, DependencyType } from '../../types';

// 重新导出PlanDependency类型，确保类型一致性
export { PlanDependency } from '../../types';

/**
 * 创建PlanDependency值对象
 * 使用types.ts中统一的PlanDependency接口
 */
export function createPlanDependency(params: {
  dependencyId: UUID;
  sourceTaskId: UUID;
  targetTaskId: UUID;
  type: DependencyType;
  lagTimeMs?: number;
  condition?: string;
  metadata?: Record<string, unknown>;
}): PlanDependency {
  return {
    dependencyId: params.dependencyId,
    sourceTaskId: params.sourceTaskId,
    targetTaskId: params.targetTaskId,
    type: params.type,
    lagTimeMs: params.lagTimeMs,
    condition: params.condition,
    metadata: params.metadata
  };
}

/**
 * 判断依赖是否是关键依赖
 * @param dependency 依赖
 * @returns 是否是关键依赖
 */
export function isCriticalDependency(dependency: PlanDependency): boolean {
  // 基于依赖类型判断关键性
  return dependency.type === DependencyType.FINISH_TO_START;
}

/**
 * 判断依赖是否是可选依赖
 * @param dependency 依赖
 * @returns 是否是可选依赖
 */
export function isOptionalDependency(dependency: PlanDependency): boolean {
  // 基于条件判断是否可选
  return !!dependency.condition;
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
  return !!dependency.lagTimeMs && dependency.lagTimeMs > 0;
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
    dep.sourceTaskId === sourceTaskId && dep.targetTaskId === targetTaskId
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
    .filter(dep => dep.targetTaskId === taskId)
    .map(dep => dep.sourceTaskId);
}

/**
 * 获取依赖于指定任务的所有任务
 * @param dependencies 依赖列表
 * @param taskId 任务ID
 * @returns 依赖于该任务的任务ID列表
 */
export function getDependentTaskIds(dependencies: PlanDependency[], taskId: UUID): UUID[] {
  return dependencies
    .filter(dep => dep.sourceTaskId === taskId)
    .map(dep => dep.targetTaskId);
} 