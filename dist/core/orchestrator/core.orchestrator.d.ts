import { CoreOrchestrationService } from '../../modules/core/application/services/core-orchestration.service';
import { CoreResourceService } from '../../modules/core/application/services/core-resource.service';
import { CoreMonitoringService } from '../../modules/core/application/services/core-monitoring.service';
import { UUID, WorkflowConfig, WorkflowStatusType, Priority } from '../../modules/core/types';
export interface SecurityManager {
    validateWorkflowExecution(contextId: string, workflowConfig: WorkflowConfig): Promise<void>;
    validateModuleAccess(moduleId: string, operation: string): Promise<boolean>;
}
export interface PerformanceMonitor {
    startTimer(operation: string): PerformanceTimer;
    recordMetric(name: string, value: number): void;
    getMetrics(): Promise<Record<string, number>>;
}
export interface PerformanceTimer {
    stop(): number;
    elapsed(): number;
}
export interface EventBusManager {
    publish(event: string, data: Record<string, unknown>): Promise<void>;
    subscribe(event: string, handler: (data: Record<string, unknown>) => void): void;
}
export interface ErrorHandler {
    handleError(error: Error, context: Record<string, unknown>): Promise<void>;
    createErrorReport(error: Error): ErrorReport;
}
export interface ErrorReport {
    errorId: string;
    message: string;
    stack?: string;
    context: Record<string, unknown>;
    timestamp: string;
}
export interface CoordinationResult {
    success: boolean;
    results: Record<string, unknown>;
    errors?: string[];
    executionTime?: number;
    coordinationId?: string;
    timestamp?: string;
    coordinatedModules?: string[];
    operation?: string;
    coordinationTime?: number;
}
export interface CoordinationManager {
    coordinateModules(modules: string[], operation: string): Promise<CoordinationResult>;
    validateCoordination(sourceModule: string, targetModule: string): Promise<boolean>;
}
export interface OrchestrationManager {
    createOrchestrationPlan(workflowConfig: WorkflowConfig): Promise<OrchestrationPlan>;
    executeOrchestrationPlan(plan: OrchestrationPlan): Promise<OrchestrationResult>;
}
export interface OrchestrationPlan {
    planId: string;
    stages: OrchestrationStage[];
    dependencies: Record<string, string[]>;
    estimatedDuration: number;
}
export interface OrchestrationStage {
    stageId: string;
    moduleName: string;
    operation: string;
    parameters: Record<string, unknown>;
    timeout: number;
}
export interface OrchestrationResult {
    planId: string;
    status: 'completed' | 'failed' | 'partial';
    stageResults: Record<string, StageExecutionResult>;
    totalDuration: number;
}
export interface StageExecutionResult {
    status: 'completed' | 'failed' | 'skipped';
    result?: Record<string, unknown>;
    error?: string;
    duration: number;
}
export interface StateSyncManager {
    syncState(moduleId: string, state: Record<string, unknown>): Promise<void>;
    getState(moduleId: string): Promise<Record<string, unknown>>;
    validateStateConsistency(): Promise<boolean>;
}
export interface TransactionManager {
    beginTransaction(): Promise<Transaction>;
    commitTransaction(transaction: Transaction): Promise<void>;
    rollbackTransaction(transaction: Transaction): Promise<void>;
}
export interface Transaction {
    transactionId: string;
    startTime: string;
    operations: TransactionOperation[];
}
export interface TransactionOperation {
    operationId: string;
    moduleId: string;
    operation: string;
    parameters: Record<string, unknown>;
    status: 'pending' | 'completed' | 'failed';
}
export interface ProtocolVersionManager {
    validateProtocolVersion(version: string): boolean;
    getCompatibleVersions(): string[];
    upgradeProtocol(fromVersion: string, toVersion: string): Promise<void>;
}
export interface WorkflowExecutionRequest {
    contextId: string;
    workflowConfig: WorkflowConfig;
    priority?: Priority;
    metadata?: Record<string, unknown>;
}
export interface WorkflowResult {
    workflowId: UUID;
    executionId: UUID;
    status: WorkflowStatusType;
    startTime: string;
    endTime?: string;
    duration?: number;
    stageResults: Record<string, StageExecutionResult>;
    executedPhases?: StageExecutionResult[];
    totalExecutionTime?: number;
    metadata?: Record<string, unknown>;
    performanceMetrics?: {
        totalExecutionTime: number;
        moduleCoordinationTime: number;
        resourceAllocationTime: number;
        averageStageTime: number;
    };
}
export declare class CoreOrchestrator {
    private readonly orchestrationService;
    private readonly resourceService;
    private readonly monitoringService;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    private readonly startTime;
    constructor(orchestrationService: CoreOrchestrationService, resourceService: CoreResourceService, monitoringService: CoreMonitoringService, securityManager: SecurityManager, performanceMonitor: PerformanceMonitor, eventBusManager: EventBusManager, errorHandler: ErrorHandler, coordinationManager: CoordinationManager, orchestrationManager: OrchestrationManager, stateSyncManager: StateSyncManager, transactionManager: TransactionManager, protocolVersionManager: ProtocolVersionManager);
    executeWorkflow(requestOrWorkflowId: WorkflowExecutionRequest | string): Promise<WorkflowResult>;
    coordinateModules(modules: string[], operation: string, _parameters: Record<string, unknown>): Promise<CoordinationResult>;
    getHealthStatus(): Promise<{
        status: string;
        modules: Record<string, string>;
        uptime: number;
        version: string;
        timestamp: string;
    }>;
    getSystemStatus(): Promise<{
        overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
        modules: Record<string, string>;
        resources: Record<string, number>;
        performance: Record<string, number>;
        timestamp: string;
    }>;
    private generateWorkflowId;
    private generateExecutionId;
    allocateResource(resourceRequest: Record<string, unknown>): Promise<{
        success: boolean;
        resourceId: string;
        allocatedResources: {
            cpu: number;
            memory: string;
            storage: string;
            network: string;
        };
        allocationTime: string;
        estimatedReleaseTime: string;
    }>;
    getPerformanceMetrics(): Promise<{
        systemHealth: string;
        modulePerformance: Record<string, unknown>;
        resourceUtilization: Record<string, unknown>;
        timestamp: Date;
    }>;
    checkPerformanceAlerts(scenario: Record<string, unknown>): Promise<{
        hasAlerts: boolean;
        alerts: string[];
        scenario: Record<string, unknown>;
    }>;
    executeTransaction(transactionConfig: Record<string, unknown>): Promise<{
        success: boolean;
        result?: unknown;
        error?: string;
        transactionId: string;
        completedOperations?: string[];
        rolledBack?: boolean;
    }>;
    synchronizeState(syncConfig: {
        modules?: string[];
    } & Record<string, unknown>): Promise<{
        success: boolean;
        results: Record<string, unknown>;
        syncId: string;
        timestamp: string;
        synchronizedModules: string[];
        syncTimestamp: Date;
    }>;
    publishEvent(eventConfig: {
        eventType: string;
        payload: unknown;
        targetModules?: string[];
    }): Promise<{
        success: boolean;
        eventId: string;
        timestamp: string;
        deliveredTo: string[];
    }>;
    validateWorkflowSecurity(workflowConfig: {
        contextId: string;
    } & Record<string, unknown>): Promise<{
        isAuthorized: boolean;
        securityLevel: string;
        validationId: string;
        grantedPermissions: string[];
    }>;
    handleSystemError(errorScenario: {
        id?: string;
        message?: string;
        context?: Record<string, unknown>;
    }): Promise<{
        handled: boolean;
        errorId: string;
        recoveryActions: string[];
        recoveryAction: string;
        systemStable: boolean;
    }>;
    createWorkflow(workflowConfig: {
        workflowId?: string;
        name?: string;
        description?: string;
        stages?: string[];
        steps?: OrchestrationStage[];
    }): Promise<{
        workflowId: string;
        name?: string;
        description?: string;
        stages: string[];
        steps: OrchestrationStage[];
        createdAt: string;
        status: string;
    }>;
    getWorkflowStatus(workflowId: string): Promise<{
        workflowId: string;
        status: string;
        progress: number;
        startTime?: string;
        endTime?: string;
        error?: string;
    }>;
    getStatistics(): {
        totalWorkflows: number;
        activeWorkflows: number;
        completedWorkflows: number;
        failedWorkflows: number;
        averageExecutionTime: number;
        systemUptime: number;
        resourceUtilization: {
            cpu: number;
            memory: number;
            disk: number;
            network: number;
        };
    };
    shutdown(): Promise<void>;
    private handleWorkflowError;
}
//# sourceMappingURL=core.orchestrator.d.ts.map