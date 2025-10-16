/**
 * @fileoverview Agent type definitions for workflow automation
 * @version 1.1.0-beta
 */

import { Ticket, TicketClassification, TicketResponse, EscalationRequest } from './Ticket';
import { AgentCapability as MPLPAgentCapability, AgentConfig as MPLPAgentConfig } from '@mplp/agent-builder';

export interface AgentCapabilityDetail {
  readonly name: string;
  readonly description: string;
  readonly confidence: number;
  readonly parameters?: Record<string, unknown>;
}

export interface AgentConfig extends Omit<MPLPAgentConfig, 'capabilities'> {
  readonly id?: string;
  readonly name: string;
  readonly type: AgentType;
  readonly capabilities: AgentCapabilityDetail[];
  readonly maxConcurrentTasks: number;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly metadata?: Record<string, unknown>;
}

export type AgentType = 
  | 'classification'
  | 'response'
  | 'escalation'
  | 'monitoring'
  | 'coordination';

export interface AgentTask {
  readonly id: string;
  readonly type: string;
  readonly input: unknown;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly timeout?: number;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
}

export interface AgentResult {
  readonly taskId: string;
  readonly agentId: string;
  readonly success: boolean;
  readonly output?: unknown;
  readonly error?: string;
  readonly executionTime: number;
  readonly confidence?: number;
  readonly metadata?: Record<string, unknown>;
  readonly completedAt: Date;
}

export interface ClassificationAgentInput {
  readonly ticket: Ticket;
  readonly customerHistory?: unknown[];
  readonly context?: Record<string, unknown>;
}

export interface ClassificationAgentOutput {
  readonly classification: TicketClassification;
  readonly confidence: number;
  readonly reasoning: string;
  readonly suggestedNextSteps: string[];
}

export interface ResponseAgentInput {
  readonly ticket: Ticket;
  readonly classification: TicketClassification;
  readonly customerHistory?: unknown[];
  readonly knowledgeBase?: unknown[];
  readonly context?: Record<string, unknown>;
}

export interface ResponseAgentOutput {
  readonly response: TicketResponse;
  readonly confidence: number;
  readonly alternativeResponses?: TicketResponse[] | undefined;
  readonly usedKnowledgeBase: boolean;
}

export interface EscalationAgentInput {
  readonly ticket: Ticket;
  readonly classification: TicketClassification;
  readonly previousAttempts: AgentResult[];
  readonly context?: Record<string, unknown>;
}

export interface EscalationAgentOutput {
  readonly shouldEscalate: boolean;
  readonly escalationRequest?: EscalationRequest | undefined;
  readonly reason: string;
  readonly confidence: number;
  readonly suggestedAssignee?: string | undefined;
}

export interface MonitoringAgentInput {
  readonly timeWindow: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly metrics?: string[];
  readonly filters?: Record<string, unknown>;
}

export interface MonitoringAgentOutput {
  readonly metrics: Record<string, number>;
  readonly alerts: MonitoringAlert[];
  readonly recommendations: string[];
  readonly healthScore: number;
  readonly metadata?: Record<string, unknown> | undefined;
}

export interface MonitoringAlert {
  readonly id: string;
  readonly type: 'warning' | 'error' | 'critical';
  readonly message: string;
  readonly metric: string;
  readonly threshold: number;
  readonly currentValue: number;
  readonly timestamp: Date;
  readonly resolved: boolean;
}

export interface AgentPerformanceMetrics {
  readonly agentId: string;
  readonly tasksCompleted: number;
  readonly successRate: number;
  readonly averageExecutionTime: number;
  readonly errorRate: number;
  readonly lastActive: Date;
  readonly utilization: number;
}
