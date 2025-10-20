#!/usr/bin/env ts-node

/**
 * MPLP v1.0 Alpha 性能基准测试执行器
 * 
 * 执行完整的性能基准测试套件并生成报告
 */

import { PerformanceTestSuite, PerformanceTestConfig, PerformanceTestResult } from './src/performance-test-suite';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 测试配置
 */
const TEST_CONFIGS: Record<string, PerformanceTestConfig> = {
  // 快速测试配置（用于开发和CI）
  quick: {
    duration: 30000,        // 30秒
    warmupTime: 5000,       // 5秒预热
    cooldownTime: 2000,     // 2秒冷却
    maxConcurrency: 10,     // 最大10并发
    workflowComplexity: 'simple',
    resourceLimits: {
      memory: '1GB',
      cpu: '50%'
    }
  },

  // 标准测试配置
  standard: {
    duration: 300000,       // 5分钟
    warmupTime: 30000,      // 30秒预热
    cooldownTime: 10000,    // 10秒冷却
    maxConcurrency: 50,     // 最大50并发
    workflowComplexity: 'medium',
    resourceLimits: {
      memory: '2GB',
      cpu: '70%'
    }
  },

  // 完整测试配置
  full: {
    duration: 1800000,      // 30分钟
    warmupTime: 60000,      // 1分钟预热
    cooldownTime: 30000,    // 30秒冷却
    maxConcurrency: 100,    // 最大100并发
    workflowComplexity: 'complex',
    resourceLimits: {
      memory: '4GB',
      cpu: '80%'
    }
  },

  // 压力测试配置
  stress: {
    duration: 3600000,      // 1小时
    warmupTime: 120000,     // 2分钟预热
    cooldownTime: 60000,    // 1分钟冷却
    maxConcurrency: 200,    // 最大200并发
    workflowComplexity: 'complex',
    resourceLimits: {
      memory: '8GB',
      cpu: '90%'
    }
  }
};

/**
 * 性能基准阈值
 */
const PERFORMANCE_THRESHOLDS = {
  quick: {
    averageResponseTime: 200,    // < 200ms
    p95ResponseTime: 500,        // P95 < 500ms
    errorRate: 0.05,             // < 5%
    requestsPerSecond: 50        // > 50 req/s
  },
  standard: {
    averageResponseTime: 100,    // < 100ms
    p95ResponseTime: 300,        // P95 < 300ms
    errorRate: 0.02,             // < 2%
    requestsPerSecond: 100       // > 100 req/s
  },
  full: {
    averageResponseTime: 150,    // < 150ms
    p95ResponseTime: 400,        // P95 < 400ms
    errorRate: 0.03,             // < 3%
    requestsPerSecond: 200       // > 200 req/s
  },
  stress: {
    averageResponseTime: 300,    // < 300ms
    p95ResponseTime: 1000,       // P95 < 1s
    errorRate: 0.10,             // < 10%
    requestsPerSecond: 100       // > 100 req/s
  }
};

/**
 * 报告生成器
 */
class ReportGenerator {
  static generateHTMLReport(results: PerformanceTestResult[], outputPath: string): void {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MPLP v1.0 Alpha 性能基准测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #ecf0f1; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2980b9; }
        .metric-label { font-size: 14px; color: #7f8c8d; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .pass { color: #27ae60; font-weight: bold; }
        .fail { color: #e74c3c; font-weight: bold; }
        .chart { margin: 20px 0; text-align: center; }
        .timestamp { text-align: center; color: #7f8c8d; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 MPLP v1.0 Alpha 性能基准测试报告</h1>
        
        <div class="summary">
            ${results.map(result => `
                <div class="metric-card">
                    <div class="metric-value">${result.testName}</div>
                    <div class="metric-label">测试场景</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.averageResponseTime.toFixed(2)}ms</div>
                    <div class="metric-label">平均响应时间</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.requestsPerSecond.toFixed(2)}</div>
                    <div class="metric-label">每秒请求数</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(result.errorRate * 100).toFixed(2)}%</div>
                    <div class="metric-label">错误率</div>
                </div>
            `).join('')}
        </div>

        <h2>📊 详细测试结果</h2>
        <table>
            <thead>
                <tr>
                    <th>测试名称</th>
                    <th>总请求数</th>
                    <th>成功请求</th>
                    <th>平均响应时间</th>
                    <th>P95响应时间</th>
                    <th>吞吐量</th>
                    <th>错误率</th>
                    <th>内存使用峰值</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => `
                    <tr>
                        <td>${result.testName}</td>
                        <td>${result.totalRequests}</td>
                        <td>${result.successfulRequests}</td>
                        <td>${result.averageResponseTime.toFixed(2)}ms</td>
                        <td>${result.p95ResponseTime.toFixed(2)}ms</td>
                        <td>${result.requestsPerSecond.toFixed(2)} req/s</td>
                        <td>${(result.errorRate * 100).toFixed(2)}%</td>
                        <td>${(result.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>📈 性能趋势分析</h2>
        <div class="chart">
            <p>响应时间分布图和性能趋势图将在未来版本中提供</p>
        </div>

        <h2>🎯 基准对比</h2>
        <table>
            <thead>
                <tr>
                    <th>指标</th>
                    <th>实际值</th>
                    <th>基准值</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => {
                  const testType = this.getTestType(result.testName);
                  const thresholds = PERFORMANCE_THRESHOLDS[testType] || PERFORMANCE_THRESHOLDS.standard;
                  return `
                    <tr>
                        <td>${result.testName} - 平均响应时间</td>
                        <td>${result.averageResponseTime.toFixed(2)}ms</td>
                        <td>&lt; ${thresholds.averageResponseTime}ms</td>
                        <td class="${result.averageResponseTime < thresholds.averageResponseTime ? 'pass' : 'fail'}">
                            ${result.averageResponseTime < thresholds.averageResponseTime ? '✅ 通过' : '❌ 未通过'}
                        </td>
                    </tr>
                    <tr>
                        <td>${result.testName} - P95响应时间</td>
                        <td>${result.p95ResponseTime.toFixed(2)}ms</td>
                        <td>&lt; ${thresholds.p95ResponseTime}ms</td>
                        <td class="${result.p95ResponseTime < thresholds.p95ResponseTime ? 'pass' : 'fail'}">
                            ${result.p95ResponseTime < thresholds.p95ResponseTime ? '✅ 通过' : '❌ 未通过'}
                        </td>
                    </tr>
                    <tr>
                        <td>${result.testName} - 错误率</td>
                        <td>${(result.errorRate * 100).toFixed(2)}%</td>
                        <td>&lt; ${(thresholds.errorRate * 100).toFixed(1)}%</td>
                        <td class="${result.errorRate < thresholds.errorRate ? 'pass' : 'fail'}">
                            ${result.errorRate < thresholds.errorRate ? '✅ 通过' : '❌ 未通过'}
                        </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div class="timestamp">
            报告生成时间: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(outputPath, html, 'utf8');
  }

  static generateJSONReport(results: PerformanceTestResult[], outputPath: string): void {
    const report = {
      generatedAt: new Date().toISOString(),
      mplpVersion: '1.0.0-alpha',
      testResults: results,
      summary: {
        totalTests: results.length,
        totalRequests: results.reduce((sum, r) => sum + r.totalRequests, 0),
        averageResponseTime: results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length,
        overallErrorRate: results.reduce((sum, r) => sum + r.errorRate, 0) / results.length
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  }

  private static getTestType(testName: string): string {
    if (testName.includes('快速')) return 'quick';
    if (testName.includes('压力')) return 'stress';
    if (testName.includes('完整')) return 'full';
    return 'standard';
  }
}

/**
 * 主执行函数
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const testType = args[0] || 'standard';
  const outputDir = args[1] || './reports';

  if (!TEST_CONFIGS[testType]) {
    console.error(`❌ 未知的测试类型: ${testType}`);
    console.log('可用的测试类型: quick, standard, full, stress');
    process.exit(1);
  }

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`🚀 开始执行 ${testType} 性能基准测试...`);
  console.log(`📊 测试配置:`, TEST_CONFIGS[testType]);

  const testSuite = new PerformanceTestSuite();
  const results: PerformanceTestResult[] = [];

  try {
    // 执行单机性能测试
    console.log('\n📈 执行单机性能测试...');
    const singleNodeResult = await testSuite.runSingleNodePerformanceTest(TEST_CONFIGS[testType]);
    singleNodeResult.testName = `${testType} - 单机性能测试`;
    results.push(singleNodeResult);
    console.log(`✅ 单机性能测试完成: ${singleNodeResult.averageResponseTime.toFixed(2)}ms 平均响应时间`);

    // 执行并发负载测试
    console.log('\n🔄 执行并发负载测试...');
    const concurrentResult = await testSuite.runConcurrentLoadTest(TEST_CONFIGS[testType]);
    concurrentResult.testName = `${testType} - 并发负载测试`;
    results.push(concurrentResult);
    console.log(`✅ 并发负载测试完成: ${concurrentResult.requestsPerSecond.toFixed(2)} req/s 吞吐量`);

    // 如果是压力测试，执行压力测试
    if (testType === 'stress' || testType === 'full') {
      console.log('\n💪 执行压力测试...');
      const stressResult = await testSuite.runStressTest(TEST_CONFIGS[testType]);
      stressResult.testName = `${testType} - 压力测试`;
      results.push(stressResult);
      console.log(`✅ 压力测试完成: ${(stressResult.errorRate * 100).toFixed(2)}% 错误率`);
    }

    // 生成报告
    console.log('\n📋 生成测试报告...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlReportPath = path.join(outputDir, `performance-report-${testType}-${timestamp}.html`);
    const jsonReportPath = path.join(outputDir, `performance-report-${testType}-${timestamp}.json`);

    ReportGenerator.generateHTMLReport(results, htmlReportPath);
    ReportGenerator.generateJSONReport(results, jsonReportPath);

    console.log(`✅ HTML报告已生成: ${htmlReportPath}`);
    console.log(`✅ JSON报告已生成: ${jsonReportPath}`);

    // 输出测试摘要
    console.log('\n📊 测试摘要:');
    results.forEach(result => {
      console.log(`\n${result.testName}:`);
      console.log(`  - 总请求数: ${result.totalRequests}`);
      console.log(`  - 成功率: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
      console.log(`  - 平均响应时间: ${result.averageResponseTime.toFixed(2)}ms`);
      console.log(`  - P95响应时间: ${result.p95ResponseTime.toFixed(2)}ms`);
      console.log(`  - 吞吐量: ${result.requestsPerSecond.toFixed(2)} req/s`);
      console.log(`  - 内存峰值: ${(result.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`);
    });

    console.log('\n🎉 性能基准测试完成！');

  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main().catch(console.error);
}
