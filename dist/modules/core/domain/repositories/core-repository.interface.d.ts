import { CoreEntity } from '../entities/core.entity';
import { UUID, WorkflowStatusType } from '../../types';
export interface ICoreRepository {
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
}
//# sourceMappingURL=core-repository.interface.d.ts.map