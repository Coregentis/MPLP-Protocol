import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, WorkflowConfig, ExecutionContext, CoreDetails, CoreOperation, WorkflowStatusType, WorkflowStageType } from '../../types';
export declare class CoreManagementService {
    private readonly coreRepository;
    constructor(coreRepository: ICoreRepository);
    createWorkflow(data: {
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        coreOperation: CoreOperation;
        coreDetails?: CoreDetails;
    }): Promise<CoreEntity>;
    getWorkflowById(workflowId: UUID): Promise<CoreEntity | null>;
    updateWorkflowStatus(workflowId: UUID, status: WorkflowStatusType): Promise<CoreEntity>;
    updateCurrentStage(workflowId: UUID, stage: WorkflowStageType): Promise<CoreEntity>;
    deleteWorkflow(workflowId: UUID): Promise<boolean>;
    getAllWorkflows(): Promise<CoreEntity[]>;
    getWorkflowsByStatus(status: WorkflowStatusType): Promise<CoreEntity[]>;
    getWorkflowStatistics(): Promise<{
        totalWorkflows: number;
        activeWorkflows: number;
        completedWorkflows: number;
        failedWorkflows: number;
        averageDuration: number;
    }>;
    executeWorkflow(workflowId: UUID): Promise<CoreEntity>;
    getWorkflowStatus(workflowId: UUID): Promise<{
        workflowId: UUID;
        status: WorkflowStatusType;
        currentStage?: WorkflowStageType;
        progress: number;
        startTime?: string;
        endTime?: string;
    }>;
    pauseWorkflow(workflowId: UUID): Promise<CoreEntity>;
    resumeWorkflow(workflowId: UUID): Promise<CoreEntity>;
    cancelWorkflow(workflowId: UUID): Promise<CoreEntity>;
}
//# sourceMappingURL=core-management.service.d.ts.map