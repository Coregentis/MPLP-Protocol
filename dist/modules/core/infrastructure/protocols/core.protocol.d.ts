import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation } from '../../types';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
export interface CoreProtocolConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
}
export interface CoreProtocolResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
    operationId: UUID;
}
export interface CoreWorkflowCreationRequest {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    coreOperation: CoreOperation;
    metadata?: Record<string, unknown>;
}
export declare class CoreProtocol {
    private readonly managementService;
    private readonly _monitoringService;
    private readonly _orchestrationService;
    private readonly _resourceService;
    private readonly _repository;
    private readonly _securityManager;
    private readonly _performanceMonitor;
    private readonly _eventBusManager;
    private readonly _errorHandler;
    private readonly coordinationManager;
    private readonly _orchestrationManager;
    private readonly _stateSyncManager;
    private readonly _transactionManager;
    private readonly _protocolVersionManager;
    private readonly config;
    constructor(managementService: CoreManagementService, _monitoringService: CoreMonitoringService, _orchestrationService: CoreOrchestrationService, _resourceService: CoreResourceService, _repository: ICoreRepository, _securityManager: MLPPSecurityManager, _performanceMonitor: MLPPPerformanceMonitor, _eventBusManager: MLPPEventBusManager, _errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, _orchestrationManager: MLPPOrchestrationManager, _stateSyncManager: MLPPStateSyncManager, _transactionManager: MLPPTransactionManager, _protocolVersionManager: MLPPProtocolVersionManager, config?: CoreProtocolConfig);
    createWorkflow(request: CoreWorkflowCreationRequest): Promise<CoreProtocolResult<CoreEntity>>;
    executeWorkflow(workflowId: UUID): Promise<CoreProtocolResult<boolean>>;
    getWorkflowStatus(_workflowId: UUID): Promise<CoreProtocolResult<{
        status: string;
        progress: number;
        lastUpdated: string;
    }>>;
    getProtocolHealth(): Promise<CoreProtocolResult<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        metrics: Record<string, number>;
    }>>;
    private generateOperationId;
    private checkRepositoryHealth;
    private getStartTime;
    private getOperationsCount;
}
//# sourceMappingURL=core.protocol.d.ts.map