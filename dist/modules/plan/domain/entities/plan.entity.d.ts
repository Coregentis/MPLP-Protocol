import { PlanEntityData, PlanTaskData, PlanMetadata } from '../../api/mappers/plan.mapper';
import { UUID } from '../../../../shared/types';
export declare class PlanEntity {
    private data;
    constructor(data: Partial<PlanEntityData>);
    get planId(): UUID;
    get contextId(): UUID;
    get name(): string;
    get description(): string | undefined;
    get status(): 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
    get priority(): 'critical' | 'high' | 'medium' | 'low' | undefined;
    get protocolVersion(): string;
    get timestamp(): Date;
    get tasks(): PlanTaskData[];
    get metadata(): PlanMetadata | undefined;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    get createdBy(): string | undefined;
    get updatedBy(): string | undefined;
    activate(): boolean;
    pause(): boolean;
    complete(): boolean;
    cancel(): boolean;
    addTask(task: Omit<PlanTaskData, 'taskId'>): void;
    removeTask(taskId: UUID): boolean;
    updateTaskStatus(taskId: UUID, status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped'): boolean;
    getProgress(): number;
    canExecute(): boolean;
    updateMetadata(metadata: Partial<PlanMetadata>): void;
    toData(): PlanEntityData;
    update(updates: Partial<PlanEntityData>): void;
    private initializeData;
    private validateInvariants;
}
//# sourceMappingURL=plan.entity.d.ts.map