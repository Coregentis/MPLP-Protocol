/**
 * MPLP Trace Module Template
 * 
 * @version v2.2
 * @created 2025-07-15T10:30:00+08:00
 * @template For creating new trace-related modules
 * @compliance .cursor/rules/trace-lifecycle.mdc - Trace Module Specifications
 */

import { TraceProtocol, TraceData, PerformanceMetrics } from '../types/trace';
import { ITraceAdapter } from '../interfaces/trace-adapter.interface';
import { logger } from '../utils/logger';
import { PerformanceMonitor } from '../core/performance/performance-monitor';

/**
 * Trace Module Template Class
 * Performance Requirement: <2ms for trace recording, <20ms for queries
 * 
 * @implements TraceProtocol from trace-protocol.json
 */
export class TraceModuleTemplate {
  private readonly moduleName: string;
  private readonly performanceTarget: number;
  private traceAdapter: ITraceAdapter;

  constructor(
    moduleName: string, 
    traceAdapter: ITraceAdapter,
    performanceTarget: number = 2
  ) {
    this.moduleName = moduleName;
    this.traceAdapter = traceAdapter;
    this.performanceTarget = performanceTarget;
  }

  /**
   * Record trace operation with performance monitoring
   * Performance Target: <2ms (from trace-lifecycle.mdc)
   * 
   * @param operation - Operation being traced
   * @param data - Trace data payload
   * @returns Promise<TraceResult>
   */
  @PerformanceMonitor.measure('trace.record')
  async recordTrace(operation: string, data: TraceData): Promise<TraceResult> {
    const startTime = performance.now();
    
    try {
      // Validate input according to security-requirements.mdc
      this.validateTraceInput(data);
      
      // Record trace with structured logging (monitoring-logging.mdc)
      const traceRecord = await this.createTraceRecord(operation, data);
      
      // Sync with trace adapter (厂商中立原则)
      await this.traceAdapter.syncTraceData({
        trace_id: traceRecord.trace_id,
        operation_name: operation,
        timestamp: traceRecord.start_time,
        data: traceRecord
      });
      
      const duration = performance.now() - startTime;
      
      // Performance validation (performance-standards.mdc)
      if (duration > this.performanceTarget) {
        logger.warn('Trace recording exceeded performance target', {
          operation,
          duration,
          target: this.performanceTarget,
          module: this.moduleName
        });
      }
      
      return {
        success: true,
        trace_id: traceRecord.trace_id,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Trace recording failed', {
        operation,
        error: error instanceof Error ? error.message : String(error),
        module: this.moduleName
      });
      
      throw new TraceError(
        `Failed to record trace for operation: ${operation}`,
        'TRACE_RECORD_FAILED',
        { operation, moduleName: this.moduleName }
      );
    }
  }

  /**
   * Query trace data with performance optimization
   * Performance Target: <20ms (from trace-lifecycle.mdc)
   * 
   * @param query - Trace query parameters
   * @returns Promise<TraceQueryResult>
   */
  @PerformanceMonitor.measure('trace.query')
  async queryTraces(query: TraceQuery): Promise<TraceQueryResult> {
    const startTime = performance.now();
    
    try {
      // Use adapter to query traces (厂商中立原则)
      const result = await this.traceAdapter.queryTraces({
        operation: query.operation,
        time_range: query.timeRange ? {
          start: query.timeRange.start,
          end: query.timeRange.end
        } : undefined,
        filters: query.filters
      });
      
      const duration = performance.now() - startTime;
      
      return {
        traces: result.traces,
        total: result.total,
        duration
      };
    } catch (error) {
      logger.error('Trace query failed', {
        query,
        error: error instanceof Error ? error.message : String(error),
        module: this.moduleName
      });
      
      throw new TraceError(
        'Failed to query traces',
        'TRACE_QUERY_FAILED',
        { query, moduleName: this.moduleName }
      );
    }
  }

  /**
   * Handle trace failure resolution
   * Performance Target: <50ms for failure analysis
   * 
   * @param traceId - Failed trace identifier
   * @returns Promise<FailureResolution>
   */
  @PerformanceMonitor.measure('trace.failure_resolver')
  async resolveFailure(traceId: string): Promise<FailureResolution> {
    const startTime = performance.now();
    
    try {
      // Get recovery suggestions from adapter (厂商中立原则)
      const suggestions = await this.traceAdapter.getRecoverySuggestions(traceId);
      
      // Apply recovery actions
      const actions: CompensationAction[] = [];
      
      for (const suggestion of suggestions) {
        const action: CompensationAction = {
          action_type: suggestion.action_type,
          description: suggestion.description,
          executed_at: new Date().toISOString()
        };
        
        // Execute recovery action
        // TODO: Implement recovery action execution
        
        actions.push(action);
      }
      
      const duration = performance.now() - startTime;
      
      return {
        resolved: actions.length > 0,
        actions,
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error) {
      logger.error('Failure resolution failed', {
        trace_id: traceId,
        error: error instanceof Error ? error.message : String(error),
        module: this.moduleName
      });
      
      throw new TraceError(
        'Failed to resolve trace failure',
        'FAILURE_RESOLUTION_FAILED',
        { traceId, moduleName: this.moduleName }
      );
    }
  }

  /**
   * Validate trace input according to security requirements
   * 
   * @private
   * @param data - Trace data to validate
   * @throws {TraceValidationError} When validation fails
   */
  private validateTraceInput(data: TraceData): void {
    // Input validation following security-requirements.mdc
    if (!data || typeof data !== 'object') {
      throw new TraceValidationError('Invalid trace data format');
    }
    
    // Additional validation logic based on specific requirements
    // TODO: Add specific validation rules
  }

  /**
   * Create structured trace record
   * 
   * @private
   * @param operation - Operation name
   * @param data - Trace data
   * @returns Promise<TraceRecord>
   */
  private async createTraceRecord(operation: string, data: TraceData): Promise<TraceRecord> {
    return {
      trace_id: crypto.randomUUID(),
      operation_name: operation,
      start_time: new Date().toISOString(),
      performance_metrics: {
        cpu_usage_percent: 0,
        memory_usage_mb: 0,
        response_time_ms: 0
      },
      trace_type: 'operation',
      metadata: data
    };
  }
  
  /**
   * Set trace adapter (supports adapter replacement)
   * 
   * @param adapter - New trace adapter implementation
   */
  public setTraceAdapter(adapter: ITraceAdapter): void {
    this.traceAdapter = adapter;
  }
}

/**
 * Trace Error Classes (following error handling standards)
 */
export class TraceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TraceError';
  }
}

export class TraceValidationError extends TraceError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'TRACE_VALIDATION_ERROR', context);
    this.name = 'TraceValidationError';
  }
}

/**
 * Interface Definitions (following api-design.mdc patterns)
 */
export interface TraceResult {
  success: boolean;
  trace_id: string;
  duration: number;
  timestamp: string;
}

export interface TraceQuery {
  operation?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, unknown>;
}

export interface TraceQueryResult {
  traces: TraceRecord[];
  total: number;
  duration: number;
}

export interface FailureResolution {
  resolved: boolean;
  actions: CompensationAction[];
  timestamp: string;
  duration: number;
}

export interface CompensationAction {
  action_type: string;
  description: string;
  executed_at: string;
}

export interface TraceRecord {
  trace_id: string;
  operation_name: string;
  start_time: string;
  end_time?: string;
  performance_metrics: PerformanceMetrics;
  trace_type: 'operation' | 'state_change' | 'error' | 'compensation';
  compensation_actions?: CompensationAction[];
  metadata?: Record<string, unknown>;
} 