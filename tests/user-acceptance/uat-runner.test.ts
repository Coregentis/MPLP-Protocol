/**
 * MPLP用户验收测试执行器
 * 基于SCTM+GLFB+ITCM增强框架设计的完整UAT测试系统
 */

import { UATTestSuite, UATScenarios, UserType, TestExecutionResult } from './src/uat-test-suite';

describe('MPLP用户验收测试套件', () => {
  let uatSuite: UATTestSuite;

  beforeAll(async () => {
    console.log('🚀 初始化MPLP用户验收测试环境...');
    uatSuite = new UATTestSuite();
  });

  afterAll(async () => {
    console.log('🧹 清理UAT测试环境...');
  });

  describe('快速开始场景测试', () => {
    it('应该支持新用户快速上手', async () => {
      const scenario = UATScenarios.getQuickStartScenario();
      const userId = 'novice-user-001';

      console.log(`\n📋 执行场景: ${scenario.name}`);
      console.log(`👤 用户类型: ${scenario.userType}`);
      console.log(`⏱️  预估时间: ${scenario.estimatedTime}分钟`);
      console.log(`🎯 难度等级: ${scenario.difficulty}`);

      const result = await uatSuite.executeScenario(scenario, userId);

      // 验收标准检查
      expect(result.status).toBe('completed');
      expect(result.completedSteps).toBe(scenario.steps.length);
      expect(result.totalDuration).toBeLessThan(scenario.acceptanceCriteria.usabilityRequirements.maxCompletionTime! * 1000);
      expect(result.satisfactionScore).toBeGreaterThanOrEqual(scenario.acceptanceCriteria.usabilityRequirements.minSatisfactionScore!);
      expect(result.errorCount).toBeLessThanOrEqual(scenario.acceptanceCriteria.usabilityRequirements.maxErrorCount!);

      console.log(`\n✅ 快速开始场景测试完成:`);
      console.log(`   📊 完成状态: ${result.status}`);
      console.log(`   ⏱️  总耗时: ${Math.round(result.totalDuration / 1000)}秒`);
      console.log(`   😊 满意度: ${result.satisfactionScore}/5.0`);
      console.log(`   🎯 推荐度: ${result.recommendationScore}/10`);
      console.log(`   ❌ 错误次数: ${result.errorCount}`);
    }, 60000);

    it('应该收集有效的用户反馈', async () => {
      const scenario = UATScenarios.getQuickStartScenario();
      const userId = 'novice-user-002';

      const result = await uatSuite.executeScenario(scenario, userId);

      // 验证反馈数据完整性
      expect(result.positiveAspects).toBeDefined();
      expect(result.improvementSuggestions).toBeDefined();
      expect(result.criticalIssues).toBeDefined();
      expect(result.recommendationScore).toBeGreaterThanOrEqual(0);
      expect(result.recommendationScore).toBeLessThanOrEqual(10);
      expect(typeof result.wouldUseInProduction).toBe('boolean');

      console.log(`\n📝 用户反馈收集结果:`);
      console.log(`   👍 积极方面: ${result.positiveAspects.join(', ')}`);
      console.log(`   💡 改进建议: ${result.improvementSuggestions.join(', ')}`);
      console.log(`   ⚠️  关键问题: ${result.criticalIssues.join(', ')}`);
      console.log(`   🏭 生产使用意愿: ${result.wouldUseInProduction ? '是' : '否'}`);
    }, 30000);
  });

  describe('企业应用开发场景测试', () => {
    it('应该支持技术专家开发企业级应用', async () => {
      const scenario = UATScenarios.getEnterpriseApplicationScenario();
      const userId = 'expert-user-001';

      console.log(`\n📋 执行场景: ${scenario.name}`);
      console.log(`👤 用户类型: ${scenario.userType}`);
      console.log(`⏱️  预估时间: ${scenario.estimatedTime}分钟`);
      console.log(`🎯 难度等级: ${scenario.difficulty}`);

      const result = await uatSuite.executeScenario(scenario, userId);

      // 企业级应用开发验收标准
      expect(result.status).toBe('completed');
      expect(result.satisfactionScore).toBeGreaterThanOrEqual(4.0);
      expect(result.recommendationScore).toBeGreaterThanOrEqual(7);
      expect(result.wouldUseInProduction).toBe(true);

      console.log(`\n✅ 企业应用开发场景测试完成:`);
      console.log(`   📊 完成状态: ${result.status}`);
      console.log(`   ⏱️  总耗时: ${Math.round(result.totalDuration / 60000)}分钟`);
      console.log(`   😊 满意度: ${result.satisfactionScore}/5.0`);
      console.log(`   🎯 推荐度: ${result.recommendationScore}/10`);
      console.log(`   🏭 生产使用意愿: ${result.wouldUseInProduction ? '是' : '否'}`);
    }, 120000);
  });

  describe('生产环境部署场景测试', () => {
    it('应该支持生产环境部署和运行', async () => {
      const scenario = UATScenarios.getProductionDeploymentScenario();
      const userId = 'business-user-001';

      console.log(`\n📋 执行场景: ${scenario.name}`);
      console.log(`👤 用户类型: ${scenario.userType}`);
      console.log(`⏱️  预估时间: ${scenario.estimatedTime}分钟`);
      console.log(`🎯 难度等级: ${scenario.difficulty}`);

      const result = await uatSuite.executeScenario(scenario, userId);

      // 生产部署验收标准
      expect(result.status).toBe('completed');
      expect(result.errorCount).toBeLessThanOrEqual(2);
      expect(result.satisfactionScore).toBeGreaterThanOrEqual(4.0);

      console.log(`\n✅ 生产环境部署场景测试完成:`);
      console.log(`   📊 完成状态: ${result.status}`);
      console.log(`   ⏱️  总耗时: ${Math.round(result.totalDuration / 60000)}分钟`);
      console.log(`   😊 满意度: ${result.satisfactionScore}/5.0`);
      console.log(`   🎯 推荐度: ${result.recommendationScore}/10`);
      console.log(`   ❌ 错误次数: ${result.errorCount}`);
    }, 90000);
  });

  describe('多用户类型综合测试', () => {
    it('应该支持不同类型用户的使用需求', async () => {
      const scenarios = [
        { scenario: UATScenarios.getQuickStartScenario(), userId: 'novice-user-003' },
        { scenario: UATScenarios.getEnterpriseApplicationScenario(), userId: 'expert-user-002' },
        { scenario: UATScenarios.getProductionDeploymentScenario(), userId: 'business-user-002' }
      ];

      const results: TestExecutionResult[] = [];

      for (const { scenario, userId } of scenarios) {
        console.log(`\n🔄 执行${scenario.userType}用户场景: ${scenario.name}`);
        const result = await uatSuite.executeScenario(scenario, userId);
        results.push(result);
      }

      // 综合验收标准
      const completionRate = results.filter(r => r.status === 'completed').length / results.length;
      const avgSatisfaction = results.reduce((sum, r) => sum + r.satisfactionScore, 0) / results.length;
      const avgRecommendation = results.reduce((sum, r) => sum + r.recommendationScore, 0) / results.length;

      expect(completionRate).toBeGreaterThanOrEqual(0.9); // 90%完成率
      expect(avgSatisfaction).toBeGreaterThanOrEqual(3.5); // 平均满意度3.5+
      expect(avgRecommendation).toBeGreaterThanOrEqual(6); // 平均推荐度6+

      console.log(`\n📊 多用户类型综合测试结果:`);
      console.log(`   ✅ 完成率: ${(completionRate * 100).toFixed(1)}%`);
      console.log(`   😊 平均满意度: ${avgSatisfaction.toFixed(1)}/5.0`);
      console.log(`   🎯 平均推荐度: ${avgRecommendation.toFixed(1)}/10`);
    }, 300000);
  });

  describe('UAT报告生成测试', () => {
    it('应该生成完整的UAT报告', async () => {
      // 执行一个简单场景以生成测试数据
      const scenario = UATScenarios.getQuickStartScenario();
      await uatSuite.executeScenario(scenario, 'report-test-user');

      const report = uatSuite.generateUATReport();

      // 验证报告完整性
      expect(report.summary).toBeDefined();
      expect(report.detailedResults).toBeDefined();
      expect(report.recommendations).toBeDefined();

      expect(report.summary.totalScenarios).toBeGreaterThan(0);
      expect(report.summary.averageSatisfactionScore).toBeGreaterThan(0);
      expect(report.summary.averageRecommendationScore).toBeGreaterThan(0);
      expect(report.summary.completionRate).toBeGreaterThan(0);

      console.log(`\n📋 UAT报告生成完成:`);
      console.log(`   📊 测试场景总数: ${report.summary.totalScenarios}`);
      console.log(`   ✅ 完成场景数: ${report.summary.completedScenarios}`);
      console.log(`   ⏱️  平均完成时间: ${Math.round(report.summary.averageCompletionTime / 1000)}秒`);
      console.log(`   😊 平均满意度: ${report.summary.averageSatisfactionScore.toFixed(1)}/5.0`);
      console.log(`   🎯 平均推荐度: ${report.summary.averageRecommendationScore.toFixed(1)}/10`);
      console.log(`   📈 完成率: ${(report.summary.completionRate * 100).toFixed(1)}%`);
      console.log(`   💡 改进建议数: ${report.recommendations.length}`);

      if (report.recommendations.length > 0) {
        console.log(`   📝 主要建议:`);
        report.recommendations.forEach((rec, index) => {
          console.log(`      ${index + 1}. ${rec}`);
        });
      }
    }, 60000);
  });
});
