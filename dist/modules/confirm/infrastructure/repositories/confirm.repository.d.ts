/**
 * Confirm内存仓库实现
 *
 * @description Confirm模块的内存仓库实现，用于开发和测试
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 */
import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { IConfirmRepository, PaginationParams, PaginatedResult, ConfirmQueryFilter } from '../../domain/repositories/confirm-repository.interface';
import { UUID } from '../../types';
/**
 * 内存Confirm仓库实现
 *
 * @description 基于内存存储的Confirm仓库实现，提供完整的CRUD操作
 */
export declare class MemoryConfirmRepository implements IConfirmRepository {
    private confirms;
    /**
     * 创建确认
     */
    create(confirm: ConfirmEntity): Promise<ConfirmEntity>;
    /**
     * 根据ID获取确认
     */
    findById(confirmId: UUID): Promise<ConfirmEntity | null>;
    /**
     * 更新确认
     */
    update(confirmId: UUID, updates: Partial<ConfirmEntity>): Promise<ConfirmEntity>;
    /**
     * 删除确认
     */
    delete(confirmId: UUID): Promise<void>;
    /**
     * 列出所有确认
     */
    findAll(pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据条件查询确认
     */
    findByFilter(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据上下文ID查询确认
     */
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据计划ID查询确认
     */
    findByPlanId(planId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据请求者ID查询确认
     */
    findByRequesterId(requesterId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据审批者ID查询确认
     */
    findByApproverId(approverId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据状态查询确认
     */
    findByStatus(status: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据确认类型查询确认
     */
    findByType(confirmationType: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据优先级查询确认
     */
    findByPriority(priority: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    /**
     * 根据时间范围查询确认 - 基于Schema timestamp字段
     */
    findByTimeRange(timeRange: {
        startDate: Date;
        endDate: Date;
    }, pagination?: PaginationParams): Promise<ConfirmEntity[]>;
    /**
     * 统计确认数量
     */
    count(filter?: ConfirmQueryFilter): Promise<number>;
    /**
     * 检查确认是否存在
     */
    exists(confirmId: UUID): Promise<boolean>;
    /**
     * 批量创建确认
     */
    createBatch(confirms: ConfirmEntity[]): Promise<ConfirmEntity[]>;
    /**
     * 批量更新确认
     */
    updateBatch(updates: Array<{
        confirmId: UUID;
        updates: Partial<ConfirmEntity>;
    }>): Promise<ConfirmEntity[]>;
    /**
     * 批量删除确认
     */
    deleteBatch(confirmIds: UUID[]): Promise<void>;
    /**
     * 清空所有确认
     */
    clear(): Promise<void>;
    /**
     * 获取仓库统计信息
     */
    getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    /**
     * 分页结果辅助方法
     */
    private paginateResults;
}
//# sourceMappingURL=confirm.repository.d.ts.map