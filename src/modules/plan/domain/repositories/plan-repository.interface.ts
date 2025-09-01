/**
 * Plan仓库接口
 * 
 * @description Plan模块的仓库接口定义，遵循DDD仓库模式
 * @version 1.0.0
 * @layer 领域层 - 仓库接口
 * @pattern 与Context模块使用IDENTICAL的仓库接口模式
 */

import { PlanEntity } from '../entities/plan.entity';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';

/**
 * Plan查询过滤器
 */
export interface PlanQueryFilter {
  contextId?: UUID;
  status?: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed' | Array<'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'>;
  priority?: 'critical' | 'high' | 'medium' | 'low' | Array<'critical' | 'high' | 'medium' | 'low'>;
  createdBy?: string;
  updatedBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  namePattern?: string;
  descriptionPattern?: string;
  hasActiveTasks?: boolean;
  progressMin?: number;
  progressMax?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Plan仓库接口
 * 
 * @description 定义Plan实体的持久化操作接口，支持智能任务规划的数据访问
 * @pattern 与Context模块使用IDENTICAL的仓库接口模式
 */
export interface IPlanRepository {
  
  // ===== 基础CRUD操作 =====

  /**
   * 根据ID查找Plan
   */
  findById(planId: UUID): Promise<PlanEntity | null>;

  /**
   * 根据名称查找Plan
   */
  findByName(name: string): Promise<PlanEntity | null>;

  /**
   * 保存Plan实体
   */
  save(plan: PlanEntity): Promise<PlanEntity>;

  /**
   * 更新Plan实体
   */
  update(plan: PlanEntity): Promise<PlanEntity>;

  /**
   * 删除Plan实体
   */
  delete(planId: UUID): Promise<boolean>;

  /**
   * 检查Plan是否存在
   */
  exists(planId: UUID): Promise<boolean>;

  // ===== 查询操作 =====

  /**
   * 查找所有Plan
   */
  findAll(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 根据过滤条件查找Plan
   */
  findByFilter(
    filter: PlanQueryFilter, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 根据状态查找Plan
   */
  findByStatus(
    status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed' | Array<'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'>, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 根据优先级查找Plan
   */
  findByPriority(
    priority: 'critical' | 'high' | 'medium' | 'low' | Array<'critical' | 'high' | 'medium' | 'low'>, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 根据Context ID查找Plan
   */
  findByContextId(
    contextId: UUID, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 根据创建者查找Plan
   */
  findByCreatedBy(
    createdBy: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 搜索Plan（按名称模式）
   */
  searchByName(
    namePattern: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 搜索Plan（按描述模式）
   */
  searchByDescription(
    descriptionPattern: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  // ===== 统计操作 =====

  /**
   * 统计Plan总数
   */
  count(): Promise<number>;

  /**
   * 根据状态统计Plan数量
   */
  countByStatus(status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'): Promise<number>;

  /**
   * 根据优先级统计Plan数量
   */
  countByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<number>;

  /**
   * 根据Context ID统计Plan数量
   */
  countByContextId(contextId: UUID): Promise<number>;

  /**
   * 根据创建者统计Plan数量
   */
  countByCreatedBy(createdBy: string): Promise<number>;

  // ===== 业务特定操作 =====

  /**
   * 查找活跃的Plan（状态为active）
   */
  findActivePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找待执行的Plan（状态为approved或active）
   */
  findExecutablePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找已完成的Plan（状态为completed）
   */
  findCompletedPlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找高优先级Plan（优先级为critical或high）
   */
  findHighPriorityPlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找过期的Plan（基于时间线）
   */
  findOverduePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找即将到期的Plan（基于时间线）
   */
  findUpcomingDeadlinePlans(
    daysAhead: number, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找具有特定进度范围的Plan
   */
  findByProgressRange(
    minProgress: number, 
    maxProgress: number, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  /**
   * 查找包含特定任务状态的Plan
   */
  findByTaskStatus(
    taskStatus: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped',
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>>;

  // ===== 批量操作 =====

  /**
   * 批量保存Plan实体
   */
  saveMany(plans: PlanEntity[]): Promise<PlanEntity[]>;

  /**
   * 批量更新Plan实体
   */
  updateMany(plans: PlanEntity[]): Promise<PlanEntity[]>;

  /**
   * 批量删除Plan实体
   */
  deleteMany(planIds: UUID[]): Promise<number>;

  /**
   * 批量更新Plan状态
   */
  updateStatusMany(planIds: UUID[], status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'): Promise<number>;

  // ===== 事务操作 =====

  /**
   * 在事务中执行操作
   */
  transaction<T>(operation: (repository: IPlanRepository) => Promise<T>): Promise<T>;

  /**
   * 开始事务
   */
  beginTransaction(): Promise<void>;

  /**
   * 提交事务
   */
  commitTransaction(): Promise<void>;

  /**
   * 回滚事务
   */
  rollbackTransaction(): Promise<void>;
}
