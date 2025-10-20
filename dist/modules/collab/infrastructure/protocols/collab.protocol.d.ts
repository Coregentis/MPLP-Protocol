/**
 * Collab协议实现
 *
 * @description Collab模块的MPLP协议实现，基于其他6个已完成模块的企业级标准集成所有9个L3横切关注点管理器
 * @version 1.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与Context/Plan/Role/Confirm/Trace/Extension模块IDENTICAL架构
 */
import { CollabManagementService } from '../../application/services/collab-management.service';
import { CollabCreateDTO, CollabUpdateDTO, CollabListQueryDTO } from '../../api/dto/collab.dto';
import { UUID } from '../../../../shared/types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface CollabProtocolRequest {
    requestId: string;
    timestamp: string;
    operation: 'create' | 'update' | 'delete' | 'get' | 'list' | 'start' | 'stop' | 'add_participant' | 'remove_participant' | 'batch_create' | 'batch_update' | 'search' | 'health_check';
    payload: {
        collaborationData?: CollabCreateDTO | CollabUpdateDTO;
        collaborationId?: UUID;
        collaborationIds?: UUID[];
        collaborationsData?: (CollabCreateDTO | CollabUpdateDTO)[];
        query?: CollabListQueryDTO;
        searchQuery?: {
            query: string;
            filters?: Record<string, unknown>;
            page?: number;
            limit?: number;
        };
        participantData?: {
            agentId: UUID;
            roleId: UUID;
            capabilities?: string[];
        };
        participantId?: UUID;
        reason?: string;
    };
    metadata?: Record<string, unknown>;
}
export interface CollabProtocolResponse {
    success: boolean;
    data?: {
        collaboration?: Record<string, unknown>;
        collaborations?: Record<string, unknown>[];
        batchResults?: {
            successful: Record<string, unknown>[];
            failed: Array<{
                index: number;
                error: string;
                data?: Record<string, unknown>;
            }>;
        };
        searchResults?: {
            items: Record<string, unknown>[];
            totalMatches: number;
            executionTimeMs: number;
        };
        healthStatus?: {
            status: 'healthy' | 'degraded' | 'unhealthy';
            checks: Array<{
                name: string;
                status: 'pass' | 'fail' | 'warn';
                message: string;
            }>;
        };
        total?: number;
        metadata?: Record<string, unknown>;
    };
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
    requestId: string;
}
/**
 * Collab协议实现
 *
 * @description 基于实际管理器接口的协议实现，实现标准IMLPPProtocol接口，确保类型安全和零技术债务
 */
export declare class CollabProtocol implements IMLPPProtocol {
    private readonly collabManagementService;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    constructor(collabManagementService: CollabManagementService, securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager);
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议元数据（内部实现）
     */
    getMetadata(): ProtocolMetadata;
    /**
     * 执行协议操作 - 基于实际管理器接口的统一调用序列
     */
    execute(request: CollabProtocolRequest): Promise<CollabProtocolResponse>;
    /**
     * 执行业务逻辑 - 基于实际的CollabManagementService接口
     */
    private executeBusinessLogic;
    /**
     * 将CollabEntity转换为CollabEntityData
     */
    private entityToData;
    /**
     * 错误处理 - 基于实际管理器接口
     */
    private handleError;
    /**
     * 健康检查 - 实现IMLPPProtocol标准接口
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 检查Collab服务健康状态
     */
    private checkCollabService;
    /**
     * 验证协议请求
     */
    private validateRequest;
    /**
     * 验证协议响应
     */
    private validateResponse;
}
//# sourceMappingURL=collab.protocol.d.ts.map