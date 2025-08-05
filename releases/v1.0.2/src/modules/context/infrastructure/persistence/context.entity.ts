/**
 * Context持久化实体
 * 
 * 定义Context在数据库中的映射结构
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { EntitySchema } from 'typeorm/entity-schema/EntitySchema';
import { EntityStatus } from '../../../shared/types';
import { ContextLifecycleStage } from '../../../shared/types';

/**
 * Context实体接口
 */
export interface ContextEntity {
  context_id: string;
  name: string;
  description: string | null;
  lifecycle_stage: ContextLifecycleStage;
  status: EntityStatus;
  created_at: Date;
  updated_at: Date;
  session_ids: string[];
  shared_state_ids: string[];
  configuration: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

/**
 * Context实体Schema
 */
export const ContextEntitySchema = new EntitySchema<ContextEntity>({
  name: 'Context',
  tableName: 'contexts',
  columns: {
    context_id: {
      type: 'uuid',
      primary: true
    },
    name: {
      type: String
    },
    description: {
      type: String,
      nullable: true
    },
    lifecycle_stage: {
      type: 'enum',
      enum: ['initialization', 'active', 'maintenance', 'completion'],
      default: 'initialization'
    },
    status: {
      type: 'enum',
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active'
    },
    created_at: {
      type: Date
    },
    updated_at: {
      type: Date
    },
    session_ids: {
      type: 'simple-array',
      nullable: true
    },
    shared_state_ids: {
      type: 'simple-array',
      nullable: true
    },
    configuration: {
      type: 'jsonb',
      nullable: true
    },
    metadata: {
      type: 'jsonb',
      nullable: true
    }
  },
  indices: [
    {
      name: 'IDX_CONTEXT_NAME',
      columns: ['name']
    },
    {
      name: 'IDX_CONTEXT_STATUS',
      columns: ['status']
    },
    {
      name: 'IDX_CONTEXT_LIFECYCLE',
      columns: ['lifecycle_stage']
    }
  ]
}); 