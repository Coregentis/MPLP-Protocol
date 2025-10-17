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
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    getMetadata(): ProtocolMetadata;
    execute(request: ContextProtocolRequest): Promise<ContextProtocolResponse>;
    private executeBusinessLogic;
    private handleError;
    healthCheck(): Promise<HealthStatus>;
    private routeToServices;
    private getServicesInvolved;
    private createErrorResponse;
    private checkContextService;
    private checkAnalyticsHealth;
    private checkSecurityHealth;
}
//# sourceMappingURL=context.protocol.d.ts.map