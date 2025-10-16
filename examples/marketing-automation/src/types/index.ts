/**
 * @fileoverview Type definitions index for marketing automation
 * @version 1.1.0-beta
 */

// Customer types
export {
  Customer,
  CustomerTier,
  CustomerPreferences,
  ContactFrequency,
  CustomerProfile,
  CustomerBehavior,
  ChurnRisk,
  CustomerActivity,
  ActivityType,
  CustomerSegment,
  SegmentCriteria,
  CustomerInteraction,
  InteractionType,
  InteractionOutcome
} from './Customer';

// Campaign types
export {
  Campaign,
  CampaignType,
  CampaignStatus,
  MarketingChannel,
  CampaignContent,
  PersonalizationConfig,
  CampaignSchedule,
  ScheduleFrequency,
  CampaignMetrics,
  CampaignUpdate,
  CampaignAnalytics
} from './Campaign';

// Marketing Agent types
export {
  AgentCapabilityDetail,
  AgentConfig,
  AgentType,
  AgentTask,
  TaskPriority,
  AgentResult,
  TaskStatus,
  CampaignManagerInput,
  CampaignManagerOutput,
  SegmentationAgentInput,
  SegmentationAgentOutput,
  PersonalizationAgentInput,
  PersonalizationAgentOutput,
  AnalyticsAgentInput,
  AnalyticsAgentOutput,
  LeadScoringAgentInput,
  LeadScoringAgentOutput,
  ABTestingAgentInput,
  ABTestingAgentOutput,
  AgentPerformanceMetrics
} from './MarketingAgent';

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
