import { ConfirmEntity } from '../entities/confirm.entity';
import { UUID } from '../../types';
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface ConfirmQueryFilter {
    confirmationType?: string[];
    status?: string[];
    priority?: string[];
    requesterId?: string;
    approverId?: string;
    contextId?: UUID;
    planId?: UUID;
    createdAfter?: Date;
    createdBefore?: Date;
    riskLevel?: string[];
    workflowType?: string[];
}
export interface IConfirmRepository {
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
}
//# sourceMappingURL=confirm-repository.interface.d.ts.map