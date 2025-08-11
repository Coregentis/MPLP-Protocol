/**
 * Trace模块数据传输对象
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

/**
 * 创建追踪请求DTO
 */
export interface CreateTraceRequestDTO {
  contextId: string;
  planId?: string;
  taskId?: string;
  traceType: string;
  severity: string;
  eventType: string;
  eventCategory: string;
  sourceComponent: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * 更新追踪请求DTO
 */
export interface UpdateTraceRequestDTO {
  traceId: string;
  message?: string;
  data?: Record<string, unknown>;
  severity?: string;
}

/**
 * 追踪查询请求DTO
 */
export interface TraceQueryRequestDTO {
  contextId?: string;
  planId?: string;
  taskId?: string;
  traceType?: string;
  severity?: string;
  eventType?: string;
  eventCategory?: string;
  sourceComponent?: string;
  timestampAfter?: string;
  timestampBefore?: string;
  hasErrors?: boolean;
  hasPerformanceMetrics?: boolean;
  correlationTraceId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 追踪响应DTO
 */
export interface TraceResponseDTO {
  traceId: string;
  contextId: string;
  planId?: string;
  taskId?: string;
  traceType: string;
  severity: string;
  eventType: string;
  eventCategory: string;
  sourceComponent: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  correlations?: Array<{
    traceId: string;
    relationType: string;
    strength: number;
  }>;
  performanceMetrics?: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  errorInformation?: {
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    errorCode?: string;
  };
  contextSnapshot?: {
    variables: Record<string, unknown>;
    environment: Record<string, unknown>;
    callStack: string[];
  };
  decisionLog?: {
    decisionPoint: string;
    options: string[];
    selectedOption: string;
    criteria: string[];
    confidence: number;
  };
}
