import { UUID } from '../../types';
export declare class CoreReservedInterfacesService {
    coordinateWithContext(_contextId: UUID, _workflowId: UUID, _operation: string): Promise<boolean>;
    syncContextState(_contextId: UUID, _workflowState: Record<string, unknown>): Promise<void>;
    coordinateWithPlan(_planId: UUID, _workflowId: UUID, _executionStrategy: string): Promise<boolean>;
    executePlanTasks(_planId: UUID, _taskIds: UUID[]): Promise<Record<UUID, 'completed' | 'failed' | 'pending'>>;
    coordinateWithRole(_roleId: UUID, _userId: UUID, _workflowId: UUID): Promise<boolean>;
    validateWorkflowPermissions(_userId: UUID, _workflowId: UUID, _operation: string): Promise<boolean>;
    coordinateWithConfirm(_confirmId: UUID, _workflowId: UUID, _approvalType: string): Promise<boolean>;
    requestWorkflowApproval(_workflowId: UUID, _approvers: UUID[], _approvalData: Record<string, unknown>): Promise<UUID>;
    coordinateWithTrace(_traceId: UUID, _workflowId: UUID, _traceLevel: string): Promise<boolean>;
    recordWorkflowTrace(_workflowId: UUID, _stage: string, _traceData: Record<string, unknown>): Promise<void>;
    coordinateWithExtension(_extensionId: UUID, _workflowId: UUID, _extensionType: string): Promise<boolean>;
    loadWorkflowExtensions(_workflowId: UUID, _extensionTypes: string[]): Promise<Record<string, boolean>>;
    coordinateWithDialog(_dialogId: UUID, _workflowId: UUID, _dialogType: string): Promise<boolean>;
    createWorkflowDialog(_workflowId: UUID, _dialogConfig: Record<string, unknown>): Promise<UUID>;
    coordinateWithCollab(_collabId: UUID, _workflowId: UUID, _collaborationType: string): Promise<boolean>;
    createWorkflowCollaboration(_workflowId: UUID, _participants: UUID[], _collabConfig: Record<string, unknown>): Promise<UUID>;
    coordinateWithNetwork(_networkId: UUID, _workflowId: UUID, _networkTopology: string): Promise<boolean>;
    configureDistributedWorkflow(_workflowId: UUID, _nodes: string[], _networkConfig: Record<string, unknown>): Promise<boolean>;
    getModuleCoordinationStats(): Promise<Record<string, {
        coordinationCount: number;
        successRate: number;
        averageResponseTime: number;
        lastCoordination: string;
    }>>;
    testModuleConnectivity(): Promise<Record<string, 'connected' | 'disconnected' | 'unknown'>>;
}
//# sourceMappingURL=core-reserved-interfaces.service.d.ts.map