/**
 * DecisionConfirmationCoordinator 测试套件
 * 
 * 验证决策确认管理协调系统的核心功能
 * 测试企业级决策协调性能基准
 * 
 * @version 1.0.0
 * @created 2025-08-18
 */

import { 
  DecisionConfirmationCoordinator,
  DecisionType 
} from '../../../src/modules/confirm/application/coordinators/decision-confirmation.coordinator';
import { Priority, RiskLevel } from '../../../src/modules/confirm/types';

describe('DecisionConfirmationCoordinator - 决策确认管理协调系统', () => {
  let coordinator: DecisionConfirmationCoordinator;

  beforeEach(() => {
    coordinator = new DecisionConfirmationCoordinator();
  });

  describe('多种决策类型协调', () => {
    it('应该成功协调APPROVE决策', async () => {
      const result = await coordinator.coordinateDecision(
        'confirm-001',
        DecisionType.APPROVE,
        'decider-001',
        '经过仔细评估，该请求符合所有审批标准',
        Priority.MEDIUM
      );

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        confirmId: 'confirm-001',
        decisionType: DecisionType.APPROVE,
        deciderId: 'decider-001',
        outcome: 'successful'
      });
    });

    it('应该成功协调REJECT决策', async () => {
      const result = await coordinator.coordinateDecision(
        'confirm-002',
        DecisionType.REJECT,
        'decider-002',
        '该请求不符合安全标准，存在重大风险',
        Priority.HIGH
      );

      expect(result.success).toBe(true);
      expect(result.data?.decisionType).toBe(DecisionType.REJECT);
    });

    it('应该成功协调DELEGATE决策', async () => {
      const result = await coordinator.coordinateDecision(
        'confirm-003',
        DecisionType.DELEGATE,
        'decider-003',
        '该决策需要专业技术团队评估',
        Priority.MEDIUM
      );

      expect(result.success).toBe(true);
      expect(result.data?.decisionType).toBe(DecisionType.DELEGATE);
    });

    it('应该成功协调ESCALATE决策', async () => {
      const result = await coordinator.coordinateDecision(
        'confirm-004',
        DecisionType.ESCALATE,
        'decider-004',
        '该决策涉及重大业务影响，需要高级管理层决定',
        Priority.URGENT
      );

      expect(result.success).toBe(true);
      expect(result.data?.decisionType).toBe(DecisionType.ESCALATE);
    });

    it('应该拒绝质量不达标的决策', async () => {
      const result = await coordinator.coordinateDecision(
        'confirm-005',
        DecisionType.APPROVE,
        'decider-005',
        '同意', // 过于简短的决策原因（只有2个字符）
        Priority.MEDIUM
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('决策质量不达标');
    });
  });

  describe('决策质量评估和验证协调', () => {
    it('应该达到≥95%准确率标准', async () => {
      const assessment = await coordinator.assessDecisionQuality(
        'decision-001',
        DecisionType.APPROVE,
        '经过详细的技术评估和风险分析，该方案可行',
        Priority.MEDIUM
      );

      expect(assessment.accuracyRate).toBeGreaterThanOrEqual(0.95);
      expect(assessment.qualityScore).toBeGreaterThanOrEqual(70);
      expect(assessment.consistencyScore).toBeGreaterThanOrEqual(0.98);
    });

    it('应该正确评估决策风险', async () => {
      const highRiskAssessment = await coordinator.assessDecisionQuality(
        'decision-002',
        DecisionType.ESCALATE,
        '需要升级处理的紧急决策',
        Priority.URGENT
      );

      const lowRiskAssessment = await coordinator.assessDecisionQuality(
        'decision-003',
        DecisionType.APPROVE,
        '常规审批决策',
        Priority.LOW
      );

      expect(highRiskAssessment.riskAssessment).toBe(RiskLevel.HIGH);
      expect(lowRiskAssessment.riskAssessment).toBe(RiskLevel.LOW);
    });

    it('应该提供质量改进建议', async () => {
      const assessment = await coordinator.assessDecisionQuality(
        'decision-004',
        DecisionType.ESCALATE,
        '升级', // 简短原因
        Priority.LOW // 不合理的优先级组合
      );

      expect(assessment.validationErrors.length).toBeGreaterThan(0);
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('决策历史追踪和分析协调', () => {
    it('应该达到≥98%一致性标准', async () => {
      // 直接在测试中创建决策记录，并验证创建结果
      const result1 = await coordinator.coordinateDecision('confirm-001', DecisionType.APPROVE, 'decider-001', '经过详细评估，该请求符合所有审批标准和要求');
      const result2 = await coordinator.coordinateDecision('confirm-002', DecisionType.REJECT, 'decider-002', '经过仔细分析，该请求存在安全风险，不符合审批标准');
      const result3 = await coordinator.coordinateDecision('confirm-003', DecisionType.DELEGATE, 'decider-003', '该决策需要专业技术团队进行详细评估和分析');

      // 验证所有决策都成功创建，如果失败则显示错误信息
      if (!result1.success) console.log('Decision 1 failed:', result1.error);
      if (!result2.success) console.log('Decision 2 failed:', result2.error);
      if (!result3.success) console.log('Decision 3 failed:', result3.error);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);

      const result = await coordinator.analyzeDecisionHistory();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(3);

      const metrics = coordinator.getCoordinationMetrics();
      expect(metrics.consistencyRate).toBeGreaterThanOrEqual(0.98);
    });

    it('应该支持按确认ID过滤历史记录', async () => {
      // 创建测试数据
      await coordinator.coordinateDecision('confirm-filter-001', DecisionType.APPROVE, 'decider-001', '经过详细评估，该请求符合所有审批标准和要求');
      await coordinator.coordinateDecision('confirm-filter-001', DecisionType.REJECT, 'decider-002', '经过仔细分析，该请求存在安全风险，不符合审批标准');
      await coordinator.coordinateDecision('confirm-filter-002', DecisionType.DELEGATE, 'decider-003', '该决策需要专业技术团队进行详细评估和分析');

      const result = await coordinator.analyzeDecisionHistory('confirm-filter-001');

      expect(result.success).toBe(true);
      expect(result.data!.length).toBe(2);
      expect(result.data!.every(record => record.confirmId === 'confirm-filter-001')).toBe(true);
    });

    it('应该支持按决策者ID过滤历史记录', async () => {
      // 创建测试数据
      await coordinator.coordinateDecision('confirm-decider-001', DecisionType.APPROVE, 'decider-filter-001', '经过详细评估，该请求符合所有审批标准和要求');
      await coordinator.coordinateDecision('confirm-decider-002', DecisionType.REJECT, 'decider-filter-002', '经过仔细分析，该请求存在安全风险，不符合审批标准');
      await coordinator.coordinateDecision('confirm-decider-003', DecisionType.DELEGATE, 'decider-filter-001', '该决策需要专业技术团队进行详细评估和分析');

      const result = await coordinator.analyzeDecisionHistory(undefined, 'decider-filter-001');

      expect(result.success).toBe(true);
      expect(result.data!.length).toBe(2);
      expect(result.data!.every(record => record.deciderId === 'decider-filter-001')).toBe(true);
    });
  });

  describe('决策一致性检查和管理协调', () => {
    it('应该在<100ms内完成一致性检查', async () => {
      const startTime = Date.now();
      
      const check = await coordinator.checkDecisionConsistency(
        'confirm-test',
        DecisionType.APPROVE,
        'decider-test'
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(100);
      expect(check.checkId).toBeDefined();
      expect(check.consistencyScore).toBeGreaterThanOrEqual(0.98);
    });

    it('应该检测决策冲突', async () => {
      // 创建冲突的决策
      await coordinator.coordinateDecision('confirm-conflict', DecisionType.APPROVE, 'decider-001', '经过详细评估，该请求符合所有审批标准和要求');

      const check = await coordinator.checkDecisionConsistency(
        'confirm-conflict',
        DecisionType.REJECT,
        'decider-002'
      );

      expect(check.conflictingDecisions.length).toBeGreaterThan(0);
      expect(check.resolutionRecommendations.length).toBeGreaterThan(0);
    });

    it('应该建议升级处理严重冲突', async () => {
      // 使用新的coordinator实例
      const escalationCoordinator = new DecisionConfirmationCoordinator();

      // 创建多个冲突决策
      await escalationCoordinator.coordinateDecision('confirm-serious', DecisionType.APPROVE, 'decider-001', '经过详细评估，该请求符合所有审批标准和要求');
      await escalationCoordinator.coordinateDecision('confirm-serious', DecisionType.REJECT, 'decider-002', '经过仔细分析，该请求存在安全风险，不符合审批标准');
      await escalationCoordinator.coordinateDecision('confirm-serious', DecisionType.APPROVE, 'decider-003', '经过详细评估，该请求符合所有审批标准和要求');

      const check = await escalationCoordinator.checkDecisionConsistency(
        'confirm-serious',
        DecisionType.REJECT,
        'decider-004'
      );

      expect(check.requiresEscalation).toBe(true);
    });
  });

  describe('性能指标跟踪', () => {
    it('应该正确跟踪决策协调指标', async () => {
      // 使用新的coordinator实例避免测试间干扰
      const metricsCoordinator = new DecisionConfirmationCoordinator();

      // 创建不同类型的决策
      await metricsCoordinator.coordinateDecision('confirm-metrics-1', DecisionType.APPROVE, 'decider-001', '经过详细评估，该请求符合所有审批标准和要求');
      await metricsCoordinator.coordinateDecision('confirm-metrics-2', DecisionType.REJECT, 'decider-002', '经过仔细分析，该请求存在安全风险，不符合审批标准');
      await metricsCoordinator.coordinateDecision('confirm-metrics-3', DecisionType.DELEGATE, 'decider-003', '该决策需要专业技术团队进行详细评估和分析');

      const metrics = metricsCoordinator.getCoordinationMetrics();

      expect(metrics.totalDecisions).toBe(3);
      expect(metrics.approvalRate).toBeCloseTo(1/3, 1);
      expect(metrics.rejectionRate).toBeCloseTo(1/3, 1);
      expect(metrics.delegationRate).toBeCloseTo(1/3, 1);
      expect(metrics.accuracyRate).toBeGreaterThanOrEqual(0.95);
      expect(metrics.consistencyRate).toBeGreaterThanOrEqual(0.98);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
    });

    it('应该正确计算决策类型比率', async () => {
      // 使用新的coordinator实例
      const ratioCoordinator = new DecisionConfirmationCoordinator();

      // 创建2个APPROVE决策和1个REJECT决策
      await ratioCoordinator.coordinateDecision('confirm-ratio-1', DecisionType.APPROVE, 'decider-001', '经过详细评估，该请求符合所有审批标准和要求');
      await ratioCoordinator.coordinateDecision('confirm-ratio-2', DecisionType.APPROVE, 'decider-002', '经过详细评估，该请求符合所有审批标准和要求');
      await ratioCoordinator.coordinateDecision('confirm-ratio-3', DecisionType.REJECT, 'decider-003', '经过仔细分析，该请求存在安全风险，不符合审批标准');

      const metrics = ratioCoordinator.getCoordinationMetrics();

      expect(metrics.totalDecisions).toBe(3);
      expect(metrics.approvalRate).toBeCloseTo(2/3, 1);
      expect(metrics.rejectionRate).toBeCloseTo(1/3, 1);
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理协调过程中的错误', async () => {
      // 模拟错误情况 - 使用null作为confirmId
      const result = await coordinator.coordinateDecision(
        null as any,
        DecisionType.APPROVE,
        'decider-001',
        '测试错误处理的详细原因和说明'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该优雅处理历史分析过程中的错误', async () => {
      // 这个测试主要验证错误处理机制
      const result = await coordinator.analyzeDecisionHistory();
      
      // 即使没有数据，也应该成功返回空数组
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('企业级性能基准', () => {
    it('应该支持高并发决策协调', async () => {
      const concurrentDecisions = 50; // 测试环境使用较小数量
      const decisions: Promise<any>[] = [];

      for (let i = 0; i < concurrentDecisions; i++) {
        decisions.push(
          coordinator.coordinateDecision(
            `confirm-concurrent-${i}`,
            DecisionType.APPROVE,
            `decider-${i}`,
            `并发测试决策${i}的详细原因`
          )
        );
      }

      const results = await Promise.all(decisions);
      const successCount = results.filter(r => r.success).length;

      expect(successCount).toBeGreaterThan(45); // 至少90%成功率
    });

    it('应该维持≥95%的决策确认协调准确率', async () => {
      // 创建多个决策以测试准确率
      const decisions = [];
      for (let i = 0; i < 20; i++) {
        decisions.push(
          coordinator.coordinateDecision(
            `confirm-accuracy-${i}`,
            DecisionType.APPROVE,
            `decider-${i}`,
            `准确率测试决策${i}的详细原因和分析`
          )
        );
      }

      await Promise.all(decisions);
      const metrics = coordinator.getCoordinationMetrics();

      expect(metrics.accuracyRate).toBeGreaterThanOrEqual(0.95);
      expect(metrics.consistencyRate).toBeGreaterThanOrEqual(0.98);
    });

    it('应该在合理时间内完成决策协调', async () => {
      const startTime = Date.now();
      
      const result = await coordinator.coordinateDecision(
        'confirm-performance',
        DecisionType.APPROVE,
        'decider-performance',
        '性能测试决策的详细原因'
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(500); // 应在500ms内完成
    });
  });
});
