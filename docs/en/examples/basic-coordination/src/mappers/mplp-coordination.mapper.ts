/**
 * MPLP Coordination Example Schema-TypeScript Mapper
 *
 * Mapping implementation based on actual MPLP v1.0 Alpha Schema
 * Implements dual naming convention mapping functions:
 * - Schema layer: snake_case (context_id, plan_id, trace_id)
 * - TypeScript layer: camelCase (contextId, planId, traceId)
 *
 * @author MPLP Community
 * @version 1.0.0-alpha
 */

import { 
  MPLPContext, 
  MPLPPlan, 
  MPLPTrace,
  CoordinationResult,
  ParticipantStatus,
  CoordinationConfig
} from '../types/result.types';

// ===== SCHEMA INTERFACES (snake_case) =====

/**
 * Schema层MPLP上下文接口 (snake_case)
 * 基于 src/schemas/core-modules/mplp-context.json
 */
export interface MPLPContextSchema {
  protocol_version: string;
  timestamp: string;
  context_id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed' | 'failed';
  participants: string[];
  goals: Array<{
    name: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  }>;
}

/**
 * Schema层MPLP计划接口 (snake_case)
 * 基于 src/schemas/core-modules/mplp-plan.json
 */
export interface MPLPPlanSchema {
  protocol_version: string;
  timestamp: string;
  plan_id: string;
  context_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'failed' | 'cancelled';
  tasks: Array<{
    task_id: string;
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    dependencies: string[];
    estimated_duration?: number;
  }>;
}

/**
 * Schema层MPLP追踪接口 (snake_case)
 * 基于 src/schemas/core-modules/mplp-trace.json
 */
export interface MPLPTraceSchema {
  protocol_version: string;
  timestamp: string;
  trace_id: string;
  context_id?: string;
  plan_id?: string;
  steps: Array<{
    step_id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    start_time: string;
    end_time?: string;
    execution_time_ms?: number;
    result?: any;
    error?: string;
  }>;
}

// ===== MAPPER CLASSES =====

/**
 * MPLP上下文映射器
 */
export class MPLPContextMapper {
  /**
   * TypeScript对象转换为Schema格式
   */
  static toSchema(entity: MPLPContext): MPLPContextSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      participants: entity.participants,
      goals: entity.goals
    };
  }

  /**
   * Schema格式转换为TypeScript对象
   */
  static fromSchema(schema: MPLPContextSchema): MPLPContext {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      participants: schema.participants,
      goals: schema.goals
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(schema: any): schema is MPLPContextSchema {
    return schema &&
      typeof schema.protocol_version === 'string' &&
      typeof schema.context_id === 'string' &&
      typeof schema.name === 'string' &&
      ['active', 'inactive', 'completed', 'failed'].includes(schema.status) &&
      Array.isArray(schema.participants) &&
      Array.isArray(schema.goals);
  }
}

/**
 * MPLP计划映射器
 */
export class MPLPPlanMapper {
  /**
   * TypeScript对象转换为Schema格式
   */
  static toSchema(entity: MPLPPlan): MPLPPlanSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      plan_id: entity.planId,
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      tasks: entity.tasks.map(task => ({
        task_id: task.taskId,
        name: task.name,
        description: task.description,
        status: task.status,
        dependencies: task.dependencies,
        estimated_duration: task.estimatedDuration
      }))
    };
  }

  /**
   * Schema格式转换为TypeScript对象
   */
  static fromSchema(schema: MPLPPlanSchema): MPLPPlan {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      planId: schema.plan_id,
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      tasks: schema.tasks.map(task => ({
        taskId: task.task_id,
        name: task.name,
        description: task.description,
        status: task.status,
        dependencies: task.dependencies,
        estimatedDuration: task.estimated_duration
      }))
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(schema: any): schema is MPLPPlanSchema {
    return schema &&
      typeof schema.protocol_version === 'string' &&
      typeof schema.plan_id === 'string' &&
      typeof schema.context_id === 'string' &&
      typeof schema.name === 'string' &&
      ['draft', 'active', 'completed', 'failed', 'cancelled'].includes(schema.status) &&
      Array.isArray(schema.tasks);
  }
}

/**
 * MPLP追踪映射器
 */
export class MPLPTraceMapper {
  /**
   * TypeScript对象转换为Schema格式
   */
  static toSchema(entity: MPLPTrace): MPLPTraceSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      trace_id: entity.traceId,
      context_id: entity.contextId,
      plan_id: entity.planId,
      steps: entity.steps.map(step => ({
        step_id: step.stepId,
        name: step.name,
        status: step.status,
        start_time: step.startTime,
        end_time: step.endTime,
        execution_time_ms: step.executionTimeMs,
        result: step.result,
        error: step.error
      }))
    };
  }

  /**
   * Schema格式转换为TypeScript对象
   */
  static fromSchema(schema: MPLPTraceSchema): MPLPTrace {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      traceId: schema.trace_id,
      contextId: schema.context_id,
      planId: schema.plan_id,
      steps: schema.steps.map(step => ({
        stepId: step.step_id,
        name: step.name,
        status: step.status,
        startTime: step.start_time,
        endTime: step.end_time,
        executionTimeMs: step.execution_time_ms,
        result: step.result,
        error: step.error
      }))
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(schema: any): schema is MPLPTraceSchema {
    return schema &&
      typeof schema.protocol_version === 'string' &&
      typeof schema.trace_id === 'string' &&
      Array.isArray(schema.steps);
  }
}

// ===== 批量转换工具函数 =====

/**
 * 批量转换TypeScript对象数组为Schema格式
 */
export function toSchemaArray<T, S>(
  entities: T[], 
  mapper: { toSchema: (entity: T) => S }
): S[] {
  return entities.map(entity => mapper.toSchema(entity));
}

/**
 * 批量转换Schema格式数组为TypeScript对象
 */
export function fromSchemaArray<T, S>(
  schemas: S[], 
  mapper: { fromSchema: (schema: S) => T }
): T[] {
  return schemas.map(schema => mapper.fromSchema(schema));
}

/**
 * 批量验证Schema格式数组
 */
export function validateSchemaArray<S>(
  schemas: any[], 
  validator: (schema: any) => schema is S
): schemas is S[] {
  return Array.isArray(schemas) && schemas.every(schema => validator(schema));
}
