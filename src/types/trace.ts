/**
 * MPLP v1.0 Trace类型定义
 */

export interface TraceData {
  id: string;
  operation: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'success' | 'error' | 'pending' | 'cancelled';
  metadata: Record<string, unknown>;
}

export interface MPLPTraceData {
  trace_id: string;
  parent_trace_id?: string;
  context_id: string;
  trace_type: 'operation' | 'state_change' | 'error' | 'compensation';
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  operation_name: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  version: string;
  timestamp: string;
  performance_metrics: PerformanceMetrics;
  tags?: Record<string, string>;
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage_mb: number;
  network_io_bytes: number;
  disk_io_bytes: number;
  db_query_count: number;
  db_query_time_ms: number;
  api_call_count: number;
  api_call_time_ms: number;
  custom_metrics: Record<string, number>;
} 