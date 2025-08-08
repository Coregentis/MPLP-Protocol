/**
 * MPLP Dialog Entity - Domain Entity
 *
 * @version v1.0.0
 * @created 2025-08-02T01:21:00+08:00
 * @description 对话领域实体，包含对话的核心业务逻辑
 */

import { v4 as uuidv4 } from 'uuid';
import {
  DialogEntity,
  DialogParticipant,
  DialogMessage,
  MessageFormat,
  ConversationContext,
  SecurityPolicy,
  DialogStatus,
  ParticipantStatus,
  Permission,
  MessageType,
  MessageContent,
  MessagePriority,
} from '../../types';

/**
 * 对话领域实体
 */
export class Dialog {
  private _dialog_id: string;
  private _version: string;
  private _timestamp: string;
  private _session_id: string;
  private _context_id: string;
  private _name: string;
  private _description?: string;
  private _participants: DialogParticipant[];
  private _message_format: MessageFormat;
  private _conversation_context?: ConversationContext;
  private _security_policy?: SecurityPolicy;
  private _status: DialogStatus;
  private _created_at: string;
  private _updated_at: string;
  private _created_by: string;
  private _metadata?: Record<string, any>;

    /**
   * 能力列表
   */
  public capabilities?: string[];

  /**
   * 策略配置
   */
  public strategy?: Record<string, unknown>;

  /**
   * 配置信息
   */
  public configuration?: Record<string, unknown>;

constructor(data: Partial<DialogEntity>) {
    this._dialog_id = data.dialogId || uuidv4();
    this._version = data.version || '1.0.0';
    this._timestamp = data.timestamp || new Date().toISOString();
    this._session_id = data.sessionId!;
    this._context_id = data.contextId!;
    this._name = data.name!;
    this._description = data.description;
    this._participants = data.participants || [];
    this._message_format = data.message_format!;
    this._conversation_context = data.conversation_context;
    this._security_policy = data.security_policy;
    this._status = data.status || 'pending';
    this._created_at = data.createdAt || new Date().toISOString();
    this._updated_at = data.updatedAt || new Date().toISOString();
    this._created_by = data.createdBy!;
    this._metadata = data.metadata;

    this.validate();
  }

  // ==================== Getters ====================

  get dialogId(): string {
    return this._dialog_id;
  }
  get version(): string {
    return this._version;
  }
  get timestamp(): string {
    return this._timestamp;
  }
  get sessionId(): string {
    return this._session_id;
  }
  get contextId(): string {
    return this._context_id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get participants(): DialogParticipant[] {
    return [...this._participants];
  }
  get message_format(): MessageFormat {
    return { ...this._message_format };
  }
  get conversation_context(): ConversationContext | undefined {
    return this._conversation_context
      ? { ...this._conversation_context }
      : undefined;
  }
  get security_policy(): SecurityPolicy | undefined {
    return this._security_policy ? { ...this._security_policy } : undefined;
  }
  get status(): DialogStatus {
    return this._status;
  }
  get createdAt(): string {
    return this._created_at;
  }
  get updatedAt(): string {
    return this._updated_at;
  }
  get createdBy(): string {
    return this._created_by;
  }
  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  // ==================== 业务方法 ====================

  /**
   * 添加参与者
   */
  addParticipant(
    participant: Omit<DialogParticipant, 'participant_id' | 'joined_at'>
  ): void {
    // 验证参与者数量限制
    if (this._participants.length >= 100) {
      throw new Error('对话参与者数量已达上限');
    }

    // 验证Agent不重复
    if (this._participants.some(p => p.agentId === participant.agentId)) {
      throw new Error('Agent已经是对话参与者');
    }

    const newParticipant: DialogParticipant = {
      participant_id: uuidv4(),
      ...participant,
      joined_at: new Date().toISOString(),
    };

    this._participants.push(newParticipant);
    this.updateTimestamp();
  }

  /**
   * 移除参与者
   */
  removeParticipant(participant_id: string): void {
    const index = this._participants.findIndex(
      p => p.participant_id === participant_id
    );
    if (index === -1) {
      throw new Error('参与者不存在');
    }

    // 检查最小参与者数量（删除后至少保留1个参与者）
    if (this._participants.length <= 1) {
      throw new Error('对话至少需要1个参与者');
    }

    this._participants.splice(index, 1);
    this.updateTimestamp();
  }

  /**
   * 更新参与者状态
   */
  updateParticipantStatus(
    participant_id: string,
    status: ParticipantStatus
  ): void {
    const participant = this._participants.find(
      p => p.participant_id === participant_id
    );
    if (!participant) {
      throw new Error('参与者不存在');
    }

    participant.status = status;
    this.updateTimestamp();
  }

  /**
   * 更新参与者权限
   */
  updateParticipantPermissions(
    participant_id: string,
    permissions: Permission[]
  ): void {
    const participant = this._participants.find(
      p => p.participant_id === participant_id
    );
    if (!participant) {
      throw new Error('参与者不存在');
    }

    participant.permissions = permissions;
    this.updateTimestamp();
  }

  /**
   * 更新参与者信息（通用方法）
   */
  updateParticipant(
    participant_id: string,
    updates: Partial<
      Pick<DialogParticipant, 'role_id' | 'status' | 'permissions'>
    >
  ): void {
    const participant = this._participants.find(
      p => p.participant_id === participant_id
    );
    if (!participant) {
      throw new Error('参与者不存在');
    }

    if (updates.roleId !== undefined) {participant.roleId = updates.roleId;}
    if (updates.status !== undefined) {participant.status = updates.status;}
    if (updates.permissions !== undefined)
      {participant.permissions = updates.permissions;}

    this.updateTimestamp();
  }

  /**
   * 检查参与者权限（支持participant_id或agent_id）
   */
  hasPermission(id: string, permission: Permission): boolean {
    // 先尝试通过participant_id查找
    let participant = this._participants.find(p => p.participant_id === id);

    // 如果没找到，再尝试通过agent_id查找
    if (!participant) {
      participant = this._participants.find(p => p.agentId === id);
    }

    if (!participant) {
      return false;
    }

    return (
      participant.permissions.includes(permission) ||
      participant.permissions.includes('admin')
    );
  }

  /**
   * 启动对话
   */
  start(): void {
    if (this._status !== 'pending') {
      throw new Error(`无法启动对话，当前状态: ${this._status}`);
    }

    // 验证参与者状态
    const activeParticipants = this._participants.filter(
      p => p.status === 'active'
    );
    if (activeParticipants.length < 2) {
      throw new Error('至少需要2个活跃参与者才能启动对话');
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  /**
   * 暂停对话
   */
  pause(): void {
    if (this._status !== 'active') {
      throw new Error(`无法暂停对话，当前状态: ${this._status}`);
    }

    this._status = 'inactive';
    this.updateTimestamp();
  }

  /**
   * 恢复对话
   */
  resume(): void {
    if (this._status !== 'inactive') {
      throw new Error(`无法恢复对话，当前状态: ${this._status}`);
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  /**
   * 完成对话
   */
  complete(): void {
    if (!['active', 'inactive'].includes(this._status)) {
      throw new Error(`无法完成对话，当前状态: ${this._status}`);
    }

    this._status = 'completed';
    this.updateTimestamp();
  }

  /**
   * 取消对话
   */
  cancel(): void {
    if (['completed', 'cancelled'].includes(this._status)) {
      throw new Error(`无法取消对话，当前状态: ${this._status}`);
    }

    this._status = 'cancelled';
    this.updateTimestamp();
  }

  /**
   * 标记为失败
   */
  fail(reason?: string): void {
    this._status = 'failed';
    if (reason && this._metadata) {
      this._metadata.failure_reason = reason;
    }
    this.updateTimestamp();
  }

  /**
   * 更新状态（通用方法）
   */
  updateStatus(status: DialogStatus): void {
    switch (status) {
      case 'active':
        if (this._status === 'pending') {
          this.start();
        } else if (this._status === 'inactive') {
          this.resume();
        }
        break;
      case 'inactive':
        if (this._status === 'active') {
          this.pause();
        }
        break;
      case 'completed':
        this.complete();
        break;
      case 'cancelled':
        this.cancel();
        break;
      case 'failed':
        this.fail();
        break;
      default:
        this._status = status;
        this.updateTimestamp();
    }
  }

  /**
   * 更新基本信息
   */
  updateBasicInfo(updates: { name?: string; description?: string }): void {
    if (updates.name) {
      this._name = updates.name;
    }
    if ('description' in updates) {
      this._description = updates.description;
    }
    this.updateTimestamp();
  }

  /**
   * 更新消息格式
   */
  updateMessageFormat(format: Partial<MessageFormat>): void {
    this._message_format = { ...this._message_format, ...format };
    this.updateTimestamp();
  }

  /**
   * 更新对话上下文
   */
  updateConversationContext(context: Partial<ConversationContext>): void {
    this._conversation_context = { ...this._conversation_context, ...context };
    this.updateTimestamp();
  }

  /**
   * 更新安全策略
   */
  updateSecurityPolicy(policy: Partial<SecurityPolicy>): void {
    this._security_policy = { ...this._security_policy, ...policy };
    this.updateTimestamp();
  }

  /**
   * 更新元数据
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this.updateTimestamp();
  }

  /**
   * 验证消息格式
   */
  validateMessageFormat(content: MessageContent, type: MessageType): boolean {
    // 检查消息长度
    if (this._message_format.max_length) {
      const contentLength = JSON.stringify(content).length;
      if (contentLength > this._message_format.max_length) {
        return false;
      }
    }

    // 检查MIME类型（如果有附件）
    if (content.attachments && this._message_format.allowed_mime_types) {
      for (const attachment of content.attachments) {
        if (
          !this._message_format.allowed_mime_types.includes(attachment.type)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  // ==================== 辅助方法 ====================

  /**
   * 更新时间戳
   */
  private updateTimestamp(): void {
    this._updated_at = new Date().toISOString();
  }

  /**
   * 验证实体数据
   */
  private validate(): void {
    if (!this._session_id) {throw new Error('session_id是必需的');}
    if (!this._context_id) {throw new Error('context_id是必需的');}
    if (!this._name || this._name.trim().length === 0)
      {throw new Error('name是必需的');}
    if (!this._created_by) {throw new Error('created_by是必需的');}
    if (!this._message_format) {throw new Error('message_format是必需的');}
    // 注意：参与者数量在创建时可以为0，后续通过addParticipant添加
  }

  /**
   * 转换为普通对象
   */
  toObject(): DialogEntity {
    return {
      dialogId: this._dialog_id,
      version: this._version,
      timestamp: this._timestamp,
      sessionId: this._session_id,
      contextId: this._context_id,
      name: this._name,
      description: this._description,
      participants: [...this._participants],
      message_format: { ...this._message_format },
      conversation_context: this._conversation_context
        ? { ...this._conversation_context }
        : undefined,
      security_policy: this._security_policy
        ? { ...this._security_policy }
        : undefined,
      status: this._status,
      createdAt: this._created_at,
      updatedAt: this._updated_at,
      createdBy: this._created_by,
      metadata: this._metadata ? { ...this._metadata } : undefined,
    };
  }

  /**
   * 从普通对象创建实体
   */
  static fromObject(data: DialogEntity): Dialog {
    return new Dialog(data);
  }
}
