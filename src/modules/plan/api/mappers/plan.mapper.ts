/**
 * Plan模块Schema-TypeScript映射器
 * 
 * 实现MPLP双重命名约定：
 * - Schema层：snake_case
 * - TypeScript层：camelCase
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { Plan } from '../../domain/entities/plan.entity';

/**
 * Plan Schema接口 (snake_case)
 */
export interface PlanSchema {
  plan_id: string;
  context_id: string;
  name: string;
  description?: string;
  goals: string[];
  execution_strategy: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  tasks?: Array<{
    task_id: string;
    name: string;
    description?: string;
    dependencies: string[];
    estimated_duration?: number;
    priority: string;
    status: string;
    assigned_agents?: string[];
    created_by: string;
  }>;
  estimated_duration?: {
    value: number;
    unit: string;
  };
  configuration?: {
    execution_settings?: {
      strategy: string;
      parallel_limit?: number;
      default_timeout_ms?: number;
      retry_policy?: {
        max_retries: number;
        retry_delay_ms: number;
        backoff_factor: number;
      };
    };
    resource_constraints?: {
      max_agents?: number;
      memory_limit_mb?: number;
      time_limit?: number;
    };
  };
  metadata?: Record<string, unknown>;
}

/**
 * Plan TypeScript数据接口 (camelCase)
 */
export interface PlanEntityData {
  planId: string;
  contextId: string;
  name: string;
  description?: string;
  goals: string[];
  executionStrategy: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tasks?: Array<{
    taskId: string;
    name: string;
    description?: string;
    dependencies: string[];
    estimatedDuration?: number;
    priority: string;
    status: string;
    assignedAgents?: string[];
    createdBy: string;
  }>;
  estimatedDuration?: {
    value: number;
    unit: string;
  };
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Plan映射器
 */
export class PlanMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(entity: Plan): PlanSchema {
    const schema: PlanSchema = {
      plan_id: entity.planId,
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      goals: entity.goals,
      execution_strategy: entity.executionStrategy,
      priority: entity.priority,
      status: entity.status,
      created_at: typeof entity.createdAt === 'string' ? entity.createdAt : (entity.createdAt as Date).toISOString(),
      updated_at: typeof entity.updatedAt === 'string' ? entity.updatedAt : (entity.updatedAt as Date).toISOString(),
      created_by: entity.createdBy || 'system'
    };

    // 映射tasks
    if (entity.tasks && entity.tasks.length > 0) {
      schema.tasks = entity.tasks.map(task => ({
        task_id: task.taskId,
        name: task.name,
        description: task.description || '',
        dependencies: task.dependencies,
        estimated_duration: typeof task.estimatedDuration === 'object' ? task.estimatedDuration.value : task.estimatedDuration,
        priority: task.priority,
        status: task.status,
        assigned_agents: [],
        created_by: 'system'
      }));
    }

    // 映射estimatedDuration
    if (entity.estimatedDuration) {
      schema.estimated_duration = {
        value: entity.estimatedDuration.value,
        unit: entity.estimatedDuration.unit
      };
    }

    // 映射configuration
    if (entity.configuration) {
      schema.configuration = entity.configuration;
    }

    // 映射metadata
    if (entity.metadata) {
      schema.metadata = entity.metadata;
    }

    return schema;
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: PlanSchema): PlanEntityData {
    const data: PlanEntityData = {
      planId: schema.plan_id,
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      goals: schema.goals,
      executionStrategy: schema.execution_strategy,
      priority: schema.priority,
      status: schema.status,
      createdAt: typeof schema.created_at === 'string' ? new Date(schema.created_at) : schema.created_at,
      updatedAt: typeof schema.updated_at === 'string' ? new Date(schema.updated_at) : schema.updated_at,
      createdBy: schema.created_by
    };

    // 映射tasks
    if (schema.tasks && schema.tasks.length > 0) {
      data.tasks = schema.tasks.map(task => ({
        taskId: task.task_id,
        name: task.name,
        description: task.description,
        dependencies: task.dependencies,
        estimatedDuration: task.estimated_duration,
        priority: task.priority,
        status: task.status,
        assignedAgents: task.assigned_agents,
        createdBy: task.created_by
      }));
    }

    // 映射estimatedDuration
    if (schema.estimated_duration) {
      data.estimatedDuration = {
        value: schema.estimated_duration.value,
        unit: schema.estimated_duration.unit
      };
    }

    // 映射configuration
    if (schema.configuration) {
      data.configuration = schema.configuration;
    }

    // 映射metadata
    if (schema.metadata) {
      data.metadata = schema.metadata;
    }

    return data;
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is PlanSchema {
    if (!data || typeof data !== 'object') return false;
    
    const obj = data as Record<string, unknown>;
    
    return (
      typeof obj.plan_id === 'string' &&
      typeof obj.context_id === 'string' &&
      typeof obj.name === 'string' &&
      Array.isArray(obj.goals) &&
      typeof obj.execution_strategy === 'string' &&
      typeof obj.priority === 'string' &&
      typeof obj.status === 'string' &&
      typeof obj.created_at === 'string' &&
      typeof obj.updated_at === 'string' &&
      typeof obj.created_by === 'string'
    );
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: Plan[]): PlanSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: PlanSchema[]): PlanEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }
}
