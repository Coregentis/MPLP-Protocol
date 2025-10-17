import { PlanEntity } from '../entities/plan.entity';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';
export interface PlanQueryFilter {
    contextId?: UUID;
    status?: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed' | Array<'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'>;
    priority?: 'critical' | 'high' | 'medium' | 'low' | Array<'critical' | 'high' | 'medium' | 'low'>;
    createdBy?: string;
    updatedBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
    namePattern?: string;
    descriptionPattern?: string;
    hasActiveTasks?: boolean;
    progressMin?: number;
    progressMax?: number;
    metadata?: Record<string, unknown>;
}
export interface IPlanRepository {
    findById(planId: UUID): Promise<PlanEntity | null>;
    findByName(name: string): Promise<PlanEntity | null>;
    save(plan: PlanEntity): Promise<PlanEntity>;
    update(plan: PlanEntity): Promise<PlanEntity>;
    delete(planId: UUID): Promise<boolean>;
    exists(planId: UUID): Promise<boolean>;
    findAll(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByFilter(filter: PlanQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByStatus(status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed' | Array<'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'>, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByPriority(priority: 'critical' | 'high' | 'medium' | 'low' | Array<'critical' | 'high' | 'medium' | 'low'>, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByCreatedBy(createdBy: string, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    searchByName(namePattern: string, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    searchByDescription(descriptionPattern: string, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    count(): Promise<number>;
    countByStatus(status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'): Promise<number>;
    countByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<number>;
    countByContextId(contextId: UUID): Promise<number>;
    countByCreatedBy(createdBy: string): Promise<number>;
    findActivePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findExecutablePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findCompletedPlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findHighPriorityPlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findOverduePlans(pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findUpcomingDeadlinePlans(daysAhead: number, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByProgressRange(minProgress: number, maxProgress: number, pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    findByTaskStatus(taskStatus: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped', pagination?: PaginationParams): Promise<PaginatedResult<PlanEntity>>;
    saveMany(plans: PlanEntity[]): Promise<PlanEntity[]>;
    updateMany(plans: PlanEntity[]): Promise<PlanEntity[]>;
    deleteMany(planIds: UUID[]): Promise<number>;
    updateStatusMany(planIds: UUID[], status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'): Promise<number>;
    transaction<T>(operation: (repository: IPlanRepository) => Promise<T>): Promise<T>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
}
//# sourceMappingURL=plan-repository.interface.d.ts.map