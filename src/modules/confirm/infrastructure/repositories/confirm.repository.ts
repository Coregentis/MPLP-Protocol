/**
 * Confirm仓库实现
 *
 * 基础设施层的数据访问实现
 * 支持企业级审批工作流和复杂查询
 * 基于完整的Schema定义实现数据持久化
 *
 * @version 1.0.0
 * @created 2025-08-18
 */

import { UUID } from '../../../../public/shared/types';
import { Confirm } from '../../domain/entities/confirm.entity';
import {
  IConfirmRepository,
  ConfirmFilter,
  PaginationOptions,
  PaginatedResult
} from '../../domain/repositories/confirm-repository.interface';
import { ConfirmEntityData } from '../../api/mappers/confirm.mapper';
import {
  ConfirmStatus,
  ConfirmationType,
  Priority,
} from '../../types';

// 扩展的过滤器接口，支持企业级审批功能
export interface ExtendedConfirmFilter extends ConfirmFilter {
  workflowType?: 'single_approver' | 'sequential' | 'parallel' | 'consensus' | 'escalation';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  approverId?: string;
  escalated?: boolean;
  complianceStatus?: 'passed' | 'failed' | 'pending' | 'not_applicable';
  aiRecommendation?: 'approve' | 'reject' | 'review';
  tags?: string[];
  fullTextSearch?: string;
}

// 排序选项
export interface SortOptions {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'approvalTimeHours' | 'riskScore';
  direction: 'asc' | 'desc';
}

// 聚合查询结果
export interface AggregationResult {
  totalCount: number;
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  workflowTypeCounts: Record<string, number>;
  riskLevelCounts: Record<string, number>;
  averageApprovalTimeHours: number;
  escalationRate: number;
  complianceRate: number;
}

/**
 * 企业级审批确认仓库实现
 *
 * 支持复杂审批工作流的数据持久化和查询
 * 注意：这是一个内存实现，生产环境中应该使用真实的数据库实现
 */
export class ConfirmRepository implements IConfirmRepository {
  private confirms: Map<UUID, ConfirmEntityData> = new Map();
  private searchIndex: Map<string, Set<UUID>> = new Map(); // 全文搜索索引
  private tagIndex: Map<string, Set<UUID>> = new Map(); // 标签索引

  /**
   * 保存确认
   */
  async save(confirm: Confirm): Promise<void> {
    // 转换为EntityData进行存储
    const confirmData = confirm.toData();
    this.confirms.set(confirmData.confirmId, confirmData);

    // 更新搜索索引
    this.updateSearchIndex(confirmData);

    // 更新标签索引
    this.updateTagIndex(confirmData);
  }

  /**
   * 根据ID查找确认
   */
  async findById(confirmId: UUID): Promise<Confirm | null> {
    const confirmData = this.confirms.get(confirmId);
    return confirmData ? new Confirm(confirmData) : null;
  }

  /**
   * 更新确认
   */
  async update(confirm: Confirm): Promise<void> {
    const confirmData = confirm.toData();
    if (!this.confirms.has(confirmData.confirmId)) {
      throw new Error(`确认 ${confirmData.confirmId} 不存在`);
    }

    // 更新数据
    confirmData.updatedAt = new Date();
    this.confirms.set(confirmData.confirmId, confirmData);

    // 更新索引
    this.updateSearchIndex(confirmData);
    this.updateTagIndex(confirmData);
  }

  /**
   * 删除确认
   */
  async delete(confirmId: UUID): Promise<void> {
    const confirmData = this.confirms.get(confirmId);
    if (confirmData) {
      this.confirms.delete(confirmId);

      // 清理索引
      this.removeFromSearchIndex(confirmData);
      this.removeFromTagIndex(confirmData);
    }
  }

  /**
   * 根据上下文ID查找确认列表
   */
  async findByContextId(contextId: UUID): Promise<Confirm[]> {
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.contextId === contextId)
      .map(confirmData => new Confirm(confirmData));
  }

  /**
   * 根据计划ID查找确认列表
   */
  async findByPlanId(planId: UUID): Promise<Confirm[]> {
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.planId === planId)
      .map(confirmData => new Confirm(confirmData));
  }

  /**
   * 根据审批者ID查找确认列表
   */
  async findByApproverId(approverId: string): Promise<ConfirmEntityData[]> {
    return Array.from(this.confirms.values())
      .filter(confirm =>
        confirm.approvalWorkflow.steps.some(step =>
          step.approvers?.some(approver => approver.approverId === approverId)
        )
      );
  }

  /**
   * 查找待审批的确认列表
   */
  async findPendingApprovals(approverId: string): Promise<ConfirmEntityData[]> {
    return Array.from(this.confirms.values())
      .filter(confirm =>
        confirm.status === ConfirmStatus.PENDING &&
        confirm.approvalWorkflow.steps.some(step =>
          step.approvers?.some(approver => approver.approverId === approverId) &&
          step.status === 'pending'
        )
      );
  }

  /**
   * 查找已升级的确认列表 (使用IN_REVIEW状态表示升级)
   */
  async findEscalatedConfirms(): Promise<ConfirmEntityData[]> {
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.status === ConfirmStatus.IN_REVIEW);
  }

  /**
   * 根据风险级别查找确认列表
   */
  async findByRiskLevel(riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<ConfirmEntityData[]> {
    return Array.from(this.confirms.values())
      .filter(confirm => {
        // 检查impactAssessment中的riskLevel
        if (typeof confirm.subject.impactAssessment === 'object' &&
            confirm.subject.impactAssessment.riskLevel === riskLevel) {
          return true;
        }
        return false;
      });
  }

  /**
   * 全文搜索
   */
  async fullTextSearch(query: string): Promise<ConfirmEntityData[]> {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const matchingIds = new Set<UUID>();

    for (const term of searchTerms) {
      const ids = this.searchIndex.get(term);
      if (ids) {
        if (matchingIds.size === 0) {
          ids.forEach(id => matchingIds.add(id));
        } else {
          // 交集操作
          const intersection = new Set<UUID>();
          matchingIds.forEach(id => {
            if (ids.has(id)) {
              intersection.add(id);
            }
          });
          matchingIds.clear();
          intersection.forEach(id => matchingIds.add(id));
        }
      }
    }

    return Array.from(matchingIds)
      .map(id => this.confirms.get(id))
      .filter((confirm): confirm is ConfirmEntityData => confirm !== undefined);
  }

  /**
   * 根据标签查找确认列表
   */
  async findByTags(tags: string[]): Promise<ConfirmEntityData[]> {
    const matchingIds = new Set<UUID>();

    for (const tag of tags) {
      const ids = this.tagIndex.get(tag.toLowerCase());
      if (ids) {
        ids.forEach(id => matchingIds.add(id));
      }
    }

    return Array.from(matchingIds)
      .map(id => this.confirms.get(id))
      .filter((confirm): confirm is ConfirmEntityData => confirm !== undefined);
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
      const afterDate = new Date(filter.createdAfter);
      results = results.filter(confirm => confirm.createdAt >= afterDate);
    }

    if (filter.createdBefore) {
      const beforeDate = new Date(filter.createdBefore);
      results = results.filter(confirm => confirm.createdAt <= beforeDate);
    }

    if (filter.expiresAfter) {
      const afterDate = new Date(filter.expiresAfter);
      results = results.filter(confirm =>
        confirm.expiresAt && confirm.expiresAt >= afterDate
      );
    }

    if (filter.expiresBefore) {
      const beforeDate = new Date(filter.expiresBefore);
      results = results.filter(confirm =>
        confirm.expiresAt && confirm.expiresAt <= beforeDate
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
      items: paginatedResults.map(confirmData => new Confirm(confirmData)),
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

    return results.map(confirmData => new Confirm(confirmData));
  }

  /**
   * 查找已过期的确认
   */
  async findExpired(): Promise<Confirm[]> {
    const now = new Date();
    return Array.from(this.confirms.values())
      .filter(confirm => confirm.expiresAt && confirm.expiresAt < now)
      .map(confirmData => new Confirm(confirmData));
  }



  /**
   * 批量更新状态
   */
  async batchUpdateStatus(confirmIds: UUID[], status: ConfirmStatus): Promise<void> {
    for (const confirmId of confirmIds) {
      const confirmData = this.confirms.get(confirmId);
      if (confirmData) {
        // 创建Confirm实体，更新状态，然后保存
        const confirm = new Confirm(confirmData);
        confirm.updateStatus(status.toString());
        await this.save(confirm);
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
  private getPropertyValue(confirm: ConfirmEntityData, property: string): string {
    switch (property) {
      case 'created_at':
        return confirm.createdAt.toISOString();
      case 'updated_at':
        return confirm.updatedAt.toISOString();
      case 'priority':
        return confirm.priority;
      case 'status':
        return confirm.status;
      default:
        return confirm.createdAt.toISOString();
    }
  }

  /**
   * 应用扩展过滤器
   */
  private applyExtendedFilter(confirms: ConfirmEntityData[], filter: ExtendedConfirmFilter): ConfirmEntityData[] {
    let results = confirms;

    // 基础过滤器
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

    // 扩展过滤器
    if (filter.workflowType) {
      results = results.filter(confirm => confirm.approvalWorkflow.workflowType === filter.workflowType);
    }

    if (filter.riskLevel) {
      results = results.filter(confirm => {
        // 检查impactAssessment中的riskLevel
        if (typeof confirm.subject.impactAssessment === 'object' &&
            confirm.subject.impactAssessment.riskLevel === filter.riskLevel) {
          return true;
        }
        return false;
      });
    }

    if (filter.approverId) {
      results = results.filter(confirm =>
        confirm.approvalWorkflow.steps.some(step =>
          step.approvers?.some(approver => approver.approverId === filter.approverId)
        )
      );
    }

    if (filter.escalated !== undefined) {
      results = results.filter(confirm =>
        filter.escalated ? confirm.status === ConfirmStatus.IN_REVIEW : confirm.status !== ConfirmStatus.IN_REVIEW
      );
    }

    if (filter.fullTextSearch) {
      const searchResults = this.performFullTextSearch(results, filter.fullTextSearch);
      results = searchResults;
    }

    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(confirm => {
        // 简化标签搜索：在标题和描述中搜索
        const searchText = `${confirm.subject.title} ${confirm.subject.description}`.toLowerCase();
        return filter.tags!.some(tag => searchText.includes(tag.toLowerCase()));
      });
    }

    return results;
  }

  /**
   * 执行全文搜索
   */
  private performFullTextSearch(confirms: ConfirmEntityData[], query: string): ConfirmEntityData[] {
    const searchTerms = query.toLowerCase().split(/\s+/);

    return confirms.filter(confirm => {
      const searchableText = [
        confirm.subject.title,
        confirm.subject.description,
        confirm.requester.name,
        confirm.requester.email,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  /**
   * 根据分数获取风险级别
   */
  private _getRiskLevelFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * 更新搜索索引
   */
  private updateSearchIndex(confirmData: ConfirmEntityData): void {
    const searchableText = [
      confirmData.subject.title,
      confirmData.subject.description,
      confirmData.requester.name,
      confirmData.requester.email,
    ].join(' ').toLowerCase();

    const words = searchableText.split(/\s+/).filter(word => word.length > 2);

    words.forEach(word => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word)!.add(confirmData.confirmId);
    });
  }

  /**
   * 更新标签索引（简化版本）
   */
  private updateTagIndex(confirmData: ConfirmEntityData): void {
    // 简化标签索引：基于标题和描述生成标签
    const words = `${confirmData.subject.title} ${confirmData.subject.description}`
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);

    words.forEach(word => {
      if (!this.tagIndex.has(word)) {
        this.tagIndex.set(word, new Set());
      }
      this.tagIndex.get(word)!.add(confirmData.confirmId);
    });
  }

  /**
   * 从搜索索引中移除
   */
  private removeFromSearchIndex(confirmData: ConfirmEntityData): void {
    this.searchIndex.forEach((ids, word) => {
      ids.delete(confirmData.confirmId);
      if (ids.size === 0) {
        this.searchIndex.delete(word);
      }
    });
  }

  /**
   * 从标签索引中移除
   */
  private removeFromTagIndex(confirmData: ConfirmEntityData): void {
    this.tagIndex.forEach((ids, tag) => {
      ids.delete(confirmData.confirmId);
      if (ids.size === 0) {
        this.tagIndex.delete(tag);
      }
    });
  }

  /**
   * 获取聚合统计信息
   */
  async getAggregationResult(filter?: ExtendedConfirmFilter): Promise<AggregationResult> {
    let confirms = Array.from(this.confirms.values());

    // 应用过滤器
    if (filter) {
      confirms = this.applyExtendedFilter(confirms, filter);
    }

    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const workflowTypeCounts: Record<string, number> = {};
    const riskLevelCounts: Record<string, number> = {};

    let totalApprovalTime = 0;
    let approvalCount = 0;
    let escalationCount = 0;
    let compliancePassCount = 0;
    let complianceCheckCount = 0;

    confirms.forEach(confirm => {
      // 状态统计
      statusCounts[confirm.status] = (statusCounts[confirm.status] || 0) + 1;

      // 类型统计
      typeCounts[confirm.confirmationType] = (typeCounts[confirm.confirmationType] || 0) + 1;

      // 优先级统计
      priorityCounts[confirm.priority] = (priorityCounts[confirm.priority] || 0) + 1;

      // 工作流类型统计
      if (confirm.approvalWorkflow.workflowType) {
        workflowTypeCounts[confirm.approvalWorkflow.workflowType] =
          (workflowTypeCounts[confirm.approvalWorkflow.workflowType] || 0) + 1;
      }

      // 风险级别统计（简化版本）
      const riskLevel = typeof confirm.subject.impactAssessment === 'object' &&
                       confirm.subject.impactAssessment.riskLevel ?
                       confirm.subject.impactAssessment.riskLevel : 'low';
      riskLevelCounts[riskLevel] = (riskLevelCounts[riskLevel] || 0) + 1;

      // 审批时间统计（简化版本）
      const timeDiff = confirm.updatedAt.getTime() - confirm.createdAt.getTime();
      const approvalTimeHours = timeDiff / (1000 * 60 * 60);
      if (confirm.status === ConfirmStatus.APPROVED || confirm.status === ConfirmStatus.REJECTED) {
        totalApprovalTime += approvalTimeHours;
        approvalCount++;
      }

      // 升级统计（使用IN_REVIEW状态）
      if (confirm.status === ConfirmStatus.IN_REVIEW) {
        escalationCount++;
      }

      // 合规统计（简化版本）
      complianceCheckCount++;
      if (confirm.status === ConfirmStatus.APPROVED) {
        compliancePassCount++;
      }
    });

    return {
      totalCount: confirms.length,
      statusCounts,
      typeCounts,
      priorityCounts,
      workflowTypeCounts,
      riskLevelCounts,
      averageApprovalTimeHours: approvalCount > 0 ? totalApprovalTime / approvalCount : 0,
      escalationRate: confirms.length > 0 ? escalationCount / confirms.length : 0,
      complianceRate: complianceCheckCount > 0 ? compliancePassCount / complianceCheckCount : 1,
    };
  }

  /**
   * 批量保存确认
   */
  async saveBatch(confirmDataList: ConfirmEntityData[]): Promise<void> {
    for (const confirmData of confirmDataList) {
      const confirmEntity = new Confirm(confirmData);
      await this.save(confirmEntity);
    }
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
    this.searchIndex.clear();
    this.tagIndex.clear();
  }

  /**
   * 获取确认总数
   */
  async count(): Promise<number> {
    return this.confirms.size;
  }
}
