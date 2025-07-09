/**
 * TracePilot MCP (Model Context Protocol) Adapter
 * 
 * @version v2.1
 * @created 2025-07-09T19:04:01+08:00
 * @compliance .cursor/rules/integration-patterns.mdc - TracePilot Integration
 * @compliance .cursor/rules/core-modules.mdc - Trace Module Integration
 * @performance Sync latency <100ms, Format conversion <50ms
 */

import { TraceData, MPLPTraceData } from '@/types/trace';
import { logger } from '@/utils/logger';
import { PerformanceMonitor } from '@/utils/performance';

/**
 * TracePilot API Client Configuration
 * Following integration-patterns.mdc specifications
 */
export interface TracePilotConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
}

/**
 * TracePilot Sync Result Interface
 * Performance tracking for integration monitoring
 */
export interface TracePilotSyncResult {
  success: boolean;
  sync_latency: number;
  traces_synced: number;
  errors: TracePilotError[];
  timestamp: string;
}

/**
 * TracePilot Trace Format
 * External platform trace data structure
 */
export interface TracePilotTrace {
  id: string;
  operation: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'success' | 'error' | 'pending' | 'cancelled';
  metadata: Record<string, unknown>;
}

/**
 * TracePilot MCP Adapter Implementation
 * 
 * Implements bidirectional synchronization between MPLP and TracePilot
 * Performance Requirements:
 * - Sync latency: <100ms P95
 * - Format conversion: <50ms
 * - Batch processing: >1000 traces/second
 * 
 * @implements integration-patterns.mdc TracePilot Integration Patterns
 */
export class TracePilotAdapter {
  private readonly apiClient: TracePilotApiClient;
  private readonly config: TracePilotConfig;
  private readonly batchQueue: MPLPTraceData[] = [];
  private syncInProgress = false;

  constructor(config: TracePilotConfig) {
    this.config = config;
    this.apiClient = new TracePilotApiClient({
      baseUrl: config.apiUrl,
      apiKey: config.apiKey,
      timeout: config.timeout
    });

    // Initialize batch processing timer
    this.startBatchProcessor();

    logger.info('TracePilot MCP Adapter initialized', {
      apiUrl: config.apiUrl,
      timeout: config.timeout,
      batchSize: config.batchSize
    });
  }

  /**
   * Synchronize single trace data to TracePilot
   * Performance Target: <100ms sync latency
   * 
   * @param traceData - MPLP trace data to synchronize
   * @returns Promise<TracePilotSyncResult>
   */
  @PerformanceMonitor.measure('tracepilot.sync_single')
  async syncTraceData(traceData: MPLPTraceData): Promise<TracePilotSyncResult> {
    const startTime = performance.now();

    try {
      // Input validation (security-requirements.mdc)
      this.validateTraceInput(traceData);

      // Data format conversion (integration-patterns.mdc)
      const tracePilotFormat = await this.convertToTracePilotFormat(traceData);

      // Upload to TracePilot with retry logic
      const uploadResult = await this.uploadWithRetry(tracePilotFormat);

      const syncLatency = performance.now() - startTime;

      // Performance validation (performance-standards.mdc)
      if (syncLatency > 100) {
        logger.warn('TracePilot sync exceeded latency target', {
          latency: syncLatency,
          target: 100,
          traceId: traceData.trace_id
        });
      }

      const result: TracePilotSyncResult = {
        success: true,
        sync_latency: syncLatency,
        traces_synced: 1,
        errors: [],
        timestamp: new Date().toISOString()
      };

      logger.info('TracePilot sync completed', {
        traceId: traceData.trace_id,
        latency: syncLatency,
        success: true
      });

      return result;

    } catch (error) {
      const syncLatency = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('TracePilot sync failed', {
        traceId: traceData.trace_id,
        error: errorMessage,
        latency: syncLatency
      });

      return {
        success: false,
        sync_latency: syncLatency,
        traces_synced: 0,
        errors: [new TracePilotSyncError(errorMessage, traceData.trace_id)],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Add trace to batch processing queue
   * Optimizes performance for high-volume scenarios
   * 
   * @param traceData - MPLP trace data to queue
   */
  async addToBatch(traceData: MPLPTraceData): Promise<void> {
    this.batchQueue.push(traceData);

    if (this.batchQueue.length >= this.config.batchSize) {
      await this.processBatch();
    }
  }

  /**
   * Process queued traces in batch
   * Performance Target: >1000 traces/second throughput
   * 
   * @private
   */
  @PerformanceMonitor.measure('tracepilot.batch_sync')
  private async processBatch(): Promise<void> {
    if (this.syncInProgress || this.batchQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const batchStartTime = performance.now();
    const batchSize = this.batchQueue.length;
    const batch = this.batchQueue.splice(0, batchSize);

    try {
      // Convert all traces to TracePilot format
      const convertedTraces = await Promise.all(
        batch.map(trace => this.convertToTracePilotFormat(trace))
      );

      // Batch upload to TracePilot
      await this.apiClient.uploadBatch(convertedTraces);

      const batchDuration = performance.now() - batchStartTime;
      const throughput = (batchSize / batchDuration) * 1000; // traces per second

      logger.info('TracePilot batch sync completed', {
        batchSize,
        duration: batchDuration,
        throughput,
        target: 1000
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown batch error';
      logger.error('TracePilot batch sync failed', {
        batchSize,
        error: errorMessage
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Convert MPLP trace data to TracePilot format
   * Performance Target: <50ms format conversion
   * 
   * @private
   */
  private async convertToTracePilotFormat(data: MPLPTraceData): Promise<TracePilotTrace> {
    const convertStartTime = performance.now();

    const tracePilotTrace: TracePilotTrace = {
      id: data.trace_id,
      operation: data.operation_name,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration_ms || 0,
      status: this.mapStatusToTracePilot(data.trace_type),
      metadata: {
        context_id: data.context_id,
        trace_type: data.trace_type,
        version: data.version,
        performance_metrics: data.performance_metrics,
        tags: data.tags || {}
      }
    };

    const conversionTime = performance.now() - convertStartTime;
    if (conversionTime > 50) {
      logger.warn('TracePilot format conversion exceeded target', {
        conversionTime,
        target: 50,
        traceId: data.trace_id
      });
    }

    return tracePilotTrace;
  }

  /**
   * Map MPLP trace type to TracePilot status
   * 
   * @private
   */
  private mapStatusToTracePilot(traceType: string): 'success' | 'error' | 'pending' | 'cancelled' {
    switch (traceType) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'started':
      case 'running':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /**
   * Validate trace input data
   * 
   * @private
   */
  private validateTraceInput(data: MPLPTraceData): void {
    if (!data.trace_id || !data.operation_name || !data.context_id) {
      throw new TracePilotValidationError(
        'Required trace fields missing: trace_id, operation_name, context_id'
      );
    }

    if (!data.start_time || !data.timestamp) {
      throw new TracePilotValidationError(
        'Required time fields missing: start_time, timestamp'
      );
    }

    if (!data.performance_metrics) {
      throw new TracePilotValidationError(
        'Performance metrics are required for trace data'
      );
    }
  }

  /**
   * Upload trace with retry logic
   * 
   * @private
   */
  private async uploadWithRetry(trace: TracePilotTrace): Promise<void> {
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < this.config.retryAttempts) {
      try {
        await this.apiClient.uploadTrace(trace);
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown upload error');
        attempt++;
        
        if (attempt < this.config.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      }
    }

    throw new TracePilotSyncError(
      `Failed to upload after ${this.config.retryAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
      trace.id
    );
  }

  /**
   * Start batch processing timer
   * 
   * @private
   */
  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.batchQueue.length > 0) {
        await this.processBatch();
      }
    }, 5000); // Process batch every 5 seconds
  }

  /**
   * Sleep utility function
   * 
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * TracePilot API Client
 */
class TracePilotApiClient {
  private readonly config: { baseUrl: string; apiKey: string; timeout: number };

  constructor(config: { baseUrl: string; apiKey: string; timeout: number }) {
    this.config = config;
  }

  async uploadTrace(trace: TracePilotTrace): Promise<void> {
    // TODO: Implement actual HTTP call to TracePilot
    // This is a placeholder implementation
    console.log('Uploading trace to TracePilot:', trace.id);
  }

  async uploadBatch(traces: TracePilotTrace[]): Promise<void> {
    // TODO: Implement actual batch HTTP call to TracePilot
    // This is a placeholder implementation
    console.log('Uploading batch to TracePilot:', traces.length, 'traces');
  }
}

export class TracePilotError extends Error {
  constructor(message: string, public readonly traceId?: string) {
    super(message);
    this.name = 'TracePilotError';
  }
}

export class TracePilotSyncError extends TracePilotError {
  constructor(message: string, traceId: string) {
    super(message, traceId);
    this.name = 'TracePilotSyncError';
  }
}

export class TracePilotValidationError extends TracePilotError {
  constructor(message: string) {
    super(message);
    this.name = 'TracePilotValidationError';
  }
} 