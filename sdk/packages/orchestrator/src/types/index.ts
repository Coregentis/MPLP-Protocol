/**
 * @fileoverview Core type definitions for MPLP Orchestrator
 * Defines interfaces and types for multi-agent workflow orchestration
 */

// Temporary EventEmitter interface until eventemitter3 is available
export interface EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  removeAllListeners(event?: string): this;
}

// Temporary IAgent interface until @mplp/agent-builder is available
export interface IAgent {
  readonly id: string;
  readonly name: string;
  readonly status: 'idle' | 'running' | 'stopped' | 'error';
}

// ============================================================================
// Core Orchestrator Types
// ============================================================================

/**
 * Workflow execution status
 */
export enum WorkflowStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Step execution status
 */
export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}

/**
 * Step execution priority
 */
export enum StepPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

// ============================================================================
// Workflow Definition Types
// ============================================================================

/**
 * Base step configuration
 */
export interface StepConfig {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly timeout?: number;
  readonly retries?: number;
  readonly priority?: StepPriority;
  readonly dependencies?: string[];
  readonly condition?: StepCondition;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Step condition for conditional execution
 */
export interface StepCondition {
  readonly predicate: (context: WorkflowContext) => boolean | Promise<boolean>;
  readonly description?: string;
}

/**
 * Agent step configuration
 */
export interface AgentStepConfig extends StepConfig {
  readonly type: 'agent';
  readonly agentId: string;
  readonly action: string;
  readonly parameters?: Record<string, unknown>;
}

/**
 * Parallel step configuration
 */
export interface ParallelStepConfig extends StepConfig {
  readonly type: 'parallel';
  readonly steps: StepConfig[];
  readonly concurrency?: number;
  readonly failFast?: boolean;
}

/**
 * Sequential step configuration
 */
export interface SequentialStepConfig extends StepConfig {
  readonly type: 'sequential';
  readonly steps: StepConfig[];
}

/**
 * Conditional step configuration
 */
export interface ConditionalStepConfig extends StepConfig {
  readonly type: 'conditional';
  readonly condition: StepCondition;
  readonly thenStep: StepConfig;
  readonly elseStep?: StepConfig;
}

/**
 * Loop step configuration
 */
export interface LoopStepConfig extends StepConfig {
  readonly type: 'loop';
  readonly condition: StepCondition;
  readonly body: StepConfig;
  readonly maxIterations?: number;
}

/**
 * Union type for all step configurations
 */
export type AnyStepConfig = 
  | AgentStepConfig 
  | ParallelStepConfig 
  | SequentialStepConfig 
  | ConditionalStepConfig 
  | LoopStepConfig;

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  readonly id: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly version?: string | undefined;
  readonly steps: AnyStepConfig[];
  readonly timeout?: number | undefined;
  readonly retries?: number | undefined;
  readonly metadata?: Record<string, unknown> | undefined;
}

// ============================================================================
// Execution Context Types
// ============================================================================

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  readonly workflowId: string;
  readonly executionId: string;
  readonly startTime: Date;
  readonly variables: Map<string, unknown>;
  readonly results: Map<string, StepResult>;
  readonly metadata: Record<string, unknown>;
}

/**
 * Step execution result
 */
export interface StepResult {
  stepId: string;
  status: StepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  result?: unknown;
  error?: Error;
  metadata?: Record<string, unknown> | undefined;
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  workflowId: string;
  executionId: string;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: StepResult[];
  result?: unknown;
  error?: Error;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Handler Types
// ============================================================================

/**
 * Step handler function
 */
export type StepHandler = (
  context: WorkflowContext,
  parameters?: Record<string, unknown>
) => Promise<unknown>;

/**
 * Error handler function
 */
export type ErrorHandler = (
  error: Error,
  context: WorkflowContext,
  stepConfig: AnyStepConfig
) => Promise<void>;

/**
 * Progress handler function
 */
export type ProgressHandler = (
  progress: WorkflowProgress
) => void;

/**
 * Workflow progress information
 */
export interface WorkflowProgress {
  readonly workflowId: string;
  readonly executionId: string;
  readonly totalSteps: number;
  readonly completedSteps: number;
  readonly failedSteps: number;
  readonly skippedSteps: number;
  readonly currentStep?: string;
  readonly progress: number; // 0-100
  readonly estimatedTimeRemaining?: number;
}

// ============================================================================
// Orchestrator Interface Types
// ============================================================================

/**
 * Multi-agent orchestrator interface
 */
export interface IMultiAgentOrchestrator {
  // Agent management
  registerAgent(agent: IAgent): Promise<void>;
  unregisterAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): IAgent | undefined;
  listAgents(): IAgent[];

  // Workflow management
  registerWorkflow(workflow: WorkflowDefinition): Promise<void>;
  unregisterWorkflow(workflowId: string): Promise<void>;
  getWorkflow(workflowId: string): WorkflowDefinition | undefined;
  listWorkflows(): WorkflowDefinition[];

  // Execution management
  executeWorkflow(
    workflowId: string,
    parameters?: Record<string, unknown>,
    options?: ExecutionOptions
  ): Promise<WorkflowResult>;
  
  pauseExecution(executionId: string): Promise<void>;
  resumeExecution(executionId: string): Promise<void>;
  cancelExecution(executionId: string): Promise<void>;
  
  getExecutionStatus(executionId: string): WorkflowResult | undefined;
  listExecutions(): WorkflowResult[];

  // Event handlers
  onProgress(handler: ProgressHandler): void;
  onError(handler: ErrorHandler): void;
}

/**
 * Workflow builder interface
 */
export interface IWorkflowBuilder {
  step(id: string, config: Omit<AgentStepConfig, 'id' | 'type'>): IWorkflowBuilder;
  parallel(id: string, config: Omit<ParallelStepConfig, 'id' | 'type'>): IWorkflowBuilder;
  sequential(id: string, config: Omit<SequentialStepConfig, 'id' | 'type'>): IWorkflowBuilder;
  condition(id: string, config: Omit<ConditionalStepConfig, 'id' | 'type'>): IWorkflowBuilder;
  loop(id: string, config: Omit<LoopStepConfig, 'id' | 'type'>): IWorkflowBuilder;
  
  timeout(timeout: number): IWorkflowBuilder;
  retries(retries: number): IWorkflowBuilder;
  metadata(metadata: Record<string, unknown>): IWorkflowBuilder;
  
  build(): WorkflowDefinition;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  readonly timeout?: number;
  readonly retries?: number;
  readonly concurrency?: number;
  readonly failFast?: boolean;
  readonly variables?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base orchestrator error
 */
export class OrchestratorError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown> | undefined;

  constructor(message: string, code: string = 'ORCHESTRATOR_ERROR', details?: Record<string, unknown> | undefined) {
    super(message);
    this.name = 'OrchestratorError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, OrchestratorError);
  }
}

/**
 * Workflow definition error
 */
export class WorkflowDefinitionError extends OrchestratorError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'WORKFLOW_DEFINITION_ERROR', details);
    this.name = 'WorkflowDefinitionError';
  }
}

/**
 * Workflow execution error
 */
export class WorkflowExecutionError extends OrchestratorError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'WORKFLOW_EXECUTION_ERROR', details);
    this.name = 'WorkflowExecutionError';
  }
}

/**
 * Step execution error
 */
export class StepExecutionError extends OrchestratorError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'STEP_EXECUTION_ERROR', details);
    this.name = 'StepExecutionError';
  }
}

/**
 * Agent not found error
 */
export class AgentNotFoundError extends OrchestratorError {
  constructor(agentId: string) {
    super(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND_ERROR', { agentId });
    this.name = 'AgentNotFoundError';
  }
}

/**
 * Workflow not found error
 */
export class WorkflowNotFoundError extends OrchestratorError {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`, 'WORKFLOW_NOT_FOUND_ERROR', { workflowId });
    this.name = 'WorkflowNotFoundError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Optional properties type
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required properties type
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
