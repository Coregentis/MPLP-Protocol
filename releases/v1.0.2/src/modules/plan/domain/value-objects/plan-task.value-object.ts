/**
 * PlanTask值对象
 * 
 * 表示计划中的任务，包含任务的属性和状态
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:25:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { 
  UUID, 
  Timestamp, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  TaskEffort, 
  TaskAssignee, 
  ResourceRequirement, 
  AcceptanceCriterion 
} from '../../../shared/types';

/**
 * 计划任务值对象
 */
export interface PlanTask {
  task_id: UUID;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  parent_task_id?: UUID;
  estimated_effort?: TaskEffort;
  assignee?: TaskAssignee;
  resource_requirements?: ResourceRequirement[];
  acceptance_criteria?: AcceptanceCriterion[];
  start_time?: Timestamp;
  end_time?: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 创建PlanTask值对象
 */
export function createPlanTask(params: {
  task_id: UUID;
  name: string;
  description: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  parent_task_id?: UUID;
  estimated_effort?: TaskEffort;
  assignee?: TaskAssignee;
  resource_requirements?: ResourceRequirement[];
  acceptance_criteria?: AcceptanceCriterion[];
  start_time?: Timestamp;
  end_time?: Timestamp;
  metadata?: Record<string, unknown>;
}): PlanTask {
  return {
    task_id: params.task_id,
    name: params.name,
    description: params.description,
    status: params.status || 'pending',
    priority: params.priority || 'medium',
    type: params.type || 'atomic',
    parent_task_id: params.parent_task_id,
    estimated_effort: params.estimated_effort,
    assignee: params.assignee,
    resource_requirements: params.resource_requirements,
    acceptance_criteria: params.acceptance_criteria,
    start_time: params.start_time,
    end_time: params.end_time,
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
    ...(newStatus === 'in_progress' && !task.start_time ? { start_time: new Date().toISOString() } : {}),
    ...((['completed', 'failed', 'cancelled', 'skipped'].includes(newStatus) && !task.end_time) ? 
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
  return task.status === 'blocked';
}

/**
 * 判断任务是否需要人工干预
 * @param task 任务
 * @returns 是否需要人工干预
 */
export function isTaskPendingIntervention(task: PlanTask): boolean {
  return task.status === 'pending_intervention';
} 