/**
 * @fileoverview Type definitions index for workflow automation
 * @version 1.1.0-beta
 */

// Ticket types
export type {
  Customer,
  Ticket,
  TicketClassification,
  TicketResponse,
  ResponseAttachment,
  EscalationRequest,
  EscalationContext,
  CustomerInteraction,
  WorkflowMetrics,
  TicketUpdate
} from './Ticket';

// Agent types
export type {
  AgentCapabilityDetail,
  AgentConfig,
  AgentType,
  AgentTask,
  AgentResult,
  ClassificationAgentInput,
  ClassificationAgentOutput,
  ResponseAgentInput,
  ResponseAgentOutput,
  EscalationAgentInput,
  EscalationAgentOutput,
  MonitoringAgentInput,
  MonitoringAgentOutput,
  MonitoringAlert,
  AgentPerformanceMetrics
} from './Agent';

// Workflow types
export type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepType,
  WorkflowCondition,
  RetryPolicy,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowStepExecution,
  WorkflowInput,
  WorkflowOutput,
  WorkflowResult,
  WorkflowExecutionMetrics,
  WorkflowError,
  WorkflowTemplate,
  WorkflowSchedule
} from './Workflow';
