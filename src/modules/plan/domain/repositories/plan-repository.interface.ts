/**
 * Plan仓库接口
 * 
 * 定义对Plan实体的持久化操作
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:55:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../entities/plan.entity';
import { UUID, PlanStatus, Priority } from '../../../../public/shared/types/plan-types';

/**
 * 计划过滤器接口
 */
export interface PlanFilter {
  plan_ids?: UUID[];
  context_ids?: UUID[];
  names?: string[];
  statuses?: PlanStatus[];
  priorities?: Priority[];
  date_range?: {
    start?: string;
    end?: string;
  };
  limit?: number;
  offset?: number;
}

/**
 * 计划仓库接口
 */
export interface IPlanRepository {
  /**
   * 创建计划
   * @param plan 计划实体
   * @returns 创建的计划
   */
  create(plan: Plan): Promise<Plan>;
  
  /**
   * 通过ID查找计划
   * @param planId 计划ID
   * @returns 找到的计划或undefined
   */
  findById(planId: UUID): Promise<Plan | undefined>;
  
  /**
   * 通过上下文ID查找计划
   * @param contextId 上下文ID
   * @returns 找到的计划列表
   */
  findByContextId(contextId: UUID): Promise<Plan[]>;
  
  /**
   * 通过过滤条件查找计划
   * @param filter 过滤条件
   * @returns 找到的计划列表
   */
  findByFilter(filter: PlanFilter): Promise<Plan[]>;
  
  /**
   * 更新计划
   * @param plan 计划实体
   * @returns 更新后的计划
   */
  update(plan: Plan): Promise<Plan>;
  
  /**
   * 删除计划
   * @param planId 计划ID
   * @returns 是否成功删除
   */
  delete(planId: UUID): Promise<boolean>;
  
  /**
   * 检查计划是否存在
   * @param planId 计划ID
   * @returns 是否存在
   */
  exists(planId: UUID): Promise<boolean>;
  
  /**
   * 统计计划数量
   * @param filter 过滤条件
   * @returns 计划数量
   */
  count(filter?: PlanFilter): Promise<number>;
  
  /**
   * 批量创建计划
   * @param plans 计划实体列表
   * @returns 创建的计划列表
   */
  bulkCreate(plans: Plan[]): Promise<Plan[]>;
  
  /**
   * 批量更新计划
   * @param plans 计划实体列表
   * @returns 更新后的计划列表
   */
  bulkUpdate(plans: Plan[]): Promise<Plan[]>;
  
  /**
   * 批量删除计划
   * @param planIds 计划ID列表
   * @returns 成功删除的计划ID列表
   */
  bulkDelete(planIds: UUID[]): Promise<UUID[]>;
} 