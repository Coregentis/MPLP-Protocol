/**
 * MPLP Context实体类
 * 
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:00:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ContextSessionEntity } from './context-session.entity';
import { ContextStateAuditEntity } from './shared-state.entity'; // 重命名的审计实体
import { 
  ContextProtocol,
  ContextStatus,
  ContextLifecycleStage,
  SharedState,
  AccessControl,
  ContextConfiguration
} from '../types';

@Entity('mplp_contexts')
@Index(['user_id', 'status'])
@Index(['lifecycle_stage', 'updated_at'])
@Index(['parent_context_id'])
export class ContextEntity {
  @PrimaryGeneratedColumn()
  id!: number; // 修复：使用definite assignment assertion

  // ===== 核心Schema字段 (完全匹配context-protocol.json) =====

  @Column({ type: 'varchar', length: 20, default: '1.0.1' })
  protocol_version!: string; // Schema: protocol_version

  @Column({ type: 'timestamptz' })
  protocol_timestamp!: Date; // Schema: timestamp (ISO 8601)

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  context_id!: string; // Schema: context_id (UUID)

  @Column({ type: 'varchar', length: 255 })
  name!: string; // Schema: name

  @Column({ type: 'text', nullable: true })
  description?: string; // Schema: description (可选)

  @Column({ 
    type: 'enum', 
    enum: ['active', 'suspended', 'completed', 'terminated'], // Schema: status 枚举
    default: 'active'
  })
  status!: ContextStatus;

  @Column({ 
    type: 'enum', 
    enum: ['planning', 'executing', 'monitoring', 'completed'], // Schema: lifecycle_stage 枚举 (修复)
    default: 'planning'
  })
  lifecycle_stage!: ContextLifecycleStage;

  // ===== Schema复杂对象字段 (JSONB存储) =====

  @Column({ type: 'jsonb' })
  shared_state!: string; // Schema: shared_state (序列化存储完整SharedState对象)

  @Column({ type: 'jsonb' })
  access_control!: string; // Schema: access_control (序列化存储AccessControl对象)

  @Column({ type: 'jsonb' })
  configuration!: string; // Schema: configuration (序列化存储ContextConfiguration对象)

  // ===== 扩展字段 (非Schema，用于内部管理) =====

  @Column({ type: 'varchar', length: 100 })
  @Index()
  user_id!: string; // 内部管理字段：创建用户

  @Column({ type: 'varchar', length: 100, nullable: true })
  agent_id?: string; // 内部管理字段：关联Agent

  @Column({ type: 'varchar', length: 100, nullable: true })
  parent_context_id?: string; // 内部管理字段：父上下文

  @Column({ type: 'jsonb', nullable: true })
  session_data?: string; // 内部管理字段：会话数据

  @Column({ type: 'jsonb', nullable: true })
  metadata?: string; // 内部管理字段：元数据

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracepilot_context_id?: string; // TracePilot集成字段

  // ===== 统计字段 =====

  @Column({ type: 'int', default: 0 })
  total_operations!: number;

  @Column({ type: 'int', default: 0 })
  total_state_changes!: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // ===== 关联关系 =====

  @OneToMany(() => ContextSessionEntity, session => session.context)
  sessions!: ContextSessionEntity[]; // 用户会话记录

  @OneToMany(() => ContextStateAuditEntity, audit => audit.context)
  state_audit_logs!: ContextStateAuditEntity[]; // 状态变更审计日志

  @ManyToOne(() => ContextEntity, { nullable: true })
  @JoinColumn({ name: 'parent_context_id', referencedColumnName: 'context_id' })
  parent_context?: ContextEntity;

  @OneToMany(() => ContextEntity, context => context.parent_context)
  child_contexts!: ContextEntity[];

  // ===== Schema合规性方法 =====

  /**
   * 将实体转换为Schema兼容的ContextProtocol对象
   */
  toContextProtocol(): ContextProtocol {
    return {
      protocol_version: this.protocol_version,
      timestamp: this.protocol_timestamp.toISOString(),
      context_id: this.context_id,
      name: this.name,
      description: this.description,
      status: this.status,
      lifecycle_stage: this.lifecycle_stage,
      shared_state: JSON.parse(this.shared_state) as SharedState,
      access_control: JSON.parse(this.access_control) as AccessControl,
      configuration: JSON.parse(this.configuration) as ContextConfiguration
    };
  }

  /**
   * 从Schema兼容的ContextProtocol对象创建实体
   */
  static fromContextProtocol(protocol: ContextProtocol, userId: string): ContextEntity {
    const entity = new ContextEntity();
    
    entity.protocol_version = protocol.protocol_version;
    entity.protocol_timestamp = new Date(protocol.timestamp);
    entity.context_id = protocol.context_id;
    entity.name = protocol.name;
    entity.description = protocol.description;
    entity.status = protocol.status;
    entity.lifecycle_stage = protocol.lifecycle_stage;
    entity.shared_state = JSON.stringify(protocol.shared_state);
    entity.access_control = JSON.stringify(protocol.access_control);
    entity.configuration = JSON.stringify(protocol.configuration);
    entity.user_id = userId;
    entity.total_operations = 0;
    entity.total_state_changes = 0;
    
    return entity;
  }

  /**
   * 验证实体的Schema合规性
   */
  validateSchemaCompliance(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证必填字段
    if (!this.protocol_version) errors.push('Missing protocol_version');
    if (!this.context_id) errors.push('Missing context_id');
    if (!this.name) errors.push('Missing name');
    if (!this.status) errors.push('Missing status');
    if (!this.lifecycle_stage) errors.push('Missing lifecycle_stage');
    if (!this.shared_state) errors.push('Missing shared_state');
    if (!this.access_control) errors.push('Missing access_control');
    if (!this.configuration) errors.push('Missing configuration');

    // 验证枚举值
    const validStatuses: ContextStatus[] = ['active', 'suspended', 'completed', 'terminated'];
    if (!validStatuses.includes(this.status)) {
      errors.push(`Invalid status: ${this.status}`);
    }

    const validLifecycleStages: ContextLifecycleStage[] = ['planning', 'executing', 'monitoring', 'completed'];
    if (!validLifecycleStages.includes(this.lifecycle_stage)) {
      errors.push(`Invalid lifecycle_stage: ${this.lifecycle_stage}`);
    }

    // 验证JSONB字段格式
    try {
      const sharedState = JSON.parse(this.shared_state) as SharedState;
      if (!sharedState.variables || !sharedState.resources || !sharedState.dependencies || !sharedState.goals) {
        errors.push('Invalid shared_state structure');
      }
    } catch {
      errors.push('Invalid shared_state JSON format');
    }

    try {
      const accessControl = JSON.parse(this.access_control) as AccessControl;
      if (!accessControl.owner || !accessControl.permissions) {
        errors.push('Invalid access_control structure');
      }
    } catch {
      errors.push('Invalid access_control JSON format');
    }

    try {
      const config = JSON.parse(this.configuration) as ContextConfiguration;
      if (!config.timeout_settings || !config.persistence) {
        errors.push('Invalid configuration structure');
      }
    } catch {
      errors.push('Invalid configuration JSON format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 更新Schema字段
   */
  updateFromContextProtocol(protocol: Partial<ContextProtocol>): void {
    if (protocol.name !== undefined) this.name = protocol.name;
    if (protocol.description !== undefined) this.description = protocol.description;
    if (protocol.status !== undefined) this.status = protocol.status;
    if (protocol.lifecycle_stage !== undefined) this.lifecycle_stage = protocol.lifecycle_stage;
    if (protocol.shared_state !== undefined) {
      this.shared_state = JSON.stringify(protocol.shared_state);
      this.total_state_changes += 1;
    }
    if (protocol.access_control !== undefined) {
      this.access_control = JSON.stringify(protocol.access_control);
    }
    if (protocol.configuration !== undefined) {
      this.configuration = JSON.stringify(protocol.configuration);
    }
    
    this.protocol_timestamp = new Date();
    this.total_operations += 1;
  }

  /**
   * 获取parsed的SharedState对象
   */
  getParsedSharedState(): SharedState {
    return JSON.parse(this.shared_state) as SharedState;
  }

  /**
   * 获取parsed的AccessControl对象
   */
  getParsedAccessControl(): AccessControl {
    return JSON.parse(this.access_control) as AccessControl;
  }

  /**
   * 获取parsed的Configuration对象
   */
  getParsedConfiguration(): ContextConfiguration {
    return JSON.parse(this.configuration) as ContextConfiguration;
  }
} 