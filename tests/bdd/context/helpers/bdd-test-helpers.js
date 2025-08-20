/**
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
    const schemaPath = path.join(__dirname, `../../../src/schemas/mplp-${module}.json`);
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema文件不存在: ${schemaPath}`);
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

module.exports = { BDDTestHelpers };