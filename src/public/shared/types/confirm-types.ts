/**
 * MPLP Confirm Types - Confirm模块类型定义
 * 
 * 提供Confirm模块相关的类型定义
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

import { UUID, Timestamp } from './index';

// ===== Confirm基础类型 =====

/**
 * 确认类型枚举
 */
export type ConfirmationType = 
  | 'approval'      // 审批确认
  | 'verification'  // 验证确认
  | 'acknowledgment' // 确认收到
  | 'authorization' // 授权确认
  | 'validation'    // 验证确认
  | 'review';       // 审查确认

/**
 * 确认状态枚举
 */
export type ConfirmationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'delegated';

/**
 * 确认优先级枚举
 */
export type ConfirmationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 确认结果枚举
 */
export type ConfirmationResult = 'approved' | 'rejected' | 'conditional' | 'deferred';

/**
 * 审批者类型枚举
 */
export type ApproverType = 'user' | 'role' | 'group' | 'system' | 'external';

/**
 * 通知类型枚举
 */
export type NotificationType = 'email' | 'sms' | 'push' | 'webhook' | 'internal';

/**
 * 升级策略枚举
 */
export type EscalationStrategy = 'time_based' | 'role_based' | 'priority_based' | 'custom';

// ===== Confirm接口定义 =====

/**
 * Confirmation创建请求
 */
export interface CreateConfirmationRequest {
  contextId: UUID;
  confirmationType: ConfirmationType;
  title: string;
  description?: string;
  priority: ConfirmationPriority;
  required_approvers: ApproverData[];
  deadline?: Timestamp;
  auto_approve_conditions?: Record<string, unknown>;
  escalationRules?: EscalationRuleData[];
  notificationSettings?: NotificationSettingsData;
  metadata?: Record<string, unknown>;
}

/**
 * Confirmation更新请求
 */
export interface UpdateConfirmationRequest {
  title?: string;
  description?: string;
  priority?: ConfirmationPriority;
  deadline?: Timestamp;
  status?: ConfirmationStatus;
  metadata?: Record<string, unknown>;
}

/**
 * 确认响应请求
 */
export interface ConfirmationResponseRequest {
  confirmation_id: UUID;
  approver_id: UUID;
  result: ConfirmationResult;
  comments?: string;
  conditions?: string[];
  attachments?: AttachmentData[];
  metadata?: Record<string, unknown>;
}

/**
 * Confirmation查询参数
 */
export interface ConfirmationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  confirmationType?: ConfirmationType;
  status?: ConfirmationStatus;
  priority?: ConfirmationPriority;
  contextId?: UUID;
  approver_id?: UUID;
  created_after?: Timestamp;
  created_before?: Timestamp;
  deadline_after?: Timestamp;
  deadline_before?: Timestamp;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Confirmation数据接口
 */
export interface ConfirmationData {
  confirmation_id: UUID;
  contextId: UUID;
  confirmationType: ConfirmationType;
  title: string;
  description?: string;
  status: ConfirmationStatus;
  priority: ConfirmationPriority;
  created_by: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deadline?: Timestamp;
  completedAt?: Timestamp;
  required_approvers: ApproverData[];
  responses: ConfirmationResponseData[];
  auto_approve_conditions?: Record<string, unknown>;
  escalationRules?: EscalationRuleData[];
  notificationSettings?: NotificationSettingsData;
  metadata?: Record<string, unknown>;
}

/**
 * 审批者数据接口
 */
export interface ApproverData {
  approver_id: UUID;
  approver_type: ApproverType;
  name: string;
  email?: string;
  role?: string;
  is_required: boolean;
  order?: number;
  delegation_allowed: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * 确认响应数据接口
 */
export interface ConfirmationResponseData {
  response_id: UUID;
  confirmation_id: UUID;
  approver_id: UUID;
  result: ConfirmationResult;
  comments?: string;
  conditions?: string[];
  attachments?: AttachmentData[];
  responded_at: Timestamp;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 附件数据接口
 */
export interface AttachmentData {
  attachment_id: UUID;
  filename: string;
  content_type: string;
  size_bytes: number;
  url?: string;
  checksum?: string;
  uploaded_at: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 升级规则数据接口
 */
export interface EscalationRuleData {
  rule_id: UUID;
  strategy: EscalationStrategy;
  trigger_conditions: {
    time_delay_hours?: number;
    no_response_count?: number;
    priority_threshold?: ConfirmationPriority;
  };
  escalation_actions: {
    notify_users?: UUID[];
    notify_roles?: string[];
    change_priority?: ConfirmationPriority;
    add_approvers?: ApproverData[];
    auto_approve?: boolean;
  };
  max_escalations?: number;
  metadata?: Record<string, unknown>;
}

/**
 * 通知设置数据接口
 */
export interface NotificationSettingsData {
  enabled: boolean;
  notification_types: NotificationType[];
  reminder_intervals_hours?: number[];
  custom_templates?: {
    subject_template?: string;
    body_template?: string;
  };
  webhook_urls?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * 确认统计数据接口
 */
export interface ConfirmationStatistics {
  total_confirmations: number;
  pending_confirmations: number;
  approved_confirmations: number;
  rejected_confirmations: number;
  expired_confirmations: number;
  average_response_time_hours: number;
  confirmations_by_type: Record<ConfirmationType, number>;
  confirmations_by_priority: Record<ConfirmationPriority, number>;
  approval_rate: number;
  escalation_rate: number;
}

/**
 * 确认摘要数据接口
 */
export interface ConfirmationSummary {
  confirmation_id: UUID;
  title: string;
  confirmationType: ConfirmationType;
  status: ConfirmationStatus;
  priority: ConfirmationPriority;
  createdAt: Timestamp;
  deadline?: Timestamp;
  required_approvers_count: number;
  completed_approvers_count: number;
  pending_approvers_count: number;
}

/**
 * 确认详情数据接口
 */
export interface ConfirmationDetails extends ConfirmationData {
  auditTrail: {
    event_id: UUID;
    event_type: string;
    timestamp: Timestamp;
    userId?: UUID;
    details: Record<string, unknown>;
  }[];
  related_confirmations?: UUID[];
  dependencies?: UUID[];
}

/**
 * 批量确认请求
 */
export interface BulkConfirmationRequest {
  confirmation_ids: UUID[];
  approver_id: UUID;
  result: ConfirmationResult;
  comments?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 批量确认结果
 */
export interface BulkConfirmationResult {
  successful_confirmations: UUID[];
  failed_confirmations: {
    confirmation_id: UUID;
    error: string;
  }[];
  total_processed: number;
  total_successful: number;
  total_failed: number;
}
