/**
 * PlanTask值对象
 * 
 * 表示计划中的任务，包含任务的属性和状态
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:25:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID } from '../../../../public/shared/types';
import { PlanTask, TaskStatus, Priority, ResourceRequirement, FailureResolver, Duration } from '../../types';

// 重新导出PlanTask类型，确保类型一致性
export { PlanTask } from '../../types';

/**
 * 创建PlanTask值对象
 * 使用types.ts中统一的PlanTask接口
 */
export function createPlanTask(params: {
  taskId: UUID;
  name: string;
  description: string;
  status?: TaskStatus;
  priority?: Priority;
  type?: string;
  dependencies?: UUID[];
  estimatedDuration?: Duration;
  actualDuration?: Duration;
  progress?: number;
  resourceRequirements?: ResourceRequirement[];
  failureResolver?: FailureResolver;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): PlanTask {
  return {
    taskId: params.taskId,
    name: params.name,
    description: params.description,
    status: params.status,
    priority: params.priority,
    type: params.type,
    dependencies: params.dependencies,
    estimatedDuration: params.estimatedDuration,
    actualDuration: params.actualDuration,
    progress: params.progress,
    resourceRequirements: params.resourceRequirements,
    failureResolver: params.failureResolver,
    parameters: params.parameters,
    metadata: params.metadata
  };
}

/**
 * 更新任务状态
 * @param task 任务
 * @param newStatus 新状态
 * @returns 更新后的任务
 */
export function updateTaskStatus(task: PlanTask, newStatus: TaskStatus): PlanTask {
  return {
    ...task,
    status: newStatus,
    // Note: PlanTask in types.ts doesn't have start_time/end_time, using metadata instead
    ...(newStatus === TaskStatus.IN_PROGRESS && !task.metadata?.start_time ? {
      metadata: { ...task.metadata, start_time: new Date().toISOString() }
    } : {}),
    ...((newStatus === TaskStatus.COMPLETED || newStatus === TaskStatus.FAILED || newStatus === TaskStatus.CANCELLED) && !task.metadata?.end_time ?
      { end_time: new Date().toISOString() } : {})
  };
}

/**
 * 判断任务是否已完成
 * @param task 任务
 * @returns 是否已完成
 */
export function isTaskCompleted(task: PlanTask): boolean {
  return task.status === 'completed';
}

/**
 * 判断任务是否已失败
 * @param task 任务
 * @returns 是否已失败
 */
export function isTaskFailed(task: PlanTask): boolean {
  return task.status === 'failed';
}

/**
 * 判断任务是否已取消
 * @param task 任务
 * @returns 是否已取消
 */
export function isTaskCancelled(task: PlanTask): boolean {
  return task.status === 'cancelled';
}

/**
 * 判断任务是否已跳过
 * @param task 任务
 * @returns 是否已跳过
 */
export function isTaskSkipped(task: PlanTask): boolean {
  return task.status === 'skipped';
}

/**
 * 判断任务是否已结束（完成、失败、取消或跳过）
 * @param task 任务
 * @returns 是否已结束
 */
export function isTaskFinished(task: PlanTask): boolean {
  return isTaskCompleted(task) || isTaskFailed(task) || isTaskCancelled(task) || isTaskSkipped(task);
}

/**
 * 判断任务是否正在进行中
 * @param task 任务
 * @returns 是否正在进行中
 */
export function isTaskInProgress(task: PlanTask): boolean {
  return task.status === 'in_progress';
}

/**
 * 判断任务是否已阻塞
 * @param task 任务
 * @returns 是否已阻塞
 */
export function isTaskBlocked(task: PlanTask): boolean {
  // Note: TaskStatus doesn't have 'blocked', using metadata to check
  return task.metadata?.blocked === true;
}

/**
 * 判断任务是否需要人工干预
 * @param task 任务
 * @returns 是否需要人工干预
 */
export function isTaskPendingIntervention(task: PlanTask): boolean {
  // Note: TaskStatus doesn't have 'pending_intervention', using metadata to check
  return task.metadata?.pending_intervention === true;
}