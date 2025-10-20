/**
 * Confirm模块适配器
 *
 * @description 基于Context和Plan模块的企业级标准，提供Confirm模块的统一访问接口和外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @integration 统一L3管理器注入模式，与Context/Plan模块IDENTICAL架构
 */
import { ConfirmController } from '../../api/controllers/confirm.controller';
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmProtocol } from '../protocols/confirm.protocol';
import { ConfirmProtocolFactory } from '../factories/confirm-protocol.factory';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * Confirm模块适配器配置
 */
export interface ConfirmModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
}
/**
 * Confirm模块适配器
 *
 * @description 基于Context和Plan模块的企业级标准，提供Confirm模块的统一访问接口和外部系统集成
 */
export declare class ConfirmModuleAdapter {
    private config;
    private initialized;
    private repository;
    private service;
    private controller;
    private protocol;
    private crossCuttingFactory;
    private securityManager;
    private performanceMonitor;
    private eventBusManager;
    private errorHandler;
    private coordinationManager;
    private orchestrationManager;
    private stateSyncManager;
    private transactionManager;
    private protocolVersionManager;
    constructor(config?: ConfirmModuleAdapterConfig);
    /**
     * 初始化协议
     */
    private initializeProtocol;
    /**
     * 确保适配器已初始化
     */
    private ensureInitialized;
    /**
     * 获取Confirm控制器
     */
    getController(): ConfirmController;
    /**
     * 获取Confirm管理服务
     */
    getService(): ConfirmManagementService;
    /**
     * 获取Confirm仓库
     */
    getRepository(): IConfirmRepository;
    /**
     * 获取Confirm协议
     */
    getProtocol(): ConfirmProtocol;
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
     * 获取协议元数据
     */
    getProtocolMetadata(): import("../../../../core/protocols/mplp-protocol-base").ProtocolMetadata;
    /**
     * 获取协议工厂实例
     */
    getProtocolFactory(): ConfirmProtocolFactory;
    /**
     * 健康检查
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    /**
     * 获取适配器统计信息
     */
    getStatistics(): {
        initialized: boolean;
        config: Required<ConfirmModuleAdapterConfig>;
        version: string;
        supportedOperations: string[];
    };
    /**
     * 关闭适配器
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=confirm-module.adapter.d.ts.map