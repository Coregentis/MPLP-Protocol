/**
 * Timeline值对象
 * 
 * 表示计划的时间线信息，包含开始日期、结束日期、里程碑和关键路径
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:40:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID, Timestamp } from '../../../shared/types';
import { PlanMilestone } from './plan-milestone.value-object';

/**
 * 时间线值对象
 */
export interface Timeline {
  start_date: Timestamp;
  end_date: Timestamp;
  milestones: PlanMilestone[];
  critical_path: UUID[];
}

/**
 * 创建Timeline值对象
 */
export function createTimeline(params: {
  start_date: Timestamp;
  end_date: Timestamp;
  milestones?: PlanMilestone[];
  critical_path?: UUID[];
}): Timeline {
  return {
    start_date: params.start_date,
    end_date: params.end_date,
    milestones: params.milestones || [],
    critical_path: params.critical_path || []
  };
}

/**
 * 添加里程碑到时间线
 * @param timeline 时间线
 * @param milestone 里程碑
 * @returns 更新后的时间线
 */
export function addMilestone(timeline: Timeline, milestone: PlanMilestone): Timeline {
  return {
    ...timeline,
    milestones: [...timeline.milestones, milestone]
  };
}

/**
 * 更新时间线的关键路径
 * @param timeline 时间线
 * @param criticalPath 关键路径
 * @returns 更新后的时间线
 */
export function updateCriticalPath(timeline: Timeline, criticalPath: UUID[]): Timeline {
  return {
    ...timeline,
    critical_path: criticalPath
  };
}

/**
 * 计算时间线的持续时间（毫秒）
 * @param timeline 时间线
 * @returns 持续时间（毫秒）
 */
export function calculateDuration(timeline: Timeline): number {
  const startDate = new Date(timeline.start_date).getTime();
  const endDate = new Date(timeline.end_date).getTime();
  return endDate - startDate;
}

/**
 * 判断任务是否在关键路径上
 * @param timeline 时间线
 * @param taskId 任务ID
 * @returns 是否在关键路径上
 */
export function isOnCriticalPath(timeline: Timeline, taskId: UUID): boolean {
  return timeline.critical_path.includes(taskId);
}

/**
 * 获取下一个里程碑
 * @param timeline 时间线
 * @param currentDate 当前日期
 * @returns 下一个里程碑或undefined
 */
export function getNextMilestone(timeline: Timeline, currentDate: Timestamp): PlanMilestone | undefined {
  const currentTime = new Date(currentDate).getTime();
  
  return timeline.milestones
    .filter(milestone => new Date(milestone.due_date).getTime() > currentTime)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
}

/**
 * 判断时间线是否已过期
 * @param timeline 时间线
 * @param currentDate 当前日期
 * @returns 是否已过期
 */
export function isTimelineExpired(timeline: Timeline, currentDate: Timestamp): boolean {
  return new Date(timeline.end_date).getTime() < new Date(currentDate).getTime();
}

/**
 * 判断时间线是否已开始
 * @param timeline 时间线
 * @param currentDate 当前日期
 * @returns 是否已开始
 */
export function isTimelineStarted(timeline: Timeline, currentDate: Timestamp): boolean {
  return new Date(timeline.start_date).getTime() <= new Date(currentDate).getTime();
}

/**
 * 计算时间线的完成百分比
 * @param timeline 时间线
 * @param currentDate 当前日期
 * @returns 完成百分比（0-100）
 */
export function calculateTimelineProgress(timeline: Timeline, currentDate: Timestamp): number {
  const startTime = new Date(timeline.start_date).getTime();
  const endTime = new Date(timeline.end_date).getTime();
  const currentTime = new Date(currentDate).getTime();
  
  if (currentTime <= startTime) {
    return 0;
  }
  
  if (currentTime >= endTime) {
    return 100;
  }
  
  const totalDuration = endTime - startTime;
  const elapsedDuration = currentTime - startTime;
  
  return Math.round((elapsedDuration / totalDuration) * 100);
} 