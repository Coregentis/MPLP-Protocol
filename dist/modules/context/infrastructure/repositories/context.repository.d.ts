/**
 * Context仓库实现
 *
 * @description Context模块的仓库实现，提供数据持久化功能
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 */
import { ContextEntity } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';
import { ContextQueryFilter } from '../../types';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';
/**
 * 内存Context仓库实现
 *
 * @description 基于内存的Context仓库实现，用于开发和测试
 * @note 生产环境应替换为数据库实现
 */
export declare class MemoryContextRepository implements IContextRepository {
    private contexts;
    private nameIndex;
    findById(contextId: UUID): Promise<ContextEntity | null>;
    findByName(name: string): Promise<ContextEntity | null>;
    save(context: ContextEntity): Promise<ContextEntity>;
    update(context: ContextEntity): Promise<ContextEntity>;
    delete(contextId: UUID): Promise<boolean>;
    exists(contextId: UUID): Promise<boolean>;
    findAll(pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    findByFilter(filter: ContextQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    findByStatus(status: string | string[], pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    findByLifecycleStage(stage: string | string[], pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    findByOwner(ownerId: string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    searchByName(namePattern: string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    count(): Promise<number>;
    countByFilter(filter: ContextQueryFilter): Promise<number>;
    countByStatus(status: string | string[]): Promise<number>;
    countByLifecycleStage(stage: string | string[]): Promise<number>;
    saveMany(contexts: ContextEntity[]): Promise<ContextEntity[]>;
    updateMany(contexts: ContextEntity[]): Promise<ContextEntity[]>;
    deleteMany(contextIds: UUID[]): Promise<number>;
    deleteByFilter(filter: ContextQueryFilter): Promise<number>;
    executeInTransaction<T>(operation: (repository: IContextRepository) => Promise<T>): Promise<T>;
    clearCache(): Promise<void>;
    clearCacheForContext(contextId: UUID): Promise<void>;
    healthCheck(): Promise<boolean>;
    getStatistics(): Promise<{
        totalContexts: number;
        activeContexts: number;
        suspendedContexts: number;
        completedContexts: number;
        terminatedContexts: number;
        cacheHitRate?: number;
        averageResponseTime?: number;
    }>;
    /**
     * 检查Context是否匹配过滤条件
     */
    private matchesFilter;
    /**
     * 应用分页
     */
    private applyPagination;
}
//# sourceMappingURL=context.repository.d.ts.map