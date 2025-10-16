/**
 * @fileoverview MPLP Orchestrator - Main Entry Point
 * Multi-Agent Protocol Lifecycle Platform Orchestrator
 * 
 * Provides advanced multi-agent workflow orchestration and execution capabilities
 * for the MPLP ecosystem.
 */

// ============================================================================
// Core Exports
// ============================================================================

// Main orchestrator class
export { MultiAgentOrchestrator } from './orchestrator/MultiAgentOrchestrator';
import { MultiAgentOrchestrator } from './orchestrator/MultiAgentOrchestrator';

// Workflow builder
export { WorkflowBuilder } from './workflow/WorkflowBuilder';
import { WorkflowBuilder } from './workflow/WorkflowBuilder';

// Execution engine
export { ExecutionEngine } from './execution/ExecutionEngine';

// ============================================================================
// Type Exports
// ============================================================================

// Core interfaces
export type {
  IMultiAgentOrchestrator,
  IWorkflowBuilder
} from './types';

// Workflow types
export type {
  WorkflowDefinition,
  AnyStepConfig,
  AgentStepConfig,
  ParallelStepConfig,
  SequentialStepConfig,
  ConditionalStepConfig,
  LoopStepConfig,
  StepConfig,
  StepCondition
} from './types';

// Execution types
export type {
  WorkflowContext,
  WorkflowResult,
  StepResult,
  WorkflowProgress,
  ExecutionOptions,
  StepHandler,
  ErrorHandler,
  ProgressHandler
} from './types';

// Enum exports
export {
  WorkflowStatus,
  StepStatus,
  StepPriority
} from './types';

// Error exports
export {
  OrchestratorError,
  WorkflowDefinitionError,
  WorkflowExecutionError,
  StepExecutionError,
  AgentNotFoundError,
  WorkflowNotFoundError
} from './types';

// Utility type exports
export type {
  DeepReadonly,
  Optional,
  Required
} from './types';

// ============================================================================
// Utility Exports
// ============================================================================

export {
  // Workflow utilities
  cloneWorkflow,
  validateWorkflowStructure,
  getWorkflowStepIds,
  getWorkflowAgentIds,
  hasCircularDependencies,
  
  // Execution utilities
  calculateProgress,
  getExecutionSummary,
  isExecutionSuccessful,
  getFailedSteps,
  formatDuration,
  
  // Validation utilities
  validateStepConfig,
  sanitizeStepName,
  generateStepId,
  
  // Retry utilities
  retryWithBackoff,
  createTimeout,
  withTimeout
} from './utils';

// ============================================================================
// Convenience Factory Functions
// ============================================================================

/**
 * Create a new multi-agent orchestrator instance
 */
export function createOrchestrator(): MultiAgentOrchestrator {
  return MultiAgentOrchestrator.create();
}

/**
 * Create a new workflow builder
 */
export function createWorkflow(name: string, id?: string): WorkflowBuilder {
  return WorkflowBuilder.create(name, id);
}

// ============================================================================
// Version Information
// ============================================================================

export const VERSION = '1.1.0-beta';
export const PACKAGE_NAME = '@mplp/orchestrator';

// ============================================================================
// Default Export
// ============================================================================

export default MultiAgentOrchestrator;
