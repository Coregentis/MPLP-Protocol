/**
 * Context服务协调器 - GLFB反馈循环实现
 *
 * @description 基于GLFB反馈循环机制，协调3个核心服务的协作和数据流
 * 演示：ContextManagementService、ContextAnalyticsService、ContextSecurityService的统一协调
 * @version 2.0.0
 * @layer 应用层 - 协调器
 * @refactor 17→3服务简化后的统一协调机制
 */
import { ContextManagementService } from '../services/context-management.service';
import { ContextAnalyticsService } from '../services/context-analytics.service';
import { ContextSecurityService } from '../services/context-security.service';
import { ContextEntity } from '../../domain/entities/context.entity';
import { UUID } from '../../../../shared/types';
import { CreateContextData } from '../../types';
export interface ContextOperationResult {
    success: boolean;
    contextId: UUID;
    operation: string;
    timestamp: Date;
    data?: ContextEntity | Record<string, string | number | boolean | Date>;
    errors?: string[];
    warnings?: string[];
    performance?: {
        duration: number;
        servicesInvolved: string[];
    };
}
export interface ContextHealthCheck {
    contextId: UUID;
    overallHealth: 'healthy' | 'warning' | 'critical';
    managementHealth: 'healthy' | 'warning' | 'critical';
    analyticsHealth: 'healthy' | 'warning' | 'critical';
    securityHealth: 'healthy' | 'warning' | 'critical';
    recommendations: string[];
    lastChecked: Date;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
/**
 * Context服务协调器
 *
 * @description 实现GLFB反馈循环机制，协调3个核心服务的协作
 * 职责：服务协调、数据流管理、错误处理、性能监控、健康检查
 */
export declare class ContextServicesCoordinator {
    private readonly managementService;
    private readonly analyticsService;
    private readonly securityService;
    private readonly logger;
    constructor(managementService: ContextManagementService, analyticsService: ContextAnalyticsService, securityService: ContextSecurityService, logger: ILogger);
    /**
     * 创建上下文 - 全服务协调
     * 实现GLFB全局反馈：Management → Security → Analytics 的协调流程
     */
    createContextWithFullCoordination(data: CreateContextData, userId: UUID): Promise<ContextOperationResult>;
    /**
     * 上下文健康检查 - 跨服务状态验证
     * 实现GLFB局部反馈：各服务独立检查 → 综合评估
     */
    performHealthCheck(contextId: UUID): Promise<ContextHealthCheck>;
    /**
     * 上下文优化建议 - 基于跨服务分析
     * 实现GLFB反馈循环：分析 → 建议 → 应用 → 验证
     */
    generateOptimizationRecommendations(contextId: UUID): Promise<{
        contextId: UUID;
        recommendations: Array<{
            category: 'performance' | 'security' | 'usage' | 'maintenance';
            priority: 'high' | 'medium' | 'low';
            description: string;
            action: string;
            estimatedImpact: string;
        }>;
        generatedAt: Date;
    }>;
    private checkManagementHealth;
    private checkAnalyticsHealth;
    private checkSecurityHealth;
    private calculateOverallHealth;
    private generateHealthRecommendations;
    private isMaintenanceNeeded;
    private createErrorResult;
}
//# sourceMappingURL=context-services-coordinator.d.ts.map