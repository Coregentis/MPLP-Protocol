/**
 * Plan仓库实现
 * 
 * @description Plan模块的仓库实现，提供数据持久化功能
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 * @pattern 与Context模块使用IDENTICAL的仓库实现模式
 */

import { PlanEntity } from '../../domain/entities/plan.entity';
import { IPlanRepository, PlanQueryFilter } from '../../domain/repositories/plan-repository.interface';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';

/**
 * Plan仓库实现
 * 
 * @description 基于内存的Plan仓库实现，支持完整的CRUD和查询操作
 * @pattern 与Context模块使用IDENTICAL的内存仓库模式
 * @note 生产环境中应替换为实际的数据库实现
 */
export class PlanRepository implements IPlanRepository {
  private plans: Map<UUID, PlanEntity> = new Map();
  private transactionActive = false;
  private transactionPlans: Map<UUID, PlanEntity> | null = null;

  // ===== 基础CRUD操作 =====

  async findById(planId: UUID): Promise<PlanEntity | null> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    return planMap.get(planId) || null;
  }

  async findByName(name: string): Promise<PlanEntity | null> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    for (const plan of planMap.values()) {
      if (plan.name === name) {
        return plan;
      }
    }
    return null;
  }

  async save(plan: PlanEntity): Promise<PlanEntity> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    planMap.set(plan.planId, plan);
    return plan;
  }

  async update(plan: PlanEntity): Promise<PlanEntity> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    if (!planMap.has(plan.planId)) {
      throw new Error(`Plan with ID ${plan.planId} not found`);
    }
    planMap.set(plan.planId, plan);
    return plan;
  }

  async delete(planId: UUID): Promise<boolean> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    return planMap.delete(planId);
  }

  async exists(planId: UUID): Promise<boolean> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    return planMap.has(planId);
  }

  // ===== 查询操作 =====

  async findAll(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    const allPlans = Array.from(planMap.values());
    return this.paginateResults(allPlans, pagination);
  }

  async findByFilter(
    filter: PlanQueryFilter, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    let filteredPlans = Array.from(planMap.values());

    // 应用过滤条件
    if (filter.contextId) {
      filteredPlans = filteredPlans.filter(plan => plan.contextId === filter.contextId);
    }

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      filteredPlans = filteredPlans.filter(plan => statuses.includes(plan.status));
    }

    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      filteredPlans = filteredPlans.filter(plan => plan.priority && priorities.includes(plan.priority));
    }

    if (filter.createdBy) {
      filteredPlans = filteredPlans.filter(plan => plan.createdBy === filter.createdBy);
    }

    if (filter.updatedBy) {
      filteredPlans = filteredPlans.filter(plan => plan.updatedBy === filter.updatedBy);
    }

    if (filter.createdAfter) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.createdAt && plan.createdAt >= filter.createdAfter!
      );
    }

    if (filter.createdBefore) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.createdAt && plan.createdAt <= filter.createdBefore!
      );
    }

    if (filter.updatedAfter) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.updatedAt && plan.updatedAt >= filter.updatedAfter!
      );
    }

    if (filter.updatedBefore) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.updatedAt && plan.updatedAt <= filter.updatedBefore!
      );
    }

    if (filter.namePattern) {
      const pattern = new RegExp(filter.namePattern, 'i');
      filteredPlans = filteredPlans.filter(plan => pattern.test(plan.name));
    }

    if (filter.descriptionPattern && filter.descriptionPattern.trim()) {
      const pattern = new RegExp(filter.descriptionPattern, 'i');
      filteredPlans = filteredPlans.filter(plan => 
        plan.description && pattern.test(plan.description)
      );
    }

    if (filter.hasActiveTasks !== undefined) {
      filteredPlans = filteredPlans.filter(plan => {
        const hasActiveTasks = plan.tasks.some(task => 
          task.status === 'running' || task.status === 'ready'
        );
        return hasActiveTasks === filter.hasActiveTasks;
      });
    }

    if (filter.progressMin !== undefined) {
      filteredPlans = filteredPlans.filter(plan => plan.getProgress() >= filter.progressMin!);
    }

    if (filter.progressMax !== undefined) {
      filteredPlans = filteredPlans.filter(plan => plan.getProgress() <= filter.progressMax!);
    }

    return this.paginateResults(filteredPlans, pagination);
  }

  async findByStatus(
    status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed' | Array<'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'>, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ status }, pagination);
  }

  async findByPriority(
    priority: 'critical' | 'high' | 'medium' | 'low' | Array<'critical' | 'high' | 'medium' | 'low'>, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ priority }, pagination);
  }

  async findByContextId(
    contextId: UUID, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ contextId }, pagination);
  }

  async findByCreatedBy(
    createdBy: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ createdBy }, pagination);
  }

  async searchByName(
    namePattern: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ namePattern }, pagination);
  }

  async searchByDescription(
    descriptionPattern: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ descriptionPattern }, pagination);
  }

  // ===== 统计操作 =====

  async count(): Promise<number> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    return planMap.size;
  }

  async countByStatus(status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'): Promise<number> {
    const result = await this.findByStatus(status);
    return result.total;
  }

  async countByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<number> {
    const result = await this.findByPriority(priority);
    return result.total;
  }

  async countByContextId(contextId: UUID): Promise<number> {
    const result = await this.findByContextId(contextId);
    return result.total;
  }

  async countByCreatedBy(createdBy: string): Promise<number> {
    const result = await this.findByCreatedBy(createdBy);
    return result.total;
  }

  // ===== 业务特定操作 =====

  async findActivePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>> {
    return this.findByStatus('active', pagination);
  }

  async findExecutablePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>> {
    return this.findByStatus(['approved', 'active'], pagination);
  }

  async findCompletedPlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>> {
    return this.findByStatus('completed', pagination);
  }

  async findHighPriorityPlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>> {
    return this.findByPriority(['critical', 'high'], pagination);
  }

  async findOverduePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>> {
    const now = new Date();
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    const overduePlans = Array.from(planMap.values()).filter(plan => {
      if (!plan.toData().timeline?.endDate) return false;
      const endDate = new Date(plan.toData().timeline!.endDate!);
      return endDate < now && plan.status !== 'completed' && plan.status !== 'cancelled';
    });
    
    return this.paginateResults(overduePlans, pagination);
  }

  async findUpcomingDeadlinePlans(
    daysAhead: number, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    
    const upcomingPlans = Array.from(planMap.values()).filter(plan => {
      if (!plan.toData().timeline?.endDate) return false;
      const endDate = new Date(plan.toData().timeline!.endDate!);
      return endDate >= now && endDate <= futureDate && plan.status !== 'completed' && plan.status !== 'cancelled';
    });
    
    return this.paginateResults(upcomingPlans, pagination);
  }

  async findByProgressRange(
    minProgress: number, 
    maxProgress: number, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    return this.findByFilter({ progressMin: minProgress, progressMax: maxProgress }, pagination);
  }

  async findByTaskStatus(
    taskStatus: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped',
    pagination?: PaginationParams
  ): Promise<PaginatedResult<PlanEntity>> {
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;
    const filteredPlans = Array.from(planMap.values()).filter(plan =>
      plan.tasks.some(task => task.status === taskStatus)
    );
    
    return this.paginateResults(filteredPlans, pagination);
  }

  // ===== 批量操作 =====

  async saveMany(plans: PlanEntity[]): Promise<PlanEntity[]> {
    const savedPlans: PlanEntity[] = [];
    for (const plan of plans) {
      savedPlans.push(await this.save(plan));
    }
    return savedPlans;
  }

  async updateMany(plans: PlanEntity[]): Promise<PlanEntity[]> {
    const updatedPlans: PlanEntity[] = [];
    for (const plan of plans) {
      updatedPlans.push(await this.update(plan));
    }
    return updatedPlans;
  }

  async deleteMany(planIds: UUID[]): Promise<number> {
    let deletedCount = 0;
    for (const planId of planIds) {
      if (await this.delete(planId)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async updateStatusMany(
    planIds: UUID[],
    status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'
  ): Promise<number> {
    let updatedCount = 0;
    const planMap = this.transactionActive ? this.transactionPlans! : this.plans;

    for (const planId of planIds) {
      const plan = planMap.get(planId);
      if (plan) {
        plan.update({ status });
        updatedCount++;
      }
    }
    return updatedCount;
  }

  // ===== 事务操作 =====

  async transaction<T>(operation: (repository: IPlanRepository) => Promise<T>): Promise<T> {
    await this.beginTransaction();
    try {
      const result = await operation(this);
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  async beginTransaction(): Promise<void> {
    if (this.transactionActive) {
      throw new Error('Transaction already active');
    }
    this.transactionActive = true;
    this.transactionPlans = new Map(this.plans);
  }

  async commitTransaction(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('No active transaction');
    }
    this.plans = this.transactionPlans!;
    this.transactionActive = false;
    this.transactionPlans = null;
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('No active transaction');
    }
    this.transactionActive = false;
    this.transactionPlans = null;
  }

  // ===== 私有辅助方法 =====

  private paginateResults<T>(
    items: T[],
    pagination?: PaginationParams
  ): PaginatedResult<T> {
    if (!pagination) {
      return {
        data: items,
        total: items.length,
        page: 1,
        limit: items.length,
        totalPages: 1
      };
    }

    const { page = 1, limit = 10, sortBy, sortOrder = 'asc' } = pagination;

    // 排序
    if (sortBy) {
      items.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortBy];
        const bValue = (b as Record<string, unknown>)[sortBy];

        // 类型安全的比较
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }

        // 默认字符串比较
        const aStr = String(aValue);
        const bStr = String(bValue);
        return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit)
    };
  }
}
