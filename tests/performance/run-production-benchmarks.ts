#!/usr/bin/env node
/**
 * Production Benchmark Test Runner
 * @description 生产级性能基准测试执行器
 * @version 1.0.0
 */

import { runProductionBenchmarks, generatePerformanceReportHTML } from './production-benchmark-suite';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 主执行函数
 */
async function main(): Promise<void> {
  console.log('🚀 MPLP Production Performance Benchmark Suite');
  console.log('='.repeat(50));
  
  try {
    // 执行性能基准测试
    const report = await runProductionBenchmarks();
    
    // 输出控制台报告
    console.log('\n📊 Performance Benchmark Results:');
    console.log('='.repeat(50));
    console.log(`Overall Score: ${report.overallScore.toFixed(1)}%`);
    console.log(`Modules Passed: ${report.passedModules}/${report.totalModules}`);
    console.log(`Failed Modules: ${report.failedModules.join(', ') || 'None'}`);
    
    console.log('\n📈 System Summary:');
    console.log(`Average Response Time: ${report.summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`Total Throughput: ${report.summary.totalThroughput.toFixed(0)} ops/sec`);
    console.log(`System Reliability: ${report.summary.systemReliability.toFixed(1)}%`);
    console.log(`Memory Efficiency: ${report.summary.memoryEfficiency.toFixed(1)}%`);
    
    // 输出模块详细结果
    console.log('\n🔍 Module Details:');
    console.log('-'.repeat(50));
    for (const moduleReport of report.moduleReports) {
      const status = moduleReport.passed ? '✅' : '❌';
      console.log(`${status} ${moduleReport.moduleName}: ${moduleReport.overallScore.toFixed(1)}%`);
      
      for (const result of moduleReport.results) {
        const testStatus = result.metrics.passed ? '✅' : '❌';
        console.log(`   ${testStatus} ${result.testType}: ${result.metrics.measured.toFixed(2)} (target: ${result.metrics.target})`);
      }
    }
    
    // 输出改进建议
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      console.log('-'.repeat(50));
      for (const recommendation of report.recommendations) {
        console.log(`• ${recommendation}`);
      }
    }
    
    // 生成HTML报告
    const htmlReport = generatePerformanceReportHTML(report);
    const reportPath = path.join(__dirname, 'reports', `performance-report-${Date.now()}.html`);
    
    // 确保报告目录存在
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // 保存HTML报告
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`\n📄 HTML Report saved to: ${reportPath}`);
    
    // 保存JSON报告
    const jsonReportPath = path.join(__dirname, 'reports', `performance-report-${Date.now()}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    console.log(`📄 JSON Report saved to: ${jsonReportPath}`);
    
    // 根据结果设置退出码
    const exitCode = report.overallScore >= 80 ? 0 : 1;
    
    if (exitCode === 0) {
      console.log('\n🎉 Performance benchmarks PASSED!');
    } else {
      console.log('\n⚠️  Performance benchmarks FAILED!');
      console.log('Please review the recommendations and optimize the failing modules.');
    }
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Performance benchmark execution failed:', error);
    process.exit(1);
  }
}



// 执行主函数
if (require.main === module) {
  main().catch(console.error);
}
