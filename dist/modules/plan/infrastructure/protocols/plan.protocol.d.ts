import { PlanProtocolService } from '../../application/services/plan-protocol.service';
import { PlanIntegrationService } from '../../application/services/plan-integration.service';
import { PlanValidationService } from '../../application/services/plan-validation.service';
import { PlanEntityData } from '../../api/mappers/plan.mapper';
import { UUID, PaginationParams } from '../../../../shared/types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface PlanProtocolRequest {
    requestId: string;
    timestamp: string;
    operation: 'create' | 'update' | 'delete' | 'get' | 'list' | 'query' | 'execute' | 'optimize' | 'validate';
    payload: {
        planData?: Partial<PlanEntityData>;
        planId?: UUID;
        contextId?: UUID;
        query?: Record<string, unknown>;
        pagination?: PaginationParams;
        executionOptions?: {
            strategy?: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
            dryRun?: boolean;
            validateDependencies?: boolean;
        };
        optimizationParams?: {
            constraints?: Record<string, unknown>;
            objectives?: string[];
        };
    };
    metadata?: Record<string, unknown>;
}
export interface PlanProtocolResponse {
    success: boolean;
    data?: {
        plan?: PlanEntityData;
        plans?: PlanEntityData[];
        total?: number;
        deleted?: boolean;
        executionResult?: {
            status: 'completed' | 'failed' | 'partial';
            completedTasks: number;
            totalTasks: number;
            errors?: string[];
        };
        optimizationResult?: {
            originalScore: number;
            optimizedScore: number;
            improvements: string[];
        };
        validationResult?: {
            isValid: boolean;
            violations: string[];
            recommendations: string[];
        };
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
export declare class PlanProtocol implements IMLPPProtocol {
    private readonly planProtocolService;
    private readonly planIntegrationService;
    private readonly planValidationService;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    constructor(planProtocolService: PlanProtocolService, planIntegrationService: PlanIntegrationService, planValidationService: PlanValidationService, securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager);
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
    getMetadata(): ProtocolMetadata;
    private handleCreatePlan;
    private handleExecutePlan;
    private handleGetPlanResult;
    private handleValidatePlan;
    private handleOptimizePlan;
    private handleModuleIntegration;
    private handleCoordinationScenario;
}
//# sourceMappingURL=plan.protocol.d.ts.map