/**
 * Plan协议实现 - 重构版本
 *
 * @description Plan模块的MPLP协议实现，基于3个企业级服务和AI算法外置
 * 集成PlanProtocolService、PlanCoordinationService、PlanSecurityService
 * @version 2.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与其他8个已完成模块IDENTICAL架构
 * @refactor AI算法外置，3个企业级服务架构
 */
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
/**
 * Plan协议实现 - 重构版本
 *
 * @description 基于3个企业级服务的协议实现，实现标准IMLPPProtocol接口
 * 集成PlanProtocolService、PlanCoordinationService、PlanSecurityService
 * @version 2.0.0 - AI算法外置，3个企业级服务架构
 * @pattern 与其他8个已完成模块使用IDENTICAL的L3管理器注入模式
 */
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
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作
     * @pattern 与Context模块使用IDENTICAL的标准接口实现
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 实现IMLPPProtocol标准接口：健康检查
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 获取协议元数据（内部实现）
     */
    getMetadata(): ProtocolMetadata;
    /**
     * 处理创建计划请求
     */
    private handleCreatePlan;
    /**
     * 处理执行计划请求
     */
    private handleExecutePlan;
    /**
     * 处理获取计划结果请求
     */
    private handleGetPlanResult;
    /**
     * 处理验证计划请求
     */
    private handleValidatePlan;
    /**
     * 处理计划优化请求
     */
    private handleOptimizePlan;
    /**
     * 处理模块集成请求
     */
    private handleModuleIntegration;
    /**
     * 处理协调场景请求
     */
    private handleCoordinationScenario;
}
//# sourceMappingURL=plan.protocol.d.ts.map