/**
 * Confirm仓库接口
 * 
 * @description Confirm模块的仓库接口定义，基于DDD架构模式
 * @version 1.0.0
 * @layer 领域层 - 仓库接口
 */

import { ConfirmEntity } from '../entities/confirm.entity';
import { UUID } from '../../types';

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 查询过滤器
 */
export interface ConfirmQueryFilter {
  confirmationType?: string[];
  status?: string[];
  priority?: string[];
  requesterId?: string;
  approverId?: string;
  contextId?: UUID;
  planId?: UUID;
  createdAfter?: Date;
  createdBefore?: Date;
  riskLevel?: string[];
  workflowType?: string[];
}

/**
 * Confirm仓库接口
 * 
 * @description 定义Confirm实体的持久化操作接口
 */
export interface IConfirmRepository {
  
  /**
   * 创建确认
   * @param confirm 确认实体
   * @returns Promise<ConfirmEntity>
   */
  create(confirm: ConfirmEntity): Promise<ConfirmEntity>;
  
  /**
   * 根据ID获取确认
   * @param confirmId 确认ID
   * @returns Promise<ConfirmEntity | null>
   */
  findById(confirmId: UUID): Promise<ConfirmEntity | null>;
  
  /**
   * 更新确认
   * @param confirmId 确认ID
   * @param updates 更新数据
   * @returns Promise<ConfirmEntity>
   */
  update(confirmId: UUID, updates: Partial<ConfirmEntity>): Promise<ConfirmEntity>;
  
  /**
   * 删除确认
   * @param confirmId 确认ID
   * @returns Promise<void>
   */
  delete(confirmId: UUID): Promise<void>;
  
  /**
   * 列出所有确认
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据条件查询确认
   * @param filter 查询过滤器
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByFilter(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据上下文ID查询确认
   * @param contextId 上下文ID
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据计划ID查询确认
   * @param planId 计划ID
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByPlanId(planId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据请求者ID查询确认
   * @param requesterId 请求者ID
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByRequesterId(requesterId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据审批者ID查询确认
   * @param approverId 审批者ID
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByApproverId(approverId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据状态查询确认
   * @param status 确认状态
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByStatus(status: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据确认类型查询确认
   * @param confirmationType 确认类型
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByType(confirmationType: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
  
  /**
   * 根据优先级查询确认
   * @param priority 优先级
   * @param pagination 分页参数
   * @returns Promise<PaginatedResult<ConfirmEntity>>
   */
  findByPriority(priority: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;

  /**
   * 根据时间范围查询确认 - 基于Schema timestamp字段
   * @param timeRange 时间范围
   * @param pagination 分页参数
   * @returns Promise<ConfirmEntity[]>
   */
  findByTimeRange(timeRange: { startDate: Date; endDate: Date }, pagination?: PaginationParams): Promise<ConfirmEntity[]>;

  /**
   * 统计确认数量
   * @param filter 查询过滤器
   * @returns Promise<number>
   */
  count(filter?: ConfirmQueryFilter): Promise<number>;
  
  /**
   * 检查确认是否存在
   * @param confirmId 确认ID
   * @returns Promise<boolean>
   */
  exists(confirmId: UUID): Promise<boolean>;
  
  /**
   * 批量创建确认
   * @param confirms 确认实体数组
   * @returns Promise<ConfirmEntity[]>
   */
  createBatch(confirms: ConfirmEntity[]): Promise<ConfirmEntity[]>;
  
  /**
   * 批量更新确认
   * @param updates 更新数据数组
   * @returns Promise<ConfirmEntity[]>
   */
  updateBatch(updates: Array<{ confirmId: UUID; updates: Partial<ConfirmEntity> }>): Promise<ConfirmEntity[]>;
  
  /**
   * 批量删除确认
   * @param confirmIds 确认ID数组
   * @returns Promise<void>
   */
  deleteBatch(confirmIds: UUID[]): Promise<void>;
  
  /**
   * 清空所有确认（主要用于测试）
   * @returns Promise<void>
   */
  clear(): Promise<void>;
  
  /**
   * 获取仓库统计信息
   * @returns Promise<{ total: number; byStatus: Record<string, number>; byType: Record<string, number> }>
   */
  getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }>;
}
