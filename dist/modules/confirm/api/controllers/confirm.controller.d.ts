/**
 * Confirm控制器
 *
 * @description Confirm模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { CreateConfirmRequest, UpdateConfirmRequest, ConfirmQueryFilter, ConfirmEntityData, UUID } from '../../types';
import { PaginationParams, PaginatedResult } from '../../domain/repositories/confirm-repository.interface';
/**
 * API响应接口
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
/**
 * Confirm控制器
 *
 * @description 提供Confirm模块的REST API接口
 */
export declare class ConfirmController {
    private readonly confirmService;
    constructor(confirmService: ConfirmManagementService);
    /**
     * 创建确认
     * POST /confirms
     */
    createConfirm(request: CreateConfirmRequest): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 审批确认
     * POST /confirms/:confirmId/approve
     */
    approveConfirm(confirmId: UUID, approverId: UUID, comments?: string): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 拒绝确认
     * POST /confirms/:confirmId/reject
     */
    rejectConfirm(confirmId: UUID, approverId: UUID, reason: string): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 委派确认
     * POST /confirms/:confirmId/delegate
     */
    delegateConfirm(confirmId: UUID, fromApproverId: UUID, toApproverId: UUID, reason?: string): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 升级确认
     * POST /confirms/:confirmId/escalate
     */
    escalateConfirm(confirmId: UUID, reason: string): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 更新确认
     * PUT /confirms/:confirmId
     */
    updateConfirm(confirmId: UUID, updates: UpdateConfirmRequest): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 删除确认
     * DELETE /confirms/:confirmId
     */
    deleteConfirm(confirmId: UUID): Promise<ApiResponse<void>>;
    /**
     * 获取确认
     * GET /confirms/:confirmId
     */
    getConfirm(confirmId: UUID): Promise<ApiResponse<ConfirmEntityData>>;
    /**
     * 列出确认
     * GET /confirms
     */
    listConfirms(pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmEntityData>>>;
    /**
     * 查询确认
     * POST /confirms/query
     */
    queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmEntityData>>>;
    /**
     * 获取统计信息
     * GET /confirms/statistics
     */
    getStatistics(): Promise<ApiResponse<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>>;
    /**
     * 健康检查
     * GET /confirms/health
     */
    healthCheck(): Promise<ApiResponse<{
        status: string;
        timestamp: string;
    }>>;
}
//# sourceMappingURL=confirm.controller.d.ts.map