import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreDto } from '../dto/core.dto';
import { UUID, WorkflowStatusType, WorkflowStageType, Priority, ExecutionMode, CoreOperation } from '../../types';
export interface CreateWorkflowRequest {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: {
        name: string;
        description?: string;
        stages: WorkflowStageType[];
        executionMode?: ExecutionMode;
        parallelExecution?: boolean;
        priority?: Priority;
        timeoutMs?: number;
        maxConcurrentExecutions?: number;
    };
    executionContext: {
        userId?: string;
        sessionId?: UUID;
        requestId?: UUID;
        priority?: Priority;
        metadata?: Record<string, unknown>;
    };
    coreOperation: CoreOperation;
    coreDetails?: {
        orchestrationMode?: string;
        resourceAllocation?: string;
        faultTolerance?: string;
    };
}
export interface CreateWorkflowResponse {
    success: boolean;
    data?: CoreDto;
    error?: string;
}
export interface GetWorkflowResponse {
    success: boolean;
    data?: CoreDto;
    error?: string;
}
export interface UpdateWorkflowStatusRequest {
    status: WorkflowStatusType;
}
export interface UpdateWorkflowStatusResponse {
    success: boolean;
    data?: CoreDto;
    error?: string;
}
export interface ExecuteWorkflowRequest {
    workflowId: UUID;
    contextId: UUID;
    stages: WorkflowStageType[];
    executionMode?: ExecutionMode;
    priority?: Priority;
    timeout?: number;
    metadata?: Record<string, unknown>;
}
export interface ExecuteWorkflowResponse {
    success: boolean;
    data?: {
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
    };
    error?: string;
}
export interface CoordinateModuleRequest {
    sourceModule: string;
    targetModule: string;
    operation: string;
    payload: Record<string, unknown>;
}
export interface CoordinateModuleResponse {
    success: boolean;
    data?: {
        success: boolean;
        result?: Record<string, unknown>;
        error?: string;
        executionTime: number;
    };
    error?: string;
}
export interface ActivateInterfaceRequest {
    moduleId: string;
    interfaceId: string;
    parameters: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface ActivateInterfaceResponse {
    success: boolean;
    data?: {
        success: boolean;
        interfaceId: string;
        activatedAt: string;
        result?: Record<string, unknown>;
        error?: string;
    };
    error?: string;
}
export interface AllocateResourcesRequest {
    executionId: string;
    resourceRequirements: {
        cpuCores?: number;
        memoryMb?: number;
        diskSpaceMb?: number;
        networkBandwidthMbps?: number;
        priority: 'low' | 'medium' | 'high' | 'critical';
        estimatedDurationMs?: number;
    };
}
export interface AllocateResourcesResponse {
    success: boolean;
    data?: {
        allocationId: UUID;
        executionId: string;
        allocatedResources: {
            cpuCores: number;
            memoryMb: number;
            diskSpaceMb: number;
            networkBandwidthMbps: number;
        };
        allocationTime: string;
        estimatedReleaseTime?: string;
        status: string;
    };
    error?: string;
}
export interface HealthCheckResponse {
    success: boolean;
    data?: {
        overall: string;
        modules: Array<{
            moduleId: string;
            moduleName: string;
            status: string;
            lastCheck: string;
            responseTime: number;
            errorCount: number;
        }>;
        resources: {
            cpu: {
                usage: number;
                status: string;
            };
            memory: {
                usage: number;
                status: string;
            };
            disk: {
                usage: number;
                status: string;
            };
            network: {
                usage: number;
                status: string;
            };
        };
        network: {
            connectivity: string;
            latency: number;
            throughput: number;
            errorRate: number;
            activeConnections: number;
        };
        timestamp: string;
    };
    error?: string;
}
export interface CreateAlertRequest {
    alertType: 'performance' | 'error' | 'security' | 'resource' | 'system';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    source: string;
    metadata?: Record<string, unknown>;
}
export interface CreateAlertResponse {
    success: boolean;
    data?: {
        alertId: UUID;
        processed: boolean;
        actions: string[];
        notifications: string[];
        escalated: boolean;
        resolvedAt?: string;
    };
    error?: string;
}
export declare class CoreController {
    private readonly coreManagementService;
    private readonly coreOrchestrationService;
    private readonly coreResourceService;
    private readonly coreMonitoringService;
    constructor(coreManagementService: CoreManagementService, coreOrchestrationService: CoreOrchestrationService, coreResourceService: CoreResourceService, coreMonitoringService: CoreMonitoringService);
    createWorkflow(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse>;
    getWorkflow(workflowId: UUID): Promise<GetWorkflowResponse>;
    updateWorkflowStatus(workflowId: UUID, request: UpdateWorkflowStatusRequest): Promise<UpdateWorkflowStatusResponse>;
    deleteWorkflow(workflowId: UUID): Promise<{
        success: boolean;
        error?: string;
    }>;
    getAllWorkflows(): Promise<{
        success: boolean;
        data?: CoreDto[];
        error?: string;
    }>;
    executeWorkflow(request: ExecuteWorkflowRequest): Promise<ExecuteWorkflowResponse>;
    private entityToDto;
}
//# sourceMappingURL=core.controller.d.ts.map