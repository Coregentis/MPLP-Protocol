#!/usr/bin/env node
/**
 * BDD测试环境设置脚本
 * 设置和验证BDD测试环境的完整性
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 日志函数
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// BDD环境设置器
class BDDEnvironmentSetup {
  constructor(module = 'context') {
    this.module = module;
    this.setupResults = [];
    this.errors = [];
  }

  // 设置BDD测试目录结构
  async setupBDDDirectories() {
    log('📁 设置BDD测试目录结构...');
    
    const directories = [
      `tests/bdd/${this.module}`,
      `tests/bdd/${this.module}/reports`,
      `tests/bdd/${this.module}/fixtures`,
      `tests/bdd/${this.module}/helpers`,
      `scripts/validation`,
      `scripts/test`,
      `scripts/monitoring`
    ];

    for (const dir of directories) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.setupResults.push(`创建目录: ${dir}`);
        } else {
          this.setupResults.push(`目录已存在: ${dir}`);
        }
      } catch (error) {
        this.errors.push(`创建目录失败 ${dir}: ${error.message}`);
      }
    }
  }

  // 设置BDD测试配置文件
  async setupBDDConfiguration() {
    log('⚙️ 设置BDD测试配置...');
    
    const bddConfig = {
      module: this.module,
      testEnvironment: 'node',
      schemaValidation: {
        enabled: true,
        schemaPath: `src/schemas/mplp-${this.module}.json`,
        validator: 'ajv',
        strictMode: true
      },
      reporting: {
        enabled: true,
        outputDir: `tests/bdd/${this.module}/reports`,
        formats: ['json', 'html', 'console']
      },
      performance: {
        enabled: true,
        thresholds: {
          responseTime: 100,
          throughput: 1000,
          errorRate: 0.01
        }
      },
      coverage: {
        enabled: true,
        thresholds: {
          functional: 90,
          api: 100,
          error: 95,
          performance: 85
        }
      }
    };

    const configPath = `tests/bdd/${this.module}/bdd.config.json`;
    try {
      fs.writeFileSync(configPath, JSON.stringify(bddConfig, null, 2));
      this.setupResults.push(`创建BDD配置: ${configPath}`);
    } catch (error) {
      this.errors.push(`创建BDD配置失败: ${error.message}`);
    }
  }

  // 设置测试数据工厂
  async setupTestDataFactory() {
    log('🏭 设置测试数据工厂...');
    
    const testDataFactory = `/**
 * ${this.module.charAt(0).toUpperCase() + this.module.slice(1)}模块BDD测试数据工厂
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

class ${this.module.charAt(0).toUpperCase() + this.module.slice(1)}TestDataFactory {
  // 生成UUID v4
  static generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 创建基础${this.module}实例
  static createBasic${this.module.charAt(0).toUpperCase() + this.module.slice(1)}() {
    return {
      protocol_version: "1.0.0",
      timestamp: new Date().toISOString(),
      ${this.module}_id: this.generateUUIDv4(),
      name: "BDD Test ${this.module.charAt(0).toUpperCase() + this.module.slice(1)}",
      description: "BDD测试用${this.module}实例",
      status: "active",
      lifecycle_stage: "executing"
    };
  }

  // 创建完整${this.module}实例
  static createComplete${this.module.charAt(0).toUpperCase() + this.module.slice(1)}() {
    const basic = this.createBasic${this.module.charAt(0).toUpperCase() + this.module.slice(1)}();
    
    return {
      ...basic,
      shared_state: {
        variables: { test_mode: true },
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      },
      access_control: {
        owner: { user_id: "bdd-test-user", role: "admin" },
        permissions: []
      },
      configuration: {
        timeout_settings: { default_timeout: 300, max_timeout: 3600, cleanup_timeout: 60 },
        notification_settings: { enabled: true, channels: ["email"], events: ["created"] },
        persistence: { enabled: true, storage_backend: "memory", retention_policy: { duration: "P7D", max_versions: 10 } }
      }
    };
  }

  // 创建测试场景数据
  static createScenarioData(scenarioName) {
    const scenarios = {
      'basic_crud': this.createBasic${this.module.charAt(0).toUpperCase() + this.module.slice(1)}(),
      'complete_instance': this.createComplete${this.module.charAt(0).toUpperCase() + this.module.slice(1)}(),
      'performance_test': Array.from({ length: 100 }, () => this.createBasic${this.module.charAt(0).toUpperCase() + this.module.slice(1)}())
    };

    return scenarios[scenarioName] || this.createBasic${this.module.charAt(0).toUpperCase() + this.module.slice(1)}();
  }
}

module.exports = { ${this.module.charAt(0).toUpperCase() + this.module.slice(1)}TestDataFactory };`;

    const factoryPath = `tests/bdd/${this.module}/helpers/${this.module}-test-data-factory.js`;
    try {
      fs.writeFileSync(factoryPath, testDataFactory);
      this.setupResults.push(`创建测试数据工厂: ${factoryPath}`);
    } catch (error) {
      this.errors.push(`创建测试数据工厂失败: ${error.message}`);
    }
  }

  // 设置BDD测试助手
  async setupBDDHelpers() {
    log('🔧 设置BDD测试助手...');
    
    const bddHelpers = `/**
 * BDD测试助手工具
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

const fs = require('fs');
const path = require('path');

class BDDTestHelpers {
  // 加载Schema
  static loadSchema(module) {
    const schemaPath = path.join(__dirname, \`../../../src/schemas/mplp-\${module}.json\`);
    if (!fs.existsSync(schemaPath)) {
      throw new Error(\`Schema文件不存在: \${schemaPath}\`);
    }
    return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  }

  // 验证测试结果
  static validateTestResult(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('测试结果格式无效');
    }
    
    if (!result.hasOwnProperty('passed')) {
      throw new Error('测试结果缺少passed字段');
    }
    
    if (!result.hasOwnProperty('message')) {
      throw new Error('测试结果缺少message字段');
    }
    
    return true;
  }

  // 生成测试报告
  static generateTestReport(testName, results, outputPath) {
    const report = {
      testName: testName,
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        successRate: (results.filter(r => r.passed).length / results.length) * 100
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    return report;
  }

  // 性能测试助手
  static async measurePerformance(testFunction, iterations = 1) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await testFunction();
        const endTime = Date.now();
        results.push({
          iteration: i + 1,
          duration: endTime - startTime,
          success: true
        });
      } catch (error) {
        const endTime = Date.now();
        results.push({
          iteration: i + 1,
          duration: endTime - startTime,
          success: false,
          error: error.message
        });
      }
    }

    return {
      totalIterations: iterations,
      successfulIterations: results.filter(r => r.success).length,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      minDuration: Math.min(...results.map(r => r.duration)),
      maxDuration: Math.max(...results.map(r => r.duration)),
      results: results
    };
  }
}

module.exports = { BDDTestHelpers };`;

    const helpersPath = `tests/bdd/${this.module}/helpers/bdd-test-helpers.js`;
    try {
      fs.writeFileSync(helpersPath, bddHelpers);
      this.setupResults.push(`创建BDD测试助手: ${helpersPath}`);
    } catch (error) {
      this.errors.push(`创建BDD测试助手失败: ${error.message}`);
    }
  }

  // 验证环境设置
  async validateEnvironmentSetup() {
    log('✅ 验证BDD环境设置...');
    
    const requiredFiles = [
      `tests/bdd/${this.module}/bdd.config.json`,
      `tests/bdd/${this.module}/helpers/${this.module}-test-data-factory.js`,
      `tests/bdd/${this.module}/helpers/bdd-test-helpers.js`
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.setupResults.push(`验证文件存在: ${file}`);
      } else {
        this.errors.push(`缺少必需文件: ${file}`);
      }
    }

    // 验证依赖包
    try {
      require('ajv');
      require('ajv-formats');
      this.setupResults.push('验证BDD依赖包: 可用');
    } catch (error) {
      this.errors.push(`BDD依赖包不可用: ${error.message}`);
    }
  }

  // 执行完整环境设置
  async runSetup() {
    log(`🚀 开始${this.module}模块BDD环境设置`);
    
    await this.setupBDDDirectories();
    await this.setupBDDConfiguration();
    await this.setupTestDataFactory();
    await this.setupBDDHelpers();
    await this.validateEnvironmentSetup();
    
    // 生成设置报告
    this.generateSetupReport();
    
    return {
      success: this.errors.length === 0,
      setupResults: this.setupResults,
      errors: this.errors
    };
  }

  // 生成设置报告
  generateSetupReport() {
    log('\n📊 BDD环境设置报告:');
    log('=' .repeat(60));
    
    if (this.setupResults.length > 0) {
      log('✅ 设置完成:');
      this.setupResults.forEach((item, index) => {
        log(`  ${index + 1}. ${item}`);
      });
    }
    
    if (this.errors.length > 0) {
      log('\n❌ 设置错误:');
      this.errors.forEach((item, index) => {
        log(`  ${index + 1}. ${item}`);
      });
    }
    
    log('\n' + '=' .repeat(60));
    
    if (this.errors.length === 0) {
      log('🎉 BDD环境设置完成！环境已准备就绪。');
    } else {
      log('💥 BDD环境设置失败！请检查错误并重试。');
      process.exit(1);
    }
  }
}

// 主执行函数
async function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.find(arg => arg.startsWith('--module='));
  const module = moduleArg ? moduleArg.split('=')[1] : 'context';
  
  const setup = new BDDEnvironmentSetup(module);
  const result = await setup.runSetup();
  
  // 保存设置结果
  const reportPath = `tests/bdd/${module}/reports/bdd-environment-setup-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    module: module,
    result: result
  }, null, 2));
  
  log(`\n📄 设置报告已保存: ${reportPath}`);
}

// 执行设置
if (require.main === module) {
  main().catch(error => {
    log(`💥 环境设置异常: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { BDDEnvironmentSetup };
