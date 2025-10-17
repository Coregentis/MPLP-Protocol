import { PlanEntityData, PlanMetadata } from '../../api/mappers/plan.mapper';
import { UUID } from '../../../../shared/types';
import { IAIServiceAdapter } from '../../infrastructure/adapters/ai-service.adapter';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
export interface PlanCreationParams {
    contextId: UUID;
    name: string;
    description?: string;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    tasks?: Array<{
        name: string;
        description?: string;
        type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
        priority?: 'critical' | 'high' | 'medium' | 'low';
    }>;
    metadata?: PlanMetadata;
}
export interface PlanUpdateParams {
    planId: UUID;
    name?: string;
    description?: string;
    status?: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    metadata?: PlanMetadata;
}
export interface PlanExecutionOptions {
    strategy?: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
    dryRun?: boolean;
    validateDependencies?: boolean;
}
export interface PlanOptimizationParams {
    constraints?: Record<string, unknown>;
    objectives?: string[];
}
export declare class PlanManagementService {
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    private readonly aiServiceAdapter?;
    constructor(securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager, aiServiceAdapter?: IAIServiceAdapter | undefined);
    createPlan(params: PlanCreationParams): Promise<PlanEntityData>;
    getPlan(planId: UUID): Promise<PlanEntityData | null>;
    updatePlan(params: PlanUpdateParams): Promise<PlanEntityData>;
    deletePlan(_planId: UUID): Promise<boolean>;
    executePlan(_planId: UUID, _options?: PlanExecutionOptions): Promise<{
        status: 'completed' | 'failed' | 'partial';
        completedTasks: number;
        totalTasks: number;
        errors?: string[];
    }>;
    optimizePlan(planId: UUID, params?: PlanOptimizationParams): Promise<{
        originalScore: number;
        optimizedScore: number;
        improvements: string[];
    }>;
    validatePlan(_planId: UUID): Promise<{
        isValid: boolean;
        violations: string[];
        recommendations: string[];
    }>;
    private validatePlanCoordinationPermission;
    private getPlanCoordinationContext;
    private recordPlanCoordinationMetrics;
    private managePlanExtensionCoordination;
    private requestPlanChangeCoordination;
    private coordinateCollabPlanManagement;
    private enableDialogDrivenPlanCoordination;
    private coordinatePlanAcrossNetwork;
}
//# sourceMappingURL=plan-management.service.d.ts.map