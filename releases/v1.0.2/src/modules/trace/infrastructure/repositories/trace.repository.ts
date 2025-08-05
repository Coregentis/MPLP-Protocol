/**
 * Trace仓库实现
 * 
 * 基础设施层的数据访问实现
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Trace } from '../../domain/entities/trace.entity';
import { 
  ITraceRepository, 
  TraceFilter, 
  PaginationOptions, 
  PaginatedResult,
  TraceStatistics 
} from '../../domain/repositories/trace-repository.interface';
import { TraceType, TraceSeverity, EventType } from '../../shared/types';

/**
 * Trace仓库实现
 * 
 * 注意：这是一个内存实现，生产环境中应该使用真实的数据库实现
 */
export class TraceRepository implements ITraceRepository {
  private traces: Map<UUID, Trace> = new Map();

  /**
   * 保存追踪
   */
  async save(trace: Trace): Promise<void> {
    this.traces.set(trace.trace_id, trace);
  }

  /**
   * 根据ID查找追踪
   */
  async findById(traceId: UUID): Promise<Trace | null> {
    return this.traces.get(traceId) || null;
  }

  /**
   * 根据上下文ID查找追踪列表
   */
  async findByContextId(contextId: UUID): Promise<Trace[]> {
    return Array.from(this.traces.values())
      .filter(trace => trace.context_id === contextId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * 根据计划ID查找追踪列表
   */
  async findByPlanId(planId: UUID): Promise<Trace[]> {
    return Array.from(this.traces.values())
      .filter(trace => trace.plan_id === planId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * 根据过滤器查找追踪列表
   */
  async findByFilter(
    filter: TraceFilter, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Trace>> {
    let results = Array.from(this.traces.values());

    // 应用过滤器
    if (filter.context_id) {
      results = results.filter(trace => trace.context_id === filter.context_id);
    }

    if (filter.plan_id) {
      results = results.filter(trace => trace.plan_id === filter.plan_id);
    }

    if (filter.trace_type) {
      results = results.filter(trace => trace.trace_type === filter.trace_type);
    }

    if (filter.severity) {
      results = results.filter(trace => trace.severity === filter.severity);
    }

    if (filter.event_type) {
      results = results.filter(trace => trace.event.type === filter.event_type);
    }

    if (filter.event_category) {
      results = results.filter(trace => trace.event.category === filter.event_category);
    }

    if (filter.source_component) {
      results = results.filter(trace => trace.event.source.component === filter.source_component);
    }

    if (filter.timestamp_after) {
      results = results.filter(trace => trace.timestamp >= filter.timestamp_after!);
    }

    if (filter.timestamp_before) {
      results = results.filter(trace => trace.timestamp <= filter.timestamp_before!);
    }

    if (filter.has_errors !== undefined) {
      results = results.filter(trace => trace.isError() === filter.has_errors);
    }

    if (filter.has_performance_metrics !== undefined) {
      results = results.filter(trace => trace.isPerformanceTrace() === filter.has_performance_metrics);
    }

    if (filter.correlation_trace_id) {
      results = results.filter(trace => 
        trace.correlations.some(c => c.related_trace_id === filter.correlation_trace_id)
      );
    }

    // 排序
    if (pagination?.sort_by) {
      results.sort((a, b) => {
        const aValue = this.getPropertyValue(a, pagination.sort_by!);
        const bValue = this.getPropertyValue(b, pagination.sort_by!);
        
        if (pagination.sort_order === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    } else {
      // 默认按时间戳排序
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // 分页
    const total = results.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;
    
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      items: paginatedResults,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    };
  }

  /**
   * 查找错误追踪
   */
  async findErrors(contextId?: UUID, limit?: number): Promise<Trace[]> {
    let results = Array.from(this.traces.values())
      .filter(trace => trace.isError());

    if (contextId) {
      results = results.filter(trace => trace.context_id === contextId);
    }

    // 按时间戳倒序排序
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * 查找性能追踪
   */
  async findPerformanceTraces(contextId?: UUID, limit?: number): Promise<Trace[]> {
    let results = Array.from(this.traces.values())
      .filter(trace => trace.isPerformanceTrace());

    if (contextId) {
      results = results.filter(trace => trace.context_id === contextId);
    }

    // 按时间戳倒序排序
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * 根据关联查找追踪
   */
  async findByCorrelation(traceId: UUID): Promise<Trace[]> {
    const results: Trace[] = [];
    const visited = new Set<UUID>();
    const queue = [traceId];

    while (queue.length > 0) {
      const currentTraceId = queue.shift()!;
      if (visited.has(currentTraceId)) continue;
      
      visited.add(currentTraceId);
      const trace = this.traces.get(currentTraceId);
      
      if (trace) {
        results.push(trace);
        
        // 添加相关的追踪ID到队列
        trace.correlations.forEach(correlation => {
          if (!visited.has(correlation.related_trace_id)) {
            queue.push(correlation.related_trace_id);
          }
        });
      }
    }

    return results;
  }

  /**
   * 查找时间范围内的追踪
   */
  async findByTimeRange(startTime: string, endTime: string, contextId?: UUID): Promise<Trace[]> {
    let results = Array.from(this.traces.values())
      .filter(trace => {
        const traceTime = new Date(trace.timestamp).getTime();
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        return traceTime >= start && traceTime <= end;
      });

    if (contextId) {
      results = results.filter(trace => trace.context_id === contextId);
    }

    return results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * 更新追踪
   */
  async update(trace: Trace): Promise<void> {
    this.traces.set(trace.trace_id, trace);
  }

  /**
   * 删除追踪
   */
  async delete(traceId: UUID): Promise<void> {
    this.traces.delete(traceId);
  }

  /**
   * 批量删除追踪
   */
  async batchDelete(traceIds: UUID[]): Promise<void> {
    traceIds.forEach(id => this.traces.delete(id));
  }

  /**
   * 检查追踪是否存在
   */
  async exists(traceId: UUID): Promise<boolean> {
    return this.traces.has(traceId);
  }

  /**
   * 获取统计信息
   */
  async getStatistics(
    contextId?: UUID, 
    timeRange?: { start: string; end: string }
  ): Promise<TraceStatistics> {
    let traces = Array.from(this.traces.values());
    
    if (contextId) {
      traces = traces.filter(trace => trace.context_id === contextId);
    }

    if (timeRange) {
      traces = traces.filter(trace => {
        const traceTime = new Date(trace.timestamp).getTime();
        const start = new Date(timeRange.start).getTime();
        const end = new Date(timeRange.end).getTime();
        return traceTime >= start && traceTime <= end;
      });
    }

    const total = traces.length;
    const errorCount = traces.filter(t => t.isError()).length;
    const performanceTracesCount = traces.filter(t => t.isPerformanceTrace()).length;
    
    const by_type = traces.reduce((acc, trace) => {
      acc[trace.trace_type] = (acc[trace.trace_type] || 0) + 1;
      return acc;
    }, {} as Record<TraceType, number>);

    const by_severity = traces.reduce((acc, trace) => {
      acc[trace.severity] = (acc[trace.severity] || 0) + 1;
      return acc;
    }, {} as Record<TraceSeverity, number>);

    // 计算平均持续时间
    const durations = traces
      .map(t => t.getExecutionDuration())
      .filter(d => d !== undefined) as number[];
    
    const average_duration_ms = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : undefined;

    return {
      total,
      by_type,
      by_severity,
      error_count: errorCount,
      performance_traces_count: performanceTracesCount,
      average_duration_ms
    };
  }

  /**
   * 清理过期追踪
   */
  async cleanupExpiredTraces(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const expiredTraces = Array.from(this.traces.values())
      .filter(trace => new Date(trace.created_at) < cutoffDate);
    
    expiredTraces.forEach(trace => this.traces.delete(trace.trace_id));
    
    return expiredTraces.length;
  }

  /**
   * 获取追踪链
   */
  async getTraceChain(traceId: UUID): Promise<Trace[]> {
    return this.findByCorrelation(traceId);
  }

  /**
   * 搜索追踪
   */
  async search(query: string, filter?: TraceFilter): Promise<Trace[]> {
    let results = Array.from(this.traces.values());

    // 应用过滤器
    if (filter) {
      const filteredResult = await this.findByFilter(filter, { page: 1, limit: 10000 });
      results = filteredResult.items;
    }

    // 搜索匹配
    const searchResults = results.filter(trace => {
      const searchText = query.toLowerCase();
      return (
        trace.event.name.toLowerCase().includes(searchText) ||
        trace.event.description?.toLowerCase().includes(searchText) ||
        trace.event.source.component.toLowerCase().includes(searchText) ||
        trace.trace_type.toLowerCase().includes(searchText) ||
        trace.severity.toLowerCase().includes(searchText)
      );
    });

    return searchResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * 获取属性值用于排序
   */
  private getPropertyValue(trace: Trace, property: string): string {
    switch (property) {
      case 'timestamp':
        return trace.timestamp;
      case 'created_at':
        return trace.created_at;
      case 'severity':
        return trace.severity;
      case 'trace_type':
        return trace.trace_type;
      case 'event_name':
        return trace.event.name;
      default:
        return trace.timestamp;
    }
  }
}
