import { UUID } from '../../../../shared/types';
import { IAIServiceAdapter } from '../../infrastructure/adapters/ai-service.adapter';
import { PlanEntityData } from '../../api/mappers/plan.mapper';
export interface CreatePlanRequestData {
    planType: 'task_planning' | 'resource_planning' | 'timeline_planning' | 'optimization';
    parameters: Record<string, unknown>;
    constraints?: {
        maxDuration?: number;
        maxCost?: number;
        minQuality?: number;
        resourceLimits?: Record<string, number>;
    };
    metadata?: {
        userId?: UUID;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        description?: string;
    };
}
export interface PlanRequestEntity {
    requestId: string;
    planType: string;
    parameters: Record<string, unknown>;
    constraints?: Record<string, unknown>;
    status: PlanStatus;
    createdAt: Date;
    updatedAt?: Date;
}
export interface PlanResultEntity {
    requestId: string;
    resultId: string;
    planData: Record<string, unknown>;
    confidence: number;
    metadata: {
        processingTime: number;
        algorithm?: string;
        iterations?: number;
    };
    status: 'completed' | 'failed' | 'partial';
    createdAt: Date;
}
export type PlanStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export interface IPlanRepository {
    savePlanRequest(request: PlanRequestEntity): Promise<PlanRequestEntity>;
    findPlanRequest(requestId: string): Promise<PlanRequestEntity | null>;
    updatePlanRequestStatus(requestId: string, status: PlanStatus): Promise<void>;
    savePlanResult(result: PlanResultEntity): Promise<PlanResultEntity>;
    findPlanResult(requestId: string): Promise<PlanResultEntity | null>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export interface ProtocolValidationResult {
    isValid: boolean;
    violations: Array<{
        field: string;
        rule: string;
        message: string;
        severity: 'error' | 'warning';
    }>;
    recommendations: string[];
}
export interface ProtocolMetrics {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
    protocolVersionDistribution: Record<string, number>;
}
export interface PlanCreationParams {
    contextId: UUID;
    name: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    tasks?: Array<{
        name: string;
        description?: string;
        type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }>;
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
export declare class PlanProtocolService {
    private readonly planRepository;
    private readonly aiServiceAdapter;
    private readonly logger;
    constructor(planRepository: IPlanRepository, aiServiceAdapter: IAIServiceAdapter, logger: ILogger);
    createPlanRequest(data: CreatePlanRequestData): Promise<PlanRequestEntity>;
    executePlanRequest(requestId: string): Promise<PlanResultEntity>;
    getPlanResult(requestId: string): Promise<PlanResultEntity | null>;
    createPlan(params: PlanCreationParams): Promise<PlanEntityData>;
    getPlan(planId: UUID): Promise<PlanEntityData | null>;
    executePlan(planId: UUID, options?: PlanExecutionOptions): Promise<PlanEntityData>;
    optimizePlan(planId: UUID, params?: PlanOptimizationParams): Promise<PlanEntityData>;
    private validatePlanRequest;
    private generateRequestId;
    private generateResultId;
}
//# sourceMappingURL=plan-protocol.service.d.ts.map