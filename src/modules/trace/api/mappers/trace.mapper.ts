/**
 * TraceMapper - Schema (snake_case) ⇄ TypeScript (camelCase)
 *
 * API层Mapper：对外严格输出Schema格式，输入可从Schema反向构建领域实体
 *
 * 注意：Schema additionalProperties=false，禁止输出未定义字段
 */

import { Trace } from '../../domain/entities/trace.entity';
import {
  PerformanceMetrics,
  ErrorInformation,
  Correlation,
  TraceEvent,
  TraceType,
  TraceSeverity,
  CreateTraceRequestInternal,
  EventType,
  EventCategory
} from '../../types';

export class TraceMapper {
  // 领域实体 → Schema 负载（snake_case）
  static toSchema(entity: Trace): Record<string, unknown> {
    const event = this.mapEventToSchema(entity.event);

    // 注意：不输出 metadata / created_at / updated_at 等非Schema字段
    const schema: Record<string, unknown> = {
      trace_id: entity.traceId,
      context_id: entity.contextId,
      protocol_version: entity.protocolVersion,
      trace_type: entity.traceType,
      severity: entity.severity,
      event,
      timestamp: entity.timestamp
    };

    if (entity.planId) schema.plan_id = entity.planId;

    if (entity.performanceMetrics) {
      schema.performance_metrics = entity.performanceMetrics as PerformanceMetrics;
    }

    if (entity.errorInformation) {
      schema.error_information = entity.errorInformation as ErrorInformation;
    }

    if (entity.correlations && entity.correlations.length > 0) {
      // Correlation 在当前类型中为 snake_case 字段，直接透传
      schema.correlations = entity.correlations as Correlation[];
    }

    // 添加 context_snapshot 映射
    if (entity.contextSnapshot) {
      schema.context_snapshot = {
        variables: entity.contextSnapshot.variables,
        environment: entity.contextSnapshot.environment,
        call_stack: entity.contextSnapshot.call_stack
      };
    }

    // 添加 decision_log 映射
    if (entity.decisionLog) {
      schema.decision_log = {
        decision_point: entity.decisionLog.decision_point,
        options_considered: entity.decisionLog.options_considered,
        selected_option: entity.decisionLog.selected_option,
        decision_criteria: entity.decisionLog.decision_criteria,
        confidence_level: entity.decisionLog.confidence_level
      };
    }

    return schema;
  }

  // Schema 负载（snake_case） → 创建请求对象（camelCase）
  // 用于控制器入参转换，返回适合工厂使用的请求对象
  static fromSchema(obj: Record<string, unknown>): CreateTraceRequestInternal {
    // 验证必需字段
    if (!obj.trace_id || typeof obj.trace_id !== 'string') {
      throw new Error('Invalid schema: trace_id is required and must be string');
    }
    if (!obj.context_id || typeof obj.context_id !== 'string') {
      throw new Error('Invalid schema: context_id is required and must be string');
    }
    if (!obj.trace_type || typeof obj.trace_type !== 'string') {
      throw new Error('Invalid schema: trace_type is required and must be string');
    }
    if (!obj.severity || typeof obj.severity !== 'string') {
      throw new Error('Invalid schema: severity is required and must be string');
    }
    if (!obj.event || typeof obj.event !== 'object') {
      throw new Error('Invalid schema: event is required and must be object');
    }

    const event = this.mapEventFromSchema(obj.event as Record<string, unknown>);

    return {
      traceId: obj.trace_id as string,
      contextId: obj.context_id as string,
      traceType: obj.trace_type as TraceType,
      severity: obj.severity as TraceSeverity,
      event,
      planId: obj.plan_id as string | undefined,
      performanceMetrics: obj.performance_metrics as PerformanceMetrics | undefined,
      errorInformation: obj.error_information as ErrorInformation | undefined,
      correlations: obj.correlations as Correlation[] | undefined,
      metadata: obj.metadata as Record<string, unknown> | undefined
    };
  }

  private static mapEventToSchema(event: TraceEvent | undefined): Record<string, unknown> {
    if (!event) {
      return {
        type: 'unknown',
        name: 'unknown',
        description: '',
        category: 'system',
        source: {
          component: 'unknown',
          module: undefined,
          function: undefined,
          line_number: undefined
        },
        data: undefined
      };
    }

    return {
      type: event.type,
      name: event.name,
      description: event.description,
      category: event.category,
      source: {
        component: event.source.component,
        module: event.source.module,
        function: event.source.function,
        line_number: event.source.line_number
      },
      data: event.data
    };
  }

  private static mapEventFromSchema(obj: Record<string, unknown>): TraceEvent {
    if (!obj.type || !obj.name || !obj.category || !obj.source) {
      throw new Error('Invalid event schema: type, name, category, source are required');
    }

    const source = obj.source as Record<string, unknown>;
    if (!source.component) {
      throw new Error('Invalid event source schema: component is required');
    }

    return {
      type: obj.type as EventType,
      name: obj.name as string,
      description: obj.description as string,
      category: obj.category as EventCategory,
      source: {
        component: source.component as string,
        module: source.module as string | undefined,
        function: source.function as string | undefined,
        line_number: source.line_number as number | undefined
      },
      data: obj.data as Record<string, unknown> | undefined
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.trace_id === 'string' &&
      typeof obj.context_id === 'string' &&
      typeof obj.trace_type === 'string' &&
      typeof obj.severity === 'string' &&
      typeof obj.event === 'object' &&
      typeof obj.timestamp === 'string'
    );
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: Trace[]): Record<string, unknown>[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: Record<string, unknown>[]): CreateTraceRequestInternal[] {
    return schemas.map(schema => this.fromSchema(schema));
  }
}

