import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { IConfirmRepository, PaginationParams, PaginatedResult, ConfirmQueryFilter } from '../../domain/repositories/confirm-repository.interface';
import { UUID } from '../../types';
export declare class MemoryConfirmRepository implements IConfirmRepository {
    private confirms;
    create(confirm: ConfirmEntity): Promise<ConfirmEntity>;
    findById(confirmId: UUID): Promise<ConfirmEntity | null>;
    update(confirmId: UUID, updates: Partial<ConfirmEntity>): Promise<ConfirmEntity>;
    delete(confirmId: UUID): Promise<void>;
    findAll(pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByFilter(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByPlanId(planId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByRequesterId(requesterId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByApproverId(approverId: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByStatus(status: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByType(confirmationType: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByPriority(priority: string, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntity>>;
    findByTimeRange(timeRange: {
        startDate: Date;
        endDate: Date;
    }, pagination?: PaginationParams): Promise<ConfirmEntity[]>;
    count(filter?: ConfirmQueryFilter): Promise<number>;
    exists(confirmId: UUID): Promise<boolean>;
    createBatch(confirms: ConfirmEntity[]): Promise<ConfirmEntity[]>;
    updateBatch(updates: Array<{
        confirmId: UUID;
        updates: Partial<ConfirmEntity>;
    }>): Promise<ConfirmEntity[]>;
    deleteBatch(confirmIds: UUID[]): Promise<void>;
    clear(): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    private paginateResults;
}
//# sourceMappingURL=confirm.repository.d.ts.map