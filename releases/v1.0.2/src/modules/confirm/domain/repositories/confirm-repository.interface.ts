/**
 * Confirm仓库接口
 * 
 * 定义确认数据访问的领域接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Confirm } from '../entities/confirm.entity';
import { ConfirmStatus, ConfirmationType, Priority } from '../../shared/types';

/**
 * 确认查询过滤器
 */
export interface ConfirmFilter {
  context_id?: UUID;
  plan_id?: UUID;
  confirmation_type?: ConfirmationType;
  status?: ConfirmStatus;
  priority?: Priority;
  requester_user_id?: string;
  created_after?: string;
  created_before?: string;
  expires_after?: string;
  expires_before?: string;
}

/**
 * 分页参数
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Confirm仓库接口
 */
export interface IConfirmRepository {
  /**
   * 保存确认
   */
  save(confirm: Confirm): Promise<void>;

  /**
   * 根据ID查找确认
   */
  findById(confirmId: UUID): Promise<Confirm | null>;

  /**
   * 根据上下文ID查找确认列表
   */
  findByContextId(contextId: UUID): Promise<Confirm[]>;

  /**
   * 根据计划ID查找确认列表
   */
  findByPlanId(planId: UUID): Promise<Confirm[]>;

  /**
   * 根据过滤器查找确认列表
   */
  findByFilter(filter: ConfirmFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Confirm>>;

  /**
   * 查找待处理的确认
   */
  findPending(userId?: string): Promise<Confirm[]>;

  /**
   * 查找已过期的确认
   */
  findExpired(): Promise<Confirm[]>;

  /**
   * 更新确认
   */
  update(confirm: Confirm): Promise<void>;

  /**
   * 删除确认
   */
  delete(confirmId: UUID): Promise<void>;

  /**
   * 批量更新状态
   */
  batchUpdateStatus(confirmIds: UUID[], status: ConfirmStatus): Promise<void>;

  /**
   * 检查确认是否存在
   */
  exists(confirmId: UUID): Promise<boolean>;

  /**
   * 获取统计信息
   */
  getStatistics(contextId?: UUID): Promise<{
    total: number;
    by_status: Record<ConfirmStatus, number>;
    by_type: Record<ConfirmationType, number>;
    by_priority: Record<Priority, number>;
  }>;
}
