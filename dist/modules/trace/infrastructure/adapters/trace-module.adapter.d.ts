import { TraceProtocol } from '../protocols/trace.protocol';
import { TraceProtocolFactory } from '../factories/trace-protocol.factory';
import { TraceManagementService } from '../../application/services/trace-management.service';
import { TraceAnalyticsService } from '../../application/services/trace-analytics.service';
import { TraceSecurityService } from '../../application/services/trace-security.service';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { TraceEntityData, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter, TraceExecutionResult, TraceAnalysisResult, TraceValidationResult, TraceSchema } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
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
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    private ensureInitialized;
    createTrace(request: CreateTraceRequest): Promise<TraceExecutionResult>;
    updateTrace(request: UpdateTraceRequest): Promise<TraceExecutionResult>;
    getTrace(traceId: UUID): Promise<TraceEntityData | null>;
    queryTraces(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    analyzeTrace(traceId: UUID): Promise<TraceAnalysisResult>;
    validateTrace(traceData: TraceSchema): Promise<TraceValidationResult>;
    getService(): TraceManagementService;
    getAnalyticsService(): TraceAnalyticsService;
    getSecurityService(): TraceSecurityService;
    getRepository(): ITraceRepository;
    getProtocol(): TraceProtocol;
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
    getProtocolMetadata(): import("../../types").ProtocolMetadata;
    getProtocolFactory(): TraceProtocolFactory;
    getConfig(): Required<TraceModuleAdapterConfig>;
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