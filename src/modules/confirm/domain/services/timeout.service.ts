/**
 * 超时检测服务 - 确认超时管理
 * 
 * 功能：
 * - 超时检测和监控
 * - 自动超时处理
 * - 超时预警通知
 * - 超时统计分析
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { UUID, Timestamp, ConfirmStatus, ConfirmationType } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { Confirm } from '../entities/confirm.entity';

/**
 * 超时检测结果枚举
 */
export enum TimeoutCheckResult {
  NOT_EXPIRED = 'not_expired',
  WARNING = 'warning',
  EXPIRED = 'expired',
  CRITICAL = 'critical'
}

/**
 * 超时处理动作枚举
 */
export enum TimeoutAction {
  SEND_WARNING = 'send_warning',
  AUTO_APPROVE = 'auto_approve',
  AUTO_REJECT = 'auto_reject',
  ESCALATE = 'escalate',
  CANCEL = 'cancel'
}

/**
 * 超时配置接口
 */
export interface TimeoutConfig {
  // 警告时间（距离过期多少毫秒时发送警告）
  warningThresholds: number[]; // 例如：[3600000, 1800000] 表示1小时和30分钟前警告
  
  // 默认超时时间（毫秒）
  defaultTimeoutMs: number;
  
  // 超时后的默认动作
  defaultTimeoutAction: TimeoutAction;
  
  // 检测间隔（毫秒）
  checkIntervalMs: number;
  
  // 是否启用自动处理
  enableAutoProcessing: boolean;
  
  // 超时处理规则
  timeoutRules: TimeoutRule[];
}

/**
 * 超时规则接口
 */
export interface TimeoutRule {
  id: string;
  name: string;
  description: string;
  
  // 匹配条件
  conditions: {
    confirmationType?: string[];
    priority?: string[];
    contextId?: string[];
    planId?: string[];
    requesterRole?: string[];
  };
  
  // 超时时间（毫秒）
  timeoutMs: number;
  
  // 警告阈值
  warningThresholds: number[];
  
  // 超时后的动作
  timeoutAction: TimeoutAction;
  
  // 是否启用
  enabled: boolean;
  
  // 优先级（数字越大优先级越高）
  priority: number;
}

/**
 * 超时检测结果接口
 */
export interface TimeoutCheckResultData {
  confirmId: UUID;
  result: TimeoutCheckResult;
  timeRemaining: number; // 剩余时间（毫秒）
  timeElapsed: number; // 已过时间（毫秒）
  totalTimeout: number; // 总超时时间（毫秒）
  nextWarningIn?: number; // 下次警告时间（毫秒）
  recommendedAction?: TimeoutAction;
  appliedRule?: TimeoutRule;
  timestamp: Timestamp;
}

/**
 * 批量超时检测结果接口
 */
export interface BatchTimeoutCheckResult {
  totalChecked: number;
  notExpired: number;
  warnings: number;
  expired: number;
  critical: number;
  results: TimeoutCheckResultData[];
  timestamp: Timestamp;
}

/**
 * 超时统计接口
 */
export interface TimeoutStatistics {
  totalConfirms: number;
  activeConfirms: number;
  expiredConfirms: number;
  warningConfirms: number;
  averageProcessingTime: number;
  timeoutRate: number;
  mostCommonTimeoutReason: string;
  timestamp: Timestamp;
}

/**
 * 超时检测服务接口
 */
export interface ITimeoutService {
  // 配置管理
  setConfig(config: TimeoutConfig): void;
  getConfig(): TimeoutConfig;
  
  // 单个确认检测
  checkTimeout(confirm: Confirm): Promise<TimeoutCheckResultData>;
  
  // 批量检测
  checkBatchTimeouts(confirms: Confirm[]): Promise<BatchTimeoutCheckResult>;
  
  // 自动处理
  processTimeouts(confirms: Confirm[]): Promise<void>;
  
  // 规则管理
  addTimeoutRule(rule: TimeoutRule): void;
  removeTimeoutRule(ruleId: string): void;
  getApplicableRule(confirm: Confirm): TimeoutRule | null;
  
  // 统计分析
  getTimeoutStatistics(confirms: Confirm[]): Promise<TimeoutStatistics>;
  
  // 定时检测控制
  startPeriodicCheck(getConfirms: () => Promise<Confirm[]>): void;
  stopPeriodicCheck(): void;
}

/**
 * 超时检测服务实现
 */
export class TimeoutService implements ITimeoutService {
  private logger: Logger;
  private config: TimeoutConfig;
  private periodicTimer: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(config?: Partial<TimeoutConfig>) {
    this.logger = new Logger('TimeoutService');
    this.config = this.createDefaultConfig();
    
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: TimeoutConfig): void {
    this.config = config;
    this.logger.info('Timeout configuration updated', {
      checkIntervalMs: config.checkIntervalMs,
      defaultTimeoutMs: config.defaultTimeoutMs,
      enableAutoProcessing: config.enableAutoProcessing,
      rulesCount: config.timeoutRules.length
    });
  }

  /**
   * 获取配置
   */
  getConfig(): TimeoutConfig {
    return { ...this.config };
  }

  /**
   * 检查单个确认的超时状态
   */
  async checkTimeout(confirm: Confirm): Promise<TimeoutCheckResultData> {
    const now = Date.now();
    const createdAt = new Date(confirm.createdAt).getTime();
    const expiresAt = confirm.expires_at ? new Date(confirm.expires_at).getTime() : null;
    
    // 获取适用的规则
    const rule = this.getApplicableRule(confirm);
    const timeoutMs = rule?.timeoutMs || this.config.defaultTimeoutMs;
    const warningThresholds = rule?.warningThresholds || this.config.warningThresholds;
    
    // 计算超时时间点
    const timeoutPoint = expiresAt || (createdAt + timeoutMs);
    const timeRemaining = timeoutPoint - now;
    const timeElapsed = now - createdAt;
    
    // 确定检测结果
    let result: TimeoutCheckResult;
    let recommendedAction: TimeoutAction | undefined;
    let nextWarningIn: number | undefined;
    
    if (timeRemaining <= 0) {
      // 已过期
      if (timeElapsed > timeoutMs * 2) {
        result = TimeoutCheckResult.CRITICAL;
      } else {
        result = TimeoutCheckResult.EXPIRED;
      }
      recommendedAction = rule?.timeoutAction || this.config.defaultTimeoutAction;
    } else {
      // 检查是否需要警告
      const shouldWarn = warningThresholds.some(threshold => timeRemaining <= threshold);
      
      if (shouldWarn) {
        result = TimeoutCheckResult.WARNING;
        recommendedAction = TimeoutAction.SEND_WARNING;
        
        // 计算下次警告时间
        const nextThreshold = warningThresholds
          .filter(threshold => timeRemaining > threshold)
          .sort((a, b) => b - a)[0];
        
        if (nextThreshold) {
          nextWarningIn = timeRemaining - nextThreshold;
        }
      } else {
        result = TimeoutCheckResult.NOT_EXPIRED;
      }
    }

    const resultData: TimeoutCheckResultData = {
      confirmId: confirm.confirmId,
      result,
      timeRemaining,
      timeElapsed,
      totalTimeout: timeoutMs,
      nextWarningIn,
      recommendedAction,
      appliedRule: rule || undefined,
      timestamp: new Date().toISOString()
    };

    this.logger.debug('Timeout check completed', {
      confirmId: confirm.confirmId,
      result,
      timeRemaining,
      timeElapsed,
      recommendedAction
    });

    return resultData;
  }

  /**
   * 批量检查超时状态
   */
  async checkBatchTimeouts(confirms: Confirm[]): Promise<BatchTimeoutCheckResult> {
    const results: TimeoutCheckResultData[] = [];
    let notExpired = 0;
    let warnings = 0;
    let expired = 0;
    let critical = 0;

    for (const confirm of confirms) {
      try {
        const result = await this.checkTimeout(confirm);
        results.push(result);

        switch (result.result) {
          case TimeoutCheckResult.NOT_EXPIRED:
            notExpired++;
            break;
          case TimeoutCheckResult.WARNING:
            warnings++;
            break;
          case TimeoutCheckResult.EXPIRED:
            expired++;
            break;
          case TimeoutCheckResult.CRITICAL:
            critical++;
            break;
        }
      } catch (error) {
        this.logger.error('Failed to check timeout for confirm', {
          confirmId: confirm.confirmId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const batchResult: BatchTimeoutCheckResult = {
      totalChecked: confirms.length,
      notExpired,
      warnings,
      expired,
      critical,
      results,
      timestamp: new Date().toISOString()
    };

    this.logger.info('Batch timeout check completed', {
      totalChecked: batchResult.totalChecked,
      notExpired: batchResult.notExpired,
      warnings: batchResult.warnings,
      expired: batchResult.expired,
      critical: batchResult.critical
    });

    return batchResult;
  }

  /**
   * 处理超时确认
   */
  async processTimeouts(confirms: Confirm[]): Promise<void> {
    if (!this.config.enableAutoProcessing) {
      this.logger.debug('Auto processing is disabled, skipping timeout processing');
      return;
    }

    if (this.isProcessing) {
      this.logger.warn('Timeout processing already in progress, skipping');
      return;
    }

    this.isProcessing = true;

    try {
      const batchResult = await this.checkBatchTimeouts(confirms);
      const toProcess = batchResult.results.filter(
        result => result.recommendedAction && 
        [TimeoutCheckResult.WARNING, TimeoutCheckResult.EXPIRED, TimeoutCheckResult.CRITICAL].includes(result.result)
      );

      this.logger.info('Processing timeouts', {
        totalToProcess: toProcess.length,
        warnings: toProcess.filter(r => r.result === TimeoutCheckResult.WARNING).length,
        expired: toProcess.filter(r => r.result === TimeoutCheckResult.EXPIRED).length,
        critical: toProcess.filter(r => r.result === TimeoutCheckResult.CRITICAL).length
      });

      for (const result of toProcess) {
        try {
          await this.executeTimeoutAction(result);
        } catch (error) {
          this.logger.error('Failed to execute timeout action', {
            confirmId: result.confirmId,
            action: result.recommendedAction,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 添加超时规则
   */
  addTimeoutRule(rule: TimeoutRule): void {
    // 移除同ID的规则
    this.config.timeoutRules = this.config.timeoutRules.filter(r => r.id !== rule.id);
    
    // 添加新规则并按优先级排序
    this.config.timeoutRules.push(rule);
    this.config.timeoutRules.sort((a, b) => b.priority - a.priority);

    this.logger.info('Timeout rule added', {
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      totalRules: this.config.timeoutRules.length
    });
  }

  /**
   * 移除超时规则
   */
  removeTimeoutRule(ruleId: string): void {
    const initialCount = this.config.timeoutRules.length;
    this.config.timeoutRules = this.config.timeoutRules.filter(r => r.id !== ruleId);
    
    if (this.config.timeoutRules.length < initialCount) {
      this.logger.info('Timeout rule removed', {
        ruleId,
        remainingRules: this.config.timeoutRules.length
      });
    } else {
      this.logger.warn('Timeout rule not found for removal', { ruleId });
    }
  }

  /**
   * 获取适用的超时规则
   */
  getApplicableRule(confirm: Confirm): TimeoutRule | null {
    for (const rule of this.config.timeoutRules) {
      if (!rule.enabled) {
        continue;
      }

      // 检查确认类型
      if (rule.conditions.confirmationType && 
          !rule.conditions.confirmationType.includes(confirm.confirmationType)) {
        continue;
      }

      // 检查优先级
      if (rule.conditions.priority && 
          !rule.conditions.priority.includes(confirm.priority)) {
        continue;
      }

      // 检查上下文ID
      if (rule.conditions.contextId && 
          !rule.conditions.contextId.includes(confirm.contextId)) {
        continue;
      }

      // 检查计划ID
      if (rule.conditions.planId && confirm.planId &&
          !rule.conditions.planId.includes(confirm.planId)) {
        continue;
      }

      // 检查请求者角色
      if (rule.conditions.requesterRole && 
          !rule.conditions.requesterRole.includes(confirm.requester.role)) {
        continue;
      }

      // 所有条件都匹配
      return rule;
    }

    return null;
  }

  /**
   * 获取超时统计
   */
  async getTimeoutStatistics(confirms: Confirm[]): Promise<TimeoutStatistics> {
    const batchResult = await this.checkBatchTimeouts(confirms);
    
    const activeConfirms = confirms.filter(c => 
      [ConfirmStatus.PENDING, ConfirmStatus.IN_REVIEW].includes(c.status as ConfirmStatus)
    ).length;

    const expiredConfirms = batchResult.expired + batchResult.critical;
    const warningConfirms = batchResult.warnings;

    // 计算平均处理时间
    const completedConfirms = confirms.filter(c => 
      [ConfirmStatus.APPROVED, ConfirmStatus.REJECTED].includes(c.status as ConfirmStatus)
    );

    let averageProcessingTime = 0;
    if (completedConfirms.length > 0) {
      const totalProcessingTime = completedConfirms.reduce((sum, confirm) => {
        const created = new Date(confirm.createdAt).getTime();
        const updated = new Date(confirm.updatedAt).getTime();
        return sum + (updated - created);
      }, 0);
      averageProcessingTime = totalProcessingTime / completedConfirms.length;
    }

    const timeoutRate = confirms.length > 0 ? expiredConfirms / confirms.length : 0;

    // 分析最常见的超时原因
    const timeoutReasons = this.analyzeTimeoutReasons(confirms);
    const mostCommonTimeoutReason = timeoutReasons.length > 0 ? timeoutReasons[0].reason : 'Unknown';

    return {
      totalConfirms: confirms.length,
      activeConfirms,
      expiredConfirms,
      warningConfirms,
      averageProcessingTime,
      timeoutRate,
      mostCommonTimeoutReason,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 开始定期检测
   */
  startPeriodicCheck(getConfirms: () => Promise<Confirm[]>): void {
    if (this.periodicTimer) {
      this.stopPeriodicCheck();
    }

    this.periodicTimer = setInterval(async () => {
      try {
        const confirms = await getConfirms();
        await this.processTimeouts(confirms);
      } catch (error) {
        this.logger.error('Periodic timeout check failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, this.config.checkIntervalMs);

    this.logger.info('Periodic timeout check started', {
      intervalMs: this.config.checkIntervalMs
    });
  }

  /**
   * 停止定期检测
   */
  stopPeriodicCheck(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
      this.logger.info('Periodic timeout check stopped');
    }
  }

  /**
   * 执行超时动作
   */
  private async executeTimeoutAction(result: TimeoutCheckResultData): Promise<void> {
    if (!result.recommendedAction) {
      return;
    }

    this.logger.info('Executing timeout action', {
      confirmId: result.confirmId,
      action: result.recommendedAction,
      result: result.result
    });

    try {
      switch (result.recommendedAction) {
        case TimeoutAction.SEND_WARNING:
          await this.sendWarningNotification(result);
          break;
        case TimeoutAction.AUTO_APPROVE:
          await this.executeAutoApprove(result);
          break;
        case TimeoutAction.AUTO_REJECT:
          await this.executeAutoReject(result);
          break;
        case TimeoutAction.ESCALATE:
          await this.executeEscalation(result);
          break;
        case TimeoutAction.CANCEL:
          await this.executeCancel(result);
          break;
        default:
          this.logger.warn('Unknown timeout action', { action: result.recommendedAction });
      }
    } catch (error) {
      this.logger.error('Failed to execute timeout action', {
        confirmId: result.confirmId,
        action: result.recommendedAction,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 发送警告通知
   */
  private async sendWarningNotification(result: TimeoutCheckResultData): Promise<void> {
    this.logger.info('Sending warning notification', {
      confirmId: result.confirmId,
      timeRemaining: result.timeRemaining
    });

    // 这里应该集成通知服务
    // 可以通过事件系统发送警告通知
    // 暂时记录日志作为实现
  }

  /**
   * 执行自动批准
   */
  private async executeAutoApprove(result: TimeoutCheckResultData): Promise<void> {
    this.logger.info('Executing auto-approve', {
      confirmId: result.confirmId
    });

    // 这里应该调用确认管理服务的自动批准方法
    // 暂时记录日志作为实现
  }

  /**
   * 执行自动拒绝
   */
  private async executeAutoReject(result: TimeoutCheckResultData): Promise<void> {
    this.logger.info('Executing auto-reject', {
      confirmId: result.confirmId
    });

    // 这里应该调用确认管理服务的自动拒绝方法
    // 暂时记录日志作为实现
  }

  /**
   * 执行升级处理
   */
  private async executeEscalation(result: TimeoutCheckResultData): Promise<void> {
    this.logger.info('Executing escalation', {
      confirmId: result.confirmId
    });

    // 这里应该调用升级处理逻辑
    // 暂时记录日志作为实现
  }

  /**
   * 执行取消操作
   */
  private async executeCancel(result: TimeoutCheckResultData): Promise<void> {
    this.logger.info('Executing cancel', {
      confirmId: result.confirmId
    });

    // 这里应该调用确认管理服务的取消方法
    // 暂时记录日志作为实现
  }

  /**
   * 分析超时原因
   */
  private analyzeTimeoutReasons(confirms: Confirm[]): { reason: string; count: number }[] {
    const reasonCounts = new Map<string, number>();

    confirms.forEach(confirm => {
      let reason = 'Unknown';

      // 根据确认状态和类型分析超时原因
      if (confirm.status === 'pending') {
        reason = 'Pending approval';
      } else if (confirm.status === 'in_review') {
        reason = 'Under review';
      } else if (confirm.confirmationType === ConfirmationType.PLAN_APPROVAL || confirm.confirmationType === ConfirmationType.TASK_APPROVAL) {
        reason = 'Manual processing delay';
      } else if (confirm.confirmationType === ConfirmationType.MILESTONE_CONFIRMATION) {
        reason = 'System processing delay';
      } else if (confirm.priority === 'low') {
        reason = 'Low priority processing';
      } else {
        reason = 'Complex approval workflow';
      }

      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });

    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(): TimeoutConfig {
    return {
      warningThresholds: [3600000, 1800000, 300000], // 1小时、30分钟、5分钟
      defaultTimeoutMs: 24 * 60 * 60 * 1000, // 24小时
      defaultTimeoutAction: TimeoutAction.ESCALATE,
      checkIntervalMs: 5 * 60 * 1000, // 5分钟
      enableAutoProcessing: true,
      timeoutRules: []
    };
  }
}
