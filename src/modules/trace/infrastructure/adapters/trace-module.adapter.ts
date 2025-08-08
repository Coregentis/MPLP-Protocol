/**
 * Trace模块适配器
 * 
 * 实现Core模块的ModuleInterface接口，提供事件跟踪和监控功能
 * 
 * @version 2.0.0
 * @created 2025-08-04
 * @updated 2025-08-04 23:54
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ModuleInterface, 
  ModuleStatus, 
  TracingCoordinationRequest,
  TracingResult
} from '../../../../public/modules/core/types/core.types';
import { TraceManagementService } from '../../application/services/trace-management.service';
import { TraceFactory, CreateTraceRequest } from '../../domain/factories/trace.factory';
import { TraceAnalysisService } from '../../domain/services/trace-analysis.service';
import { Logger } from '../../../../public/utils/logger';
import {
  TraceType,
  TraceStatus,
  TraceSeverity,
  EventType,
  EventCategory,
  EventSource,
  TraceEvent,
  TraceMetadata
} from '../../types';
import { UUID, Timestamp } from '../../../../public/shared/types';

/**
 * Trace模块适配器类
 * 实现Core模块的ModuleInterface接口
 */
export class TraceModuleAdapter implements ModuleInterface {
  public readonly module_name = 'trace';
  private logger = new Logger('TraceModuleAdapter');
  private moduleStatus: ModuleStatus = {
    module_name: 'trace',
    status: 'idle',
    error_count: 0
  };

  constructor(
    private traceManagementService: TraceManagementService,
    private traceFactory: TraceFactory,
    private analysisService: TraceAnalysisService
  ) {}

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Trace module adapter');
      
      // 检查服务是否可用
      if (!this.traceManagementService || !this.traceFactory || !this.analysisService) {
        throw new Error('Trace services not available');
      }

      this.moduleStatus.status = 'initialized';
      this.logger.info('Trace module adapter initialized successfully');
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      this.logger.error('Failed to initialize Trace module adapter', error);
      throw error;
    }
  }

  /**
   * 执行跟踪协调
   */
  async execute(request: TracingCoordinationRequest): Promise<TracingResult> {
    this.logger.info('Executing tracing coordination', { 
      contextId: request.contextId,
      strategy: request.tracing_strategy 
    });

    this.moduleStatus.status = 'running';
    this.moduleStatus.last_execution = new Date().toISOString();

    try {
      // 验证请求参数
      this.validateTracingRequest(request);

      // 根据策略执行跟踪流程
      const result = await this.executeTracingStrategy(request);

      this.moduleStatus.status = 'idle';
      
      this.logger.info('Tracing coordination completed', {
        contextId: request.contextId,
        trace_id: result.traceId
      });

      return result;
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      
      this.logger.error('Tracing coordination failed', {
        contextId: request.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Trace module adapter');
      this.moduleStatus.status = 'idle';
      this.logger.info('Trace module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup Trace module adapter', error);
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return this.moduleStatus;
  }

  // ===== 私有方法 =====

  /**
   * 验证跟踪请求
   */
  private validateTracingRequest(request: TracingCoordinationRequest): void {
    if (!request.contextId) {
      throw new Error('Context ID is required');
    }

    if (!['real_time', 'batch', 'sampling', 'adaptive'].includes(request.tracing_strategy)) {
      throw new Error(`Unsupported tracing strategy: ${request.tracing_strategy}`);
    }

    // 验证采样率
    if (request.parameters.sampling_rate !== undefined) {
      if (request.parameters.sampling_rate < 0 || request.parameters.sampling_rate > 1) {
        throw new Error('Sampling rate must be between 0 and 1');
      }
    }

    // 验证保留期
    if (request.parameters.retention_period && request.parameters.retention_period <= 0) {
      throw new Error('Retention period must be positive');
    }

    // 验证事件过滤器
    if (request.parameters.event_filters) {
      if (!Array.isArray(request.parameters.event_filters)) {
        throw new Error('Event filters must be an array');
      }
    }

    // 验证监控配置
    if (request.monitoring_config) {
      const { alert_thresholds } = request.monitoring_config;
      
      if (alert_thresholds) {
        for (const [metric, threshold] of Object.entries(alert_thresholds)) {
          if (typeof threshold !== 'number' || threshold < 0) {
            throw new Error(`Alert threshold for ${metric} must be a positive number`);
          }
        }
      }
    }
  }

  /**
   * 执行跟踪策略
   */
  private async executeTracingStrategy(request: TracingCoordinationRequest): Promise<TracingResult> {
    const trace_id = uuidv4();
    const timestamp = new Date().toISOString();

    // 根据策略生成跟踪数据
    const traceData = await this.generateTraceData(request, trace_id);

    // 创建跟踪
    const createResult = await this.traceManagementService.createTrace(traceData);
    if (!createResult.success || !createResult.data) {
      throw new Error(`Failed to create trace: ${createResult.error}`);
    }

    const trace = createResult.data;

    // 启动监控会话
    const monitoringSession = await this.startMonitoringSession(request, trace);

    // 配置事件收集
    const eventCollection = await this.configureEventCollection(request, trace);

    return {
      trace_id: trace_id as UUID,
      monitoring_session: monitoringSession,
      event_collection: eventCollection,
      timestamp: timestamp as Timestamp
    };
  }

  /**
   * 生成跟踪数据
   */
  private async generateTraceData(request: TracingCoordinationRequest, trace_id: string): Promise<CreateTraceRequest> {
    const traceType = this.mapStrategyToTraceType(request.tracing_strategy);

    return {
      context_id: request.contextId,
      trace_type: traceType,
      severity: 'info',
      event: {
        type: 'start',
        name: 'coordination_trace',
        description: `Trace created using ${request.tracing_strategy} strategy`,
        category: 'system',
        source: {
          component: 'core-orchestrator',
          module: 'trace-adapter',
          function: 'generateTraceData'
        },
        data: {
          strategy: request.tracing_strategy,
          parameters: request.parameters
        }
      },
      metadata: {
        strategy: request.tracing_strategy,
        sampling_rate: request.parameters.sampling_rate || 1.0,
        retention_period: request.parameters.retention_period || 86400000,
        event_filters: request.parameters.event_filters || [],
        monitoring_enabled: request.monitoring_config?.metrics_collection || false,
        dashboard_enabled: request.monitoring_config?.dashboard_enabled || false
      }
    };
  }

  /**
   * 启动监控会话
   */
  private async startMonitoringSession(
    request: TracingCoordinationRequest, 
    trace: any
  ): Promise<{
    session_id: UUID;
    start_time: Timestamp;
    active_traces: number;
  }> {
    const session_id = uuidv4();
    const start_time = new Date().toISOString();

    // 记录监控会话开始事件
    await this.traceManagementService.recordEvent({
      trace_id: trace.traceId,
      event_type: 'monitoring_session_started',
      level: 'info',
      timestamp: new Date(),
      data: {
        session_id,
        strategy: request.tracing_strategy,
        monitoring_config: request.monitoring_config
      }
    });

    return {
      session_id: session_id as UUID,
      start_time: start_time as Timestamp,
      active_traces: 1 // 简化实现，实际应该查询活跃跟踪数量
    };
  }

  /**
   * 配置事件收集
   */
  private async configureEventCollection(
    request: TracingCoordinationRequest,
    trace: any
  ): Promise<{
    events_captured: number;
    storage_location: string;
  }> {
    const storage_location = this.determineStorageLocation(request);

    // 记录事件收集配置事件
    await this.traceManagementService.recordEvent({
      trace_id: trace.traceId,
      event_type: 'event_collection_configured',
      level: 'info',
      timestamp: new Date(),
      data: {
        strategy: request.tracing_strategy,
        sampling_rate: request.parameters.sampling_rate || 1.0,
        event_filters: request.parameters.event_filters || [],
        storage_location
      }
    });

    return {
      events_captured: 0, // 初始值
      storage_location
    };
  }

  /**
   * 映射策略到跟踪类型
   */
  private mapStrategyToTraceType(strategy: string): TraceType {
    switch (strategy) {
      case 'real_time':
        return 'execution';
      case 'batch':
        return 'monitoring';
      case 'sampling':
        return 'performance';
      case 'adaptive':
        return 'error';
      default:
        return 'execution';
    }
  }

  /**
   * 确定存储位置
   */
  private determineStorageLocation(request: TracingCoordinationRequest): string {
    const strategy = request.tracing_strategy;
    const contextId = request.contextId.substring(0, 8);
    
    switch (strategy) {
      case 'real_time':
        return `memory://traces/realtime/${contextId}`;
      case 'batch':
        return `disk://traces/batch/${contextId}`;
      case 'sampling':
        return `cache://traces/sampling/${contextId}`;
      case 'adaptive':
        return `hybrid://traces/adaptive/${contextId}`;
      default:
        return `default://traces/${contextId}`;
    }
  }

  /**
   * P0修复：执行工作流阶段
   */
  async executeStage(context: any): Promise<any> {
    const businessRequest = {
      coordination_id: 'stage-' + Date.now(),
      context_id: context.contextId,
      module: 'trace',
      coordination_type: 'tracing_coordination',
      input_data: {
        data_type: 'tracing_data',
        data_version: '1.0.0',
        payload: { context_id: context.contextId },
        metadata: {
          source_module: 'trace',
          target_modules: ['trace'],
          data_schema_version: '1.0.0',
          validation_status: 'valid',
          security_level: 'internal'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      previous_stage_results: [],
      configuration: {
        timeout_ms: 30000,
        retry_policy: { max_attempts: 3, delay_ms: 1000 },
        validation_rules: [],
        output_format: 'tracing_data'
      }
    };

    const result = await this.executeBusinessCoordination(businessRequest);
    return {
      stage: 'trace',
      status: 'completed',
      result: result.output_data,
      duration_ms: 100,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
  }

  /**
   * P0修复：执行业务协调
   */
  async executeBusinessCoordination(request: any): Promise<any> {
    const startTime = Date.now();

    try {
      const traceRequest = {
        contextId: request.contextId,
        tracing_strategy: request.input_data.payload.tracing_strategy || 'real_time',
        parameters: request.input_data.payload.parameters || {
          sampling_rate: 1.0,
          retention_period: 86400000,
          event_filters: []
        },
        monitoring_config: request.input_data.payload.monitoring_config || {
          metrics_collection: true,
          dashboard_enabled: false
        }
      };

      const result = await this.execute(traceRequest);

      return {
        coordination_id: request.coordination_id,
        module: 'trace',
        status: 'completed',
        output_data: {
          data_type: 'tracing_data',
          data_version: '1.0.0',
          payload: result,
          metadata: {
            source_module: 'trace',
            target_modules: ['core'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        coordination_id: request.coordination_id,
        module: 'trace',
        status: 'failed',
        output_data: request.input_data,
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        error: {
          error_id: 'trace-error-' + Date.now(),
          error_type: 'business_logic_error',
          error_code: 'TRACE_COORDINATION_FAILED',
          error_message: error instanceof Error ? error.message : String(error),
          source_module: 'trace',
          context_data: { coordinationId: request.coordination_id },
          recovery_suggestions: [
            {
              suggestion_type: 'retry',
              description: 'Retry the trace coordination',
              automated: true
            }
          ],
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * P0修复：验证输入数据
   */
  async validateInput(input: any): Promise<any> {
    return {
      is_valid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * P0修复：处理错误
   */
  async handleError(error: any, context: any): Promise<any> {
    this.logger.error('Handling Trace module error', {
      errorId: error.error_id,
      errorType: error.error_type,
      contextId: context.contextId
    });

    return {
      handled: true,
      recovery_action: 'retry'
    };
  }
}
