/**
 * Cucumber BDD配置文件
 * 用于Context模块真正的行为驱动开发测试
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

const config = {
  // 功能文件路径
  paths: ['tests/bdd/context/features/*.feature'],

  // 步骤定义文件路径
  import: ['tests/bdd/context/step-definitions/*.js'],
  
  // 格式化器
  format: [
    'progress-bar',
    'json:tests/bdd/context/reports/cucumber-report.json',
    'html:tests/bdd/context/reports/cucumber-report.html'
  ],
  
  // 并发执行
  parallel: 1,
  
  // 失败时退出
  failFast: false,
  
  // 严格模式
  strict: true,
  
  // 干运行模式（用于验证步骤定义）
  dryRun: false,
  
  // 标签过滤
  tags: 'not @skip',
  
  // 世界参数
  worldParameters: {
    // Context模块配置
    contextModule: {
      baseUrl: 'http://localhost:3000',
      apiVersion: 'v1',
      timeout: 5000
    },
    
    // 测试数据配置
    testData: {
      database: 'memory',
      cleanup: true,
      fixtures: 'tests/bdd/context/fixtures'
    },
    
    // 环境配置
    environment: {
      nodeEnv: 'test',
      logLevel: 'error',
      mockExternalServices: true
    }
  },
  
  // 钩子配置
  requireModule: [
    'ts-node/register'
  ],
  
  // 发布配置
  publish: false,
  
  // 重试配置
  retry: 0,
  
  // 超时配置
  timeout: 10000
};

module.exports = config;
