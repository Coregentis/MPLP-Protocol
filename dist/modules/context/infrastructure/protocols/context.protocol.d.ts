/**
 * Context MPLP Protocol Implementation - 协议接口标准化重构版本
 *
 * @description 基于IMLPPProtocol标准接口，实现Context模块的统一协议
 * 集成3个核心服务和9个横切关注点管理器，符合MPLP统一架构标准
 * @version 2.0.0
 * @layer 基础设施层 - 协议实现
 * @refactor 17→3服务简化后的统一协议接口，与其他8个已完成模块使用IDENTICAL架构
 */
import { ContextManagementService } from '../../application/services/context-management.service';
import { ContextAnalyticsService } from '../../application/services/context-analytics.service';
import { ContextSecurityService } from '../../application/services/context-security.service';
import { UUID } from '../../../../shared/types';
import { ContextEntityData, CreateContextData, UpdateContextData, ContextFilter } from '../../types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface ContextProtocolRequest {
    requestId: string;
    timestamp: string;
    operation: 'create' | 'update' | 'delete' | 'get' | 'list' | 'query';
    payload: {
        contextData?: CreateContextData | UpdateContextData;
        contextId?: UUID;
        query?: ContextFilter;
        pagination?: {
            page?: number;
            limit?: number;
        };
    };
    metadata?: Record<string, unknown>;
}
export interface ContextProtocolResponse {
    success: boolean;
    data?: {
        context?: ContextEntityData;
        contexts?: ContextEntityData[];
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
 * Context协议实现 - 重构版本
 *
 * @description 基于3个核心服务的协议实现，实现标准IMLPPProtocol接口
 * 集成ContextManagementService、ContextAnalyticsService、ContextSecurityService
 * @version 2.0.0 - 17→3服务简化后的统一协议接口
 */
export declare class ContextProtocol implements IMLPPProtocol {
    private readonly contextManagementService;
    private readonly contextAnalyticsService;
    private readonly contextSecurityService;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    constructor(contextManagementService: ContextManagementService, contextAnalyticsService: ContextAnalyticsService, contextSecurityService: ContextSecurityService, securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager);
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作 - 重构版本
     * 支持3个核心服务的统一操作路由
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议元数据（内部实现） - 重构版本
     */
    getMetadata(): ProtocolMetadata;
    /**
     * 执行协议操作 - 基于实际管理器接口的统一调用序列
     */
    execute(request: ContextProtocolRequest): Promise<ContextProtocolResponse>;
    /**
     * 执行业务逻辑 - 基于实际的ContextManagementService接口
     */
    private executeBusinessLogic;
    /**
     * 错误处理 - 基于实际管理器接口
     */
    private handleError;
    /**
     * 健康检查 - 实现IMLPPProtocol标准接口
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 路由请求到3个核心服务
     */
    private routeToServices;
    /**
     * 获取操作涉及的服务
     */
    private getServicesInvolved;
    /**
     * 创建错误响应
     */
    private createErrorResponse;
    /**
     * 检查Context服务健康状态 - 更新为3个服务
     */
    private checkContextService;
    private checkAnalyticsHealth;
    private checkSecurityHealth;
}
//# sourceMappingURL=context.protocol.d.ts.map