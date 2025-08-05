/**
 * MPLP Collab Entity - Domain Entity
 *
 * @version v1.0.0
 * @created 2025-08-02T01:09:00+08:00
 * @description 协作领域实体，包含协作的核心业务逻辑
 */

import { v4 as uuidv4 } from 'uuid';
import { EntityStatus } from '../../types';
import {
  CollabEntity,
  CollabParticipant,
  CoordinationStrategy,
  CollabMode,
} from '../../types';

/**
 * 协作领域实体
 */
export class Collab {
  private _collaboration_id: string;
  private _version: string;
  private _timestamp: string;
  private _context_id: string;
  private _plan_id: string;
  private _name: string;
  private _description?: string;
  private _mode: CollabMode;
  private _participants: CollabParticipant[];
  private _coordination_strategy: CoordinationStrategy;
  private _status: EntityStatus;
  private _created_at: string;
  private _updated_at: string;
  private _created_by: string;
  private _metadata?: Record<string, any>;

  constructor(data: Partial<CollabEntity>) {
    this._collaboration_id = data.collaboration_id || uuidv4();
    this._version = data.version || '1.0.0';
    this._timestamp = data.timestamp || new Date().toISOString();
    this._context_id = data.context_id!;
    this._plan_id = data.plan_id!;
    this._name = data.name!;
    this._description = data.description;
    this._mode = data.mode!;
    this._participants = data.participants || [];
    this._coordination_strategy = data.coordination_strategy!;
    this._status = data.status || 'pending';
    this._created_at = data.created_at || new Date().toISOString();
    this._updated_at = data.updated_at || new Date().toISOString();
    this._created_by = data.created_by!;
    this._metadata = data.metadata;

    this.validate();
  }

  // ==================== Getters ====================

  get collaboration_id(): string {
    return this._collaboration_id;
  }
  get version(): string {
    return this._version;
  }
  get timestamp(): string {
    return this._timestamp;
  }
  get context_id(): string {
    return this._context_id;
  }
  get plan_id(): string {
    return this._plan_id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get mode(): CollabMode {
    return this._mode;
  }
  get participants(): CollabParticipant[] {
    return [...this._participants];
  }
  get coordination_strategy(): CoordinationStrategy {
    return { ...this._coordination_strategy };
  }
  get status(): EntityStatus {
    return this._status;
  }
  get created_at(): string {
    return this._created_at;
  }
  get updated_at(): string {
    return this._updated_at;
  }
  get created_by(): string {
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
    participant: Omit<CollabParticipant, 'participant_id' | 'joined_at'>
  ): void {
    // 验证参与者数量限制
    if (this._participants.length >= 100) {
      throw new Error('协作参与者数量已达上限');
    }

    // 验证Agent不重复
    if (this._participants.some(p => p.agent_id === participant.agent_id)) {
      throw new Error('Agent已经是协作参与者');
    }

    const newParticipant: CollabParticipant = {
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

    // 检查最小参与者数量
    if (this._participants.length <= 2) {
      throw new Error('协作至少需要2个参与者');
    }

    this._participants.splice(index, 1);
    this.updateTimestamp();
  }

  /**
   * 更新参与者状态
   */
  updateParticipantStatus(participant_id: string, status: EntityStatus): void {
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
   * 更新协调策略
   */
  updateCoordinationStrategy(strategy: Partial<CoordinationStrategy>): void {
    this._coordination_strategy = {
      ...this._coordination_strategy,
      ...strategy,
    };
    this.updateTimestamp();
  }

  /**
   * 启动协作
   */
  start(): void {
    if (this._status !== 'pending') {
      throw new Error(`无法启动协作，当前状态: ${this._status}`);
    }

    // 验证参与者状态
    const activeParticipants = this._participants.filter(
      p => p.status === 'active'
    );
    if (activeParticipants.length < 2) {
      throw new Error('至少需要2个活跃参与者才能启动协作');
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  /**
   * 暂停协作
   */
  pause(): void {
    if (this._status !== 'active') {
      throw new Error(`无法暂停协作，当前状态: ${this._status}`);
    }

    this._status = 'inactive';
    this.updateTimestamp();
  }

  /**
   * 恢复协作
   */
  resume(): void {
    if (this._status !== 'inactive') {
      throw new Error(`无法恢复协作，当前状态: ${this._status}`);
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  /**
   * 完成协作
   */
  complete(): void {
    if (!['active', 'inactive'].includes(this._status)) {
      throw new Error(`无法完成协作，当前状态: ${this._status}`);
    }

    this._status = 'completed';
    this.updateTimestamp();
  }

  /**
   * 取消协作
   */
  cancel(): void {
    if (['completed', 'cancelled'].includes(this._status)) {
      throw new Error(`无法取消协作，当前状态: ${this._status}`);
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
   * 更新基本信息
   */
  updateBasicInfo(updates: {
    name?: string;
    description?: string;
    mode?: CollabMode;
  }): void {
    if (updates.name) {
      this._name = updates.name;
    }
    if ('description' in updates) {
      this._description = updates.description;
    }
    if (updates.mode) {
      this._mode = updates.mode;
    }
    this.updateTimestamp();
  }

  /**
   * 更新元数据
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this.updateTimestamp();
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
    if (!this._context_id) {throw new Error('context_id是必需的');}
    if (!this._plan_id) {throw new Error('plan_id是必需的');}
    if (!this._name || this._name.trim().length === 0)
      {throw new Error('name是必需的');}
    if (!this._created_by) {throw new Error('created_by是必需的');}
    // 注意：参与者数量验证移到start()方法中，创建时允许0个参与者
  }

  /**
   * 转换为普通对象
   */
  toObject(): CollabEntity {
    return {
      collaboration_id: this._collaboration_id,
      version: this._version,
      timestamp: this._timestamp,
      context_id: this._context_id,
      plan_id: this._plan_id,
      name: this._name,
      description: this._description,
      mode: this._mode,
      participants: [...this._participants],
      coordination_strategy: { ...this._coordination_strategy },
      status: this._status,
      created_at: this._created_at,
      updated_at: this._updated_at,
      created_by: this._created_by,
      metadata: this._metadata ? { ...this._metadata } : undefined,
    };
  }

  /**
   * 从普通对象创建实体
   */
  static fromObject(data: CollabEntity): Collab {
    return new Collab(data);
  }
}
