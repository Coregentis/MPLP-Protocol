/**
 * Confirm数据传输对象
 *
 * API层的数据传输对象定义
 * 支持企业级审批工作流和跨模块集成
 * 基于完整的mplp-confirm.json Schema定义
 *
 * @version 1.0.0
 * @created 2025-08-18
 */

import { UUID } from '../../../../public/shared/types';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  RiskLevel,
  StepStatus,
  DecisionType,
  ConfirmMetadata
} from '../../types';

// 基础类型定义 - 使用types.ts中的枚举
export { ConfirmationType, ConfirmStatus, Priority, RiskLevel, StepStatus, DecisionType };

// DTO特有的类型定义
export type WorkflowType = 'sequential' | 'parallel' | 'consensus';  // 与types.ts保持一致
export type ComplianceStatus = 'passed' | 'failed' | 'pending' | 'not_applicable';
export type NotificationChannel = 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
export type EventType = 'created' | 'updated' | 'approved' | 'rejected' | 'escalated' | 'delegated' | 'cancelled' | 'expired';
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
export type AuthenticationMethod = 'none' | 'api_key' | 'oauth2' | 'certificate';
export type EvaluationMethod = 'manual' | 'automated' | 'hybrid';
export type BusType = 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
export type AlertChannel = 'email' | 'slack' | 'pagerduty' | 'webhook';

// 复合类型定义
export interface ConfirmSubjectDto {
  title: string;
  description: string;
  rationale?: string;
  impactAssessment?: string;
  riskLevel?: RiskLevel;
}

export interface RequesterDto {
  userId: string;
  name: string;
  role: string;
  department?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

export interface ApprovalStepDto {
  stepId: string;
  stepName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: StepStatus;
  decisionDeadline?: string;
  comments?: string;
  decidedAt?: string;
}

export interface EscalationLevelDto {
  level: number;
  triggerAfterHours: number;
  escalateToUserId: string;
  escalateToRole: string;
}

export interface ApprovalWorkflowDto {
  workflowType: WorkflowType;
  currentStep: number;
  totalSteps: number;
  steps: ApprovalStepDto[];
  escalationRules?: {
    enabled: boolean;
    escalationLevels: EscalationLevelDto[];
  };
}

export interface RiskFactorDto {
  factorId: string;
  factorName: string;
  riskLevel: RiskLevel;
  mitigationStrategy?: string;
}

export interface RiskAssessmentDto {
  riskFactors: RiskFactorDto[];
  overallRiskScore: number;
  riskMatrix?: {
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  };
}

export interface ComplianceCheckDto {
  checkId: string;
  checkName: string;
  status: ComplianceStatus;
  evidence?: string;
}

export interface ComplianceRequirementsDto {
  applicableRegulations: string[];
  complianceChecks: ComplianceCheckDto[];
  complianceOfficer?: {
    userId: string;
    name: string;
    certification?: string;
  };
}

export interface StakeholderDto {
  userId: string;
  name: string;
  role: string;
  notificationPreferences: NotificationChannel[];
}

export interface NotificationSettingsDto {
  enabled: boolean;
  channels: NotificationChannel[];
  stakeholders: StakeholderDto[];
  escalationNotifications?: {
    enabled: boolean;
    escalationChannels: NotificationChannel[];
  };
}

export interface AuditEventDto {
  eventId: string;
  eventType: EventType;
  timestamp: string;
  userId: string;
  userName: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface MonitoringIntegrationDto {
  enabled: boolean;
  metricsCollection: {
    performanceMetrics: boolean;
    businessMetrics: boolean;
    customMetrics: boolean;
  };
  healthChecks: {
    enabled: boolean;
    checkIntervalSeconds: number;
    failureThreshold: number;
  };
  alerting: {
    enabled: boolean;
    alertChannels: AlertChannel[];
    alertThresholds: {
      responseTimeMs: number;
      errorRatePercent: number;
    };
  };
}

export interface PerformanceMetricsDto {
  responseTimeMs?: number;
  processingTimeMs?: number;
  approvalTimeHours?: number;
  escalationCount?: number;
  revisionCount?: number;
  stakeholderCount?: number;
}

export interface VersionEntryDto {
  version: number;
  timestamp: string;
  changedBy: string;
  changeSummary: string;
  changeDetails?: Record<string, unknown>;
}

export interface VersionHistoryDto {
  currentVersion: number;
  autoVersioning: boolean;
  versionEntries: VersionEntryDto[];
}

export interface SearchMetadataDto {
  indexedFields: string[];
  searchTags: string[];
  fullTextContent: string;
  searchBoostFactor?: number;
}

export interface AIResponseDto {
  feature: string;
  response: Record<string, unknown>;
  confidenceScore?: number;
  timestamp: string;
}

export interface AIIntegrationInterfaceDto {
  enabled: boolean;
  aiProvider: AIProvider;
  modelConfiguration: {
    modelName: string;
    temperature?: number;
    maxTokens?: number;
    customParameters?: Record<string, unknown>;
  };
  aiFeatures: {
    approvalRecommendation: boolean;
    riskAnalysis: boolean;
    complianceCheck: boolean;
    stakeholderSuggestion: boolean;
  };
  aiResponses?: AIResponseDto[];
}

export interface ExternalSystemDto {
  systemId: string;
  systemName: string;
  apiEndpoint: string;
  authenticationMethod: AuthenticationMethod;
  dataMapping: Record<string, string>;
}

export interface DecisionCriterionDto {
  criterionId: string;
  criterionName: string;
  weight: number;
  evaluationMethod: EvaluationMethod;
}

export interface DecisionSupportInterfaceDto {
  enabled: boolean;
  externalSystems: ExternalSystemDto[];
  decisionCriteria: DecisionCriterionDto[];
}

export interface EventRoutingRuleDto {
  ruleId: string;
  condition: string;
  targetTopic: string;
  enabled: boolean;
}

export interface EventIntegrationDto {
  enabled: boolean;
  eventBusConnection: {
    busType: BusType;
    connectionString: string;
    topicPrefix: string;
    consumerGroup: string;
  };
  publishedEvents: string[];
  subscribedEvents: string[];
  eventRouting: {
    routingRules: EventRoutingRuleDto[];
  };
}

/**
 * 创建确认请求DTO
 */
export interface CreateConfirmRequestDto {
  contextId: UUID;
  planId?: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubjectDto;
  requester: RequesterDto;
  approvalWorkflow: ApprovalWorkflowDto;
  expiresAt?: string;
  riskAssessment?: RiskAssessmentDto;
  complianceRequirements?: ComplianceRequirementsDto;
  notificationSettings: NotificationSettingsDto;
  aiIntegrationInterface?: AIIntegrationInterfaceDto;
  decisionSupportInterface?: DecisionSupportInterfaceDto;
  eventIntegration?: EventIntegrationDto;
  metadata?: ConfirmMetadata;
}

/**
 * 更新确认状态请求DTO
 */
export interface UpdateConfirmStatusRequestDto {
  status: ConfirmStatus;
  comments?: string;
  approverId?: string;
}

/**
 * 批量更新状态请求DTO
 */
export interface BatchUpdateStatusRequestDto {
  confirmIds: UUID[];
  status: ConfirmStatus;
  comments?: string;
}

/**
 * 确认查询请求DTO
 */
export interface ConfirmQueryRequestDto {
  contextId?: UUID;
  planId?: UUID;
  confirmationType?: ConfirmationType;
  status?: ConfirmStatus;
  priority?: Priority;
  requesterUserId?: string;
  workflowType?: WorkflowType;
  riskLevel?: RiskLevel;
  createdAfter?: string;
  createdBefore?: string;
  expiresAfter?: string;
  expiresBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 完整的确认响应DTO
 */
export interface ConfirmResponseDto {
  // 核心标识字段
  protocolVersion: string;
  timestamp: string;
  confirmId: UUID;
  contextId: UUID;
  planId?: UUID;

  // 确认类型和状态
  confirmationType: ConfirmationType;
  status: ConfirmStatus;
  priority: Priority;

  // 时间字段
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;

  // 确认主题
  subject: ConfirmSubjectDto;

  // 请求者信息
  requester: RequesterDto;

  // 企业级审批工作流
  approvalWorkflow: ApprovalWorkflowDto;

  // 风险评估
  riskAssessment?: RiskAssessmentDto;

  // 合规要求
  complianceRequirements?: ComplianceRequirementsDto;

  // 通知设置
  notificationSettings: NotificationSettingsDto;

  // 审计追踪
  auditTrail: AuditEventDto[];

  // 监控集成
  monitoringIntegration: MonitoringIntegrationDto;

  // 性能指标
  performanceMetrics: PerformanceMetricsDto;

  // 版本历史
  versionHistory: VersionHistoryDto;

  // 搜索元数据
  searchMetadata: SearchMetadataDto;

  // AI集成接口
  aiIntegrationInterface: AIIntegrationInterfaceDto;

  // 决策支持接口
  decisionSupportInterface: DecisionSupportInterfaceDto;

  // 事件集成
  eventIntegration: EventIntegrationDto;
}

/**
 * 分页确认列表响应DTO
 */
export interface PaginatedConfirmResponseDto {
  items: ConfirmResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 确认统计响应DTO
 */
export interface ConfirmStatisticsResponseDto {
  total: number;
  byStatus: Record<ConfirmStatus, number>;
  byType: Record<ConfirmationType, number>;
  byPriority: Record<Priority, number>;
  byWorkflowType: Record<WorkflowType, number>;
  byRiskLevel: Record<RiskLevel, number>;
  averageApprovalTimeHours: number;
  escalationRate: number;
  complianceRate: number;
}

/**
 * 审批工作流操作DTO
 */
export interface ApprovalActionDto {
  confirmId: UUID;
  stepId: string;
  action: 'approve' | 'reject' | 'delegate' | 'escalate';
  comments?: string;
  delegateToUserId?: string;
  escalateToUserId?: string;
}

/**
 * 批量审批操作DTO
 */
export interface BatchApprovalActionDto {
  confirmIds: UUID[];
  action: 'approve' | 'reject' | 'escalate';
  comments?: string;
  escalateToUserId?: string;
}

/**
 * AI推荐请求DTO
 */
export interface AIRecommendationRequestDto {
  confirmId: UUID;
  features: ('approval_recommendation' | 'risk_analysis' | 'compliance_check' | 'stakeholder_suggestion')[];
  contextData?: Record<string, unknown>;
}

/**
 * AI推荐响应DTO
 */
export interface AIRecommendationResponseDto {
  confirmId: UUID;
  recommendations: {
    feature: string;
    recommendation: Record<string, unknown>;
    confidenceScore: number;
    reasoning: string;
  }[];
  timestamp: string;
}

/**
 * 风险评估请求DTO
 */
export interface RiskAssessmentRequestDto {
  confirmId: UUID;
  additionalFactors?: RiskFactorDto[];
  contextData?: Record<string, unknown>;
}

/**
 * 合规检查请求DTO
 */
export interface ComplianceCheckRequestDto {
  confirmId: UUID;
  regulations: string[];
  additionalChecks?: ComplianceCheckDto[];
}

/**
 * 事件发布请求DTO
 */
export interface EventPublishRequestDto {
  confirmId: UUID;
  eventType: string;
  eventData: Record<string, unknown>;
  targetTopics?: string[];
}

/**
 * 性能指标查询DTO
 */
export interface PerformanceMetricsQueryDto {
  confirmIds?: UUID[];
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'day' | 'week' | 'month';
  metrics?: ('response_time' | 'approval_time' | 'escalation_count' | 'revision_count')[];
}

/**
 * 审计日志查询DTO
 */
export interface AuditLogQueryDto {
  confirmId?: UUID;
  userId?: string;
  eventType?: EventType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * API响应包装器
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  warnings?: string[];
  timestamp: string;
  requestId?: string;
}

/**
 * 错误响应DTO
 */
export interface ErrorResponseDto {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
  requestId?: string;
  stackTrace?: string;
}

/**
 * 健康检查响应DTO
 */
export interface HealthCheckResponseDto {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'up' | 'down';
    eventBus: 'up' | 'down';
    aiIntegration: 'up' | 'down';
    externalSystems: Record<string, 'up' | 'down'>;
  };
  metrics: {
    activeConfirmations: number;
    pendingApprovals: number;
    averageResponseTime: number;
    errorRate: number;
  };
}
