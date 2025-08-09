/**
 * 升级引擎服务 - 确认升级处理
 * 
 * 功能：
 * - 升级规则管理
 * - 自动升级处理
 * - 升级路径计算
 * - 升级历史追踪
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { UUID, Timestamp, Priority } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { Confirm } from '../entities/confirm.entity';

/**
 * 升级类型枚举
 */
export enum EscalationType {
  TIME_BASED = 'time_based',
  PRIORITY_BASED = 'priority_based',
  ROLE_BASED = 'role_based',
  MANUAL = 'manual',
  AUTOMATIC = 'automatic'
}

/**
 * 升级状态枚举
 */
export enum EscalationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 升级策略枚举
 */
export enum EscalationStrategy {
  SEQUENTIAL = 'sequential', // 顺序升级
  PARALLEL = 'parallel',     // 并行升级
  CONDITIONAL = 'conditional' // 条件升级
}

/**
 * 升级规则接口
 */
export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  
  // 触发条件
  triggers: {
    timeoutMs?: number;
    priority?: Priority[];
    confirmationType?: string[];
    contextId?: string[];
    requesterRole?: string[];
    approverRole?: string[];
  };
  
  // 升级策略
  strategy: EscalationStrategy;
  
  // 升级路径
  escalationPath: EscalationLevel[];
  
  // 是否启用
  enabled: boolean;
  
  // 优先级
  priority: number;
  
  // 最大升级次数
  maxEscalations: number;
  
  // 升级间隔（毫秒）
  escalationIntervalMs: number;
}

/**
 * 升级级别接口
 */
export interface EscalationLevel {
  level: number;
  name: string;
  description: string;
  
  // 升级目标
  targets: {
    userIds?: string[];
    roles?: string[];
    groups?: string[];
    emails?: string[];
  };
  
  // 升级动作
  actions: EscalationAction[];
  
  // 超时时间（毫秒）
  timeoutMs: number;
  
  // 是否需要所有目标确认
  requireAllApprovals: boolean;
}

/**
 * 升级动作接口
 */
export interface EscalationAction {
  type: 'notify' | 'auto_approve' | 'auto_reject' | 'reassign' | 'cancel';
  parameters?: Record<string, unknown>;
  delay?: number; // 延迟执行（毫秒）
}

/**
 * 升级实例接口
 */
export interface EscalationInstance {
  id: UUID;
  confirmId: UUID;
  ruleId: string;
  type: EscalationType;
  status: EscalationStatus;
  currentLevel: number;
  maxLevel: number;
  strategy: EscalationStrategy;
  
  // 时间信息
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  
  // 升级历史
  history: EscalationHistoryEntry[];
  
  // 元数据
  metadata?: Record<string, unknown>;
}

/**
 * 升级历史条目接口
 */
export interface EscalationHistoryEntry {
  level: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  status: EscalationStatus;
  targets: string[];
  actions: EscalationAction[];
  result?: 'approved' | 'rejected' | 'timeout' | 'cancelled';
  notes?: string;
}

/**
 * 升级结果接口
 */
export interface EscalationResult {
  success: boolean;
  escalationId?: UUID;
  currentLevel?: number;
  nextLevel?: number;
  completedActions: number;
  failedActions: number;
  message?: string;
  error?: string;
}

/**
 * 升级统计接口
 */
export interface EscalationStatistics {
  totalEscalations: number;
  activeEscalations: number;
  completedEscalations: number;
  failedEscalations: number;
  averageEscalationTime: number;
  escalationSuccessRate: number;
  mostCommonEscalationReason: string;
  timestamp: Timestamp;
}

/**
 * 升级引擎服务接口
 */
export interface IEscalationEngine {
  // 规则管理
  addRule(rule: EscalationRule): void;
  removeRule(ruleId: string): void;
  getRule(ruleId: string): EscalationRule | null;
  getApplicableRules(confirm: Confirm): EscalationRule[];
  
  // 升级处理
  triggerEscalation(confirm: Confirm, type: EscalationType, ruleId?: string): Promise<EscalationResult>;
  processEscalation(escalationId: UUID): Promise<EscalationResult>;
  cancelEscalation(escalationId: UUID): Promise<boolean>;
  
  // 升级查询
  getEscalation(escalationId: UUID): EscalationInstance | null;
  getEscalationsByConfirm(confirmId: UUID): EscalationInstance[];
  getActiveEscalations(): EscalationInstance[];
  
  // 统计分析
  getEscalationStatistics(): Promise<EscalationStatistics>;
  
  // 定时处理
  startPeriodicProcessing(): void;
  stopPeriodicProcessing(): void;
}

/**
 * 升级引擎服务实现
 */
export class EscalationEngine implements IEscalationEngine {
  private logger: Logger;
  private rules: Map<string, EscalationRule> = new Map();
  private escalations: Map<UUID, EscalationInstance> = new Map();
  private periodicTimer: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor() {
    this.logger = new Logger('EscalationEngine');
    this.initializeDefaultRules();
  }

  /**
   * 添加升级规则
   */
  addRule(rule: EscalationRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info('Escalation rule added', {
      ruleId: rule.id,
      ruleName: rule.name,
      strategy: rule.strategy,
      maxEscalations: rule.maxEscalations
    });
  }

  /**
   * 移除升级规则
   */
  removeRule(ruleId: string): void {
    if (this.rules.delete(ruleId)) {
      this.logger.info('Escalation rule removed', { ruleId });
    } else {
      this.logger.warn('Escalation rule not found for removal', { ruleId });
    }
  }

  /**
   * 获取升级规则
   */
  getRule(ruleId: string): EscalationRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * 获取适用的升级规则
   */
  getApplicableRules(confirm: Confirm): EscalationRule[] {
    const applicableRules: EscalationRule[] = [];

    for (const rule of Array.from(this.rules.values())) {
      if (!rule.enabled) {
        continue;
      }

      // 检查确认类型
      if (rule.triggers.confirmationType && 
          !rule.triggers.confirmationType.includes(confirm.confirmationType)) {
        continue;
      }

      // 检查优先级
      if (rule.triggers.priority && 
          !rule.triggers.priority.includes(confirm.priority as Priority)) {
        continue;
      }

      // 检查上下文ID
      if (rule.triggers.contextId && 
          !rule.triggers.contextId.includes(confirm.contextId)) {
        continue;
      }

      // 检查请求者角色
      if (rule.triggers.requesterRole && 
          !rule.triggers.requesterRole.includes(confirm.requester.role)) {
        continue;
      }

      applicableRules.push(rule);
    }

    // 按优先级排序
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 触发升级
   */
  async triggerEscalation(
    confirm: Confirm, 
    type: EscalationType, 
    ruleId?: string
  ): Promise<EscalationResult> {
    try {
      // 获取适用的规则
      let rule: EscalationRule | null = null;
      
      if (ruleId) {
        rule = this.getRule(ruleId);
        if (!rule) {
          return {
            success: false,
            completedActions: 0,
            failedActions: 0,
            error: `Escalation rule not found: ${ruleId}`
          };
        }
      } else {
        const applicableRules = this.getApplicableRules(confirm);
        rule = applicableRules[0] || null;
        
        if (!rule) {
          return {
            success: false,
            completedActions: 0,
            failedActions: 0,
            error: 'No applicable escalation rule found'
          };
        }
      }

      // 检查是否已有活跃的升级
      const existingEscalations = this.getEscalationsByConfirm(confirm.confirmId)
        .filter(e => e.status === EscalationStatus.IN_PROGRESS);

      if (existingEscalations.length > 0) {
        return {
          success: false,
          completedActions: 0,
          failedActions: 0,
          error: 'Escalation already in progress for this confirmation'
        };
      }

      // 创建升级实例
      const escalation: EscalationInstance = {
        id: this.generateId(),
        confirmId: confirm.confirmId,
        ruleId: rule.id,
        type,
        status: EscalationStatus.PENDING,
        currentLevel: 0,
        maxLevel: rule.escalationPath.length - 1,
        strategy: rule.strategy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      };

      this.escalations.set(escalation.id, escalation);

      this.logger.info('Escalation triggered', {
        escalationId: escalation.id,
        confirmId: confirm.confirmId,
        ruleId: rule.id,
        type,
        strategy: rule.strategy
      });

      // 开始处理升级
      const result = await this.processEscalation(escalation.id);
      
      return {
        success: true,
        escalationId: escalation.id,
        currentLevel: escalation.currentLevel,
        nextLevel: escalation.currentLevel < escalation.maxLevel ? escalation.currentLevel + 1 : undefined,
        completedActions: result.completedActions,
        failedActions: result.failedActions,
        message: 'Escalation triggered successfully'
      };

    } catch (error) {
      this.logger.error('Failed to trigger escalation', {
        confirmId: confirm.confirmId,
        type,
        ruleId,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        completedActions: 0,
        failedActions: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 处理升级
   */
  async processEscalation(escalationId: UUID): Promise<EscalationResult> {
    const escalation = this.escalations.get(escalationId);
    if (!escalation) {
      return {
        success: false,
        completedActions: 0,
        failedActions: 0,
        error: 'Escalation not found'
      };
    }

    const rule = this.getRule(escalation.ruleId);
    if (!rule) {
      return {
        success: false,
        completedActions: 0,
        failedActions: 0,
        error: 'Escalation rule not found'
      };
    }

    try {
      escalation.status = EscalationStatus.IN_PROGRESS;
      escalation.updatedAt = new Date().toISOString();

      let completedActions = 0;
      let failedActions = 0;

      // 处理当前级别
      if (escalation.currentLevel <= escalation.maxLevel) {
        const level = rule.escalationPath[escalation.currentLevel];
        
        const historyEntry: EscalationHistoryEntry = {
          level: escalation.currentLevel,
          startedAt: new Date().toISOString(),
          status: EscalationStatus.IN_PROGRESS,
          targets: this.extractTargets(level),
          actions: level.actions
        };

        escalation.history.push(historyEntry);

        // 执行升级动作
        for (const action of level.actions) {
          try {
            await this.executeEscalationAction(escalation, level, action);
            completedActions++;
          } catch (error) {
            this.logger.error('Failed to execute escalation action', {
              escalationId,
              level: escalation.currentLevel,
              action: action.type,
              error: error instanceof Error ? error.message : String(error)
            });
            failedActions++;
          }
        }

        historyEntry.completedAt = new Date().toISOString();
        historyEntry.status = failedActions === 0 ? EscalationStatus.COMPLETED : EscalationStatus.FAILED;

        // 检查是否需要继续升级
        if (escalation.currentLevel < escalation.maxLevel) {
          escalation.currentLevel++;
        } else {
          escalation.status = EscalationStatus.COMPLETED;
          escalation.completedAt = new Date().toISOString();
        }
      }

      escalation.updatedAt = new Date().toISOString();

      this.logger.info('Escalation processed', {
        escalationId,
        currentLevel: escalation.currentLevel,
        status: escalation.status,
        completedActions,
        failedActions
      });

      return {
        success: true,
        escalationId,
        currentLevel: escalation.currentLevel,
        nextLevel: escalation.currentLevel < escalation.maxLevel ? escalation.currentLevel + 1 : undefined,
        completedActions,
        failedActions
      };

    } catch (error) {
      escalation.status = EscalationStatus.FAILED;
      escalation.updatedAt = new Date().toISOString();

      this.logger.error('Escalation processing failed', {
        escalationId,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        completedActions: 0,
        failedActions: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 取消升级
   */
  async cancelEscalation(escalationId: UUID): Promise<boolean> {
    const escalation = this.escalations.get(escalationId);
    if (!escalation) {
      return false;
    }

    escalation.status = EscalationStatus.CANCELLED;
    escalation.updatedAt = new Date().toISOString();
    escalation.completedAt = new Date().toISOString();

    this.logger.info('Escalation cancelled', {
      escalationId,
      confirmId: escalation.confirmId
    });

    return true;
  }

  /**
   * 获取升级实例
   */
  getEscalation(escalationId: UUID): EscalationInstance | null {
    return this.escalations.get(escalationId) || null;
  }

  /**
   * 获取确认的所有升级
   */
  getEscalationsByConfirm(confirmId: UUID): EscalationInstance[] {
    return Array.from(this.escalations.values())
      .filter(escalation => escalation.confirmId === confirmId);
  }

  /**
   * 获取活跃的升级
   */
  getActiveEscalations(): EscalationInstance[] {
    return Array.from(this.escalations.values())
      .filter(escalation => escalation.status === EscalationStatus.IN_PROGRESS);
  }

  /**
   * 获取升级统计
   */
  async getEscalationStatistics(): Promise<EscalationStatistics> {
    const allEscalations = Array.from(this.escalations.values());
    const activeEscalations = allEscalations.filter(e => e.status === EscalationStatus.IN_PROGRESS);
    const completedEscalations = allEscalations.filter(e => e.status === EscalationStatus.COMPLETED);
    const failedEscalations = allEscalations.filter(e => e.status === EscalationStatus.FAILED);

    // 计算平均升级时间
    let averageEscalationTime = 0;
    if (completedEscalations.length > 0) {
      const totalTime = completedEscalations.reduce((sum, escalation) => {
        if (escalation.completedAt) {
          const start = new Date(escalation.createdAt).getTime();
          const end = new Date(escalation.completedAt).getTime();
          return sum + (end - start);
        }
        return sum;
      }, 0);
      averageEscalationTime = totalTime / completedEscalations.length;
    }

    const escalationSuccessRate = allEscalations.length > 0 ? 
      completedEscalations.length / allEscalations.length : 0;

    return {
      totalEscalations: allEscalations.length,
      activeEscalations: activeEscalations.length,
      completedEscalations: completedEscalations.length,
      failedEscalations: failedEscalations.length,
      averageEscalationTime,
      escalationSuccessRate,
      mostCommonEscalationReason: 'Timeout', // TODO: 实现更详细的分析
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 开始定期处理
   */
  startPeriodicProcessing(): void {
    if (this.periodicTimer) {
      this.stopPeriodicProcessing();
    }

    this.periodicTimer = setInterval(async () => {
      if (this.isProcessing) {
        return;
      }

      this.isProcessing = true;
      try {
        const activeEscalations = this.getActiveEscalations();
        for (const escalation of activeEscalations) {
          await this.processEscalation(escalation.id);
        }
      } catch (error) {
        this.logger.error('Periodic escalation processing failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        this.isProcessing = false;
      }
    }, 60000); // 每分钟检查一次

    this.logger.info('Periodic escalation processing started');
  }

  /**
   * 停止定期处理
   */
  stopPeriodicProcessing(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
      this.logger.info('Periodic escalation processing stopped');
    }
  }

  /**
   * 执行升级动作
   */
  private async executeEscalationAction(
    escalation: EscalationInstance,
    level: EscalationLevel,
    action: EscalationAction
  ): Promise<void> {
    // 延迟执行
    if (action.delay && action.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, action.delay));
    }

    this.logger.info('Executing escalation action', {
      escalationId: escalation.id,
      level: level.level,
      actionType: action.type,
      parameters: action.parameters
    });

    // TODO: 实现具体的升级动作执行逻辑
    // 这里需要与ConfirmEventManager和其他服务集成
    switch (action.type) {
      case 'notify':
        // 发送通知
        this.logger.info('Sending escalation notification', {
          escalationId: escalation.id,
          targets: this.extractTargets(level)
        });
        break;
      case 'auto_approve':
        // 自动批准
        this.logger.info('Auto-approving confirmation', {
          escalationId: escalation.id,
          confirmId: escalation.confirmId
        });
        break;
      case 'auto_reject':
        // 自动拒绝
        this.logger.info('Auto-rejecting confirmation', {
          escalationId: escalation.id,
          confirmId: escalation.confirmId
        });
        break;
      case 'reassign':
        // 重新分配
        this.logger.info('Reassigning confirmation', {
          escalationId: escalation.id,
          confirmId: escalation.confirmId,
          newTargets: this.extractTargets(level)
        });
        break;
      case 'cancel':
        // 取消确认
        this.logger.info('Cancelling confirmation', {
          escalationId: escalation.id,
          confirmId: escalation.confirmId
        });
        break;
    }
  }

  /**
   * 提取目标列表
   */
  private extractTargets(level: EscalationLevel): string[] {
    const targets: string[] = [];
    
    if (level.targets.userIds) {
      targets.push(...level.targets.userIds);
    }
    
    if (level.targets.roles) {
      targets.push(...level.targets.roles.map(role => `role:${role}`));
    }
    
    if (level.targets.groups) {
      targets.push(...level.targets.groups.map(group => `group:${group}`));
    }
    
    if (level.targets.emails) {
      targets.push(...level.targets.emails.map(email => `email:${email}`));
    }
    
    return targets;
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    // 高优先级超时升级规则
    const highPriorityRule: EscalationRule = {
      id: 'high-priority-timeout',
      name: '高优先级超时升级',
      description: '高优先级确认超时时的升级处理',
      triggers: {
        timeoutMs: 2 * 60 * 60 * 1000, // 2小时
        priority: [Priority.HIGH, Priority.URGENT]
      },
      strategy: EscalationStrategy.SEQUENTIAL,
      escalationPath: [
        {
          level: 1,
          name: '直接主管',
          description: '升级到直接主管',
          targets: {
            roles: ['manager']
          },
          actions: [
            { type: 'notify' }
          ],
          timeoutMs: 60 * 60 * 1000, // 1小时
          requireAllApprovals: false
        },
        {
          level: 2,
          name: '部门负责人',
          description: '升级到部门负责人',
          targets: {
            roles: ['department_head']
          },
          actions: [
            { type: 'notify' },
            { type: 'auto_approve', delay: 30 * 60 * 1000 } // 30分钟后自动批准
          ],
          timeoutMs: 30 * 60 * 1000, // 30分钟
          requireAllApprovals: false
        }
      ],
      enabled: true,
      priority: 100,
      maxEscalations: 2,
      escalationIntervalMs: 60 * 60 * 1000 // 1小时间隔
    };

    this.addRule(highPriorityRule);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): UUID {
    return `escalation_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as UUID;
  }
}
