/**
 * EscalationEngine 协议级测试
 * 
 * 测试范围：
 * - 升级规则管理
 * - 升级处理功能
 * - 升级查询功能
 * - 统计分析功能
 * - 边界条件和错误处理
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import {
  EscalationEngine,
  EscalationType,
  EscalationStatus,
  EscalationStrategy,
  EscalationRule,
  EscalationLevel,
  EscalationAction,
  EscalationInstance,
  EscalationResult,
  EscalationStatistics,
  IEscalationEngine
} from '../../../../../src/modules/confirm/domain/services/escalation-engine.service';
import { Confirm } from '../../../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmStatus, Priority, ConfirmationType, RiskLevel } from '../../../../../src/modules/confirm/types';
import { TestDataFactory } from '../../../../test-utils/test-data-factory';

describe('EscalationEngine - 协议级测试', () => {
  let escalationEngine: EscalationEngine;

  beforeEach(() => {
    escalationEngine = new EscalationEngine();
    
    // 清除默认规则，确保测试的独立性
    escalationEngine.removeRule('high-priority-timeout');
  });

  describe('升级规则管理', () => {
    it('应该添加和获取升级规则', () => {
      const rule: EscalationRule = {
        id: 'test-escalation-rule',
        name: '测试升级规则',
        description: '用于测试的升级规则',
        triggers: {
          timeoutMs: 3600000, // 1小时
          priority: [Priority.HIGH],
          confirmationType: ['task_approval']
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
            timeoutMs: 1800000, // 30分钟
            requireAllApprovals: false
          }
        ],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000 // 1小时间隔
      };

      escalationEngine.addRule(rule);
      const retrievedRule = escalationEngine.getRule('test-escalation-rule');

      expect(retrievedRule).toBeDefined();
      expect(retrievedRule?.id).toBe('test-escalation-rule');
      expect(retrievedRule?.name).toBe('测试升级规则');
      expect(retrievedRule?.strategy).toBe(EscalationStrategy.SEQUENTIAL);
    });

    it('应该移除升级规则', () => {
      const rule: EscalationRule = {
        id: 'removable-rule',
        name: '可删除规则',
        description: '用于测试删除的规则',
        triggers: {},
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [],
        enabled: true,
        priority: 50,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);
      expect(escalationEngine.getRule('removable-rule')).toBeDefined();

      escalationEngine.removeRule('removable-rule');
      expect(escalationEngine.getRule('removable-rule')).toBeNull();
    });

    it('应该获取适用的升级规则', () => {
      const rule: EscalationRule = {
        id: 'applicable-rule',
        name: '适用规则',
        description: '适用于高优先级确认的规则',
        triggers: {
          priority: [Priority.HIGH],
          confirmationType: ['task_approval']
        },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);

      const highPriorityConfirm = createTestConfirm('high-priority', Priority.HIGH, ConfirmStatus.PENDING);
      const applicableRules = escalationEngine.getApplicableRules(highPriorityConfirm);

      expect(applicableRules).toHaveLength(1);
      expect(applicableRules[0].id).toBe('applicable-rule');
    });

    it('应该按优先级排序规则', () => {
      const lowPriorityRule: EscalationRule = {
        id: 'low-priority-rule',
        name: '低优先级规则',
        description: '低优先级规则',
        triggers: { priority: [Priority.HIGH] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [],
        enabled: true,
        priority: 50,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      const highPriorityRule: EscalationRule = {
        id: 'high-priority-rule',
        name: '高优先级规则',
        description: '高优先级规则',
        triggers: { priority: [Priority.HIGH] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [],
        enabled: true,
        priority: 200,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(lowPriorityRule);
      escalationEngine.addRule(highPriorityRule);

      const highPriorityConfirm = createTestConfirm('high-priority', Priority.HIGH, ConfirmStatus.PENDING);
      const applicableRules = escalationEngine.getApplicableRules(highPriorityConfirm);

      expect(applicableRules).toHaveLength(2);
      expect(applicableRules[0].priority).toBeGreaterThan(applicableRules[1].priority);
    });
  });

  describe('升级处理功能', () => {
    it('应该成功触发升级', async () => {
      const rule: EscalationRule = {
        id: 'trigger-test-rule',
        name: '触发测试规则',
        description: '测试升级触发的规则',
        triggers: {
          priority: [Priority.HIGH]
        },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [
          {
            level: 1,
            name: '管理员',
            description: '升级到管理员',
            targets: {
              roles: ['admin']
            },
            actions: [
              { type: 'notify' }
            ],
            timeoutMs: 1800000,
            requireAllApprovals: false
          }
        ],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);

      const confirm = createTestConfirm('escalation-test', Priority.HIGH, ConfirmStatus.PENDING);
      const result = await escalationEngine.triggerEscalation(confirm, EscalationType.MANUAL, 'trigger-test-rule');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.escalationId).toBeDefined();
      expect(result.currentLevel).toBe(0);
      expect(result.completedActions).toBeGreaterThanOrEqual(0);
    });

    it('应该处理无适用规则的情况', async () => {
      const confirm = createTestConfirm('no-rules', Priority.LOW, ConfirmStatus.PENDING);
      const result = await escalationEngine.triggerEscalation(confirm, EscalationType.AUTOMATIC);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No applicable escalation rule found');
    });

    it('应该处理不存在的规则ID', async () => {
      const confirm = createTestConfirm('invalid-rule', Priority.HIGH, ConfirmStatus.PENDING);
      const result = await escalationEngine.triggerEscalation(confirm, EscalationType.MANUAL, 'non-existent-rule');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Escalation rule not found');
    });

    it('应该取消升级', async () => {
      const rule: EscalationRule = {
        id: 'cancellable-rule',
        name: '可取消规则',
        description: '可取消的升级规则',
        triggers: { priority: [Priority.MEDIUM] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [
          {
            level: 1,
            name: '审核员',
            description: '升级到审核员',
            targets: { roles: ['reviewer'] },
            actions: [{ type: 'notify' }],
            timeoutMs: 1800000,
            requireAllApprovals: false
          }
        ],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);

      const confirm = createTestConfirm('cancellable', Priority.MEDIUM, ConfirmStatus.PENDING);
      const escalationResult = await escalationEngine.triggerEscalation(confirm, EscalationType.MANUAL, 'cancellable-rule');

      expect(escalationResult.success).toBe(true);

      const cancelResult = await escalationEngine.cancelEscalation(escalationResult.escalationId!);
      expect(cancelResult).toBe(true);
    });
  });

  describe('升级查询功能', () => {
    it('应该获取升级实例', async () => {
      const rule: EscalationRule = {
        id: 'query-test-rule',
        name: '查询测试规则',
        description: '测试查询的规则',
        triggers: { priority: [Priority.HIGH] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [
          {
            level: 1,
            name: '管理员',
            description: '升级到管理员',
            targets: { roles: ['admin'] },
            actions: [{ type: 'notify' }],
            timeoutMs: 1800000,
            requireAllApprovals: false
          }
        ],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);

      const confirm = createTestConfirm('query-test', Priority.HIGH, ConfirmStatus.PENDING);
      const escalationResult = await escalationEngine.triggerEscalation(confirm, EscalationType.MANUAL, 'query-test-rule');

      const escalation = escalationEngine.getEscalation(escalationResult.escalationId!);
      expect(escalation).toBeDefined();
      expect(escalation?.confirmId).toBe(confirm.confirmId);
      expect(escalation?.ruleId).toBe('query-test-rule');
    });

    it('应该获取确认的升级列表', async () => {
      const rule: EscalationRule = {
        id: 'confirm-escalations-rule',
        name: '确认升级规则',
        description: '测试确认升级列表的规则',
        triggers: { priority: [Priority.HIGH] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [
          {
            level: 1,
            name: '管理员',
            description: '升级到管理员',
            targets: { roles: ['admin'] },
            actions: [{ type: 'notify' }],
            timeoutMs: 1800000,
            requireAllApprovals: false
          }
        ],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);

      const confirm = createTestConfirm('confirm-escalations', Priority.HIGH, ConfirmStatus.PENDING);
      await escalationEngine.triggerEscalation(confirm, EscalationType.MANUAL, 'confirm-escalations-rule');

      const escalations = escalationEngine.getEscalationsByConfirm(confirm.confirmId);
      expect(escalations).toHaveLength(1);
      expect(escalations[0].confirmId).toBe(confirm.confirmId);
    });

    it('应该获取活跃升级列表', () => {
      const activeEscalations = escalationEngine.getActiveEscalations();
      expect(Array.isArray(activeEscalations)).toBe(true);
    });
  });

  describe('统计分析功能', () => {
    it('应该获取升级统计信息', async () => {
      const stats = await escalationEngine.getEscalationStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.totalEscalations).toBe('number');
      expect(typeof stats.activeEscalations).toBe('number');
      expect(typeof stats.completedEscalations).toBe('number');
      expect(typeof stats.failedEscalations).toBe('number');
      expect(typeof stats.averageEscalationTime).toBe('number');
      expect(typeof stats.escalationSuccessRate).toBe('number');
      expect(typeof stats.mostCommonEscalationReason).toBe('string');
      expect(stats.timestamp).toBeDefined();
    });
  });

  describe('定时处理控制', () => {
    it('应该启动和停止定时处理', () => {
      // 启动定时处理
      escalationEngine.startPeriodicProcessing();
      
      // 停止定时处理
      escalationEngine.stopPeriodicProcessing();
      
      // 这个测试主要验证方法不会抛出异常
      expect(true).toBe(true);
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理无效的确认对象', async () => {
      const invalidConfirm = null as any;

      const result = await escalationEngine.triggerEscalation(invalidConfirm, EscalationType.MANUAL);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该处理禁用的规则', () => {
      const disabledRule: EscalationRule = {
        id: 'disabled-rule',
        name: '禁用规则',
        description: '被禁用的规则',
        triggers: { priority: [Priority.HIGH] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [],
        enabled: false, // 禁用
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(disabledRule);

      const confirm = createTestConfirm('test-confirm', Priority.HIGH, ConfirmStatus.PENDING);
      const applicableRules = escalationEngine.getApplicableRules(confirm);

      expect(applicableRules).toHaveLength(0); // 禁用的规则不应该被返回
    });

    it('应该处理重复的规则ID', () => {
      const rule1: EscalationRule = {
        id: 'duplicate-rule',
        name: '第一个规则',
        description: '第一个规则',
        triggers: {},
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [],
        enabled: true,
        priority: 100,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      const rule2: EscalationRule = {
        id: 'duplicate-rule', // 相同的ID
        name: '第二个规则',
        description: '第二个规则',
        triggers: {},
        strategy: EscalationStrategy.PARALLEL,
        escalationPath: [],
        enabled: true,
        priority: 200,
        maxEscalations: 1,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule1);
      escalationEngine.addRule(rule2); // 应该覆盖第一个规则

      const retrievedRule = escalationEngine.getRule('duplicate-rule');
      expect(retrievedRule?.name).toBe('第二个规则');
      expect(retrievedRule?.strategy).toBe(EscalationStrategy.PARALLEL);
    });

    it('应该处理空的升级路径', () => {
      const rule: EscalationRule = {
        id: 'empty-path-rule',
        name: '空路径规则',
        description: '没有升级路径的规则',
        triggers: { priority: [Priority.MEDIUM] },
        strategy: EscalationStrategy.SEQUENTIAL,
        escalationPath: [], // 空升级路径
        enabled: true,
        priority: 100,
        maxEscalations: 0,
        escalationIntervalMs: 3600000
      };

      escalationEngine.addRule(rule);

      const confirm = createTestConfirm('empty-path', Priority.MEDIUM, ConfirmStatus.PENDING);
      const applicableRules = escalationEngine.getApplicableRules(confirm);

      expect(applicableRules).toHaveLength(1); // 规则仍然适用，但升级路径为空
    });

    it('应该处理不存在的升级取消', async () => {
      const nonExistentId = TestDataFactory.generateUUID();
      const cancelResult = await escalationEngine.cancelEscalation(nonExistentId);

      expect(cancelResult).toBe(false);
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
  return new Confirm(
    id as any, // confirmId
    TestDataFactory.generateUUID(), // contextId
    '1.0.0', // protocolVersion
    confirmationType, // confirmationType
    status, // status
    priority, // priority
    { // subject
      title: `Test Confirm ${id}`,
      description: 'Test description for escalation',
      impactAssessment: {
        businessImpact: 'low',
        technicalImpact: 'low',
        riskLevel: RiskLevel.LOW,
        impactScope: ['test-system'],
        estimatedCost: 5000
      }
    },
    { // requester
      userId: 'test-user',
      name: 'Test User',
      role: 'developer',
      email: 'test@example.com',
      department: 'engineering',
      requestReason: 'Testing escalation functionality'
    },
    { // approvalWorkflow
      workflowType: 'consensus',
      steps: [],
      autoApprovalRules: {
        enabled: false,
        conditions: []
      }
    },
    new Date().toISOString(), // createdAt
    new Date().toISOString(), // updatedAt
    TestDataFactory.generateUUID(), // planId (optional)
    undefined, // decision (optional)
    new Date(Date.now() + 3600000).toISOString(), // expires_at (optional)
    { // metadata (optional)
      source: 'test',
      tags: ['escalation-test'],
      customFields: {}
    }
  );
}
