/**
 * @fileoverview MPLP Orchestrator - Main Entry Point
 * Multi-Agent Protocol Lifecycle Platform Orchestrator
 *
 * Provides advanced multi-agent workflow orchestration and execution capabilities
 * for the MPLP ecosystem.
 */
export { MultiAgentOrchestrator } from './orchestrator/MultiAgentOrchestrator';
import { MultiAgentOrchestrator } from './orchestrator/MultiAgentOrchestrator';
export { WorkflowBuilder } from './workflow/WorkflowBuilder';
import { WorkflowBuilder } from './workflow/WorkflowBuilder';
export { ExecutionEngine } from './execution/ExecutionEngine';
export type { IMultiAgentOrchestrator, IWorkflowBuilder } from './types';
export type { WorkflowDefinition, AnyStepConfig, AgentStepConfig, ParallelStepConfig, SequentialStepConfig, ConditionalStepConfig, LoopStepConfig, StepConfig, StepCondition } from './types';
export type { WorkflowContext, WorkflowResult, StepResult, WorkflowProgress, ExecutionOptions, StepHandler, ErrorHandler, ProgressHandler } from './types';
export { WorkflowStatus, StepStatus, StepPriority } from './types';
export { OrchestratorError, WorkflowDefinitionError, WorkflowExecutionError, StepExecutionError, AgentNotFoundError, WorkflowNotFoundError } from './types';
export type { DeepReadonly, Optional, Required } from './types';
export { cloneWorkflow, validateWorkflowStructure, getWorkflowStepIds, getWorkflowAgentIds, hasCircularDependencies, calculateProgress, getExecutionSummary, isExecutionSuccessful, getFailedSteps, formatDuration, validateStepConfig, sanitizeStepName, generateStepId, retryWithBackoff, createTimeout, withTimeout } from './utils';
/**
 * Create a new multi-agent orchestrator instance
 */
export declare function createOrchestrator(): MultiAgentOrchestrator;
/**
 * Create a new workflow builder
 */
export declare function createWorkflow(name: string, id?: string): WorkflowBuilder;
export declare const VERSION = "1.1.0-beta";
export declare const PACKAGE_NAME = "@mplp/orchestrator";
export default MultiAgentOrchestrator;
//# sourceMappingURL=index.d.ts.map