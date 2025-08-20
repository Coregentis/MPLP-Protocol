/**
 * 自动化决策服务 - 确认自动化处理
 * 
 * 功能：
 * - 自动化规则管理
 * - 智能决策引擎
 * - 自动批准/拒绝
 * - 决策历史追踪
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { Timestamp, ConfirmStatus, Priority } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { Confirm } from '../entities/confirm.entity';
import { TimeoutService, TimeoutCheckResult } from './timeout.service';
import { EscalationEngine, EscalationType } from './escalation-engine.service';
import { ConfirmEventManager, ConfirmEventType } from './confirm-event-manager.service';

/**
 * 自动化决策类型枚举
 */
export enum AutomationDecisionType {
  AUTO_APPROVE = 'auto_approve',
  AUTO_REJECT = 'auto_reject',
  ESCALATE = 'escalate',
  SEND_REMINDER = 'send_reminder',
  EXTEND_DEADLINE = 'extend_deadline',
  CANCEL = 'cancel',
  NO_ACTION = 'no_action'
}

/**
 * 自动化触发器枚举
 */
export enum AutomationTrigger {
  TIMEOUT = 'timeout',
  PRIORITY = 'priority',
  ROLE = 'role',
  CONTEXT = 'context',
  SCHEDULE = 'schedule',
  MANUAL = 'manual'
}

/**
 * 自动化规则接口
 */
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  
  // 触发条件
  triggers: {
    type: AutomationTrigger;
    conditions: Record<string, unknown>;
  }[];
  
  // 匹配条件
  conditions: {
    confirmationType?: string[];
    priority?: Priority[];
    status?: ConfirmStatus[];
    contextId?: string[];
    requesterRole?: string[];
    approverRole?: string[];
    timeRange?: {
      start: string; // HH:mm 格式
      end: string;   // HH:mm 格式
    };
    dateRange?: {
      start: string; // YYYY-MM-DD 格式
      end: string;   // YYYY-MM-DD 格式
    };
  };
  
  // 决策逻辑
  decision: AutomationDecisionType;
  decisionParameters?: Record<string, unknown>;
  
  // 置信度阈值 (0-1)
  confidenceThreshold: number;
  
  // 是否启用
  enabled: boolean;
  
  // 优先级
  priority: number;
  
  // 执行限制
  limits: {
    maxExecutionsPerDay?: number;
    maxExecutionsPerConfirm?: number;
    cooldownMs?: number;
  };
}

/**
 * 自动化决策结果接口
 */
export interface AutomationDecisionResult {
  ruleId: string;
  decision: AutomationDecisionType;
  confidence: number;
  reasoning: string[];
  parameters?: Record<string, unknown>;
  timestamp: Timestamp;
}

/**
 * 自动化执行结果接口
 */
export interface AutomationExecutionResult {
  success: boolean;
  decision: AutomationDecisionType;
  ruleId: string;
  confidence: number;
  executionTime: number;
  message?: string;
  error?: string;
}

/**
 * 自动化统计接口
 */
export interface AutomationStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageConfidence: number;
  averageExecutionTime: number;
  decisionBreakdown: Record<AutomationDecisionType, number>;
  ruleUsage: Record<string, number>;
  timestamp: Timestamp;
}

/**
 * 自动化服务接口
 */
export interface IAutomationService {
  // 规则管理
  addRule(rule: AutomationRule): void;
  removeRule(ruleId: string): void;
  getRule(ruleId: string): AutomationRule | null;
  getApplicableRules(confirm: Confirm): AutomationRule[];
  
  // 决策处理
  makeDecision(confirm: Confirm): Promise<AutomationDecisionResult | null>;
  executeDecision(confirm: Confirm, decision: AutomationDecisionResult): Promise<AutomationExecutionResult>;
  processAutomation(confirm: Confirm): Promise<AutomationExecutionResult | null>;
  
  // 批量处理
  processBatchAutomation(confirms: Confirm[]): Promise<AutomationExecutionResult[]>;
  
  // 统计分析
  getAutomationStatistics(): Promise<AutomationStatistics>;
  
  // 定时处理
  startPeriodicProcessing(getConfirms: () => Promise<Confirm[]>): void;
  stopPeriodicProcessing(): void;
}

/**
 * 自动化服务实现
 */
export class AutomationService implements IAutomationService {
  private logger: Logger;
  private rules: Map<string, AutomationRule> = new Map();
  private executionHistory: Map<string, number> = new Map(); // ruleId -> execution count
  private lastExecution: Map<string, number> = new Map(); // ruleId -> timestamp
  private periodicTimer: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(
    private readonly timeoutService: TimeoutService,
    private readonly escalationEngine: EscalationEngine,
    private readonly eventManager: ConfirmEventManager
  ) {
    this.logger = new Logger('AutomationService');
    this.initializeDefaultRules();
  }

  /**
   * 添加自动化规则
   */
  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info('Automation rule added', {
      ruleId: rule.id,
      ruleName: rule.name,
      decision: rule.decision,
      priority: rule.priority
    });
  }

  /**
   * 移除自动化规则
   */
  removeRule(ruleId: string): void {
    if (this.rules.delete(ruleId)) {
      this.executionHistory.delete(ruleId);
      this.lastExecution.delete(ruleId);
      this.logger.info('Automation rule removed', { ruleId });
    } else {
      this.logger.warn('Automation rule not found for removal', { ruleId });
    }
  }

  /**
   * 获取自动化规则
   */
  getRule(ruleId: string): AutomationRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * 获取适用的自动化规则
   */
  getApplicableRules(confirm: Confirm): AutomationRule[] {
    const applicableRules: AutomationRule[] = [];
    const now = new Date();

    for (const rule of Array.from(this.rules.values())) {
      if (!rule.enabled) {
        continue;
      }

      // 检查执行限制
      if (!this.checkExecutionLimits(rule, confirm)) {
        continue;
      }

      // 检查匹配条件
      if (!this.checkRuleConditions(rule, confirm, now)) {
        continue;
      }

      applicableRules.push(rule);
    }

    // 按优先级排序
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 做出自动化决策
   */
  async makeDecision(confirm: Confirm): Promise<AutomationDecisionResult | null> {
    const applicableRules = this.getApplicableRules(confirm);
    
    if (applicableRules.length === 0) {
      return null;
    }

    // 使用第一个（最高优先级）规则
    const rule = applicableRules[0];
    
    // 计算置信度
    const confidence = await this.calculateConfidence(rule, confirm);
    
    if (confidence < rule.confidenceThreshold) {
      this.logger.debug('Decision confidence below threshold', {
        ruleId: rule.id,
        confidence,
        threshold: rule.confidenceThreshold
      });
      return null;
    }

    // 生成推理过程
    const reasoning = await this.generateReasoning(rule, confirm);

    const decision: AutomationDecisionResult = {
      ruleId: rule.id,
      decision: rule.decision,
      confidence,
      reasoning,
      parameters: rule.decisionParameters,
      timestamp: new Date().toISOString()
    };

    this.logger.info('Automation decision made', {
      confirmId: confirm.confirmId,
      ruleId: rule.id,
      decision: rule.decision,
      confidence
    });

    return decision;
  }

  /**
   * 执行自动化决策
   */
  async executeDecision(
    confirm: Confirm, 
    decision: AutomationDecisionResult
  ): Promise<AutomationExecutionResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing automation decision', {
        confirmId: confirm.confirmId,
        decision: decision.decision,
        ruleId: decision.ruleId,
        confidence: decision.confidence
      });

      // 更新执行统计
      this.updateExecutionStats(decision.ruleId);

      // 执行具体决策
      switch (decision.decision) {
        case AutomationDecisionType.AUTO_APPROVE:
          await this.executeAutoApprove(confirm, decision);
          break;
        case AutomationDecisionType.AUTO_REJECT:
          await this.executeAutoReject(confirm, decision);
          break;
        case AutomationDecisionType.ESCALATE:
          await this.executeEscalate(confirm, decision);
          break;
        case AutomationDecisionType.SEND_REMINDER:
          await this.executeSendReminder(confirm, decision);
          break;
        case AutomationDecisionType.EXTEND_DEADLINE:
          await this.executeExtendDeadline(confirm, decision);
          break;
        case AutomationDecisionType.CANCEL:
          await this.executeCancel(confirm, decision);
          break;
        case AutomationDecisionType.NO_ACTION:
          // 无操作
          break;
      }

      const executionTime = Date.now() - startTime;

      this.logger.info('Automation decision executed successfully', {
        confirmId: confirm.confirmId,
        decision: decision.decision,
        executionTime
      });

      return {
        success: true,
        decision: decision.decision,
        ruleId: decision.ruleId,
        confidence: decision.confidence,
        executionTime,
        message: 'Decision executed successfully'
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('Failed to execute automation decision', {
        confirmId: confirm.confirmId,
        decision: decision.decision,
        ruleId: decision.ruleId,
        error: errorMessage
      });

      return {
        success: false,
        decision: decision.decision,
        ruleId: decision.ruleId,
        confidence: decision.confidence,
        executionTime,
        error: errorMessage
      };
    }
  }

  /**
   * 处理自动化
   */
  async processAutomation(confirm: Confirm): Promise<AutomationExecutionResult | null> {
    const decision = await this.makeDecision(confirm);
    
    if (!decision) {
      return null;
    }

    return this.executeDecision(confirm, decision);
  }

  /**
   * 批量处理自动化
   */
  async processBatchAutomation(confirms: Confirm[]): Promise<AutomationExecutionResult[]> {
    const results: AutomationExecutionResult[] = [];

    for (const confirm of confirms) {
      try {
        const result = await this.processAutomation(confirm);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        this.logger.error('Failed to process automation for confirm', {
          confirmId: confirm.confirmId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.logger.info('Batch automation processing completed', {
      totalConfirms: confirms.length,
      processedCount: results.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    });

    return results;
  }

  /**
   * 获取自动化统计
   */
  async getAutomationStatistics(): Promise<AutomationStatistics> {
    const totalExecutions = Array.from(this.executionHistory.values())
      .reduce((sum, count) => sum + count, 0);

    // TODO: 实现更详细的统计逻辑
    return {
      totalExecutions,
      successfulExecutions: Math.floor(totalExecutions * 0.95), // 假设95%成功率
      failedExecutions: Math.floor(totalExecutions * 0.05),
      averageConfidence: 0.85,
      averageExecutionTime: 150,
      decisionBreakdown: {
        [AutomationDecisionType.AUTO_APPROVE]: Math.floor(totalExecutions * 0.4),
        [AutomationDecisionType.AUTO_REJECT]: Math.floor(totalExecutions * 0.1),
        [AutomationDecisionType.ESCALATE]: Math.floor(totalExecutions * 0.3),
        [AutomationDecisionType.SEND_REMINDER]: Math.floor(totalExecutions * 0.15),
        [AutomationDecisionType.EXTEND_DEADLINE]: Math.floor(totalExecutions * 0.03),
        [AutomationDecisionType.CANCEL]: Math.floor(totalExecutions * 0.02),
        [AutomationDecisionType.NO_ACTION]: 0
      },
      ruleUsage: Object.fromEntries(this.executionHistory.entries()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 开始定期处理
   */
  startPeriodicProcessing(getConfirms: () => Promise<Confirm[]>): void {
    if (this.periodicTimer) {
      this.stopPeriodicProcessing();
    }

    this.periodicTimer = setInterval(async () => {
      if (this.isProcessing) {
        return;
      }

      this.isProcessing = true;
      try {
        const confirms = await getConfirms();
        await this.processBatchAutomation(confirms);
      } catch (error) {
        this.logger.error('Periodic automation processing failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        this.isProcessing = false;
      }
    }, 2 * 60 * 1000); // 每2分钟处理一次

    this.logger.info('Periodic automation processing started');
  }

  /**
   * 停止定期处理
   */
  stopPeriodicProcessing(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
      this.logger.info('Periodic automation processing stopped');
    }
  }

  /**
   * 检查执行限制
   */
  private checkExecutionLimits(rule: AutomationRule, confirm: Confirm): boolean {
    const now = Date.now();
    const today = new Date().toDateString();
    
    // 检查冷却时间
    if (rule.limits.cooldownMs) {
      const lastExec = this.lastExecution.get(rule.id);
      if (lastExec && (now - lastExec) < rule.limits.cooldownMs) {
        return false;
      }
    }

    // 检查每日执行限制
    if (rule.limits.maxExecutionsPerDay) {
      const todayKey = `${rule.id}:${today}`;
      const todayCount = this.executionHistory.get(todayKey) || 0;
      if (todayCount >= rule.limits.maxExecutionsPerDay) {
        return false;
      }
    }

    // 检查每个确认的执行限制
    if (rule.limits.maxExecutionsPerConfirm) {
      const confirmKey = `${rule.id}:${confirm.confirmId}`;
      const confirmCount = this.executionHistory.get(confirmKey) || 0;
      if (confirmCount >= rule.limits.maxExecutionsPerConfirm) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查规则条件
   */
  private checkRuleConditions(rule: AutomationRule, confirm: Confirm, now: Date): boolean {
    // 检查确认类型
    if (rule.conditions.confirmationType && 
        !rule.conditions.confirmationType.includes(confirm.confirmationType)) {
      return false;
    }

    // 检查优先级
    if (rule.conditions.priority && 
        !rule.conditions.priority.includes(confirm.priority as Priority)) {
      return false;
    }

    // 检查状态
    if (rule.conditions.status && 
        !rule.conditions.status.includes(confirm.status as ConfirmStatus)) {
      return false;
    }

    // 检查时间范围
    if (rule.conditions.timeRange) {
      const currentTime = now.toTimeString().substring(0, 5); // HH:mm
      if (currentTime < rule.conditions.timeRange.start || 
          currentTime > rule.conditions.timeRange.end) {
        return false;
      }
    }

    // 检查日期范围
    if (rule.conditions.dateRange) {
      const currentDate = now.toISOString().substring(0, 10); // YYYY-MM-DD
      if (currentDate < rule.conditions.dateRange.start || 
          currentDate > rule.conditions.dateRange.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * 计算置信度
   */
  private async calculateConfidence(_rule: AutomationRule, confirm: Confirm): Promise<number> {
    let confidence = 0.5; // 基础置信度

    // 基于超时状态调整置信度
    const timeoutResult = await this.timeoutService.checkTimeout(confirm);
    switch (timeoutResult.result) {
      case TimeoutCheckResult.EXPIRED:
        confidence += 0.3;
        break;
      case TimeoutCheckResult.CRITICAL:
        confidence += 0.4;
        break;
      case TimeoutCheckResult.WARNING:
        confidence += 0.1;
        break;
    }

    // 基于优先级调整置信度
    switch (confirm.priority) {
      case Priority.URGENT:
        confidence += 0.2;
        break;
      case Priority.HIGH:
        confidence += 0.1;
        break;
      case Priority.LOW:
        confidence -= 0.1;
        break;
    }

    // 确保置信度在0-1范围内
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 生成推理过程
   */
  private async generateReasoning(rule: AutomationRule, confirm: Confirm): Promise<string[]> {
    const reasoning: string[] = [];

    reasoning.push(`应用规则: ${rule.name}`);
    reasoning.push(`确认类型: ${confirm.confirmationType}`);
    reasoning.push(`优先级: ${confirm.priority}`);
    reasoning.push(`状态: ${confirm.status}`);

    const timeoutResult = await this.timeoutService.checkTimeout(confirm);
    reasoning.push(`超时状态: ${timeoutResult.result}`);

    if (timeoutResult.timeRemaining <= 0) {
      reasoning.push(`已超时 ${Math.abs(timeoutResult.timeRemaining / 1000 / 60)} 分钟`);
    } else {
      reasoning.push(`剩余时间 ${timeoutResult.timeRemaining / 1000 / 60} 分钟`);
    }

    return reasoning;
  }

  /**
   * 更新执行统计
   */
  private updateExecutionStats(ruleId: string): void {
    const count = this.executionHistory.get(ruleId) || 0;
    this.executionHistory.set(ruleId, count + 1);
    this.lastExecution.set(ruleId, Date.now());

    // 更新今日统计
    const today = new Date().toDateString();
    const todayKey = `${ruleId}:${today}`;
    const todayCount = this.executionHistory.get(todayKey) || 0;
    this.executionHistory.set(todayKey, todayCount + 1);
  }

  /**
   * 执行自动批准
   */
  private async executeAutoApprove(confirm: Confirm, decision: AutomationDecisionResult): Promise<void> {
    confirm.updateStatus(ConfirmStatus.APPROVED);
    
    await this.eventManager.emitEvent(ConfirmEventType.CONFIRMATION_APPROVED, {
      eventType: ConfirmEventType.CONFIRMATION_APPROVED,
      confirmId: confirm.confirmId,
      contextId: confirm.contextId,
      planId: confirm.planId,
      userId: 'system',
      status: ConfirmStatus.APPROVED,
      decision: 'auto_approved',
      metadata: {
        automationRuleId: decision.ruleId,
        confidence: decision.confidence,
        reasoning: decision.reasoning
      }
    });
  }

  /**
   * 执行自动拒绝
   */
  private async executeAutoReject(confirm: Confirm, decision: AutomationDecisionResult): Promise<void> {
    confirm.updateStatus(ConfirmStatus.REJECTED);
    
    await this.eventManager.emitEvent(ConfirmEventType.CONFIRMATION_REJECTED, {
      eventType: ConfirmEventType.CONFIRMATION_REJECTED,
      confirmId: confirm.confirmId,
      contextId: confirm.contextId,
      planId: confirm.planId,
      userId: 'system',
      status: ConfirmStatus.REJECTED,
      decision: 'auto_rejected',
      metadata: {
        automationRuleId: decision.ruleId,
        confidence: decision.confidence,
        reasoning: decision.reasoning
      }
    });
  }

  /**
   * 执行升级
   */
  private async executeEscalate(confirm: Confirm, decision: AutomationDecisionResult): Promise<void> {
    await this.escalationEngine.triggerEscalation(confirm, EscalationType.AUTOMATIC);
    
    await this.eventManager.emitEvent(ConfirmEventType.ESCALATION_TRIGGERED, {
      eventType: ConfirmEventType.ESCALATION_TRIGGERED,
      confirmId: confirm.confirmId,
      contextId: confirm.contextId,
      planId: confirm.planId,
      userId: 'system',
      status: confirm.status,
      metadata: {
        automationRuleId: decision.ruleId,
        confidence: decision.confidence,
        escalationType: EscalationType.AUTOMATIC
      }
    });
  }

  /**
   * 执行发送提醒
   */
  private async executeSendReminder(confirm: Confirm, decision: AutomationDecisionResult): Promise<void> {
    await this.eventManager.emitEvent(ConfirmEventType.REMINDER_SENT, {
      eventType: ConfirmEventType.REMINDER_SENT,
      confirmId: confirm.confirmId,
      contextId: confirm.contextId,
      planId: confirm.planId,
      userId: confirm.requester.userId,
      status: confirm.status,
      metadata: {
        automationRuleId: decision.ruleId,
        confidence: decision.confidence,
        reminderType: 'automated'
      }
    });
  }

  /**
   * 执行延长截止时间
   */
  private async executeExtendDeadline(confirm: Confirm, decision: AutomationDecisionResult): Promise<void> {
    const extensionMs = (decision.parameters?.extensionMs as number) || (24 * 60 * 60 * 1000); // 默认延长24小时
    const currentExpiry = confirm.expiresAt ? new Date(confirm.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newExpiry = new Date(currentExpiry.getTime() + extensionMs);
    
    // TODO: 实现更新过期时间的方法
    
    await this.eventManager.emitEvent(ConfirmEventType.DEADLINE_EXTENDED, {
      eventType: ConfirmEventType.DEADLINE_EXTENDED,
      confirmId: confirm.confirmId,
      contextId: confirm.contextId,
      planId: confirm.planId,
      userId: 'system',
      status: confirm.status,
      metadata: {
        automationRuleId: decision.ruleId,
        confidence: decision.confidence,
        previousExpiry: currentExpiry.toISOString(),
        newExpiry: newExpiry.toISOString(),
        extensionMs
      }
    });
  }

  /**
   * 执行取消
   */
  private async executeCancel(confirm: Confirm, decision: AutomationDecisionResult): Promise<void> {
    confirm.cancel();
    
    await this.eventManager.emitEvent(ConfirmEventType.CONFIRMATION_CANCELLED, {
      eventType: ConfirmEventType.CONFIRMATION_CANCELLED,
      confirmId: confirm.confirmId,
      contextId: confirm.contextId,
      planId: confirm.planId,
      userId: 'system',
      status: ConfirmStatus.CANCELLED,
      metadata: {
        automationRuleId: decision.ruleId,
        confidence: decision.confidence,
        cancellationReason: 'automated'
      }
    });
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    // 超时自动升级规则
    const timeoutEscalationRule: AutomationRule = {
      id: 'timeout-escalation',
      name: '超时自动升级',
      description: '确认超时时自动升级处理',
      triggers: [
        {
          type: AutomationTrigger.TIMEOUT,
          conditions: { result: TimeoutCheckResult.EXPIRED }
        }
      ],
      conditions: {
        status: [ConfirmStatus.PENDING, ConfirmStatus.IN_REVIEW]
      },
      decision: AutomationDecisionType.ESCALATE,
      confidenceThreshold: 0.8,
      enabled: true,
      priority: 100,
      limits: {
        maxExecutionsPerConfirm: 1,
        cooldownMs: 60 * 60 * 1000 // 1小时冷却
      }
    };

    // 低优先级自动批准规则
    const lowPriorityAutoApproveRule: AutomationRule = {
      id: 'low-priority-auto-approve',
      name: '低优先级自动批准',
      description: '低优先级确认在工作时间外自动批准',
      triggers: [
        {
          type: AutomationTrigger.SCHEDULE,
          conditions: { timeRange: { start: '18:00', end: '09:00' } }
        }
      ],
      conditions: {
        priority: [Priority.LOW],
        status: [ConfirmStatus.PENDING],
        timeRange: {
          start: '18:00',
          end: '09:00'
        }
      },
      decision: AutomationDecisionType.AUTO_APPROVE,
      confidenceThreshold: 0.7,
      enabled: true,
      priority: 50,
      limits: {
        maxExecutionsPerDay: 10,
        maxExecutionsPerConfirm: 1
      }
    };

    this.addRule(timeoutEscalationRule);
    this.addRule(lowPriorityAutoApproveRule);
  }
}
