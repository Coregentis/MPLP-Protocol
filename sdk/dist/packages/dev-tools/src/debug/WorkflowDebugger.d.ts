/**
 * @fileoverview Workflow Debugger - Debug workflow execution
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { DebugConfig, WorkflowDebugInfo, WorkflowStepInfo } from '../types/debug';
/**
 * Workflow debugger for debugging workflow execution
 */
export declare class WorkflowDebugger extends EventEmitter {
    private config;
    private debuggedWorkflows;
    private isActive;
    constructor(config: DebugConfig);
    /**
     * Start workflow debugging
     */
    start(): Promise<void>;
    /**
     * Stop workflow debugging
     */
    stop(): Promise<void>;
    /**
     * Start debugging workflow
     */
    startWorkflowDebugging(workflowId: string, name: string): void;
    /**
     * Update workflow status
     */
    updateWorkflowStatus(workflowId: string, status: WorkflowDebugInfo['status']): void;
    /**
     * Add workflow step
     */
    addWorkflowStep(workflowId: string, stepInfo: Omit<WorkflowStepInfo, 'stepId'>): void;
    /**
     * Update workflow step
     */
    updateWorkflowStep(workflowId: string, stepId: string, updates: Partial<WorkflowStepInfo>): void;
    /**
     * Get workflow debug info
     */
    getWorkflowInfo(workflowId: string): WorkflowDebugInfo | undefined;
    /**
     * Get all debugged workflows
     */
    getAllWorkflows(): WorkflowDebugInfo[];
    /**
     * Get debugging statistics
     */
    getStatistics(): any;
    /**
     * Calculate average workflow duration
     */
    private calculateAverageDuration;
}
//# sourceMappingURL=WorkflowDebugger.d.ts.map