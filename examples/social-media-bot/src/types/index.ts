/**
 * Social Media Bot - Type Definitions
 * Comprehensive type system for enterprise social media automation
 */

import { EventEmitter } from 'events';

// ============================================================================
// Core Agent Types (Based on MPLP SDK)
// ============================================================================

/**
 * Base agent interface for social media automation
 */
export interface IAgent extends EventEmitter {
  readonly id: string;
  readonly name: string;
  readonly type: AgentType;
  readonly capabilities: AgentCapability[];
  readonly status: AgentStatus;
  
  initialize(): Promise<void>;
  process(task: Task): Promise<TaskResult>;
  communicate(message: AgentMessage): Promise<void>;
  shutdown(): Promise<void>;
}

/**
 * Social media agent types
 */
export type AgentType = 
  | 'content-planner'
  | 'content-creator' 
  | 'content-reviewer'
  | 'social-publisher'
  | 'social-coordinator'
  | 'analytics'
  | 'engagement'
  | 'monitoring';

/**
 * Agent capabilities for social media operations
 */
export type AgentCapability = 
  | 'content_planning'
  | 'content_creation'
  | 'content_review'
  | 'multi_platform_publishing'
  | 'social_coordination'
  | 'analytics_tracking'
  | 'engagement_management'
  | 'real_time_monitoring'
  | 'audience_analysis'
  | 'hashtag_optimization'
  | 'scheduling_optimization';

/**
 * Agent status enumeration
 */
export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// ============================================================================
// Social Media Platform Types
// ============================================================================

/**
 * Supported social media platforms
 */
export enum SocialPlatform {
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  DISCORD = 'discord',
  SLACK = 'slack'
}

/**
 * Platform configuration
 */
export interface PlatformConfig {
  platform: SocialPlatform;
  enabled: boolean;
  credentials: PlatformCredentials;
  settings: PlatformSettings;
  rateLimits: RateLimitConfig;
}

/**
 * Platform credentials
 */
export interface PlatformCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  [key: string]: string | undefined;
}

/**
 * Platform-specific settings
 */
export interface PlatformSettings {
  autoPost: boolean;
  autoReply: boolean;
  autoLike: boolean;
  autoFollow: boolean;
  contentFilters: string[];
  hashtagStrategy: HashtagStrategy;
  postingSchedule: PostingSchedule;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

// ============================================================================
// Content Management Types
// ============================================================================

/**
 * Content item for social media
 */
export interface ContentItem {
  id: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  hashtags: string[];
  mentions: string[];
  platforms: SocialPlatform[];
  scheduledTime?: Date;
  status: ContentStatus;
  metadata: ContentMetadata;
}

/**
 * Content status enumeration
 */
export enum ContentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

/**
 * Content metadata
 */
export interface ContentMetadata {
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  priority: ContentPriority;
  targetAudience: string[];
  expectedEngagement?: number;
}

/**
 * Content priority levels
 */
export enum ContentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Hashtag strategy configuration
 */
export interface HashtagStrategy {
  maxHashtags: number;
  trendingWeight: number;
  brandHashtags: string[];
  excludedHashtags: string[];
  autoGenerate: boolean;
}

/**
 * Posting schedule configuration
 */
export interface PostingSchedule {
  timezone: string;
  optimalTimes: TimeSlot[];
  frequency: PostingFrequency;
  blackoutPeriods: TimeRange[];
}

/**
 * Time slot for posting
 */
export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Time range for blackout periods
 */
export interface TimeRange {
  start: Date;
  end: Date;
  reason?: string;
}

/**
 * Posting frequency configuration
 */
export interface PostingFrequency {
  postsPerDay: number;
  postsPerWeek: number;
  minInterval: number; // minutes between posts
  maxInterval: number; // minutes between posts
}

// ============================================================================
// Task and Communication Types
// ============================================================================

/**
 * Task for social media operations
 */
export interface Task {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  data: TaskData;
  assignedAgent?: string;
  status: TaskStatus;
  createdAt: Date;
  deadline?: Date;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Task types for social media operations
 */
export type TaskType = 
  | 'content_planning'
  | 'content_creation'
  | 'content_review'
  | 'content_publishing'
  | 'engagement_monitoring'
  | 'analytics_collection'
  | 'audience_analysis'
  | 'hashtag_research'
  | 'competitor_analysis'
  | 'crisis_management';

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

/**
 * Task status enumeration
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Task data payload
 */
export interface TaskData {
  contentId?: string;
  platforms?: SocialPlatform[];
  content?: Partial<ContentItem>;
  parameters?: Record<string, unknown>;
  context?: TaskContext;
}

/**
 * Task execution context
 */
export interface TaskContext {
  userId?: string;
  campaignId?: string;
  brandId?: string;
  urgency?: string;
  constraints?: Record<string, unknown>;
}

/**
 * Task execution result
 */
export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  result?: unknown;
  error?: Error;
  metrics?: TaskMetrics;
  completedAt: Date;
  duration: number; // milliseconds
}

/**
 * Task execution metrics
 */
export interface TaskMetrics {
  processingTime: number;
  resourceUsage: ResourceUsage;
  qualityScore?: number;
  successRate?: number;
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  cpuTime: number;
  memoryUsage: number;
  networkRequests: number;
  apiCalls: number;
}

// ============================================================================
// Agent Communication Types
// ============================================================================

/**
 * Inter-agent communication message
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string | string[];
  type: MessageType;
  payload: MessagePayload;
  timestamp: Date;
  priority: MessagePriority;
  requiresResponse?: boolean;
  correlationId?: string;
}

/**
 * Message types for agent communication
 */
export type MessageType = 
  | 'task_assignment'
  | 'task_completion'
  | 'status_update'
  | 'coordination_request'
  | 'data_sharing'
  | 'error_notification'
  | 'performance_metrics'
  | 'system_alert';

/**
 * Message payload data
 */
export interface MessagePayload {
  data: unknown;
  metadata?: Record<string, unknown>;
  context?: MessageContext;
}

/**
 * Message context information
 */
export interface MessageContext {
  workflowId?: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  source: string;
}

/**
 * Message priority levels
 */
export enum MessagePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Social media bot error types
 */
export class SocialMediaError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform?: SocialPlatform,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SocialMediaError';
  }
}

/**
 * Coordination error for multi-agent operations
 */
export class CoordinationError extends Error {
  constructor(
    message: string,
    public agentId: string,
    public operation: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CoordinationError';
  }
}

/**
 * Agent-specific error
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public agentId: string,
    public agentType: AgentType,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentError';
  }
}
