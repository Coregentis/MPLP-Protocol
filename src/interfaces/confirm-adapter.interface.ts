/**
 * 确认适配器接口 - 厂商中立设计
 * 
 * 定义了MPLP与外部确认系统集成的标准接口。
 * 所有确认适配器实现必须遵循此接口。
 * 
 * @version v1.0.0
 * @created 2025-07-15T10:30:00+08:00
 * @compliance confirm-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { 
  ConfirmProtocol, 
  ConfirmationType, 
  ConfirmStatus, 
  Priority,
  ConfirmFilter,
  ConfirmResponse
} from '../modules/confirm/types';

/**
 * 确认健康状态接口
 */
export interface ConfirmAdapterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  last_check_timestamp: string;
  details?: Record<string, unknown>;
  error_message?: string;
}

/**
 * 确认决策结果接口
 */
export interface ConfirmDecisionResult {
  confirm_id: string;
  decision: 'approve' | 'reject' | 'request_changes' | 'delegate';
  decision_maker: {
    user_id: string;
    role: string;
    timestamp: string;
  };
  comments?: string;
  conditions?: string[];
  attachments?: Array<{
    file_id: string;
    filename: string;
    mime_type: string;
  }>;
  status: ConfirmStatus;
  next_steps?: string[];
}

/**
 * 审批流程状态接口
 */
export interface ApprovalWorkflowStatus {
  confirm_id: string;
  workflow_type: string;
  current_step: number;
  total_steps: number;
  steps_completed: number;
  steps_pending: number;
  current_approvers: string[];
  step_statuses: Array<{
    step_id: string;
    step_order: number;
    status: string;
    approver: {
      user_id: string;
      role: string;
    };
    decision?: {
      outcome: string;
      timestamp: string;
    };
    timeout_info?: {
      expires_at: string;
      action_on_timeout: string;
    };
  }>;
  escalation_status?: {
    is_escalated: boolean;
    escalated_to?: {
      user_id: string;
      role: string;
    };
    escalation_reason?: string;
    escalation_time?: string;
  };
}

/**
 * 确认性能指标接口
 */
export interface ConfirmPerformanceMetrics {
  avg_approval_time_ms: number;
  approval_rate: number;
  rejection_rate: number;
  escalation_rate: number;
  timeout_rate: number;
  avg_steps_per_workflow: number;
  active_confirmations: number;
  timestamp: string;
}

/**
 * 确认适配器接口 - 厂商中立
 */
export interface IConfirmAdapter {
  /**
   * 获取适配器信息
   * @returns 包含适配器类型和版本的对象
   */
  getAdapterInfo(): { type: string; version: string };
  
  /**
   * 同步确认请求
   * @param confirm 确认协议对象
   * @returns 操作结果
   */
  syncConfirmation(confirm: ConfirmProtocol): Promise<ConfirmResponse>;
  
  /**
   * 获取确认请求
   * @param confirmId 确认ID
   * @returns 确认协议对象或null
   */
  getConfirmation(confirmId: string): Promise<ConfirmProtocol | null>;
  
  /**
   * 查找确认请求
   * @param filter 确认过滤条件
   * @returns 确认协议对象数组
   */
  findConfirmations(filter: ConfirmFilter): Promise<ConfirmProtocol[]>;
  
  /**
   * 提交决策
   * @param confirmId 确认ID
   * @param decision 决策信息
   * @returns 决策结果
   */
  submitDecision(confirmId: string, decision: {
    outcome: 'approve' | 'reject' | 'request_changes' | 'delegate';
    user_id: string;
    role: string;
    comments?: string;
    conditions?: string[];
    attachments?: Array<{
      file_id: string;
      filename: string;
      mime_type: string;
    }>;
  }): Promise<ConfirmDecisionResult>;
  
  /**
   * 获取审批流程状态
   * @param confirmId 确认ID
   * @returns 审批流程状态
   */
  getApprovalWorkflowStatus(confirmId: string): Promise<ApprovalWorkflowStatus>;
  
  /**
   * 升级确认请求
   * @param confirmId 确认ID
   * @param escalationInfo 升级信息
   * @returns 操作结果
   */
  escalateConfirmation(confirmId: string, escalationInfo: {
    reason: string;
    escalate_to: {
      user_id: string;
      role: string;
    };
  }): Promise<ConfirmResponse>;
  
  /**
   * 取消确认请求
   * @param confirmId 确认ID
   * @param reason 取消原因
   * @returns 操作结果
   */
  cancelConfirmation(confirmId: string, reason: string): Promise<ConfirmResponse>;
  
  /**
   * 添加评论
   * @param confirmId 确认ID
   * @param comment 评论信息
   * @returns 操作结果
   */
  addComment(confirmId: string, comment: {
    user_id: string;
    role: string;
    content: string;
    attachments?: Array<{
      file_id: string;
      filename: string;
      mime_type: string;
    }>;
  }): Promise<ConfirmResponse>;
  
  /**
   * 获取确认请求历史
   * @param confirmId 确认ID
   * @returns 历史记录数组
   */
  getConfirmationHistory(confirmId: string): Promise<Array<{
    event_type: string;
    timestamp: string;
    user_id?: string;
    role?: string;
    details: Record<string, unknown>;
  }>>;
  
  /**
   * 获取确认性能指标
   * @returns 性能指标
   */
  getConfirmMetrics(): Promise<ConfirmPerformanceMetrics>;
  
  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  checkHealth(): Promise<ConfirmAdapterHealth>;
  
  /**
   * 验证确认请求
   * @param confirm 确认协议对象
   * @returns 验证结果
   */
  validateConfirmation(confirm: ConfirmProtocol): Promise<{
    valid: boolean;
    issues?: Array<{
      path: string;
      severity: string;
      message: string;
    }>;
  }>;
  
  /**
   * 生成审批流程
   * @param confirmationType 确认类型
   * @param priority 优先级
   * @param contextId 上下文ID
   * @returns 审批流程配置
   */
  generateApprovalWorkflow?(confirmationType: ConfirmationType, priority: Priority, contextId: string): Promise<Record<string, unknown>>;
  
  /**
   * 分析审批趋势
   * @param filter 过滤条件
   * @returns 趋势分析结果
   */
  analyzeApprovalTrends?(filter: Record<string, unknown>): Promise<Record<string, unknown>>;
} 