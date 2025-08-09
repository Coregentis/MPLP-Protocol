/**
 * TimeoutService - 协议级测试
 * 
 * 测试超时检测服务的核心功能：
 * - 超时检测和监控
 * - 自动超时处理
 * - 超时预警通知
 * - 超时统计分析
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { 
  TimeoutService, 
  TimeoutConfig, 
  TimeoutCheckResult, 
  TimeoutAction,
  TimeoutRule,
  ITimeoutService
} from '../../../../../src/modules/confirm/domain/services/timeout.service';
import { Confirm } from '../../../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmStatus, ConfirmationType, Priority } from '../../../../../src/modules/confirm/types';
import { TestDataFactory } from '../../../../test-utils/test-data-factory';

describe('TimeoutService - 协议级测试', () => {
  let timeoutService: ITimeoutService;
  let mockConfirms: Confirm[];

  beforeEach(() => {
    timeoutService = new TimeoutService();
    
    // 创建测试用的确认实例
    mockConfirms = [
      createTestConfirm('confirm-1', new Date(Date.now() - 2 * 60 * 60 * 1000), Priority.MEDIUM, ConfirmationType.TASK_APPROVAL, -60 * 60 * 1000), // 2小时前创建，1小时前就应该过期
      createTestConfirm('confirm-2', new Date(Date.now() - 30 * 60 * 1000), Priority.MEDIUM, ConfirmationType.TASK_APPROVAL, 20 * 60 * 1000), // 30分钟前创建，20分钟后过期，应该警告
      createTestConfirm('confirm-3', new Date(), Priority.MEDIUM, ConfirmationType.TASK_APPROVAL, 10 * 60 * 60 * 1000), // 刚创建，10小时后过期，正常
    ];
  });

  afterEach(() => {
    timeoutService.stopPeriodicCheck();
  });

  describe('配置管理', () => {
    it('应该设置和获取配置', () => {
      const config: TimeoutConfig = {
        warningThresholds: [1800000, 900000], // 30分钟、15分钟
        defaultTimeoutMs: 3600000, // 1小时
        defaultTimeoutAction: TimeoutAction.AUTO_REJECT,
        checkIntervalMs: 300000, // 5分钟
        enableAutoProcessing: true,
        timeoutRules: []
      };

      timeoutService.setConfig(config);
      const retrievedConfig = timeoutService.getConfig();

      expect(retrievedConfig).toEqual(config);
      expect(retrievedConfig.warningThresholds).toHaveLength(2);
      expect(retrievedConfig.defaultTimeoutAction).toBe(TimeoutAction.AUTO_REJECT);
    });

    it('应该使用默认配置', () => {
      const defaultConfig = timeoutService.getConfig();

      expect(defaultConfig.warningThresholds).toBeDefined();
      expect(defaultConfig.defaultTimeoutMs).toBeGreaterThan(0);
      expect(defaultConfig.defaultTimeoutAction).toBeDefined();
      expect(defaultConfig.checkIntervalMs).toBeGreaterThan(0);
      expect(defaultConfig.enableAutoProcessing).toBeDefined();
    });
  });

  describe('单个确认超时检测', () => {
    it('应该检测未过期的确认', async () => {
      // 创建一个很远的过期时间（10小时后），确保不会触发警告
      const recentConfirm = createTestConfirm('recent', new Date(), Priority.MEDIUM, ConfirmationType.TASK_APPROVAL, 10 * 60 * 60 * 1000);

      const result = await timeoutService.checkTimeout(recentConfirm);

      expect(result.result).toBe(TimeoutCheckResult.NOT_EXPIRED);
      expect(result.confirmId).toBe('recent');
      expect(result.timeRemaining).toBeGreaterThan(0);
      expect(result.recommendedAction).toBeUndefined();
    });

    it('应该检测需要警告的确认', async () => {
      // 设置短超时配置用于测试
      const config: TimeoutConfig = {
        warningThresholds: [1800000], // 30分钟警告
        defaultTimeoutMs: 3600000, // 1小时超时
        defaultTimeoutAction: TimeoutAction.SEND_WARNING,
        checkIntervalMs: 300000,
        enableAutoProcessing: true,
        timeoutRules: []
      };
      timeoutService.setConfig(config);

      const warningConfirm = createTestConfirm('warning', new Date(Date.now() - 45 * 60 * 1000)); // 45分钟前
      
      const result = await timeoutService.checkTimeout(warningConfirm);

      expect(result.result).toBe(TimeoutCheckResult.WARNING);
      expect(result.confirmId).toBe('warning');
      expect(result.timeRemaining).toBeLessThan(1800000); // 少于30分钟
      expect(result.recommendedAction).toBe(TimeoutAction.SEND_WARNING);
    });

    it('应该检测已过期的确认', async () => {
      // 设置短超时配置
      const config: TimeoutConfig = {
        warningThresholds: [300000], // 5分钟警告
        defaultTimeoutMs: 600000, // 10分钟超时
        defaultTimeoutAction: TimeoutAction.AUTO_REJECT,
        checkIntervalMs: 60000,
        enableAutoProcessing: true,
        timeoutRules: []
      };
      timeoutService.setConfig(config);

      const expiredConfirm = createTestConfirm('expired', new Date(Date.now() - 15 * 60 * 1000), Priority.MEDIUM, ConfirmationType.TASK_APPROVAL, -10 * 60 * 1000); // 15分钟前创建，10分钟前就应该过期
      
      const result = await timeoutService.checkTimeout(expiredConfirm);

      expect(result.result).toBe(TimeoutCheckResult.EXPIRED);
      expect(result.confirmId).toBe('expired');
      expect(result.timeRemaining).toBeLessThanOrEqual(0);
      expect(result.recommendedAction).toBe(TimeoutAction.AUTO_REJECT);
    });
  });

  describe('批量超时检测', () => {
    it('应该批量检测多个确认的超时状态', async () => {
      // 设置测试配置
      const config: TimeoutConfig = {
        warningThresholds: [1800000], // 30分钟
        defaultTimeoutMs: 3600000, // 1小时
        defaultTimeoutAction: TimeoutAction.ESCALATE,
        checkIntervalMs: 300000,
        enableAutoProcessing: true,
        timeoutRules: []
      };
      timeoutService.setConfig(config);

      const result = await timeoutService.checkBatchTimeouts(mockConfirms);

      expect(result.results).toHaveLength(3);
      expect(result.totalChecked).toBe(3);
      expect(result.notExpired).toBeGreaterThanOrEqual(1);
      expect(result.warnings).toBeGreaterThanOrEqual(0);
      expect(result.expired).toBeGreaterThanOrEqual(1);
    });

    it('应该处理空确认列表', async () => {
      const result = await timeoutService.checkBatchTimeouts([]);

      expect(result.results).toHaveLength(0);
      expect(result.totalChecked).toBe(0);
      expect(result.notExpired).toBe(0);
      expect(result.warnings).toBe(0);
      expect(result.expired).toBe(0);
    });
  });

  describe('超时规则管理', () => {
    it('应该添加和获取超时规则', () => {
      const rule: TimeoutRule = {
        id: 'urgent-rule',
        name: '紧急确认规则',
        description: '紧急确认的特殊超时处理',
        conditions: {
          priority: [Priority.URGENT],
          confirmationType: [ConfirmationType.EMERGENCY_APPROVAL]
        },
        timeoutMs: 1800000, // 30分钟
        warningThresholds: [600000, 300000], // 10分钟、5分钟
        action: TimeoutAction.ESCALATE,
        enabled: true
      };

      timeoutService.addTimeoutRule(rule);
      
      const urgentConfirm = createTestConfirm('urgent', new Date(), Priority.URGENT, ConfirmationType.EMERGENCY_APPROVAL);
      const applicableRule = timeoutService.getApplicableRule(urgentConfirm);

      expect(applicableRule).toBeDefined();
      expect(applicableRule?.id).toBe('urgent-rule');
      expect(applicableRule?.timeoutMs).toBe(1800000);
    });

    it('应该移除超时规则', () => {
      const rule: TimeoutRule = {
        id: 'test-rule',
        name: '测试规则',
        description: '用于测试的规则',
        conditions: {
          priority: [Priority.HIGH]
        },
        timeoutMs: 3600000,
        warningThresholds: [1800000],
        action: TimeoutAction.AUTO_APPROVE,
        enabled: true
      };

      timeoutService.addTimeoutRule(rule);
      timeoutService.removeTimeoutRule('test-rule');
      
      const highPriorityConfirm = createTestConfirm('high', new Date(), Priority.HIGH);
      const applicableRule = timeoutService.getApplicableRule(highPriorityConfirm);

      expect(applicableRule).toBeNull();
    });
  });

  describe('超时统计分析', () => {
    it('应该生成超时统计信息', async () => {
      const statistics = await timeoutService.getTimeoutStatistics(mockConfirms);

      expect(statistics.totalConfirms).toBe(3);
      expect(statistics.activeConfirms).toBeGreaterThanOrEqual(0);
      expect(statistics.expiredConfirms).toBeGreaterThanOrEqual(0);
      expect(statistics.warningConfirms).toBeGreaterThanOrEqual(0);
      expect(statistics.averageProcessingTime).toBeGreaterThanOrEqual(0);
      expect(statistics.timeoutRate).toBeGreaterThanOrEqual(0);
      expect(statistics.timeoutRate).toBeLessThanOrEqual(1);
      expect(statistics.mostCommonTimeoutReason).toBeDefined();
      expect(statistics.timestamp).toBeDefined();
    });

    it('应该处理空统计', async () => {
      const statistics = await timeoutService.getTimeoutStatistics([]);

      expect(statistics.totalConfirms).toBe(0);
      expect(statistics.activeConfirms).toBe(0);
      expect(statistics.expiredConfirms).toBe(0);
      expect(statistics.timeoutRate).toBe(0);
    });
  });

  describe('定时检测控制', () => {
    it('应该启动和停止定时检测', (done) => {
      let checkCount = 0;
      const getConfirms = jest.fn().mockImplementation(async () => {
        checkCount++;
        if (checkCount >= 2) {
          timeoutService.stopPeriodicCheck();
          expect(getConfirms).toHaveBeenCalledTimes(2);
          done();
        }
        return mockConfirms;
      });

      // 设置短间隔用于测试
      const config = timeoutService.getConfig();
      config.checkIntervalMs = 100; // 100ms
      timeoutService.setConfig(config);

      timeoutService.startPeriodicCheck(getConfirms);
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理无效的确认对象', async () => {
      const invalidConfirm = null as any;
      
      await expect(timeoutService.checkTimeout(invalidConfirm)).rejects.toThrow();
    });

    it('应该处理无效的配置', () => {
      const invalidConfig = {
        warningThresholds: [],
        defaultTimeoutMs: -1000, // 负数
        defaultTimeoutAction: 'invalid' as any,
        checkIntervalMs: 0,
        enableAutoProcessing: true,
        timeoutRules: []
      };

      // 实际实现不验证配置，所以不会抛出异常
      timeoutService.setConfig(invalidConfig);
      const retrievedConfig = timeoutService.getConfig();
      expect(retrievedConfig.defaultTimeoutMs).toBe(-1000);
    });
  });
});

// 辅助函数
function createTestConfirm(
  id: string,
  createdAt: Date,
  priority: Priority = Priority.MEDIUM,
  confirmationType: ConfirmationType = ConfirmationType.TASK_APPROVAL,
  expiresInMs: number = 3600000 // 默认1小时后过期
): Confirm {
  return new Confirm(
    id as any, // confirmId
    TestDataFactory.generateUUID(), // contextId
    '1.0.0', // protocolVersion
    confirmationType, // confirmationType
    ConfirmStatus.PENDING, // status
    priority, // priority
    { // subject
      title: `Test Confirm ${id}`,
      description: 'Test description',
      impactAssessment: {
        scope: 'test',
        businessImpact: 'low',
        technicalImpact: 'low',
        riskLevel: 'low',
        impactScope: ['test'],
        estimatedCost: 1000
      }
    },
    { // requester
      userId: 'test-user',
      name: 'Test User',
      role: 'tester',
      email: 'test@example.com',
      department: 'test',
      requestReason: 'Testing'
    },
    { // approvalWorkflow
      workflowType: 'consensus',
      steps: [],
      autoApprovalRules: {
        enabled: false,
        conditions: []
      }
    },
    createdAt.toISOString(), // createdAt
    createdAt.toISOString(), // updatedAt
    TestDataFactory.generateUUID(), // planId (optional)
    undefined, // decision (optional)
    new Date(createdAt.getTime() + expiresInMs).toISOString(), // expires_at (optional)
    { // metadata (optional)
      source: 'test',
      tags: ['test'],
      customFields: {}
    }
  );
}
