/**
 * Extension仓储实现
 *
 * @description Extension模块的内存仓储实现，提供完整的数据访问功能
 * @version 1.0.0
 * @layer Infrastructure层 - 仓储实现
 * @pattern Repository Pattern + 内存存储
 */
import { UUID } from '../../../../shared/types';
import { IExtensionRepository, ExtensionQueryFilter, PaginationParams, SortParams, ExtensionQueryResult, BatchOperationResult, ExtensionStatistics } from '../../domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../types';
/**
 * Extension内存仓储实现
 * 使用内存存储提供快速的数据访问
 */
export declare class ExtensionRepository implements IExtensionRepository {
    private extensions;
    private nameIndex;
    private contextIndex;
    private typeIndex;
    private statusIndex;
    /**
     * 创建扩展记录
     */
    create(extension: ExtensionEntityData): Promise<ExtensionEntityData>;
    /**
     * 根据ID查找扩展
     */
    findById(extensionId: UUID): Promise<ExtensionEntityData | null>;
    /**
     * 更新扩展记录
     */
    update(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData>;
    /**
     * 删除扩展记录
     */
    delete(extensionId: UUID): Promise<boolean>;
    /**
     * 根据过滤条件查找扩展
     */
    findByFilter(filter: ExtensionQueryFilter, pagination?: PaginationParams, sort?: SortParams[]): Promise<ExtensionQueryResult>;
    /**
     * 根据上下文ID查找扩展
     */
    findByContextId(contextId: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 根据扩展类型查找扩展
     */
    findByType(extensionType: ExtensionType, status?: ExtensionStatus): Promise<ExtensionEntityData[]>;
    /**
     * 根据状态查找扩展
     */
    findByStatus(status: ExtensionStatus): Promise<ExtensionEntityData[]>;
    /**
     * 查找所有扩展
     */
    findAll(): Promise<ExtensionEntityData[]>;
    /**
     * 根据名称查找扩展
     */
    findByName(name: string, exactMatch?: boolean): Promise<ExtensionEntityData[]>;
    /**
     * 搜索扩展
     */
    search(searchTerm: string, searchFields?: string[], pagination?: PaginationParams): Promise<ExtensionQueryResult>;
    /**
     * 获取扩展总数
     */
    count(filter?: ExtensionQueryFilter): Promise<number>;
    /**
     * 检查扩展是否存在
     */
    exists(extensionId: UUID): Promise<boolean>;
    /**
     * 检查扩展名称是否已存在
     */
    nameExists(name: string, excludeId?: UUID): Promise<boolean>;
    /**
     * 获取扩展统计信息
     */
    getStatistics(filter?: ExtensionQueryFilter): Promise<ExtensionStatistics>;
    /**
     * 批量创建扩展
     */
    createBatch(extensions: ExtensionEntityData[]): Promise<BatchOperationResult>;
    /**
     * 批量更新扩展
     */
    updateBatch(updates: Array<{
        extensionId: UUID;
        updates: Partial<ExtensionEntityData>;
    }>): Promise<BatchOperationResult>;
    /**
     * 批量删除扩展
     */
    deleteBatch(extensionIds: UUID[]): Promise<BatchOperationResult>;
    /**
     * 批量更新状态
     */
    updateStatusBatch(extensionIds: UUID[], status: ExtensionStatus): Promise<BatchOperationResult>;
    /**
     * 查找活动的扩展
     */
    findActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 查找有错误的扩展
     */
    findExtensionsWithErrors(contextId?: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 查找需要更新的扩展
     */
    findExtensionsNeedingUpdate(currentVersion: string): Promise<ExtensionEntityData[]>;
    /**
     * 查找兼容的扩展
     */
    findCompatibleExtensions(mplpVersion: string, requiredModules?: string[]): Promise<ExtensionEntityData[]>;
    /**
     * 查找具有特定扩展点的扩展
     */
    findExtensionsWithExtensionPoint(extensionPointType: string): Promise<ExtensionEntityData[]>;
    /**
     * 查找具有API扩展的扩展
     */
    findExtensionsWithApiExtensions(endpoint?: string, method?: string): Promise<ExtensionEntityData[]>;
    /**
     * 查找订阅特定事件的扩展
     */
    findExtensionsSubscribedToEvent(eventPattern: string): Promise<ExtensionEntityData[]>;
    /**
     * 更新扩展性能指标
     */
    updatePerformanceMetrics(extensionId: UUID, metrics: Partial<ExtensionEntityData['performanceMetrics']>): Promise<void>;
    /**
     * 获取性能最佳的扩展
     */
    findTopPerformingExtensions(limit?: number, metric?: 'responseTime' | 'throughput' | 'availability' | 'efficiencyScore'): Promise<ExtensionEntityData[]>;
    /**
     * 获取最近更新的扩展
     */
    findRecentlyUpdatedExtensions(limit?: number, days?: number): Promise<ExtensionEntityData[]>;
    /**
     * 清理所有扩展数据
     */
    clear(): Promise<void>;
    /**
     * 清理过期的审计记录
     */
    cleanupExpiredAuditRecords(retentionDays: number): Promise<number>;
    /**
     * 优化存储性能
     */
    optimize(): Promise<void>;
    /**
     * 更新索引
     */
    private updateIndexes;
    /**
     * 应用过滤器
     */
    private applyFilters;
    /**
     * 应用排序
     */
    private applySorting;
    /**
     * 获取字段值
     */
    private getFieldValue;
    /**
     * 计算平均值
     */
    private calculateAverage;
    /**
     * 获取性能指标值
     */
    private getMetricValue;
    /**
     * 检查版本是否较旧
     */
    private isVersionOlder;
    /**
     * 检查版本兼容性
     */
    private isVersionCompatible;
}
//# sourceMappingURL=extension.repository.d.ts.map