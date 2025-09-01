/**
 * Extension仓储接口
 * 
 * @description 定义Extension模块的数据访问抽象接口
 * @version 1.0.0
 * @layer Domain层 - 仓储接口
 * @pattern Repository Pattern + DDD
 */

import { UUID } from '../../../../shared/types';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../types';

/**
 * 扩展查询过滤器
 */
export interface ExtensionQueryFilter {
  contextId?: UUID;
  extensionType?: ExtensionType | ExtensionType[];
  status?: ExtensionStatus | ExtensionStatus[];
  name?: string;
  version?: string;
  author?: string;
  organization?: string;
  category?: string;
  keywords?: string[];
  createdAfter?: string;
  createdBefore?: string;
  lastUpdateAfter?: string;
  lastUpdateBefore?: string;
  hasErrors?: boolean;
  isActive?: boolean;
  compatibleWithVersion?: string;
  hasExtensionPointType?: string;
  hasApiExtensions?: boolean;
  hasEventSubscriptions?: boolean;
  healthStatus?: 'healthy' | 'degraded' | 'unhealthy';
  performanceThreshold?: {
    errorRate?: number;
    availability?: number;
    responseTime?: number;
  };
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 排序参数
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 查询结果
 */
export interface ExtensionQueryResult {
  extensions: ExtensionEntityData[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  successCount: number;
  failureCount: number;
  results: Array<{
    id: UUID;
    success: boolean;
    error?: string;
  }>;
}

/**
 * 扩展统计信息
 */
export interface ExtensionStatistics {
  totalExtensions: number;
  activeExtensions: number;
  inactiveExtensions: number;
  errorExtensions: number;
  extensionsByType: Record<ExtensionType, number>;
  extensionsByStatus: Record<ExtensionStatus, number>;
  averagePerformanceMetrics: {
    responseTime: number;
    errorRate: number;
    availability: number;
    throughput: number;
  };
  topPerformingExtensions: Array<{
    extensionId: UUID;
    name: string;
    performanceScore: number;
  }>;
  recentlyUpdated: Array<{
    extensionId: UUID;
    name: string;
    lastUpdate: string;
  }>;
}

/**
 * Extension仓储接口
 * 定义所有扩展数据访问操作的抽象
 */
export interface IExtensionRepository {
  
  // ============================================================================
  // 基本CRUD操作
  // ============================================================================

  /**
   * 创建扩展记录
   * @param extension - 扩展实体数据
   * @returns Promise<ExtensionEntityData> - 创建的扩展记录
   */
  create(extension: ExtensionEntityData): Promise<ExtensionEntityData>;

  /**
   * 根据ID查找扩展
   * @param extensionId - 扩展ID
   * @returns Promise<ExtensionEntityData | null> - 扩展记录或null
   */
  findById(extensionId: UUID): Promise<ExtensionEntityData | null>;

  /**
   * 更新扩展记录
   * @param extensionId - 扩展ID
   * @param updates - 更新数据
   * @returns Promise<ExtensionEntityData> - 更新后的扩展记录
   */
  update(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData>;

  /**
   * 删除扩展记录
   * @param extensionId - 扩展ID
   * @returns Promise<boolean> - 是否删除成功
   */
  delete(extensionId: UUID): Promise<boolean>;

  /**
   * 查找所有扩展
   * @returns Promise<ExtensionEntityData[]> - 所有扩展记录
   */
  findAll(): Promise<ExtensionEntityData[]>;

  // ============================================================================
  // 查询操作
  // ============================================================================

  /**
   * 根据过滤条件查找扩展
   * @param filter - 查询过滤器
   * @param pagination - 分页参数
   * @param sort - 排序参数
   * @returns Promise<ExtensionQueryResult> - 查询结果
   */
  findByFilter(
    filter: ExtensionQueryFilter,
    pagination?: PaginationParams,
    sort?: SortParams[]
  ): Promise<ExtensionQueryResult>;

  /**
   * 根据上下文ID查找扩展
   * @param contextId - 上下文ID
   * @returns Promise<ExtensionEntityData[]> - 扩展记录数组
   */
  findByContextId(contextId: UUID): Promise<ExtensionEntityData[]>;

  /**
   * 根据扩展类型查找扩展
   * @param extensionType - 扩展类型
   * @param status - 可选的状态过滤
   * @returns Promise<ExtensionEntityData[]> - 扩展记录数组
   */
  findByType(extensionType: ExtensionType, status?: ExtensionStatus): Promise<ExtensionEntityData[]>;

  /**
   * 根据状态查找扩展
   * @param status - 扩展状态
   * @returns Promise<ExtensionEntityData[]> - 扩展记录数组
   */
  findByStatus(status: ExtensionStatus): Promise<ExtensionEntityData[]>;

  /**
   * 根据名称查找扩展
   * @param name - 扩展名称
   * @param exactMatch - 是否精确匹配
   * @returns Promise<ExtensionEntityData[]> - 扩展记录数组
   */
  findByName(name: string, exactMatch?: boolean): Promise<ExtensionEntityData[]>;

  /**
   * 搜索扩展
   * @param searchTerm - 搜索词
   * @param searchFields - 搜索字段
   * @param pagination - 分页参数
   * @returns Promise<ExtensionQueryResult> - 搜索结果
   */
  search(
    searchTerm: string,
    searchFields?: string[],
    pagination?: PaginationParams
  ): Promise<ExtensionQueryResult>;

  // ============================================================================
  // 统计和聚合操作
  // ============================================================================

  /**
   * 获取扩展总数
   * @param filter - 可选的过滤条件
   * @returns Promise<number> - 扩展总数
   */
  count(filter?: ExtensionQueryFilter): Promise<number>;

  /**
   * 检查扩展是否存在
   * @param extensionId - 扩展ID
   * @returns Promise<boolean> - 是否存在
   */
  exists(extensionId: UUID): Promise<boolean>;

  /**
   * 检查扩展名称是否已存在
   * @param name - 扩展名称
   * @param excludeId - 排除的扩展ID
   * @returns Promise<boolean> - 名称是否已存在
   */
  nameExists(name: string, excludeId?: UUID): Promise<boolean>;

  /**
   * 获取扩展统计信息
   * @param filter - 可选的过滤条件
   * @returns Promise<ExtensionStatistics> - 统计信息
   */
  getStatistics(filter?: ExtensionQueryFilter): Promise<ExtensionStatistics>;

  // ============================================================================
  // 批量操作
  // ============================================================================

  /**
   * 批量创建扩展
   * @param extensions - 扩展实体数据数组
   * @returns Promise<BatchOperationResult> - 批量操作结果
   */
  createBatch(extensions: ExtensionEntityData[]): Promise<BatchOperationResult>;

  /**
   * 批量更新扩展
   * @param updates - 更新数据数组
   * @returns Promise<BatchOperationResult> - 批量操作结果
   */
  updateBatch(updates: Array<{
    extensionId: UUID;
    updates: Partial<ExtensionEntityData>;
  }>): Promise<BatchOperationResult>;

  /**
   * 批量删除扩展
   * @param extensionIds - 扩展ID数组
   * @returns Promise<BatchOperationResult> - 批量操作结果
   */
  deleteBatch(extensionIds: UUID[]): Promise<BatchOperationResult>;

  /**
   * 批量更新状态
   * @param extensionIds - 扩展ID数组
   * @param status - 新状态
   * @returns Promise<BatchOperationResult> - 批量操作结果
   */
  updateStatusBatch(extensionIds: UUID[], status: ExtensionStatus): Promise<BatchOperationResult>;

  // ============================================================================
  // 高级查询操作
  // ============================================================================

  /**
   * 查找活动的扩展
   * @param contextId - 可选的上下文ID过滤
   * @returns Promise<ExtensionEntityData[]> - 活动扩展数组
   */
  findActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;

  /**
   * 查找有错误的扩展
   * @param contextId - 可选的上下文ID过滤
   * @returns Promise<ExtensionEntityData[]> - 有错误的扩展数组
   */
  findExtensionsWithErrors(contextId?: UUID): Promise<ExtensionEntityData[]>;

  /**
   * 查找需要更新的扩展
   * @param currentVersion - 当前MPLP版本
   * @returns Promise<ExtensionEntityData[]> - 需要更新的扩展数组
   */
  findExtensionsNeedingUpdate(currentVersion: string): Promise<ExtensionEntityData[]>;

  /**
   * 查找兼容的扩展
   * @param mplpVersion - MPLP版本
   * @param requiredModules - 必需模块
   * @returns Promise<ExtensionEntityData[]> - 兼容的扩展数组
   */
  findCompatibleExtensions(
    mplpVersion: string,
    requiredModules?: string[]
  ): Promise<ExtensionEntityData[]>;

  /**
   * 查找具有特定扩展点的扩展
   * @param extensionPointType - 扩展点类型
   * @returns Promise<ExtensionEntityData[]> - 具有指定扩展点的扩展数组
   */
  findExtensionsWithExtensionPoint(extensionPointType: string): Promise<ExtensionEntityData[]>;

  /**
   * 查找具有API扩展的扩展
   * @param endpoint - 可选的端点过滤
   * @param method - 可选的HTTP方法过滤
   * @returns Promise<ExtensionEntityData[]> - 具有API扩展的扩展数组
   */
  findExtensionsWithApiExtensions(
    endpoint?: string,
    method?: string
  ): Promise<ExtensionEntityData[]>;

  /**
   * 查找订阅特定事件的扩展
   * @param eventPattern - 事件模式
   * @returns Promise<ExtensionEntityData[]> - 订阅指定事件的扩展数组
   */
  findExtensionsSubscribedToEvent(eventPattern: string): Promise<ExtensionEntityData[]>;

  // ============================================================================
  // 性能和监控操作
  // ============================================================================

  /**
   * 更新扩展性能指标
   * @param extensionId - 扩展ID
   * @param metrics - 性能指标
   * @returns Promise<void>
   */
  updatePerformanceMetrics(
    extensionId: UUID,
    metrics: Partial<ExtensionEntityData['performanceMetrics']>
  ): Promise<void>;

  /**
   * 获取性能最佳的扩展
   * @param limit - 返回数量限制
   * @param metric - 性能指标类型
   * @returns Promise<ExtensionEntityData[]> - 性能最佳的扩展数组
   */
  findTopPerformingExtensions(
    limit?: number,
    metric?: 'responseTime' | 'throughput' | 'availability' | 'efficiencyScore'
  ): Promise<ExtensionEntityData[]>;

  /**
   * 获取最近更新的扩展
   * @param limit - 返回数量限制
   * @param days - 天数范围
   * @returns Promise<ExtensionEntityData[]> - 最近更新的扩展数组
   */
  findRecentlyUpdatedExtensions(limit?: number, days?: number): Promise<ExtensionEntityData[]>;

  // ============================================================================
  // 清理和维护操作
  // ============================================================================

  /**
   * 清理所有扩展数据（仅用于测试）
   * @returns Promise<void>
   */
  clear(): Promise<void>;

  /**
   * 清理过期的审计记录
   * @param retentionDays - 保留天数
   * @returns Promise<number> - 清理的记录数
   */
  cleanupExpiredAuditRecords(retentionDays: number): Promise<number>;

  /**
   * 优化存储性能
   * @returns Promise<void>
   */
  optimize(): Promise<void>;
}
