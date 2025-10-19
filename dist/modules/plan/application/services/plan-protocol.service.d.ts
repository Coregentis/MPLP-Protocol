/**
 * Plan协议服务 - 规划协议管理 (重构版本)
 *
 * @description 基于Plan模块重构指南的规划协议路由和管理服务
 * 整合PlanManagementService功能，实现标准3个企业级服务架构
 * 职责：协议路由、请求验证、响应标准化、AI算法外置调用、计划CRUD操作
 * @version 3.0.0 - 服务整合版本
 * @layer 应用层 - 协议管理服务
 * @standard 统一企业级质量标准
 * @refactor 整合管理服务功能，AI算法外置，协议边界清晰化
 */
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
/**
 * Plan协议服务 - 规划协议路由和管理服务 (重构整合版本)
 *
 * @description 基于Plan模块重构指南的协议管理服务
 * 整合原PlanManagementService功能，实现统一的协议管理
 * 职责：协议路由、请求验证、响应标准化、AI算法外置调用、计划CRUD操作
 * @standard 统一企业级质量标准
 */
export declare class PlanProtocolService {
    private readonly planRepository;
    private readonly aiServiceAdapter;
    private readonly logger;
    constructor(planRepository: IPlanRepository, aiServiceAdapter: IAIServiceAdapter, logger: ILogger);
    /**
     * 创建规划请求
     * 基于重构指南的规划请求创建逻辑
     */
    createPlanRequest(data: CreatePlanRequestData): Promise<PlanRequestEntity>;
    /**
     * 执行规划请求 - AI算法外置调用
     * 基于重构指南的AI服务调用逻辑
     */
    executePlanRequest(requestId: string): Promise<PlanResultEntity>;
    /**
     * 获取规划结果
     * 基于重构指南的结果查询逻辑
     */
    getPlanResult(requestId: string): Promise<PlanResultEntity | null>;
    /**
     * 创建计划
     * 整合自PlanManagementService的计划创建功能
     */
    createPlan(params: PlanCreationParams): Promise<PlanEntityData>;
    /**
     * 获取计划
     * 整合自PlanManagementService的计划查询功能
     */
    getPlan(planId: UUID): Promise<PlanEntityData | null>;
    /**
     * 执行计划
     * 整合自PlanManagementService的计划执行功能
     */
    executePlan(planId: UUID, options?: PlanExecutionOptions): Promise<PlanEntityData>;
    /**
     * 优化计划
     * 整合自PlanManagementService的计划优化功能
     */
    optimizePlan(planId: UUID, params?: PlanOptimizationParams): Promise<PlanEntityData>;
    /**
     * 验证规划请求
     * 基于重构指南的请求验证逻辑
     */
    private validatePlanRequest;
    /**
     * 生成请求ID
     */
    private generateRequestId;
    /**
     * 生成结果ID
     */
    private generateResultId;
}
//# sourceMappingURL=plan-protocol.service.d.ts.map