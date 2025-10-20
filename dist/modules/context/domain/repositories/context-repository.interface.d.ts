/**
 * Context仓库接口
 *
 * @description Context模块的仓库接口定义，遵循DDD仓库模式
 * @version 1.0.0
 * @layer 领域层 - 仓库接口
 */
import { ContextEntity } from '../entities/context.entity';
import { ContextQueryFilter } from '../../types';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';
/**
 * Context仓库接口
 *
 * @description 定义Context实体的持久化操作接口
 */
export interface IContextRepository {
    /**
     * 根据ID查找Context
     */
    findById(contextId: UUID): Promise<ContextEntity | null>;
    /**
     * 根据名称查找Context
     */
    findByName(name: string): Promise<ContextEntity | null>;
    /**
     * 保存Context实体
     */
    save(context: ContextEntity): Promise<ContextEntity>;
    /**
     * 更新Context实体
     */
    update(context: ContextEntity): Promise<ContextEntity>;
    /**
     * 删除Context实体
     */
    delete(contextId: UUID): Promise<boolean>;
    /**
     * 检查Context是否存在
     */
    exists(contextId: UUID): Promise<boolean>;
    /**
     * 查找所有Context
     */
    findAll(pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 根据过滤条件查找Context
     */
    findByFilter(filter: ContextQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 根据状态查找Context
     */
    findByStatus(status: string | string[], pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 根据生命周期阶段查找Context
     */
    findByLifecycleStage(stage: string | string[], pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 根据所有者查找Context
     */
    findByOwner(ownerId: string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 搜索Context（按名称模式）
     */
    searchByName(namePattern: string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 获取Context总数
     */
    count(): Promise<number>;
    /**
     * 根据过滤条件获取Context数量
     */
    countByFilter(filter: ContextQueryFilter): Promise<number>;
    /**
     * 根据状态获取Context数量
     */
    countByStatus(status: string | string[]): Promise<number>;
    /**
     * 根据生命周期阶段获取Context数量
     */
    countByLifecycleStage(stage: string | string[]): Promise<number>;
    /**
     * 批量保存Context
     */
    saveMany(contexts: ContextEntity[]): Promise<ContextEntity[]>;
    /**
     * 批量更新Context
     */
    updateMany(contexts: ContextEntity[]): Promise<ContextEntity[]>;
    /**
     * 批量删除Context
     */
    deleteMany(contextIds: UUID[]): Promise<number>;
    /**
     * 根据过滤条件批量删除Context
     */
    deleteByFilter(filter: ContextQueryFilter): Promise<number>;
    /**
     * 在事务中执行操作
     */
    executeInTransaction<T>(operation: (repository: IContextRepository) => Promise<T>): Promise<T>;
    /**
     * 清除缓存
     */
    clearCache(): Promise<void>;
    /**
     * 清除特定Context的缓存
     */
    clearCacheForContext(contextId: UUID): Promise<void>;
    /**
     * 仓库健康检查
     */
    healthCheck(): Promise<boolean>;
    /**
     * 获取仓库统计信息
     */
    getStatistics(): Promise<{
        totalContexts: number;
        activeContexts: number;
        suspendedContexts: number;
        completedContexts: number;
        terminatedContexts: number;
        cacheHitRate?: number;
        averageResponseTime?: number;
    }>;
}
//# sourceMappingURL=context-repository.interface.d.ts.map