/**
 * AutomationService 协议级测试
 * 
 * 测试范围：
 * - 自动化规则管理
 * - 自动化决策执行
 * - 批量自动化处理
 * - 统计分析
 * - 边界条件和错误处理
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import {
  AutomationService,
  AutomationRule,
  AutomationTrigger,
  AutomationDecisionType,
  AutomationExecutionResult,
  IAutomationService
} from '../../../../../src/modules/confirm/domain/services/automation.service';
import { TimeoutService } from '../../../../../src/modules/confirm/domain/services/timeout.service';
import { EscalationEngine } from '../../../../../src/modules/confirm/domain/services/escalation-engine.service';
import { ConfirmEventManager } from '../../../../../src/modules/confirm/domain/services/confirm-event-manager.service';
import { NotificationService } from '../../../../../src/modules/confirm/domain/services/notification.service';
import { EventPushService } from '../../../../../src/modules/confirm/domain/services/event-push.service';
import { Confirm } from '../../../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmEntityData } from '../../../../../src/modules/confirm/api/mappers/confirm.mapper';
import { ConfirmStatus, Priority, ConfirmationType, RiskLevel, StepStatus } from '../../../../../src/modules/confirm/types';
import { TestDataFactory } from '../../../../test-utils/test-data-factory';

describe('AutomationService - 协议级测试', () => {
  let automationService: AutomationService;
  let mockTimeoutService: TimeoutService;
  let mockEscalationEngine: EscalationEngine;
  let mockEventManager: ConfirmEventManager;
  let mockNotificationService: NotificationService;
  let mockEventPushService: EventPushService;

  beforeEach(() => {
    // 创建mock服务
    mockTimeoutService = new TimeoutService();
    mockEscalationEngine = new EscalationEngine();

    // 创建NotificationService和EventPushService的mock
    mockNotificationService = {} as NotificationService;
    mockEventPushService = {} as EventPushService;
    mockEventManager = new ConfirmEventManager(mockNotificationService, mockEventPushService);

    automationService = new AutomationService(
      mockTimeoutService,
      mockEscalationEngine,
      mockEventManager
    );

    // 清除默认规则，确保测试的独立性
    automationService.removeRule('timeout-escalation');
    automationService.removeRule('low-priority-auto-approve');
  });

  describe('自动化规则管理', () => {
    it('应该添加和获取自动化规则', () => {
      const rule: AutomationRule = {
        id: 'test-rule-1',
        name: '测试自动批准规则',
        description: '自动批准低风险的任务确认',
        triggers: [
          {
            type: AutomationTrigger.PRIORITY,
            conditions: {
              priority: [Priority.LOW]
            }
          }
        ],
        conditions: {
          status: [ConfirmStatus.PENDING],
          priority: [Priority.LOW]
        },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.8,
        enabled: true,
        priority: 100,
        limits: {
          maxExecutionsPerDay: 10,
          maxExecutionsPerConfirm: 1
        }
      };

      automationService.addRule(rule);
      const retrievedRule = automationService.getRule('test-rule-1');

      expect(retrievedRule).toBeDefined();
      expect(retrievedRule?.id).toBe('test-rule-1');
      expect(retrievedRule?.name).toBe('测试自动批准规则');
      expect(retrievedRule?.decision).toBe(AutomationDecisionType.AUTO_APPROVE);
    });

    it('应该移除自动化规则', () => {
      const rule: AutomationRule = {
        id: 'test-rule-2',
        name: '用于测试删除的规则',
        description: '用于测试删除的规则',
        triggers: [
          {
            type: AutomationTrigger.MANUAL,
            conditions: {}
          }
        ],
        conditions: {},
        decision: AutomationDecisionType.NO_ACTION,
        confidenceThreshold: 0.5,
        enabled: true,
        priority: 50,
        limits: {}
      };

      automationService.addRule(rule);
      expect(automationService.getRule('test-rule-2')).toBeDefined();

      automationService.removeRule('test-rule-2');
      expect(automationService.getRule('test-rule-2')).toBeNull();
    });

    it('应该获取适用的自动化规则', () => {
      const lowPriorityRule: AutomationRule = {
        id: 'low-priority-rule',
        name: '低优先级规则',
        description: '适用于低优先级确认',
        triggers: [
          {
            type: AutomationTrigger.PRIORITY,
            conditions: { priority: [Priority.LOW] }
          }
        ],
        conditions: {
          priority: [Priority.LOW],
          status: [ConfirmStatus.PENDING]
        },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.7,
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(lowPriorityRule);

      // 创建低优先级确认
      const lowPriorityConfirm = createTestConfirm('low-priority', Priority.LOW, ConfirmStatus.PENDING);
      const applicableRules = automationService.getApplicableRules(lowPriorityConfirm);

      expect(applicableRules).toHaveLength(1);
      expect(applicableRules[0].id).toBe('low-priority-rule');
    });

    it('应该按优先级排序规则', () => {
      const highPriorityRule: AutomationRule = {
        id: 'high-priority-rule',
        name: '高优先级规则',
        description: '高优先级规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: { priority: [Priority.HIGH] },
        decision: AutomationDecisionType.ESCALATE,
        confidenceThreshold: 0.9,
        enabled: true,
        priority: 200,
        limits: {}
      };

      const lowPriorityRule: AutomationRule = {
        id: 'low-priority-rule',
        name: '低优先级规则',
        description: '低优先级规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: { priority: [Priority.HIGH] },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.7,
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(lowPriorityRule);
      automationService.addRule(highPriorityRule);

      const highPriorityConfirm = createTestConfirm('high-priority', Priority.HIGH, ConfirmStatus.PENDING);
      const applicableRules = automationService.getApplicableRules(highPriorityConfirm);

      expect(applicableRules).toHaveLength(2);
      expect(applicableRules[0].priority).toBeGreaterThan(applicableRules[1].priority);
    });
  });

  describe('自动化决策执行', () => {
    it('应该成功执行自动化决策', async () => {
      const rule: AutomationRule = {
        id: 'auto-approve-rule',
        name: '自动批准规则',
        description: '自动批准低优先级确认',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: {
          priority: [Priority.LOW],
          status: [ConfirmStatus.IN_REVIEW],
          confirmationType: [ConfirmationType.TASK_APPROVAL]
        },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.5, // 降低置信度要求
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(rule);

      const lowPriorityConfirm = createTestConfirm('low-priority', Priority.LOW, ConfirmStatus.IN_REVIEW);
      const result = await automationService.processAutomation(lowPriorityConfirm);

      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
      expect(result?.decision).toBe(AutomationDecisionType.AUTO_APPROVE);
    });

    it('应该处理无适用规则的情况', async () => {
      const highPriorityConfirm = createTestConfirm('high-priority', Priority.HIGH, ConfirmStatus.PENDING);
      const result = await automationService.processAutomation(highPriorityConfirm);

      expect(result).toBeNull();
    });

    it('应该处理置信度不足的情况', async () => {
      const rule: AutomationRule = {
        id: 'high-confidence-rule',
        name: '高置信度规则',
        description: '需要高置信度的规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: { priority: [Priority.MEDIUM] },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.95, // 很高的置信度要求
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(rule);

      const mediumPriorityConfirm = createTestConfirm('medium-priority', Priority.MEDIUM, ConfirmStatus.PENDING);
      const result = await automationService.processAutomation(mediumPriorityConfirm);

      // 由于置信度不足，应该不执行自动化
      expect(result).toBeNull();
    });

    it('应该处理执行限制', async () => {
      const rule: AutomationRule = {
        id: 'limited-rule',
        name: '限制执行规则',
        description: '有执行限制的规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: {
          priority: [Priority.LOW],
          status: [ConfirmStatus.IN_REVIEW],
          confirmationType: [ConfirmationType.TASK_APPROVAL]
        },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.5, // 降低置信度要求
        enabled: true,
        priority: 100,
        limits: {
          maxExecutionsPerConfirm: 1
        }
      };

      automationService.addRule(rule);

      const lowPriorityConfirm = createTestConfirm('limited-confirm', Priority.LOW, ConfirmStatus.IN_REVIEW);

      // 第一次执行应该成功
      const firstResult = await automationService.processAutomation(lowPriorityConfirm);
      expect(firstResult?.success).toBe(true);

      // 第二次执行应该被限制
      const secondResult = await automationService.processAutomation(lowPriorityConfirm);
      expect(secondResult).toBeNull();
    });
  });

  describe('批量自动化处理', () => {
    it('应该批量处理多个确认', async () => {
      const rule: AutomationRule = {
        id: 'batch-rule',
        name: '批量处理规则',
        description: '用于批量处理的规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: {
          priority: [Priority.LOW],
          status: [ConfirmStatus.IN_REVIEW],
          confirmationType: [ConfirmationType.TASK_APPROVAL]
        },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.5, // 降低置信度要求
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(rule);

      const confirms = [
        createTestConfirm('batch-1', Priority.LOW, ConfirmStatus.IN_REVIEW),
        createTestConfirm('batch-2', Priority.LOW, ConfirmStatus.IN_REVIEW),
        createTestConfirm('batch-3', Priority.HIGH, ConfirmStatus.IN_REVIEW) // 不匹配规则
      ];

      const results = await automationService.processBatchAutomation(confirms);

      expect(results).toHaveLength(2); // 只有2个低优先级的会被处理
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('应该处理空确认列表', async () => {
      const results = await automationService.processBatchAutomation([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('统计分析', () => {
    it('应该获取自动化统计信息', async () => {
      const stats = await automationService.getAutomationStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.totalExecutions).toBe('number');
      expect(typeof stats.successfulExecutions).toBe('number');
      expect(typeof stats.failedExecutions).toBe('number');
      expect(typeof stats.averageConfidence).toBe('number');
      expect(typeof stats.averageExecutionTime).toBe('number');
      expect(typeof stats.decisionBreakdown).toBe('object');
      expect(typeof stats.ruleUsage).toBe('object');
      expect(typeof stats.timestamp).toBe('string');
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理无效的确认对象', async () => {
      const invalidConfirm = null as any;

      // 实际实现不会抛出异常，而是返回null
      const result = await automationService.processAutomation(invalidConfirm);
      expect(result).toBeNull();
    });

    it('应该处理禁用的规则', () => {
      const disabledRule: AutomationRule = {
        id: 'disabled-rule',
        name: '禁用的规则',
        description: '这个规则被禁用了',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: { priority: [Priority.LOW] },
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.8,
        enabled: false, // 禁用
        priority: 100,
        limits: {}
      };

      automationService.addRule(disabledRule);

      const lowPriorityConfirm = createTestConfirm('test-confirm', Priority.LOW, ConfirmStatus.PENDING);
      const applicableRules = automationService.getApplicableRules(lowPriorityConfirm);

      expect(applicableRules).toHaveLength(0); // 禁用的规则不应该被返回
    });

    it('应该处理重复的规则ID', () => {
      const rule1: AutomationRule = {
        id: 'duplicate-rule',
        name: '第一个规则',
        description: '第一个规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: {},
        decision: AutomationDecisionType.AUTO_APPROVE,
        confidenceThreshold: 0.8,
        enabled: true,
        priority: 100,
        limits: {}
      };

      const rule2: AutomationRule = {
        id: 'duplicate-rule', // 相同的ID
        name: '第二个规则',
        description: '第二个规则',
        triggers: [{ type: AutomationTrigger.PRIORITY, conditions: {} }],
        conditions: {},
        decision: AutomationDecisionType.AUTO_REJECT,
        confidenceThreshold: 0.8,
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(rule1);
      automationService.addRule(rule2); // 应该覆盖第一个规则

      const retrievedRule = automationService.getRule('duplicate-rule');
      expect(retrievedRule?.name).toBe('第二个规则');
      expect(retrievedRule?.decision).toBe(AutomationDecisionType.AUTO_REJECT);
    });

    it('应该处理空的触发器条件', () => {
      const rule: AutomationRule = {
        id: 'empty-trigger-rule',
        name: '空触发器规则',
        description: '没有触发器条件的规则',
        triggers: [], // 空触发器
        conditions: {
          priority: [Priority.LOW],
          status: [ConfirmStatus.PENDING],
          confirmationType: [ConfirmationType.TASK_APPROVAL]
        },
        decision: AutomationDecisionType.NO_ACTION,
        confidenceThreshold: 0.8,
        enabled: true,
        priority: 100,
        limits: {}
      };

      automationService.addRule(rule);

      const confirm = createTestConfirm('test-confirm', Priority.LOW, ConfirmStatus.PENDING);
      const applicableRules = automationService.getApplicableRules(confirm);

      // 实际实现中，空触发器的规则仍然会被匹配，因为只检查条件
      expect(applicableRules).toHaveLength(1);
      expect(applicableRules[0].id).toBe('empty-trigger-rule');
    });
  });
});

/**
 * 创建测试用的Confirm实例
 */
function createTestConfirm(
  id: string,
  priority: Priority = Priority.MEDIUM,
  status: ConfirmStatus = ConfirmStatus.PENDING,
  confirmationType: ConfirmationType = ConfirmationType.TASK_APPROVAL
): Confirm {
  const confirmData: ConfirmEntityData = {
    protocolVersion: '1.0.0',
    timestamp: new Date(),
    confirmId: id,
    contextId: TestDataFactory.generateUUID(),
    confirmationType: confirmationType,
    status: status,
    priority: priority,
    subject: {
      title: `Test Confirm ${id}`,
      description: 'Test description for automation',
      impactAssessment: {
        businessImpact: 'Low impact',
        technicalImpact: 'Low impact',
        riskLevel: RiskLevel.LOW,
        impactScope: ['test-system'],
      },
    },
    requester: {
      userId: 'test-user',
      name: 'Test User',
      role: 'developer',
      email: 'test@example.com',
      department: 'engineering',
      requestReason: 'Testing automation functionality'
    },
    approvalWorkflow: {
      workflowType: 'consensus',
      steps: [{
        stepId: 'step-1',
        name: 'Test Approval',
        stepOrder: 1,
        level: 1,
        approvers: priority === Priority.HIGH || priority === Priority.URGENT ? [
          {
            approverId: 'approver-1',
            name: 'Test Approver 1',
            role: 'approver',
            email: 'approver1@example.com',
            priority: 1,
            isActive: true,
          },
          {
            approverId: 'approver-2',
            name: 'Test Approver 2',
            role: 'approver',
            email: 'approver2@example.com',
            priority: 2,
            isActive: true,
          }
        ] : [{
          approverId: 'approver-1',
          name: 'Test Approver',
          role: 'approver',
          email: 'approver@example.com',
          priority: 1,
          isActive: true,
        }],
        status: StepStatus.PENDING,
        timeoutHours: 24,
      }],
      requireAllApprovers: false,
      allowDelegation: true,
      autoApprovalRules: {
        enabled: false,
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    metadata: {
      source: 'test',
      tags: ['automation-test'],
      customFields: {}
    }
  };

  return new Confirm(confirmData);
}
