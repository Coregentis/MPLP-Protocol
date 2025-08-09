/**
 * Confirm领域实体
 * 
 * 确认流程的核心领域实体，封装确认业务逻辑和不变性约束
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
import { Logger } from '../../../../public/utils/logger';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  Requester,
  ApprovalWorkflow,
  ConfirmSubject,
  ConfirmDecision,
  ConfirmMetadata,
  ConfirmProtocol
} from '../../types';
import { ConfirmEventManager, ConfirmEventType, ConfirmEventData } from '../services/confirm-event-manager.service';

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

  // 事件管理器（可选注入）
  private _eventManager?: ConfirmEventManager;
  private _logger: Logger;

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
    metadata?: ConfirmMetadata,
    eventManager?: ConfirmEventManager
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
    this._eventManager = eventManager;
    this._logger = new Logger('Confirm');

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
  get expiresAt(): Timestamp | undefined { return this._expires_at; }
  get metadata(): ConfirmMetadata | undefined { return this._metadata; }



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
    return [ConfirmStatus.PENDING, ConfirmStatus.IN_REVIEW].includes(this._status);
  }

  /**
   * 取消确认
   */
  async cancel(): Promise<void> {
    if (!this.canCancel()) {
      throw new Error(`无法取消状态为 ${this._status} 的确认`);
    }

    const previousStatus = this._status;
    this._status = ConfirmStatus.CANCELLED;
    this._updated_at = new Date().toISOString();

    // 触发事件
    await this.emitEvent(ConfirmEventType.CONFIRMATION_CANCELLED, {
      previousStatus,
      newStatus: this._status
    });
  }

  /**
   * 更新状态并触发事件
   */
  async updateStatus(newStatus: ConfirmStatus, decision?: ConfirmDecision): Promise<void> {
    this.validateStatusTransition(this._status, newStatus);

    const previousStatus = this._status;
    this._status = newStatus;
    this._updated_at = new Date().toISOString();

    if (decision) {
      this._decision = decision;
    }

    // 触发状态变更事件
    await this.emitEvent(ConfirmEventType.STATUS_CHANGED, {
      previousStatus,
      newStatus,
      decision: decision ? String(decision) : undefined
    });

    // 根据新状态触发特定事件
    switch (newStatus) {
      case ConfirmStatus.APPROVED:
        await this.emitEvent(ConfirmEventType.CONFIRMATION_APPROVED, { decision: decision ? String(decision) : undefined });
        break;
      case ConfirmStatus.REJECTED:
        await this.emitEvent(ConfirmEventType.CONFIRMATION_REJECTED, { decision: decision ? String(decision) : undefined });
        break;
      case ConfirmStatus.EXPIRED:
        await this.emitEvent(ConfirmEventType.CONFIRMATION_EXPIRED);
        break;
    }
  }

  /**
   * 设置事件管理器
   */
  setEventManager(eventManager: ConfirmEventManager): void {
    this._eventManager = eventManager;
  }

  /**
   * 触发事件
   */
  private async emitEvent(eventType: ConfirmEventType, additionalData?: Partial<ConfirmEventData>): Promise<void> {
    if (!this._eventManager) {
      return; // 如果没有事件管理器，静默忽略
    }

    const eventData: ConfirmEventData = {
      eventType,
      confirmId: this._confirm_id,
      contextId: this._context_id,
      planId: this._plan_id,
      userId: this._requester.userId,
      status: this._status,
      decision: this._decision ? String(this._decision) : undefined,
      metadata: this._metadata as Record<string, unknown> | undefined,
      ...additionalData
    };

    try {
      await this._eventManager.emitEvent(eventType, eventData);
    } catch (error) {
      // 事件发送失败不应该影响业务逻辑
      this._logger.error('Failed to emit event:', error);
    }
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
      [ConfirmStatus.PENDING]: [ConfirmStatus.IN_REVIEW, ConfirmStatus.CANCELLED, ConfirmStatus.EXPIRED],
      [ConfirmStatus.IN_REVIEW]: [ConfirmStatus.APPROVED, ConfirmStatus.REJECTED, ConfirmStatus.CANCELLED],
      [ConfirmStatus.APPROVED]: [],
      [ConfirmStatus.REJECTED]: [],
      [ConfirmStatus.CANCELLED]: [],
      [ConfirmStatus.EXPIRED]: []
    };

    if (!validTransitions[from].includes(to)) {
      throw new Error(`无效的状态转换: ${from} -> ${to}`);
    }
  }

  /**
   * 转换为协议格式
   */
  toProtocol(): ConfirmProtocol {
    return {
      confirmId: this._confirm_id,
      contextId: this._context_id,
      planId: this._plan_id,
      protocolVersion: this._protocol_version,
      timestamp: this._created_at, // 使用创建时间作为协议时间戳
      confirmationType: this._confirmation_type,
      status: this._status,
      priority: this._priority,
      subject: this._subject,
      requester: this._requester,
      approvalWorkflow: this._approval_workflow,
      decision: this._decision,
      createdAt: this._created_at,
      updatedAt: this._updated_at,
      expiresAt: this._expires_at,
      metadata: this._metadata
    };
  }

  /**
   * 从协议格式创建实体
   */
  static fromProtocol(protocol: ConfirmProtocol): Confirm {
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
      protocol.expiresAt,
      protocol.metadata
    );
  }
}
