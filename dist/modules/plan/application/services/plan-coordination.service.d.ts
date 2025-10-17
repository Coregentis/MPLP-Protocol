import { UUID } from '../../../../shared/types';
export interface AgentInfo {
    agentId: UUID;
    name: string;
    type: 'planner' | 'executor' | 'monitor' | 'coordinator';
    capabilities: string[];
    status: 'available' | 'busy' | 'offline';
    currentLoad: number;
    maxConcurrentTasks: number;
}
export interface TaskAssignment {
    taskId: UUID;
    agentId: UUID;
    planId: UUID;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration: number;
    dependencies: UUID[];
    status: 'assigned' | 'in_progress' | 'completed' | 'failed';
    assignedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export interface CoordinationRequest {
    requestId: string;
    planId: UUID;
    operation: 'assign_tasks' | 'reallocate_resources' | 'resolve_conflict' | 'monitor_execution';
    parameters: {
        tasks?: Array<{
            taskId: UUID;
            requirements: string[];
            priority: 'low' | 'medium' | 'high' | 'critical';
        }>;
        agents?: UUID[];
        constraints?: Record<string, unknown>;
    };
}
export interface CoordinationResult {
    requestId: string;
    success: boolean;
    assignments?: TaskAssignment[];
    conflicts?: Array<{
        type: 'resource' | 'dependency' | 'timing';
        description: string;
        affectedTasks: UUID[];
        resolution?: string;
    }>;
    recommendations: string[];
    metadata: {
        processingTime: number;
        agentsInvolved: number;
        tasksProcessed: number;
    };
}
export interface ResourceAllocation {
    resourceId: string;
    type: 'compute' | 'memory' | 'storage' | 'network' | 'custom';
    allocated: number;
    available: number;
    unit: string;
    allocatedTo: Array<{
        agentId: UUID;
        taskId: UUID;
        amount: number;
    }>;
}
export interface ExecutionMonitoring {
    planId: UUID;
    overallProgress: number;
    tasksCompleted: number;
    tasksTotal: number;
    estimatedCompletion: Date;
    activeAgents: number;
    resourceUtilization: Record<string, number>;
    issues: Array<{
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        affectedTasks: UUID[];
        suggestedAction: string;
    }>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export declare class PlanCoordinationService {
    private readonly logger;
    private readonly registeredAgents;
    private readonly activeAssignments;
    private readonly resourceAllocations;
    constructor(logger: ILogger);
    processCoordinationRequest(request: CoordinationRequest): Promise<CoordinationResult>;
    registerAgent(agent: AgentInfo): Promise<void>;
    unregisterAgent(agentId: UUID): Promise<void>;
    getAgentStatus(agentId: UUID): AgentInfo | undefined;
    getAllAgents(): AgentInfo[];
    getExecutionMonitoring(planId: UUID): Promise<ExecutionMonitoring>;
    private assignTasks;
    private reallocateResources;
    private resolveConflicts;
    private monitorExecution;
    private findBestAgent;
    private calculateAgentScore;
    private reassignTask;
    private calculateResourceUtilization;
    private detectExecutionIssues;
}
//# sourceMappingURL=plan-coordination.service.d.ts.map