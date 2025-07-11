/**
 * MPLP Context会话管理实体
 * 
 * 注意：这不是Schema定义的实体，而是用于管理Context相关用户会话的内部实体
 * Context的核心数据存储在ContextEntity中，此实体仅用于会话管理和用户状态追踪
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:00:00+08:00
 * @compliance 非Schema实体 - 内部会话管理
 * @purpose Context相关用户会话和访问状态管理
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ContextEntity } from './context.entity';

@Entity('mplp_context_sessions')
@Index(['user_id', 'expires_at'])
@Index(['agent_id', 'last_active_at'])
@Index(['session_id'])
@Index(['context_id', 'is_active'])
export class ContextSessionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // ===== 会话标识字段 =====

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  session_id!: string; // 会话唯一标识符

  @Column({ type: 'varchar', length: 100 })
  @Index()
  context_id!: string; // 关联的Context ID

  // ===== 用户信息字段 =====

  @Column({ type: 'varchar', length: 100 })
  @Index()
  user_id!: string; // 用户ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  agent_id?: string; // 关联的Agent ID (如果是Agent会话)

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_role?: string; // 用户在此Context中的角色

  // ===== 会话状态字段 =====

  @Column({ type: 'timestamp' })
  last_active_at!: Date; // 最后活跃时间

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date; // 会话过期时间

  @Column({ type: 'boolean', default: true })
  is_active!: boolean; // 是否活跃

  @Column({ 
    type: 'enum',
    enum: ['active', 'idle', 'expired', 'terminated'],
    default: 'active'
  })
  status!: string; // 会话状态

  // ===== 会话数据字段 =====

  @Column({ type: 'jsonb', default: '{}' })
  session_data!: string; // 会话数据 (序列化)

  @Column({ type: 'jsonb', default: '{}' })
  preferences!: string; // 用户偏好设置 (序列化)

  @Column({ type: 'jsonb', default: '[]' })
  recent_operations!: string; // 最近操作记录 (序列化)

  // ===== 访问控制字段 =====

  @Column({ type: 'jsonb', default: '[]' })
  granted_permissions!: string; // 授权的权限列表 (序列化)

  @Column({ type: 'varchar', length: 45, nullable: true })
  client_ip?: string; // 客户端IP地址

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string; // 用户代理字符串

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_id?: string; // 设备标识符

  // ===== 统计字段 =====

  @Column({ type: 'int', default: 0 })
  total_operations!: number; // 总操作数

  @Column({ type: 'int', default: 0 })
  total_state_changes!: number; // 状态变更次数

  @Column({ type: 'int', default: 0 })
  total_duration_seconds!: number; // 总会话时长 (秒)

  // ===== 安全字段 =====

  @Column({ type: 'boolean', default: false })
  requires_mfa!: boolean; // 是否需要多因子认证

  @Column({ type: 'timestamp', nullable: true })
  last_security_check?: Date; // 最后安全检查时间

  @Column({ type: 'int', default: 0 })
  failed_auth_attempts!: number; // 失败认证尝试次数

  @Column({ type: 'boolean', default: false })
  is_suspicious!: boolean; // 是否为可疑会话

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // ===== 关联关系 =====

  @ManyToOne(() => ContextEntity, context => context.sessions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'context_id', referencedColumnName: 'context_id' })
  context!: ContextEntity;

  // ===== 实用方法 =====

  /**
   * 检查会话是否已过期
   */
  isExpired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  /**
   * 检查会话是否处于空闲状态
   */
  isIdle(idleThresholdMinutes: number = 30): boolean {
    const idleThreshold = new Date(Date.now() - idleThresholdMinutes * 60 * 1000);
    return this.last_active_at < idleThreshold;
  }

  /**
   * 更新最后活跃时间
   */
  updateLastActive(): void {
    this.last_active_at = new Date();
    
    // 更新会话状态
    if (this.isExpired()) {
      this.status = 'expired';
      this.is_active = false;
    } else if (this.isIdle()) {
      this.status = 'idle';
    } else {
      this.status = 'active';
      this.is_active = true;
    }
  }

  /**
   * 延长会话时间
   */
  extendSession(additionalMinutes: number = 60): void {
    const now = new Date();
    this.expires_at = new Date(now.getTime() + additionalMinutes * 60 * 1000);
    this.updateLastActive();
  }

  /**
   * 终止会话
   */
  terminate(reason: string = 'manual'): void {
    this.status = 'terminated';
    this.is_active = false;
    this.expires_at = new Date(); // 立即过期
    
    // 记录终止原因
    const sessionData = this.getParsedSessionData();
    sessionData.termination_reason = reason;
    sessionData.terminated_at = new Date().toISOString();
    this.session_data = JSON.stringify(sessionData);
  }

  /**
   * 记录操作
   */
  recordOperation(operation: {
    type: string;
    resource: string;
    timestamp?: string;
    metadata?: unknown;
  }): void {
    const recentOps = this.getParsedRecentOperations();
    
    const operationRecord = {
      ...operation,
      timestamp: operation.timestamp || new Date().toISOString()
    };
    
    recentOps.unshift(operationRecord);
    
    // 保留最近50个操作
    if (recentOps.length > 50) {
      recentOps.splice(50);
    }
    
    this.recent_operations = JSON.stringify(recentOps);
    this.total_operations += 1;
    this.updateLastActive();
  }

  /**
   * 记录状态变更
   */
  recordStateChange(): void {
    this.total_state_changes += 1;
    this.updateLastActive();
  }

  /**
   * 获取解析后的会话数据
   */
  getParsedSessionData(): any {
    try {
      return JSON.parse(this.session_data);
    } catch {
      return {};
    }
  }

  /**
   * 获取解析后的用户偏好
   */
  getParsedPreferences(): any {
    try {
      return JSON.parse(this.preferences);
    } catch {
      return {};
    }
  }

  /**
   * 获取解析后的最近操作
   */
  getParsedRecentOperations(): any[] {
    try {
      return JSON.parse(this.recent_operations);
    } catch {
      return [];
    }
  }

  /**
   * 获取解析后的权限列表
   */
  getParsedGrantedPermissions(): string[] {
    try {
      return JSON.parse(this.granted_permissions);
    } catch {
      return [];
    }
  }

  /**
   * 检查是否有特定权限
   */
  hasPermission(permission: string): boolean {
    const permissions = this.getParsedGrantedPermissions();
    return permissions.includes(permission) || permissions.includes('*');
  }

  /**
   * 授予权限
   */
  grantPermission(permission: string): void {
    const permissions = this.getParsedGrantedPermissions();
    if (!permissions.includes(permission)) {
      permissions.push(permission);
      this.granted_permissions = JSON.stringify(permissions);
    }
  }

  /**
   * 撤销权限
   */
  revokePermission(permission: string): void {
    const permissions = this.getParsedGrantedPermissions();
    const filtered = permissions.filter(p => p !== permission);
    this.granted_permissions = JSON.stringify(filtered);
  }

  /**
   * 计算会话持续时间 (秒)
   */
  calculateDuration(): number {
    const endTime = this.status === 'terminated' || this.isExpired() ? 
      (this.expires_at || new Date()) : new Date();
    
    return Math.floor((endTime.getTime() - this.created_at.getTime()) / 1000);
  }

  /**
   * 获取会话摘要
   */
  getSummary(): {
    session_id: string;
    user_id: string;
    status: string;
    duration_seconds: number;
    operations_count: number;
    state_changes_count: number;
    is_expired: boolean;
    is_idle: boolean;
  } {
    return {
      session_id: this.session_id,
      user_id: this.user_id,
      status: this.status,
      duration_seconds: this.calculateDuration(),
      operations_count: this.total_operations,
      state_changes_count: this.total_state_changes,
      is_expired: this.isExpired(),
      is_idle: this.isIdle()
    };
  }

  /**
   * 创建新会话
   */
  static createSession(
    sessionId: string,
    contextId: string,
    userId: string,
    expirationMinutes: number = 60,
    agentId?: string
  ): ContextSessionEntity {
    const session = new ContextSessionEntity();
    
    session.session_id = sessionId;
    session.context_id = contextId;
    session.user_id = userId;
    session.agent_id = agentId;
    session.last_active_at = new Date();
    session.expires_at = new Date(Date.now() + expirationMinutes * 60 * 1000);
    session.is_active = true;
    session.status = 'active';
    session.session_data = '{}';
    session.preferences = '{}';
    session.recent_operations = '[]';
    session.granted_permissions = '[]';
    session.total_operations = 0;
    session.total_state_changes = 0;
    session.total_duration_seconds = 0;
    session.requires_mfa = false;
    session.failed_auth_attempts = 0;
    session.is_suspicious = false;
    
    return session;
  }
} 