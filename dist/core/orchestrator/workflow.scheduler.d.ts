import { UUID, Timestamp } from '../../modules/core/types';
export interface WorkflowDefinition {
    workflowId: UUID;
    name: string;
    description?: string;
    version: string;
    stages: WorkflowStage[];
    dependencies: WorkflowDependency[];
    configuration: WorkflowConfiguration;
    metadata?: Record<string, unknown>;
}
export interface WorkflowStage {
    stageId: UUID;
    name: string;
    moduleId: string;
    operation: string;
    parameters: Record<string, unknown>;
    timeout?: number;
    retryPolicy?: RetryPolicy;
    condition?: ExecutionCondition;
}
export interface WorkflowDependency {
    sourceStage: UUID;
    targetStage: UUID;
    dependencyType: 'sequential' | 'parallel' | 'conditional';
    condition?: string;
}
export interface WorkflowConfiguration {
    executionMode: 'sequential' | 'parallel' | 'mixed';
    maxConcurrency: number;
    timeout: number;
    retryPolicy: RetryPolicy;
    errorHandling: ErrorHandlingPolicy;
}
export interface RetryPolicy {
    maxRetries: number;
    retryDelay: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
}
export interface ErrorHandlingPolicy {
    onStageFailure: 'abort' | 'continue' | 'retry' | 'skip';
    onWorkflowFailure: 'abort' | 'rollback' | 'partial_success';
}
export interface ExecutionCondition {
    type: 'always' | 'on_success' | 'on_failure' | 'custom';
    expression?: string;
}
export interface ExecutionPlan {
    planId: UUID;
    workflowId: UUID;
    executionOrder: ExecutionGroup[];
    resourceRequirements: ResourceRequirements;
    estimatedDuration: number;
    createdAt: Timestamp;
}
export interface ExecutionGroup {
    groupId: UUID;
    stages: UUID[];
    executionType: 'sequential' | 'parallel';
    dependencies: UUID[];
}
export interface ResourceRequirements {
    cpuCores: number;
    memoryMb: number;
    maxConnections: number;
    estimatedDuration: number;
}
export interface ExecutionStatus {
    executionId: UUID;
    workflowId: UUID;
    status: WorkflowStatus;
    currentStage?: UUID;
    completedStages: UUID[];
    failedStages: UUID[];
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number;
    progress: ExecutionProgress;
    errors: ExecutionError[];
}
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface ExecutionProgress {
    totalStages: number;
    completedStages: number;
    failedStages: number;
    progressPercentage: number;
}
export interface ExecutionError {
    errorId: UUID;
    stageId: UUID;
    errorType: string;
    message: string;
    timestamp: Timestamp;
    retryCount: number;
}
export interface ParsedWorkflow {
    definition: WorkflowDefinition;
    validationResult: ValidationResult;
    optimizedStages: WorkflowStage[];
    dependencyGraph: DependencyGraph;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    errorType: 'syntax' | 'semantic' | 'dependency' | 'resource';
    message: string;
    location?: string;
}
export interface ValidationWarning {
    warningType: 'performance' | 'compatibility' | 'best_practice';
    message: string;
    suggestion?: string;
}
export interface DependencyGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
    cycles: UUID[][];
}
export interface GraphNode {
    nodeId: UUID;
    stageId: UUID;
    level: number;
    dependencies: UUID[];
}
export interface GraphEdge {
    from: UUID;
    to: UUID;
    type: string;
}
export declare class WorkflowScheduler {
    private activeExecutions;
    private maxConcurrentExecutions;
    constructor(maxConcurrentExecutions?: number);
    parseWorkflow(definition: WorkflowDefinition): Promise<ParsedWorkflow>;
    validateWorkflow(workflow: ParsedWorkflow): Promise<ValidationResult>;
    scheduleExecution(workflow: ParsedWorkflow): Promise<ExecutionPlan>;
    executeWorkflow(plan: ExecutionPlan): Promise<WorkflowResult>;
    manageConcurrency(executions: ExecutionContext[]): Promise<void>;
    trackExecution(executionId: string): Promise<ExecutionStatus>;
    pauseExecution(executionId: string): Promise<void>;
    resumeExecution(executionId: string): Promise<void>;
    cancelExecution(executionId: string): Promise<void>;
    private validateSyntax;
    private validateSemantics;
    private buildDependencyGraph;
    private detectCycles;
    private optimizeStages;
    private createExecutionGroups;
    private calculateResourceRequirements;
    private estimateExecutionDuration;
    private executeGroup;
    private generateUUID;
}
export interface WorkflowResult {
    executionId: UUID;
    workflowId: UUID;
    status: WorkflowStatus;
    result: Record<string, unknown>;
    duration: number;
    completedStages: number;
    failedStages: number;
}
export interface ExecutionContext {
    executionId: UUID;
    workflowId: UUID;
    status: WorkflowStatus;
}
//# sourceMappingURL=workflow.scheduler.d.ts.map