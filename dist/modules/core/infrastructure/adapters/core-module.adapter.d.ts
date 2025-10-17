import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreReservedInterfacesService } from '../../application/services/core-reserved-interfaces.service';
import { CoreServicesCoordinator } from '../../application/coordinators/core-services-coordinator';
import { CoreProtocol } from '../protocols/core.protocol';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation } from '../../types';
export interface CoreModuleAdapterConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    enableCoordination?: boolean;
    enableReservedInterfaces?: boolean;
}
export interface CoreModuleAdapterResult {
    repository: ICoreRepository;
    managementService: CoreManagementService;
    monitoringService: CoreMonitoringService;
    orchestrationService: CoreOrchestrationService;
    resourceService: CoreResourceService;
    reservedInterfacesService: CoreReservedInterfacesService;
    coordinator: CoreServicesCoordinator;
    protocol: CoreProtocol;
    adapter: CoreModuleAdapter;
}
export declare class CoreModuleAdapter {
    private readonly config;
    private initialized;
    private repository;
    private managementService;
    private monitoringService;
    private orchestrationService;
    private resourceService;
    private reservedInterfacesService;
    private coordinator;
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
    constructor(config?: CoreModuleAdapterConfig);
    private initialize;
    private initializeProtocol;
    private ensureInitialized;
    getComponents(): CoreModuleAdapterResult;
    getRepository(): ICoreRepository;
    getManagementService(): CoreManagementService;
    getCoordinator(): CoreServicesCoordinator;
    getReservedInterfacesService(): CoreReservedInterfacesService;
    getProtocol(): CoreProtocol;
    createWorkflow(data: {
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        coreOperation: CoreOperation;
    }): Promise<CoreEntity>;
    createWorkflowWithCoordination(params: {
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        coreOperation: CoreOperation;
        enableMonitoring?: boolean;
        enableResourceTracking?: boolean;
    }): Promise<import("../../application/coordinators/core-services-coordinator").CoordinatedExecutionResult>;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
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
    private checkRepositoryHealth;
}
//# sourceMappingURL=core-module.adapter.d.ts.map