import { ContextEntity } from '../../domain/entities/context.entity';
import { ContextManagementService } from '../../application/services/context-management.service';
import { MemoryContextRepository } from '../repositories/context.repository';
import { ContextController } from '../../api/controllers/context.controller';
import { ContextProtocol } from '../protocols/context.protocol.js';
import { ContextProtocolFactory, ContextProtocolFactoryConfig } from '../factories/context-protocol.factory.js';
import { ContextEntityData, ContextSchema, CreateContextRequest, UpdateContextRequest } from '../../types';
import { UUID } from '../../../../shared/types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
export interface ContextModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
}
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
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getController(): ContextController;
    getService(): ContextManagementService;
    getRepository(): MemoryContextRepository;
    createContext(request: CreateContextRequest): Promise<ContextEntity>;
    getContext(contextId: UUID): Promise<ContextEntity | null>;
    updateContext(contextId: UUID, request: UpdateContextRequest): Promise<ContextEntity>;
    deleteContext(contextId: UUID): Promise<boolean>;
    searchContexts(namePattern: string): Promise<ContextEntity[]>;
    entityToSchema(entity: ContextEntityData): ContextSchema;
    schemaToEntity(schema: ContextSchema): ContextEntityData;
    validateSchema(data: unknown): data is ContextSchema;
    validateMappingConsistency(entity: ContextEntityData, schema: ContextSchema): {
        isConsistent: boolean;
        errors: string[];
    };
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
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        details: {
            adapter: boolean;
            service: boolean;
            repository: boolean;
        };
    }>;
    getConfig(): ContextModuleAdapterConfig;
    updateConfig(newConfig: Partial<ContextModuleAdapterConfig>): void;
    private ensureInitialized;
    getProtocol(): ContextProtocol;
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
    getProtocolMetadata(): import("../../../../core/protocols/mplp-protocol-base").ProtocolMetadata;
    getProtocolFactory(): ContextProtocolFactory;
    createProtocolFromFactory(config?: ContextProtocolFactoryConfig): Promise<ContextProtocol>;
}
//# sourceMappingURL=context-module.adapter.d.ts.map