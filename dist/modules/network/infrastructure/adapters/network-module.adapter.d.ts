/**
 * Network模块适配器
 *
 * @description 提供Network模块的统一访问接口和外部系统集成，基于DDD架构
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 */
import { NetworkController } from '../../api/controllers/network.controller';
import { NetworkManagementService } from '../../application/services/network-management.service';
import { MemoryNetworkRepository } from '../repositories/network.repository';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * Network模块适配器配置
 */
export interface NetworkModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    networkTimeout?: number;
    maxConnections?: number;
}
/**
 * Network模块适配器
 *
 * @description 提供Network模块的统一访问接口和外部系统集成
 */
export declare class NetworkModuleAdapter {
    private readonly config;
    private readonly crossCuttingFactory;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    private readonly repository;
    private readonly service;
    private readonly controller;
    constructor(config?: NetworkModuleAdapterConfig);
    /**
     * 初始化适配器
     */
    private initialize;
    /**
     * 注册事件监听器
     */
    private registerEventListeners;
    /**
     * 初始化性能监控
     */
    private initializePerformanceMonitoring;
    /**
     * 处理网络状态变更
     */
    private handleNetworkStatusChange;
    /**
     * 处理节点状态变更
     */
    private handleNodeStatusChange;
    /**
     * 处理连接变更
     */
    private handleConnectionChange;
    /**
     * 获取适配器ID
     */
    private _getAdapterId;
    /**
     * 获取控制器实例
     */
    getController(): NetworkController;
    /**
     * 获取服务实例
     */
    getService(): NetworkManagementService;
    /**
     * 获取仓储实例
     */
    getRepository(): MemoryNetworkRepository;
    /**
     * 获取配置信息
     */
    getConfig(): Required<NetworkModuleAdapterConfig>;
    /**
     * 获取横切关注点管理器
     */
    getCrossCuttingManagers(): {
        security: MLPPSecurityManager;
        performance: MLPPPerformanceMonitor;
        eventBus: MLPPEventBusManager;
        errorHandler: MLPPErrorHandler;
        coordination: MLPPCoordinationManager;
        orchestration: MLPPOrchestrationManager;
        stateSync: MLPPStateSyncManager;
        transaction: MLPPTransactionManager;
        protocolVersion: MLPPProtocolVersionManager;
    };
    /**
     * 健康检查
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: {
            adapter: boolean;
            repository: boolean;
            service: boolean;
            controller: boolean;
            crossCuttingConcerns: boolean;
        };
        timestamp: string;
    }>;
    /**
     * 获取模块信息
     */
    getModuleInfo(): {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        features: string[];
        dependencies: string[];
    };
    /**
     * 与Context模块协作 - 预留接口
     */
    coordinateWithContext(_contextId: string, _operation: string): Promise<boolean>;
    /**
     * 与Plan模块协作 - 预留接口
     */
    coordinateWithPlan(_planId: string, _config: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Role模块协作 - 预留接口
     */
    coordinateWithRole(_roleId: string, _permissions: string[]): Promise<boolean>;
    /**
     * 与Trace模块协作 - 预留接口
     */
    coordinateWithTrace(_traceId: string, _operation: string): Promise<boolean>;
    /**
     * 与Extension模块协作 - 预留接口
     */
    coordinateWithExtension(_extensionId: string, _config: Record<string, unknown>): Promise<boolean>;
    /**
     * 处理CoreOrchestrator编排场景 - 预留接口
     */
    handleOrchestrationScenario(_scenario: string, _params: Record<string, unknown>): Promise<boolean>;
    /**
     * 关闭适配器
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=network-module.adapter.d.ts.map