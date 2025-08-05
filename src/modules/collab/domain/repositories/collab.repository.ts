/**
 * MPLP Collab Repository Interface - Domain Repository
 *
 * @version v1.0.0
 * @created 2025-08-02T01:10:00+08:00
 * @description 协作仓储接口，定义数据访问抽象
 */

import { Collab } from '../entities/collab.entity';
import { CollabQueryParams } from '../../types';

/**
 * 协作仓储接口
 */
export interface CollabRepository {
  /**
   * 保存协作
   */
  save(collab: Collab): Promise<void>;

  /**
   * 根据ID查找协作
   */
  findById(collaboration_id: string): Promise<Collab | null>;

  /**
   * 根据上下文ID查找协作列表
   */
  findByContextId(context_id: string): Promise<Collab[]>;

  /**
   * 根据计划ID查找协作列表
   */
  findByPlanId(plan_id: string): Promise<Collab[]>;

  /**
   * 根据创建者查找协作列表
   */
  findByCreatedBy(created_by: string): Promise<Collab[]>;

  /**
   * 根据查询参数查找协作列表
   */
  findByQuery(params: CollabQueryParams): Promise<{
    collaborations: Collab[];
    total: number;
  }>;

  /**
   * 检查协作是否存在
   */
  exists(collaboration_id: string): Promise<boolean>;

  /**
   * 删除协作
   */
  delete(collaboration_id: string): Promise<void>;

  /**
   * 批量删除协作
   */
  deleteBatch(collaboration_ids: string[]): Promise<void>;

  /**
   * 更新协作状态
   */
  updateStatus(collaboration_id: string, status: string): Promise<void>;

  /**
   * 获取协作统计信息
   */
  getStatistics(): Promise<CollabStatistics>;
}

/**
 * 协作统计信息
 */
export interface CollabStatistics {
  total_collaborations: number;
  active_collaborations: number;
  completed_collaborations: number;
  failed_collaborations: number;
  average_participants: number;
  most_used_mode: string;
  most_used_coordination_type: string;
}
