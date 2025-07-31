/**
 * PlanConfiguration值对象
 * 
 * 表示计划的配置信息，包含执行设置、通知设置、优化设置等
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:35:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { ExecutionStrategy, OptimizationStrategy } from '../../../../public/shared/types/plan-types';

/**
 * 计划配置值对象
 */
export interface PlanConfiguration {
  execution_settings: {
    strategy: ExecutionStrategy;
    parallel_limit?: number;
    default_timeout_ms: number;
    retry_policy: {
      max_retries: number;
      retry_delay_ms: number;
      backoff_factor: number;
    };
  };
  notification_settings: {
    enabled: boolean;
    channels: string[];
    events: string[];
    task_completion?: boolean;
  };
  optimization_settings: {
    enabled: boolean;
    strategies: OptimizationStrategy[];
    auto_adjust: boolean;
  };
  monitoring_settings?: {
    interval_ms: number;
    metrics: string[];
    alerts_enabled: boolean;
    alert_thresholds?: Record<string, number>;
  };
}

/**
 * 创建默认计划配置
 */
export function createDefaultPlanConfiguration(): PlanConfiguration {
  return {
    execution_settings: {
      strategy: 'sequential',
      parallel_limit: 5,
      default_timeout_ms: 300000, // 5分钟
      retry_policy: {
        max_retries: 3,
        retry_delay_ms: 5000,
        backoff_factor: 1.5
      }
    },
    notification_settings: {
      enabled: true,
      channels: ['internal'],
      events: ['plan_start', 'plan_complete', 'task_failed'],
      task_completion: false
    },
    optimization_settings: {
      enabled: true,
      strategies: ['critical_path_focus', 'parallel_execution'],
      auto_adjust: true
    },
    monitoring_settings: {
      interval_ms: 60000, // 1分钟
      metrics: ['task_completion_rate', 'execution_time', 'resource_usage'],
      alerts_enabled: true,
      alert_thresholds: {
        task_failure_rate: 0.2,
        execution_delay_ms: 300000
      }
    }
  };
}

/**
 * 创建PlanConfiguration值对象
 */
export function createPlanConfiguration(params: Partial<PlanConfiguration>): PlanConfiguration {
  const defaultConfig = createDefaultPlanConfiguration();
  
  return {
    execution_settings: {
      ...defaultConfig.execution_settings,
      ...params.execution_settings
    },
    notification_settings: {
      ...defaultConfig.notification_settings,
      ...params.notification_settings
    },
    optimization_settings: {
      ...defaultConfig.optimization_settings,
      ...params.optimization_settings
    },
    monitoring_settings: params.monitoring_settings ? {
      ...defaultConfig.monitoring_settings,
      ...params.monitoring_settings
    } : defaultConfig.monitoring_settings
  };
}

/**
 * 判断计划是否启用了并行执行
 * @param config 计划配置
 * @returns 是否启用了并行执行
 */
export function isParallelExecutionEnabled(config: PlanConfiguration): boolean {
  return config.execution_settings.strategy === 'parallel';
}

/**
 * 判断计划是否启用了条件执行
 * @param config 计划配置
 * @returns 是否启用了条件执行
 */
export function isConditionalExecutionEnabled(config: PlanConfiguration): boolean {
  return config.execution_settings.strategy === 'conditional';
}

/**
 * 判断计划是否启用了优化
 * @param config 计划配置
 * @returns 是否启用了优化
 */
export function isOptimizationEnabled(config: PlanConfiguration): boolean {
  return config.optimization_settings.enabled;
}

/**
 * 判断计划是否启用了通知
 * @param config 计划配置
 * @returns 是否启用了通知
 */
export function isNotificationEnabled(config: PlanConfiguration): boolean {
  return config.notification_settings.enabled;
}

/**
 * 判断计划是否启用了监控
 * @param config 计划配置
 * @returns 是否启用了监控
 */
export function isMonitoringEnabled(config: PlanConfiguration): boolean {
  return !!config.monitoring_settings && config.monitoring_settings.alerts_enabled;
}

/**
 * 获取计划的最大并行任务数
 * @param config 计划配置
 * @returns 最大并行任务数
 */
export function getMaxParallelTasks(config: PlanConfiguration): number {
  return config.execution_settings.parallel_limit || 5;
}

/**
 * 获取计划的默认超时时间（毫秒）
 * @param config 计划配置
 * @returns 默认超时时间（毫秒）
 */
export function getDefaultTimeout(config: PlanConfiguration): number {
  return config.execution_settings.default_timeout_ms;
}

/**
 * 获取计划的最大重试次数
 * @param config 计划配置
 * @returns 最大重试次数
 */
export function getMaxRetries(config: PlanConfiguration): number {
  return config.execution_settings.retry_policy.max_retries;
} 