/**
 * MPLP协议基础类
 *
 * @description 所有MPLP模块协议的基础类，提供统一的协议接口和横切关注点集成
 * @version 1.0.0
 * @architecture 统一DDD架构 + L3管理器注入模式
 */
import { MLPPSecurityManager } from './cross-cutting-concerns/security-manager.js';
import { MLPPPerformanceMonitor } from './cross-cutting-concerns/performance-monitor.js';
import { MLPPEventBusManager } from './cross-cutting-concerns/event-bus-manager.js';
import { MLPPErrorHandler } from './cross-cutting-concerns/error-handler.js';
import { MLPPCoordinationManager } from './cross-cutting-concerns/coordination-manager.js';
import { MLPPOrchestrationManager } from './cross-cutting-concerns/orchestration-manager.js';
import { MLPPStateSyncManager } from './cross-cutting-concerns/state-sync-manager.js';
import { MLPPTransactionManager } from './cross-cutting-concerns/transaction-manager.js';
import { MLPPProtocolVersionManager } from './cross-cutting-concerns/protocol-version-manager.js';
/**
 * MPLP协议请求接口
 */
export interface MLPPRequest {
    protocolVersion: string;
    timestamp: string;
    requestId: string;
    operation: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
/**
 * MPLP协议响应接口
 */
export interface MLPPResponse {
    protocolVersion: string;
    timestamp: string;
    requestId: string;
    status?: 'success' | 'error' | 'pending';
    success?: boolean;
    data?: unknown;
    result?: Record<string, unknown>;
    message?: string;
    error?: string | {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
}
/**
 * 协议元数据接口
 */
export interface ProtocolMetadata {
    name: string;
    moduleName?: string;
    version: string;
    description: string;
    capabilities: string[];
    dependencies: string[];
    supportedOperations: string[];
    crossCuttingConcerns?: string[];
    slaGuarantees?: Record<string, string>;
}
/**
 * 健康状态接口
 */
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string | Date;
    details?: Record<string, unknown>;
    checks: Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        duration?: number;
    }>;
    metadata?: Record<string, unknown>;
}
/**
 * MPLP协议接口
 *
 * @description 所有MPLP模块必须实现的标准协议接口
 */
export interface IMLPPProtocol {
    /**
     * 执行协议操作
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 健康检查
     */
    healthCheck(): Promise<HealthStatus>;
}
/**
 * MPLP协议基础类
 *
 * @description 提供统一的L3管理器注入和基础功能实现
 * @pattern 所有10个模块使用IDENTICAL的继承模式
 */
export declare abstract class MLPPProtocolBase implements IMLPPProtocol {
    protected readonly securityManager: MLPPSecurityManager;
    protected readonly performanceMonitor: MLPPPerformanceMonitor;
    protected readonly eventBusManager: MLPPEventBusManager;
    protected readonly errorHandler: MLPPErrorHandler;
    protected readonly coordinationManager: MLPPCoordinationManager;
    protected readonly orchestrationManager: MLPPOrchestrationManager;
    protected readonly stateSyncManager: MLPPStateSyncManager;
    protected readonly transactionManager: MLPPTransactionManager;
    protected readonly protocolVersionManager: MLPPProtocolVersionManager;
    /**
     * 统一的L3管理器注入 (所有模块使用相同的注入模式)
     */
    protected constructor(securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager);
    /**
     * 抽象方法：子类必须实现具体的操作执行逻辑
     */
    abstract executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 抽象方法：子类必须提供协议元数据
     */
    abstract getProtocolMetadata(): ProtocolMetadata;
    /**
     * 默认健康检查实现
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 检查单个管理器的健康状态
     */
    private checkManagerHealth;
    /**
     * 抽象方法：子类可以实现模块特定的健康检查
     */
    protected performModuleHealthChecks(): Promise<HealthStatus['checks']>;
    /**
     * 创建标准响应
     */
    protected createResponse(request: MLPPRequest, status: MLPPResponse['status'], result?: Record<string, unknown>, error?: MLPPResponse['error']): MLPPResponse;
    /**
     * 创建错误响应
     */
    protected createErrorResponse(request: MLPPRequest, code: string, message: string, details?: Record<string, unknown>): MLPPResponse;
}
//# sourceMappingURL=mplp-protocol-base.d.ts.map