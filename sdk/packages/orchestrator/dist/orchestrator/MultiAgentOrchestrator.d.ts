/**
 * @fileoverview Multi-Agent Orchestrator
 * Main orchestrator class for managing agents and executing workflows
 */
import { SimpleEventEmitter } from '../utils/EventEmitter';
import { IAgent } from '../types';
import { IMultiAgentOrchestrator, WorkflowDefinition, WorkflowResult, ExecutionOptions, ProgressHandler, ErrorHandler } from '../types';
import { WorkflowBuilder } from '../workflow/WorkflowBuilder';
/**
 * Multi-agent orchestrator implementation
 */
export declare class MultiAgentOrchestrator extends SimpleEventEmitter implements IMultiAgentOrchestrator {
    private readonly agents;
    private readonly workflows;
    private readonly executionEngine;
    constructor();
    /**
     * Register an agent with the orchestrator
     */
    registerAgent(agent: IAgent): Promise<void>;
    /**
     * Unregister an agent from the orchestrator
     */
    unregisterAgent(agentId: string): Promise<void>;
    /**
     * Get a registered agent
     */
    getAgent(agentId: string): IAgent | undefined;
    /**
     * List all registered agents
     */
    listAgents(): IAgent[];
    /**
     * Register a workflow definition
     */
    registerWorkflow(workflow: WorkflowDefinition): Promise<void>;
    /**
     * Unregister a workflow definition
     */
    unregisterWorkflow(workflowId: string): Promise<void>;
    /**
     * Get a registered workflow
     */
    getWorkflow(workflowId: string): WorkflowDefinition | undefined;
    /**
     * List all registered workflows
     */
    listWorkflows(): WorkflowDefinition[];
    /**
     * Execute a workflow
     */
    executeWorkflow(workflowId: string, parameters?: Record<string, unknown>, options?: ExecutionOptions): Promise<WorkflowResult>;
    /**
     * Pause workflow execution
     */
    pauseExecution(executionId: string): Promise<void>;
    /**
     * Resume workflow execution
     */
    resumeExecution(executionId: string): Promise<void>;
    /**
     * Cancel workflow execution
     */
    cancelExecution(executionId: string): Promise<void>;
    /**
     * Get execution status
     */
    getExecutionStatus(executionId: string): WorkflowResult | undefined;
    /**
     * List all executions
     */
    listExecutions(): WorkflowResult[];
    /**
     * Register progress handler
     */
    onProgress(handler: ProgressHandler): void;
    /**
     * Register error handler
     */
    onError(handler: ErrorHandler): void;
    /**
     * Get listener count for an event
     */
    listenerCount(event: string): number;
    /**
     * Create a new orchestrator instance
     */
    static create(): MultiAgentOrchestrator;
    /**
     * Create a workflow builder
     */
    static createWorkflow(name: string, id?: string): WorkflowBuilder;
    private setupExecutionEngineEvents;
    private validateWorkflow;
    private validateWorkflowAgents;
}
//# sourceMappingURL=MultiAgentOrchestrator.d.ts.map