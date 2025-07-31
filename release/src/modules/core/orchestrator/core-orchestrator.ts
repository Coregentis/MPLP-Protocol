/**
 * Core调度器
 * 
 * 负责协调和调度6个核心协议模块的执行流程
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../../shared/types';
import { Logger } from '../../../utils/logger';
import {
  WorkflowStage,
  ExecutionStatus,
  ProtocolModule,
  WorkflowConfiguration,
  ExecutionContext,
  StageExecutionResult,
  WorkflowExecutionResult,
  ModuleInterface,
  ModuleStatus,
  CoordinationEvent,
  OrchestratorConfiguration
} from '../types/core.types';
import {
  IntelligentCacheManager,
  BatchProcessor,
  BusinessPerformanceMonitor
} from '../../../performance/real-performance-optimizer';

/**
 * Core调度器
 */
export class CoreOrchestrator {
  private readonly logger: Logger;
  private readonly modules: Map<ProtocolModule, ModuleInterface> = new Map();
  private readonly activeExecutions: Map<UUID, ExecutionContext> = new Map();
  private readonly configuration: OrchestratorConfiguration;
  private readonly eventListeners: ((event: CoordinationEvent) => void)[] = [];

  // 性能优化组件 - 渐进式集成
  private readonly cache: IntelligentCacheManager;
  private readonly batchProcessor: BatchProcessor<any>;
  private readonly performanceMonitor: BusinessPerformanceMonitor;
  private performanceOptimizationEnabled: boolean;

  constructor(configuration: OrchestratorConfiguration, enablePerformanceOptimization = true) {
    this.configuration = configuration;
    this.logger = new Logger('CoreOrchestrator');
    this.performanceOptimizationEnabled = enablePerformanceOptimization;

    // 初始化性能优化组件（可选）
    if (this.performanceOptimizationEnabled) {
      this.cache = new IntelligentCacheManager(1000);
      this.batchProcessor = new BatchProcessor();
      this.performanceMonitor = new BusinessPerformanceMonitor();
      this.initializePerformanceOptimizations();
    } else {
      // 如果不启用优化，创建空实现
      this.cache = null as any;
      this.batchProcessor = null as any;
      this.performanceMonitor = null as any;
    }
  }

  /**
   * 初始化性能优化组件
   */
  private initializePerformanceOptimizations(): void {
    if (!this.performanceOptimizationEnabled) return;

    // 设置批处理器
    this.batchProcessor.registerProcessor(
      'events',
      async (events: CoordinationEvent[]) => {
        for (const event of events) {
          this.eventListeners.forEach(listener => {
            try {
              listener(event);
            } catch (error) {
              this.logger.error('Event listener error:', error);
            }
          });
        }
      },
      10, // 批大小
      50  // 50ms刷新间隔
    );

    // 设置性能监控
    this.performanceMonitor.setAlertThreshold('workflow_execution_time', 1000, 2000);
    this.performanceMonitor.on('alert', (alert) => {
      this.logger.warn(`Performance alert: ${alert.level} - ${alert.metric} = ${alert.value}`);
    });
  }

  /**
   * 注册协议模块
   */
  registerModule(module: ModuleInterface): void {
    this.modules.set(module.module_name, module);
    this.logger.info(`Module registered: ${module.module_name}`);
  }

  /**
   * 初始化所有模块
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Core Orchestrator...');
    
    for (const [moduleName, module] of this.modules) {
      try {
        await module.initialize();
        this.logger.info(`Module initialized: ${moduleName}`);
      } catch (error) {
        this.logger.error(`Failed to initialize module: ${moduleName}`, error);
        throw error;
      }
    }

    this.logger.info('Core Orchestrator initialized successfully');
  }

  /**
   * 执行工作流 (增强版 - 包含性能优化)
   */
  async executeWorkflow(
    contextId: UUID,
    workflowConfig?: Partial<WorkflowConfiguration>
  ): Promise<WorkflowExecutionResult> {
    const executionId = uuidv4();
    const startTime = new Date().toISOString();
    const performanceStartTime = Date.now();

    // 合并配置
    const config: WorkflowConfiguration = {
      ...this.configuration.default_workflow,
      ...workflowConfig
    };

    // 性能优化：缓存检查
    if (this.performanceOptimizationEnabled) {
      const cacheKey = this.generateCacheKey(contextId, config);
      const cachedResult = await this.cache.get(cacheKey);

      if (cachedResult && this.isCacheResultValid(cachedResult)) {
        this.performanceMonitor.recordBusinessMetric('cache_hit', 1);

        // 更新缓存结果的时间戳
        const result = { ...cachedResult };
        result.started_at = startTime;
        result.completed_at = new Date().toISOString();
        result.total_duration_ms = Date.now() - performanceStartTime;

        this.logger.info(`Workflow ${contextId} served from cache`);
        return result;
      }

      this.performanceMonitor.recordBusinessMetric('cache_miss', 1);
    }

    // 创建执行上下文
    const executionContext: ExecutionContext = {
      execution_id: executionId,
      context_id: contextId,
      workflow_config: config,
      current_stage: config.stages[0],
      stage_results: new Map(),
      metadata: {},
      started_at: startTime,
      updated_at: startTime
    };

    this.activeExecutions.set(executionId, executionContext);
    
    try {
      this.logger.info(`Starting workflow execution: ${executionId} for context: ${contextId}`);
      
      // 执行前置钩子
      if (this.configuration.lifecycle_hooks?.beforeWorkflow) {
        await this.configuration.lifecycle_hooks.beforeWorkflow(executionContext);
      }

      const stageResults: StageExecutionResult[] = [];
      
      // 执行工作流阶段
      if (config.parallel_execution) {
        stageResults.push(...await this.executeStagesInParallel(executionContext));
      } else {
        stageResults.push(...await this.executeStagesSequentially(executionContext));
      }

      const endTime = new Date().toISOString();
      const totalDuration = new Date(endTime).getTime() - new Date(startTime).getTime();

      const result: WorkflowExecutionResult = {
        execution_id: executionId,
        context_id: contextId,
        status: 'completed',
        stages: stageResults,
        total_duration_ms: totalDuration,
        started_at: startTime,
        completed_at: endTime
      };

      // 执行后置钩子
      if (this.configuration.lifecycle_hooks?.afterWorkflow) {
        await this.configuration.lifecycle_hooks.afterWorkflow(result);
      }

      this.emitEvent({
        event_id: uuidv4(),
        event_type: 'workflow_completed',
        execution_id: executionId,
        data: result,
        timestamp: endTime
      });

      this.logger.info(`Workflow execution completed: ${executionId}`);
      return result;

    } catch (error) {
      const endTime = new Date().toISOString();
      const totalDuration = new Date(endTime).getTime() - new Date(startTime).getTime();

      const result: WorkflowExecutionResult = {
        execution_id: executionId,
        context_id: contextId,
        status: 'failed',
        stages: [],
        total_duration_ms: totalDuration,
        started_at: startTime,
        completed_at: endTime,
        error: error instanceof Error ? error : new Error(String(error))
      };

      this.emitEvent({
        event_id: uuidv4(),
        event_type: 'workflow_failed',
        execution_id: executionId,
        data: { error: error instanceof Error ? error.message : String(error) },
        timestamp: endTime
      });

      this.logger.error(`Workflow execution failed: ${executionId}`, error);
      return result;

    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * 顺序执行阶段
   */
  private async executeStagesSequentially(context: ExecutionContext): Promise<StageExecutionResult[]> {
    const results: StageExecutionResult[] = [];
    
    for (const stage of context.workflow_config.stages) {
      const result = await this.executeStage(stage, context);
      results.push(result);
      
      if (result.status === 'failed' && !context.workflow_config.error_handling?.continue_on_error) {
        break;
      }
    }
    
    return results;
  }

  /**
   * 并行执行阶段
   */
  private async executeStagesInParallel(context: ExecutionContext): Promise<StageExecutionResult[]> {
    const stagePromises = context.workflow_config.stages.map(stage => 
      this.executeStage(stage, context)
    );
    
    return await Promise.all(stagePromises);
  }

  /**
   * 执行单个阶段
   */
  private async executeStage(stage: WorkflowStage, context: ExecutionContext): Promise<StageExecutionResult> {
    const startTime = new Date().toISOString();
    const startTimestamp = new Date().getTime();
    
    try {
      this.logger.debug(`Executing stage: ${stage} for execution: ${context.execution_id}`);
      
      // 执行前置钩子
      if (this.configuration.lifecycle_hooks?.beforeStage) {
        await this.configuration.lifecycle_hooks.beforeStage(stage, context);
      }

      this.emitEvent({
        event_id: uuidv4(),
        event_type: 'stage_started',
        execution_id: context.execution_id,
        stage,
        timestamp: startTime
      });

      // 获取对应的模块
      const module = this.modules.get(stage as ProtocolModule);
      if (!module) {
        throw new Error(`Module not found for stage: ${stage}`);
      }

      // 执行模块
      const result = await this.executeWithTimeout(
        () => module.execute(context),
        this.configuration.module_timeout_ms
      );

      const endTime = new Date().toISOString();
      const duration = new Date().getTime() - startTimestamp;

      const stageResult: StageExecutionResult = {
        stage,
        status: 'completed',
        result,
        duration_ms: duration,
        started_at: startTime,
        completed_at: endTime
      };

      // 保存阶段结果
      context.stage_results.set(stage, result);
      context.updated_at = endTime;

      // 执行后置钩子
      if (this.configuration.lifecycle_hooks?.afterStage) {
        await this.configuration.lifecycle_hooks.afterStage(stage, stageResult, context);
      }

      this.emitEvent({
        event_id: uuidv4(),
        event_type: 'stage_completed',
        execution_id: context.execution_id,
        stage,
        data: stageResult,
        timestamp: endTime
      });

      this.logger.debug(`Stage completed: ${stage} in ${duration}ms`);
      return stageResult;

    } catch (error) {
      const endTime = new Date().toISOString();
      const duration = new Date().getTime() - startTimestamp;

      const stageResult: StageExecutionResult = {
        stage,
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
        duration_ms: duration,
        started_at: startTime,
        completed_at: endTime
      };

      // 执行错误钩子
      if (this.configuration.lifecycle_hooks?.onError) {
        await this.configuration.lifecycle_hooks.onError(
          error instanceof Error ? error : new Error(String(error)),
          stage,
          context
        );
      }

      this.emitEvent({
        event_id: uuidv4(),
        event_type: 'stage_failed',
        execution_id: context.execution_id,
        stage,
        data: { error: error instanceof Error ? error.message : String(error) },
        timestamp: endTime
      });

      this.logger.error(`Stage failed: ${stage}`, error);
      return stageResult;
    }
  }

  /**
   * 带超时的执行
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 获取模块状态
   */
  getModuleStatuses(): Map<ProtocolModule, ModuleStatus> {
    const statuses = new Map<ProtocolModule, ModuleStatus>();
    
    for (const [moduleName, module] of this.modules) {
      statuses.set(moduleName, module.getStatus());
    }
    
    return statuses;
  }

  /**
   * 获取活跃执行
   */
  getActiveExecutions(): ExecutionContext[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: (event: CoordinationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * 发出事件
   */
  private emitEvent(event: CoordinationEvent): void {
    if (this.configuration.enable_event_logging) {
      this.logger.debug(`Event emitted: ${event.event_type}`, event);
    }
    
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.logger.error('Error in event listener', error);
      }
    });
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(contextId: UUID, config: WorkflowConfiguration): string {
    const configHash = JSON.stringify({
      stages: config.stages,
      parallel_execution: config.parallel_execution,
      timeout_ms: config.timeout_ms,
      retry_policy: config.retry_policy
    });

    return `workflow:${contextId}:${Buffer.from(configHash).toString('base64').slice(0, 16)}`;
  }

  /**
   * 验证缓存结果是否有效
   */
  private isCacheResultValid(cachedResult: any): boolean {
    if (!cachedResult || typeof cachedResult !== 'object') {
      return false;
    }

    // 检查必要字段
    if (!cachedResult.executionId || !cachedResult.result || !cachedResult.timestamp) {
      return false;
    }

    // 检查缓存时间（5分钟内有效）
    const cacheAge = Date.now() - cachedResult.timestamp;
    const maxCacheAge = 5 * 60 * 1000; // 5分钟

    if (cacheAge > maxCacheAge) {
      return false;
    }

    // 检查结果结构
    const result = cachedResult.result;
    return result.success !== undefined &&
           result.stages &&
           Array.isArray(result.stages) &&
           result.total_duration_ms !== undefined;
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: CoordinationEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
      this.logger.debug('Event listener removed');
    }
  }

  /**
   * 关闭调度器（cleanup的别名，用于兼容性）
   */
  async shutdown(): Promise<void> {
    await this.cleanup();
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up Core Orchestrator...');

    for (const [moduleName, module] of this.modules) {
      try {
        await module.cleanup();
        this.logger.info(`Module cleaned up: ${moduleName}`);
      } catch (error) {
        this.logger.error(`Failed to cleanup module: ${moduleName}`, error);
      }
    }

    this.activeExecutions.clear();
    this.eventListeners.length = 0;

    this.logger.info('Core Orchestrator cleaned up successfully');
  }
}
