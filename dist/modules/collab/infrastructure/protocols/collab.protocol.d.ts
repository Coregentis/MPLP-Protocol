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
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    getMetadata(): ProtocolMetadata;
    execute(request: CollabProtocolRequest): Promise<CollabProtocolResponse>;
    private executeBusinessLogic;
    private entityToData;
    private handleError;
    healthCheck(): Promise<HealthStatus>;
    private checkCollabService;
    private validateRequest;
    private validateResponse;
}
//# sourceMappingURL=collab.protocol.d.ts.map