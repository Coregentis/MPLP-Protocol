/**
 * MPLP Context共享状态历史审计实体
 * 
 * 注意：这不是Schema定义的实体，而是用于审计Context模块shared_state字段变更历史的内部实体
 * Context的shared_state数据存储在ContextEntity的shared_state JSONB字段中
 * 此实体仅用于追踪和审计shared_state的变更历史
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:00:00+08:00
 * @compliance 非Schema实体 - 内部审计和历史记录
 * @purpose Context.shared_state字段变更历史追踪
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ContextEntity } from './context.entity';

@Entity('mplp_context_state_audit')
@Index(['context_id', 'operation_type', 'created_at'])
@Index(['variable_path', 'created_at'])
@Index(['operation_type', 'created_at'])
export class ContextStateAuditEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // ===== 关联字段 =====

  @Column({ type: 'varchar', length: 100 })
  @Index()
  context_id!: string; // 关联的Context ID

  // ===== 操作追踪字段 =====

  @Column({ 
    type: 'enum',
    enum: ['variable_created', 'variable_updated', 'variable_deleted', 'resource_allocated', 'resource_deallocated', 'dependency_added', 'dependency_removed', 'goal_created', 'goal_updated', 'goal_achieved', 'goal_abandoned', 'state_reset'],
  })
  operation_type!: string; // 操作类型

  @Column({ type: 'varchar', length: 500 })
  variable_path!: string; // 变更的路径 (如: "variables.user_name" 或 "resources.allocated.cpu")

  @Column({ type: 'jsonb', nullable: true })
  old_value?: string; // 旧值 (JSON序列化)

  @Column({ type: 'jsonb', nullable: true })
  new_value?: string; // 新值 (JSON序列化)

  @Column({ type: 'varchar', length: 100 })
  changed_by!: string; // 变更执行者 (user_id 或 agent_id)

  @Column({ 
    type: 'enum',
    enum: ['user', 'agent', 'system'],
    default: 'system'
  })
  changed_by_type!: string; // 变更执行者类型

  // ===== 元数据字段 =====

  @Column({ type: 'varchar', length: 255, nullable: true })
  operation_description?: string; // 操作描述

  @Column({ type: 'jsonb', nullable: true })
  operation_context?: string; // 操作上下文信息 (序列化)

  @Column({ type: 'varchar', length: 100, nullable: true })
  trace_id?: string; // 追踪ID (用于关联操作链)

  @Column({ type: 'varchar', length: 100, nullable: true })
  plan_id?: string; // 关联的Plan ID (如果变更由Plan触发)

  // ===== 影响评估字段 =====

  @Column({ type: 'int', default: 0 })
  affected_dependencies_count!: number; // 受影响的依赖数量

  @Column({ type: 'int', default: 0 })
  affected_goals_count!: number; // 受影响的目标数量

  @Column({ type: 'boolean', default: false })
  requires_notification!: boolean; // 是否需要通知

  @Column({ type: 'boolean', default: false })
  is_critical_change!: boolean; // 是否为关键变更

  // ===== 状态字段 =====

  @Column({ 
    type: 'enum',
    enum: ['pending', 'applied', 'rolled_back', 'failed'],
    default: 'applied'
  })
  status!: string; // 变更状态

  @Column({ type: 'varchar', length: 500, nullable: true })
  failure_reason?: string; // 失败原因 (如果status为failed)

  @CreateDateColumn()
  created_at!: Date;

  // ===== 关联关系 =====

  @ManyToOne(() => ContextEntity, context => context.sessions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'context_id', referencedColumnName: 'context_id' })
  context!: ContextEntity;

  // ===== 实用方法 =====

  /**
   * 创建变量变更审计记录
   */
  static createVariableChangeAudit(
    contextId: string,
    variablePath: string,
    oldValue: unknown,
    newValue: unknown,
    changedBy: string,
    changedByType: 'user' | 'agent' | 'system' = 'system',
    operationType: 'variable_created' | 'variable_updated' | 'variable_deleted' = 'variable_updated'
  ): ContextStateAuditEntity {
    const audit = new ContextStateAuditEntity();
    
    audit.context_id = contextId;
    audit.operation_type = operationType;
    audit.variable_path = variablePath;
    audit.old_value = oldValue ? JSON.stringify(oldValue) : undefined;
    audit.new_value = newValue ? JSON.stringify(newValue) : undefined;
    audit.changed_by = changedBy;
    audit.changed_by_type = changedByType;
    audit.status = 'applied';
    audit.affected_dependencies_count = 0;
    audit.affected_goals_count = 0;
    audit.requires_notification = false;
    audit.is_critical_change = false;
    
    return audit;
  }

  /**
   * 创建资源分配审计记录
   */
  static createResourceAllocationAudit(
    contextId: string,
    resourcePath: string,
    allocatedAmount: number,
    changedBy: string,
    changedByType: 'user' | 'agent' | 'system' = 'system'
  ): ContextStateAuditEntity {
    const audit = new ContextStateAuditEntity();
    
    audit.context_id = contextId;
    audit.operation_type = 'resource_allocated';
    audit.variable_path = resourcePath;
    audit.new_value = JSON.stringify({ amount: allocatedAmount, timestamp: new Date().toISOString() });
    audit.changed_by = changedBy;
    audit.changed_by_type = changedByType;
    audit.status = 'applied';
    audit.is_critical_change = true; // 资源分配通常是关键变更
    audit.requires_notification = true;
    audit.affected_dependencies_count = 0;
    audit.affected_goals_count = 0;
    
    return audit;
  }

  /**
   * 创建目标状态变更审计记录
   */
  static createGoalStatusChangeAudit(
    contextId: string,
    goalId: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string,
    changedByType: 'user' | 'agent' | 'system' = 'system'
  ): ContextStateAuditEntity {
    const audit = new ContextStateAuditEntity();
    
    audit.context_id = contextId;
    audit.operation_type = newStatus === 'achieved' ? 'goal_achieved' : 
                          newStatus === 'abandoned' ? 'goal_abandoned' : 'goal_updated';
    audit.variable_path = `goals.${goalId}.status`;
    audit.old_value = JSON.stringify(oldStatus);
    audit.new_value = JSON.stringify(newStatus);
    audit.changed_by = changedBy;
    audit.changed_by_type = changedByType;
    audit.status = 'applied';
    audit.is_critical_change = newStatus === 'achieved' || newStatus === 'abandoned';
    audit.requires_notification = audit.is_critical_change;
    audit.affected_dependencies_count = 0;
    audit.affected_goals_count = 1;
    
    return audit;
  }

  /**
   * 获取变更摘要
   */
  getChangeSummary(): string {
    const operation = this.operation_type.replace('_', ' ');
    const path = this.variable_path;
    
    if (this.operation_type.includes('variable')) {
      return `Variable ${operation}: ${path}`;
    } else if (this.operation_type.includes('resource')) {
      return `Resource ${operation}: ${path}`;
    } else if (this.operation_type.includes('goal')) {
      return `Goal ${operation}: ${path}`;
    } else if (this.operation_type.includes('dependency')) {
      return `Dependency ${operation}: ${path}`;
    } else {
      return `State ${operation}: ${path}`;
    }
  }

  /**
   * 检查是否为破坏性变更
   */
  isBreakingChange(): boolean {
    const breakingOperations = [
      'variable_deleted',
      'resource_deallocated', 
      'dependency_removed',
      'goal_abandoned',
      'state_reset'
    ];
    
    return breakingOperations.includes(this.operation_type) || this.is_critical_change;
  }

  /**
   * 获取变更的值
   */
  getParsedOldValue(): unknown {
    try {
      return this.old_value ? JSON.parse(this.old_value) : null;
    } catch {
      return this.old_value;
    }
  }

  /**
   * 获取新的值
   */
  getParsedNewValue(): unknown {
    try {
      return this.new_value ? JSON.parse(this.new_value) : null;
    } catch {
      return this.new_value;
    }
  }

  /**
   * 获取操作上下文
   */
  getParsedOperationContext(): unknown {
    try {
      return this.operation_context ? JSON.parse(this.operation_context) : {};
    } catch {
      return {};
    }
  }
} 