/**
 * Confirm模块类型定义
 *
 * 基于MPLP Confirm Schema的TypeScript类型定义
 * Schema层使用snake_case，Application层使用camelCase
 *
 * 功能：确认流程和决策管理
 * - 多级审批工作流管理
 * - 审批流程编排和执行
 * - 决策记录和历史追踪
 * - 超时和升级处理机制
 * - 确认结果通知和状态同步
 *
 * @version 1.0.0
 * @created 2025-08-08
 */

import { UUID, Timestamp, Version } from '../../public/shared/types';

// 重新导出基础类型，供其他文件使用
export { UUID, Timestamp, Version };

// ===== 基础枚举类型 =====

/**
 * 确认类型
 * 对应Schema: confirmation_type
 */
export enum ConfirmationType {
  PLAN_APPROVAL = 'plan_approval',
  TASK_APPROVAL = 'task_approval',
  MILESTONE_CONFIRMATION = 'milestone_confirmation',
  RISK_ACCEPTANCE = 'risk_acceptance',
  RESOURCE_ALLOCATION = 'resource_allocation',
  EMERGENCY_APPROVAL = 'emergency_approval'
}

/**
 * 确认状态
 * 对应Schema: status
 */
export enum ConfirmStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

/**
 * 审批决策类型
 * 对应Schema: decision.type
 */
export enum DecisionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  DELEGATE = 'delegate',
  ESCALATE = 'escalate'
}

/**
 * 审批级别
 * 对应Schema: approval_workflow.levels
 */
export enum ApprovalLevel {
  L1 = 1,
  L2 = 2,
  L3 = 3,
  L4 = 4,
  L5 = 5
}

/**
 * 步骤状态
 * 对应Schema: steps[].status
 */
export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  TIMEOUT = 'timeout',
  SKIPPED = 'skipped'
}

/**
 * 风险级别
 * 对应Schema: risk_level
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 优先级
 * 对应Schema: priority
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ===== 核心协议接口 =====

/**
 * MPLP Confirm协议接口
 * 对应Schema: mplp-confirm.json根对象
 *
 * 功能：定义完整的确认结构，支持多级审批工作流
 */
export interface ConfirmProtocol {
  /**
   * MPLP协议版本
   * 对应Schema: protocol_version
   */
  protocolVersion: Version;

  /**
   * 协议消息时间戳
   * 对应Schema: timestamp
   */
  timestamp: Timestamp;

  /**
   * 确认唯一标识符
   * 对应Schema: confirm_id
   */
  confirmId: UUID;

  /**
   * 关联的上下文ID
   * 对应Schema: context_id
   */
  contextId: UUID;

  /**
   * 关联的计划ID（可选）
   * 对应Schema: plan_id
   */
  planId?: UUID;

  /**
   * 确认类型
   * 对应Schema: confirmation_type
   */
  confirmationType: ConfirmationType;

  /**
   * 确认状态
   * 对应Schema: status
   */
  status: ConfirmStatus;

  /**
   * 优先级
   * 对应Schema: priority
   */
  priority: Priority;

  /**
   * 确认主题
   * 对应Schema: subject
   */
  subject: ConfirmSubject;

  /**
   * 请求者信息
   * 对应Schema: requester
   */
  requester: Requester;

  /**
   * 审批工作流
   * 对应Schema: approval_workflow
   */
  approvalWorkflow: ApprovalWorkflow;

  /**
   * 决策信息（可选）
   * 对应Schema: decision
   */
  decision?: ConfirmDecision;

  /**
   * 创建时间
   * 对应Schema: created_at
   */
  createdAt: Timestamp;

  /**
   * 更新时间
   * 对应Schema: updated_at
   */
  updatedAt: Timestamp;

  /**
   * 过期时间（可选）
   * 对应Schema: expires_at
   */
  expiresAt?: Timestamp;

  /**
   * 元数据（可选）
   * 对应Schema: metadata
   */
  metadata?: ConfirmMetadata;
}

// ===== 支持接口 =====

/**
 * 确认主题
 * 对应Schema: subject
 */
export interface ConfirmSubject {
  /**
   * 标题
   * 对应Schema: subject.title
   */
  title: string;

  /**
   * 描述
   * 对应Schema: subject.description
   */
  description: string;

  /**
   * 影响评估
   * 对应Schema: subject.impact_assessment
   */
  impactAssessment: ImpactAssessment;

  /**
   * 附件（可选）
   * 对应Schema: subject.attachments
   */
  attachments?: Attachment[];
}

/**
 * 请求者信息
 * 对应Schema: requester
 */
export interface Requester {
  /**
   * 用户ID
   * 对应Schema: requester.user_id
   */
  userId: string;

  /**
   * 用户名
   * 对应Schema: requester.name
   */
  name: string;

  /**
   * 角色
   * 对应Schema: requester.role
   */
  role: string;

  /**
   * 邮箱
   * 对应Schema: requester.email
   */
  email: string;

  /**
   * 部门（可选）
   * 对应Schema: requester.department
   */
  department?: string;

  /**
   * 请求原因（可选）
   * 对应Schema: requester.request_reason
   */
  requestReason?: string;
}

/**
 * 审批工作流
 * 对应Schema: approval_workflow
 */
export interface ApprovalWorkflow {
  /**
   * 工作流ID（可选）
   * 对应Schema: approval_workflow.workflow_id
   */
  workflowId?: string;

  /**
   * 工作流名称（可选）
   * 对应Schema: approval_workflow.name
   */
  name?: string;

  /**
   * 工作流类型（可选）
   * 对应Schema: approval_workflow.workflow_type
   */
  workflowType?: 'sequential' | 'parallel' | 'consensus';

  /**
   * 审批步骤
   * 对应Schema: approval_workflow.steps
   */
  steps: ApprovalStep[];

  /**
   * 是否需要所有审批者同意（可选）
   * 对应Schema: approval_workflow.require_all_approvers
   */
  requireAllApprovers?: boolean;

  /**
   * 是否允许委托（可选）
   * 对应Schema: approval_workflow.allow_delegation
   */
  allowDelegation?: boolean;

  /**
   * 超时配置（可选）
   * 对应Schema: approval_workflow.timeout_config
   */
  timeoutConfig?: TimeoutConfig;

  /**
   * 自动审批规则（可选）
   * 对应Schema: approval_workflow.auto_approval_rules
   */
  autoApprovalRules?: {
    enabled: boolean;
    conditions?: string[];
  };
}

/**
 * 审批步骤
 * 对应Schema: approval_workflow.steps[]
 */
export interface ApprovalStep {
  /**
   * 步骤ID
   * 对应Schema: steps[].step_id
   */
  stepId: string;

  /**
   * 步骤名称
   * 对应Schema: steps[].name
   */
  name: string;

  /**
   * 步骤顺序
   * 对应Schema: steps[].step_order
   */
  stepOrder?: number;

  /**
   * 审批级别（可选）
   * 对应Schema: steps[].level
   */
  level?: ApprovalLevel;

  /**
   * 审批者列表
   * 对应Schema: steps[].approvers
   */
  approvers?: Approver[];

  /**
   * 审批者角色（可选）
   * 对应Schema: steps[].approver_role
   */
  approverRole?: string;

  /**
   * 所需审批数量（可选）
   * 对应Schema: steps[].required_approvals
   */
  requiredApprovals?: number;

  /**
   * 超时分钟数（可选）
   * 对应Schema: steps[].timeout_minutes
   */
  timeoutMinutes?: number;

  /**
   * 超时小时数（可选）
   * 对应Schema: steps[].timeout_hours
   */
  timeoutHours?: number;

  /**
   * 是否必需（可选）
   * 对应Schema: steps[].is_required
   */
  isRequired?: boolean;

  /**
   * 是否自动升级（可选）
   * 对应Schema: steps[].auto_escalate
   */
  autoEscalate?: boolean;

  /**
   * 升级规则（可选）
   * 对应Schema: steps[].escalation_rules
   */
  escalationRules?: {
    enabled: boolean;
    escalationTimeoutHours: number;
    escalationTarget: string;
  };

  /**
   * 步骤状态
   * 对应Schema: steps[].status
   */
  status: StepStatus;

  /**
   * 开始时间（可选）
   * 对应Schema: steps[].started_at
   */
  startedAt?: Timestamp;

  /**
   * 完成时间（可选）
   * 对应Schema: steps[].completed_at
   */
  completedAt?: Timestamp;
}

/**
 * 审批者信息
 * 对应Schema: approvers[]
 */
export interface Approver {
  /**
   * 审批者ID
   * 对应Schema: approvers[].approver_id
   */
  approverId: string;

  /**
   * 审批者姓名
   * 对应Schema: approvers[].name
   */
  name: string;

  /**
   * 角色
   * 对应Schema: approvers[].role
   */
  role: string;

  /**
   * 邮箱
   * 对应Schema: approvers[].email
   */
  email: string;

  /**
   * 优先级
   * 对应Schema: approvers[].priority
   */
  priority: number;

  /**
   * 是否激活
   * 对应Schema: approvers[].is_active
   */
  isActive: boolean;
}

/**
 * 超时配置
 * 对应Schema: timeout_config
 */
export interface TimeoutConfig {
  /**
   * 默认超时分钟数
   * 对应Schema: timeout_config.default_timeout_minutes
   */
  defaultTimeoutMinutes: number;

  /**
   * 警告分钟数
   * 对应Schema: timeout_config.warning_minutes
   */
  warningMinutes: number;

  /**
   * 最大超时分钟数
   * 对应Schema: timeout_config.max_timeout_minutes
   */
  maxTimeoutMinutes: number;

  /**
   * 是否自动拒绝
   * 对应Schema: timeout_config.auto_reject
   */
  autoReject: boolean;

  /**
   * 超时时是否升级
   * 对应Schema: timeout_config.escalate_on_timeout
   */
  escalateOnTimeout: boolean;
}

/**
 * 确认决策
 * 对应Schema: decision
 */
export interface ConfirmDecision {
  /**
   * 决策ID
   * 对应Schema: decision.decision_id
   */
  decisionId: string;

  /**
   * 决策类型
   * 对应Schema: decision.type
   */
  type: DecisionType;

  /**
   * 决策者ID
   * 对应Schema: decision.approver_id
   */
  approverId: string;

  /**
   * 决策时间
   * 对应Schema: decision.timestamp
   */
  timestamp: Timestamp;

  /**
   * 决策评论（可选）
   * 对应Schema: decision.comment
   */
  comment?: string;

  /**
   * 附件（可选）
   * 对应Schema: decision.attachments
   */
  attachments?: string[];

  /**
   * 委托给（可选）
   * 对应Schema: decision.delegated_to
   */
  delegatedTo?: string;
}

/**
 * 影响评估
 * 对应Schema: impact_assessment
 */
export interface ImpactAssessment {
  /**
   * 业务影响
   * 对应Schema: impact_assessment.business_impact
   */
  businessImpact: string;

  /**
   * 技术影响
   * 对应Schema: impact_assessment.technical_impact
   */
  technicalImpact: string;

  /**
   * 风险级别
   * 对应Schema: impact_assessment.risk_level
   */
  riskLevel: RiskLevel;

  /**
   * 影响范围
   * 对应Schema: impact_assessment.impact_scope
   */
  impactScope: string[];

  /**
   * 预估成本（可选）
   * 对应Schema: impact_assessment.estimated_cost
   */
  estimatedCost?: number;
}

/**
 * 附件信息
 * 对应Schema: attachments[]
 */
export interface Attachment {
  /**
   * 附件名称
   * 对应Schema: attachments[].name
   */
  name: string;

  /**
   * 附件URL
   * 对应Schema: attachments[].url
   */
  url: string;

  /**
   * 附件类型
   * 对应Schema: attachments[].type
   */
  type: string;

  /**
   * 附件大小（可选）
   * 对应Schema: attachments[].size
   */
  size?: number;
}

/**
 * 确认元数据
 * 对应Schema: metadata
 */
export interface ConfirmMetadata {
  /**
   * 来源（可选）
   * 对应Schema: metadata.source
   */
  source?: string;

  /**
   * 标签（可选）
   * 对应Schema: metadata.tags
   */
  tags?: string[];

  /**
   * 自定义字段（可选）
   * 对应Schema: metadata.custom_fields
   */
  customFields?: Record<string, unknown>;

  /**
   * 附件（可选）
   * 对应Schema: metadata.attachments
   */
  attachments?: Attachment[];
}

// ===== 错误处理类型 =====

/**
 * 确认错误代码
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
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED'
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
    Object.setPrototypeOf(this, ConfirmError.prototype);
  }
}

// ===== 查询和过滤类型 =====

/**
 * 确认过滤条件
 * Application层使用camelCase
 */
export interface ConfirmFilter {
  /**
   * 上下文ID过滤
   */
  contextId?: UUID;

  /**
   * 计划ID过滤
   */
  planId?: UUID;

  /**
   * 确认类型过滤
   */
  confirmationType?: ConfirmationType;

  /**
   * 状态过滤
   */
  status?: ConfirmStatus;

  /**
   * 优先级过滤
   */
  priority?: Priority;

  /**
   * 请求者ID过滤
   */
  requesterId?: string;

  /**
   * 创建时间范围过滤
   */
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;

  /**
   * 过期时间范围过滤
   */
  expiresAfter?: Timestamp;
  expiresBefore?: Timestamp;
}

/**
 * 分页选项
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
