/**
 * MPLP Plan模块 - 故障解决器管理器
 * 
 * @version v1.0.1
 * @created 2025-07-10T13:30:00+08:00
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';
import { Logger } from '../../utils/logger';
import { ITraceAdapter, FailureReport } from '../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../types/trace';
import { 
  UUID,
  Timestamp,
  PlanTask,
  TaskStatus,
  RecoveryStrategy,
  FailureResolver,
  RetryConfig,
  RollbackConfig,
  ManualInterventionConfig,
  NotificationChannel,
  FailureDiagnostics,
  FailureDiagnosticsConfig,
  FailurePatternAnalysis,
  ProactiveFailurePrevention,
  PreventionStrategy,
  SelfLearningRecovery
} from './types';

const logger = new Logger('FailureResolver');

/**
 * 故障解决器事件类型
 */
export type FailureResolverEventType =
  | 'task_retry_scheduled'
  | 'task_retry_succeeded'
  | 'task_retry_failed'
  | 'task_rollback_started'
  | 'task_rollback_completed'
  | 'task_rollback_failed'
  | 'task_skipped'
  | 'manual_intervention_requested'
  | 'manual_intervention_received'
  | 'manual_intervention_timeout'
  | 'recovery_completed'
  | 'recovery_failed';

/**
 * 故障解决器事件
 */
export interface FailureResolverEvent {
  event_id: UUID;
  event_type: FailureResolverEventType;
  plan_id: UUID;
  task_id: UUID;
  timestamp: Timestamp;
  strategy: RecoveryStrategy;
  data: unknown;
}

/**
 * 故障恢复结果
 */
export interface FailureRecoveryResult {
  success: boolean;
  strategy_used: RecoveryStrategy;
  task_id: UUID;
  plan_id: UUID;
  new_status: TaskStatus;
  execution_time_ms: number;
  retry_count?: number;
  error_message?: string;
  intervention_required?: boolean;
  rollback_target_id?: UUID;
}

/**
 * 故障解决器配置
 */
export interface FailureResolverConfig {
  default_resolver: FailureResolver;
  notification_handler?: (channel: NotificationChannel, message: string, data: unknown) => Promise<void>;
  manual_intervention_handler?: (taskId: UUID, planId: UUID, reason: string) => Promise<boolean>;
  performance_monitor?: (metrics: Record<string, number>) => void;
  trace_adapter?: ITraceAdapter; // 追踪适配器 - 厂商中立
}

/**
 * 故障解决器管理器 - 处理计划执行过程中的故障
 */
export class FailureResolverManager extends EventEmitter {
  private config: FailureResolverConfig;
  private taskRetryCounters: Map<UUID, number> = new Map();
  private pendingInterventions: Map<UUID, {
    planId: UUID;
    requestedAt: Timestamp;
    reason: string;
    timeoutId: NodeJS.Timeout;
  }> = new Map();
  private failureHistory: Map<string, FailureDiagnostics[]> = new Map();
  private failurePatterns: Map<string, FailurePatternAnalysis> = new Map();
  private learningData: Map<string, {
    strategy: RecoveryStrategy;
    success: boolean;
    execution_time_ms: number;
    context: Record<string, unknown>;
  }[]> = new Map();
  private notificationQueue: {
    channel: NotificationChannel;
    message: string;
    data: unknown;
    timestamp: Timestamp;
  }[] = [];
  private notificationProcessorInterval: NodeJS.Timeout | null = null;
  private traceAdapter: ITraceAdapter | null = null; // 追踪适配器实例 - 厂商中立
  
  constructor(config: FailureResolverConfig) {
    super();
    this.config = config;
    
    // 初始化通知处理器
    if (this.config.notification_handler) {
      this.notificationProcessorInterval = setInterval(() => {
        this.processNotifications().catch(error => {
          logger.error('处理通知队列时出错', { error });
        });
      }, 1000);
    }
    
    // 设置追踪适配器
    if (this.config.trace_adapter) {
      this.setTraceAdapter(this.config.trace_adapter);
    }
    
    logger.info('故障解决器管理器已初始化', {
      default_strategies: this.config.default_resolver.strategies,
      intelligent_diagnostics_enabled: this.config.default_resolver.intelligent_diagnostics?.enabled || false,
      trace_adapter_available: !!this.traceAdapter
    });
  }
  
  /**
   * 设置追踪适配器 - 厂商中立设计
   * 
   * @param adapter 追踪适配器
   */
  setTraceAdapter(adapter: ITraceAdapter): void {
    this.traceAdapter = adapter;
    
    const adapterInfo = adapter.getAdapterInfo();
    logger.info('追踪适配器已设置', {
      adapter_type: adapterInfo.type,
      adapter_version: adapterInfo.version
    });
  }
  
  /**
   * 处理任务故障
   */
  async handleTaskFailure(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    customResolver?: Partial<FailureResolver>
  ): Promise<FailureRecoveryResult> {
    const startTime = performance.now();
    
    // 合并解析器配置
    const resolver = this.mergeResolvers(this.config.default_resolver, customResolver);
    
    // 记录故障信息
    logger.info('处理任务故障', {
      plan_id: planId,
      task_id: taskId,
      task_name: task.name,
      error: errorMessage,
      strategies: resolver.strategies
    });
    
    // 同步故障信息到追踪适配器
    if (this.traceAdapter) {
      await this.syncFailureToAdapter(planId, taskId, task, errorMessage);
    }
    
    // 如果解决器未启用，直接返回失败
    if (!resolver.enabled) {
      return {
        success: false,
        strategy_used: 'manual_intervention',
        task_id: taskId,
        plan_id: planId,
        new_status: 'failed',
        execution_time_ms: performance.now() - startTime,
        error_message: 'Failure resolver is disabled'
      };
    }
    
    logger.info('Handling task failure', {
      plan_id: planId,
      task_id: taskId,
      task_name: task.name,
      error: errorMessage,
      available_strategies: resolver.strategies
    });
    
    // 新增: 如果启用了智能诊断，先进行故障诊断
    let diagnostics: FailureDiagnostics | undefined;
    if (resolver.intelligent_diagnostics?.enabled) {
      diagnostics = await this.diagnoseFaiure(planId, taskId, task, errorMessage, resolver.intelligent_diagnostics);
      
      // 如果诊断结果有建议的恢复策略，优先使用这些策略
      if (diagnostics && diagnostics.confidence_score >= (resolver.intelligent_diagnostics.min_confidence_score || 0.7)) {
        logger.info('Using intelligent diagnostics suggested strategies', {
          plan_id: planId,
          task_id: taskId,
          suggested_strategies: diagnostics.suggested_strategies,
          confidence_score: diagnostics.confidence_score
        });
        
        // 按照建议的策略顺序尝试恢复
        for (const strategy of diagnostics.suggested_strategies) {
          try {
            const result = await this.applyRecoveryStrategy(
              strategy,
              planId,
              taskId,
              task,
              errorMessage,
              resolver,
              diagnostics // 传递诊断结果
            );
            
            if (result.success || result.intervention_required) {
              // 记录学习数据
              this.recordLearningData(taskId.toString(), strategy, result.success, performance.now() - startTime, {
                task_type: task.type,
                error_message: errorMessage,
                diagnostics: diagnostics
              });
              
              return {
                ...result,
                execution_time_ms: performance.now() - startTime
              };
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Error applying suggested strategy ${strategy}`, {
              plan_id: planId,
              task_id: taskId,
              error: errorMsg
            });
          }
        }
      }
    }
    
    // 如果智能诊断未启用或建议的策略都失败，回退到常规策略
    // 尝试按优先级顺序应用恢复策略
    for (const strategy of resolver.strategies) {
      try {
        // 应用恢复策略
        const result = await this.applyRecoveryStrategy(
          strategy,
          planId,
          taskId,
          task,
          errorMessage,
          resolver,
          diagnostics // 传递诊断结果（如果有）
        );
        
        // 如果策略成功或需要人工干预，返回结果
        if (result.success || result.intervention_required) {
          // 记录学习数据
          this.recordLearningData(taskId.toString(), strategy, result.success, performance.now() - startTime, {
            task_type: task.type,
            error_message: errorMessage,
            diagnostics: diagnostics
          });
          
          // 记录恢复结果
          this.logFailureRecovery(planId, taskId, diagnostics, result);
          
          return {
            ...result,
            execution_time_ms: performance.now() - startTime
          };
        }
        
        // 记录策略失败
        logger.warn(`Recovery strategy ${strategy} failed for task ${taskId}`, {
          plan_id: planId,
          task_name: task.name,
          error: result.error_message
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error applying recovery strategy ${strategy}`, {
          plan_id: planId,
          task_id: taskId,
          error: errorMsg
        });
      }
    }
    
    // 所有策略都失败，返回最终失败结果
    const finalResult: FailureRecoveryResult = {
      success: false,
      strategy_used: 'manual_intervention',
      task_id: taskId,
      plan_id: planId,
      new_status: 'failed',
      execution_time_ms: performance.now() - startTime,
      error_message: 'All recovery strategies failed'
    };
    
    // 记录最终失败结果
    this.logFailureRecovery(planId, taskId, diagnostics, finalResult);
    
    return finalResult;
  }
  
  /**
   * 同步故障信息到追踪适配器
   * 
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param task 任务信息
   * @param errorMessage 错误信息
   * @returns 同步结果
   */
  private async syncFailureToAdapter(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string
  ): Promise<{ success: boolean; sync_id?: string }> {
    if (!this.traceAdapter) {
      return { success: false };
    }

    try {
      // 创建故障报告（厂商中立）
      const failureReport: FailureReport = {
        failure_id: uuidv4(),
        task_id: taskId,
        plan_id: planId,
        failure_type: this.analyzeFailureType(errorMessage, task),
        failure_details: {
          error_message: errorMessage,
          task_name: task.name,
          task_type: task.type,
          task_status: task.status,
          timestamp: new Date().toISOString(),
          context: {
            plan_id: planId,
            task_metadata: task.metadata || {}
          }
        },
        timestamp: new Date().toISOString()
      };

      // 使用通用接口方法报告故障
      const result = await this.traceAdapter.reportFailure(failureReport);

      return {
        success: result.success,
        sync_id: result.sync_id
      };
    } catch (error) {
      logger.error('Failed to sync failure to adapter', {
        error: error instanceof Error ? error.message : String(error),
        plan_id: planId,
        task_id: taskId
      });
      return { success: false };
    }
  }
  
  /**
   * 应用恢复策略
   */
  private async applyRecoveryStrategy(
    strategy: RecoveryStrategy,
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    resolver: FailureResolver,
    diagnostics?: FailureDiagnostics
  ): Promise<FailureRecoveryResult> {
    switch (strategy) {
      case 'retry':
        return this.applyRetryStrategy(planId, taskId, task, errorMessage, resolver.retry_config);
      case 'rollback':
        return this.applyRollbackStrategy(planId, taskId, task, errorMessage, resolver.rollback_config);
      case 'skip':
        return this.applySkipStrategy(planId, taskId, task, errorMessage);
      case 'manual_intervention':
        return this.applyManualInterventionStrategy(
          planId, 
          taskId, 
          task, 
          errorMessage, 
          resolver.manual_intervention_config
        );
      default:
        return {
          success: false,
          strategy_used: strategy,
          task_id: taskId,
          plan_id: planId,
          new_status: 'failed',
          execution_time_ms: 0,
          error_message: `Unsupported recovery strategy: ${strategy}`
        };
    }
  }
  
  /**
   * 应用重试策略
   */
  private async applyRetryStrategy(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    retryConfig?: RetryConfig
  ): Promise<FailureRecoveryResult> {
    const config = retryConfig || this.config.default_resolver.retry_config || {
      max_attempts: 3,
      delay_ms: 1000,
      backoff_factor: 2,
      max_delay_ms: 30000
    };
    
    // 获取当前重试次数
    const currentRetryCount = this.taskRetryCounters.get(taskId) || 0;
    
    // 检查是否超过最大重试次数
    if (currentRetryCount >= config.max_attempts) {
      return {
        success: false,
        strategy_used: 'retry',
        task_id: taskId,
        plan_id: planId,
        new_status: 'failed',
        execution_time_ms: 0,
        retry_count: currentRetryCount,
        error_message: `Maximum retry attempts (${config.max_attempts}) exceeded`
      };
    }
    
    // 计算下一次重试延迟
    const nextRetryCount = currentRetryCount + 1;
    const delay = Math.min(
      config.delay_ms * Math.pow(config.backoff_factor, currentRetryCount),
      config.max_delay_ms
    );
    
    // 更新重试计数器
    this.taskRetryCounters.set(taskId, nextRetryCount);
    
    // 发出重试事件
    this.emitEvent('task_retry_scheduled', planId, taskId, 'retry', {
      retry_count: nextRetryCount,
      delay_ms: delay,
      max_attempts: config.max_attempts,
      error: errorMessage
    });
    
    logger.info(`Scheduled retry ${nextRetryCount}/${config.max_attempts} for task ${taskId}`, {
      plan_id: planId,
      task_name: task.name,
      delay_ms: delay
    });
    
    // 返回结果
    return {
      success: true,
      strategy_used: 'retry',
      task_id: taskId,
      plan_id: planId,
      new_status: 'ready',
      execution_time_ms: 0,
      retry_count: nextRetryCount
    };
  }
  
  /**
   * 应用回滚策略
   */
  private async applyRollbackStrategy(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    rollbackConfig?: RollbackConfig
  ): Promise<FailureRecoveryResult> {
    const config = rollbackConfig || this.config.default_resolver.rollback_config || {
      enabled: true,
      checkpoint_frequency: 5,
      max_rollback_depth: 10
    };
    
    // 如果回滚未启用，返回失败
    if (!config.enabled) {
      return {
        success: false,
        strategy_used: 'rollback',
        task_id: taskId,
        plan_id: planId,
        new_status: 'failed',
        execution_time_ms: 0,
        error_message: 'Rollback is disabled'
      };
    }
    
    // 查找回滚目标（这里应该是从任务依赖关系中找到前一个成功的任务）
    // 在实际实现中，这需要访问计划的依赖图和任务历史
    const rollbackTargetId = task.parent_task_id || undefined;
    
    if (!rollbackTargetId) {
      return {
        success: false,
        strategy_used: 'rollback',
        task_id: taskId,
        plan_id: planId,
        new_status: 'failed',
        execution_time_ms: 0,
        error_message: 'No rollback target found'
      };
    }
    
    // 发出回滚事件
    this.emitEvent('task_rollback_started', planId, taskId, 'rollback', {
      rollback_target_id: rollbackTargetId,
      reason: errorMessage
    });
    
    logger.info(`Rolling back task ${taskId} to ${rollbackTargetId}`, {
      plan_id: planId,
      task_name: task.name
    });
    
    // 返回结果
    return {
      success: true,
      strategy_used: 'rollback',
      task_id: taskId,
      plan_id: planId,
      new_status: 'pending',
      execution_time_ms: 0,
      rollback_target_id: rollbackTargetId
    };
  }
  
  /**
   * 应用跳过策略
   */
  private async applySkipStrategy(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string
  ): Promise<FailureRecoveryResult> {
    // 发出跳过事件
    this.emitEvent('task_skipped', planId, taskId, 'skip', {
      reason: errorMessage
    });
    
    logger.info(`Skipping failed task ${taskId}`, {
      plan_id: planId,
      task_name: task.name,
      error: errorMessage
    });
    
    // 返回结果
    return {
      success: true,
      strategy_used: 'skip',
      task_id: taskId,
      plan_id: planId,
      new_status: 'skipped',
      execution_time_ms: 0
    };
  }
  
  /**
   * 应用人工干预策略
   */
  private async applyManualInterventionStrategy(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    interventionConfig?: ManualInterventionConfig
  ): Promise<FailureRecoveryResult> {
    const config = interventionConfig || this.config.default_resolver.manual_intervention_config || {
      timeout_ms: 300000, // 5分钟
      escalation_levels: ['team_lead', 'project_manager'],
      approval_required: true
    };
    
    // 如果没有人工干预处理器，返回需要干预的结果
    if (!this.config.manual_intervention_handler) {
      return {
        success: false,
        strategy_used: 'manual_intervention',
        task_id: taskId,
        plan_id: planId,
        new_status: 'failed',
        execution_time_ms: 0,
        intervention_required: true,
        error_message: 'Manual intervention required, but no handler configured'
      };
    }
    
    // 发出人工干预请求事件
    this.emitEvent('manual_intervention_requested', planId, taskId, 'manual_intervention', {
      reason: errorMessage,
      timeout_ms: config.timeout_ms,
      escalation_levels: config.escalation_levels
    });
    
    // 记录请求
    const requestedAt = new Date().toISOString();
    
    // 设置超时处理
    const timeoutId = setTimeout(() => {
      this.handleInterventionTimeout(taskId, planId);
    }, config.timeout_ms);
    
    // 保存干预请求
    this.pendingInterventions.set(taskId, {
      planId,
      requestedAt,
      reason: errorMessage,
      timeoutId
    });
    
    logger.info(`Manual intervention requested for task ${taskId}`, {
      plan_id: planId,
      task_name: task.name,
      error: errorMessage,
      timeout_ms: config.timeout_ms
    });
    
    // 尝试调用人工干预处理器
    try {
      const approved = await this.config.manual_intervention_handler(taskId, planId, errorMessage);
      
      // 清除超时
      const intervention = this.pendingInterventions.get(taskId);
      if (intervention) {
        clearTimeout(intervention.timeoutId);
        this.pendingInterventions.delete(taskId);
      }
      
      // 处理干预结果
      if (approved) {
        // 发出干预成功事件
        this.emitEvent('manual_intervention_received', planId, taskId, 'manual_intervention', {
          approved: true,
          resolution: 'retry'
        });
        
        logger.info(`Manual intervention approved for task ${taskId}`, {
          plan_id: planId,
          task_name: task.name
        });
        
        return {
          success: true,
          strategy_used: 'manual_intervention',
          task_id: taskId,
          plan_id: planId,
          new_status: 'ready',
          execution_time_ms: 0
        };
      } else {
        // 发出干预拒绝事件
        this.emitEvent('manual_intervention_received', planId, taskId, 'manual_intervention', {
          approved: false,
          resolution: 'skip'
        });
        
        logger.info(`Manual intervention rejected for task ${taskId}`, {
          plan_id: planId,
          task_name: task.name
        });
        
        return {
          success: false,
          strategy_used: 'manual_intervention',
          task_id: taskId,
          plan_id: planId,
          new_status: 'failed',
          execution_time_ms: 0,
          error_message: 'Manual intervention rejected'
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Error processing manual intervention for task ${taskId}`, {
        plan_id: planId,
        error: errorMsg
      });
      
      return {
        success: false,
        strategy_used: 'manual_intervention',
        task_id: taskId,
        plan_id: planId,
        new_status: 'failed',
        execution_time_ms: 0,
        intervention_required: true,
        error_message: `Error processing manual intervention: ${errorMsg}`
      };
    }
  }
  
  /**
   * 处理人工干预超时
   */
  private handleInterventionTimeout(taskId: UUID, planId: UUID): void {
    const intervention = this.pendingInterventions.get(taskId);
    if (!intervention) return;
    
    // 清除干预请求
    this.pendingInterventions.delete(taskId);
    
    // 发出超时事件
    this.emitEvent('manual_intervention_timeout', planId, taskId, 'manual_intervention', {
      requested_at: intervention.requestedAt,
      reason: intervention.reason
    });
    
    logger.warn(`Manual intervention timeout for task ${taskId}`, {
      plan_id: planId,
      requested_at: intervention.requestedAt
    });
  }
  
  /**
   * 发送通知
   */
  async sendNotification(
    channel: NotificationChannel,
    message: string,
    data: unknown
  ): Promise<void> {
    if (this.config.notification_handler) {
      try {
        await this.config.notification_handler(channel, message, data);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error sending notification to ${channel}`, { error: errorMsg });
      }
    } else {
      // 默认控制台输出
      if (channel === 'console') {
        logger.info(`NOTIFICATION: ${message}`, { data });
      }
    }
  }
  
  /**
   * 提供人工干预响应
   */
  async provideManualIntervention(
    taskId: UUID,
    approved: boolean,
    resolution?: string
  ): Promise<boolean> {
    const intervention = this.pendingInterventions.get(taskId);
    if (!intervention) {
      logger.warn(`No pending intervention found for task ${taskId}`);
      return false;
    }
    
    // 清除超时
    clearTimeout(intervention.timeoutId);
    this.pendingInterventions.delete(taskId);
    
    // 发出干预响应事件
    this.emitEvent('manual_intervention_received', intervention.planId, taskId, 'manual_intervention', {
      approved,
      resolution: resolution || (approved ? 'retry' : 'skip')
    });
    
    logger.info(`Manual intervention response received for task ${taskId}`, {
      plan_id: intervention.planId,
      approved,
      resolution
    });
    
    return true;
  }
  
  /**
   * 重置任务重试计数器
   */
  resetRetryCounter(taskId: UUID): void {
    this.taskRetryCounters.delete(taskId);
  }
  
  /**
   * 获取任务当前重试次数
   */
  getRetryCount(taskId: UUID): number {
    return this.taskRetryCounters.get(taskId) || 0;
  }
  
  /**
   * 获取所有待处理的人工干预
   */
  getPendingInterventions(): Map<UUID, {
    planId: UUID;
    requestedAt: Timestamp;
    reason: string;
  }> {
    const result = new Map<UUID, {
      planId: UUID;
      requestedAt: Timestamp;
      reason: string;
    }>();
    
    this.pendingInterventions.forEach((value, key) => {
      result.set(key, {
        planId: value.planId,
        requestedAt: value.requestedAt,
        reason: value.reason
      });
    });
    
    return result;
  }
  
  /**
   * 合并解决器配置
   */
  private mergeResolvers(
    defaultResolver: FailureResolver,
    customResolver?: Partial<FailureResolver>
  ): FailureResolver {
    if (!customResolver) {
      return defaultResolver;
    }
    
    return {
      enabled: customResolver.enabled ?? defaultResolver.enabled,
      strategies: customResolver.strategies || defaultResolver.strategies,
      retry_config: customResolver.retry_config ? {
        ...defaultResolver.retry_config,
        ...customResolver.retry_config
      } : defaultResolver.retry_config,
      rollback_config: customResolver.rollback_config ? {
        ...defaultResolver.rollback_config,
        ...customResolver.rollback_config
      } : defaultResolver.rollback_config,
      manual_intervention_config: customResolver.manual_intervention_config ? {
        ...defaultResolver.manual_intervention_config,
        ...customResolver.manual_intervention_config
      } : defaultResolver.manual_intervention_config,
      notification_channels: customResolver.notification_channels || defaultResolver.notification_channels,
      performance_thresholds: customResolver.performance_thresholds ? {
        ...defaultResolver.performance_thresholds,
        ...customResolver.performance_thresholds
      } : defaultResolver.performance_thresholds,
      // Add intelligent diagnostics to merged config
      intelligent_diagnostics: customResolver.intelligent_diagnostics || defaultResolver.intelligent_diagnostics,
      vendor_integration: customResolver.vendor_integration || defaultResolver.vendor_integration
    };
  }
  
  /**
   * 发出事件
   */
  private emitEvent(
    eventType: FailureResolverEventType,
    planId: UUID,
    taskId: UUID,
    strategy: RecoveryStrategy,
    data: unknown
  ): void {
    const event: FailureResolverEvent = {
      event_id: uuidv4(),
      event_type: eventType,
      plan_id: planId,
      task_id: taskId,
      timestamp: new Date().toISOString(),
      strategy,
      data
    };
    
    this.emit(eventType, event);
    this.emit('any_event', event);
  }

  /**
   * 智能诊断故障
   * 
   * 分析失败原因，识别故障模式，提供恢复建议
   * 
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param task 任务对象
   * @param errorMessage 错误信息
   * @param config 诊断配置
   * @returns 诊断结果
   */
  private async diagnoseFaiure(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    config: FailureDiagnosticsConfig
  ): Promise<FailureDiagnostics> {
    const startTime = performance.now();
    logger.info('开始智能故障诊断', {
      plan_id: planId,
      task_id: taskId,
      analysis_depth: config.analysis_depth
    });
    
    // 创建诊断ID
    const diagnosticId = uuidv4();
    
    // 如果有增强型追踪适配器，优先使用其AI诊断能力
    if (this.traceAdapter && this.traceAdapter.getRecoverySuggestions) {
      try {
        // 先同步故障信息到适配器
        const syncResult = await this.syncFailureToAdapter(planId, taskId, task, errorMessage);
        
        if (syncResult.success && syncResult.sync_id) {
          // 使用适配器的AI诊断能力获取恢复建议
          const suggestions = await this.traceAdapter.getRecoverySuggestions(syncResult.sync_id);
          
          if (suggestions && suggestions.length > 0) {
            logger.info('使用增强型追踪适配器进行AI诊断', {
              plan_id: planId,
              task_id: taskId,
              suggestions_count: suggestions.length
            });
            
            // 从适配器建议中提取故障类型和根本原因
            const failureType = this.analyzeFailureType(errorMessage, task);
            const rootCauseAnalysis = suggestions[0].suggestion.split(':')[0] || 
              this.analyzeRootCause(errorMessage, task, failureType, config.analysis_depth);
            
            // 从适配器建议中提取恢复策略
            const suggestedStrategies: RecoveryStrategy[] = [];
            for (const suggestion of suggestions) {
              if (suggestion.suggestion.includes('retry')) {
                suggestedStrategies.push('retry');
              } else if (suggestion.suggestion.includes('rollback')) {
                suggestedStrategies.push('rollback');
              } else if (suggestion.suggestion.includes('skip')) {
                suggestedStrategies.push('skip');
              } else if (suggestion.suggestion.includes('manual')) {
                suggestedStrategies.push('manual_intervention');
              }
            }
            
            // 如果没有从建议中提取到策略，使用默认策略
            if (suggestedStrategies.length === 0) {
              suggestedStrategies.push(...this.determineSuggestedStrategies(
                failureType, 
                rootCauseAnalysis, 
                [],
                undefined
              ));
            }
            
            // 创建诊断结果
            const diagnostics: FailureDiagnostics = {
              failure_id: diagnosticId,
              failure_type: failureType,
              root_cause_analysis: rootCauseAnalysis,
              suggested_strategies: suggestedStrategies,
              confidence_score: Math.max(...suggestions.map(s => s.confidence_score || 0.7)),
              related_failures: [],
              diagnostic_data: {
                task_type: task.type,
                error_message: errorMessage,
                pattern_id: undefined,
                analysis_time_ms: performance.now() - startTime,
                adapter_enhanced: true,
                suggestions: suggestions.map(s => s.suggestion)
              }
            };
            
            // 存储诊断结果到历史记录
            this.storeFailureDiagnostics(taskId.toString(), diagnostics);
            
            logger.info('增强型追踪适配器AI诊断完成', {
              plan_id: planId,
              task_id: taskId,
              failure_type: failureType,
              confidence_score: diagnostics.confidence_score,
              suggested_strategies: suggestedStrategies,
              analysis_time_ms: performance.now() - startTime
            });
            
            return diagnostics;
          }
        }
      } catch (error) {
        logger.warn('增强型追踪适配器AI诊断失败，回退到本地诊断', {
          plan_id: planId,
          task_id: taskId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // 继续使用本地诊断逻辑
      }
    }
    
    // 本地诊断逻辑
    // 分析错误信息，确定故障类型
    const failureType = this.analyzeFailureType(errorMessage, task);
    
    // 进行根本原因分析
    const rootCauseAnalysis = this.analyzeRootCause(errorMessage, task, failureType, config.analysis_depth);
    
    // 查找相关的历史故障
    const relatedFailures = config.historical_analysis 
      ? this.findRelatedFailures(failureType, errorMessage, task.type, config.max_related_failures)
      : [];
    
    // 识别故障模式
    let patternId: string | undefined;
    if (config.pattern_recognition) {
      const pattern = this.identifyFailurePattern(failureType, errorMessage, task.type);
      if (pattern) {
        patternId = pattern.pattern_id;
      }
    }
    
    // 确定建议的恢复策略
    const suggestedStrategies = this.determineSuggestedStrategies(
      failureType, 
      rootCauseAnalysis, 
      relatedFailures,
      patternId
    );
    
    // 计算置信度分数
    const confidenceScore = this.calculateConfidenceScore(
      failureType,
      rootCauseAnalysis,
      relatedFailures.length,
      patternId !== undefined
    );
    
    // 创建诊断结果
    const diagnostics: FailureDiagnostics = {
      failure_id: diagnosticId,
      failure_type: failureType,
      root_cause_analysis: rootCauseAnalysis,
      suggested_strategies: suggestedStrategies,
      confidence_score: confidenceScore,
      related_failures: relatedFailures.map(f => f.failure_id),
      diagnostic_data: {
        task_type: task.type,
        error_message: errorMessage,
        pattern_id: patternId,
        analysis_time_ms: performance.now() - startTime,
        adapter_enhanced: false
      }
    };
    
    // 存储诊断结果到历史记录
    this.storeFailureDiagnostics(taskId.toString(), diagnostics);
    
    logger.info('本地智能故障诊断完成', {
      plan_id: planId,
      task_id: taskId,
      failure_type: failureType,
      confidence_score: confidenceScore,
      suggested_strategies: suggestedStrategies,
      analysis_time_ms: performance.now() - startTime
    });
    
    return diagnostics;
  }
  
  /**
   * 分析故障类型
   * 
   * @param errorMessage 错误信息
   * @param task 任务对象
   * @returns 故障类型
   */
  private analyzeFailureType(errorMessage: string, task: PlanTask): string {
    // 基于错误消息和任务类型分析故障类型
    if (errorMessage.includes('timeout')) {
      return 'timeout_failure';
    } else if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
      return 'permission_failure';
    } else if (errorMessage.includes('resource') || errorMessage.includes('memory') || errorMessage.includes('cpu')) {
      return 'resource_failure';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network_failure';
    } else if (errorMessage.includes('dependency') || errorMessage.includes('required task')) {
      return 'dependency_failure';
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'validation_failure';
    } else if (errorMessage.includes('conflict') || errorMessage.includes('concurrent')) {
      return 'concurrency_failure';
    } else {
      return 'unknown_failure';
    }
  }
  
  /**
   * 分析根本原因
   * 
   * @param errorMessage 错误信息
   * @param task 任务对象
   * @param failureType 故障类型
   * @param analysisDepth 分析深度
   * @returns 根本原因分析
   */
  private analyzeRootCause(
    errorMessage: string, 
    task: PlanTask, 
    failureType: string,
    analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  ): string {
    // 基于错误消息、任务类型和故障类型分析根本原因
    let rootCause = '';
    
    switch (failureType) {
      case 'timeout_failure':
        rootCause = '任务执行超时，可能是由于资源不足或任务复杂度过高';
        break;
      case 'permission_failure':
        rootCause = '权限不足，无法访问所需资源';
        break;
      case 'resource_failure':
        rootCause = '资源不足或资源分配失败';
        break;
      case 'network_failure':
        rootCause = '网络连接问题导致任务失败';
        break;
      case 'dependency_failure':
        rootCause = '依赖的任务失败或不可用';
        break;
      case 'validation_failure':
        rootCause = '输入验证失败，数据不符合要求';
        break;
      case 'concurrency_failure':
        rootCause = '并发冲突导致任务失败';
        break;
      default:
        rootCause = '未知原因导致任务失败';
    }
    
    // 根据分析深度添加更多详细信息
    if (analysisDepth === 'detailed' || analysisDepth === 'comprehensive') {
      rootCause += `。错误详情：${errorMessage}`;
    }
    
    if (analysisDepth === 'comprehensive') {
      rootCause += `。任务类型：${task.type}，任务优先级：${task.priority}`;
      
      if (task.metadata) {
        rootCause += `。任务复杂度：${task.metadata.complexity_score || 'unknown'}`;
        rootCause += `。重试次数：${task.metadata.retry_count || 0}/${task.metadata.max_retry_count || 'unknown'}`;
      }
    }
    
    return rootCause;
  }
  
  /**
   * 查找相关的历史故障
   * 
   * @param failureType 故障类型
   * @param errorMessage 错误信息
   * @param taskType 任务类型
   * @param maxResults 最大结果数
   * @returns 相关的历史故障
   */
  private findRelatedFailures(
    failureType: string,
    errorMessage: string,
    taskType: string,
    maxResults: number = 5
  ): FailureDiagnostics[] {
    // 从历史记录中查找相似的故障
    const allDiagnostics: FailureDiagnostics[] = [];
    
    // 收集所有历史诊断结果
    for (const diagnosticsList of this.failureHistory.values()) {
      allDiagnostics.push(...diagnosticsList);
    }
    
    // 按相关性排序
    const relatedDiagnostics = allDiagnostics
      .filter(d => d.failure_type === failureType)
      .filter(d => {
        const storedTaskType = (d.diagnostic_data as any)?.task_type;
        return storedTaskType === taskType;
      })
      .sort((a, b) => {
        // 计算相似度分数
        const scoreA = this.calculateSimilarityScore(errorMessage, (a.diagnostic_data as any)?.error_message || '');
        const scoreB = this.calculateSimilarityScore(errorMessage, (b.diagnostic_data as any)?.error_message || '');
        return scoreB - scoreA; // 降序排序
      })
      .slice(0, maxResults);
    
    return relatedDiagnostics;
  }
  
  /**
   * 计算文本相似度分数
   * 
   * @param text1 文本1
   * @param text2 文本2
   * @returns 相似度分数 (0-1)
   */
  private calculateSimilarityScore(text1: string, text2: string): number {
    // 简单的相似度计算，实际实现可能更复杂
    if (!text1 || !text2) return 0;
    
    // 将文本转换为小写并分割为单词
    const words1 = text1.toLowerCase().split(/\W+/);
    const words2 = text2.toLowerCase().split(/\W+/);
    
    // 计算共同单词数
    const commonWords = words1.filter(word => words2.includes(word));
    
    // 计算Jaccard相似度
    const union = new Set([...words1, ...words2]);
    return commonWords.length / union.size;
  }
  
  /**
   * 识别故障模式
   * 
   * @param failureType 故障类型
   * @param errorMessage 错误信息
   * @param taskType 任务类型
   * @returns 故障模式分析
   */
  private identifyFailurePattern(
    failureType: string,
    errorMessage: string,
    taskType: string
  ): FailurePatternAnalysis | undefined {
    // 生成模式ID
    const patternKey = `${failureType}:${taskType}`;
    
    // 检查是否已有该模式
    if (this.failurePatterns.has(patternKey)) {
      const pattern = this.failurePatterns.get(patternKey)!;
      
      // 更新模式信息
      pattern.occurrence_count += 1;
      
      // 返回更新后的模式
      return pattern;
    }
    
    // 创建新模式
    const newPattern: FailurePatternAnalysis = {
      pattern_id: uuidv4(),
      pattern_name: `${taskType}-${failureType}-pattern`,
      occurrence_count: 1,
      affected_task_types: [taskType],
      common_factors: [failureType],
      prevention_suggestions: this.generatePreventionSuggestions(failureType, taskType)
    };
    
    // 存储新模式
    this.failurePatterns.set(patternKey, newPattern);
    
    // 返回新模式
    return newPattern;
  }
  
  /**
   * 生成预防建议
   * 
   * @param failureType 故障类型
   * @param taskType 任务类型
   * @returns 预防建议
   */
  private generatePreventionSuggestions(failureType: string, taskType: string): string[] {
    const suggestions: string[] = [];
    
    switch (failureType) {
      case 'timeout_failure':
        suggestions.push('增加任务超时时间');
        suggestions.push('优化任务执行效率');
        suggestions.push('将大型任务拆分为多个小任务');
        break;
      case 'permission_failure':
        suggestions.push('检查并更新任务执行权限');
        suggestions.push('提前验证权限需求');
        break;
      case 'resource_failure':
        suggestions.push('增加资源分配');
        suggestions.push('实施资源预留机制');
        suggestions.push('添加资源自动扩展');
        break;
      case 'network_failure':
        suggestions.push('实施网络重试机制');
        suggestions.push('添加网络冗余');
        suggestions.push('实施断路器模式');
        break;
      case 'dependency_failure':
        suggestions.push('添加依赖健康检查');
        suggestions.push('实施依赖降级策略');
        suggestions.push('添加依赖缓存');
        break;
      case 'validation_failure':
        suggestions.push('增强输入验证');
        suggestions.push('添加数据预处理步骤');
        break;
      case 'concurrency_failure':
        suggestions.push('实施乐观锁定');
        suggestions.push('添加并发控制机制');
        suggestions.push('实施任务队列');
        break;
      default:
        suggestions.push('添加详细日志记录');
        suggestions.push('实施健康检查');
    }
    
    return suggestions;
  }
  
  /**
   * 确定建议的恢复策略
   * 
   * @param failureType 故障类型
   * @param rootCauseAnalysis 根本原因分析
   * @param relatedFailures 相关的历史故障
   * @param patternId 故障模式ID
   * @returns 建议的恢复策略
   */
  private determineSuggestedStrategies(
    failureType: string,
    rootCauseAnalysis: string,
    relatedFailures: FailureDiagnostics[],
    patternId?: string
  ): RecoveryStrategy[] {
    // 默认策略
    const defaultStrategies: RecoveryStrategy[] = ['retry', 'skip', 'manual_intervention'];
    
    // 如果有相关历史故障，分析哪些策略最成功
    if (relatedFailures.length > 0) {
      // 统计每种策略的成功率
      const strategySuccessCount: Record<RecoveryStrategy, number> = {
        'retry': 0,
        'rollback': 0,
        'skip': 0,
        'manual_intervention': 0
      };
      
      // 统计每种策略的使用次数
      const strategyUseCount: Record<RecoveryStrategy, number> = {
        'retry': 0,
        'rollback': 0,
        'skip': 0,
        'manual_intervention': 0
      };
      
      // 从学习数据中获取策略成功率
      for (const failure of relatedFailures) {
        const taskId = failure.failure_id;
        const learningEntries = this.learningData.get(taskId);
        
        if (learningEntries) {
          for (const entry of learningEntries) {
            strategyUseCount[entry.strategy]++;
            if (entry.success) {
              strategySuccessCount[entry.strategy]++;
            }
          }
        }
      }
      
      // 计算每种策略的成功率
      const strategySuccessRate: Record<RecoveryStrategy, number> = {
        'retry': 0,
        'rollback': 0,
        'skip': 0,
        'manual_intervention': 0
      };
      
      for (const strategy of Object.keys(strategyUseCount) as RecoveryStrategy[]) {
        if (strategyUseCount[strategy] > 0) {
          strategySuccessRate[strategy] = strategySuccessCount[strategy] / strategyUseCount[strategy];
        }
      }
      
      // 按成功率排序策略
      const sortedStrategies = Object.keys(strategySuccessRate)
        .filter(strategy => strategyUseCount[strategy as RecoveryStrategy] > 0)
        .sort((a, b) => strategySuccessRate[b as RecoveryStrategy] - strategySuccessRate[a as RecoveryStrategy]) as RecoveryStrategy[];
      
      // 如果有足够的数据，使用排序后的策略
      if (sortedStrategies.length > 0) {
        return sortedStrategies;
      }
    }
    
    // 基于故障类型推荐策略
    switch (failureType) {
      case 'timeout_failure':
        return ['retry', 'skip', 'manual_intervention'];
      case 'permission_failure':
        return ['manual_intervention', 'skip'];
      case 'resource_failure':
        return ['retry', 'skip', 'manual_intervention'];
      case 'network_failure':
        return ['retry', 'retry', 'skip']; // 重试两次，然后跳过
      case 'dependency_failure':
        return ['rollback', 'retry', 'manual_intervention'];
      case 'validation_failure':
        return ['manual_intervention', 'skip'];
      case 'concurrency_failure':
        return ['retry', 'rollback', 'manual_intervention'];
      default:
        return defaultStrategies;
    }
  }
  
  /**
   * 计算置信度分数
   * 
   * @param failureType 故障类型
   * @param rootCauseAnalysis 根本原因分析
   * @param relatedFailuresCount 相关的历史故障数量
   * @param hasPattern 是否有故障模式
   * @returns 置信度分数 (0-1)
   */
  private calculateConfidenceScore(
    failureType: string,
    rootCauseAnalysis: string,
    relatedFailuresCount: number,
    hasPattern: boolean
  ): number {
    // 基础分数
    let score = 0.5;
    
    // 如果故障类型不是"未知"，增加分数
    if (failureType !== 'unknown_failure') {
      score += 0.1;
    }
    
    // 根据相关历史故障数量增加分数
    score += Math.min(0.2, relatedFailuresCount * 0.04);
    
    // 如果有故障模式，增加分数
    if (hasPattern) {
      score += 0.1;
    }
    
    // 确保分数在0-1范围内
    return Math.min(1, Math.max(0, score));
  }
  
  /**
   * 存储故障诊断结果
   * 
   * @param taskId 任务ID
   * @param diagnostics 诊断结果
   */
  private storeFailureDiagnostics(taskId: string, diagnostics: FailureDiagnostics): void {
    // 获取任务的诊断历史
    const taskDiagnostics = this.failureHistory.get(taskId) || [];
    
    // 添加新的诊断结果
    taskDiagnostics.push(diagnostics);
    
    // 更新历史记录
    this.failureHistory.set(taskId, taskDiagnostics);
  }
  
  /**
   * 记录学习数据
   * 
   * @param taskId 任务ID
   * @param strategy 恢复策略
   * @param success 是否成功
   * @param executionTime 执行时间
   * @param context 上下文信息
   */
  private recordLearningData(
    taskId: string,
    strategy: RecoveryStrategy,
    success: boolean,
    executionTime: number,
    context: Record<string, unknown>
  ): void {
    // 获取任务的学习数据
    const taskLearningData = this.learningData.get(taskId) || [];
    
    // 添加新的学习数据
    taskLearningData.push({
      strategy,
      success,
      execution_time_ms: executionTime,
      context
    });
    
    // 更新学习数据
    this.learningData.set(taskId, taskLearningData);
  }
  
  /**
   * 获取故障诊断历史
   * 
   * @param taskId 任务ID
   * @returns 诊断历史
   */
  getFailureDiagnosticsHistory(taskId: string): FailureDiagnostics[] {
    return this.failureHistory.get(taskId) || [];
  }
  
  /**
   * 获取故障模式
   * 
   * @returns 故障模式
   */
  getFailurePatterns(): FailurePatternAnalysis[] {
    return Array.from(this.failurePatterns.values());
  }

  /**
   * 发送通知到队列
   * 
   * @private
   * @param channel 通知渠道
   * @param message 消息内容
   * @param data 数据对象
   */
  private queueNotification(
    channel: NotificationChannel,
    message: string,
    data: unknown
  ): void {
    // 厂商中立的通知队列实现
    this.notificationQueue.push({
      channel,
      message,
      data,
      timestamp: new Date().toISOString()
    });
    
    // 如果有通知处理器，立即处理
    if (this.config.notification_handler) {
      this.processNotifications().catch(error => {
        logger.error('Error processing notifications', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });
    }
  }
  
  /**
   * 处理通知队列
   * 
   * @private
   */
  private async processNotifications(): Promise<void> {
    if (!this.config.notification_handler || this.notificationQueue.length === 0) return;
    
    try {
      // 处理所有队列中的通知
      const notifications = [...this.notificationQueue];
      this.notificationQueue = [];
      
      // 并行处理通知
      await Promise.all(notifications.map(notification => 
        this.config.notification_handler!(
          notification.channel,
          notification.message,
          notification.data
        )
      ));
      
      logger.debug('Processed notifications', {
        count: notifications.length
      });
    } catch (error) {
      logger.error('Error processing notification queue', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * 记录故障恢复信息
   * 
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param diagnostics 故障诊断数据
   * @param recoveryResult 恢复结果
   */
  private logFailureRecovery(
    planId: UUID,
    taskId: UUID,
    diagnostics?: FailureDiagnostics,
    recoveryResult?: FailureRecoveryResult
  ): void {
    // 记录故障恢复信息到日志
    logger.info('故障恢复信息', {
      plan_id: planId,
      task_id: taskId,
      failure_type: diagnostics?.failure_type || 'unknown',
      root_cause: diagnostics?.root_cause_analysis,
      recovery_strategy: recoveryResult?.strategy_used || 'none',
      recovery_success: recoveryResult?.success || false,
      execution_time_ms: recoveryResult?.execution_time_ms
    });
    
    // 如果配置了性能监控，记录性能指标
    if (this.config.performance_monitor) {
      this.config.performance_monitor({
        failure_resolution_time_ms: recoveryResult?.execution_time_ms || 0,
        failure_diagnostics_time_ms: diagnostics ? 
          (new Date().getTime() - new Date(diagnostics.failure_id).getTime()) : 0
      });
    }
    
    // 发送通用通知（不依赖于特定供应商）
    if (this.config.notification_handler) {
      this.queueNotification(
        'console',
        'failure_recovery_completed',
        {
          plan_id: planId,
          task_id: taskId,
          timestamp: new Date().toISOString(),
          recovery_result: recoveryResult,
          diagnostics: {
            failure_type: diagnostics?.failure_type,
            root_cause: diagnostics?.root_cause_analysis,
            confidence_score: diagnostics?.confidence_score
          }
        }
      );
    }
  }

/**
 * 主动故障预防功能
 * 
 * 分析历史故障数据和当前任务特征，预测潜在故障并采取预防措施
 * 性能要求: <50ms
 * 
 * @param planId 计划ID
 * @param taskId 任务ID
 * @param task 任务对象
 * @param preventionConfig 预防配置
 * @returns 预防结果
 */
async preventPotentialFailure(
  planId: UUID,
  taskId: UUID,
  task: PlanTask,
  preventionConfig?: ProactiveFailurePrevention
): Promise<{
  potential_failures: string[];
  prevention_actions: string[];
  confidence_score: number;
  execution_time_ms: number;
}> {
  const startTime = performance.now();
  
  // 使用默认配置或提供的配置
  const config = preventionConfig || this.config.default_resolver.proactive_prevention || {
    enabled: false,
    prediction_confidence_threshold: 0.7,
    auto_prevention_enabled: false,
    prevention_strategies: ['resource_scaling', 'dependency_prefetch'],
    monitoring_interval_ms: 5000
  };
  
  // 如果未启用预防功能，返回空结果
  if (!config.enabled) {
    return {
      potential_failures: [],
      prevention_actions: [],
      confidence_score: 0,
      execution_time_ms: performance.now() - startTime
    };
  }
  
  try {
    logger.info('执行主动故障预防分析', {
      plan_id: planId,
      task_id: taskId,
      task_type: task.type
    });
    
    // 1. 分析任务特征
    const taskFeatures = this.analyzeTaskFeatures(task);
    
    // 2. 识别潜在故障模式
    const potentialFailures = await this.identifyPotentialFailures(task, taskFeatures);
    
    // 3. 如果没有发现潜在故障，提前返回
    if (potentialFailures.length === 0) {
      return {
        potential_failures: [],
        prevention_actions: [],
        confidence_score: 0,
        execution_time_ms: performance.now() - startTime
      };
    }
    
    // 4. 计算置信度分数
    const confidenceScores = potentialFailures.map(failure => failure.confidence);
    const averageConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    
    // 5. 如果置信度低于阈值，不执行预防措施
    if (averageConfidence < config.prediction_confidence_threshold) {
      return {
        potential_failures: potentialFailures.map(f => f.type),
        prevention_actions: [],
        confidence_score: averageConfidence,
        execution_time_ms: performance.now() - startTime
      };
    }
    
    // 6. 确定预防措施
    const preventionActions = await this.determinePotentialPreventionActions(
      potentialFailures, 
      task,
      config.prevention_strategies
    );
    
    // 7. 如果启用了自动预防，执行预防措施
    if (config.auto_prevention_enabled && preventionActions.length > 0) {
      await this.executePreventionActions(planId, taskId, task, preventionActions);
      
      logger.info('自动执行预防措施', {
        plan_id: planId,
        task_id: taskId,
        actions: preventionActions.map(a => a.action),
        confidence_score: averageConfidence
      });
    }
    
    // 8. 通知预防数据
    this.queueNotification('console', 'failure_prevention_analysis', {
      plan_id: planId,
      task_id: taskId,
      prevention_analysis: {
        potential_failures: potentialFailures,
        prevention_actions: preventionActions,
        confidence_score: averageConfidence
      }
    });
    
    return {
      potential_failures: potentialFailures.map(f => f.type),
      prevention_actions: preventionActions.map(a => a.action),
      confidence_score: averageConfidence,
      execution_time_ms: performance.now() - startTime
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('主动故障预防分析失败', {
      plan_id: planId,
      task_id: taskId,
      error: errorMessage
    });
    
    return {
      potential_failures: [],
      prevention_actions: [],
      confidence_score: 0,
      execution_time_ms: performance.now() - startTime
    };
  }
}

/**
 * 分析任务特征
 * 
 * @param task 任务对象
 * @returns 任务特征
 */
private analyzeTaskFeatures(task: PlanTask): Record<string, unknown> {
  return {
    task_type: task.type,
    priority: task.priority,
    has_dependencies: task.dependencies && task.dependencies.length > 0,
    dependencies_count: task.dependencies?.length || 0,
    has_subtasks: task.sub_tasks && task.sub_tasks.length > 0,
    subtasks_count: task.sub_tasks?.length || 0,
    estimated_effort: task.estimated_effort,
    has_resources: task.resources_required && task.resources_required.length > 0,
    resources_count: task.resources_required?.length || 0,
    metadata: task.metadata || {},
    execution_context: task.execution_context || {}
  };
}

/**
 * 识别潜在故障
 * 
 * @param task 任务对象
 * @param taskFeatures 任务特征
 * @returns 潜在故障列表
 */
private async identifyPotentialFailures(
  task: PlanTask, 
  taskFeatures: Record<string, unknown>
): Promise<Array<{type: string; reason: string; confidence: number}>> {
  const potentialFailures: Array<{type: string; reason: string; confidence: number}> = [];
  
  // 1. 基于历史故障模式识别
  const patterns = Array.from(this.failurePatterns.values());
  for (const pattern of patterns) {
    // 检查任务类型是否匹配故障模式
    if (pattern.affected_task_types.includes(task.type)) {
      const similarityScore = this.calculatePatternSimilarity(taskFeatures, pattern);
      
      // 如果相似度高于阈值，添加到潜在故障列表
      if (similarityScore > 0.6) {
        potentialFailures.push({
          type: pattern.pattern_name,
          reason: `匹配历史故障模式: ${pattern.pattern_name}`,
          confidence: similarityScore
        });
      }
    }
  }
  
  // 2. 基于任务特征识别常见故障风险
  
  // 检查依赖复杂性风险
  if ((task.dependencies?.length || 0) > 5) {
    potentialFailures.push({
      type: 'dependency_complexity',
      reason: '任务依赖过多，可能导致依赖解析失败',
      confidence: 0.7 + Math.min((task.dependencies?.length || 0) / 20, 0.2)
    });
  }
  
  // 检查资源需求风险
  if (task.resources_required && task.resources_required.some(r => r.availability === 'required')) {
    potentialFailures.push({
      type: 'resource_constraint',
      reason: '任务需要关键资源，可能因资源不可用而失败',
      confidence: 0.65
    });
  }
  
  // 检查任务复杂性风险
  if (task.sub_tasks && task.sub_tasks.length > 3) {
    potentialFailures.push({
      type: 'task_complexity',
      reason: '复合任务包含多个子任务，增加失败风险',
      confidence: 0.6 + Math.min(task.sub_tasks.length / 20, 0.3)
    });
  }
  
  // 检查任务类型特定风险
  if (task.type === 'milestone' || task.type === 'checkpoint') {
    potentialFailures.push({
      type: 'critical_task_risk',
      reason: `${task.type}类型任务失败影响范围大`,
      confidence: 0.75
    });
  }
  
  return potentialFailures;
}

/**
 * 计算任务特征与故障模式的相似度
 * 
 * @param taskFeatures 任务特征
 * @param pattern 故障模式
 * @returns 相似度分数 (0-1)
 */
private calculatePatternSimilarity(
  taskFeatures: Record<string, unknown>,
  pattern: FailurePatternAnalysis
): number {
  // 提取模式的关键特征
  const patternFactors = pattern.common_factors;
  
  // 计算匹配的特征数量
  let matchCount = 0;
  
  for (const factor of patternFactors) {
    // 解析特征因子 (格式: "key=value" 或 "key>value" 或 "key<value" 或 "key:exists")
    const match = factor.match(/^([^=><:]+)([=><:])(.*)$/);
    if (!match) continue;
    
    const [, key, operator, value] = match;
    
    if (key in taskFeatures) {
      switch (operator) {
        case '=':
          if (String(taskFeatures[key]) === value) matchCount++;
          break;
        case '>':
          if (typeof taskFeatures[key] === 'number' && 
              (taskFeatures[key] as number) > parseFloat(value)) {
            matchCount++;
          }
          break;
        case '<':
          if (typeof taskFeatures[key] === 'number' && 
              (taskFeatures[key] as number) < parseFloat(value)) {
            matchCount++;
          }
          break;
        case ':':
          if (value === 'exists' && taskFeatures[key] !== undefined) matchCount++;
          break;
      }
    }
  }
  
  // 计算相似度分数
  return patternFactors.length > 0 ? matchCount / patternFactors.length : 0;
}

/**
 * 确定潜在预防措施
 * 
 * @param potentialFailures 潜在故障列表
 * @param task 任务对象
 * @param availableStrategies 可用预防策略
 * @returns 预防措施列表
 */
private async determinePotentialPreventionActions(
  potentialFailures: Array<{type: string; reason: string; confidence: number}>,
  task: PlanTask,
  availableStrategies: PreventionStrategy[]
): Promise<Array<{action: string; description: string; strategy: PreventionStrategy}>> {
  const preventionActions: Array<{
    action: string;
    description: string;
    strategy: PreventionStrategy;
  }> = [];
  
  // 根据故障类型确定预防措施
  for (const failure of potentialFailures) {
    switch (failure.type) {
      case 'dependency_complexity':
        if (availableStrategies.includes('dependency_prefetch')) {
          preventionActions.push({
            action: 'prefetch_dependencies',
            description: '预先获取任务依赖，减少依赖解析失败风险',
            strategy: 'dependency_prefetch'
          });
        }
        if (availableStrategies.includes('task_reordering')) {
          preventionActions.push({
            action: 'optimize_dependency_order',
            description: '优化依赖执行顺序，减少阻塞风险',
            strategy: 'task_reordering'
          });
        }
        break;
        
      case 'resource_constraint':
        if (availableStrategies.includes('resource_scaling')) {
          preventionActions.push({
            action: 'preallocate_resources',
            description: '预先分配任务所需资源，确保资源可用性',
            strategy: 'resource_scaling'
          });
        }
        if (availableStrategies.includes('load_balancing')) {
          preventionActions.push({
            action: 'balance_resource_usage',
            description: '平衡资源使用，避免资源竞争',
            strategy: 'load_balancing'
          });
        }
        break;
        
      case 'task_complexity':
        if (availableStrategies.includes('early_checkpoint')) {
          preventionActions.push({
            action: 'create_subtask_checkpoints',
            description: '为复杂任务创建检查点，便于部分失败恢复',
            strategy: 'early_checkpoint'
          });
        }
        break;
        
      case 'critical_task_risk':
        if (availableStrategies.includes('early_checkpoint')) {
          preventionActions.push({
            action: 'create_pre_milestone_checkpoint',
            description: '在关键任务前创建检查点，确保可回滚',
            strategy: 'early_checkpoint'
          });
        }
        break;
        
      default:
        // 对于未知的故障类型，使用通用预防措施
        if (availableStrategies.includes('resource_scaling')) {
          preventionActions.push({
            action: 'increase_resource_allocation',
            description: '增加资源分配，提高任务成功率',
            strategy: 'resource_scaling'
          });
        }
    }
  }
  
  // 去重，避免重复的预防措施
  return preventionActions.filter((action, index, self) =>
    index === self.findIndex(a => a.action === action.action)
  );
}

/**
 * 执行预防措施
 * 
 * @param planId 计划ID
 * @param taskId 任务ID
 * @param task 任务对象
 * @param preventionActions 预防措施列表
 */
private async executePreventionActions(
  planId: UUID,
  taskId: UUID,
  task: PlanTask,
  preventionActions: Array<{action: string; description: string; strategy: PreventionStrategy}>
): Promise<void> {
  for (const action of preventionActions) {
    try {
      logger.info(`执行预防措施: ${action.action}`, {
        plan_id: planId,
        task_id: taskId,
        strategy: action.strategy
      });
      
      switch (action.strategy) {
        case 'resource_scaling':
          // 实现资源扩展逻辑
          await this.applyResourceScaling(task, action.action);
          break;
          
        case 'dependency_prefetch':
          // 实现依赖预获取逻辑
          await this.applyDependencyPrefetch(task);
          break;
          
        case 'task_reordering':
          // 实现任务重排序逻辑
          await this.applyTaskReordering(task);
          break;
          
        case 'early_checkpoint':
          // 实现提前检查点创建逻辑
          await this.applyEarlyCheckpoint(task);
          break;
          
        case 'load_balancing':
          // 实现负载均衡逻辑
          await this.applyLoadBalancing(task);
          break;
      }
      
      // 发出预防措施执行事件
      this.emit('prevention_action_executed', {
        plan_id: planId,
        task_id: taskId,
        action: action.action,
        strategy: action.strategy,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`执行预防措施失败: ${action.action}`, {
        plan_id: planId,
        task_id: taskId,
        strategy: action.strategy,
        error: errorMessage
      });
    }
  }
}

/**
 * 应用资源扩展策略
 */
private async applyResourceScaling(task: PlanTask, action: string): Promise<void> {
  // 根据不同的资源扩展动作执行不同的逻辑
  if (action === 'preallocate_resources') {
    // 预分配资源逻辑
    if (task.resources_required) {
      for (const resource of task.resources_required) {
        // 在这里实现资源预分配逻辑
        logger.debug(`预分配资源: ${resource.resource_type}`, {
          amount: resource.amount,
          unit: resource.unit
        });
      }
    }
  } else if (action === 'increase_resource_allocation') {
    // 增加资源分配逻辑
    if (task.resources_required) {
      for (const resource of task.resources_required) {
        // 增加资源分配量
        resource.amount = resource.amount * 1.5;
        logger.debug(`增加资源分配: ${resource.resource_type}`, {
          new_amount: resource.amount,
          unit: resource.unit
        });
      }
    }
  }
}

/**
 * 应用依赖预获取策略
 */
private async applyDependencyPrefetch(task: PlanTask): Promise<void> {
  // 预获取依赖逻辑
  if (task.dependencies && task.dependencies.length > 0) {
    logger.debug(`预获取${task.dependencies.length}个依赖`, {
      task_id: task.task_id,
      dependencies: task.dependencies
    });
    
    // 在这里实现依赖预获取逻辑
    // 例如，提前加载依赖任务的结果数据
  }
}

/**
 * 应用任务重排序策略
 */
private async applyTaskReordering(task: PlanTask): Promise<void> {
  // 任务重排序逻辑
  logger.debug('优化任务执行顺序', {
    task_id: task.task_id
  });
  
  // 在这里实现任务重排序逻辑
  // 例如，根据依赖关系优化执行顺序
}

/**
 * 应用提前检查点策略
 */
private async applyEarlyCheckpoint(task: PlanTask): Promise<void> {
  // 创建检查点逻辑
  logger.debug('创建任务检查点', {
    task_id: task.task_id,
    checkpoint_time: new Date().toISOString()
  });
  
  // 在这里实现检查点创建逻辑
  // 例如，保存当前任务状态，以便在失败时恢复
}

/**
 * 应用负载均衡策略
 */
private async applyLoadBalancing(task: PlanTask): Promise<void> {
  // 负载均衡逻辑
  logger.debug('应用负载均衡', {
    task_id: task.task_id
  });
  
  // 在这里实现负载均衡逻辑
  // 例如，将任务分配到负载较低的资源上
} 

/**
 * 自学习恢复机制
 * 
 * 基于历史恢复数据学习最佳恢复策略，并优化恢复流程
 * 性能要求: <100ms
 * 
 * @param taskId 任务ID
 * @param task 任务对象
 * @param errorMessage 错误信息
 * @param learningConfig 学习配置
 * @returns 学习结果和建议策略
 */
async learnAndOptimizeRecovery(
  taskId: UUID,
  task: PlanTask,
  errorMessage: string,
  learningConfig?: SelfLearningRecovery
): Promise<{
  recommended_strategies: RecoveryStrategy[];
  confidence_scores: Record<string, number>;
  adaptation_applied: boolean;
  execution_time_ms: number;
}> {
  const startTime = performance.now();
  
  // 使用默认配置或提供的配置
  const config = learningConfig || this.config.default_resolver.self_learning || {
    enabled: false,
    learning_mode: 'passive',
    min_samples_required: 10,
    adaptation_rate: 0.1,
    strategy_effectiveness_metrics: ['success_rate', 'recovery_time']
  };
  
  // 如果未启用自学习功能，返回空结果
  if (!config.enabled) {
    return {
      recommended_strategies: [],
      confidence_scores: {},
      adaptation_applied: false,
      execution_time_ms: performance.now() - startTime
    };
  }
  
  try {
    logger.info('执行自学习恢复分析', {
      task_id: taskId,
      task_type: task.type,
      learning_mode: config.learning_mode
    });
    
    // 1. 提取故障特征
    const failureFeatures = this.extractFailureFeatures(task, errorMessage);
    
    // 2. 查找类似的历史故障
    const similarFailures = this.findSimilarHistoricalFailures(failureFeatures);
    
    // 3. 如果没有足够的历史数据，返回默认策略
    if (similarFailures.length < config.min_samples_required) {
      logger.debug('历史数据不足，使用默认策略', {
        samples_found: similarFailures.length,
        min_required: config.min_samples_required
      });
      
      return {
        recommended_strategies: this.getDefaultRecoveryStrategies(task),
        confidence_scores: { default: 0.5 },
        adaptation_applied: false,
        execution_time_ms: performance.now() - startTime
      };
    }
    
    // 4. 分析每种策略的有效性
    const strategyEffectiveness = this.analyzeStrategyEffectiveness(similarFailures);
    
    // 5. 计算每种策略的置信度分数
    const confidenceScores = this.calculateStrategyConfidenceScores(strategyEffectiveness);
    
    // 6. 根据置信度排序策略
    const recommendedStrategies = Object.entries(confidenceScores)
      .sort((a, b) => b[1] - a[1])
      .map(([strategy]) => strategy as RecoveryStrategy);
    
    // 7. 如果是主动学习模式，应用适应性调整
    let adaptationApplied = false;
    if (config.learning_mode === 'active' || config.learning_mode === 'hybrid') {
      adaptationApplied = await this.applyStrategyAdaptation(
        recommendedStrategies,
        confidenceScores,
        config.adaptation_rate
      );
    }
    
    // 8. 记录学习结果
    this.recordLearningResult(taskId.toString(), {
      failure_features: failureFeatures,
      similar_failures: similarFailures.length,
      recommended_strategies: recommendedStrategies,
      confidence_scores: confidenceScores,
      adaptation_applied: adaptationApplied
    });
    
    logger.info('自学习恢复分析完成', {
      task_id: taskId,
      recommended_strategies: recommendedStrategies,
      top_confidence: recommendedStrategies.length > 0 ? 
        confidenceScores[recommendedStrategies[0]] : 0,
      adaptation_applied: adaptationApplied
    });
    
    return {
      recommended_strategies: recommendedStrategies,
      confidence_scores: confidenceScores,
      adaptation_applied: adaptationApplied,
      execution_time_ms: performance.now() - startTime
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('自学习恢复分析失败', {
      task_id: taskId,
      error: errorMessage
    });
    
    return {
      recommended_strategies: this.getDefaultRecoveryStrategies(task),
      confidence_scores: { default: 0.5 },
      adaptation_applied: false,
      execution_time_ms: performance.now() - startTime
    };
  }
}

/**
 * 提取故障特征
 * 
 * @param task 任务对象
 * @param errorMessage 错误信息
 * @returns 故障特征
 */
private extractFailureFeatures(task: PlanTask, errorMessage: string): Record<string, unknown> {
  // 解析错误消息，提取关键信息
  const errorType = this.analyzeFailureType(errorMessage, task);
  const errorTokens = errorMessage.toLowerCase().split(/\s+/);
  const errorKeywords = errorTokens.filter(token => 
    token.length > 3 && !['error', 'exception', 'failed', 'failure'].includes(token)
  );
  
  return {
    task_type: task.type,
    error_type: errorType,
    error_keywords: errorKeywords,
    has_dependencies: task.dependencies && task.dependencies.length > 0,
    dependencies_count: task.dependencies?.length || 0,
    has_subtasks: task.sub_tasks && task.sub_tasks.length > 0,
    subtasks_count: task.sub_tasks?.length || 0,
    priority: task.priority,
    resources_required: task.resources_required?.map(r => r.resource_type) || [],
    metadata: task.metadata || {}
  };
}

/**
 * 查找类似的历史故障
 * 
 * @param failureFeatures 故障特征
 * @returns 类似故障的学习数据
 */
private findSimilarHistoricalFailures(
  failureFeatures: Record<string, unknown>
): Array<{
  strategy: RecoveryStrategy;
  success: boolean;
  execution_time_ms: number;
  context: Record<string, unknown>;
}> {
  const allLearningData: Array<{
    taskId: string;
    strategy: RecoveryStrategy;
    success: boolean;
    execution_time_ms: number;
    context: Record<string, unknown>;
    similarity: number;
  }> = [];
  
  // 遍历所有历史学习数据
  this.learningData.forEach((taskData, taskId) => {
    for (const entry of taskData) {
      // 计算特征相似度
      const similarity = this.calculateFeatureSimilarity(
        failureFeatures,
        entry.context
      );
      
      // 如果相似度高于阈值，添加到结果中
      if (similarity > 0.6) {
        allLearningData.push({
          taskId,
          ...entry,
          similarity
        });
      }
    }
  });
  
  // 按相似度排序
  return allLearningData
    .sort((a, b) => b.similarity - a.similarity)
    .map(({ taskId, similarity, ...rest }) => rest);
}

/**
 * 计算特征相似度
 * 
 * @param features1 特征1
 * @param features2 特征2
 * @returns 相似度分数 (0-1)
 */
private calculateFeatureSimilarity(
  features1: Record<string, unknown>,
  features2: Record<string, unknown>
): number {
  // 提取共同的键
  const keys1 = Object.keys(features1);
  const keys2 = Object.keys(features2);
  const commonKeys = keys1.filter(key => keys2.includes(key));
  
  if (commonKeys.length === 0) {
    return 0;
  }
  
  // 计算每个共同键的相似度
  let totalSimilarity = 0;
  let validKeyCount = 0;
  
  for (const key of commonKeys) {
    const value1 = features1[key];
    const value2 = features2[key];
    
    // 根据值类型计算相似度
    let keySimilarity = 0;
    
    if (value1 === value2) {
      // 完全相同
      keySimilarity = 1;
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      // 数组类型，计算交集比例
      const set1 = new Set(value1);
      const set2 = new Set(value2);
      const intersection = [...set1].filter(item => set2.has(item));
      const union = new Set([...set1, ...set2]);
      keySimilarity = intersection.length / union.size;
    } else if (
      typeof value1 === 'string' && 
      typeof value2 === 'string'
    ) {
      // 字符串类型，计算文本相似度
      keySimilarity = this.calculateTextSimilarity(value1, value2);
    } else if (
      typeof value1 === 'number' && 
      typeof value2 === 'number'
    ) {
      // 数值类型，计算相对差异
      const max = Math.max(Math.abs(value1), Math.abs(value2));
      if (max === 0) {
        keySimilarity = 1; // 两个都是0
      } else {
        const diff = Math.abs(value1 - value2) / max;
        keySimilarity = 1 - Math.min(diff, 1);
      }
    } else if (
      typeof value1 === 'object' && 
      value1 !== null &&
      typeof value2 === 'object' && 
      value2 !== null
    ) {
      // 对象类型，递归计算
      keySimilarity = this.calculateFeatureSimilarity(
        value1 as Record<string, unknown>,
        value2 as Record<string, unknown>
      );
    } else {
      // 不可比较的类型
      continue;
    }
    
    totalSimilarity += keySimilarity;
    validKeyCount++;
  }
  
  // 返回平均相似度
  return validKeyCount > 0 ? totalSimilarity / validKeyCount : 0;
}

/**
 * 计算文本相似度
 * 
 * @param text1 文本1
 * @param text2 文本2
 * @returns 相似度分数 (0-1)
 */
private calculateTextSimilarity(text1: string, text2: string): number {
  // 如果文本完全相同
  if (text1 === text2) {
    return 1;
  }
  
  // 转换为小写并分词
  const tokens1 = text1.toLowerCase().split(/\s+/);
  const tokens2 = text2.toLowerCase().split(/\s+/);
  
  // 计算词汇交集
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = [...set1].filter(token => set2.has(token));
  
  // 计算Jaccard相似度
  const union = new Set([...tokens1, ...tokens2]);
  return intersection.length / union.size;
}

/**
 * 分析策略有效性
 * 
 * @param similarFailures 类似故障的学习数据
 * @returns 策略有效性分析
 */
private analyzeStrategyEffectiveness(
  similarFailures: Array<{
    strategy: RecoveryStrategy;
    success: boolean;
    execution_time_ms: number;
    context: Record<string, unknown>;
  }>
): Record<string, {
  total_attempts: number;
  successful_attempts: number;
  success_rate: number;
  avg_execution_time_ms: number;
}> {
  const effectiveness: Record<string, {
    total_attempts: number;
    successful_attempts: number;
    success_rate: number;
    avg_execution_time_ms: number;
    execution_times: number[];
  }> = {};
  
  // 统计每种策略的使用情况
  for (const failure of similarFailures) {
    const strategy = failure.strategy;
    
    if (!effectiveness[strategy]) {
      effectiveness[strategy] = {
        total_attempts: 0,
        successful_attempts: 0,
        success_rate: 0,
        avg_execution_time_ms: 0,
        execution_times: []
      };
    }
    
    effectiveness[strategy].total_attempts++;
    
    if (failure.success) {
      effectiveness[strategy].successful_attempts++;
    }
    
    effectiveness[strategy].execution_times.push(failure.execution_time_ms);
  }
  
  // 计算成功率和平均执行时间
  for (const strategy in effectiveness) {
    const data = effectiveness[strategy];
    data.success_rate = data.successful_attempts / data.total_attempts;
    data.avg_execution_time_ms = data.execution_times.reduce((sum, time) => sum + time, 0) / data.execution_times.length;
  }
  
  // 移除内部使用的数组
  return Object.fromEntries(
    Object.entries(effectiveness).map(([strategy, data]) => {
      const { execution_times, ...rest } = data;
      return [strategy, rest];
    })
  );
}

/**
 * 计算策略置信度分数
 * 
 * @param strategyEffectiveness 策略有效性分析
 * @returns 策略置信度分数
 */
private calculateStrategyConfidenceScores(
  strategyEffectiveness: Record<string, {
    total_attempts: number;
    successful_attempts: number;
    success_rate: number;
    avg_execution_time_ms: number;
  }>
): Record<string, number> {
  const confidenceScores: Record<string, number> = {};
  
  // 计算每种策略的置信度分数
  for (const strategy in strategyEffectiveness) {
    const data = strategyEffectiveness[strategy];
    
    // 基于成功率计算基础置信度
    let confidence = data.success_rate;
    
    // 样本量因子：样本越多，置信度越高
    const sampleFactor = Math.min(data.total_attempts / 10, 1);
    
    // 执行时间因子：执行时间越短，置信度越高
    // 假设理想执行时间为100ms
    const timeFactor = Math.exp(-data.avg_execution_time_ms / 1000);
    
    // 综合计算最终置信度
    confidence = confidence * 0.6 + sampleFactor * 0.3 + timeFactor * 0.1;
    
    // 确保置信度在0-1范围内
    confidenceScores[strategy] = Math.max(0, Math.min(1, confidence));
  }
  
  return confidenceScores;
}

/**
 * 获取默认恢复策略
 * 
 * @param task 任务对象
 * @returns 默认恢复策略列表
 */
private getDefaultRecoveryStrategies(task: PlanTask): RecoveryStrategy[] {
  // 根据任务类型和特征返回默认策略
  if (task.type === 'milestone' || task.type === 'checkpoint') {
    // 关键任务优先使用人工干预
    return ['manual_intervention', 'retry', 'rollback'];
  } else if (task.sub_tasks && task.sub_tasks.length > 0) {
    // 复合任务优先使用回滚
    return ['rollback', 'retry', 'manual_intervention'];
  } else {
    // 普通任务优先使用重试
    return ['retry', 'skip', 'manual_intervention'];
  }
}

/**
 * 应用策略适应性调整
 * 
 * @param recommendedStrategies 推荐策略列表
 * @param confidenceScores 置信度分数
 * @param adaptationRate 适应率
 * @returns 是否应用了适应性调整
 */
private async applyStrategyAdaptation(
  recommendedStrategies: RecoveryStrategy[],
  confidenceScores: Record<string, number>,
  adaptationRate: number
): Promise<boolean> {
  // 如果没有推荐策略，无法应用适应性调整
  if (recommendedStrategies.length === 0) {
    return false;
  }
  
  try {
    // 获取当前默认策略顺序
    const currentStrategies = [...this.config.default_resolver.strategies];
    
    // 计算当前策略顺序与推荐顺序的差异
    let needsAdjustment = false;
    for (let i = 0; i < Math.min(currentStrategies.length, recommendedStrategies.length); i++) {
      if (currentStrategies[i] !== recommendedStrategies[i]) {
        needsAdjustment = true;
        break;
      }
    }
    
    // 如果需要调整，并且适应率足够高
    if (needsAdjustment && Math.random() < adaptationRate) {
      // 创建新的策略顺序，融合当前顺序和推荐顺序
      const newStrategies: RecoveryStrategy[] = [];
      
      // 添加高置信度的推荐策略
      for (const strategy of recommendedStrategies) {
        if (confidenceScores[strategy] > 0.7) {
          newStrategies.push(strategy);
        }
      }
      
      // 添加当前策略中未包含的策略
      for (const strategy of currentStrategies) {
        if (!newStrategies.includes(strategy)) {
          newStrategies.push(strategy);
        }
      }
      
      // 更新默认策略顺序
      this.config.default_resolver.strategies = newStrategies;
      
      logger.info('应用策略适应性调整', {
        previous_strategies: currentStrategies,
        new_strategies: newStrategies
      });
      
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('策略适应性调整失败', { error: errorMessage });
  }
  
  return false;
}

/**
 * 记录学习结果
 * 
 * @param taskId 任务ID
 * @param result 学习结果
 */
private recordLearningResult(
  taskId: string,
  result: {
    failure_features: Record<string, unknown>;
    similar_failures: number;
    recommended_strategies: RecoveryStrategy[];
    confidence_scores: Record<string, number>;
    adaptation_applied: boolean;
  }
): void {
  // 记录学习结果到日志
  logger.debug('记录自学习恢复结果', {
    task_id: taskId,
    similar_failures: result.similar_failures,
    top_strategy: result.recommended_strategies[0],
    top_confidence: result.confidence_scores[result.recommended_strategies[0]],
    adaptation_applied: result.adaptation_applied
  });
  
  // 在实际实现中，可以将学习结果持久化到数据库
  // 或者用于更新模型参数
}

/**
 * 更新自学习配置
 * 
 * @param config 新的自学习配置
 * @returns 是否成功更新
 */
updateSelfLearningConfig(config: Partial<SelfLearningRecovery>): boolean {
  try {
    // 更新自学习配置
    this.config.default_resolver.self_learning = {
      ...this.config.default_resolver.self_learning || {
        enabled: false,
        learning_mode: 'passive',
        min_samples_required: 10,
        adaptation_rate: 0.1,
        strategy_effectiveness_metrics: ['success_rate', 'recovery_time']
      },
      ...config
    };
    
    logger.info('自学习恢复配置已更新', {
      enabled: this.config.default_resolver.self_learning.enabled,
      learning_mode: this.config.default_resolver.self_learning.learning_mode,
      adaptation_rate: this.config.default_resolver.self_learning.adaptation_rate
    });
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('更新自学习配置失败', { error: errorMessage });
    return false;
  }
}

/**
 * 获取学习数据统计
 * 
 * @returns 学习数据统计
 */
getLearningStats(): {
  total_samples: number;
  strategy_distribution: Record<string, number>;
  success_rates: Record<string, number>;
  avg_execution_times: Record<string, number>;
} {
  const allData: Array<{
    strategy: RecoveryStrategy;
    success: boolean;
    execution_time_ms: number;
  }> = [];
  
  // 收集所有学习数据
  this.learningData.forEach(taskData => {
    allData.push(...taskData);
  });
  
  // 计算策略分布
  const strategyDistribution: Record<string, number> = {};
  const successCounts: Record<string, number> = {};
  const totalCounts: Record<string, number> = {};
  const executionTimes: Record<string, number[]> = {};
  
  for (const entry of allData) {
    const strategy = entry.strategy;
    
    // 更新策略分布
    strategyDistribution[strategy] = (strategyDistribution[strategy] || 0) + 1;
    
    // 更新成功计数
    if (entry.success) {
      successCounts[strategy] = (successCounts[strategy] || 0) + 1;
    }
    
    // 更新总计数
    totalCounts[strategy] = (totalCounts[strategy] || 0) + 1;
    
    // 更新执行时间
    if (!executionTimes[strategy]) {
      executionTimes[strategy] = [];
    }
    executionTimes[strategy].push(entry.execution_time_ms);
  }
  
  // 计算成功率
  const successRates: Record<string, number> = {};
  for (const strategy in totalCounts) {
    successRates[strategy] = (successCounts[strategy] || 0) / totalCounts[strategy];
  }
  
  // 计算平均执行时间
  const avgExecutionTimes: Record<string, number> = {};
  for (const strategy in executionTimes) {
    const times = executionTimes[strategy];
    avgExecutionTimes[strategy] = times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  return {
    total_samples: allData.length,
    strategy_distribution: strategyDistribution,
    success_rates: successRates,
    avg_execution_times: avgExecutionTimes
  };
}

  /**
   * 获取故障恢复建议 - 厂商中立实现
   * 
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  async getRecoverySuggestions(failureId: string): Promise<string[]> {
    if (!this.traceAdapter || !this.traceAdapter.getRecoverySuggestions) {
      return [];
    }
    
    try {
      // 使用增强型适配器获取恢复建议
      const suggestions = await this.traceAdapter.getRecoverySuggestions(failureId);
      
      if (suggestions && suggestions.length > 0) {
        logger.info('从追踪适配器获取恢复建议', {
          failure_id: failureId,
          suggestions_count: suggestions.length
        });
        
        return suggestions.map(s => s.suggestion);
      }
      
      return [];
    } catch (error) {
      logger.error('获取恢复建议时出错', {
        failure_id: failureId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return [];
    }
  }
  
  /**
   * 检测开发问题 - 厂商中立实现
   * 
   * @returns 开发问题列表及置信度
   */
  async detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }> {
    if (!this.traceAdapter || !this.traceAdapter.detectDevelopmentIssues) {
      return {
        issues: [],
        confidence: 0
      };
    }
    
    try {
      // 使用增强型适配器检测开发问题
      const result = await this.traceAdapter.detectDevelopmentIssues();
      
      if (result && result.issues.length > 0) {
        logger.info('检测到开发问题', {
          count: result.issues.length,
          confidence: result.confidence
        });
        
        return result;
      }
      
      return {
        issues: [],
        confidence: 0
      };
    } catch (error) {
      logger.error('检测开发问题时出错', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        issues: [],
        confidence: 0
      };
    }
  }
} // 添加缺失的类闭合花括号