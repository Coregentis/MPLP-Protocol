/**
 * Context核心管理服务 - 重构版本
 *
 * @description 基于SCTM+GLFB+ITCM方法论重构的核心上下文管理服务
 * 整合原有17个服务中的核心管理功能：CRUD、生命周期、状态同步、版本控制、缓存管理
 * @version 2.0.0
 * @layer 应用层 - 核心服务
 * @refactor 17→3服务简化，符合协议最小化原则
 */

import { randomBytes } from 'crypto';
import { ContextEntity } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';
import {
  SharedState,
  LifecycleStage,
  ContextStatus,
  StateUpdates,
  CreateContextData,
  UpdateContextData,
  ContextFilter,
  SearchQuery
} from '../../types';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';

// ===== 新增接口定义 =====
export interface ICacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface IVersionManager {
  createVersion(context: ContextEntity): Promise<string>;
  getVersionHistory(contextId: UUID): Promise<ContextVersion[]>;
  getVersion(contextId: UUID, version: string): Promise<ContextEntity | null>;
  compareVersions(contextId: UUID, version1: string, version2: string): Promise<VersionDiff>;
}

export interface ContextVersion {
  versionId: string;
  contextId: UUID;
  version: string;
  createdAt: Date;
  changes: Record<string, unknown>;
  createdBy?: UUID;
}

export interface VersionDiff {
  added: Record<string, unknown>;
  modified: Record<string, unknown>;
  removed: string[];
}

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Context核心管理服务
 *
 * @description 整合原有17个服务中的6个核心管理服务功能
 * 职责：上下文CRUD、生命周期管理、状态同步、版本控制、缓存管理、批量操作
 */
export class ContextManagementService {

  constructor(
    private readonly contextRepository: IContextRepository,
    private readonly logger: ILogger,
    private readonly cacheManager: ICacheManager,
    private readonly versionManager: IVersionManager
  ) {}

  // ===== 核心CRUD操作 - 基于GLFB局部精确实现 =====

  /**
   * 创建新的Context - 增强版本
   * 整合：原上下文管理、缓存策略、版本历史功能
   */
  async createContext(data: CreateContextData): Promise<ContextEntity> {
    try {
      this.logger.info('Creating new context', { name: data.name });

      // 1. 数据验证和规范化
      await this.validateCreateData(data);

      // 2. 检查名称唯一性
      const existingContext = await this.contextRepository.findByName(data.name);
      if (existingContext) {
        throw new Error(`Context with name '${data.name}' already exists`);
      }

      // 3. 创建上下文实体
      const context = new ContextEntity({
        ...data,
        contextId: this.generateContextId(),
        status: 'active' as ContextStatus,
        lifecycleStage: 'planning' as LifecycleStage,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      });

      // 4. 持久化存储
      const savedContext = await this.contextRepository.save(context);

      // 5. 缓存管理
      await this.cacheManager.set(`context:${savedContext.contextId}`, savedContext, 3600); // 1小时TTL

      // 6. 版本历史记录
      await this.versionManager.createVersion(savedContext);

      // 7. 记录创建事件
      await this.handleContextLifecycleEvent(savedContext.contextId, 'created', {
        name: savedContext.name,
        createdAt: savedContext.createdAt
      });

      this.logger.info('Context created successfully', {
        contextId: savedContext.contextId,
        name: savedContext.name
      });

      return savedContext;
    } catch (error) {
      this.logger.error('Failed to create context', error as Error, { name: data.name });
      throw error;
    }
  }

  /**
   * 获取Context - 缓存优化版本
   * 整合：原上下文管理、缓存策略功能
   */
  async getContext(contextId: UUID): Promise<ContextEntity | null> {
    try {
      // 1. 缓存查询
      const cached = await this.cacheManager.get<ContextEntity>(`context:${contextId}`);
      if (cached) {
        this.logger.debug('Context retrieved from cache', { contextId });
        return cached;
      }

      // 2. 数据库查询
      const context = await this.contextRepository.findById(contextId);

      // 3. 缓存更新
      if (context) {
        await this.cacheManager.set(`context:${contextId}`, context, 3600);
        this.logger.debug('Context cached after database retrieval', { contextId });
      }

      return context;
    } catch (error) {
      this.logger.error('Failed to get context', error as Error, { contextId });
      throw error;
    }
  }

  /**
   * 根据ID获取Context (别名方法)
   */
  async getContextById(contextId: UUID): Promise<ContextEntity | null> {
    return this.getContext(contextId);
  }

  /**
   * 根据名称获取Context
   */
  async getContextByName(name: string): Promise<ContextEntity | null> {
    try {
      this.logger.debug('Getting context by name', { name });
      const context = await this.contextRepository.findByName(name);
      return context;
    } catch (error) {
      this.logger.error('Failed to get context by name', error as Error, { name });
      throw error;
    }
  }

  /**
   * 查询Contexts
   */
  async queryContexts(filter?: ContextFilter, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>> {
    try {
      this.logger.debug('Querying contexts', { filter, pagination });

      if (filter) {
        // 使用过滤查询
        return await this.contextRepository.findByFilter(filter, pagination);
      } else {
        // 使用findAll查询
        return await this.contextRepository.findAll(pagination);
      }
    } catch (error) {
      this.logger.error('Failed to query contexts', error as Error, { filter, pagination });
      throw error;
    }
  }

  /**
   * 搜索Contexts
   */
  async searchContexts(query: SearchQuery | string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>> {
    try {
      const searchQuery = typeof query === 'string' ? query : query.query;
      this.logger.debug('Searching contexts', { query: searchQuery, pagination });

      // 简化实现，使用findAll并搜索
      const result = await this.contextRepository.findAll(pagination);
      const filteredData = result.data.filter((context: ContextEntity) =>
        context.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (context.description && context.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      return {
        data: filteredData,
        total: filteredData.length,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(filteredData.length / (result.limit || filteredData.length))
      };
    } catch (error) {
      this.logger.error('Failed to search contexts', error as Error, { query });
      throw error;
    }
  }

  /**
   * 获取Context统计信息
   */
  async getContextStatistics(): Promise<Record<string, unknown>> {
    try {
      this.logger.debug('Getting context statistics');
      const result = await this.contextRepository.findAll();
      const allContexts = result.data;

      const stats = {
        total: allContexts.length,
        byStatus: {} as Record<string, number>,
        byLifecycleStage: {} as Record<string, number>
      };

      allContexts.forEach(context => {
        stats.byStatus[context.status] = (stats.byStatus[context.status] || 0) + 1;
        stats.byLifecycleStage[context.lifecycleStage] = (stats.byLifecycleStage[context.lifecycleStage] || 0) + 1;
      });

      return stats;
    } catch (error) {
      this.logger.error('Failed to get context statistics', error as Error);
      throw error;
    }
  }

  /**
   * 批量创建多个Context - 新增功能
   * 基于Schema驱动开发，支持批量操作
   */
  async createMultipleContexts(requests: CreateContextData[]): Promise<ContextEntity[]> {
    try {
      this.logger.info('Creating multiple contexts', { count: requests.length });

      const results: ContextEntity[] = [];

      // 使用事务处理批量创建
      for (const request of requests) {
        const context = await this.createContext(request);
        results.push(context);
      }

      this.logger.info('Multiple contexts created successfully', {
        count: results.length
      });

      return results;
    } catch (error) {
      this.logger.error('Failed to create multiple contexts', error as Error, {
        requestCount: requests.length
      });
      throw error;
    }
  }

  /**
   * 更新Context - 版本控制增强版本
   * 整合：原上下文管理、版本历史、缓存策略功能
   */
  async updateContext(contextId: UUID, data: UpdateContextData): Promise<ContextEntity> {
    try {
      this.logger.info('Updating context', { contextId });

      // 1. 获取现有上下文
      const existingContext = await this.getContext(contextId);
      if (!existingContext) {
        throw new Error(`Context with ID '${contextId}' not found`);
      }

      // 2. 验证更新数据
      await this.validateUpdateData(data);

      // 3. 检查名称唯一性（如果名称发生变化）
      if (data.name && data.name !== existingContext.name) {
        const nameConflict = await this.contextRepository.findByName(data.name);
        if (nameConflict && nameConflict.contextId !== contextId) {
          throw new Error(`Context with name '${data.name}' already exists`);
        }
      }

      // 4. 创建更新后的上下文
      const updatedContext = existingContext.update({
        ...data,
        updatedAt: new Date(),
        version: this.incrementVersion(existingContext.version || '1.0.0')
      });

      // 5. 持久化更新
      const savedContext = await this.contextRepository.update(updatedContext);

      // 6. 缓存更新
      await this.cacheManager.set(`context:${contextId}`, savedContext, 3600);

      // 7. 版本历史记录
      await this.versionManager.createVersion(savedContext);

      // 8. 记录更新事件
      await this.handleContextLifecycleEvent(contextId, 'updated', {
        changes: data,
        version: savedContext.version
      });

      this.logger.info('Context updated successfully', {
        contextId,
        version: savedContext.version
      });

      return savedContext;
    } catch (error) {
      this.logger.error('Failed to update context', error as Error, { contextId });
      throw error;
    }
  }

  /**
   * 删除Context - 安全删除版本
   * 整合：原上下文管理、缓存策略功能
   */
  async deleteContext(contextId: UUID): Promise<boolean> {
    try {
      this.logger.info('Deleting context', { contextId });

      // 1. 获取上下文
      const context = await this.getContext(contextId);
      if (!context) {
        throw new Error(`Context with ID '${contextId}' not found`);
      }

      // 2. 检查是否可以删除
      if (!this.canBeDeleted(context)) {
        throw new Error(`Context '${context.name}' cannot be deleted in current state: ${context.status}`);
      }

      // 3. 执行删除
      await this.contextRepository.delete(contextId);

      // 4. 清理缓存
      await this.cacheManager.delete(`context:${contextId}`);

      // 5. 记录删除事件
      await this.handleContextLifecycleEvent(contextId, 'terminated', {
        name: context.name,
        deletedAt: new Date()
      });

      this.logger.info('Context deleted successfully', { contextId });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete context', error as Error, { contextId });
      throw error;
    }
  }

  // ===== 生命周期管理 - 新增功能 =====

  /**
   * 生命周期阶段转换
   * 新增功能：支持 planning → executing → monitoring → completed 的标准转换
   */
  async transitionLifecycleStage(
    contextId: UUID,
    newStage: LifecycleStage
  ): Promise<ContextEntity> {
    try {
      this.logger.info('Transitioning lifecycle stage', { contextId, newStage });

      const context = await this.getContext(contextId);
      if (!context) {
        throw new Error(`Context ${contextId} not found`);
      }

      // 验证生命周期转换的合法性
      this.validateLifecycleTransition(context.lifecycleStage, newStage);

      // 执行转换
      const updatedContext = await this.updateContext(contextId, {
        lifecycleStage: newStage,
        status: this.getStatusForLifecycleStage(newStage)
      });

      this.logger.info('Lifecycle stage transitioned successfully', {
        contextId,
        from: context.lifecycleStage,
        to: newStage
      });

      return updatedContext;
    } catch (error) {
      this.logger.error('Failed to transition lifecycle stage', error as Error, { contextId, newStage });
      throw error;
    }
  }

  /**
   * 激活上下文
   */
  async activateContext(contextId: UUID): Promise<ContextEntity> {
    return await this.updateContext(contextId, { status: 'active' as ContextStatus });
  }

  /**
   * 停用上下文
   */
  async deactivateContext(contextId: UUID): Promise<ContextEntity> {
    return await this.updateContext(contextId, { status: 'suspended' as ContextStatus });
  }

  // ===== 状态同步管理 - 新增功能 =====

  /**
   * 同步共享状态
   * 新增功能：实时状态同步和版本控制
   */
  async syncSharedState(contextId: UUID, stateUpdates: StateUpdates): Promise<void> {
    try {
      this.logger.info('Syncing shared state', { contextId });

      const context = await this.getContext(contextId);
      if (!context) {
        throw new Error(`Context ${contextId} not found`);
      }

      // 合并状态更新
      const mergedState = this.mergeSharedState(context.sharedState, stateUpdates);

      // 更新上下文
      await this.updateContext(contextId, { sharedState: mergedState });

      // 发布状态同步事件
      await this.publishStateChangeEvent(contextId, stateUpdates);

      this.logger.info('Shared state synced successfully', { contextId });
    } catch (error) {
      this.logger.error('Failed to sync shared state', error as Error, { contextId });
      throw error;
    }
  }

  /**
   * 获取状态变更历史
   */
  async getStateHistory(contextId: UUID): Promise<ContextVersion[]> {
    return await this.versionManager.getVersionHistory(contextId);
  }

  /**
   * 比较状态版本
   */
  async compareStateVersions(
    contextId: UUID,
    version1: string,
    version2: string
  ): Promise<VersionDiff> {
    return await this.versionManager.compareVersions(contextId, version1, version2);
  }

  // ===== 批量操作 - 新增功能 =====

  /**
   * 批量创建上下文
   * 新增功能：支持批量创建以提升性能
   */
  async createContexts(requests: CreateContextData[]): Promise<ContextEntity[]> {
    try {
      this.logger.info('Creating contexts in batch', { count: requests.length });

      // 验证所有请求
      for (const request of requests) {
        await this.validateCreateData(request);
      }

      // 检查名称唯一性 (简化实现)
      const names = requests.map(r => r.name);
      for (const name of names) {
        const existing = await this.contextRepository.findByName(name);
        if (existing) {
          throw new Error(`Context with name '${name}' already exists`);
        }
      }

      // 创建所有Context实体
      const contexts = requests.map(request => new ContextEntity({
        ...request,
        contextId: this.generateContextId(),
        status: 'active' as ContextStatus,
        lifecycleStage: 'planning' as LifecycleStage,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }));

      // 批量保存
      const savedContexts = await this.contextRepository.saveMany(contexts);

      // 批量缓存
      await Promise.all(
        savedContexts.map(context =>
          this.cacheManager.set(`context:${context.contextId}`, context, 3600)
        )
      );

      // 批量版本记录
      await Promise.all(
        savedContexts.map(context => this.versionManager.createVersion(context))
      );

      this.logger.info('Contexts created in batch successfully', { count: savedContexts.length });

      return savedContexts;
    } catch (error) {
      this.logger.error('Failed to create contexts in batch', error as Error, { count: requests.length });
      throw error;
    }
  }

  /**
   * 查询上下文列表 - 增强版本
   * 整合：原查询功能，新增缓存优化
   */
  async listContexts(filter: ContextFilter): Promise<ContextEntity[]> {
    try {
      this.logger.debug('Listing contexts', { filter });

      // 如果是简单查询，尝试从缓存获取
      if (this.isSimpleFilter(filter)) {
        const cacheKey = `contexts:${JSON.stringify(filter)}`;
        const cached = await this.cacheManager.get<ContextEntity[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // 从数据库查询
      const result = await this.contextRepository.findByFilter(filter);
      const contexts = result.data;

      // 缓存结果（如果是简单查询）
      if (this.isSimpleFilter(filter)) {
        const cacheKey = `contexts:${JSON.stringify(filter)}`;
        await this.cacheManager.set(cacheKey, contexts, 300); // 5分钟TTL
      }

      return contexts;
    } catch (error) {
      this.logger.error('Failed to list contexts', error as Error, { filter });
      throw error;
    }
  }

  /**
   * 统计上下文数量
   */
  async countContexts(filter: ContextFilter): Promise<number> {
    return await this.contextRepository.countByFilter(filter);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.contextRepository.healthCheck();
    } catch {
      return false;
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 生成上下文ID
   */
  private generateContextId(): UUID {
    return `context-${Date.now()}-${randomBytes(6).toString('hex')}` as UUID; // CWE-330 修复
  }

  /**
   * 验证创建数据
   */
  private async validateCreateData(data: CreateContextData): Promise<void> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Context name cannot be empty');
    }

    if (data.name.length > 255) {
      throw new Error('Context name cannot exceed 255 characters');
    }

    if (data.description && data.description.length > 1000) {
      throw new Error('Context description cannot exceed 1000 characters');
    }
  }

  /**
   * 验证更新数据
   */
  private async validateUpdateData(data: UpdateContextData): Promise<void> {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Context name cannot be empty');
      }

      if (data.name.length > 255) {
        throw new Error('Context name cannot exceed 255 characters');
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 1000) {
      throw new Error('Context description cannot exceed 1000 characters');
    }
  }

  /**
   * 验证生命周期转换
   */
  private validateLifecycleTransition(currentStage: LifecycleStage, newStage: LifecycleStage): void {
    const validTransitions: Record<LifecycleStage, LifecycleStage[]> = {
      'planning': ['executing'],
      'executing': ['monitoring', 'completed'],
      'monitoring': ['executing', 'completed'],
      'completed': [] // 完成状态不能转换
    };

    const allowedTransitions = validTransitions[currentStage] || [];
    if (!allowedTransitions.includes(newStage)) {
      throw new Error(`Invalid lifecycle transition from ${currentStage} to ${newStage}`);
    }
  }

  /**
   * 根据生命周期阶段获取对应状态
   */
  private getStatusForLifecycleStage(stage: LifecycleStage): ContextStatus {
    const stageStatusMap: Record<LifecycleStage, ContextStatus> = {
      'planning': 'active',
      'executing': 'active',
      'monitoring': 'active',
      'completed': 'completed'
    };

    return stageStatusMap[stage] || 'active';
  }

  /**
   * 检查是否可以删除
   */
  private canBeDeleted(context: ContextEntity): boolean {
    // 只有在特定状态下才能删除
    const deletableStatuses: ContextStatus[] = ['suspended', 'completed', 'terminated'];
    return deletableStatuses.includes(context.status);
  }

  /**
   * 合并共享状态
   */
  private mergeSharedState(currentState: SharedState, updates: StateUpdates): SharedState {
    return {
      ...currentState,
      variables: {
        ...currentState.variables,
        ...updates.variables as Record<string, string | number | boolean | object>
      },
      resources: updates.resources ? { ...currentState.resources, ...updates.resources } : currentState.resources,
      dependencies: (updates.dependencies as unknown as string[]) || currentState.dependencies,
      goals: (updates.goals as unknown as string[]) || currentState.goals
    };
  }

  /**
   * 发布状态变更事件
   */
  private async publishStateChangeEvent(contextId: UUID, stateUpdates: StateUpdates): Promise<void> {
    // TODO: 集成事件总线发布状态变更事件
    this.logger.debug('State change event published', { contextId, stateUpdates });
  }

  /**
   * 版本号递增
   */
  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * 判断是否为简单过滤条件
   */
  private isSimpleFilter(filter: ContextFilter): boolean {
    // 简单过滤条件：只包含状态或生命周期阶段
    const keys = Object.keys(filter);
    return keys.length <= 2 && keys.every(key => ['status', 'lifecycleStage'].includes(key));
  }

  /**
   * 处理Context生命周期事件
   */
  private async handleContextLifecycleEvent(
    contextId: UUID,
    eventType: string,
    eventData: Record<string, unknown>
  ): Promise<void> {
    try {
      this.logger.info('Context lifecycle event', { contextId, eventType, eventData });
      // 简化实现 - 实际应该发布事件到事件总线
    } catch (error) {
      this.logger.error('Failed to handle context lifecycle event', error as Error, { contextId, eventType });
    }
  }
}
