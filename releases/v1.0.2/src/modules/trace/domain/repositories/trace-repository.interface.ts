/**
 * Trace仓库接口
 * 
 * 定义追踪数据访问的领域接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Trace } from '../entities/trace.entity';
import { TraceType, TraceSeverity, EventType } from '../../shared/types';

/**
 * 追踪查询过滤器
 */
export interface TraceFilter {
  context_id?: UUID;
  plan_id?: UUID;
  trace_type?: TraceType;
  severity?: TraceSeverity;
  event_type?: EventType;
  event_category?: string;
  source_component?: string;
  timestamp_after?: string;
  timestamp_before?: string;
  has_errors?: boolean;
  has_performance_metrics?: boolean;
  correlation_trace_id?: UUID;
}

/**
 * 分页参数
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * 追踪统计信息
 */
export interface TraceStatistics {
  total: number;
  by_type: Record<TraceType, number>;
  by_severity: Record<TraceSeverity, number>;
  error_count: number;
  performance_traces_count: number;
  average_duration_ms?: number;
}

/**
 * Trace仓库接口
 */
export interface ITraceRepository {
  /**
   * 保存追踪
   */
  save(trace: Trace): Promise<void>;

  /**
   * 根据ID查找追踪
   */
  findById(traceId: UUID): Promise<Trace | null>;

  /**
   * 根据上下文ID查找追踪列表
   */
  findByContextId(contextId: UUID): Promise<Trace[]>;

  /**
   * 根据计划ID查找追踪列表
   */
  findByPlanId(planId: UUID): Promise<Trace[]>;

  /**
   * 根据过滤器查找追踪列表
   */
  findByFilter(filter: TraceFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Trace>>;

  /**
   * 查找错误追踪
   */
  findErrors(contextId?: UUID, limit?: number): Promise<Trace[]>;

  /**
   * 查找性能追踪
   */
  findPerformanceTraces(contextId?: UUID, limit?: number): Promise<Trace[]>;

  /**
   * 根据关联查找追踪
   */
  findByCorrelation(traceId: UUID): Promise<Trace[]>;

  /**
   * 查找时间范围内的追踪
   */
  findByTimeRange(startTime: string, endTime: string, contextId?: UUID): Promise<Trace[]>;

  /**
   * 更新追踪
   */
  update(trace: Trace): Promise<void>;

  /**
   * 删除追踪
   */
  delete(traceId: UUID): Promise<void>;

  /**
   * 批量删除追踪
   */
  batchDelete(traceIds: UUID[]): Promise<void>;

  /**
   * 检查追踪是否存在
   */
  exists(traceId: UUID): Promise<boolean>;

  /**
   * 获取统计信息
   */
  getStatistics(contextId?: UUID, timeRange?: { start: string; end: string }): Promise<TraceStatistics>;

  /**
   * 清理过期追踪
   */
  cleanupExpiredTraces(olderThanDays: number): Promise<number>;

  /**
   * 获取追踪链
   */
  getTraceChain(traceId: UUID): Promise<Trace[]>;

  /**
   * 搜索追踪
   */
  search(query: string, filter?: TraceFilter): Promise<Trace[]>;
}
