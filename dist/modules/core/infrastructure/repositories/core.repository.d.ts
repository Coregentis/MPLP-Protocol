import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, WorkflowStatusType } from '../../types';
export declare class MemoryCoreRepository implements ICoreRepository {
    private entities;
    save(entity: CoreEntity): Promise<CoreEntity>;
    findById(workflowId: UUID): Promise<CoreEntity | null>;
    findAll(): Promise<CoreEntity[]>;
    findByStatus(status: WorkflowStatusType): Promise<CoreEntity[]>;
    findByOrchestratorId(orchestratorId: UUID): Promise<CoreEntity[]>;
    delete(workflowId: UUID): Promise<boolean>;
    exists(workflowId: UUID): Promise<boolean>;
    count(): Promise<number>;
    findByCriteria(criteria: {
        status?: WorkflowStatusType;
        orchestratorId?: UUID;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<CoreEntity[]>;
    findWithPagination(offset: number, limit: number): Promise<{
        entities: CoreEntity[];
        total: number;
        hasMore: boolean;
    }>;
    saveBatch(entities: CoreEntity[]): Promise<CoreEntity[]>;
    deleteBatch(workflowIds: UUID[]): Promise<number>;
    clear(): Promise<void>;
    getMemoryUsage(): {
        entityCount: number;
        memoryEstimate: string;
    };
    exportData(): Promise<Record<string, unknown>[]>;
    importData(data: Record<string, unknown>[]): Promise<number>;
    getStatistics(): Promise<{
        totalEntities: number;
        entitiesByStatus: Record<WorkflowStatusType, number>;
        oldestEntity?: {
            workflowId: UUID;
            timestamp: string;
        };
        newestEntity?: {
            workflowId: UUID;
            timestamp: string;
        };
    }>;
}
//# sourceMappingURL=core.repository.d.ts.map