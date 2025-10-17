import { CoreOrchestrator } from '../../../../core/orchestrator/core.orchestrator';
import { ReservedInterfaceActivator } from '../../domain/activators/reserved-interface.activator';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreManagementService } from '../../application/services/core-management.service';
import { MemoryCoreRepository } from '../repositories/core.repository';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
export interface CoreOrchestratorFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxConcurrentWorkflows?: number;
    workflowTimeout?: number;
    enableReservedInterfaces?: boolean;
    enableModuleCoordination?: boolean;
}
export interface CoreOrchestratorFactoryResult {
    orchestrator: CoreOrchestrator;
    interfaceActivator: ReservedInterfaceActivator;
    orchestrationService: CoreOrchestrationService;
    resourceService: CoreResourceService;
    monitoringService: CoreMonitoringService;
    managementService: CoreManagementService;
    repository: MemoryCoreRepository;
    crossCuttingManagers: {
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
    healthCheck: () => Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        metrics: Record<string, number>;
        modules: Record<string, string>;
        uptime: number;
        version: string;
    }>;
    shutdown: () => Promise<void>;
}
export declare class CoreOrchestratorFactory {
    private static instance;
    private crossCuttingFactory;
    private constructor();
    static getInstance(): CoreOrchestratorFactory;
    createCoreOrchestrator(config?: CoreOrchestratorFactoryConfig): Promise<CoreOrchestratorFactoryResult>;
    createDevelopmentOrchestrator(): Promise<CoreOrchestratorFactoryResult>;
    createProductionOrchestrator(): Promise<CoreOrchestratorFactoryResult>;
    createTestOrchestrator(): Promise<CoreOrchestratorFactoryResult>;
    private checkRepositoryHealth;
    private checkServiceHealth;
    static resetInstance(): void;
    private createSecurityAdapter;
    private createPerformanceAdapter;
    private createEventBusAdapter;
    private createErrorHandlerAdapter;
    private createCoordinationAdapter;
    private createOrchestrationAdapter;
    private createStateSyncAdapter;
    private createTransactionAdapter;
    private createProtocolVersionAdapter;
}
//# sourceMappingURL=core-orchestrator.factory.d.ts.map