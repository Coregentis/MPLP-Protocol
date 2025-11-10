/**
 * Confirm内存仓库实现
 * 
 * @description Confirm模块的内存仓库实现，用于开发和测试
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 */

import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { 
  IConfirmRepository, 
  PaginationParams, 
  PaginatedResult, 
  ConfirmQueryFilter 
} from '../../domain/repositories/confirm-repository.interface';
import { UUID } from '../../types';

/**
 * 内存Confirm仓库实现
 * 
 * @description 基于内存存储的Confirm仓库实现，提供完整的CRUD操作
 */
export class MemoryConfirmRepository implements IConfirmRepository {
  private confirms: Map<UUID, ConfirmEntity> = new Map();

  /**
   * 创建确认
   */
  async create(confirm: ConfirmEntity): Promise<ConfirmEntity> {
    this.confirms.set(confirm.confirmId, confirm);
    return confirm;
  }

  /**
   * 根据ID获取确认
   */
  async findById(confirmId: UUID): Promise<ConfirmEntity | null> {
    return this.confirms.get(confirmId) || null;
  }

  /**
   * 更新确认
   */
  async update(confirmId: UUID, updates: Partial<ConfirmEntity>): Promise<ConfirmEntity> {
    const existing = this.confirms.get(confirmId);
    if (!existing) {
      throw new Error(`Confirm with ID ${confirmId} not found`);
    }

    // 创建更新后的实体
    const updated = new ConfirmEntity({
      protocolVersion: existing.protocolVersion,
      timestamp: new Date(),
      confirmId: existing.confirmId,
      contextId: existing.contextId,
      planId: existing.planId,
      confirmationType: updates.confirmationType || existing.confirmationType,
      status: updates.status || existing.status,
      priority: updates.priority || existing.priority,
      requester: updates.requester || existing.requester,
      approvalWorkflow: updates.approvalWorkflow || existing.approvalWorkflow,
      subject: updates.subject || existing.subject,
      riskAssessment: updates.riskAssessment || existing.riskAssessment
    });

    this.confirms.set(confirmId, updated);
    return updated;
  }

  /**
   * 删除确认
   */
  async delete(confirmId: UUID): Promise<void> {
    if (!this.confirms.has(confirmId)) {
      throw new Error(`Confirm with ID ${confirmId} not found`);
    }
    this.confirms.delete(confirmId);
  }

  /**
   * 列出所有确认
   */
  async findAll(pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const allConfirms = Array.from(this.confirms.values());
    return this.paginateResults(allConfirms, pagination);
  }

  /**
   * 根据条件查询确认
   */
  async findByFilter(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    let results = Array.from(this.confirms.values());

    // 应用过滤器
    if (filter.confirmationType && filter.confirmationType.length > 0) {
      const confirmationType = filter.confirmationType;
      results = results.filter(confirm => confirmationType.includes(confirm.confirmationType));
    }

    if (filter.status && filter.status.length > 0) {
      const status = filter.status;
      results = results.filter(confirm => status.includes(confirm.status));
    }

    if (filter.priority && filter.priority.length > 0) {
      const priority = filter.priority;
      results = results.filter(confirm => priority.includes(confirm.priority));
    }

    if (filter.requesterId) {
      results = results.filter(confirm => confirm.requester.userId === filter.requesterId);
    }

    if (filter.approverId) {
      results = results.filter(confirm => 
        confirm.approvalWorkflow.steps.some(step => step.approver.userId === filter.approverId)
      );
    }

    if (filter.contextId) {
      results = results.filter(confirm => confirm.contextId === filter.contextId);
    }

    if (filter.planId) {
      results = results.filter(confirm => confirm.planId === filter.planId);
    }

    if (filter.createdAfter) {
      const createdAfter = filter.createdAfter;
      results = results.filter(confirm => confirm.timestamp >= createdAfter);
    }

    if (filter.createdBefore) {
      const createdBefore = filter.createdBefore;
      results = results.filter(confirm => confirm.timestamp <= createdBefore);
    }

    if (filter.riskLevel && filter.riskLevel.length > 0) {
      const riskLevel = filter.riskLevel;
      results = results.filter(confirm => riskLevel.includes(confirm.riskAssessment.overallRiskLevel));
    }

    if (filter.workflowType && filter.workflowType.length > 0) {
      const workflowType = filter.workflowType;
      results = results.filter(confirm => workflowType.includes(confirm.approvalWorkflow.workflowType));
    }

    return this.paginateResults(results, pagination);
  }

  /**
   * 根据上下文ID查询确认
   */
  async findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => confirm.contextId === contextId);
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据计划ID查询确认
   */
  async findByPlanId(planId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => confirm.planId === planId);
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据请求者ID查询确认
   */
  async findByRequesterId(requesterId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => confirm.requester.userId === requesterId);
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据审批者ID查询确认
   */
  async findByApproverId(approverId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => 
      confirm.approvalWorkflow.steps.some(step => step.approver.userId === approverId)
    );
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据状态查询确认
   */
  async findByStatus(status: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => confirm.status === status);
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据确认类型查询确认
   */
  async findByType(confirmationType: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => confirm.confirmationType === confirmationType);
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据优先级查询确认
   */
  async findByPriority(priority: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>> {
    const results = Array.from(this.confirms.values()).filter(confirm => confirm.priority === priority);
    return this.paginateResults(results, pagination);
  }

  /**
   * 根据时间范围查询确认 - 基于Schema timestamp字段
   */
  async findByTimeRange(timeRange: { startDate: Date; endDate: Date }, pagination?: PaginationParams): Promise<ConfirmEntity[]> {
    const allConfirms = Array.from(this.confirms.values());

    const filteredConfirms = allConfirms.filter(confirm => {
      const confirmTime = confirm.timestamp.getTime();
      return confirmTime >= timeRange.startDate.getTime() && confirmTime <= timeRange.endDate.getTime();
    });

    // 应用分页
    if (pagination) {
      const offset = pagination.offset || ((pagination.page || 1) - 1) * (pagination.limit || 10);
      const limit = pagination.limit || 10;
      return filteredConfirms.slice(offset, offset + limit);
    }

    return filteredConfirms;
  }

  /**
   * 统计确认数量
   */
  async count(filter?: ConfirmQueryFilter): Promise<number> {
    if (!filter) {
      return this.confirms.size;
    }

    const results = await this.findByFilter(filter);
    return results.total;
  }

  /**
   * 检查确认是否存在
   */
  async exists(confirmId: UUID): Promise<boolean> {
    return this.confirms.has(confirmId);
  }

  /**
   * 批量创建确认
   */
  async createBatch(confirms: ConfirmEntity[]): Promise<ConfirmEntity[]> {
    const results: ConfirmEntity[] = [];
    for (const confirm of confirms) {
      const created = await this.create(confirm);
      results.push(created);
    }
    return results;
  }

  /**
   * 批量更新确认
   */
  async updateBatch(updates: Array<{ confirmId: UUID; updates: Partial<ConfirmEntity> }>): Promise<ConfirmEntity[]> {
    const results: ConfirmEntity[] = [];
    for (const { confirmId, updates: updateData } of updates) {
      const updated = await this.update(confirmId, updateData);
      results.push(updated);
    }
    return results;
  }

  /**
   * 批量删除确认
   */
  async deleteBatch(confirmIds: UUID[]): Promise<void> {
    for (const confirmId of confirmIds) {
      await this.delete(confirmId);
    }
  }

  /**
   * 清空所有确认
   */
  async clear(): Promise<void> {
    this.confirms.clear();
  }

  /**
   * 获取仓库统计信息
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const allConfirms = Array.from(this.confirms.values());
    
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const confirm of allConfirms) {
      byStatus[confirm.status] = (byStatus[confirm.status] || 0) + 1;
      byType[confirm.confirmationType] = (byType[confirm.confirmationType] || 0) + 1;
      byPriority[confirm.priority] = (byPriority[confirm.priority] || 0) + 1;
    }

    return {
      total: allConfirms.length,
      byStatus,
      byType,
      byPriority
    };
  }

  /**
   * 分页结果辅助方法
   */
  private paginateResults<T>(items: T[], pagination?: PaginationParams): PaginatedResult<T> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || (page - 1) * limit;

    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      hasNext: offset + limit < total,
      hasPrevious: offset > 0
    };
  }
}
