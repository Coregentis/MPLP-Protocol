/**
 * Trace工厂
 * 
 * 负责创建Trace领域实体的工厂类
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../../shared/types';
import { Trace } from '../entities/trace.entity';
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent,
  EventType,
  EventCategory,
  EventSource,
  PerformanceMetrics,
  ErrorInformation,
  Correlation,
  TraceMetadata 
} from '../../shared/types';

/**
 * 创建追踪请求
 */
export interface CreateTraceRequest {
  context_id: UUID;
  plan_id?: UUID;
  trace_type: TraceType;
  severity: TraceSeverity;
  event: TraceEvent;
  timestamp?: string;
  performance_metrics?: PerformanceMetrics;
  error_information?: ErrorInformation;
  correlations?: Correlation[];
  metadata?: TraceMetadata;
}

/**
 * Trace工厂
 */
export class TraceFactory {
  private static readonly PROTOCOL_VERSION = '1.0.0';

  /**
   * 创建新的追踪实体
   */
  static create(request: CreateTraceRequest): Trace {
    const now = new Date().toISOString();
    const traceId = uuidv4();
    const timestamp = request.timestamp || now;

    return new Trace(
      traceId,
      request.context_id,
      this.PROTOCOL_VERSION,
      request.trace_type,
      request.severity,
      request.event,
      timestamp,
      now,
      now,
      request.plan_id,
      request.performance_metrics,
      request.error_information,
      request.correlations || [],
      request.metadata
    );
  }

  /**
   * 创建执行追踪
   */
  static createExecutionTrace(
    context_id: UUID,
    eventName: string,
    component: string,
    eventType: EventType = 'start',
    plan_id?: UUID,
    data?: Record<string, unknown>
  ): Trace {
    const event: TraceEvent = {
      type: eventType,
      name: eventName,
      category: 'system',
      source: {
        component,
        module: 'execution'
      },
      data
    };

    return this.create({
      context_id,
      plan_id,
      trace_type: 'execution',
      severity: 'info',
      event
    });
  }

  /**
   * 创建错误追踪
   */
  static createErrorTrace(
    context_id: UUID,
    errorMessage: string,
    component: string,
    errorType: string = 'system',
    plan_id?: UUID,
    errorDetails?: any
  ): Trace {
    const event: TraceEvent = {
      type: 'failure',
      name: 'Error Occurred',
      description: errorMessage,
      category: 'system',
      source: {
        component,
        module: 'error_handling'
      },
      data: errorDetails
    };

    const errorInformation: ErrorInformation = {
      error_type: errorType as any,
      error_message: errorMessage,
      error_code: 'SYSTEM_ERROR',
      stack_trace: errorDetails?.stack,
      recovery_actions: []
    };

    return this.create({
      context_id,
      plan_id,
      trace_type: 'error',
      severity: 'error',
      event,
      error_information: errorInformation
    });
  }

  /**
   * 创建性能追踪
   */
  static createPerformanceTrace(
    context_id: UUID,
    operationName: string,
    component: string,
    durationMs: number,
    plan_id?: UUID,
    additionalMetrics?: Partial<PerformanceMetrics>
  ): Trace {
    const event: TraceEvent = {
      type: 'completion',
      name: operationName,
      category: 'system',
      source: {
        component,
        module: 'performance'
      },
      data: { duration_ms: durationMs }
    };

    const performanceMetrics: PerformanceMetrics = {
      execution_time: {
        start_time: new Date(Date.now() - durationMs).toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: durationMs
      },
      ...additionalMetrics
    };

    return this.create({
      context_id,
      plan_id,
      trace_type: 'performance',
      severity: durationMs > 1000 ? 'warn' : 'info',
      event,
      performance_metrics: performanceMetrics
    });
  }

  /**
   * 创建监控追踪
   */
  static createMonitoringTrace(
    context_id: UUID,
    metricName: string,
    component: string,
    metricValue: number | string | boolean,
    plan_id?: UUID
  ): Trace {
    const event: TraceEvent = {
      type: 'checkpoint',
      name: `Metric: ${metricName}`,
      category: 'system',
      source: {
        component,
        module: 'monitoring'
      },
      data: { 
        metric_name: metricName,
        metric_value: metricValue 
      }
    };

    return this.create({
      context_id,
      plan_id,
      trace_type: 'monitoring',
      severity: 'info',
      event
    });
  }

  /**
   * 创建审计追踪
   */
  static createAuditTrace(
    context_id: UUID,
    action: string,
    component: string,
    userId?: string,
    plan_id?: UUID,
    auditData?: Record<string, unknown>
  ): Trace {
    const event: TraceEvent = {
      type: 'checkpoint',
      name: `Audit: ${action}`,
      category: 'user',
      source: {
        component,
        module: 'audit'
      },
      data: {
        action,
        user_id: userId,
        ...auditData
      }
    };

    return this.create({
      context_id,
      plan_id,
      trace_type: 'audit',
      severity: 'info',
      event,
      metadata: {
        audit_action: action,
        user_id: userId
      }
    });
  }

  /**
   * 创建决策追踪
   */
  static createDecisionTrace(
    context_id: UUID,
    decisionName: string,
    component: string,
    decision: any,
    plan_id?: UUID,
    reasoning?: string
  ): Trace {
    const event: TraceEvent = {
      type: 'checkpoint',
      name: `Decision: ${decisionName}`,
      category: 'system',
      source: {
        component,
        module: 'decision_engine'
      },
      data: {
        decision,
        reasoning
      }
    };

    return this.create({
      context_id,
      plan_id,
      trace_type: 'decision',
      severity: 'info',
      event,
      metadata: {
        decision_name: decisionName,
        decision_result: decision
      }
    });
  }

  /**
   * 从协议数据重建追踪实体
   */
  static fromProtocol(protocol: any): Trace {
    return Trace.fromProtocol(protocol);
  }

  /**
   * 创建事件源
   */
  static createEventSource(
    component: string,
    module?: string,
    functionName?: string,
    lineNumber?: number
  ): EventSource {
    return {
      component,
      module,
      function: functionName,
      line_number: lineNumber
    };
  }

  /**
   * 验证创建请求
   */
  static validateCreateRequest(request: CreateTraceRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.context_id) {
      errors.push('上下文ID不能为空');
    }

    if (!request.event?.name) {
      errors.push('事件名称不能为空');
    }

    if (!request.event?.source?.component) {
      errors.push('事件源组件不能为空');
    }

    if (request.trace_type === 'error' && !request.error_information) {
      errors.push('错误类型的追踪必须包含错误信息');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
