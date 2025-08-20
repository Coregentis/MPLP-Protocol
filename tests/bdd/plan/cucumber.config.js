/**
 * Plan模块BDD测试配置
 * 基于MPLP智能体构建框架协议标准
 * 
 * @version 1.0.0
 * @created 2025-08-17
 * @based_on Context模块BDD成功经验
 */

const config = {
  // 功能文件路径
  features: [
    'tests/bdd/plan/*.feature',
    'tests/bdd/plan/features/*.feature'
  ],
  
  // 步骤定义文件路径
  glue: [
    'tests/bdd/plan/step-definitions/*.ts',
    'tests/bdd/plan/step-definitions/*.js'
  ],
  
  // 测试格式化器
  formatters: [
    'progress',
    'json:tests/bdd/plan/reports/cucumber-report.json',
    'html:tests/bdd/plan/reports/cucumber-report.html'
  ],
  
  // 并行执行配置
  parallel: 2,
  
  // 标签过滤
  tags: '@high-priority or @medium-priority',
  
  // 超时设置
  timeout: 30000,
  
  // 失败时停止
  failFast: false,
  
  // 严格模式
  strict: true,
  
  // 干运行模式（仅验证步骤定义）
  dryRun: false,
  
  // 重试配置
  retry: 1,
  
  // 环境变量
  worldParameters: {
    // MPLP协议栈配置
    mplpConfig: {
      version: '1.0.0',
      environment: 'test',
      logLevel: 'debug'
    },
    
    // Plan模块配置
    planConfig: {
      enableTaskPlanning: true,
      enableDependencyManagement: true,
      enableExecutionStrategy: true,
      enableRiskAssessment: true,
      enableFailureRecovery: true,
      enableMPLPIntegration: true,
      testMode: true
    },
    
    // 测试数据配置
    testDataConfig: {
      cleanupAfterTest: true,
      useInMemoryStorage: true,
      generateTestData: true,
      maxTasksForTesting: 1000,
      performanceTestingEnabled: true
    }
  },
  
  // 钩子配置
  hooks: {
    beforeAll: async function() {
      console.log('🚀 开始Plan模块BDD测试');
      console.log('📋 基于MPLP智能体构建框架协议标准');
      console.log('🎯 目标：达到Context模块BDD标准（39个场景，327个步骤）');
    },
    
    afterAll: async function() {
      console.log('✅ Plan模块BDD测试完成');
    },
    
    beforeScenario: async function(scenario) {
      console.log(`🔄 执行场景: ${scenario.name}`);
    },
    
    afterScenario: async function(scenario) {
      if (scenario.result.status === 'PASSED') {
        console.log(`✅ 场景通过: ${scenario.name}`);
      } else {
        console.log(`❌ 场景失败: ${scenario.name}`);
      }
    }
  },
  
  // 报告配置
  reporting: {
    // 生成详细报告
    generateDetailedReport: true,
    
    // 包含截图（如果适用）
    includeScreenshots: false,
    
    // 包含日志
    includeLogs: true,
    
    // 报告输出目录
    outputDirectory: 'tests/bdd/plan/reports',
    
    // 报告模板
    template: 'default'
  }
};

module.exports = config;
