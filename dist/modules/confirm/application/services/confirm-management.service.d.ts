/**
 * Confirm管理服务
 *
 * @description Confirm模块的核心应用服务，处理业务逻辑和协调
 * @version 1.0.0
 * @layer 应用层 - 服务
 */
import { IConfirmRepository, PaginationParams, PaginatedResult, ConfirmQueryFilter } from '../../domain/repositories/confirm-repository.interface';
import { CreateConfirmRequest, UpdateConfirmRequest, ConfirmEntityData, UUID } from '../../types';
/**
 * Confirm管理服务
 *
 * @description 提供Confirm模块的核心业务逻辑，包括审批工作流管理
 */
export declare class ConfirmManagementService {
    private readonly repository;
    constructor(repository: IConfirmRepository);
    /**
     * 创建确认
     */
    createConfirm(request: CreateConfirmRequest): Promise<ConfirmEntityData>;
    /**
     * 审批确认
     */
    approveConfirm(confirmId: UUID, approverId: UUID, comments?: string): Promise<ConfirmEntityData>;
    /**
     * 拒绝确认
     */
    rejectConfirm(confirmId: UUID, approverId: UUID, reason: string): Promise<ConfirmEntityData>;
    /**
     * 委派确认
     */
    delegateConfirm(confirmId: UUID, fromApproverId: UUID, toApproverId: UUID, reason?: string): Promise<ConfirmEntityData>;
    /**
     * 升级确认
     */
    escalateConfirm(confirmId: UUID, _reason: string): Promise<ConfirmEntityData>;
    /**
     * 更新确认
     */
    updateConfirm(confirmId: UUID, updates: UpdateConfirmRequest): Promise<ConfirmEntityData>;
    /**
     * 删除确认
     */
    deleteConfirm(confirmId: UUID): Promise<void>;
    /**
     * 获取确认
     */
    getConfirm(confirmId: UUID): Promise<ConfirmEntityData>;
    /**
     * 列出确认
     */
    listConfirms(pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntityData>>;
    /**
     * 查询确认
     */
    queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntityData>>;
    /**
     * 获取统计信息
     */
    getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    /**
     * 实体转换为数据对象
     */
    private entityToData;
    /**
     * 生成UUID
     */
    private generateUUID;
    /**
     * Core coordination interfaces (4 deep integration modules)
     * These are the most critical cross-module coordination capabilities
     */
    /**
     * Validate confirm coordination permission - Role module coordination
     * @param _userId - User requesting coordination access
     * @param _confirmId - Target confirmation for coordination
     * @param _coordinationContext - Coordination context data
     * @returns Promise<boolean> - Whether coordination is permitted
     * @reserved Reserved for CoreOrchestrator activation
     */
    private validateConfirmCoordinationPermission;
    /**
     * Get confirm coordination context - Context module coordination environment
     * @param _contextId - Associated context ID
     * @param _confirmType - Type of confirmation for context retrieval
     * @returns Promise<Record<string, unknown>> - Coordination context data
     * @reserved Reserved for CoreOrchestrator activation
     */
    private getConfirmCoordinationContext;
    /**
     * Record confirm coordination metrics - Trace module coordination monitoring
     * @param _confirmId - Confirmation ID for metrics recording
     * @param _metrics - Coordination metrics data
     * @returns Promise<void> - Metrics recording completion
     * @reserved Reserved for CoreOrchestrator activation
     */
    private recordConfirmCoordinationMetrics;
    /**
     * Manage confirm extension coordination - Extension module coordination management
     * @param _confirmId - Confirmation ID for extension coordination
     * @param _extensions - Extension coordination data
     * @returns Promise<boolean> - Whether extension coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    private manageConfirmExtensionCoordination;
    /**
     * Extended coordination interfaces (4 additional modules)
     * These provide broader ecosystem integration capabilities
     */
    /**
     * Request confirm plan coordination - Plan module planning coordination
     * @param _planId - Plan ID for confirmation coordination
     * @param _confirmConfig - Confirmation configuration for planning
     * @returns Promise<boolean> - Whether plan coordination was successful
     * @reserved Reserved for CoreOrchestrator activation
     */
    private requestConfirmPlanCoordination;
    /**
     * Coordinate collaborative confirm management - Collab module collaboration coordination
     * @param _collabId - Collaboration ID for confirm management
     * @param _confirmConfig - Confirmation configuration for collaboration
     * @returns Promise<boolean> - Whether collaboration coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    private coordinateCollabConfirmManagement;
    /**
     * Enable dialog-driven confirm coordination - Dialog module conversation coordination
     * @param _dialogId - Dialog ID for confirm coordination
     * @param _confirmParticipants - Confirmation participants for dialog coordination
     * @returns Promise<boolean> - Whether dialog coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    private enableDialogDrivenConfirmCoordination;
    /**
     * Coordinate confirm across network - Network module distributed coordination
     * @param _networkId - Network ID for confirm coordination
     * @param _confirmConfig - Confirmation configuration for network coordination
     * @returns Promise<boolean> - Whether network coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    private coordinateConfirmAcrossNetwork;
}
//# sourceMappingURL=confirm-management.service.d.ts.map