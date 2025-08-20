/**
 * Context Repository实现 - MPLP v1.0 内存存储
 *
 * 基于内存的Context仓库实现
 * 支持完整的14个功能域
 *
 * @version 1.0.0
 * @updated 2025-08-14
 */

import { UUID } from '../../../../public/shared/types';
import { Context } from '../../domain/entities/context.entity';
import {
  IContextRepository,
  ContextFilter,
  ContextSortField,
  PaginationParams,
  PaginatedResult
} from '../../domain/repositories/context-repository.interface';

/**
 * 内存Context仓库实现 - MPLP v1.0
 */
export class ContextRepository implements IContextRepository {
  private contexts: Map<UUID, Context> = new Map();

  /**
   * 通过ID查找Context
   */
  async findById(id: UUID): Promise<Context | null> {
    const context = this.contexts.get(id);
    return context ? context.clone() : null;
  }

  /**
   * 保存Context
   */
  async save(context: Context): Promise<void> {
    this.contexts.set(context.contextId, context.clone());
  }

  /**
   * 删除Context
   */
  async delete(id: UUID): Promise<void> {
    this.contexts.delete(id);
  }

  /**
   * 检查Context是否存在
   */
  async exists(id: UUID): Promise<boolean> {
    return this.contexts.has(id);
  }

  /**
   * 通过名称查找Context
   */
  async findByName(name: string): Promise<Context | null> {
    for (const context of Array.from(this.contexts.values())) {
      if (context.name === name) {
        return context.clone();
      }
    }
    return null;
  }

  /**
   * 查找多个Context
   */
  async findMany(filter?: ContextFilter, pagination?: PaginationParams): Promise<PaginatedResult<Context>> {
    let filteredContexts = Array.from(this.contexts.values());

    // 应用过滤器
    if (filter) {
      filteredContexts = this.applyFilter(filteredContexts, filter);
    }

    // 应用排序
    if (pagination?.sortField) {
      filteredContexts = this.applySorting(filteredContexts, pagination.sortField, pagination.sortOrder || 'asc');
    }

    // 应用分页
    const total = filteredContexts.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const items = filteredContexts
      .slice(startIndex, endIndex)
      .map(context => context.clone());

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 统计Context数量
   */
  async count(filter?: ContextFilter): Promise<number> {
    if (!filter) {
      return this.contexts.size;
    }

    const filteredContexts = this.applyFilter(Array.from(this.contexts.values()), filter);
    return filteredContexts.length;
  }

  /**
   * 批量保存Context
   */
  async saveMany(contexts: Context[]): Promise<void> {
    for (const context of contexts) {
      await this.save(context);
    }
  }

  /**
   * 批量删除Context
   */
  async deleteMany(ids: UUID[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  // ===== 功能域特定查询 =====

  /**
   * 查找具有特定共享状态的Context
   */
  async findBySharedState(variables: Record<string, unknown>): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      const contextVariables = context.sharedState?.variables || {};
      let matches = true;
      
      for (const [key, value] of Object.entries(variables)) {
        if (contextVariables[key] !== value) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有特定访问控制的Context
   */
  async findByOwner(userId: string): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.accessControl?.owner?.userId === userId) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有特定配置的Context
   */
  async findByConfiguration(storageBackend: string): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if ((context.configuration.persistence as { storageBackend?: string })?.storageBackend === storageBackend) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找启用审计的Context
   */
  async findWithAuditEnabled(): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.auditTrail.enabled) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找启用监控的Context
   */
  async findWithMonitoringEnabled(): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.monitoringIntegration.enabled) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有特定性能配置的Context
   */
  async findByPerformanceConfig(collectionInterval: number): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.performanceMetrics.collectionIntervalSeconds === collectionInterval) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找启用版本控制的Context
   */
  async findWithVersioningEnabled(): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.versionHistory.enabled) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有特定搜索配置的Context
   */
  async findBySearchConfig(indexingStrategy: string): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.searchMetadata.indexingStrategy === indexingStrategy) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有特定缓存策略的Context
   */
  async findByCacheStrategy(strategy: string): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.cachingPolicy.cacheStrategy === strategy) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有特定同步配置的Context
   */
  async findBySyncStrategy(strategy: string): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.syncConfiguration.syncStrategy === strategy) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找启用错误处理的Context
   */
  async findWithErrorHandlingEnabled(): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.errorHandling.enabled) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有集成端点的Context
   */
  async findWithIntegrationEndpoints(): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.integrationEndpoints.enabled) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  /**
   * 查找具有事件集成的Context
   */
  async findWithEventIntegration(): Promise<Context[]> {
    const results: Context[] = [];
    
    for (const context of Array.from(this.contexts.values())) {
      if (context.eventIntegration.enabled) {
        results.push(context.clone());
      }
    }
    
    return results;
  }

  // ===== 私有辅助方法 =====

  /**
   * 应用过滤器
   */
  private applyFilter(contexts: Context[], filter: ContextFilter): Context[] {
    return contexts.filter(context => {
      // 基础字段过滤
      if (filter.name && !context.name.includes(filter.name)) return false;
      if (filter.status && context.status !== filter.status) return false;
      if (filter.lifecycleStage && context.lifecycleStage !== filter.lifecycleStage) return false;
      if (filter.protocolVersion && context.protocolVersion !== filter.protocolVersion) return false;
      
      // 时间范围过滤
      if (filter.timestampAfter && context.timestamp < filter.timestampAfter) return false;
      if (filter.timestampBefore && context.timestamp > filter.timestampBefore) return false;
      
      // 审计过滤
      if (filter.auditEnabled !== undefined && context.auditTrail.enabled !== filter.auditEnabled) return false;
      
      // 监控过滤
      if (filter.monitoringEnabled !== undefined && context.monitoringIntegration.enabled !== filter.monitoringEnabled) return false;
      
      // 其他过滤条件...
      
      return true;
    });
  }

  /**
   * 应用排序
   */
  private applySorting(contexts: Context[], sortField: ContextSortField, sortOrder: 'asc' | 'desc'): Context[] {
    return contexts.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'desc') {
        [aValue, bValue] = [bValue, aValue];
      }
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  }

  // ===== 聚合查询 =====

  /**
   * 获取状态统计
   */
  async getStatusStatistics(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};

    for (const context of Array.from(this.contexts.values())) {
      const status = context.status;
      stats[status] = (stats[status] || 0) + 1;
    }

    return stats;
  }

  /**
   * 获取生命周期阶段统计
   */
  async getLifecycleStageStatistics(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};

    for (const context of Array.from(this.contexts.values())) {
      const stage = context.lifecycleStage || 'planning';
      stats[stage] = (stats[stage] || 0) + 1;
    }

    return stats;
  }

  /**
   * 获取功能域启用统计
   */
  async getFeatureDomainStatistics(): Promise<{
    auditEnabled: number;
    monitoringEnabled: number;
    performanceEnabled: number;
    versioningEnabled: number;
    searchEnabled: number;
    cachingEnabled: number;
    syncEnabled: number;
    errorHandlingEnabled: number;
    integrationEnabled: number;
    eventIntegrationEnabled: number;
  }> {
    const stats = {
      auditEnabled: 0,
      monitoringEnabled: 0,
      performanceEnabled: 0,
      versioningEnabled: 0,
      searchEnabled: 0,
      cachingEnabled: 0,
      syncEnabled: 0,
      errorHandlingEnabled: 0,
      integrationEnabled: 0,
      eventIntegrationEnabled: 0
    };

    for (const context of Array.from(this.contexts.values())) {
      if (context.auditTrail.enabled) stats.auditEnabled++;
      if (context.monitoringIntegration.enabled) stats.monitoringEnabled++;
      if (context.performanceMetrics.enabled) stats.performanceEnabled++;
      if (context.versionHistory.enabled) stats.versioningEnabled++;
      if (context.searchMetadata.enabled) stats.searchEnabled++;
      if (context.cachingPolicy.enabled) stats.cachingEnabled++;
      if (context.syncConfiguration.enabled) stats.syncEnabled++;
      if (context.errorHandling.enabled) stats.errorHandlingEnabled++;
      if (context.integrationEndpoints.enabled) stats.integrationEnabled++;
      if (context.eventIntegration.enabled) stats.eventIntegrationEnabled++;
    }

    return stats;
  }

  /**
   * 获取配置分布统计
   */
  async getConfigurationStatistics(): Promise<{
    storageBackends: Record<string, number>;
    cacheStrategies: Record<string, number>;
    syncStrategies: Record<string, number>;
    indexingStrategies: Record<string, number>;
  }> {
    const stats = {
      storageBackends: {} as Record<string, number>,
      cacheStrategies: {} as Record<string, number>,
      syncStrategies: {} as Record<string, number>,
      indexingStrategies: {} as Record<string, number>
    };

    for (const context of Array.from(this.contexts.values())) {
      // 存储后端统计
      const storageBackend = (context.configuration.persistence as { storageBackend?: string })?.storageBackend || 'unknown';
      stats.storageBackends[storageBackend] = (stats.storageBackends[storageBackend] || 0) + 1;

      // 缓存策略统计
      const cacheStrategy = context.cachingPolicy.cacheStrategy;
      stats.cacheStrategies[cacheStrategy] = (stats.cacheStrategies[cacheStrategy] || 0) + 1;

      // 同步策略统计
      const syncStrategy = context.syncConfiguration.syncStrategy;
      stats.syncStrategies[syncStrategy] = (stats.syncStrategies[syncStrategy] || 0) + 1;

      // 索引策略统计
      const indexingStrategy = context.searchMetadata.indexingStrategy;
      stats.indexingStrategies[indexingStrategy] = (stats.indexingStrategies[indexingStrategy] || 0) + 1;
    }

    return stats;
  }
}
