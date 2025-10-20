/**
 * Plan管理服务
 *
 * @description Plan模块的核心业务逻辑服务，实现智能任务规划协调功能
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @integration 包含8个MPLP模块预留接口，等待CoreOrchestrator激活
 * @reference 基于Context模块成功实现模式
 */
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
/**
 * Plan管理服务实现
 *
 * @description 基于实际管理器接口的服务实现，确保类型安全和零技术债务
 * @pattern 与Context模块使用IDENTICAL的L3管理器注入模式
 */
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
    constructor(securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager, aiServiceAdapter?: IAIServiceAdapter);
    /**
     * 创建计划
     */
    createPlan(params: PlanCreationParams): Promise<PlanEntityData>;
    /**
     * 获取计划
     */
    getPlan(planId: UUID): Promise<PlanEntityData | null>;
    /**
     * 更新计划
     */
    updatePlan(params: PlanUpdateParams): Promise<PlanEntityData>;
    /**
     * 删除计划
     */
    deletePlan(_planId: UUID): Promise<boolean>;
    /**
     * 执行计划
     */
    executePlan(_planId: UUID, _options?: PlanExecutionOptions): Promise<{
        status: 'completed' | 'failed' | 'partial';
        completedTasks: number;
        totalTasks: number;
        errors?: string[];
    }>;
    /**
     * 优化计划 - AI算法外置版本
     *
     * @description 基于SCTM批判性思维，将AI优化算法外置到L4应用层
     * 协议层只负责请求转发和响应标准化，不包含AI算法实现
     */
    optimizePlan(planId: UUID, params?: PlanOptimizationParams): Promise<{
        originalScore: number;
        optimizedScore: number;
        improvements: string[];
    }>;
    /**
     * 验证计划
     */
    validatePlan(_planId: UUID): Promise<{
        isValid: boolean;
        violations: string[];
        recommendations: string[];
    }>;
    /**
     * Core coordination interfaces (4 deep integration modules)
     * These are the most critical cross-module coordination capabilities
     */
    /**
     * Validate plan coordination permission - Role module coordination
     * @param _userId - User requesting coordination access
     * @param _planId - Target plan for coordination
     * @param _coordinationContext - Coordination context data
     * @returns Promise<boolean> - Whether coordination is permitted
     */
    private validatePlanCoordinationPermission;
    /**
     * Get plan coordination context - Context module coordination environment
     * @param _contextId - Associated context ID
     * @param _planType - Type of plan for context retrieval
     * @returns Promise<Record<string, unknown>> - Coordination context data
     */
    private getPlanCoordinationContext;
    /**
     * Record plan coordination metrics - Trace module coordination monitoring
     * @param _planId - Plan ID for metrics recording
     * @param _metrics - Coordination metrics data
     * @returns Promise<void> - Metrics recording completion
     */
    private recordPlanCoordinationMetrics;
    /**
     * Manage plan extension coordination - Extension module coordination management
     * @param _planId - Plan ID for extension coordination
     * @param _extensions - Extension coordination data
     * @returns Promise<boolean> - Whether extension coordination succeeded
     */
    private managePlanExtensionCoordination;
    /**
     * Extended coordination interfaces (4 additional modules)
     * These provide broader ecosystem integration capabilities
     */
    /**
     * Request plan change coordination - Confirm module change coordination
     * @param _planId - Plan ID for change coordination
     * @param _change - Change coordination data
     * @returns Promise<boolean> - Whether change coordination was approved
     */
    private requestPlanChangeCoordination;
    /**
     * Coordinate collaborative plan management - Collab module collaboration coordination
     * @param _collabId - Collaboration ID for plan management
     * @param _planConfig - Plan configuration for collaboration
     * @returns Promise<boolean> - Whether collaboration coordination succeeded
     */
    private coordinateCollabPlanManagement;
    /**
     * Enable dialog-driven plan coordination - Dialog module conversation coordination
     * @param _dialogId - Dialog ID for plan coordination
     * @param _planParticipants - Plan participants for dialog coordination
     * @returns Promise<boolean> - Whether dialog coordination succeeded
     */
    private enableDialogDrivenPlanCoordination;
    /**
     * Coordinate plan across network - Network module distributed coordination
     * @param _networkId - Network ID for plan coordination
     * @param _planConfig - Plan configuration for network coordination
     * @returns Promise<boolean> - Whether network coordination succeeded
     */
    private coordinatePlanAcrossNetwork;
}
//# sourceMappingURL=plan-management.service.d.ts.map