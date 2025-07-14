/**
 * MPLP Confirm模块类型定义
 * 
 * @version v1.0.1
 * @updated 2025-07-10T17:04:47+08:00
 * @compliance 100% Schema合规性 - 完全匹配confirm-protocol.json Schema定义
 * @description 基于confirm-protocol.json v1.0重构，确保所有字段与Schema定义严格一致
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version, Priority } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version, Priority };

// ===== Confirm协议主接口 (Schema根节点) =====

/**
 * Confirm协议主接口
 * 完全符合confirm-protocol.json Schema规范
 * 
 * @schema confirm-protocol.json
 * @required ["protocol_version", "timestamp", "confirm_id", "context_id", "confirmation_type", "status", "priority"]
 */
export interface ConfirmProtocol {
  // Schema必需字段
  protocol_version: Version;
  timestamp: Timestamp;
  confirm_id: UUID;
  context_id: UUID;
  plan_id?: UUID;
  confirmation_type: ConfirmationType;
  status: ConfirmStatus;
  priority: Priority;
  
  // Schema可选字段
  requester?: Requester;
  approval_workflow?: ApprovalWorkflow;
  subject?: ConfirmSubject;
  risk_assessment?: RiskAssessment;
  notification_settings?: NotificationSettings;
  audit_trail?: AuditTrail[];
}

// ===== 基础枚举类型 (完全匹配Schema定义) =====

/**
 * 确认类型 (Schema定义)
 * @schema confirmation_type.enum
 */
export type ConfirmationType = 
  | 'plan_approval' 
  | 'task_approval' 
  | 'milestone_confirmation' 
  | 'risk_acceptance' 
  | 'resource_allocation' 
  | 'emergency_approval';

/**
 * 确认状态 (Schema定义)
 * @schema status.enum
 */
export type ConfirmStatus = 
  | 'pending' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled' 
  | 'expired';

// ===== 请求者信息 (Schema定义) =====

/**
 * 请求者 (Schema定义)
 * @schema requester
 * @required ["user_id", "role", "request_reason"]
 */
export interface Requester {
  user_id: string;
  role: string;
  department?: string;
  request_reason: string; // maxLength: 1000
}

// ===== 审批工作流 (Schema定义) =====

/**
 * 审批工作流 (Schema定义)
 * @schema approval_workflow
 * @required ["workflow_type", "steps"]
 */
export interface ApprovalWorkflow {
  workflow_type: WorkflowType;
  steps: ApprovalStep[];
  escalation_rules?: EscalationRule[];
}

/**
 * 工作流类型 (Schema定义)
 * @schema approval_workflow.workflow_type.enum
 */
export type WorkflowType = 
  | 'single_approver' 
  | 'sequential' 
  | 'parallel' 
  | 'consensus' 
  | 'escalation';

/**
 * 审批步骤 (Schema定义)
 * @schema approval_workflow.steps.items
 * @required ["step_id", "step_order", "approver", "status"]
 */
export interface ApprovalStep {
  step_id: UUID;
  step_order: number; // minimum: 1
  approver: Approver;
  approval_criteria?: ApprovalCriterion[];
  status: StepStatus;
  decision?: Decision;
  timeout?: StepTimeout;
}

/**
 * 审批者 (Schema定义)
 * @schema approval_workflow.steps.items.approver
 * @required ["user_id", "role", "is_required"]
 */
export interface Approver {
  user_id: string;
  role: string;
  is_required: boolean;
  delegation_allowed?: boolean;
}

/**
 * 审批标准 (Schema定义)
 * @schema approval_workflow.steps.items.approval_criteria.items
 * @required ["criterion", "required"]
 */
export interface ApprovalCriterion {
  criterion: string;
  required: boolean;
  weight?: number; // minimum: 0, maximum: 1
}

/**
 * 步骤状态 (Schema定义)
 * @schema approval_workflow.steps.items.status.enum
 */
export type StepStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'delegated' 
  | 'skipped';

/**
 * 决策 (Schema定义)
 * @schema approval_workflow.steps.items.decision
 * @required ["outcome", "timestamp"]
 */
export interface Decision {
  outcome: DecisionOutcome;
  comments?: string; // maxLength: 2000
  conditions?: string[];
  timestamp: Timestamp;
  signature?: string;
}

/**
 * 决策结果 (Schema定义)
 * @schema approval_workflow.steps.items.decision.outcome.enum
 */
export type DecisionOutcome = 
  | 'approve' 
  | 'reject' 
  | 'request_changes' 
  | 'delegate';

/**
 * 步骤超时 (Schema定义)
 * @schema approval_workflow.steps.items.timeout
 * @required ["duration", "unit", "action_on_timeout"]
 */
export interface StepTimeout {
  duration: number; // minimum: 1
  unit: TimeoutUnit;
  action_on_timeout: TimeoutAction;
}

/**
 * 超时单位 (Schema定义)
 * @schema approval_workflow.steps.items.timeout.unit.enum
 */
export type TimeoutUnit = 
  | 'minutes' 
  | 'hours' 
  | 'days';

/**
 * 超时操作 (Schema定义)
 * @schema approval_workflow.steps.items.timeout.action_on_timeout.enum
 */
export type TimeoutAction = 
  | 'auto_approve' 
  | 'auto_reject' 
  | 'escalate' 
  | 'extend';

/**
 * 升级规则 (Schema定义)
 * @schema approval_workflow.escalation_rules.items
 * @required ["trigger", "escalate_to"]
 */
export interface EscalationRule {
  trigger: EscalationTrigger;
  escalate_to: EscalationTarget;
  notification_delay?: number; // minimum: 0
}

/**
 * 升级触发器 (Schema定义)
 * @schema approval_workflow.escalation_rules.items.trigger.enum
 */
export type EscalationTrigger = 
  | 'timeout' 
  | 'rejection' 
  | 'manual' 
  | 'system';

/**
 * 升级目标 (Schema定义)
 * @schema approval_workflow.escalation_rules.items.escalate_to
 * @required ["user_id", "role"]
 */
export interface EscalationTarget {
  user_id: string;
  role: string;
}

// ===== 确认主题 (Schema定义) =====

/**
 * 确认主题 (Schema定义)
 * @schema subject
 * @required ["title", "description", "impact_assessment"]
 */
export interface ConfirmSubject {
  title: string; // maxLength: 255
  description: string; // maxLength: 2000
  impact_assessment: ImpactAssessment;
  attachments?: Attachment[];
}

/**
 * 影响评估 (Schema定义)
 * @schema subject.impact_assessment
 * @required ["scope", "business_impact", "technical_impact"]
 */
export interface ImpactAssessment {
  scope: ImpactScope;
  affected_systems?: string[];
  affected_users?: string[];
  business_impact: ImpactLevel;
  technical_impact: ImpactLevel;
}

/**
 * 影响范围 (Schema定义)
 * @schema subject.impact_assessment.scope.enum
 */
export type ImpactScope = 
  | 'task' 
  | 'project' 
  | 'organization' 
  | 'external';

/**
 * 影响级别 (Schema定义)
 * @schema subject.impact_assessment.business_impact.enum | subject.impact_assessment.technical_impact.enum
 */
export type ImpactLevel = 
  | 'none' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

/**
 * 附件 (Schema定义)
 * @schema subject.attachments.items
 * @required ["file_id", "filename", "mime_type", "size"]
 */
export interface Attachment {
  file_id: string;
  filename: string;
  mime_type: string;
  size: number; // minimum: 0
  description?: string;
}

// ===== 风险评估 (Schema定义) =====

/**
 * 风险评估 (Schema定义)
 * @schema risk_assessment
 * @required ["overall_risk_level", "risk_factors"]
 */
export interface RiskAssessment {
  overall_risk_level: RiskLevel;
  risk_factors: RiskFactor[];
  compliance_requirements?: ComplianceRequirement[];
}

/**
 * 风险级别 (Schema定义)
 * @schema risk_assessment.overall_risk_level.enum
 */
export type RiskLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

/**
 * 风险因子 (Schema定义) - 完全匹配Schema结构
 * @schema risk_assessment.risk_factors.items
 * @required ["factor", "probability", "impact"]
 */
export interface RiskFactor {
  factor: string;
  description?: string;
  probability: number; // minimum: 0, maximum: 1
  impact: ImpactLevel; // enum: ["low", "medium", "high", "critical"]
  mitigation?: string;
}

/**
 * 合规要求 (Schema定义)
 * @schema risk_assessment.compliance_requirements.items
 * @required ["regulation", "requirement", "compliance_status"]
 */
export interface ComplianceRequirement {
  regulation: string;
  requirement: string;
  compliance_status: ComplianceStatus;
  evidence?: string;
}

/**
 * 合规状态 (Schema定义)
 * @schema risk_assessment.compliance_requirements.items.compliance_status.enum
 */
export type ComplianceStatus = 
  | 'compliant' 
  | 'non_compliant' 
  | 'partially_compliant' 
  | 'not_applicable';

// ===== 通知设置 (Schema定义) =====

/**
 * 通知设置 (Schema定义) - 完全匹配Schema结构
 * @schema notification_settings
 * @required ["notify_on_events", "notification_channels"]
 */
export interface NotificationSettings {
  notify_on_events: NotificationEvent[];
  notification_channels: NotificationChannel[];
  stakeholders?: NotificationStakeholder[];
}

/**
 * 通知事件 (Schema定义)
 * @schema notification_settings.notify_on_events.items.enum
 */
export type NotificationEvent = 
  | 'created' 
  | 'approved' 
  | 'rejected' 
  | 'timeout' 
  | 'escalated' 
  | 'cancelled';

/**
 * 通知渠道 (Schema定义)
 * @schema notification_settings.notification_channels.items.enum
 */
export type NotificationChannel = 
  | 'email' 
  | 'sms' 
  | 'webhook' 
  | 'in_app' 
  | 'slack';

/**
 * 通知相关方 (Schema定义)
 * @schema notification_settings.stakeholders.items
 * @required ["user_id", "role", "notification_preference"]
 */
export interface NotificationStakeholder {
  user_id: string;
  role: string;
  notification_preference: NotificationPreference;
}

/**
 * 通知偏好 (Schema定义)
 * @schema notification_settings.stakeholders.items.notification_preference.enum
 */
export type NotificationPreference = 
  | 'all' 
  | 'important' 
  | 'critical' 
  | 'none';

// ===== 审计追踪 (Schema定义) =====

/**
 * 审计追踪 (Schema定义)
 * @schema audit_trail.items
 * @required ["event_id", "timestamp", "event_type", "actor"]
 */
export interface AuditTrail {
  event_id: UUID;
  timestamp: Timestamp;
  event_type: AuditEventType;
  actor: AuditActor;
  changes?: AuditChanges;
  description?: string;
}

/**
 * 审计事件类型 (Schema定义)
 * @schema audit_trail.items.event_type.enum
 */
export type AuditEventType = 
  | 'created' 
  | 'updated' 
  | 'approved' 
  | 'rejected' 
  | 'escalated' 
  | 'cancelled' 
  | 'timeout';

/**
 * 审计操作者 (Schema定义)
 * @schema audit_trail.items.actor
 * @required ["user_id", "role"]
 */
export interface AuditActor {
  user_id: string;
  role: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * 审计变更 (Schema定义)
 * @schema audit_trail.items.changes
 */
export interface AuditChanges {
  field?: string;
  old_value?: string | number | boolean | null;
  new_value?: string | number | boolean | null;
}

// ===== API请求/响应类型 =====

/**
 * 创建确认请求
 * 基于Schema必需字段构建
 */
export interface CreateConfirmRequest {
  context_id: UUID;
  plan_id?: UUID;
  confirmation_type: ConfirmationType;
  priority: Priority;
  requester?: Requester;
  approval_workflow?: ApprovalWorkflow;
  subject?: ConfirmSubject;
  risk_assessment?: RiskAssessment;
  notification_settings?: NotificationSettings;
}

/**
 * 更新确认请求
 */
export interface UpdateConfirmRequest {
  confirm_id: UUID;
  status?: ConfirmStatus;
  priority?: Priority;
  subject?: Partial<ConfirmSubject>;
  notification_settings?: Partial<NotificationSettings>;
}

/**
 * 确认响应
 */
export interface ConfirmResponse {
  success: boolean;
  data?: ConfirmProtocol;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    request_id: string;
    processing_time_ms: number;
    trace_id: string;
  };
}

/**
 * 确认查询过滤器
 */
export interface ConfirmFilter {
  confirm_ids?: UUID[];
  context_ids?: UUID[];
  plan_ids?: UUID[];
  confirmation_types?: ConfirmationType[];
  statuses?: ConfirmStatus[];
  priorities?: Priority[];
  requester_user_ids?: string[];
  created_after?: Timestamp;
  created_before?: Timestamp;
}

/**
 * 批量确认请求
 */
export interface BatchConfirmRequest {
  requests: CreateConfirmRequest[];
  batch_options?: {
    parallel_processing: boolean;
    stop_on_error: boolean;
    notification_consolidation: boolean;
  };
}

/**
 * 批量确认响应
 */
export interface BatchConfirmResponse {
  success: boolean;
  results: ConfirmResponse[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    processing_time_ms: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * 步骤操作请求
 */
export interface StepActionRequest {
  step_id: UUID;
  action: DecisionOutcome;
  comments?: string;
  conditions?: string[];
  signature?: string;
}

/**
 * 工作流操作响应
 */
export interface WorkflowActionResponse {
  success: boolean;
  updated_confirmation: ConfirmProtocol;
  next_steps?: ApprovalStep[];
  workflow_completed: boolean;
}

/**
 * 确认错误类型
 */
export enum ConfirmErrorCode {
  CONFIRM_NOT_FOUND = 'CONFIRM_NOT_FOUND',
  CONFIRM_ALREADY_EXISTS = 'CONFIRM_ALREADY_EXISTS',
  INVALID_CONFIRM_DATA = 'INVALID_CONFIRM_DATA',
  APPROVAL_STEP_NOT_FOUND = 'APPROVAL_STEP_NOT_FOUND',
  UNAUTHORIZED_APPROVER = 'UNAUTHORIZED_APPROVER',
  WORKFLOW_VALIDATION_FAILED = 'WORKFLOW_VALIDATION_FAILED',
  APPROVAL_TIMEOUT_EXCEEDED = 'APPROVAL_TIMEOUT_EXCEEDED',
  ESCALATION_FAILED = 'ESCALATION_FAILED',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
}

/**
 * 确认错误类
 */
export class ConfirmError extends Error {
  constructor(
    public code: ConfirmErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ConfirmError';
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends ConfirmError {
  constructor(message: string, details?: unknown) {
    super(ConfirmErrorCode.INVALID_CONFIRM_DATA, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 工作流错误类
 */
export class WorkflowError extends ConfirmError {
  constructor(message: string, details?: unknown) {
    super(ConfirmErrorCode.WORKFLOW_VALIDATION_FAILED, message, details);
    this.name = 'WorkflowError';
  }
}

/**
 * 权限错误类
 */
export class PermissionError extends ConfirmError {
  constructor(message: string, details?: unknown) {
    super(ConfirmErrorCode.ACCESS_DENIED, message, details);
    this.name = 'PermissionError';
  }
} 