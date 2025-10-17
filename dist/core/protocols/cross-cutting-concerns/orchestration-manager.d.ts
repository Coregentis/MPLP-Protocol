export interface WorkflowStep {
    id: string;
    name: string;
    module: string;
    operation: string;
    parameters: Record<string, unknown>;
    dependencies?: string[];
}
export interface WorkflowDefinition {
    id: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
    timeout?: number;
}
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface WorkflowInstance {
    id: string;
    definitionId: string;
    status: WorkflowStatus;
    startTime: string;
    endTime?: string;
    currentStep?: string;
    result?: Record<string, unknown>;
    error?: string;
}
export declare class MLPPOrchestrationManager {
    private workflows;
    private instances;
    registerWorkflow(_definition: WorkflowDefinition): void;
    startWorkflow(_definitionId: string, _parameters?: Record<string, unknown>): Promise<string>;
    createOrchestrationPlan(_workflowConfig: Record<string, unknown>, _context?: Record<string, unknown>): Promise<Record<string, unknown>>;
    executeOrchestrationPlan(_orchestrationPlan: Record<string, unknown>): Promise<Record<string, unknown>>;
    getWorkflowStatus(_instanceId: string): WorkflowInstance | null;
    cancelWorkflow(_instanceId: string): Promise<boolean>;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=orchestration-manager.d.ts.map