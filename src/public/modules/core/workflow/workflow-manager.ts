/**
 * 工作流管理器
 * 
 * 管理MPLP协议的标准工作流程
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Logger } from '../../../utils/logger';
import {
  WorkflowStage,
  WorkflowConfiguration,
  ExecutionContext,
  WorkflowExecutionResult,
  RetryPolicy,
  ErrorHandlingPolicy
} from '../types/core.types';

/**
 * 预定义工作流模板
 */
export class WorkflowTemplates {
  /**
   * 标准MPLP工作流
   * Context -> Plan -> Confirm -> Trace
   */
  static readonly STANDARD_MPLP: WorkflowConfiguration = {
    stages: ['context', 'plan', 'confirm', 'trace'],
    parallel_execution: false,
    timeout_ms: 300000, // 5分钟
    retry_policy: {
      max_attempts: 3,
      delay_ms: 1000,
      backoff_multiplier: 2,
      max_delay_ms: 10000
    },
    error_handling: {
      continue_on_error: false,
      rollback_on_failure: true,
      notification_enabled: true
    }
  };

  /**
   * 快速执行工作流
   * Context -> Plan -> Trace (跳过确认)
   */
  static readonly FAST_EXECUTION: WorkflowConfiguration = {
    stages: ['context', 'plan', 'trace'],
    parallel_execution: false,
    timeout_ms: 60000, // 1分钟
    retry_policy: {
      max_attempts: 2,
      delay_ms: 500,
      backoff_multiplier: 1.5,
      max_delay_ms: 5000
    },
    error_handling: {
      continue_on_error: true,
      rollback_on_failure: false,
      notification_enabled: false
    }
  };

  /**
   * 并行执行工作流
   * Context -> (Plan + Trace) 并行执行
   */
  static readonly PARALLEL_EXECUTION: WorkflowConfiguration = {
    stages: ['context', 'plan', 'trace'],
    parallel_execution: true,
    timeout_ms: 120000, // 2分钟
    retry_policy: {
      max_attempts: 2,
      delay_ms: 1000,
      backoff_multiplier: 2,
      max_delay_ms: 8000
    },
    error_handling: {
      continue_on_error: true,
      rollback_on_failure: false,
      notification_enabled: true
    }
  };

  /**
   * 监控专用工作流
   * Context -> Trace (仅监控)
   */
  static readonly MONITORING_ONLY: WorkflowConfiguration = {
    stages: ['context', 'trace'],
    parallel_execution: false,
    timeout_ms: 30000, // 30秒
    retry_policy: {
      max_attempts: 1,
      delay_ms: 0
    },
    error_handling: {
      continue_on_error: true,
      rollback_on_failure: false,
      notification_enabled: false
    }
  };

  /**
   * 审批专用工作流
   * Context -> Plan -> Confirm
   */
  static readonly APPROVAL_ONLY: WorkflowConfiguration = {
    stages: ['context', 'plan', 'confirm'],
    parallel_execution: false,
    timeout_ms: 600000, // 10分钟
    retry_policy: {
      max_attempts: 1,
      delay_ms: 0
    },
    error_handling: {
      continue_on_error: false,
      rollback_on_failure: true,
      notification_enabled: true
    }
  };
}

/**
 * 工作流管理器
 */
export class WorkflowManager {
  private readonly logger: Logger;
  private readonly workflowTemplates: Map<string, WorkflowConfiguration> = new Map();

  constructor() {
    this.logger = new Logger('WorkflowManager');
    this.initializeTemplates();
  }

  /**
   * 初始化工作流模板
   */
  private initializeTemplates(): void {
    this.workflowTemplates.set('standard', WorkflowTemplates.STANDARD_MPLP);
    this.workflowTemplates.set('fast', WorkflowTemplates.FAST_EXECUTION);
    this.workflowTemplates.set('parallel', WorkflowTemplates.PARALLEL_EXECUTION);
    this.workflowTemplates.set('monitoring', WorkflowTemplates.MONITORING_ONLY);
    this.workflowTemplates.set('approval', WorkflowTemplates.APPROVAL_ONLY);
    
    this.logger.info('Workflow templates initialized');
  }

  /**
   * 获取工作流模板
   */
  getTemplate(templateName: string): WorkflowConfiguration | undefined {
    return this.workflowTemplates.get(templateName);
  }

  /**
   * 注册自定义工作流模板
   */
  registerTemplate(name: string, config: WorkflowConfiguration): void {
    this.workflowTemplates.set(name, config);
    this.logger.info(`Custom workflow template registered: ${name}`);
  }

  /**
   * 创建自定义工作流配置
   */
  createCustomWorkflow(
    stages: WorkflowStage[],
    options: {
      parallel?: boolean;
      timeout_ms?: number;
      retry_policy?: Partial<RetryPolicy>;
      error_handling?: Partial<ErrorHandlingPolicy>;
    } = {}
  ): WorkflowConfiguration {
    return {
      stages,
      parallel_execution: options.parallel || false,
      timeout_ms: options.timeout_ms || 300000,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_multiplier: 2,
        max_delay_ms: 10000,
        ...options.retry_policy
      },
      error_handling: {
        continue_on_error: false,
        rollback_on_failure: true,
        notification_enabled: true,
        ...options.error_handling
      }
    };
  }

  /**
   * 验证工作流配置
   */
  validateWorkflowConfiguration(config: WorkflowConfiguration): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证阶段
    if (!config.stages || config.stages.length === 0) {
      errors.push('工作流必须包含至少一个阶段');
    }

    // 验证阶段顺序
    const validStages: WorkflowStage[] = ['context', 'plan', 'confirm', 'trace'];
    for (const stage of config.stages) {
      if (!validStages.includes(stage)) {
        errors.push(`无效的工作流阶段: ${stage}`);
      }
    }

    // 验证超时时间
    if (config.timeout_ms && config.timeout_ms <= 0) {
      errors.push('超时时间必须大于0');
    }

    // 验证重试策略
    if (config.retry_policy) {
      if (config.retry_policy.max_attempts < 0) {
        errors.push('最大重试次数不能为负数');
      }
      if (config.retry_policy.delay_ms < 0) {
        errors.push('重试延迟不能为负数');
      }
    }

    // 警告检查
    if (config.parallel_execution && config.stages.includes('confirm')) {
      warnings.push('并行执行模式下包含确认阶段可能导致不一致的结果');
    }

    if (config.timeout_ms && config.timeout_ms > 600000) {
      warnings.push('工作流超时时间超过10分钟，可能影响用户体验');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 优化工作流配置
   */
  optimizeWorkflowConfiguration(
    config: WorkflowConfiguration,
    context: {
      expected_load?: 'low' | 'medium' | 'high';
      priority?: 'low' | 'medium' | 'high';
      user_interactive?: boolean;
    }
  ): WorkflowConfiguration {
    const optimized = { ...config };

    // 根据负载调整超时时间
    if (context.expected_load === 'high') {
      optimized.timeout_ms = (optimized.timeout_ms || 300000) * 1.5;
    } else if (context.expected_load === 'low') {
      optimized.timeout_ms = (optimized.timeout_ms || 300000) * 0.7;
    }

    // 根据优先级调整重试策略
    if (context.priority === 'high') {
      if (optimized.retry_policy) {
        optimized.retry_policy.max_attempts = Math.max(optimized.retry_policy.max_attempts, 3);
        optimized.retry_policy.delay_ms = Math.min(optimized.retry_policy.delay_ms, 500);
      }
    } else if (context.priority === 'low') {
      if (optimized.retry_policy) {
        optimized.retry_policy.max_attempts = Math.min(optimized.retry_policy.max_attempts, 2);
      }
    }

    // 用户交互场景优化
    if (context.user_interactive) {
      optimized.timeout_ms = Math.min(optimized.timeout_ms || 300000, 60000); // 最多1分钟
      if (optimized.error_handling) {
        optimized.error_handling.notification_enabled = true;
      }
    }

    return optimized;
  }

  /**
   * 获取所有可用的工作流模板
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.workflowTemplates.keys());
  }

  /**
   * 分析工作流执行结果
   */
  analyzeWorkflowResult(result: WorkflowExecutionResult): {
    performance_score: number;
    bottlenecks: string[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const bottlenecks: string[] = [];
    
    // 计算性能分数 (0-100)
    let performanceScore = 100;
    
    // 分析执行时间
    const avgStageTime = result.total_duration_ms / result.stages.length;
    result.stages.forEach(stage => {
      if (stage.duration_ms > avgStageTime * 2) {
        bottlenecks.push(`${stage.stage}阶段执行时间过长 (${stage.duration_ms}ms)`);
        performanceScore -= 10;
      }
    });

    // 分析失败率
    const failedStages = result.stages.filter(stage => stage.status === 'failed');
    if (failedStages.length > 0) {
      performanceScore -= failedStages.length * 20;
      recommendations.push('考虑优化失败阶段的错误处理机制');
    }

    // 分析总执行时间
    if (result.total_duration_ms > 300000) { // 5分钟
      performanceScore -= 15;
      recommendations.push('考虑启用并行执行或优化阶段性能');
    }

    // 生成优化建议
    if (bottlenecks.length > 0) {
      recommendations.push('识别并优化性能瓶颈阶段');
    }

    if (result.stages.length > 3) {
      recommendations.push('考虑使用并行执行模式提高效率');
    }

    return {
      performance_score: Math.max(0, performanceScore),
      bottlenecks,
      recommendations
    };
  }
}
