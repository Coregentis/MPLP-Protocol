import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { CreateConfirmRequest, UpdateConfirmRequest, ConfirmQueryFilter, ConfirmEntityData, UUID } from '../../types';
import { PaginationParams, PaginatedResult } from '../../domain/repositories/confirm-repository.interface';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
export declare class ConfirmController {
    private readonly confirmService;
    constructor(confirmService: ConfirmManagementService);
    createConfirm(request: CreateConfirmRequest): Promise<ApiResponse<ConfirmEntityData>>;
    approveConfirm(confirmId: UUID, approverId: UUID, comments?: string): Promise<ApiResponse<ConfirmEntityData>>;
    rejectConfirm(confirmId: UUID, approverId: UUID, reason: string): Promise<ApiResponse<ConfirmEntityData>>;
    delegateConfirm(confirmId: UUID, fromApproverId: UUID, toApproverId: UUID, reason?: string): Promise<ApiResponse<ConfirmEntityData>>;
    escalateConfirm(confirmId: UUID, reason: string): Promise<ApiResponse<ConfirmEntityData>>;
    updateConfirm(confirmId: UUID, updates: UpdateConfirmRequest): Promise<ApiResponse<ConfirmEntityData>>;
    deleteConfirm(confirmId: UUID): Promise<ApiResponse<void>>;
    getConfirm(confirmId: UUID): Promise<ApiResponse<ConfirmEntityData>>;
    listConfirms(pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmEntityData>>>;
    queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmEntityData>>>;
    getStatistics(): Promise<ApiResponse<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>>;
    healthCheck(): Promise<ApiResponse<{
        status: string;
        timestamp: string;
    }>>;
}
//# sourceMappingURL=confirm.controller.d.ts.map