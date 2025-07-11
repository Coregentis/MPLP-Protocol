/**
 * MPLP Plan模块故障解决器
 * 
 * 负责处理任务执行失败的自动恢复、重试、回滚和人工干预
 * 完全符合Schema规范中的FailureResolver定义
 * 
 * @version v1.0.1
 * @created 2025-07-11T23:59:23Z
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 * @architecture Schema-driven development with complete type safety
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
import {
  FailureResolver,
  RecoveryStrategy,
  RetryConfig,
  RollbackConfig,
  ManualInterventionConfig,
  NotificationChannel,
  PerformanceThresholds,
  PlanTask,
  TaskStatus,
  PlanOperationResult,
  TaskOperationResult,
  PlanErrorCode,
  UUID,
  Timestamp
} from './types';

// 创建logger和performance实例
const logger = new Logger('FailureResolver');
const performance = new Performance();

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
}

/**
 * 故障解决器类
 * 
 * 负责处理任务执行失败的恢复策略
 * 支持自动重试、回滚、跳过和人工干预
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
  
  constructor(config: FailureResolverConfig) {
    super();
    this.config = config;
    logger.info('FailureResolverManager initialized', { 
      enabled: config.default_resolver.enabled,
      strategies: config.default_resolver.strategies 
    });
  }
  
  /**
   * 处理任务失败
   * 
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param task 任务对象
   * @param errorMessage 错误信息
   * @param customResolver 自定义解决器配置（覆盖默认配置）
   * @returns 恢复结果
   */
  async handleTaskFailure(
    planId: UUID,
    taskId: UUID,
    task: PlanTask,
    errorMessage: string,
    customResolver?: Partial<FailureResolver>
  ): Promise<FailureRecoveryResult> {
    const startTime = performance.now();
    
    // 合并解决器配置
    const resolver = this.mergeResolvers(this.config.default_resolver, customResolver);
    
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
          resolver
        );
        
        // 如果策略成功或需要人工干预，返回结果
        if (result.success || result.intervention_required) {
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
    return {
      success: false,
      strategy_used: 'manual_intervention',
      task_id: taskId,
      plan_id: planId,
      new_status: 'failed',
      execution_time_ms: performance.now() - startTime,
      error_message: 'All recovery strategies failed',
      intervention_required: true
    };
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
    resolver: FailureResolver
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
      } : defaultResolver.performance_thresholds
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
} 