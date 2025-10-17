export interface IntegrationResult {
    success: boolean;
    message: string;
    data: Record<string, unknown>;
    timestamp?: string;
    metadata?: {
        moduleIntegrated: string;
        integrationTime: number;
        dataSize?: number;
    };
}
export interface CoordinationScenario {
    type: 'multi_agent_planning' | 'resource_allocation' | 'task_distribution' | 'conflict_resolution';
    participants: string[];
    parameters: Record<string, unknown>;
    constraints?: Record<string, unknown>;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface CoordinationResult {
    success: boolean;
    data: Record<string, unknown>;
    participants: string[];
    coordinationTime: number;
    recommendations?: string[];
}
export interface CoordinationManager {
    coordinateOperation(operation: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    healthCheck(): Promise<boolean>;
}
export interface IPlanRepository {
    findById(id: string): Promise<Record<string, unknown> | null>;
    save(entity: Record<string, unknown>): Promise<Record<string, unknown>>;
    update(entity: Record<string, unknown>): Promise<Record<string, unknown>>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export declare class PlanIntegrationService {
    private readonly _planRepository;
    private readonly coordinationManager;
    private readonly logger;
    constructor(_planRepository: IPlanRepository, coordinationManager: CoordinationManager, logger: ILogger);
    integrateWithContext(_contextId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithRole(_roleId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithNetwork(_networkId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithTrace(_traceId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithConfirm(_confirmId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithExtension(_extensionId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithDialog(_dialogId: string, _planData: unknown): Promise<IntegrationResult>;
    integrateWithCollab(_collabId: string, _planData: unknown): Promise<IntegrationResult>;
    supportCoordinationScenario(scenario: CoordinationScenario): Promise<CoordinationResult>;
    private handleMultiAgentPlanning;
    private handleResourceAllocation;
    private handleTaskDistribution;
    private handleConflictResolution;
}
//# sourceMappingURL=plan-integration.service.d.ts.map