import { ContextEntityData, ContextStatus, LifecycleStage, SharedState, AccessControl, Configuration, AuditTrail } from '../../types';
import { UUID, Timestamp } from '../../../../shared/types';
export declare class ContextEntity {
    private data;
    constructor(data: Partial<ContextEntityData>);
    get contextId(): UUID;
    get name(): string;
    get description(): string | undefined;
    get status(): ContextStatus;
    get lifecycleStage(): LifecycleStage;
    get protocolVersion(): string;
    get timestamp(): Timestamp;
    get sharedState(): SharedState;
    get accessControl(): AccessControl;
    get configuration(): Configuration;
    get auditTrail(): AuditTrail;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    get version(): string | undefined;
    get tags(): string[] | undefined;
    updateName(newName: string): void;
    updateDescription(newDescription?: string): void;
    changeStatus(newStatus: ContextStatus): void;
    advanceLifecycleStage(newStage: LifecycleStage): void;
    updateSharedState(updates: Partial<SharedState>): void;
    updateAccessControl(updates: Partial<AccessControl>): void;
    updateConfiguration(updates: Partial<Configuration>): void;
    canBeDeleted(): boolean;
    isActive(): boolean;
    toData(): ContextEntityData;
    private initializeData;
    private validateInvariants;
    update(updateData: Partial<ContextEntityData>): ContextEntity;
    private updateTimestamp;
    private isValidStatusTransition;
    private isValidLifecycleTransition;
}
//# sourceMappingURL=context.entity.d.ts.map