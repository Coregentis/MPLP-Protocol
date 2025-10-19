/**
 * Context模块适配器
 *
 * @description Context模块的基础设施适配器，提供外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 */
import { ContextEntity } from '../../domain/entities/context.entity';
import { ContextManagementService } from '../../application/services/context-management.service';
import { MemoryContextRepository } from '../repositories/context.repository';
import { ContextController } from '../../api/controllers/context.controller';
import { ContextProtocol } from '../protocols/context.protocol.js';
import { ContextProtocolFactory, ContextProtocolFactoryConfig } from '../factories/context-protocol.factory.js';
import { ContextEntityData, ContextSchema, CreateContextRequest, UpdateContextRequest } from '../../types';
import { UUID } from '../../../../shared/types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
/**
 * Context模块适配器配置
 */
export interface ContextModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
}
/**
 * Context模块适配器
 *
 * @description 提供Context模块的统一访问接口和外部系统集成
 */
export declare class ContextModuleAdapter {
    private repository;
    private service;
    private controller;
    private protocol;
    private config;
    private isInitialized;
    private logger;
    private cacheManager;
    private versionManager;
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
    constructor(config?: ContextModuleAdapterConfig);
    /**
     * 初始化模块适配器
     */
    initialize(): Promise<void>;
    /**
     * 关闭模块适配器
     */
    shutdown(): Promise<void>;
    /**
     * 获取控制器实例
     */
    getController(): ContextController;
    /**
     * 获取服务实例
     */
    getService(): ContextManagementService;
    /**
     * 获取仓库实例
     */
    getRepository(): MemoryContextRepository;
    /**
     * 创建Context
     */
    createContext(request: CreateContextRequest): Promise<ContextEntity>;
    /**
     * 获取Context
     */
    getContext(contextId: UUID): Promise<ContextEntity | null>;
    /**
     * 更新Context
     */
    updateContext(contextId: UUID, request: UpdateContextRequest): Promise<ContextEntity>;
    /**
     * 删除Context
     */
    deleteContext(contextId: UUID): Promise<boolean>;
    /**
     * 搜索Context
     */
    searchContexts(namePattern: string): Promise<ContextEntity[]>;
    /**
     * 实体数据转换为Schema格式
     */
    entityToSchema(entity: ContextEntityData): ContextSchema;
    /**
     * Schema格式转换为实体数据
     */
    schemaToEntity(schema: ContextSchema): ContextEntityData;
    /**
     * 验证Schema格式
     */
    validateSchema(data: unknown): data is ContextSchema;
    /**
     * 验证映射一致性
     */
    validateMappingConsistency(entity: ContextEntityData, schema: ContextSchema): {
        isConsistent: boolean;
        errors: string[];
    };
    /**
     * 获取模块统计信息
     */
    getStatistics(): Promise<{
        module: string;
        version: string;
        isInitialized: boolean;
        config: ContextModuleAdapterConfig;
        repository: {
            totalContexts: number;
            activeContexts: number;
            suspendedContexts: number;
            completedContexts: number;
            terminatedContexts: number;
        };
        performance: {
            cacheHitRate?: number;
            averageResponseTime?: number;
        };
    }>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        details: {
            adapter: boolean;
            service: boolean;
            repository: boolean;
        };
    }>;
    /**
     * 获取当前配置
     */
    getConfig(): ContextModuleAdapterConfig;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<ContextModuleAdapterConfig>): void;
    /**
     * 确保适配器已初始化
     */
    private ensureInitialized;
    /**
     * 获取Context协议实例
     */
    getProtocol(): ContextProtocol;
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
    getProtocolFactory(): ContextProtocolFactory;
    /**
     * 通过工厂创建新的协议实例
     */
    createProtocolFromFactory(config?: ContextProtocolFactoryConfig): Promise<ContextProtocol>;
}
//# sourceMappingURL=context-module.adapter.d.ts.map