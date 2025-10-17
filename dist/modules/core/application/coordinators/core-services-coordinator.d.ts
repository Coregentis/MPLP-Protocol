import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../services/core-management.service';
import { CoreMonitoringService } from '../services/core-monitoring.service';
import { CoreOrchestrationService } from '../services/core-orchestration.service';
import { CoreResourceService } from '../services/core-resource.service';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation, CoreDetails } from '../../types';
export interface CoordinatedWorkflowCreationParams {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    coreOperation: CoreOperation;
    coreDetails?: CoreDetails;
    enableMonitoring?: boolean;
    enableResourceTracking?: boolean;
    userId?: string;
}
export interface CoordinatedExecutionResult {
    workflow: CoreEntity;
    monitoringEnabled: boolean;
    resourcesAllocated: boolean;
    orchestrationActive: boolean;
    healthStatus: 'healthy' | 'warning' | 'critical';
}
export declare class CoreServicesCoordinator {
    private readonly managementService;
    private readonly monitoringService;
    private readonly orchestrationService;
    private readonly resourceService;
    private readonly coreRepository;
    private readonly logger?;
    constructor(managementService: CoreManagementService, monitoringService: CoreMonitoringService, orchestrationService: CoreOrchestrationService, resourceService: CoreResourceService, coreRepository: ICoreRepository, logger?: {
        info: (msg: string, meta?: Record<string, unknown>) => void;
        error: (msg: string, meta?: Record<string, unknown>) => void;
    } | undefined);
    createWorkflowWithFullCoordination(params: CoordinatedWorkflowCreationParams): Promise<CoordinatedExecutionResult>;
    executeWorkflowWithCoordination(workflowId: UUID): Promise<CoordinatedExecutionResult>;
    stopWorkflowWithCoordination(workflowId: UUID): Promise<boolean>;
    getCoordinationOverview(): Promise<{
        totalWorkflows: number;
        activeWorkflows: number;
        monitoredWorkflows: number;
        resourceUtilization: number;
        systemHealth: 'healthy' | 'warning' | 'critical';
    }>;
    private evaluateWorkflowHealth;
    private _updateMonitoringStatus;
    private _checkResourceStatus;
}
//# sourceMappingURL=core-services-coordinator.d.ts.map