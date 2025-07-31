/**
 * PlanMilestone值对象
 * 
 * 表示计划中的里程碑，包含里程碑的属性和状态
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:45:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID, Timestamp, MilestoneStatus } from '../../../../public/shared/types/plan-types';

/**
 * 计划里程碑值对象
 */
export interface PlanMilestone {
  milestone_id: UUID;
  name: string;
  description?: string;
  due_date: Timestamp;
  status: MilestoneStatus;
  related_tasks: UUID[];
}

/**
 * 创建PlanMilestone值对象
 */
export function createPlanMilestone(params: {
  milestone_id: UUID;
  name: string;
  description?: string;
  due_date: Timestamp;
  status?: MilestoneStatus;
  related_tasks?: UUID[];
}): PlanMilestone {
  return {
    milestone_id: params.milestone_id,
    name: params.name,
    description: params.description,
    due_date: params.due_date,
    status: params.status || 'pending',
    related_tasks: params.related_tasks || []
  };
}

/**
 * 更新里程碑状态
 * @param milestone 里程碑
 * @param newStatus 新状态
 * @returns 更新后的里程碑
 */
export function updateMilestoneStatus(milestone: PlanMilestone, newStatus: MilestoneStatus): PlanMilestone {
  return {
    ...milestone,
    status: newStatus
  };
}

/**
 * 添加关联任务到里程碑
 * @param milestone 里程碑
 * @param taskId 任务ID
 * @returns 更新后的里程碑
 */
export function addRelatedTask(milestone: PlanMilestone, taskId: UUID): PlanMilestone {
  if (milestone.related_tasks.includes(taskId)) {
    return milestone;
  }
  
  return {
    ...milestone,
    related_tasks: [...milestone.related_tasks, taskId]
  };
}

/**
 * 移除里程碑中的关联任务
 * @param milestone 里程碑
 * @param taskId 任务ID
 * @returns 更新后的里程碑
 */
export function removeRelatedTask(milestone: PlanMilestone, taskId: UUID): PlanMilestone {
  return {
    ...milestone,
    related_tasks: milestone.related_tasks.filter(id => id !== taskId)
  };
}

/**
 * 判断里程碑是否已达成
 * @param milestone 里程碑
 * @returns 是否已达成
 */
export function isMilestoneReached(milestone: PlanMilestone): boolean {
  return milestone.status === 'achieved';
}

/**
 * 判断里程碑是否已错过
 * @param milestone 里程碑
 * @returns 是否已错过
 */
export function isMilestoneMissed(milestone: PlanMilestone): boolean {
  return milestone.status === 'missed';
}

/**
 * 判断里程碑是否已取消
 * @param milestone 里程碑
 * @returns 是否已取消
 */
export function isMilestoneCancelled(milestone: PlanMilestone): boolean {
  return milestone.status === 'cancelled';
}

/**
 * 判断里程碑是否已过期但未更新状态
 * @param milestone 里程碑
 * @param currentDate 当前日期
 * @returns 是否已过期但未更新状态
 */
export function isMilestoneOverdue(milestone: PlanMilestone, currentDate: Timestamp): boolean {
  return (
    milestone.status === 'pending' &&
    new Date(milestone.due_date).getTime() < new Date(currentDate).getTime()
  );
}

/**
 * 判断里程碑是否即将到期
 * @param milestone 里程碑
 * @param currentDate 当前日期
 * @param thresholdMs 阈值（毫秒）
 * @returns 是否即将到期
 */
export function isMilestoneApproaching(
  milestone: PlanMilestone,
  currentDate: Timestamp,
  thresholdMs: number = 86400000 // 默认1天
): boolean {
  const dueTime = new Date(milestone.due_date).getTime();
  const currentTime = new Date(currentDate).getTime();
  
  return (
    milestone.status === 'pending' &&
    dueTime > currentTime &&
    dueTime - currentTime <= thresholdMs
  );
} 