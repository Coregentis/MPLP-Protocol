/**
 * Trace模块DTO定义
 * 
 * @description API层数据传输对象，严格基于Schema驱动开发和双重命名约定
 * @version 1.0.0
 * @layer API层 - 数据传输对象
 * @pattern 基于Context模块的IDENTICAL企业级模式
 * @schema 基于src/schemas/core-modules/mplp-trace.json
 * @naming Schema(snake_case) ↔ TypeScript(camelCase)
 */

import { 
  TraceType,
  Severity,
  EventType,
  EventCategory,
  TraceOperation,
  CreateTraceRequest,
  UpdateTraceRequest,
  TraceQueryFilter,
  EventObject,
  ContextSnapshot,
  ErrorInformation,
  DecisionLog,
  TraceDetails
} from '../../types';
import { UUID } from '../../../../shared/types';

/**
 * 创建Trace请求DTO
 * 基于CreateTraceRequest接口，确保与Schema一致
 */
export class CreateTraceDto implements CreateTraceRequest {
  contextId!: UUID;
  planId?: UUID;
  taskId?: UUID;
  traceType!: TraceType;
  severity!: Severity;
  event!: EventObject;
  traceOperation!: TraceOperation;
  contextSnapshot?: ContextSnapshot;
  errorInformation?: ErrorInformation;
  decisionLog?: DecisionLog;
  traceDetails?: TraceDetails;
}

/**
 * 更新Trace请求DTO
 * 基于UpdateTraceRequest接口，确保与Schema一致
 */
export class UpdateTraceDto implements UpdateTraceRequest {
  traceId!: UUID;
  severity?: Severity;
  event?: Partial<EventObject>;
  contextSnapshot?: Partial<ContextSnapshot>;
  errorInformation?: Partial<ErrorInformation>;
  decisionLog?: Partial<DecisionLog>;
  traceDetails?: Partial<TraceDetails>;
}

/**
 * Trace查询DTO
 * 基于TraceQueryFilter接口，确保与Schema一致
 */
export class TraceQueryDto implements TraceQueryFilter {
  contextId?: UUID;
  planId?: UUID;
  taskId?: UUID;
  traceType?: TraceType | TraceType[];
  severity?: Severity | Severity[];
  eventCategory?: EventCategory;
  createdAfter?: string;
  createdBefore?: string;
  hasErrors?: boolean;
  hasDecisions?: boolean;
}

/**
 * 事件对象DTO
 * 基于EventObject接口，确保与Schema一致
 */
export class EventObjectDto implements EventObject {
  type!: EventType;
  name!: string;
  description?: string;
  category!: EventCategory;
  source!: {
    component: string;
    module?: string;
    function?: string;
    lineNumber?: number;
  };
  data?: Record<string, unknown>;
}

/**
 * 上下文快照DTO
 * 基于ContextSnapshot接口，确保与Schema一致
 */
export class ContextSnapshotDto implements ContextSnapshot {
  variables?: Record<string, unknown>;
  callStack?: Array<{
    function: string;
    file: string;
    line: number;
    arguments?: Record<string, unknown>;
  }>;
  environment?: {
    os: string;
    platform: string;
    runtimeVersion: string;
    environmentVariables?: Record<string, string>;
  };
}

/**
 * 错误信息DTO
 * 基于ErrorInformation接口，确保与Schema一致
 */
export class ErrorInformationDto implements ErrorInformation {
  errorCode!: string;
  errorMessage!: string;
  errorType!: 'system' | 'business' | 'validation' | 'network' | 'timeout' | 'security';
  stackTrace?: Array<{
    file: string;
    function: string;
    line: number;
    column?: number;
  }>;
  recoveryActions?: Array<{
    action: 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort';
    description: string;
    parameters?: Record<string, unknown>;
  }>;
}

/**
 * 决策日志DTO
 * 基于DecisionLog接口，确保与Schema一致
 */
export class DecisionLogDto implements DecisionLog {
  decisionPoint!: string;
  optionsConsidered!: Array<{
    option: string;
    score: number;
    rationale?: string;
    riskFactors?: string[];
  }>;
  selectedOption!: string;
  decisionCriteria?: Array<{
    criterion: string;
    weight: number;
    evaluation: string;
  }>;
  confidenceLevel?: number;
}

/**
 * 追踪详情DTO
 * 基于TraceDetails接口，确保与Schema一致
 */
export class TraceDetailsDto implements TraceDetails {
  traceLevel?: 'basic' | 'detailed' | 'comprehensive';
  samplingRate?: number;
  retentionDays?: number;
}

/**
 * Trace响应DTO
 * 基于TraceEntityData，使用camelCase命名
 */
export class TraceResponseDto {
  traceId!: UUID;
  contextId!: UUID;
  planId?: UUID;
  taskId?: UUID;
  traceType!: TraceType;
  severity!: Severity;
  event!: EventObjectDto;
  timestamp!: string;
  traceOperation!: TraceOperation;
  contextSnapshot?: ContextSnapshotDto;
  errorInformation?: ErrorInformationDto;
  decisionLog?: DecisionLogDto;
  traceDetails?: TraceDetailsDto;
  protocolVersion!: string;
}

/**
 * Trace查询结果DTO
 * 基于Repository查询结果，使用标准分页格式
 */
export class TraceQueryResultDto {
  traces!: TraceResponseDto[];
  total!: number;
  page?: number;
  limit?: number;
}

/**
 * Trace操作结果DTO
 * 基于Context模块的操作结果模式
 */
export class TraceOperationResultDto {
  success!: boolean;
  traceId?: UUID;
  message!: string;
  data?: TraceResponseDto;
  error?: string;
}

/**
 * 批量操作结果DTO
 * 基于Repository批量操作结果
 */
export class BatchOperationResultDto {
  successCount!: number;
  failureCount!: number;
  results!: Array<{
    id: UUID;
    success: boolean;
    error?: string;
  }>;
}

/**
 * 健康状态DTO
 * 基于Service健康检查结果
 */
export class HealthStatusDto {
  status!: 'healthy' | 'degraded' | 'unhealthy';
  timestamp!: string;
  details?: {
    service: string;
    version: string;
    repository: {
      status: string;
      recordCount: number;
      lastOperation: string;
    };
  };
}
