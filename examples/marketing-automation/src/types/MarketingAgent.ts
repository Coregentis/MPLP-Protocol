/**
 * Marketing Agent Types
 * Type definitions for marketing automation agents
 */

import { Campaign, CampaignMetrics } from './Campaign';
import { Customer, CustomerSegment } from './Customer';

export interface AgentCapabilityDetail {
  readonly name: string;
  readonly description: string;
  readonly confidence: number;
  readonly parameters?: Record<string, unknown>;
}

export interface AgentConfig {
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
  | 'campaign_manager'
  | 'customer_segmentation'
  | 'content_personalization'
  | 'analytics'
  | 'lead_scoring'
  | 'a_b_testing';

export interface AgentTask {
  readonly id: string;
  readonly type: string;
  readonly priority: TaskPriority;
  readonly data: Record<string, unknown>;
  readonly createdAt: Date;
  readonly deadline?: Date;
  readonly dependencies?: string[];
  readonly metadata?: Record<string, unknown>;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface AgentResult {
  readonly taskId: string;
  readonly agentId: string;
  readonly status: TaskStatus;
  readonly result?: unknown;
  readonly error?: string;
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly duration?: number;
  readonly metadata?: Record<string, unknown>;
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Campaign Manager Agent Types
export interface CampaignManagerInput {
  action: 'create' | 'update' | 'launch' | 'pause' | 'analyze';
  campaign?: Partial<Campaign>;
  campaignId?: string;
  parameters?: Record<string, unknown>;
}

export interface CampaignManagerOutput {
  campaign?: Campaign;
  metrics?: CampaignMetrics;
  recommendations?: string[];
  nextActions?: string[];
}

// Customer Segmentation Agent Types
export interface SegmentationAgentInput {
  action: 'create_segment' | 'update_segment' | 'analyze_customers' | 'predict_behavior';
  customers?: Customer[];
  segmentCriteria?: Record<string, unknown>;
  segmentId?: string;
  analysisType?: 'demographic' | 'behavioral' | 'predictive';
}

export interface SegmentationAgentOutput {
  segments?: CustomerSegment[];
  customerAssignments?: Record<string, string[]>;
  insights?: string[];
  predictions?: Record<string, number>;
}

// Content Personalization Agent Types
export interface PersonalizationAgentInput {
  customerId: string;
  campaignId: string;
  contentTemplate: string;
  personalizationRules: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface PersonalizationAgentOutput {
  personalizedContent: string;
  personalizationApplied: string[];
  confidence: number;
  alternatives?: string[];
}

// Analytics Agent Types
export interface AnalyticsAgentInput {
  action: 'campaign_analysis' | 'customer_analysis' | 'trend_analysis' | 'roi_calculation';
  timeframe: {
    start: Date;
    end: Date;
  };
  entityIds?: string[];
  metrics?: string[];
  dimensions?: string[];
}

export interface AnalyticsAgentOutput {
  metrics: Record<string, number>;
  trends: Array<{
    date: Date;
    values: Record<string, number>;
  }>;
  insights: string[];
  recommendations: string[];
  visualizations?: Array<{
    type: string;
    data: unknown;
    config: Record<string, unknown>;
  }>;
}

// Lead Scoring Agent Types
export interface LeadScoringAgentInput {
  customerId: string;
  activities?: Array<{
    type: string;
    timestamp: Date;
    value: number;
  }>;
  profile?: Record<string, unknown>;
  recalculate?: boolean;
}

export interface LeadScoringAgentOutput {
  score: number;
  scoreBreakdown: Record<string, number>;
  tier: 'cold' | 'warm' | 'hot' | 'qualified';
  nextBestActions: string[];
  confidence: number;
}

// A/B Testing Agent Types
export interface ABTestingAgentInput {
  action: 'create_test' | 'analyze_results' | 'determine_winner';
  testId?: string;
  variants?: Array<{
    id: string;
    name: string;
    content: unknown;
    allocation: number;
  }>;
  metrics?: string[];
  significanceLevel?: number;
}

export interface ABTestingAgentOutput {
  testId?: string;
  results?: Record<string, {
    variant: string;
    metrics: Record<string, number>;
    sampleSize: number;
    confidence: number;
  }>;
  winner?: string;
  significance?: number;
  recommendations?: string[];
}

export interface AgentPerformanceMetrics {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly tasksCompleted: number;
  readonly tasksSuccessful: number;
  readonly averageExecutionTime: number;
  readonly errorRate: number;
  readonly lastActive: Date;
  readonly uptime: number;
  readonly resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}
