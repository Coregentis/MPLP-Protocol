/**
 * 规则引擎服务 - 高级审批规则管理
 * 
 * 功能：
 * - 审批规则定义和管理
 * - 规则执行和决策
 * - 决策树支持
 * - 规则冲突解决
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { Timestamp, Priority } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { Confirm } from '../entities/confirm.entity';
import {
  ConditionEngine,
  ConditionExpression,
  ConditionContext,
  ConditionResult,
  ConditionType
} from './condition-engine.service';

/**
 * 规则类型枚举
 */
export enum RuleType {
  APPROVAL = 'approval',           // 审批规则
  REJECTION = 'rejection',         // 拒绝规则
  ESCALATION = 'escalation',       // 升级规则
  NOTIFICATION = 'notification',   // 通知规则
  WORKFLOW = 'workflow'           // 工作流规则
}

/**
 * 规则优先级枚举
 */
export enum RulePriority {
  CRITICAL = 1000,    // 关键规则
  HIGH = 800,         // 高优先级
  MEDIUM = 500,       // 中优先级
  LOW = 200,          // 低优先级
  FALLBACK = 100      // 兜底规则
}

/**
 * 规则动作枚举
 */
export enum RuleAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  ESCALATE = 'escalate',
  NOTIFY = 'notify',
  ASSIGN = 'assign',
  DELAY = 'delay',
  SKIP = 'skip',
  CONTINUE = 'continue'
}

/**
 * 审批规则接口
 */
export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  priority: number;
  enabled: boolean;
  
  // 触发条件
  conditions: ConditionExpression[];
  conditionLogic: 'AND' | 'OR'; // 条件间的逻辑关系
  
  // 执行动作
  actions: RuleActionDefinition[];
  
  // 适用范围
  scope: {
    confirmationTypes?: string[];
    priorities?: Priority[];
    contexts?: string[];
    roles?: string[];
    timeRanges?: {
      start: string; // HH:mm
      end: string;   // HH:mm
    }[];
  };
  
  // 执行限制
  constraints: {
    maxExecutionsPerDay?: number;
    maxExecutionsPerConfirm?: number;
    cooldownMs?: number;
    validFrom?: Timestamp;
    validTo?: Timestamp;
  };
  
  // 元数据
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * 规则动作定义接口
 */
export interface RuleActionDefinition {
  action: RuleAction;
  parameters?: Record<string, unknown>;
  delay?: number; // 延迟执行（毫秒）
  condition?: ConditionExpression; // 动作执行条件
}

/**
 * 规则执行结果接口
 */
export interface RuleExecutionResult {
  ruleId: string;
  ruleName: string;
  success: boolean;
  triggered: boolean;
  actions: ActionExecutionResult[];
  conditionResults: ConditionResult[];
  executionTime: number;
  error?: string;
  timestamp: Timestamp;
}

/**
 * 动作执行结果接口
 */
export interface ActionExecutionResult {
  action: RuleAction;
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
}

/**
 * 决策结果接口
 */
export interface DecisionResult {
  decision: 'approve' | 'reject' | 'escalate' | 'pending';
  confidence: number;
  reasoning: string[];
  appliedRules: RuleExecutionResult[];
  recommendedActions: RuleActionDefinition[];
  metadata?: Record<string, unknown>;
}

/**
 * 规则冲突解决策略枚举
 */
export enum ConflictResolutionStrategy {
  PRIORITY = 'priority',           // 按优先级
  FIRST_MATCH = 'first_match',     // 第一个匹配
  LAST_MATCH = 'last_match',       // 最后一个匹配
  MOST_SPECIFIC = 'most_specific', // 最具体的规则
  CONSENSUS = 'consensus'          // 共识决策
}

/**
 * 规则引擎接口
 */
export interface IRuleEngine {
  // 规则管理
  addRule(rule: ApprovalRule): void;
  removeRule(ruleId: string): void;
  updateRule(ruleId: string, updates: Partial<ApprovalRule>): void;
  getRule(ruleId: string): ApprovalRule | null;
  getRules(type?: RuleType): ApprovalRule[];
  
  // 规则执行
  executeRules(confirm: Confirm, context: ConditionContext): Promise<RuleExecutionResult[]>;
  makeDecision(confirm: Confirm, context: ConditionContext): Promise<DecisionResult>;
  
  // 规则查询
  findApplicableRules(confirm: Confirm, context: ConditionContext): Promise<ApprovalRule[]>;
  validateRule(rule: ApprovalRule): { valid: boolean; errors: string[] };
  
  // 冲突解决
  setConflictResolutionStrategy(strategy: ConflictResolutionStrategy): void;
  resolveConflicts(rules: ApprovalRule[], results: RuleExecutionResult[]): RuleExecutionResult[];
}

/**
 * 规则引擎实现
 */
export class RuleEngine implements IRuleEngine {
  private logger: Logger;
  private conditionEngine: ConditionEngine;
  private rules: Map<string, ApprovalRule> = new Map();
  private conflictResolutionStrategy: ConflictResolutionStrategy = ConflictResolutionStrategy.PRIORITY;
  private executionHistory: Map<string, number> = new Map(); // ruleId -> execution count
  private lastExecution: Map<string, number> = new Map(); // ruleId -> timestamp

  constructor(conditionEngine: ConditionEngine) {
    this.logger = new Logger('RuleEngine');
    this.conditionEngine = conditionEngine;
    this.initializeDefaultRules();
  }

  /**
   * 添加规则
   */
  addRule(rule: ApprovalRule): void {
    const validation = this.validateRule(rule);
    if (!validation.valid) {
      throw new Error(`Invalid rule: ${validation.errors.join(', ')}`);
    }

    this.rules.set(rule.id, rule);
    this.logger.info('Rule added', {
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      priority: rule.priority
    });
  }

  /**
   * 移除规则
   */
  removeRule(ruleId: string): void {
    if (this.rules.delete(ruleId)) {
      this.executionHistory.delete(ruleId);
      this.lastExecution.delete(ruleId);
      this.logger.info('Rule removed', { ruleId });
    } else {
      this.logger.warn('Rule not found for removal', { ruleId });
    }
  }

  /**
   * 更新规则
   */
  updateRule(ruleId: string, updates: Partial<ApprovalRule>): void {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    const updatedRule = { ...rule, ...updates, updatedAt: new Date().toISOString() };
    const validation = this.validateRule(updatedRule);
    if (!validation.valid) {
      throw new Error(`Invalid rule update: ${validation.errors.join(', ')}`);
    }

    this.rules.set(ruleId, updatedRule);
    this.logger.info('Rule updated', { ruleId, updates: Object.keys(updates) });
  }

  /**
   * 获取规则
   */
  getRule(ruleId: string): ApprovalRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * 获取规则列表
   */
  getRules(type?: RuleType): ApprovalRule[] {
    const allRules = Array.from(this.rules.values());
    if (type) {
      return allRules.filter(rule => rule.type === type);
    }
    return allRules;
  }

  /**
   * 执行规则
   */
  async executeRules(confirm: Confirm, context: ConditionContext): Promise<RuleExecutionResult[]> {
    const applicableRules = await this.findApplicableRules(confirm, context);
    const results: RuleExecutionResult[] = [];

    for (const rule of applicableRules) {
      try {
        const result = await this.executeRule(rule, confirm, context);
        results.push(result);
      } catch (error) {
        this.logger.error('Rule execution failed', {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error)
        });

        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          triggered: false,
          actions: [],
          conditionResults: [],
          executionTime: 0,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    }

    // 解决冲突
    const resolvedResults = this.resolveConflicts(applicableRules, results);

    this.logger.info('Rules executed', {
      totalRules: applicableRules.length,
      triggeredRules: resolvedResults.filter(r => r.triggered).length,
      successfulRules: resolvedResults.filter(r => r.success).length
    });

    return resolvedResults;
  }

  /**
   * 做出决策
   */
  async makeDecision(confirm: Confirm, context: ConditionContext): Promise<DecisionResult> {
    const executionResults = await this.executeRules(confirm, context);
    const triggeredResults = executionResults.filter(r => r.triggered && r.success);

    // 分析执行结果
    const approvalRules = triggeredResults.filter(r => {
      const rule = this.rules.get(r.ruleId);
      return rule?.type === RuleType.APPROVAL;
    });

    const rejectionRules = triggeredResults.filter(r => {
      const rule = this.rules.get(r.ruleId);
      return rule?.type === RuleType.REJECTION;
    });

    const escalationRules = triggeredResults.filter(r => {
      const rule = this.rules.get(r.ruleId);
      return rule?.type === RuleType.ESCALATION;
    });

    // 决策逻辑
    let decision: 'approve' | 'reject' | 'escalate' | 'pending';
    let confidence: number;
    const reasoning: string[] = [];

    if (rejectionRules.length > 0) {
      decision = 'reject';
      confidence = 0.9;
      reasoning.push(`${rejectionRules.length}个拒绝规则被触发`);
      rejectionRules.forEach(r => reasoning.push(`- ${r.ruleName}`));
    } else if (escalationRules.length > 0) {
      decision = 'escalate';
      confidence = 0.8;
      reasoning.push(`${escalationRules.length}个升级规则被触发`);
      escalationRules.forEach(r => reasoning.push(`- ${r.ruleName}`));
    } else if (approvalRules.length > 0) {
      decision = 'approve';
      confidence = 0.85;
      reasoning.push(`${approvalRules.length}个批准规则被触发`);
      approvalRules.forEach(r => reasoning.push(`- ${r.ruleName}`));
    } else {
      decision = 'pending';
      confidence = 0.5;
      reasoning.push('没有明确的规则被触发，需要人工审批');
    }

    // 收集推荐动作
    const recommendedActions: RuleActionDefinition[] = [];
    triggeredResults.forEach(result => {
      const rule = this.rules.get(result.ruleId);
      if (rule) {
        recommendedActions.push(...rule.actions);
      }
    });

    return {
      decision,
      confidence,
      reasoning,
      appliedRules: triggeredResults,
      recommendedActions,
      metadata: {
        totalRulesEvaluated: executionResults.length,
        triggeredRulesCount: triggeredResults.length,
        approvalRulesCount: approvalRules.length,
        rejectionRulesCount: rejectionRules.length,
        escalationRulesCount: escalationRules.length
      }
    };
  }

  /**
   * 查找适用的规则
   */
  async findApplicableRules(confirm: Confirm, context: ConditionContext): Promise<ApprovalRule[]> {
    const applicableRules: ApprovalRule[] = [];
    const now = Date.now();

    for (const rule of Array.from(this.rules.values())) {
      if (!rule.enabled) {
        continue;
      }

      // 检查执行限制
      if (!this.checkExecutionConstraints(rule, confirm, now)) {
        continue;
      }

      // 检查适用范围
      if (!this.checkRuleScope(rule, confirm, context)) {
        continue;
      }

      applicableRules.push(rule);
    }

    // 按优先级排序
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 验证规则
   */
  validateRule(rule: ApprovalRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基本字段验证
    if (!rule.id) errors.push('Rule ID is required');
    if (!rule.name) errors.push('Rule name is required');
    if (!rule.type) errors.push('Rule type is required');
    if (typeof rule.priority !== 'number') errors.push('Rule priority must be a number');

    // 条件验证
    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('Rule must have at least one condition');
    } else {
      rule.conditions.forEach((condition, index) => {
        const conditionValidation = this.conditionEngine.validate(condition);
        if (!conditionValidation.valid) {
          errors.push(`Condition ${index + 1}: ${conditionValidation.errors.join(', ')}`);
        }
      });
    }

    // 动作验证
    if (!rule.actions || rule.actions.length === 0) {
      errors.push('Rule must have at least one action');
    } else {
      rule.actions.forEach((action, index) => {
        if (!Object.values(RuleAction).includes(action.action)) {
          errors.push(`Action ${index + 1}: Invalid action type ${action.action}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 设置冲突解决策略
   */
  setConflictResolutionStrategy(strategy: ConflictResolutionStrategy): void {
    this.conflictResolutionStrategy = strategy;
    this.logger.info('Conflict resolution strategy updated', { strategy });
  }

  /**
   * 解决规则冲突
   */
  resolveConflicts(rules: ApprovalRule[], results: RuleExecutionResult[]): RuleExecutionResult[] {
    const triggeredResults = results.filter(r => r.triggered && r.success);
    
    if (triggeredResults.length <= 1) {
      return results; // 没有冲突
    }

    switch (this.conflictResolutionStrategy) {
      case ConflictResolutionStrategy.PRIORITY:
        return this.resolveBypriority(results);
      case ConflictResolutionStrategy.FIRST_MATCH:
        return this.resolveByFirstMatch(results);
      case ConflictResolutionStrategy.LAST_MATCH:
        return this.resolveByLastMatch(results);
      case ConflictResolutionStrategy.MOST_SPECIFIC:
        return this.resolveByMostSpecific(rules, results);
      case ConflictResolutionStrategy.CONSENSUS:
        return this.resolveByConsensus(results);
      default:
        return results;
    }
  }

  /**
   * 执行单个规则
   */
  private async executeRule(rule: ApprovalRule, confirm: Confirm, context: ConditionContext): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    const conditionResults: ConditionResult[] = [];
    const actions: ActionExecutionResult[] = [];

    try {
      // 评估条件
      let conditionsMet = false;
      
      if (rule.conditions.length === 0) {
        conditionsMet = true;
      } else {
        const results = await this.conditionEngine.evaluateBatch(rule.conditions, context);
        conditionResults.push(...results);
        
        if (rule.conditionLogic === 'AND') {
          conditionsMet = results.every(r => r.success && r.value);
        } else {
          conditionsMet = results.some(r => r.success && r.value);
        }
      }

      if (!conditionsMet) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          success: true,
          triggered: false,
          actions: [],
          conditionResults,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      // 执行动作
      for (const actionDef of rule.actions) {
        const actionResult = await this.executeAction(actionDef, confirm, context);
        actions.push(actionResult);
      }

      // 更新执行统计
      this.updateExecutionStats(rule.id);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: true,
        triggered: true,
        actions,
        conditionResults,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: false,
        triggered: false,
        actions,
        conditionResults,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行动作
   */
  private async executeAction(
    actionDef: RuleActionDefinition, 
    confirm: Confirm, 
    context: ConditionContext
  ): Promise<ActionExecutionResult> {
    const startTime = Date.now();

    try {
      // 检查动作执行条件
      if (actionDef.condition) {
        const conditionResult = await this.conditionEngine.evaluate(actionDef.condition, context);
        if (!conditionResult.success || !conditionResult.value) {
          return {
            action: actionDef.action,
            success: true,
            result: 'skipped_due_to_condition',
            executionTime: Date.now() - startTime
          };
        }
      }

      // 延迟执行
      if (actionDef.delay && actionDef.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, actionDef.delay));
      }

      // 执行具体动作
      let result: unknown;
      switch (actionDef.action) {
        case RuleAction.APPROVE:
          result = await this.executeApproveAction(confirm, actionDef.parameters);
          break;
        case RuleAction.REJECT:
          result = await this.executeRejectAction(confirm, actionDef.parameters);
          break;
        case RuleAction.ESCALATE:
          result = await this.executeEscalateAction(confirm, actionDef.parameters);
          break;
        case RuleAction.NOTIFY:
          result = await this.executeNotifyAction(confirm, actionDef.parameters);
          break;
        case RuleAction.ASSIGN:
          result = await this.executeAssignAction(confirm, actionDef.parameters);
          break;
        case RuleAction.DELAY:
          result = await this.executeDelayAction(confirm, actionDef.parameters);
          break;
        default:
          result = `Action ${actionDef.action} executed with parameters: ${JSON.stringify(actionDef.parameters)}`;
      }

      return {
        action: actionDef.action,
        success: true,
        result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        action: actionDef.action,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * 检查执行约束
   */
  private checkExecutionConstraints(rule: ApprovalRule, confirm: Confirm, now: number): boolean {
    // 检查有效期
    if (rule.constraints.validFrom && now < new Date(rule.constraints.validFrom).getTime()) {
      return false;
    }
    if (rule.constraints.validTo && now > new Date(rule.constraints.validTo).getTime()) {
      return false;
    }

    // 检查冷却时间
    if (rule.constraints.cooldownMs) {
      const lastExec = this.lastExecution.get(rule.id);
      if (lastExec && (now - lastExec) < rule.constraints.cooldownMs) {
        return false;
      }
    }

    // 检查每日执行限制
    if (rule.constraints.maxExecutionsPerDay) {
      const today = new Date().toDateString();
      const todayKey = `${rule.id}:${today}`;
      const todayCount = this.executionHistory.get(todayKey) || 0;
      if (todayCount >= rule.constraints.maxExecutionsPerDay) {
        return false;
      }
    }

    // 检查每个确认的执行限制
    if (rule.constraints.maxExecutionsPerConfirm) {
      const confirmKey = `${rule.id}:${confirm.confirmId}`;
      const confirmCount = this.executionHistory.get(confirmKey) || 0;
      if (confirmCount >= rule.constraints.maxExecutionsPerConfirm) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查规则适用范围
   */
  private checkRuleScope(rule: ApprovalRule, confirm: Confirm, context: ConditionContext): boolean {
    // 检查确认类型
    if (rule.scope.confirmationTypes && 
        !rule.scope.confirmationTypes.includes(confirm.confirmationType)) {
      return false;
    }

    // 检查优先级
    if (rule.scope.priorities && 
        !rule.scope.priorities.includes(confirm.priority as Priority)) {
      return false;
    }

    // 检查上下文
    if (rule.scope.contexts && 
        !rule.scope.contexts.includes(confirm.contextId)) {
      return false;
    }

    // 检查角色
    if (rule.scope.roles && 
        !rule.scope.roles.includes(confirm.requester.role)) {
      return false;
    }

    // 检查时间范围
    if (rule.scope.timeRanges && rule.scope.timeRanges.length > 0) {
      const currentTime = context.timeData.now.toTimeString().substring(0, 5); // HH:mm
      const inTimeRange = rule.scope.timeRanges.some(range => 
        currentTime >= range.start && currentTime <= range.end
      );
      if (!inTimeRange) {
        return false;
      }
    }

    return true;
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
   * 按优先级解决冲突
   */
  private resolveBypriority(results: RuleExecutionResult[]): RuleExecutionResult[] {
    const triggeredResults = results.filter(r => r.triggered && r.success);
    if (triggeredResults.length <= 1) {
      return results;
    }

    // 找到最高优先级
    const maxPriority = Math.max(...triggeredResults.map(r => {
      const rule = this.rules.get(r.ruleId);
      return rule?.priority || 0;
    }));

    // 只保留最高优先级的规则
    return results.map(result => {
      if (!result.triggered || !result.success) {
        return result;
      }

      const rule = this.rules.get(result.ruleId);
      if (rule && rule.priority === maxPriority) {
        return result;
      }

      return { ...result, triggered: false };
    });
  }

  /**
   * 按第一个匹配解决冲突
   */
  private resolveByFirstMatch(results: RuleExecutionResult[]): RuleExecutionResult[] {
    let firstTriggered = false;
    
    return results.map(result => {
      if (!result.triggered || !result.success) {
        return result;
      }

      if (!firstTriggered) {
        firstTriggered = true;
        return result;
      }

      return { ...result, triggered: false };
    });
  }

  /**
   * 按最后一个匹配解决冲突
   */
  private resolveByLastMatch(results: RuleExecutionResult[]): RuleExecutionResult[] {
    const triggeredIndices = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.triggered && result.success)
      .map(({ index }) => index);

    if (triggeredIndices.length <= 1) {
      return results;
    }

    const lastIndex = triggeredIndices[triggeredIndices.length - 1];

    return results.map((result, index) => {
      if (!result.triggered || !result.success) {
        return result;
      }

      if (index === lastIndex) {
        return result;
      }

      return { ...result, triggered: false };
    });
  }

  /**
   * 按最具体规则解决冲突
   */
  private resolveByMostSpecific(_rules: ApprovalRule[], results: RuleExecutionResult[]): RuleExecutionResult[] {
    // 简化实现：按条件数量判断具体程度
    const triggeredResults = results.filter(r => r.triggered && r.success);
    if (triggeredResults.length <= 1) {
      return results;
    }

    const maxConditions = Math.max(...triggeredResults.map(r => {
      const rule = this.rules.get(r.ruleId);
      return rule?.conditions.length || 0;
    }));

    return results.map(result => {
      if (!result.triggered || !result.success) {
        return result;
      }

      const rule = this.rules.get(result.ruleId);
      if (rule && rule.conditions.length === maxConditions) {
        return result;
      }

      return { ...result, triggered: false };
    });
  }

  /**
   * 按共识解决冲突
   */
  private resolveByConsensus(results: RuleExecutionResult[]): RuleExecutionResult[] {
    // 简化实现：如果大多数规则同意，则采用该决策
    const triggeredResults = results.filter(r => r.triggered && r.success);
    if (triggeredResults.length <= 1) {
      return results;
    }

    // 统计不同类型的规则
    const ruleTypes = triggeredResults.map(r => {
      const rule = this.rules.get(r.ruleId);
      return rule?.type;
    });

    const typeCounts = ruleTypes.reduce((counts, type) => {
      if (type) {
        counts[type] = (counts[type] || 0) + 1;
      }
      return counts;
    }, {} as Record<RuleType, number>);

    const majorityType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as RuleType;

    if (!majorityType) {
      return results;
    }

    return results.map(result => {
      if (!result.triggered || !result.success) {
        return result;
      }

      const rule = this.rules.get(result.ruleId);
      if (rule && rule.type === majorityType) {
        return result;
      }

      return { ...result, triggered: false };
    });
  }

  /**
   * 执行批准动作
   */
  private async executeApproveAction(confirm: Confirm, parameters?: Record<string, unknown>): Promise<string> {
    // TODO: 实现实际的批准逻辑
    this.logger.info('Executing approve action', {
      confirmId: confirm.confirmId,
      parameters
    });
    return 'Approval action executed';
  }

  /**
   * 执行拒绝动作
   */
  private async executeRejectAction(confirm: Confirm, parameters?: Record<string, unknown>): Promise<string> {
    // TODO: 实现实际的拒绝逻辑
    this.logger.info('Executing reject action', {
      confirmId: confirm.confirmId,
      parameters
    });
    return 'Rejection action executed';
  }

  /**
   * 执行升级动作
   */
  private async executeEscalateAction(confirm: Confirm, parameters?: Record<string, unknown>): Promise<string> {
    // TODO: 实现实际的升级逻辑
    this.logger.info('Executing escalate action', {
      confirmId: confirm.confirmId,
      parameters
    });
    return 'Escalation action executed';
  }

  /**
   * 执行通知动作
   */
  private async executeNotifyAction(confirm: Confirm, parameters?: Record<string, unknown>): Promise<string> {
    // TODO: 实现实际的通知逻辑
    this.logger.info('Executing notify action', {
      confirmId: confirm.confirmId,
      parameters
    });
    return 'Notification action executed';
  }

  /**
   * 执行分配动作
   */
  private async executeAssignAction(confirm: Confirm, parameters?: Record<string, unknown>): Promise<string> {
    // TODO: 实现实际的分配逻辑
    this.logger.info('Executing assign action', {
      confirmId: confirm.confirmId,
      parameters
    });
    return 'Assignment action executed';
  }

  /**
   * 执行延迟动作
   */
  private async executeDelayAction(confirm: Confirm, parameters?: Record<string, unknown>): Promise<string> {
    const delayMs = (parameters?.delayMs as number) || 60000; // 默认1分钟
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    this.logger.info('Executing delay action', {
      confirmId: confirm.confirmId,
      delayMs
    });
    return `Delayed for ${delayMs}ms`;
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    // 高优先级自动批准规则
    const highPriorityAutoApproval: ApprovalRule = {
      id: 'high-priority-auto-approval',
      name: '高优先级自动批准',
      description: '高优先级确认在工作时间内自动批准',
      type: RuleType.APPROVAL,
      priority: RulePriority.HIGH,
      enabled: true,
      conditions: [
        {
          type: ConditionType.FUNCTION,
          expression: 'hasPriority("high")',
          functionName: 'hasPriority',
          parameters: ['high']
        },
        {
          type: ConditionType.FUNCTION,
          expression: 'isWorkingHours()',
          functionName: 'isWorkingHours',
          parameters: []
        }
      ],
      conditionLogic: 'AND',
      actions: [
        {
          action: RuleAction.APPROVE,
          parameters: { reason: 'High priority auto-approval during working hours' }
        }
      ],
      scope: {
        priorities: [Priority.HIGH, Priority.URGENT]
      },
      constraints: {
        maxExecutionsPerConfirm: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };

    // 系统角色自动批准规则
    const systemRoleAutoApproval: ApprovalRule = {
      id: 'system-role-auto-approval',
      name: '系统角色自动批准',
      description: '系统角色发起的确认自动批准',
      type: RuleType.APPROVAL,
      priority: RulePriority.CRITICAL,
      enabled: true,
      conditions: [
        {
          type: ConditionType.FUNCTION,
          expression: 'hasRole("system")',
          functionName: 'hasRole',
          parameters: ['system']
        }
      ],
      conditionLogic: 'AND',
      actions: [
        {
          action: RuleAction.APPROVE,
          parameters: { reason: 'System role auto-approval' }
        }
      ],
      scope: {
        roles: ['system']
      },
      constraints: {
        maxExecutionsPerConfirm: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };

    // 过期确认升级规则
    const expiredEscalationRule: ApprovalRule = {
      id: 'expired-escalation',
      name: '过期确认升级',
      description: '过期的确认自动升级处理',
      type: RuleType.ESCALATION,
      priority: RulePriority.HIGH,
      enabled: true,
      conditions: [
        {
          type: ConditionType.FUNCTION,
          expression: 'isExpired()',
          functionName: 'isExpired',
          parameters: []
        }
      ],
      conditionLogic: 'AND',
      actions: [
        {
          action: RuleAction.ESCALATE,
          parameters: { reason: 'Confirmation expired' }
        }
      ],
      scope: {},
      constraints: {
        maxExecutionsPerConfirm: 3,
        cooldownMs: 60 * 60 * 1000 // 1小时冷却
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    };

    this.addRule(highPriorityAutoApproval);
    this.addRule(systemRoleAutoApproval);
    this.addRule(expiredEscalationRule);

    this.logger.info('Default rules initialized', {
      rulesCount: this.rules.size
    });
  }
}
