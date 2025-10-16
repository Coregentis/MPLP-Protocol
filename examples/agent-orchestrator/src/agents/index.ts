/**
 * AI Coordination Example - Agent Exports
 * Central export point for all agent implementations
 */

// Base Agent
export { BaseAgent } from './BaseAgent';
export type { BaseAgentConfig } from './BaseAgent';

// Planner Agent
export { PlannerAgent } from './PlannerAgent';
export type {
  PlannerAgentConfig,
  PlanningStrategy,
  ContentExpertise,
  MarketKnowledge,
  ContentPlan,
  ContentSection,
  PublishingStrategy,
  TimingRecommendation,
  CrossPromotionPlan,
  SuccessMetric,
  EffortEstimate
} from './PlannerAgent';

// Creator Agent
export { CreatorAgent } from './CreatorAgent';
export type {
  CreatorAgentConfig,
  WritingStyle,
  ContentType,
  LanguageCapability,
  CreatedContent,
  ContentSection as CreatorContentSection,
  ContentMetadata,
  QualityIndicator
} from './CreatorAgent';

// Reviewer Agent
export { ReviewerAgent } from './ReviewerAgent';
export type {
  ReviewerAgentConfig,
  ReviewCriterion,
  QualityStandard,
  ExpertiseArea,
  ReviewResult,
  ReviewStatus,
  CriterionScore,
  ReviewFeedback,
  FeedbackType,
  FeedbackSeverity,
  Recommendation,
  ApprovalDecision,
  ReviewMetadata
} from './ReviewerAgent';

// Publisher Agent
export { PublisherAgent } from './PublisherAgent';
export type {
  PublisherAgentConfig,
  PublishingStrategy as PublisherPublishingStrategy,
  PublishingResult,
  PublishingStatus,
  ChannelResult,
  ChannelMetrics,
  PublishingMetadata,
  PerformancePrediction,
  NextAction
} from './PublisherAgent';

// Coordinator Agent
export { CoordinatorAgent } from './CoordinatorAgent';
export type {
  CoordinatorAgentConfig,
  CoordinationStrategy,
  WorkflowResult,
  WorkflowStatus,
  StageResult,
  ExecutionMetadata,
  CoordinationMetrics
} from './CoordinatorAgent';
