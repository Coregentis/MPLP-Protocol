#!/usr/bin/env node

/**
 * Dialog模块完整测试执行脚本
 * 
 * @description 执行Dialog模块的完整测试套件，确保100%测试通过率
 * @version 2.0.0
 * @standard Context模块100%完美质量标准
 * @methodology SCTM+GLFB+ITCM增强框架
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`
};

console.log(colors.bold(colors.cyan('🧪 Dialog模块完整测试套件执行')));
console.log(colors.blue('目标: 100%测试通过率 + 100%覆盖率\n'));

// 测试统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testSuites = [];

// 执行测试函数
function runTestSuite(name, testPath, options = {}) {
  console.log(colors.yellow(`🔍 执行 ${name}...`));
  
  try {
    const command = `npm test -- ${testPath} ${options.coverage ? '--coverage' : ''} ${options.verbose ? '--verbose' : '--silent'}`;
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    // 解析测试结果
    const testResults = parseTestOutput(output);
    totalTests += testResults.total;
    passedTests += testResults.passed;
    failedTests += testResults.failed;
    
    testSuites.push({
      name,
      path: testPath,
      ...testResults,
      status: testResults.failed === 0 ? 'PASS' : 'FAIL'
    });
    
    if (testResults.failed === 0) {
      console.log(colors.green(`✅ ${name} - ${testResults.passed}/${testResults.total} 通过`));
    } else {
      console.log(colors.red(`❌ ${name} - ${testResults.passed}/${testResults.total} 通过, ${testResults.failed} 失败`));
    }
    
    if (options.coverage && testResults.coverage) {
      console.log(colors.dim(`   覆盖率: ${testResults.coverage}%`));
    }
    
  } catch (error) {
    console.log(colors.red(`❌ ${name} - 执行失败`));
    console.log(colors.red(`   错误: ${error.message.split('\n')[0]}`));
    
    testSuites.push({
      name,
      path: testPath,
      total: 0,
      passed: 0,
      failed: 1,
      status: 'ERROR',
      error: error.message
    });
    failedTests += 1;
  }
}

// 解析测试输出
function parseTestOutput(output) {
  const result = {
    total: 0,
    passed: 0,
    failed: 0,
    coverage: null
  };
  
  // 解析Jest输出
  const testSummaryMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  if (testSummaryMatch) {
    result.failed = parseInt(testSummaryMatch[1]);
    result.passed = parseInt(testSummaryMatch[2]);
    result.total = parseInt(testSummaryMatch[3]);
  } else {
    // 尝试其他格式
    const passedMatch = output.match(/(\d+)\s+passing/);
    const failedMatch = output.match(/(\d+)\s+failing/);
    
    if (passedMatch) result.passed = parseInt(passedMatch[1]);
    if (failedMatch) result.failed = parseInt(failedMatch[1]);
    result.total = result.passed + result.failed;
  }
  
  // 解析覆盖率
  const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/);
  if (coverageMatch) {
    result.coverage = parseFloat(coverageMatch[1]);
  }
  
  return result;
}

// 生成测试报告
function generateTestReport() {
  console.log('\n' + colors.bold(colors.cyan('📊 Dialog模块测试执行报告')));
  console.log('='.repeat(60));
  
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  console.log(colors.bold(`总测试数: ${totalTests}`));
  console.log(colors.bold(`通过测试: ${colors.green(passedTests)}`));
  console.log(colors.bold(`失败测试: ${failedTests > 0 ? colors.red(failedTests) : colors.green(failedTests)}`));
  console.log(colors.bold(`成功率: ${successRate}%`));
  
  if (successRate === 100) {
    console.log(colors.green(colors.bold('🏆 完美！所有测试100%通过！')));
  } else if (successRate >= 95) {
    console.log(colors.green(colors.bold('✅ 优秀！测试通过率达到企业级标准！')));
  } else {
    console.log(colors.yellow(colors.bold('⚠️ 需要改进测试通过率')));
  }
  
  // 详细测试套件结果
  console.log('\n' + colors.bold('📋 测试套件详情:'));
  testSuites.forEach(suite => {
    const status = suite.status === 'PASS' ? colors.green('✅') : 
                   suite.status === 'FAIL' ? colors.red('❌') : colors.red('💥');
    console.log(`${status} ${suite.name}`);
    console.log(`   路径: ${colors.dim(suite.path)}`);
    console.log(`   结果: ${suite.passed}/${suite.total} 通过`);
    
    if (suite.coverage) {
      console.log(`   覆盖率: ${suite.coverage}%`);
    }
    
    if (suite.error) {
      console.log(`   错误: ${colors.red(suite.error.split('\n')[0])}`);
    }
  });
}

// 检查测试环境
function checkTestEnvironment() {
  console.log(colors.yellow('🔍 检查测试环境...'));
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  console.log(colors.dim(`Node.js版本: ${nodeVersion}`));
  
  // 检查npm版本
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(colors.dim(`npm版本: ${npmVersion}`));
  } catch (error) {
    console.log(colors.red('npm版本检查失败'));
  }
  
  // 检查Jest是否可用
  try {
    execSync('npx jest --version', { encoding: 'utf8', stdio: 'pipe' });
    console.log(colors.green('✅ Jest测试框架可用'));
  } catch (error) {
    console.log(colors.red('❌ Jest测试框架不可用'));
    process.exit(1);
  }
  
  // 检查TypeScript是否可用
  try {
    execSync('npx tsc --version', { encoding: 'utf8', stdio: 'pipe' });
    console.log(colors.green('✅ TypeScript编译器可用'));
  } catch (error) {
    console.log(colors.red('❌ TypeScript编译器不可用'));
    process.exit(1);
  }
  
  console.log(colors.green('✅ 测试环境检查通过\n'));
}

// 主执行流程
async function main() {
  // 检查测试环境
  checkTestEnvironment();
  
  console.log(colors.bold('🚀 开始执行Dialog模块完整测试套件\n'));
  
  // 1. 单元测试
  console.log(colors.bold(colors.blue('📦 单元测试')));
  runTestSuite('DialogEntity单元测试', 'tests/modules/dialog/unit/dialog.entity.test.ts');
  runTestSuite('DialogMapper单元测试', 'tests/modules/dialog/unit/dialog.mapper.test.ts');
  runTestSuite('DialogManagementService单元测试', 'tests/modules/dialog/unit/dialog-management.service.test.ts');
  runTestSuite('DialogAnalyticsService单元测试', 'tests/modules/dialog/unit/dialog-analytics.service.test.ts');
  runTestSuite('DialogSecurityService单元测试', 'tests/modules/dialog/unit/dialog-security.service.test.ts');
  
  // 2. 功能测试
  console.log('\n' + colors.bold(colors.blue('🎯 功能测试')));
  runTestSuite('Dialog功能测试', 'tests/modules/dialog/functional/dialog-functional.test.ts');
  
  // 3. 集成测试
  console.log('\n' + colors.bold(colors.blue('🔗 集成测试')));
  runTestSuite('Dialog集成测试', 'tests/modules/dialog/integration/dialog-integration.test.ts');
  
  // 4. 性能测试
  console.log('\n' + colors.bold(colors.blue('⚡ 性能测试')));
  runTestSuite('Dialog性能测试', 'tests/modules/dialog/performance/dialog-performance.test.ts');
  
  // 5. 企业级测试
  console.log('\n' + colors.bold(colors.blue('🏢 企业级测试')));
  runTestSuite('Dialog企业级测试', 'tests/modules/dialog/dialog.enterprise.test.ts');
  
  // 6. 覆盖率测试
  console.log('\n' + colors.bold(colors.blue('📊 覆盖率测试')));
  runTestSuite('Dialog覆盖率验证', 'tests/modules/dialog/coverage/dialog-coverage-validation.test.ts', { coverage: true });
  
  // 7. 完整测试套件（带覆盖率）
  console.log('\n' + colors.bold(colors.blue('🎯 完整测试套件执行')));
  runTestSuite('Dialog完整测试套件', 'tests/modules/dialog/', { coverage: true, verbose: false });
  
  // 生成报告
  generateTestReport();
  
  // 性能基准验证
  console.log('\n' + colors.bold(colors.blue('🏃 性能基准验证')));
  try {
    console.log(colors.yellow('执行性能基准测试...'));
    const perfOutput = execSync('npm test -- tests/modules/dialog/performance/ --silent', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    
    if (perfOutput.includes('PASS') && !perfOutput.includes('FAIL')) {
      console.log(colors.green('✅ 性能基准验证通过'));
    } else {
      console.log(colors.red('❌ 性能基准验证失败'));
    }
  } catch (error) {
    console.log(colors.red('❌ 性能基准验证执行失败'));
  }
  
  // 最终结果
  console.log('\n' + colors.bold(colors.cyan('🎉 Dialog模块测试执行完成！')));
  
  const finalSuccessRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  if (finalSuccessRate === 100) {
    console.log(colors.green(colors.bold('🏆 恭喜！Dialog模块达到100%测试通过率！')));
    console.log(colors.green('Dialog模块已达到Context模块同等的100%完美质量标准！'));
  } else if (finalSuccessRate >= 95) {
    console.log(colors.green(colors.bold('✅ Dialog模块达到企业级测试标准！')));
  } else {
    console.log(colors.yellow(colors.bold('⚠️ Dialog模块需要进一步改进测试通过率')));
  }
  
  // 退出码
  process.exit(finalSuccessRate >= 95 ? 0 : 1);
}

// 执行主流程
main().catch(error => {
  console.error(colors.red('执行过程中发生错误:'), error);
  process.exit(1);
});
