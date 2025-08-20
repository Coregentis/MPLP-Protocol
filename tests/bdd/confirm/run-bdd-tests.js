#!/usr/bin/env node

/**
 * Confirm模块BDD测试运行脚本
 * 基于MPLP智能体构建框架协议标准
 * 
 * @version 1.0.0
 * @created 2025-08-19
 * @based_on Plan模块BDD成功经验 (47场景494步骤)
 * @target ≥35个场景，≥350个步骤，<300ms执行时间
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ===== 配置常量 =====
const CONFIRM_BDD_DIR = path.join(__dirname);
const FEATURES_DIR = path.join(CONFIRM_BDD_DIR, 'features');
const STEP_DEFINITIONS_DIR = path.join(CONFIRM_BDD_DIR, 'step-definitions');
const REPORTS_DIR = path.join(CONFIRM_BDD_DIR, 'reports');

// ===== 颜色输出函数 =====
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ===== 主函数 =====
async function runConfirmBddTests() {
  try {
    colorLog('cyan', '🚀 开始Confirm模块BDD测试');
    colorLog('blue', '📋 基于MPLP智能体构建框架协议标准');
    colorLog('yellow', '🎯 目标：达到Plan模块BDD标准（47个场景，494个步骤）');
    
    // 1. 验证测试环境
    await validateTestEnvironment();
    
    // 2. 创建报告目录
    await ensureReportsDirectory();
    
    // 3. 运行BDD测试
    const testResults = await executeBddTests();
    
    // 4. 分析测试结果
    await analyzeTestResults(testResults);
    
    // 5. 生成测试报告
    await generateTestReport(testResults);
    
    colorLog('green', '✅ Confirm模块BDD测试完成');
    
  } catch (error) {
    colorLog('red', `❌ BDD测试失败: ${error.message}`);
    process.exit(1);
  }
}

// ===== 验证测试环境 =====
async function validateTestEnvironment() {
  colorLog('blue', '🔍 验证测试环境...');
  
  // 检查必需目录
  const requiredDirs = [FEATURES_DIR, STEP_DEFINITIONS_DIR];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      throw new Error(`缺少必需目录: ${dir}`);
    }
  }
  
  // 检查功能文件
  const featureFiles = fs.readdirSync(FEATURES_DIR).filter(file => file.endsWith('.feature'));
  if (featureFiles.length === 0) {
    throw new Error('未找到.feature文件');
  }
  
  // 检查步骤定义文件
  const stepFiles = fs.readdirSync(STEP_DEFINITIONS_DIR).filter(file => file.endsWith('.ts'));
  if (stepFiles.length === 0) {
    throw new Error('未找到步骤定义文件');
  }
  
  colorLog('green', `✅ 发现 ${featureFiles.length} 个功能文件，${stepFiles.length} 个步骤定义文件`);
}

// ===== 确保报告目录存在 =====
async function ensureReportsDirectory() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    colorLog('blue', '📁 创建报告目录');
  }
}

// ===== 执行BDD测试 =====
async function executeBddTests() {
  colorLog('blue', '🧪 执行BDD测试...');
  
  const startTime = Date.now();
  
  try {
    // 构建Cucumber命令
    const cucumberCmd = [
      'npx cucumber-js',
      '--require-module ts-node/register',
      `--require ${STEP_DEFINITIONS_DIR}/*.ts`,
      '--format progress',
      `--format json:${REPORTS_DIR}/cucumber-report.json`,
      `--format html:${REPORTS_DIR}/cucumber-report.html`,
      '--parallel 2',
      '--fail-fast',
      `${FEATURES_DIR}/*.feature`
    ].join(' ');
    
    colorLog('yellow', `执行命令: ${cucumberCmd}`);
    
    // 执行测试
    const output = execSync(cucumberCmd, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '../../../..'),
      env: { 
        ...process.env, 
        NODE_ENV: 'test',
        MPLP_TEST_MODE: 'true'
      }
    });
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    colorLog('green', `✅ BDD测试执行完成，耗时: ${executionTime}ms`);
    
    return {
      success: true,
      output,
      executionTime,
      startTime,
      endTime
    };
    
  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    colorLog('red', `❌ BDD测试执行失败，耗时: ${executionTime}ms`);
    colorLog('red', `错误信息: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      executionTime,
      startTime,
      endTime
    };
  }
}

// ===== 分析测试结果 =====
async function analyzeTestResults(testResults) {
  colorLog('blue', '📊 分析测试结果...');
  
  try {
    // 读取JSON报告
    const reportPath = path.join(REPORTS_DIR, 'cucumber-report.json');
    if (fs.existsSync(reportPath)) {
      const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      
      // 计算统计信息
      const scenarios = reportData.reduce((total, feature) => total + feature.elements.length, 0);
      const steps = reportData.reduce((total, feature) => 
        total + feature.elements.reduce((stepTotal, scenario) => stepTotal + scenario.steps.length, 0), 0);
      
      const passedScenarios = reportData.reduce((total, feature) => 
        total + feature.elements.filter(scenario => 
          scenario.steps.every(step => step.result.status === 'passed')).length, 0);
      
      const passedSteps = reportData.reduce((total, feature) => 
        total + feature.elements.reduce((stepTotal, scenario) => 
          stepTotal + scenario.steps.filter(step => step.result.status === 'passed').length, 0), 0);
      
      // 输出统计信息
      colorLog('green', `✅ 场景统计: ${passedScenarios}/${scenarios} 通过 (${((passedScenarios/scenarios)*100).toFixed(1)}%)`);
      colorLog('green', `✅ 步骤统计: ${passedSteps}/${steps} 通过 (${((passedSteps/steps)*100).toFixed(1)}%)`);
      colorLog('green', `✅ 执行时间: ${testResults.executionTime}ms`);
      
      // 验证目标达成
      if (scenarios >= 35 && steps >= 350 && testResults.executionTime < 300) {
        colorLog('green', '🎉 达到Plan模块BDD标准！');
      } else {
        colorLog('yellow', '⚠️  尚未完全达到Plan模块BDD标准');
        colorLog('yellow', `目标: ≥35场景 (当前${scenarios}), ≥350步骤 (当前${steps}), <300ms (当前${testResults.executionTime}ms)`);
      }
      
    } else {
      colorLog('yellow', '⚠️  未找到JSON测试报告');
    }
    
  } catch (error) {
    colorLog('red', `❌ 分析测试结果失败: ${error.message}`);
  }
}

// ===== 生成测试报告 =====
async function generateTestReport(testResults) {
  colorLog('blue', '📄 生成测试报告...');
  
  const reportSummary = {
    timestamp: new Date().toISOString(),
    executionTime: testResults.executionTime,
    success: testResults.success,
    module: 'confirm',
    version: '1.0.0',
    basedOn: 'Plan模块BDD成功经验',
    target: {
      scenarios: '≥35',
      steps: '≥350', 
      executionTime: '<300ms'
    }
  };
  
  // 保存报告摘要
  const summaryPath = path.join(REPORTS_DIR, 'bdd-test-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(reportSummary, null, 2));
  
  colorLog('green', `✅ 测试报告已保存: ${summaryPath}`);
}

// ===== 执行主函数 =====
if (require.main === module) {
  runConfirmBddTests();
}

module.exports = { runConfirmBddTests };
