/**
 * Confirm仓库实现
 * 
 * 基础设施层的数据访问实现
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Confirm } from '../../domain/entities/confirm.entity';
import { 
  IConfirmRepository, 
  ConfirmFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/repositories/confirm-repository.interface';
import { ConfirmStatus, ConfirmationType, Priority } from '../../types';

/**
 * Confirm仓库实现
 * 
 * 注意：这是一个内存实现，生产环境中应该使用真实的数据库实现
 */
export class ConfirmRepository implements IConfirmRepository {
  private confirms: Map<UUID, Confirm> = new Map();

  /**
   * 保存确认
   */
  async save(confirm: Confirm): Promise<void> {
    this.confirms.set(confirm.confirmId, confirm);
  }

  /**
   * 根据ID查找确认
   */
  async findById(confirmId: UUID): Promise<Confirm | null> {
    return this.confirms.get(confirmId) || null;
  }

  /**
   * 根据上下文ID查找确认列表
   */
  async findByContextId(contextId: UUID): Promise<Confirm[]> {
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.contextId === contextId);
  }

  /**
   * 根据计划ID查找确认列表
   */
  async findByPlanId(planId: UUID): Promise<Confirm[]> {
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.planId === planId);
  }

  /**
   * 根据过滤器查找确认列表
   */
  async findByFilter(
    filter: ConfirmFilter, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Confirm>> {
    let results = Array.from(this.confirms.values());

    // 应用过滤器
    if (filter.contextId) {
      results = results.filter(confirm => confirm.contextId === filter.contextId);
    }

    if (filter.planId) {
      results = results.filter(confirm => confirm.planId === filter.planId);
    }

    if (filter.confirmationType) {
      results = results.filter(confirm => confirm.confirmationType === filter.confirmationType);
    }

    if (filter.status) {
      results = results.filter(confirm => confirm.status === filter.status);
    }

    if (filter.priority) {
      results = results.filter(confirm => confirm.priority === filter.priority);
    }

    if (filter.requesterId) {
      results = results.filter(confirm => confirm.requester.userId === filter.requesterId);
    }

    if (filter.createdAfter) {
      results = results.filter(confirm => confirm.createdAt >= filter.createdAfter!);
    }

    if (filter.createdBefore) {
      results = results.filter(confirm => confirm.createdAt <= filter.createdBefore!);
    }

    if (filter.expiresAfter) {
      results = results.filter(confirm =>
        confirm.expires_at && confirm.expires_at >= filter.expiresAfter!
      );
    }

    if (filter.expiresBefore) {
      results = results.filter(confirm =>
        confirm.expires_at && confirm.expires_at <= filter.expiresBefore!
      );
    }

    // 排序
    if (pagination?.sort_by) {
      results.sort((a, b) => {
        const aValue = this.getPropertyValue(a, pagination.sort_by!);
        const bValue = this.getPropertyValue(b, pagination.sort_by!);
        
        if (pagination.sort_order === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    // 分页
    const total = results.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;
    
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      items: paginatedResults,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    };
  }

  /**
   * 查找待处理的确认
   */
  async findPending(userId?: string): Promise<Confirm[]> {
    let results = Array.from(this.confirms.values())
      .filter(confirm => confirm.status === 'pending' || confirm.status === 'in_review');

    if (userId) {
      // 这里应该根据用户角色和审批工作流来过滤
      // 简化实现：只返回该用户创建的确认
      results = results.filter(confirm => confirm.requester.userId === userId);
    }

    return results;
  }

  /**
   * 查找已过期的确认
   */
  async findExpired(): Promise<Confirm[]> {
    const now = new Date();
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.expires_at && new Date(confirm.expires_at) < now);
  }

  /**
   * 更新确认
   */
  async update(confirm: Confirm): Promise<void> {
    this.confirms.set(confirm.confirmId, confirm);
  }

  /**
   * 删除确认
   */
  async delete(confirmId: UUID): Promise<void> {
    this.confirms.delete(confirmId);
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(confirmIds: UUID[], status: ConfirmStatus): Promise<void> {
    for (const confirmId of confirmIds) {
      const confirm = this.confirms.get(confirmId);
      if (confirm) {
        confirm.updateStatus(status);
        this.confirms.set(confirmId, confirm);
      }
    }
  }

  /**
   * 检查确认是否存在
   */
  async exists(confirmId: UUID): Promise<boolean> {
    return this.confirms.has(confirmId);
  }

  /**
   * 获取统计信息
   */
  async getStatistics(contextId?: UUID): Promise<{
    total: number;
    by_status: Record<ConfirmStatus, number>;
    by_type: Record<ConfirmationType, number>;
    by_priority: Record<Priority, number>;
  }> {
    let confirms = Array.from(this.confirms.values());
    
    if (contextId) {
      confirms = confirms.filter(confirm => confirm.contextId === contextId);
    }

    const total = confirms.length;
    
    const by_status = confirms.reduce((acc, confirm) => {
      acc[confirm.status] = (acc[confirm.status] || 0) + 1;
      return acc;
    }, {} as Record<ConfirmStatus, number>);

    const by_type = confirms.reduce((acc, confirm) => {
      acc[confirm.confirmationType] = (acc[confirm.confirmationType] || 0) + 1;
      return acc;
    }, {} as Record<ConfirmationType, number>);

    const by_priority = confirms.reduce((acc, confirm) => {
      acc[confirm.priority] = (acc[confirm.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    return {
      total,
      by_status,
      by_type,
      by_priority
    };
  }

  /**
   * 获取属性值用于排序
   */
  private getPropertyValue(confirm: Confirm, property: string): string {
    switch (property) {
      case 'created_at':
        return confirm.createdAt;
      case 'updated_at':
        return confirm.updatedAt;
      case 'priority':
        return confirm.priority;
      case 'status':
        return confirm.status;
      default:
        return confirm.createdAt;
    }
  }
}
