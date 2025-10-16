/**
 * @fileoverview Workflow type definitions for workflow automation
 * @version 1.1.0-beta
 */

import { Ticket, Customer } from './Ticket';
import { AgentResult } from './Agent';

export interface WorkflowDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly steps: WorkflowStep[];
  readonly timeout: number;
  readonly retryPolicy: RetryPolicy;
  readonly metadata?: Record<string, unknown>;
}

export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly type: WorkflowStepType;
  readonly agentId?: string;
  readonly condition?: WorkflowCondition;
  readonly timeout?: number;
  readonly retryPolicy?: RetryPolicy;
  readonly dependencies?: string[];
  readonly parameters?: Record<string, unknown>;
}

export type WorkflowStepType = 
  | 'agent_task'
  | 'condition'
  | 'parallel'
  | 'sequential'
  | 'loop'
  | 'delay'
  | 'notification';

export interface WorkflowCondition {
  readonly expression: string;
  readonly variables: Record<string, unknown>;
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly backoffStrategy: 'fixed' | 'exponential' | 'linear';
  readonly initialDelay: number;
  readonly maxDelay: number;
  readonly retryableErrors?: string[];
}

export interface WorkflowExecution {
  readonly id: string;
  readonly workflowId: string;
  readonly status: WorkflowExecutionStatus;
  readonly input: WorkflowInput;
  readonly output?: WorkflowOutput;
  readonly steps: WorkflowStepExecution[];
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly error?: WorkflowError;
  readonly metadata?: Record<string, unknown>;
}

export type WorkflowExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export interface WorkflowStepExecution {
  readonly stepId: string;
  readonly status: WorkflowExecutionStatus;
  readonly input?: unknown;
  readonly output?: unknown;
  readonly agentResult?: AgentResult;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly attempts: number;
  readonly error?: WorkflowError;
}

export interface WorkflowInput {
  readonly ticket: Ticket;
  readonly customer: Customer;
  readonly context?: Record<string, unknown>;
  readonly priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkflowOutput {
  readonly success: boolean;
  readonly result: WorkflowResult;
  readonly metrics: WorkflowExecutionMetrics;
  readonly recommendations?: string[];
}

export interface WorkflowResult {
  readonly ticketId: string;
  readonly finalStatus: Ticket['status'];
  readonly resolution?: string | undefined;
  readonly escalated: boolean;
  readonly customerSatisfied?: boolean | undefined;
  readonly followUpRequired: boolean;
  readonly nextActions?: string[] | undefined;
}

export interface WorkflowExecutionMetrics {
  readonly totalSteps: number;
  readonly completedSteps: number;
  readonly failedSteps: number;
  readonly totalDuration: number;
  readonly agentUtilization: Record<string, number>;
  readonly costEstimate?: number;
}

export interface WorkflowError {
  readonly code: string;
  readonly message: string;
  readonly stepId?: string;
  readonly agentId?: string;
  readonly timestamp: Date;
  readonly recoverable: boolean;
  readonly context?: Record<string, unknown>;
}

export interface WorkflowTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly definition: WorkflowDefinition;
  readonly requiredCapabilities: string[];
  readonly estimatedDuration: number;
  readonly complexity: 'simple' | 'medium' | 'complex';
  readonly tags: string[];
}

export interface WorkflowSchedule {
  readonly id: string;
  readonly workflowId: string;
  readonly cronExpression?: string;
  readonly interval?: number;
  readonly enabled: boolean;
  readonly nextRun?: Date;
  readonly lastRun?: Date;
  readonly parameters?: Record<string, unknown>;
}
