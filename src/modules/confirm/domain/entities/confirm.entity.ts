/**
 * Confirm领域实体
 * 
 * 确认流程的核心领域实体，封装确认业务逻辑和不变性约束
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
import { 
  ConfirmationType, 
  ConfirmStatus, 
  Priority, 
  Requester, 
  ApprovalWorkflow,
  ConfirmSubject,
  ConfirmDecision,
  ConfirmMetadata
} from '../../types';

/**
 * Confirm领域实体
 */
export class Confirm {
  private _confirm_id: UUID;
  private _context_id: UUID;
  private _plan_id?: UUID;
  private _protocol_version: string;
  private _confirmation_type: ConfirmationType;
  private _status: ConfirmStatus;
  private _priority: Priority;
  private _subject: ConfirmSubject;
  private _requester: Requester;
  private _approval_workflow: ApprovalWorkflow;
  private _decision?: ConfirmDecision;
  private _created_at: Timestamp;
  private _updated_at: Timestamp;
  private _expires_at?: Timestamp;
  private _metadata?: ConfirmMetadata;

    /**
   * 风险评估
   */
  public riskAssessment?: Record<string, unknown>;

  /**
   * 通知设置
   */
  public notificationSettings?: Record<string, unknown>;

  /**
   * 审计跟踪
   */
  public auditTrail?: unknown[];

constructor(
    confirmId: UUID,
    contextId: UUID,
    protocolVersion: string,
    confirmationType: ConfirmationType,
    status: ConfirmStatus,
    priority: Priority,
    subject: ConfirmSubject,
    requester: Requester,
    approvalWorkflow: ApprovalWorkflow,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    planId?: UUID,
    decision?: ConfirmDecision,
    expires_at?: Timestamp,
    metadata?: ConfirmMetadata
  ) {
    this._confirm_id = confirmId;
    this._context_id = contextId;
    this._plan_id = planId;
    this._protocol_version = protocolVersion;
    this._confirmation_type = confirmationType;
    this._status = status;
    this._priority = priority;
    this._subject = subject;
    this._requester = requester;
    this._approval_workflow = approvalWorkflow;
    this._decision = decision;
    this._created_at = createdAt;
    this._updated_at = updatedAt;
    this._expires_at = expires_at;
    this._metadata = metadata;

    this.validateInvariants();
  }

  // Getters
  get confirmId(): UUID { return this._confirm_id; }
  get contextId(): UUID { return this._context_id; }
  get planId(): UUID | undefined { return this._plan_id; }
  get protocolVersion(): string { return this._protocol_version; }
  get confirmationType(): ConfirmationType { return this._confirmation_type; }
  get status(): ConfirmStatus { return this._status; }
  get priority(): Priority { return this._priority; }
  get subject(): ConfirmSubject { return this._subject; }
  get requester(): Requester { return this._requester; }
  get approvalWorkflow(): ApprovalWorkflow { return this._approval_workflow; }
  get decision(): ConfirmDecision | undefined { return this._decision; }
  get createdAt(): Timestamp { return this._created_at; }
  get updatedAt(): Timestamp { return this._updated_at; }
  get expires_at(): Timestamp | undefined { return this._expires_at; }
  get metadata(): ConfirmMetadata | undefined { return this._metadata; }

  /**
   * 更新确认状态
   */
  updateStatus(newStatus: ConfirmStatus): void {
    this.validateStatusTransition(this._status, newStatus);
    this._status = newStatus;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 设置决策结果
   */
  setDecision(decision: ConfirmDecision): void {
    if (this._status !== 'in_review') {
      throw new Error('只能在审核中状态下设置决策');
    }
    this._decision = decision;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 检查是否已过期
   */
  isExpired(): boolean {
    if (!this._expires_at) return false;
    return new Date() > new Date(this._expires_at);
  }

  /**
   * 检查是否可以取消
   */
  canCancel(): boolean {
    return ['pending', 'in_review'].includes(this._status);
  }

  /**
   * 取消确认
   */
  cancel(): void {
    if (!this.canCancel()) {
      throw new Error(`无法取消状态为 ${this._status} 的确认`);
    }
    this._status = 'cancelled';
    this._updated_at = new Date().toISOString();
  }

  /**
   * 验证领域不变性
   */
  private validateInvariants(): void {
    if (!this._confirm_id) {
      throw new Error('确认ID不能为空');
    }
    if (!this._context_id) {
      throw new Error('上下文ID不能为空');
    }
    if (!this._subject.title || this._subject.title.trim().length === 0) {
      throw new Error('确认主题标题不能为空');
    }
    if (!this._requester.userId) {
      throw new Error('请求者用户ID不能为空');
    }
  }

  /**
   * 验证状态转换的有效性
   */
  private validateStatusTransition(from: ConfirmStatus, to: ConfirmStatus): void {
    const validTransitions: Record<ConfirmStatus, ConfirmStatus[]> = {
      'pending': ['in_review', 'cancelled', 'expired'],
      'in_review': ['approved', 'rejected', 'escalated', 'cancelled'],
      'approved': [],
      'rejected': [],
      'cancelled': [],
      'expired': [],
      'escalated': ['in_review', 'approved', 'rejected']
    };

    if (!validTransitions[from].includes(to)) {
      throw new Error(`无效的状态转换: ${from} -> ${to}`);
    }
  }

  /**
   * 转换为协议格式
   */
  toProtocol(): any {
    return {
      confirmId: this._confirm_id,
      contextId: this._context_id,
      planId: this._plan_id,
      protocolVersion: this._protocol_version,
      confirmationType: this._confirmation_type,
      status: this._status,
      priority: this._priority,
      subject: this._subject,
      requester: this._requester,
      approvalWorkflow: this._approval_workflow,
      decision: this._decision,
      createdAt: this._created_at,
      updatedAt: this._updated_at,
      expires_at: this._expires_at,
      metadata: this._metadata
    };
  }

  /**
   * 从协议格式创建实体
   */
  static fromProtocol(protocol: any): Confirm {
    return new Confirm(
      protocol.confirmId,
      protocol.contextId,
      protocol.protocolVersion,
      protocol.confirmationType,
      protocol.status,
      protocol.priority,
      protocol.subject,
      protocol.requester,
      protocol.approvalWorkflow,
      protocol.createdAt,
      protocol.updatedAt,
      protocol.planId,
      protocol.decision,
      protocol.expires_at,
      protocol.metadata
    );
  }
}
