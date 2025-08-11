/**
 * Context模块Schema-TypeScript映射器
 *
 * 实现MPLP双重命名约定：
 * - Schema层：snake_case
 * - TypeScript层：camelCase
 *
 * @version 1.0.0
 * @created 2025-08-09
 */

import { Context } from '../../domain/entities/context.entity';

/**
 * Context Schema接口 (snake_case)
 */
export interface ContextSchema {
  context_id: string;
  name: string;
  description?: string;
  lifecycle_stage: string;
  status: string;
  created_at: string;
  updated_at: string;
  session_ids?: string[];
  shared_state_ids?: string[];
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Context TypeScript数据接口 (camelCase)
 */
export interface ContextEntityData {
  contextId: string;
  name: string;
  description?: string;
  lifecycleStage: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  sessionIds?: string[];
  sharedStateIds?: string[];
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Context映射器
 */
export class ContextMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(entity: Context): ContextSchema {
    return {
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description || undefined,
      lifecycle_stage: entity.lifecycleStage,
      status: entity.status,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      session_ids: entity.sessionIds,
      shared_state_ids: entity.sharedStateIds,
      configuration: entity.configuration,
      metadata: entity.metadata
    };
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: ContextSchema): ContextEntityData {
    return {
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      lifecycleStage: schema.lifecycle_stage,
      status: schema.status,
      createdAt: new Date(schema.created_at),
      updatedAt: new Date(schema.updated_at),
      sessionIds: schema.session_ids,
      sharedStateIds: schema.shared_state_ids,
      configuration: schema.configuration,
      metadata: schema.metadata
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is ContextSchema {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;
    
    return (
      typeof obj.context_id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.lifecycle_stage === 'string' &&
      typeof obj.status === 'string' &&
      typeof obj.created_at === 'string' &&
      typeof obj.updated_at === 'string'
    );
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: Context[]): ContextSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: ContextSchema[]): ContextEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }
}
