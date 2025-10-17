import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, WorkflowStageType, WorkflowStatusType, Priority, ExecutionMode } from '../../types';
export interface WorkflowExecutionData {
    workflowId: UUID;
    contextId: UUID;
    stages: WorkflowStageType[];
    executionMode?: ExecutionMode;
    parallelExecution?: boolean;
    priority?: Priority;
    timeout?: number;
    metadata?: Record<string, unknown>;
}
export interface WorkflowResult {
    workflowId: UUID;
    executionId: UUID;
    status: WorkflowStatusType;
    startTime: string;
    endTime?: string;
    durationMs?: number;
    stageResults: Record<string, {
        status: string;
        result?: Record<string, unknown>;
        error?: string;
    }>;
    metadata?: Record<string, unknown>;
}
export interface CoordinationRequest {
    sourceModule: string;
    targetModule: string;
    operation: string;
    payload: Record<string, unknown>;
    timestamp: string;
}
export interface CoordinationResult {
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
    executionTime: number;
}
export interface InterfaceActivationData {
    parameters: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface ActivationResult {
    success: boolean;
    interfaceId: string;
    activatedAt: string;
    result?: Record<string, unknown>;
    error?: string;
}
export declare class CoreOrchestrationService {
    private readonly coreRepository;
    constructor(coreRepository: ICoreRepository);
    executeWorkflow(workflowData: WorkflowExecutionData): Promise<WorkflowResult>;
    coordinateModuleOperation(request: CoordinationRequest): Promise<CoordinationResult>;
    activateReservedInterface(moduleId: string, interfaceId: string, activationData: InterfaceActivationData): Promise<ActivationResult>;
    private validateWorkflowData;
    private generateExecutionId;
    private createCoreEntity;
    private executeWorkflowStage;
    private getStageExecutionResult;
    private validateCoordinationRequest;
    private performModuleCoordination;
    private validateInterfaceActivation;
    private performInterfaceActivation;
    private updateCurrentStage;
    private determineFinalStatus;
    private updateWorkflowStatus;
    private handleWorkflowError;
    coordinateModule(module: string, operation: string, parameters?: Record<string, unknown>): Promise<{
        module: string;
        operation: string;
        parameters?: Record<string, unknown>;
        result: string;
        timestamp: string;
    }>;
    executeTransaction(transactionConfig: Record<string, unknown>): Promise<{
        transactionId: string;
        config: Record<string, unknown>;
        result: string;
        timestamp: string;
    }>;
    synchronizeModuleState(module: string, syncConfig: Record<string, unknown>): Promise<{
        module: string;
        syncConfig: Record<string, unknown>;
        result: string;
        timestamp: string;
    }>;
    private activateDialogInterface;
    private activateCollabInterface;
    private activateConversationContextSync;
    private activateCollaborationCoordination;
}
//# sourceMappingURL=core-orchestration.service.d.ts.map