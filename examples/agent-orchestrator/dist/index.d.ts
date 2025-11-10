/**
 * Agent Orchestrator - Enterprise Multi-Agent Orchestration Platform
 * Built with MPLP SDK v1.1.0-beta for enterprise-grade multi-agent coordination
 */
import { EventEmitter } from 'events';
import { PlannerAgent, CreatorAgent, ReviewerAgent, PublisherAgent, CoordinatorAgent } from './agents';
import { Task, TaskResult, OrchestrationMetrics, WorkflowDefinition } from './types';
export declare class AgentOrchestratorApp extends EventEmitter {
    private coordinator?;
    private planner?;
    private creator?;
    private reviewer?;
    private publisher?;
    private isInitialized;
    private orchestrationMetrics;
    private workflowDefinitions;
    private activeWorkflows;
    constructor();
    initialize(): Promise<void>;
    runAllExamples(): Promise<void>;
    runExample(exampleName: string): Promise<void>;
    private runBasicContentCreationExample;
    private runMultiLanguageExample;
    private runQualityReviewExample;
    private runCoordinationDemo;
    private createAgents;
    private initializeAgents;
    private registerAgents;
    shutdown(): Promise<void>;
    displayAvailableExamples(): void;
    getCoordinator(): CoordinatorAgent | undefined;
    getAgents(): {
        planner: PlannerAgent;
        creator: CreatorAgent;
        reviewer: ReviewerAgent;
        publisher: PublisherAgent;
        coordinator: CoordinatorAgent;
    };
    private initializeWorkflowDefinitions;
    private initializeMonitoring;
    private setupEventListeners;
    executeWorkflow(workflowId: string, task: Task): Promise<TaskResult>;
    getWorkflowDefinitions(): WorkflowDefinition[];
    getOrchestrationMetrics(): OrchestrationMetrics;
    getActiveWorkflows(): string[];
    runEnterpriseContentCreation(): Promise<void>;
    runDistributedCoordination(): Promise<void>;
}
export declare function main(): Promise<void>;
export default AgentOrchestratorApp;
export * from './agents';
export * from './types';
//# sourceMappingURL=index.d.ts.map