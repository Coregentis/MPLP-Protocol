/**
 * Trace模块适配器
 *
 * @description 提供Trace模块的统一访问接口和外部系统集成，集成9个L3横切关注点管理器
 * @version 1.0.0
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL架构模式
 * @integration 统一L3管理器注入和初始化模式
 */
import { TraceProtocol } from '../protocols/trace.protocol';
import { TraceProtocolFactory } from '../factories/trace-protocol.factory';
import { TraceManagementService } from '../../application/services/trace-management.service';
import { TraceAnalyticsService } from '../../application/services/trace-analytics.service';
import { TraceSecurityService } from '../../application/services/trace-security.service';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { TraceEntityData, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter, TraceExecutionResult, TraceAnalysisResult, TraceValidationResult, TraceSchema } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
/**
 * Trace模块适配器配置
 */
export interface TraceModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    enableRealTimeMonitoring?: boolean;
    enableCorrelationAnalysis?: boolean;
    enableDistributedTracing?: boolean;
    maxTraceRetentionDays?: number;
    enableAutoArchiving?: boolean;
}
/**
 * Trace模块适配器
 *
 * @description 提供Trace模块的统一访问接口和外部系统集成
 */
export declare class TraceModuleAdapter {
    private config;
    private initialized;
    private protocol;
    private service;
    private analyticsService;
    private securityService;
    private repository;
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
    constructor(config?: TraceModuleAdapterConfig);
    /**
     * 初始化适配器
     */
    initialize(): Promise<void>;
    /**
     * 关闭适配器
     */
    shutdown(): Promise<void>;
    /**
     * 确保适配器已初始化
     */
    private ensureInitialized;
    /**
     * 创建追踪记录
     */
    createTrace(request: CreateTraceRequest): Promise<TraceExecutionResult>;
    /**
     * 更新追踪记录
     */
    updateTrace(request: UpdateTraceRequest): Promise<TraceExecutionResult>;
    /**
     * 获取追踪记录
     */
    getTrace(traceId: UUID): Promise<TraceEntityData | null>;
    /**
     * 查询追踪记录
     */
    queryTraces(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    /**
     * 分析追踪数据
     */
    analyzeTrace(traceId: UUID): Promise<TraceAnalysisResult>;
    /**
     * 验证追踪数据
     */
    validateTrace(traceData: TraceSchema): Promise<TraceValidationResult>;
    /**
     * 获取Trace管理服务
     */
    getService(): TraceManagementService;
    /**
     * 获取Trace分析服务
     */
    getAnalyticsService(): TraceAnalyticsService;
    /**
     * 获取Trace安全服务
     */
    getSecurityService(): TraceSecurityService;
    /**
     * 获取Trace仓库
     */
    getRepository(): ITraceRepository;
    /**
     * 获取Trace协议
     */
    getProtocol(): TraceProtocol;
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
    getProtocolMetadata(): import("../../types").ProtocolMetadata;
    /**
     * 获取协议工厂实例
     */
    getProtocolFactory(): TraceProtocolFactory;
    /**
     * 获取适配器配置
     */
    getConfig(): Required<TraceModuleAdapterConfig>;
    /**
     * 获取健康状态
     */
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
        adapter?: undefined;
        protocol?: undefined;
        managers?: undefined;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        adapter: {
            initialized: true;
            config: Required<TraceModuleAdapterConfig>;
        };
        protocol: import("../../types").ProtocolHealthStatus;
        managers: {
            security: {
                status: string;
                timestamp: string;
            };
            performance: {
                status: string;
                timestamp: string;
            };
            eventBus: {
                status: string;
                timestamp: string;
            };
            errorHandler: {
                status: string;
                timestamp: string;
            };
            coordination: {
                status: string;
                timestamp: string;
            };
            orchestration: {
                status: string;
                timestamp: string;
            };
            stateSync: {
                status: string;
                timestamp: string;
            };
            transaction: {
                status: string;
                timestamp: string;
            };
            protocolVersion: {
                status: string;
                timestamp: string;
            };
        };
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        error: string;
        adapter?: undefined;
        protocol?: undefined;
        managers?: undefined;
    }>;
}
//# sourceMappingURL=trace-module.adapter.d.ts.map