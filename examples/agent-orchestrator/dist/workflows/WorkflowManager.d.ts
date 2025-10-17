/**
 * @fileoverview Workflow Manager for Agent Orchestrator
 * @version 1.1.0-beta
 */
import { Logger } from '@mplp/core';
import { WorkflowConfig } from '../types';
/**
 * Workflow Manager - 基于MPLP V1.0 Alpha工作流管理模式
 */
export declare class WorkflowManager {
    private logger;
    private workflows;
    private executions;
    private isRunning;
    constructor(logger: Logger);
    /**
     * Initialize workflow manager
     */
    initialize(workflowConfigs: WorkflowConfig[]): Promise<void>;
    /**
     * Start workflow manager
     */
    start(): Promise<void>;
    /**
     * Stop workflow manager
     */
    stop(): Promise<void>;
    /**
     * Execute a workflow
     */
    executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<string>;
    /**
     * Get workflow execution status
     */
    getExecutionStatus(executionId: string): unknown;
    /**
     * List all workflows
     */
    listWorkflows(): WorkflowConfig[];
    /**
     * List all executions
     */
    listExecutions(): unknown[];
    /**
     * Execute workflow steps based on execution mode
     */
    private executeWorkflowSteps;
    /**
     * Execute workflow steps sequentially
     */
    private executeSequential;
    /**
     * Execute workflow steps in parallel
     */
    private executeParallel;
    /**
     * Execute workflow with conditional logic
     */
    private executeConditional;
    /**
     * Execute workflow in event-driven mode
     */
    private executeEventDriven;
    /**
     * Execute a single workflow step
     */
    private executeStep;
    /**
     * Handle step failure
     */
    private handleStepFailure;
    /**
     * Generate unique execution ID
     */
    private generateExecutionId;
    /**
     * Start workflow monitoring
     */
    private startWorkflowMonitoring;
    /**
     * Monitor running workflows
     */
    private monitorWorkflows;
    /**
     * Check execution timeout
     */
    private checkExecutionTimeout;
    /**
     * Monitor execution progress
     */
    private monitorExecutionProgress;
}
//# sourceMappingURL=WorkflowManager.d.ts.map