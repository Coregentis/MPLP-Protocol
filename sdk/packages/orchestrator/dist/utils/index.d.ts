/**
 * @fileoverview Utility functions for MPLP Orchestrator
 * Common utilities for workflow management and execution
 */
import { WorkflowDefinition, AnyStepConfig, WorkflowResult, StepResult, WorkflowProgress } from '../types';
/**
 * Deep clone a workflow definition
 */
export declare function cloneWorkflow(workflow: WorkflowDefinition): WorkflowDefinition;
/**
 * Validate workflow definition structure
 */
export declare function validateWorkflowStructure(workflow: WorkflowDefinition): boolean;
/**
 * Get all step IDs from a workflow
 */
export declare function getWorkflowStepIds(workflow: WorkflowDefinition): string[];
/**
 * Get all agent IDs referenced in a workflow
 */
export declare function getWorkflowAgentIds(workflow: WorkflowDefinition): string[];
/**
 * Check if workflow has circular dependencies
 */
export declare function hasCircularDependencies(workflow: WorkflowDefinition): boolean;
/**
 * Calculate workflow execution progress
 */
export declare function calculateProgress(results: StepResult[]): WorkflowProgress;
/**
 * Get execution summary statistics
 */
export declare function getExecutionSummary(result: WorkflowResult): {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    skippedSteps: number;
    totalDuration: number;
    averageStepDuration: number;
};
/**
 * Check if workflow execution is successful
 */
export declare function isExecutionSuccessful(result: WorkflowResult): boolean;
/**
 * Get failed steps from execution result
 */
export declare function getFailedSteps(result: WorkflowResult): StepResult[];
/**
 * Get execution duration in human-readable format
 */
export declare function formatDuration(milliseconds: number): string;
/**
 * Validate step configuration
 */
export declare function validateStepConfig(step: AnyStepConfig): string[];
/**
 * Sanitize step name for use as identifier
 */
export declare function sanitizeStepName(name: string): string;
/**
 * Generate unique step ID
 */
export declare function generateStepId(name: string, existingIds?: Set<string>): string;
/**
 * Retry function with exponential backoff
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number, maxDelay?: number): Promise<T>;
/**
 * Create a timeout promise
 */
export declare function createTimeout(ms: number): Promise<never>;
/**
 * Race a promise against a timeout
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map