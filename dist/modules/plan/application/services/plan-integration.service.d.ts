/**
 * Plan集成服务 - 与其他模块的集成接口服务 (Context模块A+标准)
 *
 * @description 基于Plan模块重构指南的集成接口服务
 * 职责：跨模块协调、预留接口管理、数据同步、协调场景支持
 * @version 2.0.0 - AI算法外置版本
 * @layer 应用层 - 集成服务
 * @standard Context模块A+企业级质量标准
 * @refactor 8个MPLP模块预留接口，等待CoreOrchestrator激活
 */
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
/**
 * Plan集成服务 - 与其他模块的集成接口服务
 *
 * @description 基于Plan模块重构指南的集成管理服务
 * 职责：跨模块协调、预留接口管理、数据同步、协调场景支持
 * @standard Context模块A+企业级质量标准
 */
export declare class PlanIntegrationService {
    private readonly _planRepository;
    private readonly coordinationManager;
    private readonly logger;
    constructor(_planRepository: IPlanRepository, // 预留给CoreOrchestrator使用
    coordinationManager: CoordinationManager, logger: ILogger);
    /**
     * 与Context模块集成
     * 预留接口：等待CoreOrchestrator激活Context模块集成
     */
    integrateWithContext(_contextId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Role模块集成
     * 预留接口：等待CoreOrchestrator激活Role模块集成
     */
    integrateWithRole(_roleId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Network模块集成
     * 预留接口：等待CoreOrchestrator激活Network模块集成
     */
    integrateWithNetwork(_networkId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Trace模块集成
     * 预留接口：等待CoreOrchestrator激活Trace模块集成
     */
    integrateWithTrace(_traceId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Confirm模块集成
     * 预留接口：等待CoreOrchestrator激活Confirm模块集成
     */
    integrateWithConfirm(_confirmId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Extension模块集成
     * 预留接口：等待CoreOrchestrator激活Extension模块集成
     */
    integrateWithExtension(_extensionId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Dialog模块集成
     * 预留接口：等待CoreOrchestrator激活Dialog模块集成
     */
    integrateWithDialog(_dialogId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 与Collab模块集成
     * 预留接口：等待CoreOrchestrator激活Collab模块集成
     */
    integrateWithCollab(_collabId: string, _planData: unknown): Promise<IntegrationResult>;
    /**
     * 支持协调场景
     * 基于重构指南的协调场景处理逻辑
     */
    supportCoordinationScenario(scenario: CoordinationScenario): Promise<CoordinationResult>;
    /**
     * 处理多智能体规划协调
     */
    private handleMultiAgentPlanning;
    /**
     * 处理资源分配协调
     */
    private handleResourceAllocation;
    /**
     * 处理任务分发协调
     */
    private handleTaskDistribution;
    /**
     * 处理冲突解决协调
     */
    private handleConflictResolution;
}
//# sourceMappingURL=plan-integration.service.d.ts.map