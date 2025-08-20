/**
 * Context Repository接口 - MPLP v1.0 支持14个功能域
 *
 * 定义Context领域对象的仓库操作接口
 * 基于完整的mplp-context.json Schema
 *
 * @version 1.0.0
 * @updated 2025-08-14
 */

import { UUID } from '../../../../public/shared/types';
import { Context } from '../entities/context.entity';

/**
 * Context过滤条件 - MPLP v1.0
 */
export interface ContextFilter {
  // 基础字段过滤
  name?: string;
  status?: string;
  lifecycleStage?: string;
  protocolVersion?: string;
  
  // 时间范围过滤
  timestampAfter?: Date;
  timestampBefore?: Date;
  
  // 共享状态过滤
  hasVariables?: Record<string, unknown>;
  hasDependencies?: string[];
  hasGoals?: string[];
  
  // 访问控制过滤
  ownerId?: string;
  hasPermissions?: string[];
  
  // 配置过滤
  timeoutRange?: { min?: number; max?: number };
  storageBackend?: string;
  
  // 审计过滤
  auditEnabled?: boolean;
  retentionDaysRange?: { min?: number; max?: number };
  
  // 监控过滤
  monitoringEnabled?: boolean;
  supportedProviders?: string[];
  
  // 性能过滤
  performanceEnabled?: boolean;
  collectionIntervalRange?: { min?: number; max?: number };
  
  // 版本过滤
  versioningEnabled?: boolean;
  maxVersionsRange?: { min?: number; max?: number };
  
  // 搜索过滤
  searchEnabled?: boolean;
  indexingStrategy?: string;
  
  // 缓存过滤
  cachingEnabled?: boolean;
  cacheStrategy?: string;
  
  // 同步过滤
  syncEnabled?: boolean;
  syncStrategy?: string;
  
  // 错误处理过滤
  errorHandlingEnabled?: boolean;
  
  // 集成过滤
  integrationEnabled?: boolean;
  hasWebhooks?: boolean;
  
  // 事件过滤
  eventIntegrationEnabled?: boolean;
  publishedEvents?: string[];
  subscribedEvents?: string[];
}

/**
 * Context排序选项 - MPLP v1.0
 */
export type ContextSortField =
  | 'name'
  | 'status'
  | 'lifecycleStage'
  | 'timestamp'
  | 'protocolVersion'
  | 'auditTrail.retentionDays'
  | 'performanceMetrics.collectionIntervalSeconds'
  | 'versionHistory.maxVersions';

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortField?: ContextSortField;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Context仓库接口 - MPLP v1.0
 */
export interface IContextRepository {
  /**
   * 通过ID查找Context
   */
  findById(id: UUID): Promise<Context | null>;

  /**
   * 保存Context
   */
  save(context: Context): Promise<void>;

  /**
   * 删除Context
   */
  delete(id: UUID): Promise<void>;

  /**
   * 检查Context是否存在
   */
  exists(id: UUID): Promise<boolean>;

  /**
   * 通过名称查找Context
   */
  findByName(name: string): Promise<Context | null>;

  /**
   * 查找多个Context
   */
  findMany(filter?: ContextFilter, pagination?: PaginationParams): Promise<PaginatedResult<Context>>;

  /**
   * 统计Context数量
   */
  count(filter?: ContextFilter): Promise<number>;

  /**
   * 批量保存Context
   */
  saveMany(contexts: Context[]): Promise<void>;

  /**
   * 批量删除Context
   */
  deleteMany(ids: UUID[]): Promise<void>;
  
  // ===== 功能域特定查询 =====
  
  /**
   * 查找具有特定共享状态的Context
   */
  findBySharedState(variables: Record<string, unknown>): Promise<Context[]>;

  /**
   * 查找具有特定访问控制的Context
   */
  findByOwner(userId: string): Promise<Context[]>;

  /**
   * 查找具有特定配置的Context
   */
  findByConfiguration(storageBackend: string): Promise<Context[]>;

  /**
   * 查找启用审计的Context
   */
  findWithAuditEnabled(): Promise<Context[]>;

  /**
   * 查找启用监控的Context
   */
  findWithMonitoringEnabled(): Promise<Context[]>;

  /**
   * 查找具有特定性能配置的Context
   */
  findByPerformanceConfig(collectionInterval: number): Promise<Context[]>;

  /**
   * 查找启用版本控制的Context
   */
  findWithVersioningEnabled(): Promise<Context[]>;

  /**
   * 查找具有特定搜索配置的Context
   */
  findBySearchConfig(indexingStrategy: string): Promise<Context[]>;

  /**
   * 查找具有特定缓存策略的Context
   */
  findByCacheStrategy(strategy: string): Promise<Context[]>;

  /**
   * 查找具有特定同步配置的Context
   */
  findBySyncStrategy(strategy: string): Promise<Context[]>;

  /**
   * 查找启用错误处理的Context
   */
  findWithErrorHandlingEnabled(): Promise<Context[]>;

  /**
   * 查找具有集成端点的Context
   */
  findWithIntegrationEndpoints(): Promise<Context[]>;

  /**
   * 查找具有事件集成的Context
   */
  findWithEventIntegration(): Promise<Context[]>;
  
  // ===== 聚合查询 =====
  
  /**
   * 获取状态统计
   */
  getStatusStatistics(): Promise<Record<string, number>>;
  
  /**
   * 获取生命周期阶段统计
   */
  getLifecycleStageStatistics(): Promise<Record<string, number>>;
  
  /**
   * 获取功能域启用统计
   */
  getFeatureDomainStatistics(): Promise<{
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
  }>;
  
  /**
   * 获取配置分布统计
   */
  getConfigurationStatistics(): Promise<{
    storageBackends: Record<string, number>;
    cacheStrategies: Record<string, number>;
    syncStrategies: Record<string, number>;
    indexingStrategies: Record<string, number>;
  }>;
}
