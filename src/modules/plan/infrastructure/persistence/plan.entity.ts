/**
 * Plan持久化实体
 * 
 * 定义数据库表结构
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:35:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

// TypeORM装饰器在0.3.x版本中需要这样导入
const { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } = require('typeorm');
import { 
  PlanStatus, 
  ExecutionStrategy, 
  Priority 
} from '../../../../public/shared/types/plan-types';

/**
 * Plan持久化实体
 */
@Entity('plans')
export class PlanEntity {
  @PrimaryColumn('uuid')
  plan_id!: string;

  @Column('uuid')
  context_id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text')
  description!: string;

  @Column('varchar', { length: 50 })
  status!: PlanStatus;

  @Column('varchar', { length: 50 })
  version!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column('simple-json', { nullable: true })
  goals!: string[];

  @Column('simple-json')
  tasks!: Record<string, unknown>[];

  @Column('simple-json')
  dependencies!: Record<string, unknown>[];

  @Column('varchar', { length: 50 })
  execution_strategy!: ExecutionStrategy;

  @Column('varchar', { length: 50 })
  priority!: Priority;
  
  @Column('simple-json', { nullable: true })
  estimated_duration?: { value: number; unit: string };
  
  @Column('simple-json')
  progress!: {
    completed_tasks: number;
    total_tasks: number;
    percentage: number;
  };
  
  @Column('simple-json', { nullable: true })
  timeline?: {
    start_date: string;
    end_date: string;
    milestones: Record<string, unknown>[];
    critical_path: string[];
  };
  
  @Column('simple-json')
  configuration!: Record<string, unknown>;
  
  @Column('simple-json', { nullable: true })
  metadata?: Record<string, unknown>;
  
  @Column('simple-json', { nullable: true })
  risk_assessment?: {
    overall_risk_level: string;
    risks: Record<string, unknown>[];
    last_assessed: string;
  };
} 