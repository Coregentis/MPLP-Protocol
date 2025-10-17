import { NetworkController } from '../../api/controllers/network.controller';
import { NetworkManagementService } from '../../application/services/network-management.service';
import { MemoryNetworkRepository } from '../repositories/network.repository';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
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
    private initialize;
    private registerEventListeners;
    private initializePerformanceMonitoring;
    private handleNetworkStatusChange;
    private handleNodeStatusChange;
    private handleConnectionChange;
    private _getAdapterId;
    getController(): NetworkController;
    getService(): NetworkManagementService;
    getRepository(): MemoryNetworkRepository;
    getConfig(): Required<NetworkModuleAdapterConfig>;
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
    getModuleInfo(): {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        features: string[];
        dependencies: string[];
    };
    coordinateWithContext(_contextId: string, _operation: string): Promise<boolean>;
    coordinateWithPlan(_planId: string, _config: Record<string, unknown>): Promise<boolean>;
    coordinateWithRole(_roleId: string, _permissions: string[]): Promise<boolean>;
    coordinateWithTrace(_traceId: string, _operation: string): Promise<boolean>;
    coordinateWithExtension(_extensionId: string, _config: Record<string, unknown>): Promise<boolean>;
    handleOrchestrationScenario(_scenario: string, _params: Record<string, unknown>): Promise<boolean>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=network-module.adapter.d.ts.map