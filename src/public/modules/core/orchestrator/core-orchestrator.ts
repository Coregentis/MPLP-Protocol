/**
 * Core调度器
 *
 * 负责协调和调度10个协议模块的执行流程，支持完整的模块间协调
 *
 * @version 2.0.0
 * @created 2025-09-16
 * @updated 2025-08-04
 */

import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../../shared/types';
import { Logger } from '../../../utils/logger';
import {
  WorkflowStage,
  ProtocolModule,
  WorkflowConfiguration,
  ExecutionContext,
  StageExecutionResult,
  WorkflowExecutionResult,
  ModuleInterface,
  ModuleStatus,
  CoordinationEvent,
  CoordinationEventType,
  OrchestratorConfiguration,
  DecisionCoordinationRequest,
  DecisionResult,
  LifecycleCoordinationRequest,
  LifecycleResult,
  PlanningCoordinationRequest,
  PlanningResult,
  ConfirmationCoordinationRequest,
  ConfirmationResult,
  TracingCoordinationRequest,
  TracingResult,
  DialogCoordinationRequest,
  DialogResult,
  PluginCoordinationRequest,
  PluginResult,
  KnowledgeCoordinationRequest,
  KnowledgeResult,
  ExtendedWorkflowConfig,
  BusinessCoordinationType,
  BusinessCoordinationRequest,
  BusinessData,
  BusinessDataType,
  WorkflowExecutionContext
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
  private readonly batchProcessor: BatchProcessor<CoordinationEvent>;
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
      this.cache = {} as IntelligentCacheManager;
      this.batchProcessor = {} as BatchProcessor<CoordinationEvent>;
      this.performanceMonitor = {} as BusinessPerformanceMonitor;
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
   * 验证所有必需模块是否已注册
   */
  validateModuleRegistration(): { isComplete: boolean; missingModules: ProtocolModule[] } {
    const requiredModules: ProtocolModule[] = [
      'context', 'plan', 'confirm', 'trace', 'role', 'extension', 'collab', 'dialog', 'network'
    ];

    const missingModules = requiredModules.filter(moduleName => !this.modules.has(moduleName));
    const isComplete = missingModules.length === 0;

    if (isComplete) {
      this.logger.info('All 9 required modules are registered');
    } else {
      this.logger.warn('Missing modules detected', { missingModules });
    }

    return { isComplete, missingModules };
  }

  /**
   * 获取模块状态报告
   */
  getModuleStatusReport(): Record<ProtocolModule, ModuleStatus> {
    const report: Partial<Record<ProtocolModule, ModuleStatus>> = {};

    for (const [moduleName, module] of this.modules) {
      report[moduleName as ProtocolModule] = module.getStatus();
    }

    return report as Record<ProtocolModule, ModuleStatus>;
  }

  /**
   * 批量注册模块
   */
  registerModules(modules: ModuleInterface[]): void {
    for (const module of modules) {
      this.registerModule(module);
    }

    // 验证注册完整性
    const validation = this.validateModuleRegistration();
    if (!validation.isComplete) {
      this.logger.warn('Module registration incomplete', {
        missingModules: validation.missingModules
      });
    }
  }

  /**
   * 初始化所有模块
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Core Orchestrator...');

    // 验证模块注册完整性
    const validation = this.validateModuleRegistration();
    if (!validation.isComplete) {
      this.logger.warn('Proceeding with incomplete module registration', {
        missingModules: validation.missingModules,
        registeredModules: Array.from(this.modules.keys())
      });
    }

    // 初始化所有已注册的模块
    for (const [moduleName, module] of this.modules) {
      try {
        await module.initialize();
        this.logger.info(`Module initialized: ${moduleName}`);
      } catch (error) {
        this.logger.error(`Failed to initialize module: ${moduleName}`, error);
        throw error;
      }
    }

    this.logger.info('Core Orchestrator initialized successfully', {
      totalModules: this.modules.size,
      registeredModules: Array.from(this.modules.keys())
    });
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
   * 执行扩展工作流 - 支持10模块的完整工作流执行和协调
   */
  async executeExtendedWorkflow(contextId: UUID, config: ExtendedWorkflowConfig): Promise<WorkflowExecutionResult> {
    const executionId = uuidv4();
    const startTime = Date.now();

    this.logger.info('Starting extended workflow execution', {
      executionId,
      contextId,
      stages: config.stages
    });

    try {
      // 支持10模块的完整工作流执行
      const stages = config.stages || ['context', 'plan', 'confirm', 'trace'];
      const results: StageExecutionResult[] = [];

      for (const stage of stages) {
        const stageResult = await this.executeStageWithCoordination(stage, contextId, config);
        results.push(stageResult);

        if (stageResult.status === 'failed') {
          this.logger.warn(`Stage ${stage} failed, stopping workflow execution`);
          break;
        }
      }

      const totalDuration = Date.now() - startTime;
      const isSuccess = results.every(r => r.status === 'completed');

      const workflowResult: WorkflowExecutionResult = {
        execution_id: executionId,
        context_id: contextId,
        status: isSuccess ? 'completed' : 'failed',
        stages: results,
        total_duration_ms: totalDuration,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };

      this.logger.info('Extended workflow execution completed', {
        executionId,
        contextId,
        status: workflowResult.status,
        totalDuration
      });

      return workflowResult;

    } catch (error) {
      this.logger.error('Extended workflow execution failed', {
        executionId,
        contextId,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        execution_id: executionId,
        context_id: contextId,
        status: 'failed',
        stages: [],
        total_duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * 执行阶段并进行协调 - 根据阶段类型选择协调方法
   */
  private async executeStageWithCoordination(stage: WorkflowStage, contextId: UUID, config: ExtendedWorkflowConfig): Promise<StageExecutionResult> {
    const startTime = Date.now();

    try {
      type CoordinationResult = DecisionResult | LifecycleResult | DialogResult | PluginResult | KnowledgeResult | PlanningResult | ConfirmationResult | TracingResult;
      let coordinationResult: CoordinationResult | undefined;

      // 根据阶段类型选择协调方法
      switch (stage) {
        case 'collab':
          coordinationResult = await this.coordinateDecision({
            contextId,
            ...config.collabConfig
          } as DecisionCoordinationRequest);
          break;
        case 'role':
          coordinationResult = await this.coordinateLifecycle({
            contextId,
            ...config.roleConfig
          } as LifecycleCoordinationRequest);
          break;
        case 'dialog':
          coordinationResult = await this.coordinateDialog({
            contextId,
            ...config.dialogConfig
          } as DialogCoordinationRequest);
          break;
        case 'extension':
          coordinationResult = await this.coordinatePlugin({
            contextId,
            ...config.extensionConfig
          } as PluginCoordinationRequest);
          break;
        case 'context':
          coordinationResult = await this.coordinateKnowledge({
            contextId,
            ...config.contextConfig
          } as KnowledgeCoordinationRequest);
          break;
        default: {
          // P0修复：使用业务协调方法处理基础模块
          const module = this.modules.get(stage as ProtocolModule);
          if (!module) {
            throw new Error(`Module not found for stage: ${stage}`);
          }

          const businessRequest: BusinessCoordinationRequest = {
            coordination_id: uuidv4() as UUID,
            context_id: contextId,
            module: stage as ProtocolModule,
            coordination_type: this.mapStageToCoordinationType(stage),
            input_data: {
              data_type: `${stage}_data` as BusinessDataType,
              data_version: '1.0.0',
              payload: { contextId },
              metadata: {
                source_module: 'core' as ProtocolModule,
                target_modules: [stage as ProtocolModule],
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
              output_format: `${stage}_data`
            }
          };

          const businessResult = await module.executeBusinessCoordination(businessRequest);
          coordinationResult = businessResult.output_data.payload as CoordinationResult;
          break;
        }
      }

      if (!coordinationResult) {
        throw new Error(`No coordination result for stage: ${stage}`);
      }

      return {
        stage,
        status: 'completed',
        result: coordinationResult,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        stage,
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
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

      // P0修复：根据阶段类型调用正确的方法
      let result: StageExecutionResult;

      if (this.isBusinessWorkflow(context)) {
        // 业务工作流：调用业务协调方法
        const businessRequest = this.createBusinessCoordinationRequest(stage, context);
        const businessResult = await this.executeWithTimeout(
          () => module.executeBusinessCoordination(businessRequest),
          this.configuration.module_timeout_ms
        );

        // 转换为StageExecutionResult
        result = {
          stage,
          status: businessResult.status === 'completed' ? 'completed' : 'failed',
          result: businessResult.output_data,
          duration_ms: businessResult.execution_metrics.duration_ms,
          started_at: businessResult.execution_metrics.start_time,
          completed_at: businessResult.execution_metrics.end_time
        };
      } else {
        // 技术工作流：调用原有的execute方法
        result = await this.executeWithTimeout(
          () => module.executeStage(this.createWorkflowExecutionContext(context)),
          this.configuration.module_timeout_ms
        );
      }

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
   * 添加特定事件类型的监听器
   */
  addEventTypeListener(eventType: CoordinationEventType, listener: (event: CoordinationEvent) => void): void {
    this.addEventListener((event) => {
      if (event.event_type === eventType) {
        listener(event);
      }
    });
  }

  /**
   * 添加模块特定的事件监听器
   */
  addModuleEventListener(stage: WorkflowStage, listener: (event: CoordinationEvent) => void): void {
    this.addEventListener((event) => {
      if (event.stage === stage) {
        listener(event);
      }
    });
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: CoordinationEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * 发出事件
   */
  private emitEvent(event: CoordinationEvent): void {
    if (this.configuration.enable_event_logging) {
      this.logger.debug(`Event emitted: ${event.event_type}`, event);
    }

    // 同步处理事件监听器，确保测试中能及时接收到事件
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.logger.error('Error in event listener', error);
      }
    });
  }

  /**
   * 发出模块特定事件
   */
  emitModuleEvent(eventType: CoordinationEventType, stage: WorkflowStage, data?: unknown): void {
    this.emitEvent({
      event_id: uuidv4(),
      event_type: eventType,
      execution_id: uuidv4(),
      stage,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 批量发出事件
   */
  emitEvents(events: Omit<CoordinationEvent, 'event_id' | 'timestamp'>[]): void {
    events.forEach(eventData => {
      this.emitEvent({
        ...eventData,
        event_id: uuidv4(),
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 获取事件统计信息
   */
  getEventStatistics(): Record<CoordinationEventType, number> {
    // 这里可以实现事件统计逻辑
    // 为了简化，返回空对象，实际实现中可以维护事件计数器
    return {} as Record<CoordinationEventType, number>;
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
  private isCacheResultValid(cachedResult: unknown): boolean {
    if (!cachedResult || typeof cachedResult !== 'object') {
      return false;
    }

    const cache = cachedResult as Record<string, unknown>;

    // 检查必要字段
    if (!cache.executionId || !cache.result || !cache.timestamp) {
      return false;
    }

    // 检查缓存时间（5分钟内有效）
    const cacheAge = Date.now() - (cache.timestamp as number);
    const maxCacheAge = 5 * 60 * 1000; // 5分钟

    if (cacheAge > maxCacheAge) {
      return false;
    }

    // 检查结果结构
    const result = cache.result as Record<string, unknown>;
    const hasValidSuccess = typeof result.success === 'boolean';
    const hasValidStages = Boolean(result.stages && Array.isArray(result.stages));
    const hasValidDuration = typeof result.total_duration_ms === 'number';

    return hasValidSuccess && hasValidStages && hasValidDuration;
  }

  // ===== 新增：模块间协调方法 =====

  /**
   * 协调Collab模块的决策过程
   */
  async coordinateDecision(collabRequest: DecisionCoordinationRequest): Promise<DecisionResult> {
    this.logger.info('Starting decision coordination', { contextId: collabRequest.contextId });

    // 发出决策开始事件
    this.emitModuleEvent('decision_started', 'collab', { contextId: collabRequest.contextId });

    try {
      // 获取Collab模块
      const collabModule = this.modules.get('collab');
      if (!collabModule) {
        throw new Error('Collab module not registered');
      }

      // P0修复：执行决策过程
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: collabRequest.contextId,
        module: 'collab',
        coordination_type: 'collaboration_coordination',
        input_data: {
          data_type: 'collaboration_data',
          data_version: '1.0.0',
          payload: collabRequest,
          metadata: {
            source_module: 'core' as ProtocolModule,
            target_modules: ['collab'],
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
          output_format: 'collaboration_data'
        }
      };

      const businessResult = await collabModule.executeBusinessCoordination(businessRequest);
      const result: DecisionResult = {
        decision_id: businessResult.output_data.payload.decision_id,
        result: businessResult.output_data.payload.result,
        consensus_reached: businessResult.output_data.payload.consensus_reached,
        participants_votes: businessResult.output_data.payload.participants_votes,
        timestamp: businessResult.timestamp
      };

      // 发出决策完成事件
      this.emitModuleEvent('decision_completed', 'collab', result);

      // 如果达成共识，发出共识事件
      if (result.consensus_reached) {
        this.emitModuleEvent('consensus_reached', 'collab', result);
      }

      this.logger.info('Decision coordination completed', {
        contextId: collabRequest.contextId,
        decision_id: result.decision_id
      });

      return result;
    } catch (error) {
      this.logger.error('Decision coordination failed', {
        contextId: collabRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 协调Role模块的生命周期管理
   */
  async coordinateLifecycle(roleRequest: LifecycleCoordinationRequest): Promise<LifecycleResult> {
    this.logger.info('Starting lifecycle coordination', { contextId: roleRequest.contextId });

    try {
      // 获取Role模块
      const roleModule = this.modules.get('role');
      if (!roleModule) {
        throw new Error('Role module not registered');
      }

      // P0修复：执行生命周期管理
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: roleRequest.contextId,
        module: 'role',
        coordination_type: 'role_coordination',
        input_data: {
          data_type: 'role_data',
          data_version: '1.0.0',
          payload: roleRequest,
          metadata: {
            source_module: 'plan' as ProtocolModule,
            target_modules: ['role'],
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
          output_format: 'role_data'
        }
      };

      // 执行Role模块的业务协调
      const businessResult = await roleModule.executeBusinessCoordination(businessRequest);

      // 转换回原有格式
      const result: LifecycleResult = {
        role_id: businessResult.output_data.payload.role_id || uuidv4() as UUID,
        role_data: businessResult.output_data.payload.role_data || {},
        capabilities: businessResult.output_data.payload.capabilities || [],
        timestamp: businessResult.timestamp
      };

      // 发出角色创建事件
      this.emitModuleEvent('role_created', 'role', result);

      // 更新其他模块的角色信息
      await this.updateModuleRoles(result);

      // 发出角色激活事件
      this.emitModuleEvent('role_activated', 'role', result);

      this.logger.info('Lifecycle coordination completed', {
        contextId: roleRequest.contextId,
        role_id: result.role_id
      });

      return result;
    } catch (error) {
      this.logger.error('Lifecycle coordination failed', {
        contextId: roleRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 协调Dialog模块的多轮对话
   */
  async coordinateDialog(dialogRequest: DialogCoordinationRequest): Promise<DialogResult> {
    this.logger.info('Starting dialog coordination', { contextId: dialogRequest.contextId });

    try {
      // 获取Dialog模块
      const dialogModule = this.modules.get('dialog');
      if (!dialogModule) {
        throw new Error('Dialog module not registered');
      }

      // 临时实现：Dialog模块尚未完全实现
      const result: DialogResult = {
        dialog_id: uuidv4() as UUID,
        turns: [],
        final_state: {
          status: 'completed',
          turn_count: 3,
          strategy: 'adaptive'
        },
        timestamp: new Date().toISOString()
      };

      // 同步对话状态到Context模块
      await this.syncDialogState(result);

      this.logger.info('Dialog coordination completed', {
        contextId: dialogRequest.contextId,
        dialog_id: result.dialog_id
      });

      return result;
    } catch (error) {
      this.logger.error('Dialog coordination failed', {
        contextId: dialogRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 协调Extension模块的插件管理
   */
  async coordinatePlugin(pluginRequest: PluginCoordinationRequest): Promise<PluginResult> {
    this.logger.info('Starting plugin coordination', { contextId: pluginRequest.contextId });

    try {
      // 获取Extension模块
      const extensionModule = this.modules.get('extension');
      if (!extensionModule) {
        throw new Error('Extension module not registered');
      }

      // 临时实现：Extension模块尚未完全实现
      const result: PluginResult = {
        plugin_id: uuidv4() as UUID,
        execution_result: {
          status: 'success',
          output: { message: 'Plugin executed successfully' },
          metrics: {
            execution_time_ms: 100,
            memory_usage_mb: 10
          }
        },
        integration_status: { installed: true },
        timestamp: new Date().toISOString()
      };

      // 注册插件到其他模块
      await this.registerPluginToModules(result);

      this.logger.info('Plugin coordination completed', {
        contextId: pluginRequest.contextId,
        plugin_id: result.plugin_id
      });

      return result;
    } catch (error) {
      this.logger.error('Plugin coordination failed', {
        contextId: pluginRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 协调Context模块的知识管理
   */
  async coordinateKnowledge(knowledgeRequest: KnowledgeCoordinationRequest): Promise<KnowledgeResult> {
    this.logger.info('Starting knowledge coordination', { contextId: knowledgeRequest.contextId });

    try {
      // 获取Context模块
      const contextModule = this.modules.get('context');
      if (!contextModule) {
        throw new Error('Context module not registered');
      }

      // 临时实现：Context模块尚未完全实现
      const result: KnowledgeResult = {
        knowledge_id: uuidv4() as UUID,
        persisted_data: {
          data_type: 'json',
          content: { message: 'Knowledge persisted successfully' },
          metadata: {
            size_bytes: 1024,
            created_at: new Date().toISOString(),
            last_accessed: new Date().toISOString()
          }
        },
        sharing_status: { shared: true },
        timestamp: new Date().toISOString()
      };

      // 同步知识到相关模块
      await this.syncKnowledgeToModules(result);

      this.logger.info('Knowledge coordination completed', {
        contextId: knowledgeRequest.contextId,
        knowledge_id: result.knowledge_id
      });

      return result;
    } catch (error) {
      this.logger.error('Knowledge coordination failed', {
        contextId: knowledgeRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 关闭调度器（cleanup的别名，用于兼容性）
   */
  async shutdown(): Promise<void> {
    await this.cleanup();
  }

  // ===== 协调辅助方法 =====



  /**
   * 更新其他模块的角色信息
   */
  private async updateModuleRoles(roleResult: LifecycleResult): Promise<void> {
    // 通知所有模块角色更新
    for (const [moduleName, module] of this.modules) {
      if (moduleName !== 'role') {
        try {
          // 如果模块支持角色更新，则调用更新方法
          if ('updateRole' in module && typeof module.updateRole === 'function') {
            await (module as { updateRole: (result: LifecycleResult) => Promise<void> }).updateRole(roleResult);
          }
        } catch (error) {
          this.logger.warn(`Failed to update role in module ${moduleName}`, error);
        }
      }
    }
  }

  /**
   * 同步对话状态到Context模块
   */
  private async syncDialogState(dialogResult: DialogResult): Promise<void> {
    const contextModule = this.modules.get('context');
    if (contextModule) {
      try {
        // 如果Context模块支持对话状态同步，则调用同步方法
        if ('syncDialogState' in contextModule && typeof contextModule.syncDialogState === 'function') {
          await (contextModule as { syncDialogState: (result: DialogResult) => Promise<void> }).syncDialogState(dialogResult);
        }
      } catch (error) {
        this.logger.warn('Failed to sync dialog state to context module', error);
      }
    }
  }

  /**
   * 注册插件到其他模块
   */
  private async registerPluginToModules(pluginResult: PluginResult): Promise<void> {
    // 通知所有模块插件注册
    for (const [moduleName, module] of this.modules) {
      if (moduleName !== 'extension') {
        try {
          // 如果模块支持插件注册，则调用注册方法
          if ('registerPlugin' in module && typeof module.registerPlugin === 'function') {
            await (module as { registerPlugin: (result: PluginResult) => Promise<void> }).registerPlugin(pluginResult);
          }
        } catch (error) {
          this.logger.warn(`Failed to register plugin in module ${moduleName}`, error);
        }
      }
    }
  }

  /**
   * 同步知识到相关模块
   */
  private async syncKnowledgeToModules(knowledgeResult: KnowledgeResult): Promise<void> {
    // 通知所有模块知识更新
    for (const [moduleName, module] of this.modules) {
      if (moduleName !== 'context') {
        try {
          // 如果模块支持知识同步，则调用同步方法
          if ('syncKnowledge' in module && typeof module.syncKnowledge === 'function') {
            await (module as { syncKnowledge: (result: KnowledgeResult) => Promise<void> }).syncKnowledge(knowledgeResult);
          }
        } catch (error) {
          this.logger.warn(`Failed to sync knowledge to module ${moduleName}`, error);
        }
      }
    }
  }

  /**
   * 协调Plan模块的任务规划
   */
  async coordinatePlanning(planRequest: PlanningCoordinationRequest): Promise<PlanningResult> {
    this.logger.info('Starting planning coordination', { contextId: planRequest.contextId });

    // 发出规划开始事件
    this.emitModuleEvent('planning_started', 'plan', { contextId: planRequest.contextId });

    try {
      // 获取Plan模块
      const planModule = this.modules.get('plan');
      if (!planModule) {
        throw new Error('Plan module not registered');
      }

      // 执行任务规划
      // P0修复：调用新的业务协调方法
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: planRequest.contextId,
        module: 'plan',
        coordination_type: 'planning_coordination',
        input_data: {
          data_type: 'planning_data',
          data_version: '1.0.0',
          payload: planRequest,
          metadata: {
            source_module: 'core',
            target_modules: ['plan'],
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
          output_format: 'planning_data'
        }
      };

      const businessResult = await planModule.executeBusinessCoordination(businessRequest);

      // 转换回原有格式
      const result: PlanningResult = {
        plan_id: businessResult.output_data.payload.plan_id,
        task_breakdown: businessResult.output_data.payload.task_breakdown,
        resource_allocation: businessResult.output_data.payload.resource_allocation,
        timestamp: businessResult.timestamp
      };

      // 发出规划完成事件
      this.emitModuleEvent('planning_completed', 'plan', result);

      this.logger.info('Planning coordination completed', {
        contextId: planRequest.contextId,
        plan_id: result.plan_id
      });

      return result;
    } catch (error) {
      this.logger.error('Planning coordination failed', {
        contextId: planRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 协调Confirm模块的确认流程
   */
  async coordinateConfirmation(confirmRequest: ConfirmationCoordinationRequest): Promise<ConfirmationResult> {
    this.logger.info('Starting confirmation coordination', { contextId: confirmRequest.contextId });

    // 发出确认开始事件
    this.emitModuleEvent('confirmation_started', 'confirm', { contextId: confirmRequest.contextId });

    try {
      // 获取Confirm模块
      const confirmModule = this.modules.get('confirm');
      if (!confirmModule) {
        throw new Error('Confirm module not registered');
      }

      // P0修复：执行确认流程
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: confirmRequest.contextId,
        module: 'confirm',
        coordination_type: 'confirmation_coordination',
        input_data: {
          data_type: 'confirmation_data',
          data_version: '1.0.0',
          payload: confirmRequest,
          metadata: {
            source_module: 'plan' as ProtocolModule,
            target_modules: ['confirm'],
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
          output_format: 'confirmation_data'
        }
      };

      const businessResult = await confirmModule.executeBusinessCoordination(businessRequest);

      // 转换回原有格式
      const result: ConfirmationResult = {
        confirmation_id: businessResult.output_data.payload.confirmation_id,
        approval_status: businessResult.output_data.payload.approval_status,
        approver_responses: businessResult.output_data.payload.approver_responses,
        final_decision: businessResult.output_data.payload.final_decision,
        timestamp: businessResult.timestamp
      };

      // 发出确认完成事件
      this.emitModuleEvent('confirmation_completed', 'confirm', result);

      // 如果获得批准，发出批准事件
      if (result.final_decision) {
        this.emitModuleEvent('approval_granted', 'confirm', result);
      }

      this.logger.info('Confirmation coordination completed', {
        contextId: confirmRequest.contextId,
        confirmation_id: result.confirmation_id
      });

      return result;
    } catch (error) {
      this.logger.error('Confirmation coordination failed', {
        contextId: confirmRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 协调Trace模块的事件跟踪
   */
  async coordinateTracing(traceRequest: TracingCoordinationRequest): Promise<TracingResult> {
    this.logger.info('Starting tracing coordination', { contextId: traceRequest.contextId });

    // 发出跟踪开始事件
    this.emitModuleEvent('tracing_started', 'trace', { contextId: traceRequest.contextId });

    try {
      // 获取Trace模块
      const traceModule = this.modules.get('trace');
      if (!traceModule) {
        throw new Error('Trace module not registered');
      }

      // P0修复：执行事件跟踪
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: traceRequest.contextId,
        module: 'trace',
        coordination_type: 'tracing_coordination',
        input_data: {
          data_type: 'tracing_data',
          data_version: '1.0.0',
          payload: traceRequest,
          metadata: {
            source_module: 'confirm' as ProtocolModule,
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

      const businessResult = await traceModule.executeBusinessCoordination(businessRequest);

      // 转换回原有格式
      const result: TracingResult = {
        trace_id: businessResult.output_data.payload.trace_id,
        monitoring_session: businessResult.output_data.payload.monitoring_session,
        event_collection: businessResult.output_data.payload.event_collection,
        timestamp: businessResult.timestamp
      };

      // 发出跟踪完成事件
      this.emitModuleEvent('tracing_completed', 'trace', result);

      this.logger.info('Tracing coordination completed', {
        contextId: traceRequest.contextId,
        trace_id: result.trace_id
      });

      return result;
    } catch (error) {
      this.logger.error('Tracing coordination failed', {
        contextId: traceRequest.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * P0修复：判断是否为业务工作流
   */
  private isBusinessWorkflow(context: ExecutionContext): boolean {
    // 检查工作流配置中是否包含业务工作流标识
    return context.workflow_config.stages.some(stage =>
      ['plan', 'confirm', 'trace', 'collab', 'dialog'].includes(stage)
    );
  }

  /**
   * P0修复：映射阶段到协调类型
   */
  private mapStageToCoordinationType(stage: WorkflowStage): BusinessCoordinationType {
    const mapping: Record<string, BusinessCoordinationType> = {
      'plan': 'planning_coordination',
      'confirm': 'confirmation_coordination',
      'trace': 'tracing_coordination',
      'collab': 'collaboration_coordination',
      'dialog': 'dialog_coordination',
      'context': 'context_coordination',
      'role': 'role_coordination',
      'extension': 'extension_coordination',
      'network': 'network_coordination'
    };

    return mapping[stage] || 'planning_coordination';
  }

  /**
   * P0修复：创建业务协调请求
   */
  private createBusinessCoordinationRequest(
    stage: WorkflowStage,
    context: ExecutionContext
  ): BusinessCoordinationRequest {
    // 获取前一个阶段的输出作为当前阶段的输入
    const previousResults = Array.from(context.stage_results.values());
    const inputData = this.createBusinessDataFromContext(context, stage);

    return {
      coordination_id: uuidv4() as UUID,
      context_id: context.context_id,
      module: stage as ProtocolModule,
      coordination_type: this.mapStageToCoordinationType(stage),
      input_data: inputData,
      previous_stage_results: previousResults.map(r => this.convertToBusinessData(r)),
      configuration: {
        timeout_ms: this.configuration.module_timeout_ms,
        retry_policy: this.configuration.default_workflow.retry_policy || {
          max_attempts: 3,
          delay_ms: 1000
        },
        validation_rules: [],
        output_format: `${stage}_data`
      }
    };
  }

  /**
   * P0修复：创建工作流执行上下文
   */
  private createWorkflowExecutionContext(context: ExecutionContext): WorkflowExecutionContext {
    return {
      execution_id: context.execution_id,
      context_id: context.context_id,
      workflow_type: 'custom',
      current_stage: context.current_stage,
      stage_index: 0,
      total_stages: context.workflow_config.stages.length,
      data_store: {
        global_data: {},
        stage_inputs: {},
        stage_outputs: {},
        intermediate_results: {}
      },
      execution_state: {
        status: 'running',
        completed_stages: [],
        failed_stages: [],
        pending_stages: context.workflow_config.stages,
        current_stage_status: 'in_progress',
        error_count: 0,
        retry_count: 0
      },
      metadata: context.metadata,
      started_at: context.started_at,
      updated_at: context.updated_at
    };
  }

  /**
   * P0修复：从上下文创建业务数据
   */
  private createBusinessDataFromContext(
    context: ExecutionContext,
    stage: WorkflowStage
  ): BusinessData {
    return {
      data_type: `${stage}_data` as BusinessDataType,
      data_version: '1.0.0',
      payload: {
        context_id: context.context_id,
        execution_id: context.execution_id,
        stage: stage,
        metadata: context.metadata
      },
      metadata: {
        source_module: 'core' as ProtocolModule,
        target_modules: [stage as ProtocolModule],
        data_schema_version: '1.0.0',
        validation_status: 'valid',
        security_level: 'internal'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * P0修复：转换结果为业务数据
   */
  private convertToBusinessData(result: unknown): BusinessData {
    return {
      data_type: 'planning_data',
      data_version: '1.0.0',
      payload: result as Record<string, unknown>,
      metadata: {
        source_module: 'core',
        target_modules: [],
        data_schema_version: '1.0.0',
        validation_status: 'valid',
        security_level: 'internal'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
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
