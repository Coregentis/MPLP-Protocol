import { ConfirmController } from '../../api/controllers/confirm.controller';
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmProtocol } from '../protocols/confirm.protocol';
import { ConfirmProtocolFactory } from '../factories/confirm-protocol.factory';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
export interface ConfirmModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
}
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
    private initializeProtocol;
    private ensureInitialized;
    getController(): ConfirmController;
    getService(): ConfirmManagementService;
    getRepository(): IConfirmRepository;
    getProtocol(): ConfirmProtocol;
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
    getProtocolFactory(): ConfirmProtocolFactory;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    getStatistics(): {
        initialized: boolean;
        config: Required<ConfirmModuleAdapterConfig>;
        version: string;
        supportedOperations: string[];
    };
    shutdown(): Promise<void>;
}
//# sourceMappingURL=confirm-module.adapter.d.ts.map