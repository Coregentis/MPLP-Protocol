import { IConfirmRepository, PaginationParams, PaginatedResult, ConfirmQueryFilter } from '../../domain/repositories/confirm-repository.interface';
import { CreateConfirmRequest, UpdateConfirmRequest, ConfirmEntityData, UUID } from '../../types';
export declare class ConfirmManagementService {
    private readonly repository;
    constructor(repository: IConfirmRepository);
    createConfirm(request: CreateConfirmRequest): Promise<ConfirmEntityData>;
    approveConfirm(confirmId: UUID, approverId: UUID, comments?: string): Promise<ConfirmEntityData>;
    rejectConfirm(confirmId: UUID, approverId: UUID, reason: string): Promise<ConfirmEntityData>;
    delegateConfirm(confirmId: UUID, fromApproverId: UUID, toApproverId: UUID, reason?: string): Promise<ConfirmEntityData>;
    escalateConfirm(confirmId: UUID, _reason: string): Promise<ConfirmEntityData>;
    updateConfirm(confirmId: UUID, updates: UpdateConfirmRequest): Promise<ConfirmEntityData>;
    deleteConfirm(confirmId: UUID): Promise<void>;
    getConfirm(confirmId: UUID): Promise<ConfirmEntityData>;
    listConfirms(pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntityData>>;
    queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntityData>>;
    getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    private entityToData;
    private generateUUID;
    private validateConfirmCoordinationPermission;
    private getConfirmCoordinationContext;
    private recordConfirmCoordinationMetrics;
    private manageConfirmExtensionCoordination;
    private requestConfirmPlanCoordination;
    private coordinateCollabConfirmManagement;
    private enableDialogDrivenConfirmCoordination;
    private coordinateConfirmAcrossNetwork;
}
//# sourceMappingURL=confirm-management.service.d.ts.map